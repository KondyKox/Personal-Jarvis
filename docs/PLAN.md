# 🦾 Sigma Jarvis — Project Plan (v0.2, 2026-10-20)

A private Discord bot built only for me that grows into a personal "Jarvis" assistant.

**Legend:** ✅ decided · 💡 suggested (not final) · ❓ still open

---

## 1. Vision and scope

- ✅ Private bot for personal use, customized for me.
- ✅ Separate project from everything else (Job Saver is its own app and is postponed).
- ✅ No dashboard for the bot (only add one later if config becomes painful).
- ✅ Focus now: the bot as a personal Jarvis. Casino stays simple and comes later.
- ✅ Develop on my Linux PC. Hosting on the spare Android phone is far future.

### 1.1 Working defaults (decided before starting)

- ✅ **Access:** admin commands are owner-only (checked by my user ID). Everyone else only gets the fun stuff (mention replies, casino).
- ✅ **Test server:** a separate private server for development, with guild-scoped slash commands (they update instantly).
- ✅ **Language:** English for v1. All user-facing strings live in one place (e.g. a `messages.ts` file) so Polish can be added later. Possibly Polish + English, possibly English only.
- ✅ **Time:** store everything as UTC (`timestamptz`), parse "tomorrow 8:00" as Europe/Warsaw time.
- ✅ **Order:** reminders and notes first, moderation after.
- ✅ **Reliability:** log errors, handle crashes (process manager like `pm2` later), weekly `pg_dump` once real data exists.
- ✅ **Tooling:** `npm`, `tsx` for dev, private GitHub repo, `.env` in `.gitignore` from commit #1.
- ✅ **Scope rule:** finish phases 0–3 before adding anything new.
- ✅ **How we work:** planning first; when coding starts, hint-only tasks, I write the code and paste code or errors for review.

---

## 2. Tech stack

| Piece | Choice |
|---|---|
| Language | ✅ TypeScript on Node (LTS) |
| Discord library | 💡 discord.js, slash commands only (no `!prefix`) |
| Database | ✅ PostgreSQL, 💡 raw SQL via `pg` first (no ORM yet) |
| Scheduling | 💡 `node-cron` + DB-driven reminder checker |
| Config | 💡 `.env` (token, DB URL, API keys). Never commit it. |
| Brain | ✅ Claude API, small cheap model first (`/ask`, later natural-language actions), behind a swappable `ai` module |
| Bot language | ✅ English for v1 (Polish possible later) |
| Dev machine | ✅ Linux PC (Docker optional, never used it yet) |

---

## 3. Architecture

Every way of talking to the bot goes into **one router**, which dispatches to **modules**. Voice later is just another input.

```
Slash command ─┐
@mention ──────┼──▶ [ Router ] ──▶ modules (reminders, shrine, casino, ...)
Voice (later) ─┘                        │
                                   [ Postgres ]
```

Suggested layout:

```
sigma-jarvis/
├── src/
│   ├── core/          client, router, config, db, scheduler, ai (provider adapter)
│   ├── modules/
│   │   ├── moderation/
│   │   ├── reminders/
│   │   ├── notes/
│   │   ├── shrine/
│   │   ├── personality/
│   │   ├── ask/
│   │   └── casino/
│   └── index.ts
├── migrations/        numbered .sql files
├── .env               (never committed)
└── .gitignore
```

Module contract (💡): each module declares its commands, optional schedule, and optional event handlers. Adding a feature never touches the core.

Plugin pattern for external sources: **fetch → compare with last time → notify if new**.

---

## 4. Modules and commands

| Module | Commands / behavior |
|---|---|
| **Core** ✅ | `/ping`, 💡 `/status` (bot, DB, scheduler health) |
| **Moderation** ✅ | `/warn`, `/timeout`, `/kick`, `/ban`, `/purge`, `/modlog`. Permission-checked, every action logged to a mod-log channel and the DB. |
| **Reminders** ✅ | `/remind <when> <text>`. Stored in DB with a due time, checked about every 30s, so reminders survive restarts. |
| **Notes** 💡 | `/note add`, `/note list`, `/note search`, `/note delete` |
| **Shrine** ✅ | Dead by Daylight Shrine of Secrets, posted weekly (see section 5) |
| **Personality** ✅ | On @mention, reply from a curated pool of gifs and emotes |
| **Ask / brain** ✅ | `/ask`, later natural-language actions via Claude tool use. 💡 Custom instructions and facts: `/instructions show\|set\|reset\|history`, `/remember`, `/forget`, `/memory list` (owner-only) |
| **Casino** ✅ | Simple, one command, built later: 💡 `/slots <bet>` with virtual coins |

---

## 5. Details per feature

### 5.1 Shrine of Secrets
- Run a scheduled check; post to a chosen channel **only when the shrine contents changed**.
- Store the last posted fingerprint in `feed_state`, so no duplicates and no missed weeks.
- Do not hardcode the reset time: sources I found disagree (one wiki says Tuesday 15:00 UTC, other sites say Wednesday 00:00 UTC).
- ❓ Data source still unknown. First task: find one that is alive, documented and allowed (community API or the DbD wiki). Keep the plugin easy to swap.

