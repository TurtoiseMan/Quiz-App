This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

# Quiz Application

The application provides a quiz platform for creating, taking, and tracking quizzes with authentication and role-based access.

## 🚀 Live Demo

### [quiz-app.talha-khan.dev](https://quiz-app.talha-khan.dev)

**Deployment Platform:** Vercel

Try it out with these credentials:

- **Admin Access:** username: `admin`, password: `admin123`
- **User Access:** username: `user1`, password: `user123`
- **User Access:** username: `user2`, password: `user456`

## Project Architecture

The application uses these key components:

- **Next.js App Router**: Next.js features for routing, layout management, and server/client components
- **State Management**: Using Zustand for global state management
- **Authentication**: Simple role-based authentication system with admin and user roles
- **Data Persistence**: Client-side storage with Zustand persist middleware

### Directory Structure

```
src/
├── app/                   # Next.js App Router pages and layouts
│   ├── dashboard/         # Protected dashboard routes
│   │   ├── answers/       # Answers history pages (not currently in use)
│   │   ├── history/       # Quiz history pages
│   │   │   └── [id]/      # Individual quiz attempt details
│   │   └── questions/     # Question management pages
│   └── signin/            # Authentication page
├── components/            # Shared UI components
├── data/                  # Mock data and storage services
├── store/                 # Zustand state stores
└── types/                 # TypeScript type definitions
```

## Technologies Used

- **Frontend Framework**: Next.js 15.3.0
- **UI Library**: React 19.0.0
- **Styling**: Tailwind CSS 4.0
- **UI Components**: Ant Design 5.24.7
- **State Management**: Zustand 5.0.3
- **Language**: TypeScript 5
- **Development Tools**: ESLint 9, Next.js ESLint config

## Functionality

### User Authentication

- User sign-in with role-based access control (two roles: admin/user)
- Protected routes for authenticated users

### Question Management

- Create, update, and delete questions capability for admin
- Questions with multiple-choice options and correct answers

### Quiz System

- Create and manage quizzes with customizable time limits
- Auto submission when timer runs out
- Add questions to quizzes
- Track quiz attempts and scores for users

### Dashboard

- Admin dashboard for managing questions and quizzes
- User dashboard for taking quizzes and viewing attempts
- Quiz history overview

### History

- View quiz history of all users (for admin)
- View own quiz history only (for users)
- Detailed quiz history with selected and correct answers

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
