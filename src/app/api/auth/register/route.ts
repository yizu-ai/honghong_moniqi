import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getSupabaseClient } from '@/storage/database/supabase-client';

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json({ error: '用户名和密码不能为空' }, { status: 400 });
    }

    if (username.length < 2 || username.length > 50) {
      return NextResponse.json({ error: '用户名长度需在2-50之间' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: '密码长度不能少于6位' }, { status: 400 });
    }

    const supabase = getSupabaseClient();

    // Check if username already exists
    const { data: existing } = await supabase
      .from('users')
      .select('id')
      .eq('username', username)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ error: '用户名已存在' }, { status: 409 });
    }

    // Hash password with bcrypt
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user
    const { data, error } = await supabase
      .from('users')
      .insert({ username, password: hashedPassword })
      .select('id, username, created_at')
      .single();

    if (error) {
      console.error('Register DB error:', error);
      return NextResponse.json({ error: '注册失败，请重试' }, { status: 500 });
    }

    return NextResponse.json({
      user: { id: data.id, username: data.username },
    });
  } catch (err) {
    console.error('Register API error:', err);
    return NextResponse.json({ error: '注册失败，请重试' }, { status: 500 });
  }
}
