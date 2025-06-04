import { BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-100 p-6">
      <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-10 flex flex-col items-center">
        <BookOpen className="h-20 w-20 text-primary-500 mb-4" />
        <h1 className="text-4xl font-bold text-primary-700 mb-2">404 - Page Not Found</h1>
        <p className="text-lg text-gray-700 mb-6 text-center max-w-md">
          Oops! Halaman yang kamu cari tidak ditemukan.<br />
          Mungkin kamu salah ketik alamat, atau halaman ini sudah dipindahkan.
        </p>
        <Link
          to="/"
          className="mt-2 px-6 py-3 bg-primary-600 text-white rounded-xl font-semibold shadow hover:bg-primary-700 transition-all"
        >
          Kembali ke Dashboard
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;