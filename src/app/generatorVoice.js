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


const GeneratorVoice = () => {
  const [text, setText] = useState('');
  const [audioUrl, setAudioUrl] = useState('');
  const [voiceList, setVoiceList] = useState(defaultVoice);
  let currentVoiceRef = useRef(defaultVoice[0]);

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


  const handleGenerateVoiceList = async () => {


  }


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

  const handleSetVoice = (target) => {
    currentVoiceRef.current = voiceList[target.selectedIndex]
  }

  return (

    <div>
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

      <textarea
        value={text} onChange={(e) => setText(e.target.value)}
        className="w-full outline-0 p-4 rounded-md  border-0" cols="30" rows="10"></textarea>
      <button onClick={handleGenerateVoice}>TTS 语音生成</button>
      {audioUrl && <audio src={audioUrl} controls/>}
    </div>
  );
};

export default GeneratorVoice;
