import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';

interface RequestPayload {
  audio: {
    content: Base64URLString;
  };
  config: {
    encoding: "OGG_OPUS";
    sampleRateHertz: number;
    languageCode: string;
    diarizationConfig: {
      enableSpeakerDiarization: boolean;
      minSpeakerCount: 2;
      maxSpeakerCount: 2;
    }
  }
}

const transcribeAudio = async () => {
  const googleApiKey = 'AIzaSyBGaTUDzNgm7--uPwGFI80qlr5K9dKNg4c';
  const endpoint = `https://speech.googleapis.com/v1/speech:recognize?key=${googleApiKey}`;

  const filePath = path.join(__dirname, '../recording.ogg');
  const audioBytes = fs.readFileSync(filePath).toString('base64');

  const requestPayload: RequestPayload = {
    audio: {
      content: audioBytes,
    },
    config: {
      encoding: 'OGG_OPUS',
      sampleRateHertz: 48000,
      languageCode: 'en-US',
      diarizationConfig: {
        enableSpeakerDiarization: true,
        minSpeakerCount: 2,
        maxSpeakerCount: 2,
      },
    },
  };

  try {
    const response = await axios.post(endpoint, requestPayload);
    const transcription = response.data.results
      ?.map((result: any) => result.alternatives?.[0]?.transcript)
      .join('\n');
    console.log('Transcription:', transcription);

    const addZeroPrefix = (num: number): string => num.toString().padStart(2, '0');

    const dateTimeNow = new Date();
    const formattedDateTime = `${dateTimeNow.getFullYear()}${addZeroPrefix(dateTimeNow.getMonth() + 1)}${addZeroPrefix(dateTimeNow.getDate())}-${addZeroPrefix(dateTimeNow.getHours())}${addZeroPrefix(dateTimeNow.getMinutes())}${addZeroPrefix(dateTimeNow.getSeconds())}`;
    const fileName = `../${formattedDateTime}_transcript.txt`;


    fs.writeFileSync(
      path.join(__dirname, fileName),
      transcription || 'No transcription available'
    );
    console.log(`Transcription saved to root folder as ${fileName}`);
  } catch (error) {
    const err = error as any;
    console.error(
      'Error while transcribing audio:',
      err.response?.data || err.message
    );
  }
}

transcribeAudio();
