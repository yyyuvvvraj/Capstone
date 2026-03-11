import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { 
  LayoutDashboard, 
  Mail, 
  FileText, 
  ShieldAlert, 
  LogOut, 
  Sun, 
  Moon,
  User
} from 'lucide-react';

const Layout = () => {
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navItems = [
        { path: '/', icon: <LayoutDashboard size={20} />, label: 'Overview', role: 'user' },
        { path: '/mail', icon: <Mail size={20} />, label: 'Email', role: 'user' },
        { path: '/docs', icon: <FileText size={20} />, label: 'Documents', role: 'user' },
    ];

    if (user?.role === 'admin') {
        navItems.push({ path: '/admin', icon: <ShieldAlert size={20} />, label: 'Security Admin', role: 'admin' });
    }

    return (
        <div className="flex h-screen bg-background text-foreground transition-colors duration-300">
            {/* Sidebar */}
            <aside className="w-64 border-r border-border bg-card/50 backdrop-blur-xl flex flex-col">
                <div className="p-6 flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20">
                        <ShieldAlert size={24} />
                    </div>
                    <span className="font-bold text-xl tracking-tight">Nexus OS</span>
                </div>

                <nav className="flex-1 px-4 py-4 space-y-2">
                    {navItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                                location.pathname === item.path
                                    ? 'bg-primary text-primary-foreground shadow-md shadow-primary/10'
                                    : 'hover:bg-accent text-muted-foreground hover:text-foreground'
                            }`}
                        >
                            {item.icon}
                            <span className="font-medium">{item.label}</span>
                        </Link>
                    ))}
                </nav>

                <div className="p-4 border-t border-border space-y-2">
                    <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-accent/50">
                        <User size={20} className="text-muted-foreground" />
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold truncate">{user?.username}</p>
                            <p className="text-xs text-muted-foreground capitalize">{user?.role}</p>
                        </div>
                    </div>
                    <button
                        onClick={toggleTheme}
                        className="flex items-center gap-3 w-full px-4 py-3 rounded-xl hover:bg-accent transition-colors"
                    >
                        {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                        <span className="font-medium">{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
                    </button>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-4 py-3 rounded-xl hover:bg-destructive/10 text-destructive transition-colors"
                    >
                        <LogOut size={20} />
                        <span className="font-medium">Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto bg-background/50 relative">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />
                <div className="p-8 relative">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default Layout;
