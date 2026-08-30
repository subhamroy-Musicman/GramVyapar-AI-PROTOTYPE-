import { VoiceSTTProvider, VoiceTTSProvider } from './types';

let recognitionInstance: any = null;

export const BrowserSTTProvider: VoiceSTTProvider = {
  isSupported: () => typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window),
  
  startListening: (locale, onResult, onError, onEnd) => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      onError("Voice input is not supported in this browser. Please use text.");
      return;
    }

    if (recognitionInstance) {
      try { recognitionInstance.stop(); } catch(e) {}
    }

    recognitionInstance = new SpeechRecognition();
    recognitionInstance.lang = locale;
    recognitionInstance.continuous = false;
    recognitionInstance.interimResults = false;

    recognitionInstance.onresult = (event: any) => {
      const current = event.resultIndex;
      const result = event.results[current][0].transcript;
      onResult(result);
    };

    recognitionInstance.onerror = (event: any) => {
      if (event.error === 'not-allowed') {
        onError("Microphone permission is required for voice input.");
      } else {
        onError("Could not recognize speech. Please try again.");
      }
    };

    recognitionInstance.onend = () => {
      onEnd();
    };

    try {
      recognitionInstance.start();
    } catch(err: any) {
      onError("Failed to start microphone.");
      onEnd();
    }
  },

  stopListening: () => {
    if (recognitionInstance) {
      try { recognitionInstance.stop(); } catch(e) {}
    }
  }
};

export const BrowserTTSProvider: VoiceTTSProvider = {
  isSupported: () => typeof window !== 'undefined' && 'speechSynthesis' in window,
  
  speak: (text, locale, onEnd, onError) => {
    if (!('speechSynthesis' in window)) {
      onError("Voice output is not supported in this browser.");
      return;
    }

    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = locale;
    utterance.onend = onEnd;
    utterance.onerror = (e) => onError(e.error || "TTS Error");
    
    window.speechSynthesis.speak(utterance);
  },

  stop: () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }
};
