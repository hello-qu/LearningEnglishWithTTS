"use client";
import { useEffect, useRef, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Moon, Sun } from 'lucide-react';
import { useWavesurfer } from '@wavesurfer/react';

const defaultVoice = [
  {
    languageCodes: ["en-US"],
    name: "en-US-Neural2-F",
    ssmlGender: "FEMALE",
    naturalSampleRateHertz: 24000
  }
];

const languageCodesList = ["en-US", "en-GB", "cmn-CN", "cmn-TW", "yue-HK"];

const GeneratorVoice = () => {
  const [ssmlGender, setSsmlGender] = useState('FEMALE');
  const [languageCode, setLanguageCode] = useState('en-US');
  const [text, setText] = useState('');
  const [audioUrl, setAudioUrl] = useState('');
  const [voiceList, setVoiceList] = useState(defaultVoice);
  const audioWaveRef = useRef(null);
  const audioRef = useRef(null);
  let currentVoiceRef = useRef(defaultVoice[0]);
  const [translateResult, setTranslateResult] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(true);

  async function GenerateVoiceList() {
    return await fetch('/api/voiceList', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ssmlGender, languageCode }),
    });
  }

  const { wavesurfer } = useWavesurfer({
    container: audioWaveRef,
    height: 100,
    waveColor: ' #1aa4b8',
    progressColor: '#1a84b8',
    url: audioUrl,
    barWidth: 2,
    barGap: 1,
    barRadius: 2,
    media: audioRef.current,
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
  }, [isDarkMode]);

  const handleVoiceList = () => {
    GenerateVoiceList()
      .then(data => data.json())
      .then(list => {
        list.voices = list.voices.filter(voice => voice.ssmlGender === ssmlGender);
        setVoiceList(list.voices);
      });
  };

  useEffect(() => {
    handleVoiceList();
  }, [languageCode, ssmlGender]);

  const handleGenerateVoice = async () => {
    const ttsResult = await fetch('/api/synthesize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
    });
    const audioContent = await ttsResult.arrayBuffer();
    const audioBlob = new Blob([audioContent], { type: 'audio/mp3' });
    const url = URL.createObjectURL(audioBlob);
    setAudioUrl(url);
  };

  const handleTranslate = async () => {
    const translateResult = await fetch('/api/vertexAI', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
    });
    const data = await translateResult.json();
    const response = data.result.candidates[0].content.parts[0].text;
    const cleanedResponse = response.replace(/^```json|```$|\n/g, '');
    const result = JSON.parse(cleanedResponse);
    setTranslateResult(result);
  };

  const handleSetVoice = (value) => {
    const found = voiceList.find(v => v.name === value);
    if (found) currentVoiceRef.current = found;
  };

  const handleSetSex = (checked) => {
    setSsmlGender(checked ? 'FEMALE' : 'MALE');
  };

  const handleLanguageCode = (value) => {
    setLanguageCode(value);
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900' : 'bg-gradient-to-br from-slate-100 via-slate-200 to-slate-100'} p-8 transition-colors duration-300`}>
      <div className="container mx-auto relative">
        <Button
          onClick={toggleDarkMode}
          className="absolute top-0 right-0 p-2 rounded-full bg-opacity-50 backdrop-blur-sm"
          variant="ghost"
        >
          {isDarkMode ? <Sun className="h-6 w-6 text-yellow-400" /> : <Moon className="h-6 w-6 text-slate-700" />}
        </Button>
        <h1 className={`text-4xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'} mb-8 text-center tracking-wide`}>
          English Voice <span className={isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}>Generator</span>
        </h1>
        <div className="flex flex-col md:flex-row gap-8 h-[calc(100vh-160px)]">
          <div className={`flex-1 md:w-[40%] flex flex-col space-y-6 ${isDarkMode ? 'bg-slate-800 bg-opacity-50' : 'bg-white'} p-6 rounded-2xl shadow-lg backdrop-blur-sm ${isDarkMode ? 'border border-slate-700' : 'border border-slate-200'}`}>  
            <div className={`${isDarkMode ? 'bg-slate-700' : 'bg-slate-100'} p-4 rounded-xl shadow-inner`}>
              <div className="flex items-center justify-between gap-2">
                <div className={`flex items-center space-x-2 ${isDarkMode ? 'bg-slate-600' : 'bg-slate-200'} px-3 py-2 rounded-md`}>
                  <Switch
                    id="gender-switch"
                    checked={ssmlGender === 'FEMALE'}
                    onCheckedChange={handleSetSex}
                  />
                  <Label htmlFor="gender-switch" className={`text-sm font-medium ${isDarkMode ? 'text-slate-200' : 'text-slate-700'} whitespace-nowrap`}>
                    Gender: {ssmlGender === 'FEMALE' ? 'Female' : 'Male'}
                  </Label>
                </div>
                <Select value={languageCode} onValueChange={handleLanguageCode}>
                  <SelectTrigger className={`w-[120px] ${isDarkMode ? 'bg-slate-600 text-slate-200 border-slate-500' : 'bg-slate-200 text-slate-700 border-slate-300'}`}>
                    <SelectValue placeholder="Language" />
                  </SelectTrigger>
                  <SelectContent>
                    {languageCodesList.map((language) => (
                      <SelectItem key={language} value={language}>{language}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={currentVoiceRef.current.name} onValueChange={handleSetVoice}>
                  <SelectTrigger className={`w-[120px] ${isDarkMode ? 'bg-slate-600 text-slate-200 border-slate-500' : 'bg-slate-200 text-slate-700 border-slate-300'}`}>
                    <SelectValue placeholder="Voice" />
                  </SelectTrigger>
                  <SelectContent>
                    {voiceList.map((voice) => (
                      <SelectItem key={voice.name} value={voice.name}>{voice.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              className={`flex-grow w-full p-3 ${isDarkMode ? 'border-slate-600 bg-slate-700 text-slate-200 placeholder-slate-400' : 'border-slate-300 bg-white text-slate-700 placeholder-slate-500'} rounded-xl resize-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent`}
              maxLength={1000}
              placeholder="Enter your text here (up to 1000 characters)"
              rows={8}
            />
            <div className="flex flex-col space-y-4">
              <div className="flex space-x-4">
                <Button
                  onClick={handleGenerateVoice}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition duration-300 ease-in-out transform hover:scale-105"
                >
                  TTS 语音生成
                </Button>
                <Button
                  onClick={handleTranslate}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition duration-300 ease-in-out transform hover:scale-105"
                >
                  AI 翻译
                </Button>
              </div>
              <div className={`w-full h-12 flex items-center justify-center ${isDarkMode ? 'bg-slate-700' : 'bg-slate-200'} rounded-lg overflow-hidden`}>
                <div ref={audioWaveRef} className="w-full" />
              </div>
              {audioUrl && (
                <audio ref={audioRef} className='w-full mt-2 bg-transparent' src={audioUrl} controls />
              )}
            </div>
          </div>
          <div className="flex-1 md:w-[60%] flex flex-col space-y-6">
            <div className={`flex-1 ${isDarkMode ? 'bg-slate-800 bg-opacity-50 border-slate-700' : 'bg-white border-slate-200'} p-6 rounded-2xl shadow-lg backdrop-blur-sm border overflow-auto`}>
              <h2 className={`text-2xl font-semibold ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'} mb-4`}>翻译结果</h2>
              <div className={isDarkMode ? 'text-slate-300' : 'text-slate-700'}>
                {translateResult?.translation}
              </div>
            </div>
            <div className={`flex-1 ${isDarkMode ? 'bg-slate-800 bg-opacity-50 border-slate-700' : 'bg-white border-slate-200'} p-6 rounded-2xl shadow-lg backdrop-blur-sm border overflow-auto`}>
              <h2 className={`text-2xl font-semibold ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'} mb-4`}>词汇解释</h2>
              <ul className="space-y-4">
                {translateResult?.keyWords?.map((keyword, idx) => (
                  <li key={idx} className={`${isDarkMode ? 'bg-slate-700' : 'bg-slate-100'} p-4 rounded-xl shadow-inner`}>
                    <h3 className={`font-semibold ${isDarkMode ? 'text-emerald-300' : 'text-emerald-600'} mb-2`}>{keyword.word}</h3>
                    <p className={isDarkMode ? 'text-slate-300' : 'text-slate-700'}><span className={`font-medium ${isDarkMode ? 'text-slate-200' : 'text-slate-600'}`}>解释:</span> {keyword.explain}</p>
                    <ul className="mt-2 space-y-1">
                      {keyword.sentences?.map((sentence, i) => (
                        <li key={i} className={isDarkMode ? 'text-slate-400' : 'text-slate-600'}>
                          <span className="block">{sentence.sentence}</span>
                          <span className="block text-xs italic">{sentence.translate}</span>
                        </li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GeneratorVoice;
