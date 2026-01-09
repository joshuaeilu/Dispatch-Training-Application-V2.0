const express = require('express');
const router = express.Router();
const pool = require('../../db'); // PostgreSQL pool
const { auth } = require('../middleware/auth');
const dotenv = require("dotenv");
dotenv.config();
const textToSpeech = require('@google-cloud/text-to-speech');
const client = new textToSpeech.TextToSpeechClient({
  keyFilename:  __dirname + '../../../google_credentials/dispatch-training-application-69f023e14169.json'
});

const path = require('path');
const fs = require('fs');

router.get("/", auth(["admin", "trainee", "dispatcher"]), async (req, res) => {
  try {
    const { role } = req.user;

    let query = `
      SELECT 
        s.id,
        s.author_id,
        s.scenario_data,
        s.updated_at,
        u.username AS author_name,
        u.avatar AS author_avatar
      FROM scenarios s
      JOIN users u ON u.id = s.author_id
      WHERE s.in_trash = FALSE
    `;

    const params = [];

    if (role === "admin") {
      // Admin sees all scenarios (published + drafts)
      query += ` ORDER BY s.created_at DESC;`;
    } else {
      // Role → "Trainees" or "Dispatchers"
      const normalizedRole =
        role.charAt(0).toUpperCase() + role.slice(1).toLowerCase() + "s";

      params.push(normalizedRole);

      query += `
        WHERE LOWER(s.scenario_data->>'status') = 'published'
        AND (
          LOWER(s.scenario_data->>'audience') = LOWER($1)
          OR LOWER(s.scenario_data->>'audience') = 'all'
        )
        ORDER BY s.created_at DESC;
      `;
    }

    const result = await pool.query(query, params);

    res.status(200).json({ scenarios: result.rows });

  } catch (err) {
    console.error("❌ Error fetching scenarios:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});






router.post("/", auth(["admin"]), async (req, res) => {
  const { scenario, authorId, status } = req.body;
  console.log(scenario.status)

  if (!scenario || !authorId) {
    return res.status(400).json({ error: "Missing scenario or authorId" });
  }

  try {
    // Ensure we have an ID
    if (!scenario.id) {
      return res.status(400).json({ error: "Scenario missing ID" });
    }

    await pool.query(
      `
      INSERT INTO scenarios (id, author_id, scenario_data)
      VALUES ($1, $2, $3::jsonb)
      ON CONFLICT (id)
      DO UPDATE SET
        scenario_data = EXCLUDED.scenario_data,
        updated_at = NOW();
      `,
      [scenario.id, authorId, JSON.stringify(scenario) ]
    );

    res.status(200).json({ message: "Scenario saved successfully" });
  } catch (error) {
    console.error("❌ Error saving scenario:", error);
    res.status(500).json({ error: "Failed to save scenario" });
  }
});



router.get("/:id", auth(['admin']), async (req, res) => {
  const scenarioId = req.params.id;

  if (!scenarioId) {
    return res.status(400).json({ error: "Missing scenario ID" });
  }

  try {
    const result = await pool.query(
      "SELECT * FROM scenarios WHERE id = $1",
      [scenarioId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Scenario not found" });
    }

    return res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error("❌ Error fetching scenario:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});


router.delete("/:id",auth(['admin']), async (req, res) => {
  const scenarioId = req.params.id;
  const { authorId } = req.body; // optional: validate user owns it
  console.log(`Deleting scenario ${scenarioId} by user ${authorId}`);

  try {
    // Optional: check if user owns the scenario
    const existing = await pool.query(
      "SELECT * FROM scenarios WHERE id = $1",
      [scenarioId]
    );

    if (existing.rows.length === 0) {
      return res.status(404).json({ error: "Scenario not found." });
    }

    const scenario = existing.rows[0];

    if (authorId && scenario.author_id !== authorId) {
      return res.status(403).json({ error: "You are not authorized to make this delete." });
    }

    const folderPath = path.join(
      __dirname,
      "../..",
      "src/scenario_audios",
      `${scenarioId}`
    );

    if (fs.existsSync(folderPath)) {
      fs.rmSync(folderPath, { recursive: true, force: true });
      console.log("🗑 Deleted audio folder:", folderPath);
    } else {
      console.log("⚠ Folder did not exist:", folderPath);
    }

    // Delete scenario
    await pool.query("DELETE FROM scenarios WHERE id = $1", [scenarioId]);

    res.status(200).json({ message: "Scenario deleted successfully." });
  } catch (err) {
    console.error("❌ Error deleting scenario:", err);
    res.status(500).json({ error: "Internal server error." });
  }
});

// POST /api/scenarios/:id/generate-audio
router.post('/:id/generate-audio', auth(['admin']), async (req, res) => {
  const scenarioId = req.params.id;
  const { scenes, speakers } = req.body; // frontend sends scenario.scenes + scenario.speakers

  // folder path
  const audioDir = path.join(__dirname, '..', 'scenario_audios', scenarioId);

  // remove old folder
  fs.rmSync(audioDir, { recursive: true, force: true });
  fs.mkdirSync(audioDir, { recursive: true });

  const generatedFiles = [];

  for (let i = 0; i < scenes.length; i++) {
    const scene = scenes[i];
    const speaker = speakers.find(s => s.name === scene.speaker);
    if (!speaker?.voice || !scene.sceneDescription) continue;

    // Google TTS request
    const request = {
      input: { text: scene.sceneDescription },
      voice: {
        languageCode: 'en-US',
        name: speaker.voice, // e.g. en-US-Chirp3-HD-Achernar
      },
      audioConfig: {
        audioEncoding: 'MP3',
      },
    };

    try {
      const [response] = await client.synthesizeSpeech(request);

      const filename = `scene-${i}.mp3`;
      const filepath = path.join(audioDir, filename);

      fs.writeFileSync(filepath, response.audioContent, 'binary');
      console.log(`✅ Generated audio: ${filepath}`);

      generatedFiles.push(`/audio/${scenarioId}/${filename}`);
    } catch (err) {
      console.error(`❌ Error generating audio for scene ${i}: ${err.message}`);
    }
  }

  res.json({ files: generatedFiles });
});


module.exports = router;