### 5.2 Notifications from other servers
- ✅ Follow a server's announcement channel into my own server (official feature), or invite the bot where an admin allows it.
- 🚫 Never use a user token ("self-bot"). It violates Discord's rules and gets accounts banned.
- Other apps: RSS, public APIs, webhooks, each as its own plugin.

### 5.3 Mention replies (gifs + emotes)
- Listen for messages that mention the bot. Messages mentioning the bot are exempt from the privileged message-content intent (verify in the docs).
- 💡 Start with a curated config: keywords or moods → list of gif URLs and emotes, random pick. Discord embeds gif links automatically.
- Custom emotes use the format `<:name:id>`; the bot needs "Use External Emojis" for emotes from other servers.
- Tenor's API was shut down on 2026-06-30. Alternatives: Giphy, Klipy. ❓ Curated list vs Giphy/Klipy search later.

### 5.4 AI brain

**Provider decision (✅):** Claude via the API. API usage is billed separately from my Claude chat plan (Anthropic support has a page on exactly this), so the bot does not eat my chat limits. It costs per token from prepaid credits, so set a low spending cap in the Console and keep the key in `.env`. ❓ Exact model: start with a small, cheap one; move up only if tool calls prove unreliable.

**Steps:**
- Step 1: `/ask <question>` calling the API.
- Step 2: natural language ("remind me Friday about the exam") turned into real actions via tool use, routed to the same modules.

