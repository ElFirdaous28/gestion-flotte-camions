import { TriangleAlert } from 'lucide-react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="text-center">
      <div className="flex justify-center mb-6">
        <TriangleAlert className="w-28 h-28 text-primary" />
      </div>

      <h1 className="text-8xl md:text-9xl font-black text-white leading-none">404</h1>

      <h2 className="mt-4 text-3xl md:text-4xl font-bold text-gray-200">Page Not Found</h2>

      <div className="mt-10">
        <Link
          to="/"
          className="bg-primary text-white px-8 py-3 rounded-full font-semibold text-lg hover:bg-primary/40 transition-colors shadow-lg"
        >
          Go Back Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
