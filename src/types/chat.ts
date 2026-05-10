// 角色ID
export type CharacterId = 'warm-boy' | 'cool-guy' | 'sunshine' | 'artsy';

// 角色信息
export interface Character {
  id: CharacterId;
  name: string;
  tagline: string;
  tags: string[];
  avatar: string;
  speaker: string;
  systemPrompt: string;
  appearance: string;
}

// 消息类型
export type MessageType = 'text' | 'voice' | 'image';

// 消息
export interface Message {
  id: string;
  role: 'user' | 'character';
  type: MessageType;
  content: string;
  audioUri?: string;
  imageUri?: string;
  imagePrompt?: string;
  timestamp: number;
  isStreaming?: boolean;
}

// 聊天状态
export interface ChatState {
  character: Character | null;
  messages: Message[];
  isTyping: boolean;
  isGeneratingImage: boolean;
}
