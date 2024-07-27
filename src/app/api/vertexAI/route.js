import VertexAI from '../VertexAIClient'

import { NextResponse } from 'next/server';

export async function POST(request) {
  const { text } = await request.json();


  const prompt = `
  你是一名专业的英语翻译家，请结合内容的语境将下述文本内容翻译成中文，要求流利通顺。
  文本内容：${text}, 返回的内容有
  1.文本的翻译，
  2. 文本中的重难点词汇，
  3. 重难点词汇的解释.
  4. 重难点词汇的英文例句
  注意：不需要返回 markdown 格式，直接返回纯净的json。
  返回格式示例:{
   translation:xxx,
   keyWords:[
     {
       word:talk,
       explain:vt. 说；谈话；讨论 vi. 谈话；说闲话 n. 谈话；演讲；空谈
       sentences:[
        {
          sentence:"例句xxx",
          translate:"翻译xxx"
        },
        {
          sentence:"例句xxx",
          translate:"翻译xxx"
        },
        {
          sentence:"例句xxx",
          translate:"翻译xxx"
        }
       ]
     }

   ]


  }
  `
  try {
    const result = await VertexAI(prompt);
    return NextResponse.json({ result });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}


