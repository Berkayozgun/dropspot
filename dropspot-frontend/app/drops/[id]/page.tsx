export default function DropDetailPage({ params }: { params: { id: string } }) {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Drop Detayı: {params.id}</h1>
      <p>Burada seçilen drop'un detayları gösterilecek.</p>
      <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-4">
        Join Waitlist
      </button>
    </div>
  );
}
