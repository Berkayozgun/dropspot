import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="text-center mb-14">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-4">
            DropSpot Nedir?
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Sınırlı stoklu ürün lansmanları için tasarlanmış, adil erişim ve yüksek
            trafik anlarında tutarlı deneyim sunan bir drop platformudur.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 mb-12">
          <section className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
            <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center text-xl font-bold mb-4">
              1
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Sınırlı Stok Drop&apos;ları</h2>
            <p className="text-gray-600 leading-relaxed">
              Her drop belirli bir stok, yayın tarihi ve claim penceresi ile yayınlanır.
              Stok tükendiğinde veya pencere kapandığında talep alınmaz.
            </p>
          </section>

          <section className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
            <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center text-xl font-bold mb-4">
              2
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Adil Bekleme Listesi</h2>
            <p className="text-gray-600 leading-relaxed">
              Kullanıcılar claim penceresi açılmadan önce waitlist&apos;e katılır. Her kullanıcı
              aynı drop için yalnızca bir kez listede yer alabilir.
            </p>
          </section>

          <section className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
            <div className="w-12 h-12 rounded-xl bg-violet-100 text-violet-700 flex items-center justify-center text-xl font-bold mb-4">
              3
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Öncelik Puanı Algoritması</h2>
            <p className="text-gray-600 leading-relaxed">
              Waitlist&apos;e katılımda deterministik bir seed ve kullanıcı metriklerinden türetilen
              priority score hesaplanır. Amaç, yoğun talep anlarında daha adil sıralama sağlamaktır.
            </p>
          </section>

          <section className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
            <div className="w-12 h-12 rounded-xl bg-green-100 text-green-700 flex items-center justify-center text-xl font-bold mb-4">
              4
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Hak Talebi (Claim)</h2>
            <p className="text-gray-600 leading-relaxed">
              Claim penceresi açıldığında waitlist&apos;teki kullanıcılar drop&apos;u talep edebilir.
              Başarılı claim sonucunda benzersiz bir claim kodu üretilir ve stok atomik olarak düşülür.
            </p>
          </section>
        </div>

        <div className="bg-indigo-600 rounded-2xl shadow-xl p-8 sm:p-10 text-center text-white">
          <h2 className="text-2xl font-bold mb-3">Hazır mısınız?</h2>
          <p className="text-indigo-100 mb-6 max-w-xl mx-auto">
            Aktif drop&apos;ları inceleyin, bekleme listesine katılın ve claim penceresinde hak talebinde bulunun.
          </p>
          <Link
            href="/drops"
            className="inline-block bg-white text-indigo-700 font-semibold py-3 px-8 rounded-full hover:bg-indigo-50 transition-colors duration-200 shadow-md"
          >
            Drop&apos;ları Keşfet
          </Link>
        </div>
      </div>
    </div>
  );
}
