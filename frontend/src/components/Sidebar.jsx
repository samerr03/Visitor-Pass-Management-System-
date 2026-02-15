import logo from '../assets/logo-dark.svg';
import { Link, useLocation } from 'react-router-dom';
import { useContext } from 'react';
import AuthContext from '../context/AuthContext';

const Sidebar = () => {
    const { user, logout } = useContext(AuthContext);
    const location = useLocation();

    const isActive = (path) => location.pathname === path;

    return (
        <div className="w-64 bg-gray-900 text-white min-h-screen flex flex-col">
            <div className="p-6 border-b border-gray-800 flex flex-col items-start">
                <img src={logo} alt="ZenZ" className="h-12 mb-3 w-auto" />
                <p className="text-sm text-gray-400">Hello, {user?.name}</p>
            </div>

            <nav className="flex-1 p-4 space-y-2">
                {user?.role === 'admin' && (
                    <Link
                        to="/admin"
                        className={`block px-4 py-3 rounded transition-colors ${isActive('/admin') ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-800'
                            }`}
                    >
                        Admin Dashboard
                    </Link>
                )}

                {user?.role === 'security' && (
                    <Link
                        to="/security"
                        className={`block px-4 py-3 rounded transition-colors ${isActive('/security') ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-800'
                            }`}
                    >
                        Security Dashboard
                    </Link>
                )}

                <div className="pt-4 pb-2">
                    <p className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">My Account</p>
                    <Link
                        to="/profile"
                        className={`block px-4 py-3 rounded transition-colors ${isActive('/profile') ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-800'
                            }`}
                    >
                        My Profile
                    </Link>
                    <Link
                        to="/my-id"
                        className={`block px-4 py-3 rounded transition-colors ${isActive('/my-id') ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-800'
                            }`}
                    >
                        My ID Card
                    </Link>
                </div>
            </nav>

            <div className="p-4 border-t border-gray-800">
                <button
                    onClick={logout}
                    className="w-full bg-red-600 text-white py-2 rounded hover:bg-red-700 transition-colors"
                >
                    Logout
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
