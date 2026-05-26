# Command Centre — Setup Guide

A personal operating system dashboard. Follow these steps to get it running.

---

## Step 1 — Supabase Setup

1. Go to [supabase.com](https://supabase.com) → create a new project
2. Once created, go to **Project Settings → API** and note:
   - **Project URL** (e.g. `https://abcdefgh.supabase.co`)
   - **anon / public key**
   - **service_role key** (keep this secret — server only)
3. Go to **SQL Editor** → paste the entire contents of `supabase/schema.sql` → click **Run**
4. Go to **Authentication → Users** → click **Add user** → create your login email + password
5. After creating your account, go to **Authentication → Users**, find your user, and copy the **User UUID** (you'll need this for Telegram)
6. To enable realtime for todos: in the SQL editor run:
   ```sql
   alter publication supabase_realtime add table public.todos;
   ```

---

## Step 2 — Google Calendar (optional)

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create a project → enable **Google Calendar API**
3. Go to **Credentials → Create Credentials → API Key**
4. Restrict the key to the Google Calendar API and your domain
5. In Google Calendar, go to **Settings → your calendar → Share with specific people** → make sure it's accessible
6. Your Calendar ID is usually your Gmail address (visible in Calendar settings)

---

## Step 3 — Local Development

```bash
# Clone the repo and install
npm install

# Create .env file
cp .env.example .env
```

Edit `.env` and fill in your values:
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_GOOGLE_CALENDAR_API_KEY=your-google-api-key   # optional
VITE_GOOGLE_CALENDAR_ID=you@gmail.com               # optional
TELEGRAM_BOT_TOKEN=your-bot-token                   # for Netlify function
SUPABASE_SERVICE_KEY=your-service-role-key          # for Netlify function
SUPABASE_USER_ID=your-supabase-user-uuid            # for Telegram bot
```

```bash
npm run dev
```

Open http://localhost:5173 and log in with the email/password you created in Supabase.

---

## Step 4 — Deploy to Netlify

1. Push this repo to GitHub
2. Log into [netlify.com](https://netlify.com) → **Add new site → Import from Git**
3. Select your repo, build settings are auto-detected from `netlify.toml`
4. Go to **Site settings → Environment variables** and add all the vars from `.env.example`
5. Deploy — your site will be live at a `*.netlify.app` URL

---

## Step 5 — Telegram Bot (optional)

1. Message [@BotFather](https://t.me/BotFather) on Telegram → `/newbot`
2. Follow prompts, note your **Bot Token**
3. Add `TELEGRAM_BOT_TOKEN`, `SUPABASE_SERVICE_KEY`, and `SUPABASE_USER_ID` to Netlify env vars
4. After deploying, set the webhook by visiting this URL in your browser:
   ```
   https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook?url=https://your-site.netlify.app/api/telegram-webhook
   ```
5. Send your bot a message like `/idea This is a business idea` — it'll appear in your dashboard

**Telegram commands:**
- `/idea <text>` — saves as Business Idea
- `/thought <text>` — saves as Thought
- `/brain <text>` — saves as Idea
- `/note <text>` — saves as Note
- Any message without a command → Note

---

## Study Progress

Edit `src/lib/studyConfig.js` to update your unit statuses as you complete them:
- `"complete"` — done ✅
- `"current"` — in progress 📖
- `"upcoming"` — not started yet ⬜

---

## Updating the Theme

All colours are CSS custom properties in `src/styles/globals.css`. Edit the `:root` (dark) and `[data-theme="light"]` blocks to change the palette.
