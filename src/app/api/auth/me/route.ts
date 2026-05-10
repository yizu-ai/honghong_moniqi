import { NextResponse } from 'next/server';

export async function GET() {
  // Session check is handled client-side via AuthContext + localStorage
  // This endpoint can be used for server-side session validation if needed in the future
  return NextResponse.json({ user: null });
}
