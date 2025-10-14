# Setup Instructions - Voice Grocery Assistant

## 📋 Prerequisites

Before setting up this project, ensure you have:

1. **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
2. **npm** or **yarn** package manager
3. **Git** - For version control
4. **Supabase Account** - [Sign up](https://supabase.com)
5. **Anthropic API Key** - [Get key](https://console.anthropic.com)

## 🔧 Step 1: Install Node.js

If you don't have Node.js installed:

### macOS (using Homebrew)
```bash
brew install node
```

### Or download from official website
Visit [nodejs.org](https://nodejs.org/) and download the LTS version.

Verify installation:
```bash
node --version
npm --version
```

## 📦 Step 2: Install Dependencies

Navigate to the project directory and install all required packages:

```bash
cd /Users/farazahmed/Documents/Groceries-app
npm install
```

This will install:
- Next.js 14+ with App Router
- React 18+
- TypeScript
- Tailwind CSS
- shadcn/ui components
- Supabase client libraries
- Anthropic Claude SDK
- Testing libraries (Jest, React Testing Library)
- And all other dependencies

## 🗄️ Step 3: Set Up Supabase

### 3.1 Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. Fill in:
   - Project name: `voice-grocery-assistant`
   - Database password: (create a strong password)
   - Region: Choose closest to you
4. Wait for project to be created (2-3 minutes)

### 3.2 Get Supabase Credentials

1. Go to **Project Settings** → **API**
2. Copy these values:
   - `Project URL` (e.g., `https://xxxxx.supabase.co`)
   - `anon public` key
   - `service_role` key (keep this secret!)

### 3.3 Run Database Schema

1. In your Supabase dashboard, go to **SQL Editor**
2. Create a new query
3. Copy the entire contents of `supabase-schema.sql` from this project
4. Paste into the SQL editor
5. Click **Run** to execute

This creates all necessary tables:
- `users`
- `grocery_lists`
- `list_items`
- `retailer_matches`

### 3.4 Configure Authentication

1. Go to **Authentication** → **Providers**
2. **Enable Google OAuth**:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing
   - Enable Google+ API
   - Create OAuth 2.0 credentials
   - Add authorized redirect URI: `https://YOUR_SUPABASE_URL/auth/v1/callback`
   - Copy Client ID and Client Secret
   - Paste into Supabase Google provider settings
3. **Enable Email/Password authentication** (should be enabled by default)

## 🤖 Step 4: Get Anthropic API Key

1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Sign up or sign in
3. Go to **API Keys**
4. Click **Create Key**
5. Name it `voice-grocery-assistant`
6. Copy the API key (starts with `sk-ant-...`)

## 🔐 Step 5: Configure Environment Variables

Create a `.env.local` file in the project root:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Anthropic Claude API
ANTHROPIC_API_KEY=sk-ant-your-api-key-here
```

**Important**: Never commit `.env.local` to Git! It's already in `.gitignore`.

## 🚀 Step 6: Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

You should see the Voice Grocery Assistant home page!

## 🧪 Step 7: Run Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:ci
```

## 🔍 Step 8: Verify Everything Works

### Test Voice Input
1. Open the app in **Chrome or Edge** (Safari doesn't support Web Speech API)
2. Click the microphone button
3. Allow microphone access
4. Say: "Two cartons of eggs and one gallon of milk"
5. Click "Build My List"

### Test Text Input
1. Click the "Text" tab
2. Type: "bananas, bread, butter"
3. Enter a ZIP code (e.g., `60601`)
4. Click "Build My List"

You should see a results page with product matches from different retailers!

## 📝 Step 9: Git Setup

Initialize Git and push to your repository:

```bash
git init
git add .
git commit -m "Initial commit: Voice Grocery Assistant"
git branch -M main
git remote add origin https://github.com/fahmmedd01/groceries-app.git
git push -u origin main
```

## 🚢 Step 10: Deploy to Vercel

### Option 1: Deploy via Vercel Dashboard
1. Go to [vercel.com](https://vercel.com)
2. Sign in with GitHub
3. Click "New Project"
4. Import `fahmmedd01/groceries-app`
5. Configure environment variables (same as `.env.local`)
6. Click "Deploy"

### Option 2: Deploy via CLI
```bash
npm install -g vercel
vercel login
vercel
```

Follow the prompts and add environment variables when asked.

## ✅ Verification Checklist

- [ ] Node.js and npm installed
- [ ] All dependencies installed (`npm install` completed)
- [ ] Supabase project created
- [ ] Database schema executed successfully
- [ ] Google OAuth configured in Supabase
- [ ] Anthropic API key obtained
- [ ] `.env.local` file created with all keys
- [ ] Development server runs (`npm run dev`)
- [ ] Can access app at localhost:3000
- [ ] Voice input works (Chrome/Edge only)
- [ ] Text input works
- [ ] Products display on results page
- [ ] Tests pass (`npm test`)
- [ ] Code pushed to GitHub
- [ ] Deployed to Vercel (optional)

## 🆘 Troubleshooting

### "Voice input not supported"
- **Solution**: Use Chrome or Edge browser. Safari and Firefox don't support Web Speech API.

### "Failed to parse grocery input"
- **Solution**: Check that `ANTHROPIC_API_KEY` is set correctly in `.env.local`.
- Verify API key is valid at console.anthropic.com

### "Failed to match products"
- **Solution**: Check Supabase credentials are correct.
- Verify database schema was executed successfully.

### Build errors with Tailwind/shadcn
- **Solution**: Run `npm install` again to ensure all dependencies are installed.

### Authentication not working
- **Solution**: Check Google OAuth credentials in Supabase.
- Verify redirect URIs are correct.

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Anthropic API Documentation](https://docs.anthropic.com/)
- [shadcn/ui Documentation](https://ui.shadcn.com/)
- [Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API)

## 🤝 Need Help?

If you encounter any issues:
1. Check this SETUP.md file first
2. Review error messages in the browser console
3. Check server logs in terminal
4. Open an issue on GitHub
5. Review the README.md for general project information

---

Happy coding! 🎉

