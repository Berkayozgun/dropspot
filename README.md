# DropSpot - Sınırlı Stok ve Bekleme Listesi Platformu

## Proje Özeti

DropSpot, özel ürünlerin veya etkinliklerin sınırlı stokla yayımlandığı, kullanıcıların bekleme listesine katılabildiği ve 'claim window' zamanı geldiğinde sırayla hak kazanabildiği bir platformdur. Bu proje, Alpaco'nun full stack mühendislik değerlendirmesi kapsamında geliştirilmiştir ve adil, ölçeklenebilir ve kullanıcı dostu bir süreç sunmayı hedeflemektedir.

## Mimari Açıklama

Proje, ayrı backend ve frontend uygulamalarından oluşan bir monorepo yapısında geliştirilmiştir. Bu ayrım, her bir katmanın bağımsız olarak geliştirilmesine, dağıtılmasına ve ölçeklendirilmesine olanak tanır.

### Backend (dropspot-backend)

Node.js ile Express.js framework'ü kullanılarak geliştirilmiştir. Katmanlı mimari prensipleri benimsenmiştir:

*   **Controllers:** HTTP isteklerini yönetir ve gelen verileri işlemek üzere servislere iletir.
*   **Services:** İş mantığını içerir ve veritabanı etkileşimleri için repository'leri kullanır.
*   **Middlewares:** Kimlik doğrulama (JWT) ve yetkilendirme (admin rolü) gibi çapraz kesen konuları ele alır.
*   **Prisma ORM:** PostgreSQL veritabanı ile etkileşim için güçlü bir ORM aracıdır. Schema tanımları `prisma/schema.prisma` dosyasında bulunur.
*   **PostgreSQL:** İlişkisel veritabanı olarak kullanılır.

### Frontend (dropspot-frontend)

Next.js (App Router) ile React kullanılarak geliştirilmiştir. Tailwind CSS ile hızlı ve modern bir arayüz sağlanmıştır. Global durum yönetimi için React Context API kullanılmıştır.

*   **Next.js App Router:** Sayfa tabanlı yönlendirme ve sunucu bileşenleri (Client Components) ile verimli frontend geliştirme sağlar.
*   **React Context API:** Kullanıcı kimlik doğrulama durumu gibi global state'leri yönetmek için kullanılır.
*   **Tailwind CSS:** Hızlı UI geliştirme için atomik CSS sınıflandırması sunar.

## Veri Modeli ve Endpoint Listesi

### Veri Modeli (`prisma/schema.prisma`)

```prisma
// This is your Prisma schema file,
// learn more about it in the docs: https://pris.ly/d/prisma-schema

// Looking for ways to speed up your queries, or scale easily with your serverless or edge functions?
// Try Prisma Accelerate: https://pris.ly/cli/accelerate-init

generator client {
  provider = "prisma-client"
  output   = "../generated/prisma"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum Role {
  USER
  ADMIN
}

model User {
  id        String     @id @default(uuid())
  email     String     @unique
  password  String
  name      String?
  role      Role       @default(USER)
  createdAt DateTime   @default(now())
  updatedAt DateTime   @updatedAt
  waitlists Waitlist[] // Yeni eklenen ters ilişki
  claimCodes ClaimCode[]  // Yeni eklenen ters ilişki
}

model Drop {
  id               String     @id @default(uuid())
  name             String
  description      String?
  price            Float
  stock            Int
  availableStock   Int
  releaseDate      DateTime
  claimWindowStart DateTime
  claimWindowEnd   DateTime
  createdAt        DateTime   @default(now())
  updatedAt        DateTime   @updatedAt
  waitlists        Waitlist[] // Yeni eklenen ters ilişki
  claimCodes       ClaimCode[]  // Yeni eklenen ters ilişki

  @@map("drops")
}

model Waitlist {
  id              String   @id @default(uuid())
  userId          String
  dropId          String
  joinedAt        DateTime @default(now())
  priorityScore   Float? // Kullanıcının bekleme listesindeki öncelik skoru

  user            User     @relation(fields: [userId], references: [id])
  drop            Drop     @relation(fields: [dropId], references: [id])

  @@unique([userId, dropId]) // Bir kullanıcı aynı drop'a birden fazla kez katılamaz
  @@map("waitlists")
}

model ClaimCode {
  id        String   @id @default(uuid())
  code      String   @unique
  userId    String
  dropId    String
  claimedAt DateTime @default(now())
  isUsed    Boolean  @default(false)

  user      User     @relation(fields: [userId], references: [id])
  drop      Drop     @relation(fields: [dropId], references: [id])

  @@unique([userId, dropId]) // Bir kullanıcı aynı drop için yalnızca bir kez claim yapabilir
  @@map("claim_codes")
}
```

