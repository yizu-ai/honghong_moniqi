import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const client = getSupabaseClient();
    const { data, error } = await client
      .from('blog_posts')
      .select('*')
      .eq('id', Number(id))
      .maybeSingle();

    if (error) throw new Error(`查询文章详情失败: ${error.message}`);
    if (!data) {
      return NextResponse.json({ error: '文章不存在' }, { status: 404 });
    }

    return NextResponse.json({ post: data });
  } catch (err) {
    console.error('Blog detail API error:', err);
    return NextResponse.json({ error: '获取文章详情失败' }, { status: 500 });
  }
}
