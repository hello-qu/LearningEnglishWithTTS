"use client";
import {useEffect, useRef, useState, useMemo,useCallback} from 'react';
import { Button, Switch, Select } from '@headlessui/react'
import {useWavesurfer} from '@wavesurfer/react'
import Timeline from 'wavesurfer.js/dist/plugins/timeline.esm.js'

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

const languageCodesList = ["en-US", "en-GB", "cmn-CN", "cmn-TW", "yue-HK"]


const GeneratorVoice = () => {
  const [ssmlGender, setSsmlGender] = useState('FEMALE');
  const [languageCode, setLanguageCode] = useState('en-US');
  const [text, setText] = useState('');
  const [audioUrl, setAudioUrl] = useState('');
  const [voiceList, setVoiceList] = useState(defaultVoice);
  const audioWaveRef = useRef(null);
  const audioRef = useRef(null)
  let currentVoiceRef = useRef(defaultVoice[0]);
  const [translateResult, setTranslateResult] = useState('')
  async function GenerateVoiceList() {
    return await fetch('/api/voiceList', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ssmlGender, languageCode}),
    });
  }

  const { wavesurfer, isPlaying, currentTime } = useWavesurfer({
    container: audioWaveRef,
    height: 100,
    waveColor: '	#1aa4b8',
    progressColor: '#1a84b8',
    url: audioUrl,
    barWidth: 2,
    barGap: 1,
    barRadius: 2,
    media:audioRef.current,
    plugins: useMemo(() => [Timeline.create()], []),
  })

  wavesurfer && wavesurfer.on('click', () => {
    wavesurfer.play()
  })
  
  wavesurfer && wavesurfer.on('dblclick', () => {
    wavesurfer.pause()
  })
  

  const handleVoiceList = () => {
    GenerateVoiceList()
      .then(data => {
        return data.json();
      })
      .then(list => {
        list.voices = list.voices.filter(voice => voice.ssmlGender === ssmlGender)
        setVoiceList(list.voices)
      });
  }

  useEffect(() => {
    handleVoiceList()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [languageCode, ssmlGender]);


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

  const handleTranslate = async () => {
    const translateResult = await fetch('/api/vertexAI', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({text}),
    });
    const data = await translateResult.json();
    const response = data.result.candidates[0].content.parts[0].text
    const cleanedResponse = response.replace(/^```json|```$|\n/g, '');
    const result = JSON.parse(cleanedResponse);
    setTranslateResult(result);

  }

  const handleSetVoice = (target) => {
    currentVoiceRef.current = voiceList[target.selectedIndex]
  }

  const handleSetSex = (e) => {
    setSsmlGender(e ? 'FEMALE':'MALE');
  }

  const handleLanguageCode = (e) => {
    setLanguageCode(e.target.value)
  }

  return (

    <div className="flex h-full w-full justify-center ">
      <div className="mr-4 w-2/5">
        <div className="flex mb-8">
          <div className="mr-4">
            <Switch
              onChange={(e) => handleSetSex(e)}
              checked={ssmlGender === 'FEMALE'}
              className="group relative flex h-7 w-14 cursor-pointer rounded-full bg-white/10 p-1 transition-colors duration-200 ease-in-out focus:outline-none data-[focus]:outline-1 data-[focus]:outline-white data-[checked]:bg-sky-700">
              <span
                aria-hidden="true"
                className="pointer-events-none inline-block size-5 translate-x-0 rounded-full bg-white ring-0 shadow-lg transition duration-200 ease-in-out group-data-[checked]:translate-x-7"
              />
            </Switch>
          </div>
          <Select onChange={handleLanguageCode} value={languageCode} className=" mr-4">
            {languageCodesList.map((language) => (
              <option key={language} value={language}>{language}</option>
            ))}
          </Select>

          <Select
            className=""
            onChange={e => handleSetVoice(e.target)}
            defaultValue={currentVoiceRef.current.name}>
            {voiceList.map((voice) => (
              <option
                key={voice.name}
                value={voice.name}>
                {voice.name}
              </option>
            ))}
          </Select>
        </div>
        <textarea
          value={text} onChange={(e) => setText(e.target.value)}
          className="w-full outline-0 p-4 rounded-md  border-0" cols="30" rows="10"></textarea>
        <div>
          <div ref={audioWaveRef}></div>
          {<audio ref={audioRef} className='w-full mt-2 bg-transparent' src={audioUrl} controls/>}
        </div>
        <Button className="rounded bg-sky-600 py-2 px-4 text-sm text-white data-[hover]:bg-sky-500 data-[active]:bg-sky-700 mr-4" onClick={handleGenerateVoice}>TTS 语音生成</Button>
        <Button className="rounded bg-sky-600 py-2 px-4 text-sm text-white data-[hover]:bg-sky-500 data-[active]:bg-sky-700" onClick={handleTranslate}>AI 翻译</Button>
      </div>
      <div className=" rounded-md w-1/2 h-full bg-white ">
        <h2>翻译结果</h2>
        <div>
          {translateResult.translation}
        </div>
        <h2>词汇解释</h2>
        <div>
          {
            translateResult.keyWords?.map((keyword) => (
              // eslint-disable-next-line react/jsx-key
              <div>
                <li>{keyword.word}：{keyword.explain}</li>
                <ul>{keyword.sentences?.map(sentence => (
                  <>
                    <li>{sentence.sentence}</li>
                    <li>{sentence.translate}</li>
                  </>
                ))}</ul>
              </div>

            ))
          }
        </div>
      </div>
    </div>
  );
};

export default GeneratorVoice;
