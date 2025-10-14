# 🔐 Environment Variables Template

Copy this file to `.env.local` and fill in your actual values.

## Quick Copy Template

```bash
# Supabase Configuration
# Get from: https://supabase.com/dashboard/project/_/settings/api
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Anthropic Claude API
# Get from: https://console.anthropic.com/settings/keys
ANTHROPIC_API_KEY=
```

## How to Get Each Key

### 1. NEXT_PUBLIC_SUPABASE_URL
**Where**: Supabase Dashboard → Settings → API → Project URL
**Example**: `https://abcdefghijklm.supabase.co`
**Public**: ✅ Yes (starts with NEXT_PUBLIC_)

### 2. NEXT_PUBLIC_SUPABASE_ANON_KEY
**Where**: Supabase Dashboard → Settings → API → Project API keys → `anon` `public`
**Example**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
**Public**: ✅ Yes (anon key is safe for client-side)
**Note**: Very long string (200+ characters)

### 3. SUPABASE_SERVICE_ROLE_KEY
**Where**: Supabase Dashboard → Settings → API → Project API keys → `service_role` `secret`
**Example**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
**Public**: ❌ NO - Keep secret! Never commit to Git!
**Note**: Very long string (200+ characters)

### 4. ANTHROPIC_API_KEY
**Where**: Anthropic Console → Settings → API Keys → Create Key
**Example**: `sk-ant-api03-abcd1234...`
**Public**: ❌ NO - Keep secret! Never commit to Git!
**Note**: Starts with `sk-ant-`

## Verification Checklist

After filling in the values, verify:

- [ ] No placeholder text remains (no `your-xxx-here`)
- [ ] NEXT_PUBLIC_SUPABASE_URL starts with `https://`
- [ ] NEXT_PUBLIC_SUPABASE_ANON_KEY is ~200 characters
- [ ] SUPABASE_SERVICE_ROLE_KEY is ~200 characters  
- [ ] ANTHROPIC_API_KEY starts with `sk-ant-`
- [ ] File is saved as `.env.local` (with the dot!)
- [ ] File is in project root (same folder as package.json)
- [ ] File is listed in `.gitignore` ✅ (already done)

## Example (with fake values)

```bash
# DO NOT USE THESE - THEY ARE EXAMPLES ONLY
NEXT_PUBLIC_SUPABASE_URL=https://xkcdexample.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhrc2RleGFtcGxlIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NDk5NTg0ODUsImV4cCI6MTk2NTUzNDQ4NX0.fake_signature_here
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhrc2RleGFtcGxlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTY0OTk1ODQ4NSwiZXhwIjoxOTY1NTM0NDg1fQ.fake_signature_here
ANTHROPIC_API_KEY=sk-ant-api03-fake_key_1234567890abcdef_example_only
```

## Testing Your Configuration

After creating `.env.local`, test it:

```bash
# 1. Restart your dev server
npm run dev

# 2. Check browser console for errors
# 3. Try creating a grocery list
# 4. If errors appear, verify your keys
```

## Common Mistakes

### ❌ Wrong filename
- Not `.env` (missing .local)
- Not `env.local` (missing leading dot)
- Not `.env.development` (wrong suffix)

### ❌ Wrong location
- Not in a subfolder
- Should be in `/Users/farazahmed/Documents/Groceries-app/.env.local`

### ❌ Spaces or quotes
- No spaces around `=`
- No quotes needed around values
- Just: `KEY=value` not `KEY = "value"`

### ❌ Committed to Git
- Check `.gitignore` includes `.env*.local`
- Never push to GitHub with real keys

## Security Notes

🔒 **NEVER**:
- Commit `.env.local` to Git
- Share your service_role key
- Share your Anthropic API key
- Post keys in Discord/Slack/forums

✅ **DO**:
- Keep `.env.local` on your computer only
- Add keys to Vercel dashboard separately for production
- Rotate keys if accidentally exposed
- Use different keys for dev/prod

## Need Help?

If you're stuck getting API keys:
1. Check SETUP.md for detailed instructions
2. Visit Supabase documentation
3. Visit Anthropic documentation
4. Open an issue on GitHub

---

Remember: The `.env.local` file should never be committed to version control! 🔐

