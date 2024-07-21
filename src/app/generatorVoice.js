"use client";
import {useEffect, useRef, useState} from 'react';

const defaultVoice = [
  {
    "languageCodes": [
      "en-US"
    ],
    "name": "en-US-Neural2-F",
    "ssmlGender": "FEMALE",
    "naturalSampleRateHertz": 24000
  }
]

const languageCodesList = [
  "af-ZA", "ar-XA", "bg-BG", "bn-IN", "ca-ES", "cs-CZ", "da-DK", "de-DE",
  "el-GR", "en-AU", "en-GB", "en-IE", "en-IN", "en-US", "es-ES", "es-US",
  "et-EE", "fi-FI", "fil-PH", "fr-CA", "fr-FR", "gu-IN", "hi-IN", "hr-HR",
  "hu-HU", "id-ID", "is-IS", "it-IT", "iw-IL", "ja-JP", "jw-ID", "km-KH",
  "ko-KR", "la", "lv-LV", "ml-IN", "mr-IN", "ms-MY", "my-MM", "nb-NO",
  "nl-NL", "pl-PL", "pt-BR", "pt-PT", "ro-RO", "ru-RU", "si-LK", "sk-SK",
  "sl-SI", "sr-RS", "su-ID", "sv-SE", "sw-KE", "ta-IN", "ta-LK", "th-TH",
  "tr-TR", "uk-UA", "ur-IN", "ur-PK", "vi-VN", "yue-HK", "zh-CN", "zh-HK",
  "zh-TW", "zu-ZA"
]


const GeneratorVoice = () => {
  const [text, setText] = useState('');
  const [audioUrl, setAudioUrl] = useState('');
  const [voiceList, setVoiceList] = useState(defaultVoice);
  let currentVoiceRef = useRef(defaultVoice[0]);
  const [translateResult, setTranslateResult] = useState('')

  useEffect(() => {
    async function GenerateVoiceList() {
      return await fetch('/api/voiceList', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      });
    }

    GenerateVoiceList()
      .then(data => {
        return data.json();
      })
      .then(list => {
        setVoiceList(list.voices)
      });
  }, []);


  const handleGenerateVoice = async () => {
    const ttsResult = await fetch('/api/synthesize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        voice: currentVoiceRef.current
      }),
    });

    const data = await ttsResult.json();
    const audioContent = data.audioContent;

    // Create a URL for the audio content
    const audioBlob = new Blob([new Uint8Array(Buffer.from(audioContent, 'base64'))], {type: 'audio/mp3'});
    const url = URL.createObjectURL(audioBlob);
    setAudioUrl(url);
  };

  const handleTranslate =  async  () => {
    const translateResult = await fetch('/api/vertexAI', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({text}),
    });
    const data = await translateResult.json();
    const result =data.result.candidates[0].content.parts[0].text
    setTranslateResult(result);

  }

  const handleSetVoice = (target) => {
    currentVoiceRef.current = voiceList[target.selectedIndex]
  }

  return (

    <div className="flex h-full w-full justify-center ">
    <div>
      <div className="flex mb-8">
        <div className="mr-4">
          <input type="radio" name="sex" value="MALE"/>
          <label>MALE</label>
          <input type="radio" name="sex" value="FEMALE"/>
          <label>FEMALE</label>
        </div>
        <select defaultValue="en-US" className="mr-4">
          {languageCodesList.map((language) => (
            <option key={language} value={language}>{language}</option>
          ))}
        </select>

        <select
          onChange={e => handleSetVoice(e.target)}
          defaultValue={currentVoiceRef.current.name}>
          {voiceList.map((voice) => (
            <option
              key={voice.name}
              value={voice.name}>
              {voice.name}
            </option>
          ))}
        </select>
      </div>
      <textarea
        value={text} onChange={(e) => setText(e.target.value)}
        className="w-full outline-0 p-4 rounded-md  border-0" cols="30" rows="10"></textarea>
      <button onClick={handleGenerateVoice}>TTS 语音生成</button>
      <button onClick={handleTranslate}>AI 翻译</button>
      {audioUrl && <audio src={audioUrl} controls/>}
    </div>
      <div className=" rounded-md w-1/2 h-full bg-white ">
        <h2>翻译结果</h2>
        <div>
          {translateResult}
        </div>
      </div>
    </div>
  );
};

export default GeneratorVoice;
