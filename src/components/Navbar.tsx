import { NavLink } from 'react-router-dom';
import { Award, Calendar, Database, Trophy, Users, ChevronDown, Shield, Plus, Pencil } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState } from 'react';

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
                to="/jadwal"
                className={({ isActive }) =>
                  `inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    isActive
                      ? "border-blue-500 text-gray-900"
                      : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                  }`
                }
              >
                Jadwal
              </NavLink>
              <NavLink
                to="/klasemen"
                className={({ isActive }) =>
                  `inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    isActive
                      ? "border-blue-500 text-gray-900"
                      : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                  }`
                }
              >
                Klasemen
              </NavLink>
              <NavLink
                to="/babak-gugur"
                className={({ isActive }) =>
                  `inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    isActive
                      ? "border-blue-500 text-gray-900"
                      : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                  }`
                }
              >
                Babak Gugur
              </NavLink>
              <NavLink
                to="/tim"
                className={({ isActive }) =>
                  `inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    isActive
                      ? "border-blue-500 text-gray-900"
                      : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                  }`
                }
              >
                Tim
              </NavLink>
              <NavLink
                to="/grup"
                className={({ isActive }) =>
                  `inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    isActive
                      ? "border-blue-500 text-gray-900"
                      : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                  }`
                }
              >
                Grup
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
              <NavLink
                to="/firebase-integration"
                className={({ isActive }) =>
                  `inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    isActive
                      ? "border-blue-500 text-gray-900"
                      : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                  }`
                }
              >
                Data
              </NavLink>
            </div>
          </div>
          <div className="sm:hidden flex items-center">
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100"
            >
              <Plus className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile Navigation */}
      <div className="sm:hidden fixed bottom-0 left-0 z-50 w-full h-16 bg-white border-t border-gray-200">
        <div className="grid h-full max-w-lg grid-cols-5 mx-auto">
          <NavLink
            to="/"
            className={({ isActive }) =>
              isActive
                ? "bg-green-600 flex flex-col items-center px-3 py-2 rounded-md text-xs font-medium"
                : "flex flex-col items-center px-3 py-2 rounded-md text-xs font-medium hover:bg-green-600 hover:bg-opacity-75"
            }
          >
            <Award className="h-5 w-5" />
            <span>Beranda</span>
          </NavLink>
          <NavLink
            to="/jadwal"
            className={({ isActive }) =>
              isActive
                ? "bg-green-600 flex flex-col items-center px-3 py-2 rounded-md text-xs font-medium"
                : "flex flex-col items-center px-3 py-2 rounded-md text-xs font-medium hover:bg-green-600 hover:bg-opacity-75"
            }
          >
            <Calendar className="h-5 w-5" />
            <span>Jadwal</span>
          </NavLink>
          <NavLink
            to="/klasemen"
            className={({ isActive }) =>
              isActive
                ? "bg-green-600 flex flex-col items-center px-3 py-2 rounded-md text-xs font-medium"
                : "flex flex-col items-center px-3 py-2 rounded-md text-xs font-medium hover:bg-green-600 hover:bg-opacity-75"
            }
          >
            <Trophy className="h-5 w-5" />
            <span>Klasemen</span>
          </NavLink>
          <NavLink
            to="/babak-gugur"
            className={({ isActive }) =>
              isActive
                ? "bg-green-600 flex flex-col items-center px-3 py-2 rounded-md text-xs font-medium"
                : "flex flex-col items-center px-3 py-2 rounded-md text-xs font-medium hover:bg-green-600 hover:bg-opacity-75"
            }
          >
            <Shield className="h-5 w-5" />
            <span>Gugur</span>
          </NavLink>
          <div className="relative">
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="flex flex-col items-center px-3 py-2 rounded-md text-xs font-medium hover:bg-green-600 hover:bg-opacity-75 w-full"
            >
              <ChevronDown className="h-5 w-5" />
              <span>Lainnya</span>
            </button>
            
            {mobileMenuOpen && (
              <div className="absolute bottom-16 right-0 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                <NavLink
                  to="/tim"
                  className={({ isActive }) =>
                    `block px-4 py-2 text-sm ${isActive ? "bg-green-600 text-white" : "text-gray-700 hover:bg-gray-100"}`
                  }
                >
                  <div className="flex items-center">
                    <Shield className="h-4 w-4 mr-2" />
                    <span>Tim</span>
                  </div>
                </NavLink>
                <NavLink
                  to="/grup"
                  className={({ isActive }) =>
                    `block px-4 py-2 text-sm ${isActive ? "bg-green-600 text-white" : "text-gray-700 hover:bg-gray-100"}`
                  }
                >
                  <div className="flex items-center">
                    <Trophy className="h-4 w-4 mr-2" />
                    <span>Grup</span>
                  </div>
                </NavLink>
                <NavLink
                  to="/manajemen-pemain"
                  className={({ isActive }) =>
                    `block px-4 py-2 text-sm ${isActive ? "bg-green-600 text-white" : "text-gray-700 hover:bg-gray-100"}`
                  }
                >
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-2" />
                    <span>Pemain</span>
                  </div>
                </NavLink>
                <NavLink
                  to="/statistik"
                  className={({ isActive }) =>
                    `block px-4 py-2 text-sm ${isActive ? "bg-green-600 text-white" : "text-gray-700 hover:bg-gray-100"}`
                  }
                >
                  <div className="flex items-center">
                    <Database className="h-4 w-4 mr-2" />
                    <span>Statistik</span>
                  </div>
                </NavLink>
                <NavLink
                  to="/firebase-integration"
                  className={({ isActive }) =>
                    `block px-4 py-2 text-sm ${isActive ? "bg-green-600 text-white" : "text-gray-700 hover:bg-gray-100"}`
                  }
                >
                  <div className="flex items-center">
                    <Database className="h-4 w-4 mr-2" />
                    <span>Data</span>
                  </div>
                </NavLink>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
