import VertexAI from '../VertexAIClient'

import { NextResponse } from 'next/server';

export async function POST(request) {
  const { text } = await request.json();

  const prompt = `
  你是一名专业的英语翻译家，请结合内容的语境将下述文本内容翻译成中文，要求流利通顺。
  文本内容：${text}
  返回格式示例：translateResult:xxx
  `

  try {
    const result = await VertexAI(prompt);
    return NextResponse.json({ result });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}


