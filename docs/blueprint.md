# **App Name**: AI Content Engine

## Core Features:

- AI Content Workflow Orchestration: Orchestrate multi-step AI agents to brainstorm content ideas, convert them into a structured 30-day plan, and generate specific content assets (scripts, captions, hashtags, YouTube metadata) based on a user-provided topic and posting frequency. This includes the 'Content Generation' tool, which leverages LLM APIs.
- Dynamic 30-Day Content Plan Dashboard: Display the automatically generated 30-day content calendar in a user-friendly dashboard, showing content ideas, daily distribution, and overall plan status.
- Content Detail and Editing View: Provide a detailed view for each day's content, allowing users to inspect the AI-generated assets (e.g., script, caption) and perform basic manual edits if needed, saving updates to the Supabase database.
- Progress Tracking and Notes: Enable users to track the status of daily content items ('Not started', 'In progress', 'Completed') and add personal notes for each day, with all data persistently stored in Supabase.
- Flexible Content Planning & Archiving: Allow users to input desired posting frequency to dynamically generate plans. The system will also handle archiving of past 30-day plans and allow for selection of previous months.
- User Authentication and Authorization: Implement secure user registration, login, and session management using Supabase Auth, ensuring personalized access to content plans and data.

## Style Guidelines:

- Primary accent color: Vibrant Teal (#069494) for key interactive elements and highlights, suggesting a dynamic and professional system.
- Secondary accent color: Energetic Orange (#FF8243) used for call-to-action buttons or important status indicators, providing warmth and urgency.
- Soft highlight colors: Gentle Pink (#FFC0CB) and warm Yellow (#FCE883) for subtle visual distinctions, background elements, or mood setting without distracting from core content.
- Headlines and prominent text will use 'Space Grotesk' (sans-serif) for a modern, slightly tech-inspired, and impactful aesthetic. Body text and longer descriptions will use 'Inter' (sans-serif) for its readability, neutrality, and clear, objective feel.
- Utilize clean, modern, and precise line-based icons to represent workflow steps, content types, and tracking statuses, maintaining visual consistency with the app's professional and organized nature.
- A modular dashboard layout, providing a clear overview of the 30-day plan through a calendar or list view, complemented by a dedicated panel for content generation and detailed content displays. Emphasis on clean separation of sections and clear information hierarchy for a step-by-step user experience, with full mobile responsiveness.
- Incorporate subtle, functional animations for transitions between workflow steps, content loading, and status updates, providing visual feedback and enhancing the feeling of a seamless, automated system without being distracting.