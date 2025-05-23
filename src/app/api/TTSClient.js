class SiliconFlowTTSClient {

  async synthesizeSpeech(text, voice = 'FunAudioLLM/CosyVoice2-0.5B:alex') {
    const options = {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.SILICONFLOW_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'FunAudioLLM/CosyVoice2-0.5B',
        input: text,
        voice: voice,
        response_format: 'mp3',
        sample_rate: 32000,
        stream: true,
        speed: 1,
        gain: 0
      })
    };

    try {
      const response = await fetch(
        `https://api.siliconflow.cn/v1/audio/speech`, options);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response
    } catch (error) {
      console.error('Error in TTS synthesis:', error);
      throw error;
    }
  }
}

const client = new SiliconFlowTTSClient();

export default client;
