# Drawing Music: December 2025 restoration 🎧

This is a preserved and runnable-oriented restoration of the Dec 2025 Drawing Music UI from ChatGPT conversation archive `conversations-007.json`.

The repository's modern application lives at the **repository root**. This folder is a **standalone archival snapshot**, not a replacement for the current website. It should not be deployed as a public production service without significant security and functionality work.

## Local preview

Open `preview/index.html` directly in a browser. This static mockup has no backend.

## Start the historic Next.js application

From this folder, run:

```sh
npm install
cp .env.example .env.local
# Set strong random AUTH_SECRET and NEXTAUTH_SECRET values in .env.local
npm run dev
```

The original snippets were retrieved from a chronological sequence of code blocks in the archived conversation. CSS was assembled from 3 code blocks and basic Next.js config was reconstructed. Minor menu and Suspense compatibility changes were applied. See `RESTORE_MANIFEST.json` for the source mapping.

**Limitations:** upload and collaboration are mostly UI stubs; tracks are mock/demo data; login uses local JSON user storage intended only for experiments. Next.js installation/build verification was not possible in the original restoration environment. Do not expose this authentication implementation to the internet.

Source was restored for research, future integration and historical preservation, without touching current `app/`, `components/` or `lib/` at repository root.
