# AI Content Engine

AI Content Engine is a Next.js application for planning, generating, and managing social content with AI.
It lets you define topics and channels, generate a weekly strategy, create platform-specific assets, and track execution progress.

## Features

- AI topic brainstorming flow that generates 20 structured content ideas and a plan title.
- Weekly plan creation based on posting frequency (`1`, `3`, `5`, or `7` posts per week).
- Platform-specific asset generation for Instagram, TikTok, Facebook, and YouTube.
- Script refinement chat to iteratively rewrite scripts with user instructions.
- Status tracking (`Not started`, `In progress`, `Completed`) and per-day notes.
- Local plan history with archive support.

## Tech Stack

- Next.js 15 + React 19 + TypeScript
- Tailwind CSS + Radix UI/shadcn components
- Genkit + OpenAI (`gpt-4o`) for AI flows
- Browser `localStorage` for persistence

## Getting Started

### Prerequisites

- Node.js 20+
- npm
- OpenAI API key

### Installation

```bash
npm install
```

### Environment Variables

Create `.env.local` in the project root:

```bash
OPENAI_API_KEY=your_openai_api_key_here
```

### Run the App

```bash
npm run dev
```

The app runs on `http://localhost:9002`.

### Optional: Run Genkit Dev Server

```bash
npm run genkit:dev
```

or with watch mode:

```bash
npm run genkit:watch
```

## Available Scripts

- `npm run dev` - start Next.js dev server (port `9002`)
- `npm run build` - production build
- `npm run start` - start production server
- `npm run lint` - run Next.js lint
- `npm run typecheck` - run TypeScript type checking
- `npm run genkit:dev` - start Genkit flow runtime
- `npm run genkit:watch` - start Genkit runtime with watch mode

## Data & Behavior Notes

- Plans are stored locally under the `localStorage` key `ai-content-engine-plans`.
- Current plan generation creates a 7-day schedule with post slots based on selected weekly frequency.
- `next.config.ts` is currently set to ignore TypeScript and ESLint build errors.

## License

MIT License

Copyright (c) 2026 AI Content Engine contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
