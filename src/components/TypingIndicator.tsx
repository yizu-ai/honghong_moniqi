'use client';

import { useState } from 'react';
import Image from 'next/image';

interface TypingIndicatorProps {
  characterName: string;
  characterAvatar: string;
}

export function TypingIndicator({ characterName, characterAvatar }: TypingIndicatorProps) {
  const [error, setError] = useState(false);
  return (
    <div className="flex gap-2">
      <div className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0 bg-gradient-to-br from-rose-200 to-pink-200">
        {!error ? (
          <Image
            src={characterAvatar}
            alt={characterName}
            width={36}
            height={36}
            className="w-full h-full object-cover"
            onError={() => setError(true)}
          />
        ) : (
          <span className="flex items-center justify-center w-full h-full text-xs font-medium">
            {characterName[0]}
          </span>
        )}
      </div>
      <div className="bg-white px-4 py-3 rounded-lg rounded-tl-none shadow-sm">
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );
}
