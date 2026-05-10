import { NextRequest, NextResponse } from 'next/server';
import { TTSClient, Config, HeaderUtils } from 'coze-coding-dev-sdk';

export async function POST(request: NextRequest) {
  try {
    const { text, speaker, uid } = (await request.json()) as {
      text: string;
      speaker: string;
      uid: string;
    };

    if (!text || text.trim().length === 0) {
      return NextResponse.json({ error: 'Empty text' }, { status: 400 });
    }

    const customHeaders = HeaderUtils.extractForwardHeaders(request.headers);
    const config = new Config({ timeout: 15000 });
    const client = new TTSClient(config, customHeaders);

    const response = await client.synthesize({
      uid: uid || 'default-user',
      text,
      speaker: speaker || 'zh_male_taocheng_uranus_bigtts',
      audioFormat: 'mp3',
      sampleRate: 24000,
    });

    return NextResponse.json({
      audioUri: response.audioUri,
      audioSize: response.audioSize,
    });
  } catch (error) {
    console.error('TTS API error:', error);
    return NextResponse.json({ error: 'TTS failed' }, { status: 500 });
  }
}
