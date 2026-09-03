export type VoiceLanguage = 'en-IN' | 'hi-IN' | 'bn-IN' | 'mr-IN' | 'ta-IN';

export interface VoiceRecognitionResult {
  transcript: string;
  isFinal: boolean;
}

export type VoiceRecognitionError = 
  | 'VOICE_UNSUPPORTED'
  | 'MIC_PERMISSION_DENIED'
  | 'NO_SPEECH'
  | 'RECOGNITION_FAILED'
  | 'ABORTED';

export type ParsedVoiceValue =
  | {
      status: "PARSED";
      value: number;
      transcript: string;
      normalizedDisplay: string;
    }
  | {
      status: "AMBIGUOUS";
      transcript: string;
      reason: string;
    }
  | {
      status: "INVALID";
      transcript: string;
      reason: string;
    };
