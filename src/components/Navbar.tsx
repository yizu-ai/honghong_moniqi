'use client';

import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { LogIn, UserPlus, LogOut, User, Trophy } from 'lucide-react';

export function Navbar() {
  const { user, logout, isLoading } = useAuth();

  if (isLoading) {
    return (
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-rose-100 px-4 py-2.5">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-lg font-bold text-rose-600">
            纸片人男友
          </Link>
        </div>
      </nav>
    );
  }

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-rose-100 px-4 py-2.5">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        {/* Left: Logo */}
        <Link href="/" className="text-lg font-bold text-rose-600 hover:text-rose-700 transition-colors">
          纸片人男友
        </Link>

        {/* Right: Auth buttons */}
        <div className="flex items-center gap-2">
          {/* Leaderboard entry - always visible */}
          <Link
            href="#"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm text-amber-600 bg-amber-50 border border-amber-200 hover:bg-amber-100 transition-colors"
          >
            <Trophy className="w-4 h-4" />
            <span>排行榜</span>
          </Link>

          {user ? (
            <>
              <Link
                href="/profile"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm text-rose-600 bg-rose-50 border border-rose-200 hover:bg-rose-100 transition-colors"
              >
                <User className="w-4 h-4" />
                <span>{user.username}</span>
              </Link>
              <button
                onClick={logout}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm text-gray-500 bg-gray-50 border border-gray-200 hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>退出</span>
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm text-rose-600 bg-rose-50 border border-rose-200 hover:bg-rose-100 transition-colors"
              >
                <LogIn className="w-4 h-4" />
                <span>登录</span>
              </Link>
              <Link
                href="/register"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm text-white bg-rose-500 border border-rose-500 hover:bg-rose-600 transition-colors"
              >
                <UserPlus className="w-4 h-4" />
                <span>注册</span>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
