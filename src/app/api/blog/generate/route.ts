import { NextRequest, NextResponse } from 'next/server';
import { LLMClient, Config, HeaderUtils } from 'coze-coding-dev-sdk';
import { getSupabaseClient } from '@/storage/database/supabase-client';

export async function POST(request: NextRequest) {
  try {
    // Step 1: Use LLM to generate a new article
    const customHeaders = HeaderUtils.extractForwardHeaders(request.headers);
    const config = new Config({ timeout: 30000 });
    const client = new LLMClient(config, customHeaders);

    const messages = [
      {
        role: 'system' as const,
        content:
          '你是一个恋爱专栏作家，文风轻松幽默，像闺蜜聊天。你需要写一篇恋爱沟通技巧文章。请按以下JSON格式输出，不要输出其他内容：{"title":"文章标题","summary":"一句话摘要，30字以内","content":"文章正文，300-500字"}',
      },
      {
        role: 'user' as const,
        content:
          '请随机选一个恋爱沟通技巧主题写一篇文章，可以是关于：如何表达不满、怎样给对方台阶下、异地恋怎么保持热度、如何处理吃醋、怎样让吵架变成沟通等等。风格要轻松幽默，像闺蜜在跟你聊天。',
      },
    ];

    const response = await client.invoke(messages, {
      model: 'doubao-seed-1-8-251228',
      temperature: 0.9,
    });

    // Parse LLM response
    let articleData: { title: string; summary: string; content: string };
    try {
      // Try to extract JSON from the response
      const jsonMatch = response.content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('No JSON found in response');
      articleData = JSON.parse(jsonMatch[0]);
    } catch {
      return NextResponse.json({ error: '文章生成格式异常，请重试' }, { status: 500 });
    }

    if (!articleData.title || !articleData.summary || !articleData.content) {
      return NextResponse.json({ error: '文章内容不完整，请重试' }, { status: 500 });
    }

    // Step 2: Save to database
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('blog_posts')
      .insert({
        title: articleData.title,
        summary: articleData.summary,
        content: articleData.content,
      })
      .select()
      .single();

    if (error) throw new Error(`保存文章失败: ${error.message}`);

    return NextResponse.json({ post: data });
  } catch (err) {
    console.error('Blog generate API error:', err);
    return NextResponse.json({ error: '生成文章失败，请重试' }, { status: 500 });
  }
}
