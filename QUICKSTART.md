# ✅ QUICK START CHECKLIST

Complete these steps in order to get the anonymous platform running locally.

---

## Phase 1: Setup (30 minutes)

### Step 1: Install Node.js
- [ ] Go to https://nodejs.org
- [ ] Download LTS version
- [ ] Install (accept all defaults)
- [ ] Verify: Open terminal, run `node --version` (should be 18+)

### Step 2: Clone/Navigate to Project
- [ ] You're already in: `C:\Users\sezer\Desktop\anonymous-platform`
- [ ] Open VS Code
- [ ] Terminal → New Terminal
- [ ] Should be in correct directory
- [ ] Run: `ls` (should see many files/folders)

### Step 3: Install Dependencies
- [ ] Terminal: `npm install`
- [ ] Wait for completion (~2-3 minutes)
- [ ] ✓ No red errors

### Step 4: Generate Encryption Keys
Terminal commands:

**For Encryption Key (macOS/Linux):**
```bash
openssl rand -base64 32
```

**For Encryption Key (Windows - PowerShell):**
```powershell
-join ((1..32 | ForEach-Object { '{0:x}' -f (Get-Random -Minimum 0 -Maximum 256) }) | ForEach-Object { [System.Convert]::ToUInt32($_, 16) -as [byte] } | ForEach-Object { $_.ToString("x2") })
```

**Alternative (easier):** Use online generator: https://www.allkeysgenerator.com/Random/Security-Encryption-Key-Generator.html
- [ ] Use 32-byte base64 output
- [ ] Copy result

**For Rate Limit Salt (macOS/Linux):**
```bash
openssl rand -hex 32
```

**For Rate Limit Salt (Windows - PowerShell):**
```powershell
-join (1..64 | ForEach-Object {'{0:x}' -f (Get-Random -Minimum 0 -Maximum 16)})
```

Alternative: https://www.allkeysgenerator.com/Random/Security-Encryption-Key-Generator.html with hex output
- [ ] Use 64-char hex output
- [ ] Copy result

### Step 5: Create `.env.local` File
- [ ] In VS Code, File → New Text File
- [ ] Copy this content:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key-here
SUPABASE_SERVICE_ROLE_KEY=your-key-here
ENCRYPTION_KEY=PASTE_YOUR_ENCRYPTION_KEY_HERE
RATE_LIMIT_SALT_INITIAL=PASTE_YOUR_SALT_HERE
OPENAI_API_KEY=
NODE_ENV=development
NEXT_PUBLIC_LOG_LEVEL=debug
ENABLE_REQUEST_LOGS=false
DISABLE_ANALYTICS=true
```

- [ ] Replace `PASTE_YOUR_ENCRYPTION_KEY_HERE` with your key from Step 4
- [ ] Replace `PASTE_YOUR_SALT_HERE` with your salt from Step 4
- [ ] Save As: `.env.local` (in project root)
- [ ] Verify file was created: Should appear in VS Code file explorer

---

## Phase 2: Supabase Setup (15 minutes)

### Step 1: Create Supabase Project
- [ ] Go to https://supabase.com
- [ ] Click "Start your project"
- [ ] Sign up with GitHub or email
- [ ] Create organization
- [ ] Create new project:
  - [ ] Name: `anonymous-platform`
  - [ ] Password: Use auto-generated one
  - [ ] Region: Choose closest to you
  - [ ] Click "Create new project"
- [ ] Wait for deployment (~1 minute)

### Step 2: Get API Keys
- [ ] In Supabase, click Settings (bottom left)
- [ ] Click API
- [ ] Copy these values:
  - [ ] `Project URL` → paste into `.env.local` as `NEXT_PUBLIC_SUPABASE_URL`
  - [ ] `anon public` key → paste as `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - [ ] `service_role secret` → paste as `SUPABASE_SERVICE_ROLE_KEY`
