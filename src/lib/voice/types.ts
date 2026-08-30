export interface VoiceSTTProvider {
  startListening: (
    locale: string, 
    onResult: (text: string) => void, 
    onError: (err: string) => void, 
    onEnd: () => void
  ) => void;
  stopListening: () => void;
  isSupported: () => boolean;
}

export interface VoiceTTSProvider {
  speak: (
    text: string, 
    locale: string, 
    onEnd: () => void, 
    onError: (err: string) => void
  ) => void;
  stop: () => void;
  isSupported: () => boolean;
}