### API Uçları

| Metod  | Endpoint              | Açıklama                                 | Kimlik Doğrulama | Yetkilendirme |
| :----- | :-------------------- | :--------------------------------------- | :--------------- | :------------ |
| `POST` | `/auth/signup`        | Kullanıcı kaydı                          | Hayır            | Yok           |
| `POST` | `/auth/login`         | Kullanıcı girişi                         | Hayır            | Yok           |
| `GET`  | `/drops`              | Aktif drop listesi                       | Hayır            | Yok           |
| `POST` | `/drops/:id/join`     | Bekleme listesine katılma               | Evet             | Yok           |
| `POST` | `/drops/:id/leave`    | Bekleme listesinden ayrılma             | Evet             | Yok           |
| `POST` | `/drops/:id/claim`    | Claim penceresi açıkken hak talebi      | Evet             | Yok           |
| `POST` | `/admin/drops`        | Yeni drop oluşturma                      | Evet             | Admin         |
| `PUT`  | `/admin/drops/:id`    | Mevcut drop'u güncelleme               | Evet             | Admin         |
| `DELETE`| `/admin/drops/:id`    | Mevcut drop'u silme                     | Evet             | Admin         |

Idempotency yaklaşımı ve transaction yapısı

DropSpot, kritik işlemlerin veri bütünlüğünü sağlamak ve aynı işlemlerin birden fazla kez tekrarlanmasını önlemek için hem uygulama katmanında hem de veritabanı katmanında idempotent ve transactionel yaklaşımlar benimsemiştir.

*   **Idempotency:**
    *   `Claim` işlemleri sırasında, bir kullanıcının belirli bir drop için daha önce hak talebinde bulunup bulunmadığı kontrol edilir. Eğer zaten bir hak talebi mevcutsa, işlem tekrar edilmez ve ilgili hata mesajı döndürülür. Bu sayede aynı işlemin tekrar tekrar çağrılmasına rağmen sistemin durumu değişmez.
    *   Veritabanı şemasında (`prisma/schema.prisma`), `Waitlist` ve `ClaimCode` modellerinde `@@unique([userId, dropId])` kısıtlamaları kullanılarak bir kullanıcının aynı drop'a birden fazla kez katılması veya birden fazla claim kodu alması engellenir. Bu benzersiz kısıtlamalar, veri seviyesinde idempotency'yi garanti eder.