- [ ] ⚠️ Keep service role key SECRET (don't commit)

### Step 3: Create Database Schema
- [ ] In Supabase dashboard, click "SQL Editor" (left sidebar)
- [ ] Click "New Query"
- [ ] In VS Code, open `supabase/schema.sql`
- [ ] Select all (Ctrl+A)
- [ ] Copy
- [ ] In Supabase, paste into query editor
- [ ] Click "Run" (top right, green button)
- [ ] ✓ Should see success message
- [ ] ✓ Tables created

### Step 4: Verify Database
- [ ] In Supabase, click "Table Editor" (left sidebar)
- [ ] You should see:
  - [ ] `submissions`
  - [ ] `submission_reactions`
  - [ ] `moderation_logs`
  - [ ] `rate_limit_logs`
- [ ] ✓ All tables present

---

## Phase 3: Run Locally (5 minutes)

### Step 1: Start Development Server
- [ ] Terminal: `npm run dev`
- [ ] Wait for "Ready in 1234ms"
- [ ] Should see: `✓ Ready in ...ms`

### Step 2: Open in Browser
- [ ] Go to: http://localhost:3000
- [ ] ✓ Should see form and feed

### Step 3: Test Submission
- [ ] Type: "I feel happy today"
- [ ] Category: Select "feelings"
- [ ] Click: "Submit Anonymously"
- [ ] ✓ Should see: "✓ Anonymous submission sent"

### Step 4: Test Feed
- [ ] Scroll down
- [ ] ✓ Should see your submission
- [ ] Try emoji reactions

### Step 5: Test Rate Limiting
- [ ] Try submitting 15 times rapidly
- [ ] After ~10, should get error: "Rate limit exceeded"
- [ ] ✓ Rate limiting works!

---

## Phase 4: Understand Code (30 minutes) - OPTIONAL

### Read These Files (in order)
1. [ ] `README.md` (5 min) - Overview
2. [ ] `docs/SECURITY.md` (15 min) - Security architecture
3. [ ] `docs/SUMMARY.md` (10 min) - Project summary

### Key Files to Explore
- [ ] `lib/rate-limit.ts` - How IP hashing works
- [ ] `lib/crypto.ts` - How encryption works
- [ ] `app/api/submit/route.ts` - How submissions flow
- [ ] `app/api/feed/route.ts` - How feed loads

---

## Phase 5: Deploy (Recommended - 30 minutes)

### Option A: Vercel (Easiest)

1. [ ] Go to https://vercel.com
2. [ ] Sign up with GitHub
3. [ ] Authorize Vercel
4. [ ] Click "Add New..." → "Project"
5. [ ] Select `anonymous-platform` repository
6. [ ] Configure build:
   - [ ] Build Command: `npm run build`
   - [ ] Output Directory: `.next`
7. [ ] Click "Environment Variables"
8. [ ] Add these variables:
   - [ ] `NEXT_PUBLIC_SUPABASE_URL`
   - [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - [ ] `SUPABASE_SERVICE_ROLE_KEY`
   - [ ] `ENCRYPTION_KEY`
   - [ ] `RATE_LIMIT_SALT_INITIAL`
9. [ ] Click "Deploy"
10. [ ] Wait for deployment (~3-5 minutes)
11. [ ] ✓ Get unique URL

### Option B: Netlify

1. [ ] Go to https://netlify.com
2. [ ] Connect GitHub
3. [ ] Select repository
4. [ ] Configure deploy:
   - [ ] Build: `npm run build`
   - [ ] Publish: `.next`
5. [ ] Add environment variables (same as Vercel)
6. [ ] Deploy

### Option C: Skip for Now
- [ ] You can always deploy later
- [ ] Local development works fine for testing

---

## Troubleshooting

### Problem: "npm: command not found"
- [ ] Install Node.js (see Phase 1, Step 1)
- [ ] Restart terminal/computer

### Problem: "Port 3000 already in use"
- [ ] Close other apps using port 3000
- [ ] Or change port: `npm run dev -- -p 3001`

### Problem: ".env.local not found"
- [ ] Check file exists in project root
- [ ] Make sure filename is exactly `.env.local` (starts with dot)
- [ ] Restart dev server after creating

### Problem: "Supabase connection error"
- [ ] Verify values in `.env.local` are correct
- [ ] Check you're online
- [ ] Try pasting exact values from Supabase dashboard

### Problem: "Submissions not appearing in feed"
- [ ] Check browser console (F12) for errors
- [ ] Check terminal for error messages
- [ ] Try submitting again
- [ ] Refresh page (Ctrl+R)

### Problem: Moderation blocking all submissions
- [ ] This is a configuration issue
- [ ] See [AI.md](docs/AI_MODERATION.md) for details
- [ ] Or reduce moderation strictness

---

## Next Steps After Setup

1. **Read Documentation**
   - [ ] [SECURITY.md](docs/SECURITY.md) - Understand privacy architecture
   - [ ] [DEPLOYMENT.md](docs/DEPLOYMENT.md) - Prepare for production

2. **Test More**
   - [ ] Create multiple submissions
   - [ ] Test with different categories
   - [ ] Try reactions
   - [ ] Test moderation (submit spam)

3. **Customize**
   - [ ] Add your privacy policy
   - [ ] Change rate limits (if desired)
   - [ ] Adjust UI colors
   - [ ] Add your domain

4. **Deploy**
   - [ ] Follow Phase 5 above
   - [ ] Share with beta testers
   - [ ] Monitor for issues

---

## Getting Help

### Documentation
- [README.md](README.md) - Start here
- [SECURITY.md](docs/SECURITY.md) - Security questions
- [DEPLOYMENT.md](docs/DEPLOYMENT.md) - Deployment issues
- [API.md](docs/API.md) - API reference

### Quick Questions
- Check [GETTING_STARTED.md](docs/GETTING_STARTED.md)
- Google the error message
- Check GitHub issues

### Report Issues
- GitHub Issues (bugs)
- Email for security issues

---

## Success Indicators

✓ You've succeeded when:
- [ ] Local development server runs
- [ ] Can submit anonymous posts
- [ ] Can view feed
- [ ] Reactions work
- [ ] Rate limiting works (gets blocked after 10)
- [ ] No console errors
- [ ] No terminal errors

---

## Time Estimates

| Phase | Time | Notes |
|-------|------|-------|
| Setup | 30 min | Installing Node, creating keys |
| Supabase | 15 min | API keys and schema |
| Local Testing | 5 min | Basic functionality |
| Understanding Code | 30 min | Optional, recommended |
| Deployment | 30 min | Optional, Vercel easiest |
| **TOTAL** | **1-2 hours** | From scratch to deployed |

---

## Final Checklist

- [ ] Node.js installed
- [ ] Dependencies installed (`npm install`)
- [ ] Encryption key generated and in `.env.local`
- [ ] Rate limit salt generated and in `.env.local`
- [ ] Supabase project created
- [ ] Supabase keys in `.env.local`
- [ ] Database schema created (`supabase/schema.sql`)
- [ ] Dev server running (`npm run dev`)
- [ ] Can access http://localhost:3000
- [ ] Can submit content
- [ ] Can view feed
- [ ] ✅ Ready to deploy or customize!

---

## 🎉 Congratulations!

You now have a fully functional, privacy-first anonymous platform!

**Next:**
- Read [docs/SECURITY.md](docs/SECURITY.md) to understand how it works
- Deploy using [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)
- Customize as needed

**Questions?** See [docs/GETTING_STARTED.md](docs/GETTING_STARTED.md)

---

**Started:** February 26, 2026
**Status:** ✅ Ready for Development
