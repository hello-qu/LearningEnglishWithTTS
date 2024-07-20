"use client";
import { useState } from 'react';

const GeneratorVoice = () => {
  const [text, setText] = useState('');
  const [audioUrl, setAudioUrl] = useState('');

  const handleGenerateVoice = async () => {
    const response = await fetch('/api/synthesize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
    });

    const data = await response.json();
    const audioContent = data.audioContent;

    // Create a URL for the audio content
    const audioBlob = new Blob([new Uint8Array(Buffer.from(audioContent, 'base64'))], { type: 'audio/mp3' });
    const url = URL.createObjectURL(audioBlob);
    setAudioUrl(url);
  };

  return (
    <div>
      <textarea
        value={text} onChange={(e) => setText(e.target.value)}
        className="w-full outline-0 p-4 rounded-md  border-0" cols="30" rows="10"></textarea>
      <button onClick={handleGenerateVoice}>TTS 语音生成</button>
      {audioUrl && <audio src={audioUrl} controls/>}
    </div>
  );
};

export default GeneratorVoice;
