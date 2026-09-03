import React, { useState, useEffect, useRef } from 'react';
import { Mic, Loader2, Check, X, AlertCircle } from 'lucide-react';
import { BrowserSTTProvider } from '@/lib/voice/providers';
import { parseSpokenValue } from '@/lib/voice/parse-spoken-value';
import { VoiceRecognitionError, ParsedVoiceValue } from '@/domain/voice/types';
import { SupportedLanguage } from '@/domain/advisory/types';

interface VoiceInputButtonProps {
  language: SupportedLanguage;
  fieldType: 'currency' | 'count';
  onConfirm: (value: number) => void;
}

type VoiceState = 
  | 'IDLE' 
  | 'LISTENING' 
  | 'CONFIRMING' 
  | 'ERROR';

export function VoiceInputButton({ language, fieldType, onConfirm }: VoiceInputButtonProps) {
  const [state, setState] = useState<VoiceState>('IDLE');
  const [parsed, setParsed] = useState<ParsedVoiceValue | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(true);
  
  const providerRef = useRef<BrowserSTTProvider | null>(null);

  useEffect(() => {
    providerRef.current = new BrowserSTTProvider();
    setIsSupported(providerRef.current.isSupported());
  }, []);

  if (!isSupported) {
    return null; // Gracefully degrade if voice is not supported
  }

  const handleStart = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!providerRef.current) return;

    setState('LISTENING');
    setErrorMsg(null);
    setParsed(null);

    try {
      const result = await providerRef.current.startListening(language);
      const parsedValue = parseSpokenValue(result.transcript, fieldType);
      setParsed(parsedValue);
      setState('CONFIRMING');
    } catch (err) {
      setState('ERROR');
      const voiceErr = err as VoiceRecognitionError;
      if (voiceErr === 'MIC_PERMISSION_DENIED') {
        setErrorMsg('Microphone permission denied');
      } else if (voiceErr === 'NO_SPEECH') {
        setErrorMsg('No speech detected');
      } else {
        setErrorMsg('Could not understand. Please try again or type.');
      }
    }
  };

  const handleConfirm = (e: React.MouseEvent) => {
    e.preventDefault();
    if (parsed?.status === 'PARSED') {
      onConfirm(parsed.value);
      setState('IDLE');
      setParsed(null);
    }
  };

  const handleCancel = (e: React.MouseEvent) => {
    e.preventDefault();
    setState('IDLE');
    setParsed(null);
    setErrorMsg(null);
    if (providerRef.current) {
      providerRef.current.stopListening();
    }
  };

  return (
    <div className="relative inline-flex flex-col items-end">
      {state === 'IDLE' && (
        <button
          onClick={handleStart}
          type="button"
          aria-label="Enter value by voice"
          className="p-2 bg-slate-100 hover:bg-brand-50 text-slate-600 hover:text-brand-600 rounded-full transition-colors focus:ring-2 focus:ring-brand-500"
        >
          <Mic className="w-4 h-4" />
        </button>
      )}

      {state === 'LISTENING' && (
        <div className="flex items-center gap-2 p-1.5 pl-3 bg-brand-50 border border-brand-200 rounded-full">
          <span className="text-xs font-medium text-brand-700 animate-pulse">Listening...</span>
          <button 
            type="button"
            onClick={handleCancel}
            className="p-1 bg-white hover:bg-brand-100 text-brand-600 rounded-full"
            aria-label="Cancel listening"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      {state === 'CONFIRMING' && parsed && (
        <div className="absolute top-full right-0 mt-2 z-50 w-64 bg-white rounded-lg shadow-lg border border-border-subtle overflow-hidden">
          <div className="p-3 bg-slate-50 border-b border-border-subtle">
            <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider mb-1">We heard</p>
            <p className="text-sm font-medium text-slate-800 break-words">&quot;{parsed.transcript}&quot;</p>
          </div>
          
          <div className="p-3">
            {parsed.status === 'PARSED' ? (
              <>
                <p className="text-xl font-bold text-brand-700 mb-3">{parsed.normalizedDisplay}</p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleConfirm}
                    className="flex-1 flex items-center justify-center gap-1 bg-brand-600 text-white py-1.5 px-3 rounded text-sm font-medium hover:bg-brand-700"
                  >
                    <Check className="w-4 h-4" /> Confirm
                  </button>
                  <button
                    type="button"
                    onClick={handleStart}
                    className="flex items-center justify-center bg-slate-100 text-slate-700 py-1.5 px-3 rounded text-sm font-medium hover:bg-slate-200"
                  >
                    <Mic className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="flex items-center justify-center bg-slate-100 text-slate-700 py-1.5 px-3 rounded text-sm font-medium hover:bg-slate-200"
                    aria-label="Cancel"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-start gap-2 text-amber-700 mb-3 bg-amber-50 p-2 rounded border border-amber-100">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <p className="text-xs">{parsed.reason || "We couldn't safely convert this into a number."}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleStart}
                    className="flex-1 text-center bg-slate-100 text-slate-700 py-1.5 px-3 rounded text-sm font-medium hover:bg-slate-200"
                  >
                    Try Again
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="flex-1 text-center bg-slate-100 text-slate-700 py-1.5 px-3 rounded text-sm font-medium hover:bg-slate-200"
                  >
                    Type Manually
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {state === 'ERROR' && (
        <div className="absolute top-full right-0 mt-2 z-50 w-56 bg-white rounded-lg shadow-lg border border-red-100 overflow-hidden">
          <div className="p-3 bg-red-50 text-red-700 text-xs flex gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <p>{errorMsg}</p>
          </div>
          <div className="p-2 flex gap-2 bg-white">
            <button
              type="button"
              onClick={handleStart}
              className="flex-1 text-center bg-slate-100 text-slate-700 py-1 px-2 rounded text-xs font-medium hover:bg-slate-200"
            >
              Try Again
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="flex-1 text-center bg-slate-100 text-slate-700 py-1 px-2 rounded text-xs font-medium hover:bg-slate-200"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