*   **Transaction Yapısı:**
    *   Özellikle `claimDrop` gibi kritik fonksiyonlarda, stok azaltma (`drop.availableStock`'u düşürme) ve yeni bir `ClaimCode` oluşturma gibi birbiriyle ilişkili işlemler `Prisma.$transaction` kullanılarak atomik bir blok içinde yürütülür. Bu, her iki işlemin de başarılı bir şekilde tamamlanmasını veya herhangi bir hata durumunda tüm işlemlerin geri alınmasını (rollback) sağlar. Bu yaklaşım, eşzamanlı istekler altında bile veri tutarlılığını korur ve stok sayımı gibi hassas verilerin yanlışlıkla güncellenmesini önler.

## Seed Üretim Yöntemi ve Proje İçindeki Kullanımı

DropSpot projesi, her adayın kendi projesine özgü bir 'seed' değeri üretmesini gerektirir. Bu seed değeri, sistemin 'priority_score' hesaplamasında veya sıralama mekanizmasında kullanılacaktır. Aşağıda seed üretim adımları ve örnek katsayı hesaplaması bulunmaktadır:

### Seed Üretim Adımları:

1.  **Projeye Başlama Zamanı:** Projeye başladığınız anın tarih ve saatini `YYYYMMDDHHmm` formatında alın. (Örn: `202511121030`)
2.  **GitHub Remote URL'i:** Projenizin GitHub remote URL'ini alın. Bunu terminalde `git config --get remote.origin.url` komutu ile alabilirsiniz.
3.  **İlk Commit Zaman Damgası:** Projenizin ilk commit'inin zaman damgasını (epoch formatında) alın. Bunu terminalde `git log --reverse --format=%ct | head -n1` komutu ile alabilirsiniz.
4.  **Verileri Birleştirme:** Yukarıdaki üç veriyi `remote_url|first_commit_epoch|start_time` formatında birleştirin.
5.  **SHA256 Hash Alma:** Birleştirilmiş verinin SHA256 hash'ini alın ve ilk 10-12 karakterini seed olarak kullanın.

### Seed Örnek Hesaplama (TypeScript - `src/utils/seed.util.ts`):

```typescript
import * as crypto from 'crypto';

export const generateSeed = (remoteUrl: string, firstCommitEpoch: number, startTime: string): string => {
  const raw = `${remoteUrl}|${firstCommitEpoch}|${startTime}`;
  const hash = crypto.createHash('sha256').update(raw).digest('hex');
  return hash.substring(0, 12);
};
```

### Katsayı Üretimi Örneği (TypeScript - `src/utils/seed.util.ts`):

Seed değeri üretildikten sonra, `priority_score` hesaplaması için kullanılacak katsayılar bu seed değerinden türetilir:

```typescript
export const calculateCoefficients = (seed: string) => {
  const A = 7 + (parseInt(seed.substring(0, 2), 16) % 5);
  const B = 13 + (parseInt(seed.substring(2, 4), 16) % 7);
  const C = 3 + (parseInt(seed.substring(4, 6), 16) % 3);
  return { A, B, C };
};
```

### Formül Örneği (aday kendine göre uyarlayabilir):

`priority_score = base + (signup_latency_ms % A) + (account_age_days % B) - (rapid_actions % C)`

Seed ve kullanım şekli projenin `priority.service.ts` dosyasında bulunabilir ve `Waitlist`'e katılan kullanıcıların öncelik skorlarının belirlenmesinde rol oynar.

## Ekran Görüntüleri

Bu bölümde projenin temel özelliklerini gösteren ekran görüntülerini bulabilirsiniz. Lütfen ekran görüntülerinizi `assets/screenshots` dizinine yerleştirin ve aşağıdaki gibi Markdown formatında referans verin:

```markdown
![Ekran Görüntüsü Başlığı](assets/screenshots/ekran-goruntusu-adi.png)
```

_Ekran görüntüleri buraya eklenecektir._

![Admin: Drop Yönetimi](assets/screenshots/admin-drop-yonetimi.png)
![Drop Talebi Sayfası](assets/screenshots/drop-talebi.png)
![Yeni Drop Oluşturma Sayfası](assets/screenshots/yeni-drop-olustur.png)

## Kurulum Adımları

### Ön Gereksinimler

*   Node.js (v18 veya üzeri önerilir)
*   npm (Node.js ile birlikte gelir)
*   Docker ve Docker Compose (PostgreSQL veritabanı için)
*   Git

### 1. Projeyi Klonlama

```bash
git clone https://github.com/Berkayozgun/dropspot.git
cd dropspot
```

### 2. Backend Kurulumu

```bash
cd dropspot-backend
npm install
```

`.env` dosyasını oluşturun ve aşağıdaki değişkenleri ekleyin:

```
DATABASE_URL="postgresql://user:password@localhost:5432/dropspotdb?schema=public"
JWT_SECRET="supersecretjwtkey"
PORT=3000
```

*   `DATABASE_URL`: PostgreSQL veritabanınızın bağlantı dizesi. `docker-compose.yml` kullanıyorsanız `user`, `password`, `dropspotdb` ve `localhost:5432` varsayılan değerlerdir.
*   `JWT_SECRET`: JWT token'ları için gizli anahtar. Güçlü ve rastgele bir dize olmalıdır.
*   `PORT`: Backend uygulamasının çalışacağı port.

Veritabanını başlatın:

```bash
docker-compose up -d postgres
```

Prisma migrasyonlarını çalıştırın ve Prisma Client'ı oluşturun:

```bash
npx prisma migrate dev --name init
```

Backend uygulamasını başlatın:

```bash
npm run dev
```

### 3. Frontend Kurulumu

```bash
cd ../dropspot-frontend
npm install
npm run dev
```

Frontend uygulaması varsayılan olarak `http://localhost:3001` adresinde çalışacaktır.

## CI/CD Pipeline

Bu projede henüz bir CI/CD pipeline (örneğin GitHub Actions) yapılandırması bulunmamaktadır. Ancak, gelecekte otomatik test çalıştırma, kod analizi ve dağıtım süreçleri için bir CI/CD entegrasyonu planlanmaktadır.

## GitHub Süreç Yönetimi Gereksinimleri