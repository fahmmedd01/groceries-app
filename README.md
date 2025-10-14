# 🛒 Voice Grocery Assistant

A Next.js web application that enables users to create and manage grocery lists through voice commands or text input. The system automatically identifies grocery items, quantities, and preferred brands, then fetches availability and pricing across multiple retailers.

## ✨ Features

- 🎤 **Voice Input**: Build grocery lists using natural speech with Web Speech API
- ⌨️ **Text Input**: Alternative manual input for grocery items
- 🤖 **AI Parsing**: Claude AI extracts items, quantities, brands, and sizes from natural language
- 🏪 **Multi-Retailer**: Compare prices across Walmart, Walgreens, Mariano's, Costco, and Sam's Club
- 💰 **Best Price Finder**: Automatically identifies the cheapest options
- 📍 **Location-Based**: Pricing and availability scoped to your ZIP code
- 💾 **Save Lists**: Authenticated users can save and manage multiple shopping lists
- 📤 **Export**: Download lists as CSV or generate shareable links
- 🔒 **Secure Auth**: Google OAuth and email/password authentication via Supabase

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **npm** or **yarn**
- **Supabase Account** ([Sign up](https://supabase.com))
- **Anthropic API Key** ([Get key](https://console.anthropic.com))

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/fahmmedd01/groceries-app.git
   cd groceries-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file in the root directory:
   
   ```bash
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   
   # Anthropic Claude API
   ANTHROPIC_API_KEY=your-anthropic-api-key
   ```

4. **Set up Supabase Database**
   
   Run the SQL schema in your Supabase SQL Editor (see `supabase-schema.sql`)

5. **Configure Supabase Authentication**
   
   - Go to Authentication → Providers in your Supabase dashboard
   - Enable Google OAuth and add your OAuth credentials
   - Enable Email authentication
   - Add redirect URLs: `http://localhost:3000/auth/callback`

6. **Run the development server**
   ```bash
   npm run dev
   ```

7. **Open [http://localhost:3000](http://localhost:3000)** in your browser

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:ci
```

## 🏗️ Project Structure

```
groceries-app/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   ├── lists/             # List management pages
│   ├── results/           # Search results pages
│   └── settings/          # User settings
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   └── ...               # Feature components
├── lib/                   # Utility functions
│   ├── supabase/         # Supabase client & utilities
│   ├── anthropic/        # Claude AI integration
│   ├── mock-data/        # Mock retailer data
│   └── matching/         # Product matching algorithm
├── __tests__/            # Test files
└── public/               # Static assets
```

## 🎨 Design System

The app uses a modern, soft UI design with:
- **Primary**: Lime green (`#A8C055`) for active states and CTAs
- **Secondary**: Lavender purple (`#B5B3E1`) for info states
- **Accent**: Soft peach/coral for warnings
- **Typography**: Inter font family
- **Components**: Rounded pills, generous spacing, floating UI elements

## 📝 API Routes

- `POST /api/parse-grocery-input` - Parse voice/text input into structured items
- `POST /api/match-products` - Match items to retailer products
- `POST /api/refine-list` - Update list with voice refinement
- `POST /api/lists/save` - Save a grocery list
- `GET /api/lists/[listId]/export` - Export list as CSV

## 🔐 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | Yes |
| `ANTHROPIC_API_KEY` | Anthropic Claude API key | Yes |

## 🚢 Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

```bash
# Manual deployment
npm run build
vercel --prod
```

## 📄 License

MIT License - see LICENSE file for details

## 🤝 Contributing

Contributions welcome! Please open an issue or submit a pull request.

## 📧 Support

For questions or issues, please open a GitHub issue or contact the maintainer.

---

Built with ❤️ using Next.js, Supabase, and Claude AI

