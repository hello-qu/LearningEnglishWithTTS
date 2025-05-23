import client from "../TTSClient";
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    // 解析请求数据
    const { text, voice } = await request.json();
    
    // 调用硅基流动 API
    const response = await client.synthesizeSpeech(
      text,
      voice?.name || 'FunAudioLLM/CosyVoice2-0.5B:alex' // 如果没有指定voice，使用默认值
    );

    // 返回音频数据
    // 注意：这里假设硅基流动 API 返回的数据中包含了音频内容
    // 如果返回格式不同，可能需要进行相应调整
    return response
  } catch (error) {
    console.error('TTS synthesis error:', error);
    return NextResponse.json(
      { error: error.message || '语音合成失败' },
      { status: 500 }
    );
  }
}
