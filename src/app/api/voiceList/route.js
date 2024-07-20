import client from "../TTSClient";
import { NextResponse } from 'next/server';

export async function POST(request) {
  const { text } = await request.json();


  try {
    const [result] = await client.listVoices({
      languageCode:'en-US'
    });
    const voices = result.voices;

    return NextResponse.json({ voices });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
