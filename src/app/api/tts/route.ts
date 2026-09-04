import { NextResponse } from 'next/server';
import { z } from 'zod';
import { GoogleGenAI } from '@google/genai';

const TTSRequestSchema = z.object({
  text: z.string().min(1).max(3000),
  language: z.enum(['en', 'hi', 'bn', 'mr', 'ta'])
});

const VOICE_LOCALE_MAP: Record<string, string> = {
  'en': 'en-IN',
  'hi': 'hi-IN',
  'bn': 'bn-IN',
  'mr': 'mr-IN',
  'ta': 'ta-IN'
};

function encodeWAV(pcmBuffer: Buffer, sampleRate = 24000, numChannels = 1) {
  const wavHeader = Buffer.alloc(44);
  wavHeader.write('RIFF', 0);
  wavHeader.writeUInt32LE(36 + pcmBuffer.length, 4);
  wavHeader.write('WAVE', 8);
  wavHeader.write('fmt ', 12);
  wavHeader.writeUInt32LE(16, 16);
  wavHeader.writeUInt16LE(1, 20); // PCM
  wavHeader.writeUInt16LE(numChannels, 22);
  wavHeader.writeUInt32LE(sampleRate, 24);
  wavHeader.writeUInt32LE(sampleRate * numChannels * 2, 28); // Byte rate
  wavHeader.writeUInt16LE(numChannels * 2, 32); // Block align
  wavHeader.writeUInt16LE(16, 34); // Bits per sample
  wavHeader.write('data', 36);
  wavHeader.writeUInt32LE(pcmBuffer.length, 40);
  return Buffer.concat([wavHeader, pcmBuffer]);
}

export async function POST(req: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const body = await req.json();
    const result = TTSRequestSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: 'Invalid request', details: result.error.format() }, { status: 400 });
    }

    const { text, language } = result.data;
    const locale = VOICE_LOCALE_MAP[language];

    const ai = new GoogleGenAI({ apiKey });
    const prompt = `Read the following advisory exactly and naturally in ${locale}. Do not add, remove, reinterpret, or calculate anything.\n\n${text}`;

    const resp = await ai.models.generateContent({
      model: 'gemini-3.1-flash-tts-preview',
      contents: prompt,
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Aoede' } } }
      }
    });

    const candidate = resp.candidates?.[0];
    const part = candidate?.content?.parts?.[0];
    
    if (!part?.inlineData || !part.inlineData.data) {
      return NextResponse.json({ error: 'Failed to generate audio' }, { status: 500 });
    }

    const pcmBuffer = Buffer.from(part.inlineData.data, 'base64');
    const wavBuffer = encodeWAV(pcmBuffer);

    return new NextResponse(wavBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'audio/wav',
        'Content-Length': wavBuffer.length.toString(),
      },
    });

  } catch (error: any) {
    console.error('TTS API error:', error);
    return NextResponse.json({ error: 'TTS Generation Failed' }, { status: 500 });
  }
}
