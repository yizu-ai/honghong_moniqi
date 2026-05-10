'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import type { Message } from '@/types/chat';
import { useChat } from '@/context/ChatContext';
import { useAuth } from '@/context/AuthContext';
import { ArrowLeft, Send } from 'lucide-react';
import { MessageBubble } from './MessageBubble';
import { TypingIndicator } from './TypingIndicator';
import { ImageViewer } from './ImageViewer';

function AvatarImage({ src, alt, fallbackChar }: { src: string; alt: string; fallbackChar: string }) {
  const [error, setError] = useState(false);
  if (error) {
    return (
      <span className="flex items-center justify-center w-full h-full text-sm font-medium">
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

function calculateScore(messages: Message[]): number {
  // Simple scoring: base 50 + bonus for user messages (engagement)
  const userMessages = messages.filter((m) => m.role === 'user');
  if (userMessages.length === 0) return 0;
  const base = 30;
  const engagementBonus = Math.min(userMessages.length * 5, 40);
  const imageBonus = messages.filter((m) => m.type === 'image').length * 5;
  return Math.min(base + engagementBonus + imageBonus, 100);
}

export function ChatScreen() {
  const { chatState, sendMessage, resetChat } = useChat();
  const { user } = useAuth();
  const [inputValue, setInputValue] = useState('');
  const [viewingImage, setViewingImage] = useState<string | null>(null);
  const [saveNotification, setSaveNotification] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatState.messages]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Auto-hide notification
  useEffect(() => {
    if (saveNotification) {
      const timer = setTimeout(() => setSaveNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [saveNotification]);

  const handleBack = async () => {
    if (!chatState.character) return;

    // Only save if there are meaningful messages (more than just the greeting)
    const userMessages = chatState.messages.filter((m) => m.role === 'user');
    if (userMessages.length >= 2) {
      const finalScore = calculateScore(chatState.messages);
      const result = finalScore >= 60 ? '通关' : '失败';
      const scenario = `与${chatState.character.name}的对话`;

      if (user) {
        // Logged in: save game record
        try {
          const res = await fetch('/api/game-records', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: user.id,
              scenario,
              finalScore,
              result,
            }),
          });
          if (res.ok) {
            setSaveNotification('您的游戏记录已经保存');
          }
        } catch {
          // Silently fail
        }
      } else {
        // Not logged in: show prompt
        setSaveNotification('登录后可保存你的游戏记录');
      }
    }

    // Delay reset slightly to show notification
    setTimeout(() => {
      resetChat();
    }, 800);
  };

  const handleSend = () => {
    const trimmed = inputValue.trim();
    if (!trimmed || chatState.isTyping) return;
    sendMessage(trimmed);
    setInputValue('');
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!chatState.character) return null;

  return (
    <div className="flex flex-col h-screen max-w-[600px] mx-auto bg-[#EDEDED]">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-[#EDEDED] border-b border-gray-200 flex-shrink-0">
        <button
          onClick={handleBack}
          className="p-1 hover:bg-gray-200 rounded-full transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0 bg-gradient-to-br from-rose-200 to-pink-200">
          <AvatarImage src={chatState.character.avatar} alt={chatState.character.name} fallbackChar={chatState.character.name[0]} />
        </div>
        <div className="flex-1">
          <h2 className="text-sm font-semibold text-gray-800">{chatState.character.name}</h2>
          <p className="text-xs text-green-500">
            {chatState.isTyping ? `${chatState.character.name}正在输入...` : '在线'}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-3">
        {chatState.messages.map((message: Message) => (
          <MessageBubble
            key={message.id}
            message={message}
            characterName={chatState.character!.name}
            characterAvatar={chatState.character!.avatar}
            onImageClick={(uri: string) => setViewingImage(uri)}
          />
        ))}
        {chatState.isTyping && (
          <TypingIndicator
            characterName={chatState.character.name}
            characterAvatar={chatState.character.avatar}
          />
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="flex items-center gap-2 px-3 py-3 bg-[#F7F7F7] border-t border-gray-200 flex-shrink-0">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="输入消息..."
          disabled={chatState.isTyping}
          className="flex-1 px-4 py-2.5 rounded-full bg-white border border-gray-200 text-sm focus:outline-none focus:border-rose-300 focus:ring-1 focus:ring-rose-200 disabled:opacity-50 disabled:cursor-not-allowed"
        />
        <button
          onClick={handleSend}
          disabled={!inputValue.trim() || chatState.isTyping}
          className="p-2.5 rounded-full bg-rose-500 text-white hover:bg-rose-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0 cursor-pointer"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>

      {/* Save Notification Toast */}
      {saveNotification && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-xl bg-white/95 backdrop-blur-sm shadow-lg border border-rose-100 text-sm text-gray-700 font-medium animate-in fade-in slide-in-from-top-2 duration-300">
          {saveNotification}
        </div>
      )}

      {/* Image Viewer */}
      {viewingImage && (
        <ImageViewer imageUrl={viewingImage} onClose={() => setViewingImage(null)} />
      )}
    </div>
  );
}
