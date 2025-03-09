import { NavLink } from 'react-router-dom';
import { Award, Calendar, ChartLine, Database, House, Trophy, Users } from 'lucide-react';

const Navbar = () => {
  return (
    <nav className="bg-gradient-to-r from-green-700 to-blue-800 text-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex-shrink-0 flex items-center">
            <Trophy className="h-8 w-8 mr-2" />
            <span className="font-bold text-xl">Karta Cup V</span>
          </div>
          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-4">
              <NavLink
                to="/"
                className={({ isActive }) =>
                  isActive
                    ? "bg-green-600 px-3 py-2 rounded-md text-sm font-medium"
                    : "px-3 py-2 rounded-md text-sm font-medium hover:bg-green-600 hover:bg-opacity-75"
                }
              >
                <div className="flex items-center">
                  <House className="h-4 w-4 mr-1" />
                  Beranda
                </div>
              </NavLink>
              <NavLink
                to="/grup"
                className={({ isActive }) =>
                  isActive
                    ? "bg-green-600 px-3 py-2 rounded-md text-sm font-medium"
                    : "px-3 py-2 rounded-md text-sm font-medium hover:bg-green-600 hover:bg-opacity-75"
                }
              >
                <div className="flex items-center">
                  <Trophy className="h-4 w-4 mr-1" />
                  Grup
                </div>
              </NavLink>
              <NavLink
                to="/tim"
                className={({ isActive }) =>
                  isActive
                    ? "bg-green-600 px-3 py-2 rounded-md text-sm font-medium"
                    : "px-3 py-2 rounded-md text-sm font-medium hover:bg-green-600 hover:bg-opacity-75"
                }
              >
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-1" />
                  Tim
                </div>
              </NavLink>
              <NavLink
                to="/jadwal"
                className={({ isActive }) =>
                  isActive
                    ? "bg-green-600 px-3 py-2 rounded-md text-sm font-medium"
                    : "px-3 py-2 rounded-md text-sm font-medium hover:bg-green-600 hover:bg-opacity-75"
                }
              >
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  Jadwal
                </div>
              </NavLink>
              <NavLink
                to="/klasemen"
                className={({ isActive }) =>
                  isActive
                    ? "bg-green-600 px-3 py-2 rounded-md text-sm font-medium"
                    : "px-3 py-2 rounded-md text-sm font-medium hover:bg-green-600 hover:bg-opacity-75"
                }
              >
                <div className="flex items-center">
                  <ChartLine className="h-4 w-4 mr-1" />
                  Klasemen
                </div>
              </NavLink>
              <NavLink
                to="/babak-gugur"
                className={({ isActive }) =>
                  isActive
                    ? "bg-green-600 px-3 py-2 rounded-md text-sm font-medium"
                    : "px-3 py-2 rounded-md text-sm font-medium hover:bg-green-600 hover:bg-opacity-75"
                }
              >
                <div className="flex items-center">
                  <Award className="h-4 w-4 mr-1" />
                  Babak Gugur
                </div>
              </NavLink>
              <NavLink
                to="/data-initializer"
                className={({ isActive }) =>
                  isActive
                    ? "bg-green-600 px-3 py-2 rounded-md text-sm font-medium"
                    : "px-3 py-2 rounded-md text-sm font-medium hover:bg-green-600 hover:bg-opacity-75"
                }
              >
                <div className="flex items-center">
                  <Database className="h-4 w-4 mr-1" />
                  Data
                </div>
              </NavLink>
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      <div className="md:hidden border-t border-green-600">
        <div className="grid grid-cols-7 px-2 pt-2 pb-3">
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
            to="/grup"
            className={({ isActive }) =>
              isActive
                ? "bg-green-600 flex flex-col items-center px-3 py-2 rounded-md text-xs font-medium"
                : "flex flex-col items-center px-3 py-2 rounded-md text-xs font-medium hover:bg-green-600 hover:bg-opacity-75"
            }
          >
            <Trophy className="h-5 w-5" />
            <span>Grup</span>
          </NavLink>
          <NavLink
            to="/tim"
            className={({ isActive }) =>
              isActive
                ? "bg-green-600 flex flex-col items-center px-3 py-2 rounded-md text-xs font-medium"
                : "flex flex-col items-center px-3 py-2 rounded-md text-xs font-medium hover:bg-green-600 hover:bg-opacity-75"
            }
          >
            <Users className="h-5 w-5" />
            <span>Tim</span>
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
            <ChartLine className="h-5 w-5" />
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
            <Award className="h-5 w-5" />
            <span>Gugur</span>
          </NavLink>
          <NavLink
            to="/data-initializer"
            className={({ isActive }) =>
              isActive
                ? "bg-green-600 flex flex-col items-center px-3 py-2 rounded-md text-xs font-medium"
                : "flex flex-col items-center px-3 py-2 rounded-md text-xs font-medium hover:bg-green-600 hover:bg-opacity-75"
            }
          >
            <Database className="h-5 w-5" />
            <span>Data</span>
          </NavLink>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
