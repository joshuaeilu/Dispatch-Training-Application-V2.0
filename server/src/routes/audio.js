const textToSpeech = require('@google-cloud/text-to-speech');
const express = require('express');
const router = express.Router();
const dotenv = require("dotenv");
dotenv.config();

const { auth } = require('../middleware/auth');

const client = new textToSpeech.TextToSpeechClient({
  keyFilename:  __dirname + '../../../google_credentials/dispatch-training-application-69f023e14169.json'
});


router.get("/", auth(["admin"]), async (req, res) => {
  try {
    console.log("TTS request received with query:", req.query);
    const text = req.query.text;
    const voice = req.query.voice;

    if (!text || !voice) {
      return res.status(400).send("Missing text or voice parameter");
    }

    const [response] = await client.synthesizeSpeech({
      input: { text },
      voice: { languageCode: "en-US", name: voice },
      audioConfig: { audioEncoding: "MP3" },
    });

    if (!response.audioContent) {
      return res.status(500).send("No audio content generated");
    }

    res.set("Content-Type", "audio/mpeg");
    res.set("Content-Disposition", "inline");
    res.send(response.audioContent);
  } catch (err) {
    console.error("TTS error:", err);
    res.status(500).send("TTS failed");
  }
});

module.exports = router;