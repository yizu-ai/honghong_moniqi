import { NextRequest, NextResponse } from 'next/server';
import { LLMClient, Config, HeaderUtils } from 'coze-coding-dev-sdk';
import type { CharacterId } from '@/types/chat';
import { getCharacterById } from '@/data/characters';

export async function POST(request: NextRequest) {
  try {
    const { characterId, systemPrompt, messages } = (await request.json()) as {
      characterId: CharacterId;
      systemPrompt: string;
      messages: { role: 'user' | 'assistant' | 'system'; content: string }[];
    };

    const character = getCharacterById(characterId);
    if (!character) {
      return NextResponse.json({ error: 'Character not found' }, { status: 400 });
    }

    const customHeaders = HeaderUtils.extractForwardHeaders(request.headers);
    const config = new Config({ timeout: 30000 });
    const client = new LLMClient(config, customHeaders);

    // Count recent images to control frequency
    const recentImageCount = messages.filter((m) => m.content.includes('[IMAGE:')).length;
    let finalSystemPrompt = systemPrompt;
    if (recentImageCount >= 2) {
      finalSystemPrompt += '\n\n注意：你最近已经发过照片了，这轮不要发图，不要包含 [IMAGE: ] 标记。';
    }

    const llmMessages = [
      { role: 'system' as const, content: finalSystemPrompt },
      ...messages,
    ];

    const response = await client.invoke(llmMessages, {
      model: 'doubao-seed-1-8-251228',
      temperature: 0.8,
    });

    return NextResponse.json({ reply: response.content });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json({ reply: '网络不太好，等一下再试试～' });
  }
}
