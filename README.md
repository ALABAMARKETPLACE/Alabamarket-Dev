This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.

---

## Environment variables ✅

This project reads runtime configuration from environment variables. For local development, create a `.env.local` file (already added in your workspace) with the keys in `.env.example`.

- Do NOT commit `.env.local` (it's already ignored by `.gitignore`).
- Add secrets only to `.env.local` or your deployment provider's secret store.

Quick steps:

1. Copy the template:

```bash
cp .env.example .env.local
# then edit .env.local with your values
```

2. After changing env values, restart the dev server so Next.js picks them up:

```bash
npm run dev
```

3. Verify server-side vars (e.g., `NEXTAUTH_SECRET`) are available in server code and client-facing ones have the `NEXT_PUBLIC_` prefix.

---
