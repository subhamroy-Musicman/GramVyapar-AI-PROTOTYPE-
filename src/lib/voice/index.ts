import { BrowserSTTProvider, BrowserTTSProvider } from './browser-provider';
import { VoiceSTTProvider, VoiceTTSProvider } from './types';

// Future: Switch this to BhashiniProvider when available
export const STTProvider: VoiceSTTProvider = BrowserSTTProvider;
export const TTSProvider: VoiceTTSProvider = BrowserTTSProvider;
