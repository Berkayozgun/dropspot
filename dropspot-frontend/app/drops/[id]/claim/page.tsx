export default function ClaimPage({ params }: { params: { id: string } }) {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Claim Süreci: {params.id}</h1>
      <p>Burada kullanıcının drop'u claim etme süreci yönetilecek.</p>
      <button className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mt-4">
        Claim Drop
      </button>
    </div>
  );
}
