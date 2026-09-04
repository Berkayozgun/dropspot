# DropSpot — Limited Stock & Waitlist Platform

![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-5-000000?style=for-the-badge&logo=express&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-6-2D3748?style=for-the-badge&logo=prisma&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?style=for-the-badge&logo=postgresql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=for-the-badge&logo=docker&logoColor=white)

DropSpot, sınırlı stoklu ürün lansmanları (drop) için tasarlanmış full-stack bir platformdur. Bekleme listesi, öncelik puanı algoritması ve claim (hak talebi) mekanizması ile yoğun talep anlarında adil ve tutarlı bir deneyim sunar.

## Mimari

```
┌─────────────────┐     HTTP      ┌─────────────────┐     Prisma     ┌─────────────────┐
│  Next.js 16     │ ────────────► │  Express 5 API  │ ─────────────► │  PostgreSQL 16  │
│  (App Router)   │   :3001       │  JWT + RBAC     │                │                 │
│  Port: 3000     │               │  Port: 3001     │                │  Port: 5432     │
└─────────────────┘               └─────────────────┘                └─────────────────┘
         │                                  │
         └──────── Docker Compose ──────────┘
```

| Katman | Teknoloji | Dizin |
|--------|-----------|-------|
| Frontend | Next.js 16, React 19, Tailwind CSS 4 | `dropspot-frontend/` |
| Backend | Express 5, TypeScript, JWT | `dropspot-backend/` |
| ORM | Prisma 6 | `dropspot-backend/prisma/` |
| Veritabanı | PostgreSQL 16 | Docker volume `postgres_data` |
| Container | Docker Compose (multi-stage) | `docker-compose.yml` |

## Hızlı Başlangıç (Docker)

Tüm stack'i tek komutla ayağa kaldırın:

```bash
git clone https://github.com/Berkayozgun/dropspot.git
cd dropspot
docker compose up -d --build
```

| Servis | URL / Port |
|--------|------------|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:3001 |
| PostgreSQL | localhost:5432 |

Backend container başlarken otomatik olarak migration ve seed çalıştırır.

### Demo Giriş Bilgileri

| Rol | E-posta | Şifre |
|-----|---------|-------|
| Admin | `admin@dropspot.com` | `admin123` |
| User | `user@dropspot.com` | `user123` |

Seed ile oluşturulan drop'lar:
- **Demo Drop - Claim Now** — claim penceresi açık (hemen test)
- **Future Drop - Waitlist** — claim penceresi gelecekte (countdown/waitlist testi)

## Manuel Geliştirme

### 1. Veritabanı

```bash
docker compose up -d db
```

### 2. Backend

```bash
cd dropspot-backend
cp .env.example .env   # veya aşağıdaki değerleri kullanın
npm install
npx prisma generate
npx prisma migrate dev
npm run seed:dev       # opsiyonel: demo kullanıcı ve drop'lar
npm run dev            # http://localhost:3001
```

**Backend `.env` örneği:**

```env
DATABASE_URL=postgresql://user:password@localhost:5432/dropspot
JWT_SECRET=dev-secret-change-me
PORT=3001
```

### 3. Frontend

```bash
cd dropspot-frontend
cp .env.local.example .env.local
npm install
npm run dev            # http://localhost:3000
```

## Test ve CI

```bash
# Backend
cd dropspot-backend && npm test && npm run build

# Frontend
cd dropspot-frontend && npm test && npm run build
```

GitHub Actions (`master` branch): `backend-check` ve `frontend-check` job'ları otomatik test ve build çalıştırır.

## Proje Yapısı

```
dropspot/
├── docker-compose.yml
├── dropspot-backend/          # Express API + Prisma
│   ├── Dockerfile
│   ├── prisma/
│   └── src/
└── dropspot-frontend/         # Next.js App Router
    ├── Dockerfile
    ├── app/
    └── components/
```

## GitHub Repo Açıklaması (Öneri)

> Full-stack limited-stock drop platform with Next.js 16, Express, Prisma, PostgreSQL, waitlist priority scoring, claim flow, and one-command Docker Compose deployment.
