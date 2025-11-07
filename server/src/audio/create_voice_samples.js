// generateChirp3Voices.js
const textToSpeech = require('@google-cloud/text-to-speech');
const fs = require('fs');
const path = require('path');
const dotenv = require("dotenv");
dotenv.config();
const { writeFile } = require('fs/promises');
// Initialize Google Cloud TTS client with your service account
const client = new textToSpeech.TextToSpeechClient({
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS
});

// List of Chirp3 voice names
 const voices = [
  {
    "name": "en-US-Chirp3-HD-Achernar",
    "gender": "FEMALE"
  },
  {
    "name": "en-US-Chirp3-HD-Achird",
    "gender": "MALE"
  },
  {
    "name": "en-US-Chirp3-HD-Algenib",
    "gender": "MALE"
  },
  {
    "name": "en-US-Chirp3-HD-Algieba",
    "gender": "MALE"
  },
  {
    "name": "en-US-Chirp3-HD-Alnilam",
    "gender": "MALE"
  },
  {
    "name": "en-US-Chirp3-HD-Aoede",
    "gender": "FEMALE"
  },
  {
    "name": "en-US-Chirp3-HD-Autonoe",
    "gender": "FEMALE"
  },
  {
    "name": "en-US-Chirp3-HD-Callirrhoe",
    "gender": "FEMALE"
  },
  {
    "name": "en-US-Chirp3-HD-Charon",
    "gender": "MALE"
  },
  {
    "name": "en-US-Chirp3-HD-Despina",
    "gender": "FEMALE"
  },
  {
    "name": "en-US-Chirp3-HD-Enceladus",
    "gender": "MALE"
  },
  {
    "name": "en-US-Chirp3-HD-Erinome",
    "gender": "FEMALE"
  },
  {
    "name": "en-US-Chirp3-HD-Fenrir",
    "gender": "MALE"
  },
  {
    "name": "en-US-Chirp3-HD-Gacrux",
    "gender": "FEMALE"
  },
  {
    "name": "en-US-Chirp3-HD-Iapetus",
    "gender": "MALE"
  },
  {
    "name": "en-US-Chirp3-HD-Kore",
    "gender": "FEMALE"
  },
  {
    "name": "en-US-Chirp3-HD-Laomedeia",
    "gender": "FEMALE"
  },
  {
    "name": "en-US-Chirp3-HD-Leda",
    "gender": "FEMALE"
  },
  {
    "name": "en-US-Chirp3-HD-Orus",
    "gender": "MALE"
  },
  {
    "name": "en-US-Chirp3-HD-Puck",
    "gender": "MALE"
  },
  {
    "name": "en-US-Chirp3-HD-Pulcherrima",
    "gender": "FEMALE"
  },
  {
    "name": "en-US-Chirp3-HD-Rasalgethi",
    "gender": "MALE"
  },
  {
    "name": "en-US-Chirp3-HD-Sadachbia",
    "gender": "MALE"
  },
  {
    "name": "en-US-Chirp3-HD-Sadaltager",
    "gender": "MALE"
  },
  {
    "name": "en-US-Chirp3-HD-Schedar",
    "gender": "MALE"
  },
  {
    "name": "en-US-Chirp3-HD-Sulafat",
    "gender": "FEMALE"
  },
  {
    "name": "en-US-Chirp3-HD-Umbriel",
    "gender": "MALE"
  },
  {
    "name": "en-US-Chirp3-HD-Vindemiatrix",
    "gender": "FEMALE"
  },
  {
    "name": "en-US-Chirp3-HD-Zephyr",
    "gender": "FEMALE"
  },
  {
    "name": "en-US-Chirp3-HD-Zubenelgenubi",
    "gender": "MALE"
  }
]

// Final sentence for all voice previews
const sentence = "Hello. I will be assisting with this dispatch training scenario. Please listen to my tone, clarity, and pacing, and select me if I suit the intended speaker. Thank you.";



// Create output folder if it doesn't exist
const outputDir = './voice_samples';
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir);
}

async function generateAllVoices() {
  for (const voice of voices) {
    const request = {
      input: { text: sentence },
      voice: {
        languageCode: 'en-US',
        name: voice.name,
      },
      audioConfig: {
        audioEncoding: 'MP3',
      },
    };

    try {
      const [response] = await client.synthesizeSpeech(request);
      const filePath = path.join(outputDir, `${voice.name}.mp3`);
      await writeFile(filePath, response.audioContent, 'binary');
      console.log(`✅ Created: ${voice.name}.mp3`);
    } catch (err) {
      console.error(`❌ Failed for ${voice.name}: ${err.message}`);
    }
  }

  console.log('\n🎉 All voice previews have been generated.');
}

generateAllVoices();





