# 纸片人男友 - 项目文档

## 项目概述
AI虚拟恋爱聊天产品：用户选择一个有人设的虚拟男友角色，通过文字聊天互动，角色会回复文字、发语音消息、偶尔发"自拍照片"。附带恋爱攻略博客功能和用户注册登录系统。

## 技术栈
- **Framework**: Next.js 16 (App Router)
- **Core**: React 19
- **Language**: TypeScript 5
- **UI 组件**: shadcn/ui (基于 Radix UI)
- **Styling**: Tailwind CSS 4
- **AI SDK**: coze-coding-dev-sdk (LLM + TTS + Image Generation)
- **Database**: Supabase (PostgreSQL) via Drizzle ORM migrations
- **Auth**: bcryptjs 密码哈希 + localStorage 客户端会话

## 目录结构
```
src/
├── app/
│   ├── api/
│   │   ├── chat/route.ts              # LLM 对话生成 API
│   │   ├── tts/route.ts               # TTS 语音合成 API
│   │   ├── image/route.ts             # 图像生成 API
│   │   ├── blog/route.ts              # 博客列表 API (GET)
│   │   ├── blog/[id]/route.ts         # 博客详情 API (GET)
│   │   ├── blog/generate/route.ts     # AI生成文章 API (POST)
│   │   ├── auth/register/route.ts     # 用户注册 API (POST)
│   │   ├── auth/login/route.ts        # 用户登录 API (POST)
│   │   ├── auth/logout/route.ts       # 用户登出 API (POST)
│   │   ├── auth/me/route.ts           # 会话检查 API (GET)
│   │   └── game-records/route.ts      # 游戏记录 API (GET+POST)
│   ├── blog/
│   │   ├── page.tsx                   # 博客列表页
│   │   └── [id]/page.tsx              # 文章详情页
│   ├── login/page.tsx                 # 登录页面
│   ├── register/page.tsx              # 注册页面
│   ├── profile/page.tsx               # 个人中心（游戏记录）
│   ├── layout.tsx                     # 全局布局（含AuthProvider）
│   └── page.tsx                       # 主页面（角色选择/聊天切换）
├── components/
│   ├── ui/                            # shadcn/ui 组件库
│   ├── Navbar.tsx                     # 顶部导航栏（登录状态差异化）
│   ├── CharacterSelect.tsx            # 角色选择界面（含恋爱攻略/排行榜入口）
│   ├── ChatScreen.tsx                 # 聊天主界面（含游戏记录保存）
│   ├── MessageBubble.tsx              # 消息气泡（文字/语音/图片）
│   ├── ImageViewer.tsx                # 图片全屏预览
│   └── TypingIndicator.tsx            # 正在输入动画
├── context/
│   ├── AuthContext.tsx                 # 认证状态管理
│   └── ChatContext.tsx                 # 聊天状态管理
├── data/
│   └── characters.ts                  # 角色数据和系统提示词
├── storage/
│   └── database/
│       ├── supabase-client.ts         # Supabase 客户端
│       └── shared/
│           └── schema.ts              # Drizzle 表结构定义
├── types/
│   └── chat.ts                        # 类型定义
└── utils/
    └── parseReply.ts                  # 解析 LLM 回复 + 文本清理
```

## API 接口

### POST /api/chat
- 请求：`{ characterId, systemPrompt, messages }`
- 响应：`{ reply }` - LLM 生成的回复（可能包含 [IMAGE: ...] 标记）

### POST /api/tts
- 请求：`{ text, speaker, uid }`
- 响应：`{ audioUri, audioSize }` - 语音文件 URL

### POST /api/image
- 请求：`{ prompt, appearance }`
- 响应：`{ imageUri }` - 生成的图片 URL

### GET /api/blog
- 响应：`{ posts: [{ id, title, summary, created_at }] }` - 文章列表

### GET /api/blog/:id
- 响应：`{ post: { id, title, summary, content, created_at } }` - 文章详情

### POST /api/blog/generate
- 响应：`{ post: { id, title, summary, content, created_at } }` - AI自动生成新文章并保存到数据库

### POST /api/auth/register
- 请求：`{ username, password }`
- 响应：`{ user: { id, username } }` - 注册成功自动登录
- 错误：400(参数无效) / 409(用户名已存在)

### POST /api/auth/login
- 请求：`{ username, password }`
- 响应：`{ user: { id, username } }` - 登录成功
- 错误：400(参数为空) / 401(用户名或密码错误)

### POST /api/auth/logout
- 响应：`{ success: true }` - 登出成功

### POST /api/game-records
- 请求：`{ userId, scenario, finalScore, result }`
- 响应：`{ record: { id, user_id, scenario, final_score, result, played_at } }`

### GET /api/game-records?userId=:id
- 响应：`{ records: [...] }` - 获取指定用户的游戏记录

## 数据库

### blog_posts 表
| 字段 | 类型 | 说明 |
|------|------|------|
| id | serial (PK) | 自增主键 |
| title | varchar(255) | 文章标题 |
| summary | varchar(500) | 文章摘要 |
| content | text | 文章正文 |
| created_at | timestamptz | 创建时间 |

### users 表
| 字段 | 类型 | 说明 |
|------|------|------|
| id | serial (PK) | 自增主键 |
| username | varchar(50) UNIQUE | 用户名 |
| password | text | bcrypt哈希密码 |
| created_at | timestamptz | 注册时间 |

### game_records 表
| 字段 | 类型 | 说明 |
|------|------|------|
| id | serial (PK) | 自增主键 |
| user_id | integer | 关联users表 |
| scenario | varchar(255) | 场景名称 |
| final_score | integer | 最终好感度分数 |
| result | varchar(50) | 通关/失败 |
| played_at | timestamptz | 游戏时间 |

RLS: 场景A（公开读写，使用service_role_key）

## 认证流程
1. 注册：用户输入用户名+密码 → bcrypt哈希存储 → 自动登录
2. 登录：用户输入用户名+密码 → bcrypt比对 → localStorage存储会话
3. 登出：清除localStorage + 调用logout API
4. AuthContext在组件挂载时从localStorage恢复会话

## 游戏记录流程
1. 用户退出聊天（点击返回按钮）→ 计算好感度分数
2. 已登录：调用 POST /api/game-records 保存记录 → 弹出"您的游戏记录已经保存"
3. 未登录：弹出"登录后可保存你的游戏记录"
4. 个人中心页展示历史游戏记录

## 核心流程
1. 用户选择角色 → 进入聊天界面
2. 用户输入文字 → 调用 /api/chat 获取回复
3. 解析回复中 [IMAGE: ...] 标记
4. 并行：文字消息立即显示 + TTS生成语音 + 图像生成（如有标记）
5. 首页"恋爱攻略"按钮 → 博客列表页 → 文章详情页
6. 博客列表页可点击"AI写一篇"自动生成新文章
7. 导航栏：未登录显示登录/注册按钮，已登录显示用户名+退出
8. 退出聊天时保存游戏记录（已登录）

## 开发命令
- `pnpm dev` - 启动开发环境
- `pnpm build` - 构建生产版本
- `pnpm lint` - ESLint 检查
- `pnpm ts-check` - TypeScript 类型检查
- `coze-coding-ai db generate-models` - 同步数据库模型
- `coze-coding-ai db upgrade` - 同步表结构到数据库
