# 🚀 Quick Start Guide

## TL;DR - Get Running in 5 Minutes

### Step 1: Install Node.js
```bash
# Check if you have Node.js
node --version

# If not, install via Homebrew (macOS)
brew install node

# Or download from: https://nodejs.org/
```

### Step 2: Install Dependencies
```bash
cd /Users/farazahmed/Documents/Groceries-app
npm install
```

### Step 3: Get API Keys

#### Supabase (2 minutes)
1. Go to [supabase.com](https://supabase.com) → Sign up
2. Create new project → Wait 2 mins
3. Go to Settings → API
4. Copy: Project URL, anon key, service_role key

#### Anthropic (1 minute)
1. Go to [console.anthropic.com](https://console.anthropic.com) → Sign up
2. Go to API Keys → Create Key
3. Copy the key (starts with `sk-ant-`)

### Step 4: Create `.env.local`

Create a file called `.env.local` in the project root:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
ANTHROPIC_API_KEY=sk-ant-your-key-here
```

### Step 5: Set Up Database

1. In Supabase dashboard, go to SQL Editor
2. Open `supabase-schema.sql` from this project
3. Copy all the SQL
4. Paste into Supabase SQL Editor
5. Click "Run"

### Step 6: Run the App
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## ✅ Testing Your App

### Test 1: Voice Input (Chrome/Edge only)
1. Click microphone button
2. Say: "Two cartons of eggs and one gallon of milk"
3. Enter ZIP code: 60601
4. Click "Build My List"
5. ✅ You should see results with prices from 5 retailers!

### Test 2: Text Input
1. Click "Text" tab
2. Type: "bananas, bread, butter, chicken breast"
3. Enter ZIP code: 60601
4. Click "Build My List"
5. ✅ Results should display!

### Test 3: Best Price View
1. After building a list, check the "Best Price" tab
2. ✅ Should show cheapest option for each item
3. ✅ Should calculate total price

### Test 4: Authentication (Optional)
1. Click "Sign In" (if visible)
2. Note: You'll need to configure Google OAuth first (see SETUP.md)
3. For now, app works without sign-in!

## 🎯 What You Get Out of the Box

✅ **Home Page** - Voice/text input with beautiful UI
✅ **Results Page** - Product cards, 5 retailer tabs, best price view
✅ **AI Parsing** - Claude understands natural language
✅ **Mock Data** - 10+ products × 5 retailers = 50+ product variants
✅ **Product Matching** - Fuzzy search with brand/size filtering
✅ **Price Comparison** - Best price calculation & display
✅ **Export** - Download lists as CSV
✅ **Authentication** - Google OAuth ready (needs config)
✅ **Database** - Supabase with RLS policies
✅ **Responsive** - Mobile-first design
✅ **Tests** - Jest & React Testing Library configured

## 📝 Common Issues & Solutions

### "Command not found: node"
**Solution**: Install Node.js first (see Step 1)

### "Voice input not supported"
**Solution**: Use Chrome or Edge browser. Safari doesn't support Web Speech API.

### "Failed to parse grocery input"
**Solution**: Check your `ANTHROPIC_API_KEY` in `.env.local`

### "Failed to match products"
**Solution**: Verify Supabase credentials and that you ran the schema SQL

### Build errors
**Solution**: Delete `node_modules` and `.next`, then run:
```bash
rm -rf node_modules .next
npm install
npm run dev
```

## 🎨 Design Features

- **Lime Green** buttons and active states (#A8C055)
- **Lavender Purple** secondary actions (#B5B3E1)
- **Rounded corners** everywhere (28px on cards!)
- **Soft shadows** for depth
- **Mobile-first** with safe area support
- **Smooth animations** on all interactions

## 🔥 Try These Commands

```bash
# Development
npm run dev              # Start dev server
npm run build            # Production build
npm run start            # Start production server

# Testing
npm test                 # Run all tests
npm run test:watch       # Watch mode
npm run test:ci          # CI with coverage

# Code Quality
npm run lint             # Check code
npm run type-check       # TypeScript validation
```

## 🚀 Deploy to Vercel (Optional)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Add environment variables in Vercel dashboard
# Then deploy to production
vercel --prod
```

Or connect your GitHub repo to Vercel:
1. Go to [vercel.com](https://vercel.com)
2. Import `fahmmedd01/groceries-app`
3. Add environment variables
4. Deploy!

## 📚 Learn More

- **SETUP.md** - Detailed setup instructions
- **README.md** - Project overview & features
- **PROJECT_STATUS.md** - What's completed & next steps
- **supabase-schema.sql** - Database structure

## 🆘 Need Help?

1. Check PROJECT_STATUS.md for what's working
2. Review error messages in browser console
3. Check terminal for server errors
4. Open an issue on GitHub
5. Review SETUP.md for detailed troubleshooting

## 🎉 You're All Set!

Your Voice Grocery Assistant is ready to use. Start building grocery lists with voice or text, compare prices, and save your lists!

**Pro tip**: Try saying complex requests like:
- "Add two dozen organic eggs, a gallon of whole milk, and Tide Pods"
- "I need bananas, bread, butter, chicken breast, and orange juice"
- "Add toilet paper, one carton of eggs, and two gallons of milk"

The AI will understand and parse it correctly! 🤖✨

