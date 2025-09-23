# NextAuth Authentication Setup

This project has been successfully migrated from Clerk to NextAuth for authentication. The implementation supports both Google OAuth and email/password authentication.

## Features Implemented

✅ **Google OAuth Authentication**
✅ **Email/Password Authentication** 
✅ **User Registration with Database Storage**
✅ **Protected Dashboard Routes**
✅ **Session Management**
✅ **Database Integration with Prisma**

## Setup Instructions

### 1. Environment Variables

Update your `/apps/frontend/.env.local` file with the following variables:

```env
# NextAuth.js
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=eky8RW5OzMhp9lQ3ERHkzONxRn2NSoXnxYneEmLbuMI=

# Google OAuth (You need to set these up)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Database (already configured)
DATABASE_URL=postgresql://neondb_owner:npg_1ihnG5CjoKTS@ep-lively-breeze-a1hw5mrl-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

### 2. Google OAuth Setup

To enable Google authentication:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client IDs"
5. Set the application type to "Web application"
6. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (for development)
   - `https://yourdomain.com/api/auth/callback/google` (for production)
7. Copy the Client ID and Client Secret to your `.env.local` file

### 3. Database Schema

The database has been updated with NextAuth tables:
- `User` - stores user information with support for both OAuth and credentials
- `Account` - stores OAuth account information
- `Session` - manages user sessions
- `VerificationToken` - handles email verification

## Authentication Flow

### Sign Up Process
1. **Google OAuth**: Users click "Sign up with Google" → redirected to Google → account created automatically
2. **Email/Password**: Users fill out the signup form → password hashed → account created → auto sign-in

### Sign In Process  
1. **Google OAuth**: Users click "Sign in with Google" → redirected to Google → signed in
2. **Email/Password**: Users enter credentials → validated against database → signed in

### Protected Routes
- Dashboard is protected and redirects unauthenticated users to sign-in page
- All API calls include user authentication

## Available Routes

- `/auth/signin` - Sign in page with Google OAuth and email/password options
- `/auth/signup` - Sign up page with Google OAuth and email/password options  
- `/dashboard` - Protected dashboard (requires authentication)
- `/api/auth/[...nextauth]` - NextAuth API routes
- `/api/auth/register` - User registration endpoint

## Migration Summary

### Removed
- `@clerk/nextjs` package and all Clerk components
- `useAuth` hook from Clerk
- Clerk's `SignInButton`, `SignUpButton`, `UserButton`, `SignedIn`, `SignedOut` components
- `ClerkProvider` from layout

### Added
- `next-auth` with Prisma adapter
- Google OAuth provider
- Credentials provider with bcrypt password hashing
- User registration API endpoint
- Custom authentication pages
- Session management with NextAuth
- Updated database schema for NextAuth compatibility

### Updated
- `Appbar.tsx` - Now uses NextAuth session
- `useWebsites.tsx` - Updated to use NextAuth session  
- `dashboard/page.tsx` - Added authentication checks
- `layout.tsx` - Replaced ClerkProvider with NextAuth SessionProvider
- Database schema - Added NextAuth required tables

## Testing Authentication

1. **Start the application**: `bun run dev`
2. **Test Email Registration**:
   - Go to `/auth/signup`
   - Fill out the form with name, email, password
   - Should auto sign-in after successful registration
3. **Test Email Sign In**:
   - Go to `/auth/signin` 
   - Enter registered email/password
   - Should redirect to dashboard
4. **Test Google OAuth** (requires setup):
   - Click "Sign in with Google" on either page
   - Should redirect to Google for authentication
   - Should redirect back and create/sign in user

## Security Features

- Passwords are hashed with bcrypt (12 rounds)
- JWT tokens for session management
- CSRF protection via NextAuth
- Secure session cookies
- Database-backed sessions
- Automatic session refresh

## Next Steps

1. Set up Google OAuth credentials in Google Cloud Console
2. Test both authentication methods
3. Customize the authentication pages styling as needed
4. Add password reset functionality if required
5. Configure production environment variables