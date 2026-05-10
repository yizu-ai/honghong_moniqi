'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Gamepad2, Trophy } from 'lucide-react';
import Link from 'next/link';

interface GameRecord {
  id: number;
  scenario: string;
  final_score: number;
  result: string;
  played_at: string;
}

export default function ProfilePage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [records, setRecords] = useState<GameRecord[]>([]);
  const [loadingRecords, setLoadingRecords] = useState(true);

  const fetchRecords = useCallback(async (userId: number) => {
    try {
      const response = await fetch(`/api/game-records?userId=${userId}`);
      if (response.ok) {
        const data = await response.json();
        setRecords(data.records || []);
      }
    } catch {
      // silently fail
    }
    setLoadingRecords(false);
  }, []);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
      return;
    }

    if (user) {
      fetchRecords(user.id);
    }
  }, [user, isLoading, router, fetchRecords]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-fuchsia-50 flex items-center justify-center">
        <p className="text-rose-400">加载中...</p>
      </div>
    );
  }

  if (!user) return null;

  const totalGames = records.length;
  const totalWins = records.filter((r) => r.result === '通关').length;
  const avgScore = totalGames > 0 ? Math.round(records.reduce((sum, r) => sum + r.final_score, 0) / totalGames) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-fuchsia-50">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-rose-100 px-4 py-3">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <Link href="/" className="p-1 hover:bg-rose-100 rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <h1 className="text-lg font-semibold text-gray-800">个人中心</h1>
        </div>
      </div>

      <div className="max-w-lg mx-auto p-4">
        {/* User Info Card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-md border border-rose-100 mb-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-rose-300 to-pink-300 flex items-center justify-center text-white text-2xl font-bold shadow-md">
              {user.username[0].toUpperCase()}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">{user.username}</h2>
              <p className="text-sm text-gray-400">纸片人男友玩家</p>
            </div>
          </div>
        </div>

        {/* Stats Card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-md border border-rose-100 mb-4">
          <h3 className="text-sm font-medium text-gray-500 mb-4 flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-500" />
            游戏统计
          </h3>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-rose-600">{totalGames}</p>
              <p className="text-xs text-gray-400">总场次</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">{totalWins}</p>
              <p className="text-xs text-gray-400">通关数</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-amber-600">{avgScore}</p>
              <p className="text-xs text-gray-400">平均好感度</p>
            </div>
          </div>
        </div>

        {/* Game Records */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-md border border-rose-100">
          <h3 className="text-sm font-medium text-gray-500 mb-4 flex items-center gap-2">
            <Gamepad2 className="w-4 h-4 text-rose-500" />
            游戏记录
          </h3>

          {loadingRecords ? (
            <p className="text-center text-gray-400 text-sm py-4">加载中...</p>
          ) : records.length === 0 ? (
            <p className="text-center text-gray-400 text-sm py-4">还没有游戏记录，快去聊天吧</p>
          ) : (
            <div className="space-y-3">
              {records.map((record) => (
                <div
                  key={record.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-gray-50/80 border border-gray-100"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-700 truncate">{record.scenario}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {new Date(record.played_at).toLocaleDateString('zh-CN', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 ml-3 flex-shrink-0">
                    <div className="text-right">
                      <p className="text-sm font-bold text-rose-600">{record.final_score}分</p>
                      <p className={`text-xs font-medium ${record.result === '通关' ? 'text-green-500' : 'text-red-400'}`}>
                        {record.result}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
