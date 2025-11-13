import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 py-10 px-4 sm:px-6 lg:px-8">
      <main className="flex flex-col items-center justify-center text-center max-w-3xl mx-auto">
        <h1 className="text-5xl font-extrabold text-gray-900 dark:text-white mb-4">
          DropSpot'a Hoş Geldiniz!
        </h1>
        <p className="text-xl text-gray-700 dark:text-gray-300 mb-8">
          En yeni ve heyecan verici "drop"ları keşfedin. Güncel etkinlikler, özel ürünler ve kaçırılmaması gereken fırsatlar için takipte kalın.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Link href="/drops" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-full transition-colors duration-200 shadow-lg">
            Drops'ı Keşfet
          </Link>
          <Link href="/about" className="bg-white hover:bg-gray-100 text-blue-600 border border-blue-600 font-semibold py-3 px-8 rounded-full transition-colors duration-200 shadow-lg">
            Hakkımızda
          </Link>
        </div>
      </main>
    </div>
  );
}
