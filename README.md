\# DropSpot – Sınırlı Stok ve Bekleme Listesi Platformu

\## 1. Proje Başlangıç ve Seed Bilgileri (Alpaco Gereksinimi)

| Bilgi Alanı | Değer |  
| :--- | :--- |  
| Projeye Başlama Zamanı (YYYYMMDDHHmm) | \*\*202511101749\*\* |  
| GitHub Remote URL | \*\*https://github.com/BerkayOzgun/dropspot.git\*\* |  
| İlk Commit Epoch Time (saniye) | \*\*\[EPOCH BURAYA GELECEK\]\*\* |  
| Seed Hash (SHA256 İlk 12 Karakter) | \*\*\[SEED HASH BURAYA GELECEK\]\*\* |

\### Priority Score Katsayıları  
\* A = \[A DEĞERİ\]  
\* B = \[B DEĞERİ\]  
\* C = \[C DEĞERİ\]

\---  
\## 2. Kurulum ve Çalıştırma  
\*(Bu kısım şimdilik kurulum talimatlarını içerir)\*

\### Backend (Node.js/Express)  
1\. \`cd dropspot-backend\`  
2\. \`npm install\`  
3\. \`docker-compose up -d\` (Ana klasörden çalıştır)  
4\. \`npx prisma migrate dev\`  
5\. \`npm run dev\`

\### Frontend (Next.js)  
1\. \`cd dropspot-frontend\`  
2\. \`npm install\`  
3\. \`npm run dev\`