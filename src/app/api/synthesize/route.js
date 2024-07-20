import client from "../TTSClient";
import { NextResponse } from 'next/server';

export async function POST(request) {
  let { text, voice:{languageCodes, name, ssmlGender} } = await request.json();
  let languageCode = languageCodes[0];
  console.log(languageCode, name, ssmlGender)
  const synthRequest = {
    input: { text},
    voice: { languageCode, name, ssmlGender },
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
