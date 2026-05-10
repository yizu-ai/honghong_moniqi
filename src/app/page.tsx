'use client';

import { ChatProvider, useChat } from '@/context/ChatContext';
import CharacterSelect from '@/components/CharacterSelect';
import { ChatScreen } from '@/components/ChatScreen';
import { Navbar } from '@/components/Navbar';

function AppContent() {
  const { chatState } = useChat();

  if (!chatState.character) {
    return <CharacterSelect />;
  }

  return <ChatScreen />;
}

export default function Home() {
  return (
    <ChatProvider>
      <Navbar />
      <AppContent />
    </ChatProvider>
  );
}
