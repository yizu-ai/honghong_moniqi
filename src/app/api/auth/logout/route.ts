import { NextResponse } from 'next/server';

export async function POST() {
  // With cookie-based auth, we'd clear the cookie here
  // For now, logout is handled client-side by clearing the auth state
  return NextResponse.json({ success: true });
}
