# Saransh Batham — Portfolio

A dynamic developer portfolio built with React + Vite, powered by Salesforce as the blog backend.

**Live features:** Blog posts from Salesforce · 6 Certifications · Skills banner · Dark mode · Interactive terminal · Salesforce quiz · Animated preloader · Contact form (creates SF Cases)

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, TypeScript, Vite 8 |
| Styling | Tailwind CSS v4, CSS custom properties |
| Animation | Framer Motion |
| Routing | React Router v7 |
| Backend | Salesforce (blog/contact) via OAuth 2.0 |
| API layer | Vercel serverless functions (`/api`) |
| Local dev API | Node.js dev server (`dev-server.mjs`) |
| Deployment | Vercel |

---

## Prerequisites

- **Node.js 18+** — [nodejs.org](https://nodejs.org)
- **npm 9+** (comes with Node)
- A Salesforce org with the data model set up (see [Salesforce Setup](#salesforce-setup))

---

## Running Locally

### 1. Clone / copy the project

```bash
git clone https://github.com/YOUR_USERNAME/portfolio.git
cd portfolio
```

### 2. Install dependencies

```bash
npm install
```

### 3. Create environment file

Create a file named `.env.local` in the project root:

```env
SF_DOMAIN=your-org-domain.my.salesforce.com
SF_CLIENT_ID=your_consumer_key
SF_CLIENT_SECRET=your_consumer_secret
```

> **Where to find these values:**
> - `SF_DOMAIN` — Your Salesforce org URL (e.g. `orgfarm-abc123.develop.my.salesforce.com`)
> - `SF_CLIENT_ID` / `SF_CLIENT_SECRET` — From your External Client App in Salesforce Setup → App Manager

### 4. Start the dev server

```bash
npm run dev
```

This starts two servers simultaneously:
- **API server** on `http://localhost:3001` (Salesforce proxy)
- **Vite dev server** on `http://localhost:5173`

Open **http://localhost:5173** in your browser.

---

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start both API + Vite dev servers |
| `npm run build` | TypeScript check + production build |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run oxlint |

---

## Adding Your Resume

Place your resume PDF at:

```
public/resume.pdf
```

The "Download Resume" button in the hero section will automatically serve it.

---

## Salesforce Setup

### Object Model

Create a custom object **`Blog_Post__c`** with these fields:

| Field Label | API Name | Type |
|-------------|----------|------|
| Title | `Title__c` | Text(255) |
| Slug | `Slug__c` | Text(100), Unique |
| Summary | `Summary__c` | Text Area(500) |
| Body | `Body__c` | Rich Text Area |
| Tags | `Tags__c` | Text(255) |
| Published Date | `Published_Date__c` | Date |
| Read Time | `Read_Time__c` | Number |
| Is Published | `Is_Published__c` | Checkbox |

### External Client App (OAuth)

1. Go to **Setup → App Manager → New External Client App**
2. Set OAuth scopes: `api`, `refresh_token`
3. Enable **Client Credentials Flow**
4. Copy the **Consumer Key** → `SF_CLIENT_ID`
5. Copy the **Consumer Secret** → `SF_CLIENT_SECRET`

### Publishing a Blog Post

1. Create a `Blog_Post__c` record in Salesforce
2. Fill in Title, Slug (URL-friendly, e.g. `my-first-post`), Body, Tags (comma-separated)
3. Check **Is Published** = `true`
4. The post will appear on the portfolio automatically

---

## Deployment (Vercel)

### First deploy

1. Push the project to GitHub (make sure `.env.local` is **not** committed — it's in `.gitignore`)

2. Go to [vercel.com](https://vercel.com) → **Add New Project** → import your repo

3. Framework preset: **Vite** (auto-detected)

4. Add Environment Variables in Vercel dashboard:

   | Key | Value |
   |-----|-------|
   | `SF_DOMAIN` | your org domain |
   | `SF_CLIENT_ID` | your consumer key |
   | `SF_CLIENT_SECRET` | your consumer secret |

5. Click **Deploy** — your site will be live in ~2 minutes

### Subsequent deploys

```bash
git add .
git commit -m "update"
git push
```

Vercel auto-redeploys on every push to `main`.

---

## Project Structure

```
portfolio/
├── api/                    # Vercel serverless functions (Salesforce proxy)
│   ├── _sf.js              # Token cache + SOQL helper
│   ├── blogs.js            # GET /api/blogs
│   ├── blog-post.js        # GET /api/blogs/:slug (via rewrite in vercel.json)
│   ├── sitemap.js          # GET /sitemap.xml (via rewrite in vercel.json)
│   └── contact.js          # POST /api/contact
├── public/
│   ├── profile.webp        # Hero profile photo 1
│   ├── profile2.webp       # Hero profile photo 2
│   ├── favicon.png         # Browser tab icon
│   └── resume.pdf          # ← Add your resume here
├── src/
│   ├── components/
│   │   ├── Hero.tsx        # Landing section with rotating photos
│   │   ├── About.tsx       # About + stats
│   │   ├── Certifications.tsx
│   │   ├── SkillsBanner.tsx # Running marquee
│   │   ├── BlogPreview.tsx  # Latest posts (home)
│   │   ├── SalesforceQuiz.tsx
│   │   ├── Contact.tsx
│   │   ├── Navbar.tsx
│   │   ├── Footer.tsx
│   │   ├── Preloader.tsx   # Entry animation
│   │   └── FloatingTerminal.tsx # Easter egg terminal
│   ├── pages/
│   │   ├── Home.tsx
│   │   ├── BlogList.tsx
│   │   └── BlogDetail.tsx
│   ├── hooks/
│   │   └── useBlogPosts.ts
│   ├── context/
│   │   └── ThemeContext.tsx
│   └── index.css           # Design tokens + global styles
├── dev-server.mjs          # Local API server (mirrors Vercel functions)
├── vite.config.ts
├── vercel.json             # SPA rewrites + API routing
└── .env.local              # ← Create this file (never commit)
```

---

## Notes

- `.env.local` is gitignored — **recreate it manually on every new machine**
- The Salesforce credentials never reach the browser; they stay in serverless functions
- Blog body supports Salesforce rich text HTML (rendered safely)
- The terminal easter egg supports commands: `help`, `whoami`, `skills`, `certs`, `contact`, `blog`, `matrix`, `clear`, `exit`
