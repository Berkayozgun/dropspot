export default function AdminDropsPage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Admin: Drop Yönetimi</h1>
      <p>Burada drop'lar için admin CRUD işlemleri (oluşturma, okuma, güncelleme, silme) yapılacak.</p>
      <button className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded mt-4">
        Yeni Drop Oluştur
      </button>
    </div>
  );
}
