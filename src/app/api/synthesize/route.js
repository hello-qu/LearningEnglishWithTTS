import client from "../TTSClient";
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { text, voice } = await request.json();
    const response = await client.synthesizeSpeech(
      text,
      voice?.name || 'FunAudioLLM/CosyVoice2-0.5B:alex'
    );

    // 读取音频二进制内容
    const buffer = await response.arrayBuffer();

    return new NextResponse(Buffer.from(buffer), {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Disposition': 'inline; filename="speech.mp3"',
      }
    });
  } catch (error) {
    console.error('TTS synthesis error:', error);
    return NextResponse.json(
      { error: error.message || '语音合成失败' },
      { status: 500 }
    );
  }
}