**Swappable provider (✅):** only one module (`core/ai`) knows which provider is used.
- One function: messages + tools in, answer or action out.
- Provider and model name in `.env`; switching = config change + one adapter file.
- Conversation history stored in my own neutral format in the DB, converted per provider (never store raw provider responses).
- Tool definitions written once in my own format; the adapter translates them.
- A mini test list (about 10 phrases with the expected action, e.g. "remind me Friday at 8 about the exam") to rerun after any model switch.
- Free tiers (e.g. Gemini's) may use inputs for training, so never send notes or reminders there.

**Custom instructions (💡):** the final system prompt is built from layers:
1. Base instructions (file in the repo): who it is, tone, language, hard rules.
2. My custom instructions (DB, editable from Discord, every edit saved as a new version so I can roll back).
3. Facts about me (DB): things I told it to remember (time zone, usual reminder times, ...).
4. Per-feature mini prompts (reminder parser, note search, chat replies): small dedicated prompts work better and cost less than one giant one.

Rules:
- Only the owner (my user ID) can edit instructions or facts.
- Keep instructions short, they are sent with every request (check the API docs on prompt caching for cheaper repeated prefixes).
- **Data is not instructions:** notes, reminders and later RSS or web content go in as clearly labeled data, so text like "ignore your rules" inside them can't hijack the bot (prompt injection).
- Gif and emote choice stays separate: the curated pool picks the gif, the instructions only say when to use one.

### 5.5 Casino
- Virtual coins only. No real money, no cash-out.
- 💡 `coin_ledger` table (balance = sum of transactions).
- 💡 Wrap "deduct bet → spin → pay out" in one DB transaction, so spam can't double-spend.
- 💡 Use Node's `crypto.randomInt`, never `Math.random`. Weighted reels plus a paytable; decide the house edge on paper first.

---

## 6. Database (draft, bot's own)

| Table | Key columns |
|---|---|
| `warnings` | user, moderator, reason, created_at |
| `mod_actions` | action, target, moderator, reason, created_at |
| `reminders` | user, channel, text, due_at, delivered_at |
| `notes` | user, content, created_at |
| `feed_state` | source, last_fingerprint, updated_at |
| `coin_ledger` | user, amount, reason, created_at (later) |
| `bot_instructions` | id, text, active, created_at (every edit = new version) |
| `bot_facts` | id, fact, created_at |

Migrations are plain numbered `.sql` files, so I learn real SQL.

---

## 7. Voice (later)

- Voice is another input into the router: speech → text → router.
- Two routes: (a) talk in a Discord voice channel and the bot receives audio via `@discordjs/voice`; (b) the phone as an always-on "ear" with a local wake word ("Jarvis").
- Riskiest part: Android's background-microphone rules. 🧪 Do a one-weekend spike first.
- Detect the wake word locally and only process audio after it. Tell people in the room.
- Speech-to-text: local (whisper.cpp) or an API. Optional spoken replies later.

---

## 8. Job Saver integration (postponed)

When it returns it stays a separate app with its own DB, API and dashboard. Rule: apps talk over HTTP, never through each other's DB.
- 💡 Push: Job Saver sends `POST /events` to the bot with a shared secret (`source`, `type`, `data`).
- 💡 Catch-up: on startup the bot calls `GET /offers?since=...` to get what it missed.
- Simpler fallback: polling only. ❓ Final choice later.

---

## 9. Hosting

- Now: run on my Linux PC.
- Far future: the spare Android phone via Termux (install from F-Droid, use Termux:Boot for auto-start, wake-lock so Android doesn't kill it).
- 🔋 Old phones kept plugged in 24/7 can have battery swelling; use a charge limiter or remove the battery if possible.
- Alternatives if the phone doesn't work out: a cheap VPS or a Raspberry Pi.

---

## 10. Roadmap ("done when")

| # | Phase | Done when |
|---|---|---|
| 0 | Alive | Bot online, `/ping` works, Postgres running, first migration applied |
| 1 | Core | Router and module loader work, `/status` reports DB OK |
| 2 | Reminders + notes | A reminder fires after a bot restart |
| 3 | Moderation | A warning persists, a timeout works, the mod-log posts |
| 4 | Personality + shrine | @mention gets a reply, shrine posts once per change |
| 5 | Brain | `/ask` works, instructions and facts are editable and versioned, then one natural-language action |
| 6 | Casino | `/slots` works with a ledger |
| 7 | Voice | Spike answers "can the phone listen reliably?", then real voice |
| 8 | Job Saver integration | New offer shows up in Discord |
| 9 | Android hosting | Bot runs 24/7 on the phone |

---

## 11. Phase 0 checklist (setup)

1. Developer Portal → New Application → Bot → copy the token into `.env`. If it ever leaks, reset it immediately.
2. OAuth2 URL generator: scopes `bot` and `applications.commands`, plus the permissions needed (send messages, kick, ban, timeout, manage messages, use external emojis).
3. Intents: start with the minimum (guilds and messages). Add privileged intents only when a feature needs them (verify in the docs).
4. Add `.env` to `.gitignore` before the first commit.
5. Register slash commands with a script; test in my own server first.
6. Install PostgreSQL locally (or run it in Docker as a first Docker lesson), create a database, connect with `pg`, apply migration 001.

---

## 12. Safety notes

- Never commit tokens or API keys.
- Casino = virtual coins only.
- No self-bots, no scraping sources that forbid it (check each source's terms and prefer official APIs or RSS).
- Mic: process audio only after a local wake word.
- Set a spending limit for the Claude API.
- Instruction and fact editing is owner-only.
- Treat notes, reminders and external content as data, never as instructions to the AI.

---

## 13. Open decisions ❓

- Shrine data source
- Gifs: curated list vs Giphy/Klipy
- Exact Claude model for `/ask` (small and cheap first)
- Local Postgres vs Docker
- Job Saver events: push + catch-up vs polling (later)

---

## 14. Docs

- discord.js guide: https://discordjs.guide
- Discord Developer Portal: https://discord.com/developers/applications
- Discord API reference: https://discord.com/developers/docs
- Privileged intents: https://discord.com/developers/docs/events/gateway#privileged-intents
- discord.js voice: https://discordjs.guide/voice/
- PostgreSQL tutorial: https://www.postgresql.org/docs/current/tutorial.html
- Postgres transactions: https://www.postgresql.org/docs/current/tutorial-transactions.html
- node-postgres: https://node-postgres.com
- node-cron: https://github.com/node-cron/node-cron
- Node `crypto.randomInt`: https://nodejs.org/api/crypto.html
- Giphy API: https://developers.giphy.com/docs/api
- Claude API: https://docs.claude.com
- Why API usage is billed separately from the chat plan: https://support.claude.com/en/articles/9876003-i-have-a-paid-claude-subscription-pro-max-team-or-enterprise-plans-why-is-claude-api-usage-billed-separately-from-my-paid-claude-plan
- How to pay for Claude API usage: https://support.claude.com/en/articles/8977456-how-do-i-pay-for-my-claude-api-usage
- Postgres date/time types: https://www.postgresql.org/docs/current/datatype-datetime.html
- `pg_dump`: https://www.postgresql.org/docs/current/app-pgdump.html
- Termux wiki: https://wiki.termux.com
- whisper.cpp: https://github.com/ggml-org/whisper.cpp
- openWakeWord: https://github.com/dscripka/openWakeWord

Check licenses and current status of third-party tools before depending on them.

---

## 15. Decision log

- Bot and Job Saver are separate projects. Job Saver is postponed.
- Dropped the idea of the bot reading another app's DB. Apps talk over HTTP.
- Dropped a dashboard for the bot (for now).
- Casino downgraded to one simple command, built later.
- Hosting: PC now, Android phone far future.
- Reminders and notes come before moderation.
- English for v1; user-facing strings in one place so Polish can be added later.
- AI provider: Claude via the API (separate billing from chat limits), small model first, behind a swappable `ai` module. Considered OpenAI and Gemini; dropped the worry about using up chat limits.
- Custom instructions and facts live in the DB (versioned, owner-only), layered on top of a base prompt file.
- Planning phase first: no coding tasks until I say so.
