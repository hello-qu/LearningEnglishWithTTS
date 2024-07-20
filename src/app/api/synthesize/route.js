import { NextResponse } from 'next/server';
import { TextToSpeechClient } from '@google-cloud/text-to-speech';

const googleCredentials = JSON.parse(process.env.GOOGLE_CLOUD_CREDENTIALS);

const client = new TextToSpeechClient({
  projectId: process.env.GOOGLE_CLOUD_PROJECT,
  credentials: googleCredentials
});

export async function POST(request) {
  const { text } = await request.json();

  const synthRequest = {
    input: { text: text },
    voice: { languageCode: 'en-US', name: 'en-US-Neural2-F', ssmlGender: 'FEMALE' },
    audioConfig: { audioEncoding: 'MP3', speakingRate: 0.9 },
  };

  try {
    const [response] = await client.synthesizeSpeech(synthRequest);
    const audioContent = response.audioContent;

    return NextResponse.json({ audioContent: audioContent.toString('base64') });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
