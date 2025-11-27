export default function HomePage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white rounded-lg shadow p-6 max-w-md w-full text-center space-y-4">
        <h1 className="text-2xl font-bold text-black">Libro de Reseñas</h1>
        <p className="text-sm text-gray-600">
          Regístrate, inicia sesión y comparte reseñas de tus libros favoritos.
        </p>
        <div className="flex justify-center gap-3 text-sm">
          <a
            href="/signup"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-800"
          >
            Registrarse
          </a>
          <a
            href="/login"
            className="border border-gray-300 text-black px-4 py-2 rounded hover:bg-gray-100"
          >
            Iniciar sesión
          </a>
        </div>
      </div>
    </main>
  );
}
