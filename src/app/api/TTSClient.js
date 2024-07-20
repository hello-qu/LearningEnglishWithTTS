
import { TextToSpeechClient } from '@google-cloud/text-to-speech';

let opts = {};
if(process.env.NODE_ENV !== 'development') {
  const googleCredentials = JSON.parse(process.env.GOOGLE_CLOUD_CREDENTIALS);
  opts = {
    projectId: process.env.GOOGLE_CLOUD_PROJECT,
    credentials: googleCredentials
  }
}
const client = new TextToSpeechClient(opts);

export default client
