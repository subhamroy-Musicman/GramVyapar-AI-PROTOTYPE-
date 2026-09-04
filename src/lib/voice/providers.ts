import { VoiceRecognitionResult, VoiceRecognitionError } from "../../domain/voice/types";
import { SupportedLanguage } from "../../domain/advisory/types";

export const VOICE_LOCALE_MAP: Record<SupportedLanguage, string> = {
  'en': 'en-IN',
  'hi': 'hi-IN',
  'bn': 'bn-IN',
  'mr': 'mr-IN',
  'ta': 'ta-IN'
};

export class BrowserSTTProvider {
  private recognition: any = null;

  isSupported(): boolean {
    if (typeof window === 'undefined') return false;
    return 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
  }

  startListening(language: SupportedLanguage): Promise<VoiceRecognitionResult> {
    return new Promise((resolve, reject) => {
      if (!this.isSupported()) {
        reject('VOICE_UNSUPPORTED' as VoiceRecognitionError);
        return;
      }

      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      this.recognition = new SpeechRecognition();
      
      this.recognition.lang = VOICE_LOCALE_MAP[language] || 'en-IN';
      this.recognition.continuous = false;
      this.recognition.interimResults = false;
      this.recognition.maxAlternatives = 1;

      this.recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        resolve({ transcript, isFinal: true });
      };

      this.recognition.onerror = (event: any) => {
        if (event.error === 'not-allowed') reject('MIC_PERMISSION_DENIED' as VoiceRecognitionError);
        else if (event.error === 'no-speech') reject('NO_SPEECH' as VoiceRecognitionError);
        else if (event.error === 'aborted') reject('ABORTED' as VoiceRecognitionError);
        else reject('RECOGNITION_FAILED' as VoiceRecognitionError);
      };

      this.recognition.onnomatch = () => {
        reject('RECOGNITION_FAILED' as VoiceRecognitionError);
      };

      try {
        this.recognition.start();
      } catch (e) {
        reject('RECOGNITION_FAILED' as VoiceRecognitionError);
      }
    });
  }

  stopListening(): void {
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch (e) {
        // ignore
      }
      this.recognition = null;
    }
  }
}

export interface SpeakResult {
  fallbackUsed: boolean;
  message?: string;
}

export class BrowserTTSProvider {
  private synth: SpeechSynthesis | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window && typeof (window as any).SpeechSynthesisUtterance !== 'undefined') {
      this.synth = window.speechSynthesis;
    }
  }

  isSupported(): boolean {
    return this.synth !== null;
  }

  private ensureVoices(): Promise<SpeechSynthesisVoice[]> {
    return new Promise((resolve) => {
      if (!this.synth) return resolve([]);
      
      const voices = this.synth.getVoices();
      if (voices.length > 0) {
        return resolve(voices);
      }

      const onVoicesChanged = () => {
        if (this.synth) {
          const loadedVoices = this.synth.getVoices();
          this.synth.removeEventListener('voiceschanged', onVoicesChanged);
          resolve(loadedVoices);
        }
      };

      this.synth.addEventListener('voiceschanged', onVoicesChanged);

      // Timeout fallback in case voiceschanged never fires
      setTimeout(() => {
        if (this.synth) {
          this.synth.removeEventListener('voiceschanged', onVoicesChanged);
          resolve(this.synth.getVoices());
        }
      }, 1500);
    });
  }

  speak(text: string, language: SupportedLanguage, onStart?: (fallbackUsed: boolean) => void): Promise<SpeakResult> {
    return new Promise((resolve, reject) => {
      if (!this.synth) {
        reject(new Error("Voice output unsupported"));
        return;
      }

      this.stop(); // Stop any existing speech

      this.ensureVoices().then(voices => {
        if (!this.synth) return;

        const locale = VOICE_LOCALE_MAP[language] || 'en-IN';
        // Note: we check window.SpeechSynthesisUtterance inside the function for safety 
        const UtteranceClass = (window as any).SpeechSynthesisUtterance;
        if (!UtteranceClass) {
          reject(new Error("Voice output unsupported"));
          return;
        }

        const utterance = new UtteranceClass(text);
        utterance.lang = locale;

        let fallbackUsed = false;
        
        if (voices.length > 0) {
          const exactMatch = voices.find(v => v.lang === locale || v.lang.replace('_', '-') === locale);
          if (exactMatch) {
            utterance.voice = exactMatch;
          } else {
            // Fallback to primary language match (e.g. "hi-IN" -> "hi")
            const baseLang = locale.split('-')[0];
            const looseMatch = voices.find(v => v.lang.startsWith(baseLang));
            if (looseMatch) {
              utterance.voice = looseMatch;
              fallbackUsed = true;
            } else {
              fallbackUsed = true;
            }
          }
        } else {
          fallbackUsed = true;
        }

        utterance.onend = () => {
          this.currentUtterance = null;
          resolve({ fallbackUsed });
        };
        
        utterance.onerror = (e: any) => {
          this.currentUtterance = null;
          if (e.error !== 'canceled' && e.error !== 'interrupted') {
            reject(new Error(e.error || 'Playback failed'));
          } else {
            resolve({ fallbackUsed }); // if cancelled, just resolve cleanly
          }
        };

        this.currentUtterance = utterance;
        
        try {
          this.synth.speak(utterance);
          if (onStart) onStart(fallbackUsed);
        } catch (err) {
          reject(err);
        }
      }).catch(reject);
    });
  }

  stop(): void {
    if (this.synth && this.synth.speaking) {
      this.synth.cancel();
      this.currentUtterance = null;
    }
  }
}

export class GeminiTTSProvider {
  private currentAudio: HTMLAudioElement | null = null;
  private currentAbortController: AbortController | null = null;

  isSupported(): boolean {
    return typeof window !== 'undefined' && typeof window.Audio !== 'undefined';
  }

  async speak(text: string, language: SupportedLanguage): Promise<void> {
    if (!this.isSupported()) {
      throw new Error("Audio unsupported");
    }

    this.stop();

    const abortController = new AbortController();
    this.currentAbortController = abortController;

    const res = await fetch('/api/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, language }),
      signal: abortController.signal
    });

    if (!res.ok) {
      throw new Error(`Server TTS failed: ${res.statusText}`);
    }

    const blob = await res.blob();
    if (abortController.signal.aborted) return;

    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);
    this.currentAudio = audio;

    return new Promise((resolve, reject) => {
      audio.onended = () => {
        URL.revokeObjectURL(url);
        this.currentAudio = null;
        resolve();
      };
      audio.onerror = (e) => {
        URL.revokeObjectURL(url);
        this.currentAudio = null;
        reject(new Error("Audio playback failed"));
      };
      audio.play().catch(e => {
        URL.revokeObjectURL(url);
        this.currentAudio = null;
        reject(e);
      });
    });
  }

  stop(): void {
    if (this.currentAbortController) {
      this.currentAbortController.abort();
      this.currentAbortController = null;
    }
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio = null;
    }
  }
}
