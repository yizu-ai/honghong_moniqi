import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';

export const metadata: Metadata = {
  title: '纸片人男友 | AI虚拟恋爱聊天',
  description: '选择你的虚拟男友角色，通过文字聊天互动，体验文字+语音+照片的沉浸式恋爱',
  keywords: ['纸片人男友', 'AI聊天', '虚拟男友', '恋爱', '角色扮演'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
