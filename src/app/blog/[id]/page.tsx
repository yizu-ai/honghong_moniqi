'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { BookOpen, Loader2 } from 'lucide-react';
import { Navbar } from '@/components/Navbar';

interface BlogPost {
  id: number;
  title: string;
  summary: string;
  content: string;
  created_at: string;
}

export default function BlogDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPost = async () => {
      const { id } = await params;
      try {
        const res = await fetch(`/api/blog/${id}`);
        const data = await res.json();
        if (data.post) {
          setPost(data.post);
        } else {
          setError(data.error || '文章不存在');
        }
      } catch {
        setError('加载失败，请重试');
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [params]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-fuchsia-50 flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-rose-400" />
        <span className="ml-2 text-rose-400">加载中...</span>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-fuchsia-50 flex flex-col items-center justify-center">
        <BookOpen className="w-12 h-12 text-rose-300 mb-4" />
        <p className="text-rose-400 mb-4">{error || '文章不存在'}</p>
        <Link
          href="/blog"
          className="text-rose-500 hover:text-rose-600 transition-colors"
        >
          返回文章列表
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-fuchsia-50">
      <Navbar />

      {/* Article Content */}
      <article className="max-w-2xl mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-3">{post.title}</h1>
          <div className="flex items-center gap-2 text-sm text-rose-300">
            <span>{formatDate(post.created_at)}</span>
          </div>
        </header>
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-rose-100">
          <div className="prose prose-rose max-w-none">
            {post.content.split('\n\n').map((paragraph, i) => (
              <p key={i} className="text-gray-700 leading-relaxed mb-4 last:mb-0">
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      </article>
    </div>
  );
}
