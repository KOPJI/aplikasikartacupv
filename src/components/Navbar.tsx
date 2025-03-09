import { NavLink } from 'react-router-dom';
import { Award, Calendar, ChartLine, Database, House, Trophy, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="text-xl font-bold text-gray-800">
                KARTA CUP
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <NavLink
                to="/"
                className={({ isActive }) =>
                  `inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    isActive
                      ? "border-blue-500 text-gray-900"
                      : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                  }`
                }
              >
                Beranda
              </NavLink>
              <NavLink
                to="/manajemen-pemain"
                className={({ isActive }) =>
                  `inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    isActive
                      ? "border-blue-500 text-gray-900"
                      : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                  }`
                }
              >
                Manajemen Pemain
              </NavLink>
              <NavLink
                to="/statistik"
                className={({ isActive }) =>
                  `inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    isActive
                      ? "border-blue-500 text-gray-900"
                      : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                  }`
                }
              >
                Statistik
              </NavLink>
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile Navigation */}
      <div className="sm:hidden fixed bottom-0 left-0 z-50 w-full h-16 bg-white border-t border-gray-200">
        <div className="grid h-full max-w-lg grid-cols-4 mx-auto">
          <NavLink
            to="/"
            className={({ isActive }) =>
              isActive
                ? "bg-green-600 flex flex-col items-center px-3 py-2 rounded-md text-xs font-medium"
                : "flex flex-col items-center px-3 py-2 rounded-md text-xs font-medium hover:bg-green-600 hover:bg-opacity-75"
            }
          >
            <House className="h-5 w-5" />
            <span>Beranda</span>
          </NavLink>
          <NavLink
            to="/statistik"
            className={({ isActive }) =>
              isActive
                ? "bg-green-600 flex flex-col items-center px-3 py-2 rounded-md text-xs font-medium"
                : "flex flex-col items-center px-3 py-2 rounded-md text-xs font-medium hover:bg-green-600 hover:bg-opacity-75"
            }
          >
            <ChartLine className="h-5 w-5" />
            <span>Statistik</span>
          </NavLink>
          <NavLink
            to="/firebase-integration"
            className={({ isActive }) =>
              isActive
                ? "bg-green-600 flex flex-col items-center px-3 py-2 rounded-md text-xs font-medium"
                : "flex flex-col items-center px-3 py-2 rounded-md text-xs font-medium hover:bg-green-600 hover:bg-opacity-75"
            }
          >
            <Database className="h-5 w-5" />
            <span>Data</span>
          </NavLink>
          <NavLink
            to="/manajemen-pemain"
            className={({ isActive }) =>
              isActive
                ? "bg-green-600 flex flex-col items-center px-3 py-2 rounded-md text-xs font-medium"
                : "flex flex-col items-center px-3 py-2 rounded-md text-xs font-medium hover:bg-green-600 hover:bg-opacity-75"
            }
          >
            <Users className="h-5 w-5" />
            <span>Manajemen Pemain</span>
          </NavLink>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
