# IQUEEM Agency Dashboard

Dijital pazarlama ajansı iç operasyon paneli.

## Tech Stack

- React 18 + Vite + TypeScript
- Tailwind CSS + shadcn/ui
- Supabase (auth, database, realtime, storage)
- React Router v6, TanStack Query, Zustand

## Kurulum

```bash
npm install
```

## Geliştirme

```bash
npm run dev
```

## Supabase Kurulumu

1. [Supabase Dashboard](https://supabase.com/dashboard) üzerinden projeyi oluşturun.
2. `.env` dosyasını `.env.example`'dan kopyalayıp `VITE_SUPABASE_URL` ve `VITE_SUPABASE_ANON_KEY` değerlerini girin.
3. SQL Editor'da migration dosyalarını sırasıyla çalıştırın:
   - `supabase/migrations/001_initial_schema.sql`
   - `supabase/migrations/002_rls_policies.sql`
   - `supabase/migrations/003_storage.sql`
   - `supabase/migrations/004_realtime.sql` (Realtime bildirimler için)

## Deployment (Vercel)

1. Projeyi GitHub'a push edin.
2. [Vercel](https://vercel.com) üzerinden projeyi import edin.
3. **Environment Variables** ekleyin:
   - `VITE_SUPABASE_URL`: Supabase proje URL
   - `VITE_SUPABASE_ANON_KEY`: Supabase anon/public key
4. Deploy edin.

`vercel.json` SPA routing için yapılandırılmıştır (tüm rotalar `/index.html`'e yönlendirilir).
