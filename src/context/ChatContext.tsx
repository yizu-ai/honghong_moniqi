'use client';

import { createContext, useContext, useState, useRef, useCallback, type ReactNode } from 'react';
import type { Character, ChatState, Message } from '@/types/chat';
import { parseReply, cleanTextForSpeech } from '@/utils/parseReply';

interface ChatContextType {
  chatState: ChatState;
  selectCharacter: (character: Character) => void;
  sendMessage: (content: string) => void;
  resetChat: () => void;
}

const ChatContext = createContext<ChatContextType | null>(null);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [chatState, setChatState] = useState<ChatState>({
    character: null,
    messages: [],
    isTyping: false,
    isGeneratingImage: false,
  });

  const isGeneratingRef = useRef(false);
  const uidRef = useRef<string>(`user-${Math.random().toString(36).slice(2, 10)}`);

  const selectCharacter = useCallback((character: Character) => {
    const greetingMessage: Message = {
      id: `greeting-${Date.now()}`,
      role: 'character',
      type: 'text',
      content: getGreeting(character.id),
      timestamp: Date.now(),
    };
    setChatState({
      character,
      messages: [greetingMessage],
      isTyping: false,
      isGeneratingImage: false,
    });
  }, []);

  const sendMessage = useCallback(
    async (content: string) => {
      if (isGeneratingRef.current || !chatState.character) return;
      isGeneratingRef.current = true;

      const userMessage: Message = {
        id: `user-${Date.now()}`,
        role: 'user',
        type: 'text',
        content,
        timestamp: Date.now(),
      };

      setChatState((prev) => ({
        ...prev,
        messages: [...prev.messages, userMessage],
        isTyping: true,
      }));

      try {
        // Build chat history for LLM (only last 20 messages)
        const recentMessages = [...chatState.messages, userMessage].slice(-20);
        const chatHistory = recentMessages.map((msg) => ({
          role: msg.role === 'character' ? 'assistant' : 'user',
          content: msg.content,
        }));

        // Call chat API (non-streaming for simplicity with image parsing)
        const chatResponse = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            characterId: chatState.character.id,
            systemPrompt: chatState.character.systemPrompt,
            messages: chatHistory,
          }),
        });

        if (!chatResponse.ok) {
          throw new Error('Chat API error');
        }

        const { reply } = await chatResponse.json();
        const { text, imagePrompt } = parseReply(reply);

        // Add character text message
        const characterMessage: Message = {
          id: `char-${Date.now()}`,
          role: 'character',
          type: 'text',
          content: text,
          timestamp: Date.now(),
        };

        setChatState((prev) => ({
          ...prev,
          messages: [...prev.messages, characterMessage],
          isTyping: false,
        }));

        // Parallel: TTS + Image Generation
        const ttsText = cleanTextForSpeech(text);

        const parallelTasks: Promise<void>[] = [];

        // TTS task
        if (ttsText) {
          parallelTasks.push(
            fetch('/api/tts', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                text: ttsText,
                speaker: chatState.character!.speaker,
                uid: uidRef.current,
              }),
            })
              .then((res) => res.json())
              .then((data) => {
                if (data.audioUri) {
                  const voiceMessage: Message = {
                    id: `voice-${Date.now()}`,
                    role: 'character',
                    type: 'voice',
                    content: text,
                    audioUri: data.audioUri,
                    timestamp: Date.now(),
                  };
                  setChatState((prev) => ({
                    ...prev,
                    messages: [...prev.messages, voiceMessage],
                  }));
                }
              })
              .catch(() => {
                // TTS failure is silent - don't affect text display
              })
          );
        }

        // Image generation task
        if (imagePrompt) {
          setChatState((prev) => ({ ...prev, isGeneratingImage: true }));

          // Add placeholder image message
          const imagePlaceholder: Message = {
            id: `img-placeholder-${Date.now()}`,
            role: 'character',
            type: 'image',
            content: '',
            imagePrompt,
            timestamp: Date.now(),
          };
          setChatState((prev) => ({
            ...prev,
            messages: [...prev.messages, imagePlaceholder],
          }));

          parallelTasks.push(
            fetch('/api/image', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                prompt: imagePrompt,
                appearance: chatState.character!.appearance,
                uid: uidRef.current,
              }),
            })
              .then((res) => res.json())
              .then((data) => {
                const imageUri = data.imageUri || '';
                setChatState((prev) => ({
                  ...prev,
                  messages: prev.messages.map((msg) =>
                    msg.id === imagePlaceholder.id
                      ? { ...msg, imageUri, imagePrompt: undefined }
                      : msg
                  ),
                  isGeneratingImage: false,
                }));
              })
              .catch(() => {
                setChatState((prev) => ({
                  ...prev,
                  messages: prev.messages.map((msg) =>
                    msg.id === imagePlaceholder.id
                      ? { ...msg, imageUri: '', imagePrompt: undefined }
                      : msg
                  ),
                  isGeneratingImage: false,
                }));
              })
          );
        }

        await Promise.allSettled(parallelTasks);
      } catch {
        // LLM failure - show error message
        const errorMessage: Message = {
          id: `error-${Date.now()}`,
          role: 'character',
          type: 'text',
          content: '网络不太好，等一下再试试～',
          timestamp: Date.now(),
        };
        setChatState((prev) => ({
          ...prev,
          messages: [...prev.messages, errorMessage],
          isTyping: false,
        }));
      } finally {
        isGeneratingRef.current = false;
      }
    },
    [chatState.character, chatState.messages]
  );

  const resetChat = useCallback(() => {
    isGeneratingRef.current = false;
    setChatState({
      character: null,
      messages: [],
      isTyping: false,
      isGeneratingImage: false,
    });
  }, []);

  return (
    <ChatContext.Provider value={{ chatState, selectCharacter, sendMessage, resetChat }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat(): ChatContextType {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}

function getGreeting(characterId: string): string {
  const greetings: Record<string, string> = {
    'warm-boy': '嗯～你来了呀，今天过得怎么样？',
    'cool-guy': '……你来了。',
    'sunshine': '嗨嗨嗨！！终于等到你了！',
    'artsy': '……你来了。刚好，我刚弹完一首曲子。',
  };
  return greetings[characterId] || '你好呀～';
}
