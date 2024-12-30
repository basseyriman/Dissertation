import Link from "next/link";
import { Brain, Activity, BarChart2 } from "lucide-react";
import { usePathname } from "next/navigation";

export function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <Brain className="h-8 w-8 text-indigo-600" />
              <span className="text-xl font-bold text-gray-900">AlzDetect</span>
            </Link>
          </div>
          <div className="flex space-x-8">
            <Link 
              href="/" 
              className={`inline-flex items-center px-1 pt-1 text-sm font-medium border-b-2 transition-colors
                ${pathname === '/' ? 'text-indigo-600 border-indigo-600' : 'text-gray-500 border-transparent hover:text-gray-900 hover:border-gray-300'}`}
            >
              <Activity className="h-4 w-4 mr-2" />
              Analyze Scan
            </Link>
            <Link 
              href="/results" 
              className={`inline-flex items-center px-1 pt-1 text-sm font-medium border-b-2 transition-colors
                ${pathname === '/results' ? 'text-indigo-600 border-indigo-600' : 'text-gray-500 border-transparent hover:text-gray-900 hover:border-gray-300'}`}
            >
              <BarChart2 className="h-4 w-4 mr-2" />
              Results
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
} 