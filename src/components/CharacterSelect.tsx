'use client';

import { useState } from 'react';
import Image from 'next/image';
import { characters } from '@/data/characters';
import { useChat } from '@/context/ChatContext';
import { Heart, BookOpen, Trophy } from 'lucide-react';
import Link from 'next/link';

function AvatarImage({ src, alt, fallbackChar }: { src: string; alt: string; fallbackChar: string }) {
  const [error, setError] = useState(false);
  if (error) {
    return (
      <span className="flex items-center justify-center w-full h-full text-2xl">
        {fallbackChar}
      </span>
    );
  }
  return (
    <Image
      src={src}
      alt={alt}
      width={64}
      height={64}
      className="w-full h-full object-cover"
      onError={() => setError(true)}
    />
  );
}

export default function CharacterSelect() {
  const { selectCharacter } = useChat();

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-fuchsia-50 flex flex-col items-center justify-center p-4">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 mb-3">
          <Heart className="w-8 h-8 text-rose-500 fill-rose-500" />
          <h1 className="bg-gradient-to-r from-yellow-400 to-red-500 bg-clip-text text-3xl font-bold text-transparent">纸片人男友</h1>
          <Heart className="w-8 h-8 text-rose-500 fill-rose-500" />
        </div>
        <p className="text-rose-400 text-sm">选择你的虚拟男友，开始一段浪漫的对话</p>
      </div>

      {/* Character Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl w-full">
        {characters.map((character) => (
          <button
            key={character.id}
            onClick={() => selectCharacter(character)}
            className="group bg-white/80 backdrop-blur-sm rounded-2xl p-5 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 text-left border border-rose-100 hover:border-rose-200 cursor-pointer"
          >
            <div className="flex items-start gap-4">
              {/* Avatar */}
              <div className="w-16 h-16 rounded-full overflow-hidden flex-shrink-0 bg-gradient-to-br from-rose-200 to-pink-200 shadow-sm">
                <AvatarImage src={character.avatar} alt={character.name} fallbackChar={character.name[0]} />
              </div>
              {/* Info */}
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-gray-800 group-hover:text-rose-600 transition-colors">
                  {character.name}
                </h3>
                <p className="text-sm text-gray-500 mt-1 line-clamp-2">{character.tagline}</p>
                <div className="flex gap-1.5 mt-2 flex-wrap">
                  {character.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 text-xs rounded-full bg-rose-50 text-rose-500 border border-rose-100"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Blog & Leaderboard Entry */}
      <div className="mt-6 flex items-center gap-3">
        <Link
          href="/blog"
          className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/80 backdrop-blur-sm border border-rose-200 text-rose-500 hover:bg-rose-50 hover:border-rose-300 transition-all duration-300 shadow-sm hover:shadow-md group"
        >
          <BookOpen className="w-4 h-4 group-hover:scale-110 transition-transform" />
          <span className="text-sm font-medium">恋爱攻略</span>
        </Link>
        <Link
          href="#"
          className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/80 backdrop-blur-sm border border-amber-200 text-amber-600 hover:bg-amber-50 hover:border-amber-300 transition-all duration-300 shadow-sm hover:shadow-md group"
        >
          <Trophy className="w-4 h-4 group-hover:scale-110 transition-transform" />
          <span className="text-sm font-medium">排行榜</span>
        </Link>
      </div>

      {/* Footer */}
      <p className="text-rose-300 text-xs mt-6">点击角色卡片开始聊天</p>
    </div>
  );
}
