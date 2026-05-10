import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

// POST: Save a game record
export async function POST(request: NextRequest) {
  try {
    const { userId, scenario, finalScore, result } = await request.json();

    if (!userId || !scenario || finalScore === undefined || !result) {
      return NextResponse.json({ error: '缺少必要参数' }, { status: 400 });
    }

    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('game_records')
      .insert({
        user_id: userId,
        scenario,
        final_score: finalScore,
        result,
      })
      .select()
      .single();

    if (error) {
      console.error('Save game record error:', error);
      return NextResponse.json({ error: '保存游戏记录失败' }, { status: 500 });
    }

    return NextResponse.json({ record: data });
  } catch (err) {
    console.error('Game record API error:', err);
    return NextResponse.json({ error: '保存游戏记录失败' }, { status: 500 });
  }
}

// GET: Get game records for a user (query param: userId)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: '缺少userId参数' }, { status: 400 });
    }

    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('game_records')
      .select('*')
      .eq('user_id', Number(userId))
      .order('played_at', { ascending: false });

    if (error) {
      console.error('Get game records error:', error);
      return NextResponse.json({ error: '获取游戏记录失败' }, { status: 500 });
    }

    return NextResponse.json({ records: data });
  } catch (err) {
    console.error('Game records GET API error:', err);
    return NextResponse.json({ error: '获取游戏记录失败' }, { status: 500 });
  }
}
