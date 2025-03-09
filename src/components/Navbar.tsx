import { NavLink } from 'react-router-dom';
import { Award, Calendar, Database, Trophy, Users, ChevronDown, Shield, Plus, Pencil } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Efek scroll untuk animasi navbar
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <nav className={`${scrolled ? 'bg-gradient-to-r from-green-800 to-green-600 shadow-lg' : 'bg-gradient-to-r from-green-700 to-green-500'} transition-all duration-300`}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="flex items-center">
                <Shield className="h-8 w-8 text-yellow-400 mr-2" />
                <span className="text-xl font-bold text-white tracking-wider">KARTA CUP</span>
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-1">
              <NavLink
                to="/"
                className={({ isActive }) =>
                  `inline-flex items-center px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-green-900 text-white shadow-md transform scale-105"
                      : "text-green-100 hover:bg-green-600 hover:text-white"
                  }`
                }
              >
                <Award className="h-4 w-4 mr-1" />
                Beranda
              </NavLink>
              <NavLink
                to="/jadwal"
                className={({ isActive }) =>
                  `inline-flex items-center px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-green-900 text-white shadow-md transform scale-105"
                      : "text-green-100 hover:bg-green-600 hover:text-white"
                  }`
                }
              >
                <Calendar className="h-4 w-4 mr-1" />
                Jadwal
              </NavLink>
              <NavLink
                to="/klasemen"
                className={({ isActive }) =>
                  `inline-flex items-center px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-green-900 text-white shadow-md transform scale-105"
                      : "text-green-100 hover:bg-green-600 hover:text-white"
                  }`
                }
              >
                <Trophy className="h-4 w-4 mr-1" />
                Klasemen
              </NavLink>
              <NavLink
                to="/babak-gugur"
                className={({ isActive }) =>
                  `inline-flex items-center px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-green-900 text-white shadow-md transform scale-105"
                      : "text-green-100 hover:bg-green-600 hover:text-white"
                  }`
                }
              >
                <Shield className="h-4 w-4 mr-1" />
                Babak Gugur
              </NavLink>
              <NavLink
                to="/tim"
                className={({ isActive }) =>
                  `inline-flex items-center px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-green-900 text-white shadow-md transform scale-105"
                      : "text-green-100 hover:bg-green-600 hover:text-white"
                  }`
                }
              >
                <Shield className="h-4 w-4 mr-1" />
                Tim
              </NavLink>
              <NavLink
                to="/grup"
                className={({ isActive }) =>
                  `inline-flex items-center px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-green-900 text-white shadow-md transform scale-105"
                      : "text-green-100 hover:bg-green-600 hover:text-white"
                  }`
                }
              >
                <Trophy className="h-4 w-4 mr-1" />
                Grup
              </NavLink>
              <NavLink
                to="/manajemen-pemain"
                className={({ isActive }) =>
                  `inline-flex items-center px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-green-900 text-white shadow-md transform scale-105"
                      : "text-green-100 hover:bg-green-600 hover:text-white"
                  }`
                }
              >
                <Users className="h-4 w-4 mr-1" />
                Pemain
              </NavLink>
              <NavLink
                to="/statistik"
                className={({ isActive }) =>
                  `inline-flex items-center px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-green-900 text-white shadow-md transform scale-105"
                      : "text-green-100 hover:bg-green-600 hover:text-white"
                  }`
                }
              >
                <Database className="h-4 w-4 mr-1" />
                Statistik
              </NavLink>
              <NavLink
                to="/firebase-integration"
                className={({ isActive }) =>
                  `inline-flex items-center px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-green-900 text-white shadow-md transform scale-105"
                      : "text-green-100 hover:bg-green-600 hover:text-white"
                  }`
                }
              >
                <Database className="h-4 w-4 mr-1" />
                Data
              </NavLink>
            </div>
          </div>
          <div className="sm:hidden flex items-center">
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md text-white hover:bg-green-600"
            >
              <Plus className={`h-6 w-6 transition-transform duration-300 ${mobileMenuOpen ? 'rotate-45' : ''}`} />
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile Navigation */}
      <div className="sm:hidden fixed bottom-0 left-0 z-50 w-full h-16 bg-gradient-to-r from-green-800 to-green-600 border-t border-green-900 shadow-lg">
        <div className="grid h-full max-w-lg grid-cols-5 mx-auto">
          <NavLink
            to="/"
            className={({ isActive }) =>
              isActive
                ? "bg-green-900 flex flex-col items-center justify-center text-white"
                : "flex flex-col items-center justify-center text-green-100 hover:bg-green-700"
            }
          >
            <Award className="h-5 w-5" />
            <span className="text-xs mt-1">Beranda</span>
          </NavLink>
          <NavLink
            to="/jadwal"
            className={({ isActive }) =>
              isActive
                ? "bg-green-900 flex flex-col items-center justify-center text-white"
                : "flex flex-col items-center justify-center text-green-100 hover:bg-green-700"
            }
          >
            <Calendar className="h-5 w-5" />
            <span className="text-xs mt-1">Jadwal</span>
          </NavLink>
          <NavLink
            to="/klasemen"
            className={({ isActive }) =>
              isActive
                ? "bg-green-900 flex flex-col items-center justify-center text-white"
                : "flex flex-col items-center justify-center text-green-100 hover:bg-green-700"
            }
          >
            <Trophy className="h-5 w-5" />
            <span className="text-xs mt-1">Klasemen</span>
          </NavLink>
          <NavLink
            to="/babak-gugur"
            className={({ isActive }) =>
              isActive
                ? "bg-green-900 flex flex-col items-center justify-center text-white"
                : "flex flex-col items-center justify-center text-green-100 hover:bg-green-700"
            }
          >
            <Shield className="h-5 w-5" />
            <span className="text-xs mt-1">Gugur</span>
          </NavLink>
          <div className="relative">
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="flex flex-col items-center justify-center w-full h-full text-green-100 hover:bg-green-700"
            >
              <ChevronDown className={`h-5 w-5 transition-transform duration-300 ${mobileMenuOpen ? 'rotate-180' : ''}`} />
              <span className="text-xs mt-1">Lainnya</span>
            </button>
            
            {mobileMenuOpen && (
              <div className="absolute bottom-16 right-0 w-48 bg-green-800 rounded-t-lg shadow-lg py-2 border border-green-900 border-b-0">
                <NavLink
                  to="/tim"
                  className={({ isActive }) =>
                    `block px-4 py-2 text-sm ${isActive ? "bg-green-900 text-white" : "text-green-100 hover:bg-green-700"}`
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
                    `block px-4 py-2 text-sm ${isActive ? "bg-green-900 text-white" : "text-green-100 hover:bg-green-700"}`
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
                    `block px-4 py-2 text-sm ${isActive ? "bg-green-900 text-white" : "text-green-100 hover:bg-green-700"}`
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
                    `block px-4 py-2 text-sm ${isActive ? "bg-green-900 text-white" : "text-green-100 hover:bg-green-700"}`
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
                    `block px-4 py-2 text-sm ${isActive ? "bg-green-900 text-white" : "text-green-100 hover:bg-green-700"}`
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
