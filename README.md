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
// ... User, Drop, Waitlist, ClaimCode modellerinin ve Role enum'ının detaylı şeması buraya gelecek ...
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