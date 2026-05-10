'use client';

import { useState } from 'react';
import Image from 'next/image';
import type { Message } from '@/types/chat';
import { Play, Pause, ImageIcon, Loader2 } from 'lucide-react';

interface MessageBubbleProps {
  message: Message;
  characterName: string;
  characterAvatar: string;
  onImageClick: (uri: string) => void;
}

function AvatarImage({ src, alt, fallbackChar }: { src: string; alt: string; fallbackChar: string }) {
  const [error, setError] = useState(false);
  if (error) {
    return (
      <span className="flex items-center justify-center w-full h-full text-xs font-medium">
        {fallbackChar}
      </span>
    );
  }
  return (
    <Image
      src={src}
      alt={alt}
      width={36}
      height={36}
      className="w-full h-full object-cover"
      onError={() => setError(true)}
    />
  );
}

export function MessageBubble({ message, characterName, characterAvatar, onImageClick }: MessageBubbleProps) {
  const isUser = message.role === 'user';
  const [isPlaying, setIsPlaying] = useState(false);
  const [imgError, setImgError] = useState(false);

  const handlePlayVoice = () => {
    if (!message.audioUri) return;

    if (isPlaying) {
      setIsPlaying(false);
      return;
    }

    const audio = new Audio(message.audioUri);
    audio.onended = () => setIsPlaying(false);
    audio.onerror = () => setIsPlaying(false);
    audio.play();
    setIsPlaying(true);
  };

  // Image message
  if (message.type === 'image') {
    return (
      <div className={`flex gap-2 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        {!isUser && (
          <div className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0 bg-gradient-to-br from-rose-200 to-pink-200">
            <AvatarImage src={characterAvatar} alt={characterName} fallbackChar={characterName[0]} />
          </div>
        )}
        <div className="max-w-[240px]">
          {message.imageUri && !imgError ? (
            <button
              onClick={() => onImageClick(message.imageUri!)}
              className="rounded-lg overflow-hidden shadow-sm hover:opacity-90 transition-opacity cursor-pointer"
            >
              <Image
                src={message.imageUri}
                alt="照片"
                width={240}
                height={180}
                className="w-full object-cover rounded-lg"
                onError={() => setImgError(true)}
              />
            </button>
          ) : message.imagePrompt ? (
            <div className="w-[200px] h-[150px] bg-gray-200 rounded-lg flex items-center justify-center">
              <div className="flex flex-col items-center gap-2 text-gray-400">
                <Loader2 className="w-6 h-6 animate-spin" />
                <span className="text-xs">生成中...</span>
              </div>
            </div>
          ) : (
            <div className="w-[200px] h-[150px] bg-gray-200 rounded-lg flex items-center justify-center">
              <div className="flex flex-col items-center gap-2 text-gray-400">
                <ImageIcon className="w-6 h-6" />
                <span className="text-xs">图片加载失败</span>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Voice message
  if (message.type === 'voice') {
    return (
      <div className={`flex gap-2 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        {!isUser && (
          <div className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0 bg-gradient-to-br from-rose-200 to-pink-200">
            <AvatarImage src={characterAvatar} alt={characterName} fallbackChar={characterName[0]} />
          </div>
        )}
        <button
          onClick={handlePlayVoice}
          className={`px-3 py-2.5 rounded-lg shadow-sm flex items-center gap-2 cursor-pointer ${
            isUser
              ? 'bg-[#95EC69] rounded-tr-none'
              : 'bg-white rounded-tl-none'
          }`}
        >
          {isPlaying ? (
            <Pause className="w-4 h-4 text-gray-600" />
          ) : (
            <Play className="w-4 h-4 text-gray-600" />
          )}
          <div className="flex items-center gap-0.5">
            {[10, 16, 12].map((h, i) => (
              <div
                key={i}
                className={`w-0.5 bg-gray-400 rounded-full ${isPlaying ? 'animate-pulse' : ''}`}
                style={{ height: `${h}px` }}
              />
            ))}
          </div>
          <span className="text-xs text-gray-500 ml-1">语音</span>
        </button>
      </div>
    );
  }

  // Text message
  return (
    <div className={`flex gap-2 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      {!isUser && (
        <div className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0 bg-gradient-to-br from-rose-200 to-pink-200">
          <AvatarImage src={characterAvatar} alt={characterName} fallbackChar={characterName[0]} />
        </div>
      )}
      {isUser && (
        <div className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0 bg-blue-400 flex items-center justify-center">
          <span className="text-white text-xs font-medium">我</span>
        </div>
      )}
      <div
        className={`max-w-[75%] px-3 py-2 rounded-lg shadow-sm text-sm leading-relaxed ${
          isUser
            ? 'bg-[#95EC69] text-gray-800 rounded-tr-none'
            : 'bg-white text-gray-800 rounded-tl-none'
        }`}
      >
        {message.content}
      </div>
    </div>
  );
}
