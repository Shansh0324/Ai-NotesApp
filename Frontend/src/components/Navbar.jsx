import { useContext, useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LogOut, BookText, User as UserIcon, Settings, Menu, X } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setDropdownOpen(false);
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Cloudinary URLs are full https:// paths, use directly
  const avatarUrl = user?.profilePic || null;

  return (
    <nav className="sticky top-4 z-50 mx-auto max-w-5xl px-4 sm:px-6 mb-8 w-11/12 lg:w-full">
      <div className="rounded-full backdrop-blur-lg bg-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/40 px-6 py-3 transition-all duration-300">
        <div className="flex justify-between items-center h-10">
          
          {/* Logo — solid color, no clipping */}
          <Link to="/" className="flex items-center space-x-2 group shrink-0">
            <div className="bg-primary-50 p-1.5 rounded-full group-hover:bg-primary-100 transition-colors">
               <BookText className="w-6 h-6 text-primary-600" />
            </div>
            <span className="text-xl font-bold tracking-tight text-primary-600">NotesApp</span>
          </Link>

          {/* Desktop Right Side */}
          <div className="hidden sm:flex items-center space-x-6">
            {user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 hover:opacity-80 transition-opacity focus:outline-none"
                >
                  <div className="w-10 h-10 rounded-full border-2 border-primary-100 overflow-hidden bg-gray-100 flex items-center justify-center shrink-0">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-primary-600 font-bold text-lg">
                        {user.name?.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden transform opacity-100 scale-100 transition-all origin-top-right">
                    <div className="px-4 py-3 border-b border-gray-50 bg-gray-50/50">
                      <p className="text-sm font-semibold text-gray-900 truncate">{user.name}</p>
                      <p className="text-xs text-gray-500 truncate">{user.email}</p>
                      {!user.isVerified && (
                        <span className="inline-block mt-1 px-2 py-0.5 bg-amber-100 text-amber-700 text-[10px] rounded-full font-medium border border-amber-200">Unverified</span>
                      )}
                    </div>
                    <div className="py-1">
                      <Link to="/profile" className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-600 transition-colors">
                        <UserIcon className="w-4 h-4 mr-3" /> Profile Settings
                      </Link>
                      <button onClick={handleLogout} className="w-full flex items-center px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors text-left">
                        <LogOut className="w-4 h-4 mr-3" /> Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link to="/login" className="px-5 py-2 text-gray-600 hover:text-primary-600 font-semibold transition-colors rounded-full hover:bg-gray-50">Login</Link>
                <Link to="/signup" className="px-5 py-2 bg-gradient-to-r from-primary-600 to-primary-500 text-white rounded-full hover:shadow-lg hover:shadow-primary-500/30 font-semibold transition-all transform hover:-translate-y-0.5">Sign Up</Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="sm:hidden flex items-center">
            {user && (
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-gray-500 hover:text-primary-600">
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            )}
            {!user && (
              <Link to="/login" className="text-sm font-semibold text-primary-600">Login</Link>
            )}
          </div>
        </div>

        {mobileMenuOpen && user && (
          <div className="sm:hidden absolute top-full mt-2 left-0 w-full bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden transition-all z-40">
            <div className="px-4 py-4 border-b border-gray-50 bg-gray-50/50 flex items-center gap-3">
               <div className="w-10 h-10 rounded-full overflow-hidden bg-primary-100 flex items-center justify-center text-primary-600 font-bold shrink-0">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    user.name?.charAt(0).toUpperCase()
                  )}
               </div>
               <div className="min-w-0">
                  <p className="font-semibold text-gray-900 truncate">{user.name}</p>
                  <p className="text-xs text-gray-500 truncate">{user.email}</p>
               </div>
            </div>
            <div className="py-2">
              <Link to="/profile" className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50">
                <Settings className="w-4 h-4 mr-3" /> Profile Settings
              </Link>
              <button onClick={handleLogout} className="w-full flex items-center px-4 py-3 text-sm text-red-600 hover:bg-red-50 text-left">
                <LogOut className="w-4 h-4 mr-3" /> Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
