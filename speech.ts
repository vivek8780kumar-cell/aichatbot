// Web Speech API utility for Text-to-Speech and Speech Recognition

export function speakText(
  text: string,
  rate: number = 1.0,
  pitch: number = 1.0,
  voiceGender: 'female' | 'male' = 'female',
  onEnd?: () => void
) {
  if (!('speechSynthesis' in window)) {
    console.warn('Speech synthesis not supported in this browser.');
    return;
  }

  window.speechSynthesis.cancel(); // Stop current speech

  // Strip markdown formatting symbols like **, *, _, # for clean speech
  const cleanText = text
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/`(.*?)`/g, '$1')
    .replace(/\[(.*?)\]\(.*?\)/g, '$1');

  const utterance = new SpeechSynthesisUtterance(cleanText);
  utterance.rate = rate;
  utterance.pitch = pitch;
  utterance.lang = 'en-US';

  // Attempt to select an English voice matching gender preference
  const voices = window.speechSynthesis.getVoices();
  const englishVoices = voices.filter(v => v.lang.startsWith('en'));
  
  if (englishVoices.length > 0) {
    let preferred = englishVoices.find(v => {
      const name = v.name.toLowerCase();
      if (voiceGender === 'female') return name.includes('female') || name.includes('zira') || name.includes('samantha') || name.includes('google us english') || name.includes('karen');
      return name.includes('male') || name.includes('david') || name.includes('george') || name.includes('alex');
    });

    utterance.voice = preferred || englishVoices[0];
  }

  if (onEnd) {
    utterance.onend = onEnd;
    utterance.onerror = onEnd;
  }

  window.speechSynthesis.speak(utterance);
}

export function stopSpeech() {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

// Speech Recognition helper
export function createSpeechRecognition(
  onResult: (transcript: string) => void,
  onError?: (err: any) => void,
  onEnd?: () => void
) {
  const SpeechRecognition =
    (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

  if (!SpeechRecognition) {
    return null;
  }

  const recognition = new SpeechRecognition();
  recognition.continuous = false;
  recognition.interimResults = true;
  recognition.lang = 'en-US';

  recognition.onresult = (event: any) => {
    let transcript = '';
    for (let i = event.resultIndex; i < event.results.length; i++) {
      transcript += event.results[i][0].transcript;
    }
    onResult(transcript);
  };

  if (onError) recognition.onerror = onError;
  if (onEnd) recognition.onend = onEnd;

  return recognition;
}
