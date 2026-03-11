import React, { useState, useEffect } from 'react';
import { 
  Users, 
  ShieldAlert, 
  Activity, 
  TrendingUp, 
  Search, 
  Filter, 
  MoreHorizontal,
  ArrowRight,
  ShieldCheck,
  Zap,
  Clock,
  ChevronLeft
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

const AdminDashboard = () => {
    const [view, setView] = useState('overview'); // overview, users, alerts
    const [stats, setStats] = useState({ totalUsers: 0, activeSessions: 0, alertsToday: 0, avgTrustScore: 88 });
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    const [selectedUser, setSelectedUser] = useState(null);
    const [alerts, setAlerts] = useState([]);
    
    // Mock chart data to render charts cleanly
    const chartData = [
        { name: '08:00', score: 85 },
        { name: '10:00', score: 82 },
        { name: '12:00', score: 88 },
        { name: '14:00', score: 90 },
        { name: '16:00', score: 87 },
        { name: '18:00', score: 85 },
    ];

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const headers = { 'Authorization': `Bearer ${token}` };
            
            const [statsRes, usersRes, alertsRes] = await Promise.all([
                fetch('http://localhost:5000/api/admin/stats', { headers }),
                fetch('http://localhost:5000/api/admin/users', { headers }),
                fetch('http://localhost:5000/api/admin/alerts', { headers })
            ]);
            
            if (statsRes.ok) setStats(await statsRes.json());
            if (usersRes.ok) setUsers(await usersRes.json());
            if (alertsRes.ok) setAlerts(await alertsRes.json());
            
        } catch (err) {
            console.error("Error fetching dashboard data:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
        const interval = setInterval(fetchDashboardData, 10000); // refresh every 10s
        return () => clearInterval(interval);
    }, []);

    const killSession = async (sessionId) => {
        if (!confirm('Are you sure you want to terminate this session?')) return;
        
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`http://localhost:5000/api/admin/sessions/${sessionId}/kill`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (res.ok) {
                alert('Session terminated successfully.');
                setStats(prev => ({ ...prev, activeSessions: Math.max(0, prev.activeSessions - 1) }));
                fetchDashboardData();
            } else {
                alert('Failed to terminate session.');
            }
        } catch (err) {
            console.error(err);
        }
    };

    const renderAlerts = () => (
        <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
            <h2 className="text-2xl font-bold tracking-tight">System Security Alerts</h2>
            <div className="grid gap-4">
                {alerts.map((alert) => (
                    <div key={alert.id} className="bg-card border border-border p-5 rounded-2xl flex items-center justify-between group hover:border-destructive/30 transition-all">
                        <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-xl ${
                                alert.severity === 'high' ? 'bg-rose-500/10 text-rose-500' : 
                                alert.severity === 'medium' ? 'bg-amber-500/10 text-amber-500' : 'bg-blue-500/10 text-blue-500'
                            }`}>
                                <ShieldAlert size={20} />
                            </div>
                            <div>
                                <h4 className="font-bold">{alert.reason}</h4>
                                <p className="text-sm text-muted-foreground">User: <span className="text-foreground">{alert.username}</span> • {new Date(alert.timestamp).toLocaleString()}</p>
                            </div>
                        </div>
                        <button className="px-4 py-2 bg-accent hover:bg-destructive hover:text-white rounded-xl text-xs font-bold transition-all">
                            Investigate
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderProfile = () => (
        <div className="space-y-8 animate-in zoom-in-95 duration-500">
            <button onClick={() => setSelectedUser(null)} className="text-sm font-bold text-primary flex items-center gap-1 hover:underline">
                <ChevronLeft size={16} /> Back to Users
            </button>
            <div className="flex justify-between items-start">
                <div className="flex items-center gap-6">
                    <div className="w-24 h-24 rounded-3xl bg-primary flex items-center justify-center text-primary-foreground text-4xl font-bold shadow-2xl shadow-primary/20">
                        {selectedUser.username[0].toUpperCase()}
                    </div>
                    <div>
                        <h1 className="text-4xl font-bold">{selectedUser.username}</h1>
                        <p className="text-muted-foreground mt-1">Employee ID: NX-{selectedUser.id}102 • Joined Mar 2026</p>
                        <div className="flex gap-2 mt-4">
                            <span className="px-3 py-1 bg-emerald-500/10 text-emerald-500 rounded-full text-xs font-bold ring-1 ring-emerald-500/20">Biometric Verified</span>
                            <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-bold ring-1 ring-primary/20">Standard Access</span>
                        </div>
                    </div>
                </div>
                <div className="bg-card border border-border p-6 rounded-3xl text-center">
                    <p className="text-sm text-muted-foreground font-medium mb-1">Current Trust Score</p>
                    <h2 className="text-5xl font-black text-primary">85%</h2>
                    <p className="text-xs text-emerald-500 font-bold mt-2 flex items-center justify-center gap-1">
                        <TrendingUp size={12} /> +2.4% vs last week
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-card border border-border rounded-3xl p-6 shadow-sm">
                    <h3 className="font-bold mb-4 flex items-center gap-2 font-mono text-sm uppercase tracking-widest text-muted-foreground">
                        <Activity size={16} /> Typing Speed Consistency
                    </h3>
                    <div className="h-48 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData}>
                                <Line type="monotone" dataKey="score" stroke="hsl(var(--primary))" strokeWidth={3} dot={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                <div className="bg-card border border-border rounded-3xl p-6 shadow-sm">
                    <h3 className="font-bold mb-4 flex items-center gap-2 font-mono text-sm uppercase tracking-widest text-muted-foreground">
                        <Zap size={16} /> Active Session Control
                    </h3>
                    <div className="space-y-4">
                        <div className="p-4 bg-accent/30 rounded-2xl flex items-center justify-between border border-border">
                            <div>
                                <p className="font-bold text-sm">Windows 11 • Chrome 122</p>
                                <p className="text-xs text-muted-foreground">IP: 192.168.1.105 • London, UK</p>
                            </div>
                            <button onClick={() => killSession(1)} className="p-2 text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors">
                                <ShieldAlert size={20} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderOverview = () => (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Total Users', value: stats.totalUsers, icon: <Users />, color: 'text-blue-500', bg: 'bg-blue-500/10' },
                    { label: 'Active Sessions', value: stats.activeSessions, icon: <Zap />, color: 'text-amber-500', bg: 'bg-amber-500/10' },
                    { label: 'Threat Alerts', value: stats.alertsToday, icon: <ShieldAlert />, color: 'text-rose-500', bg: 'bg-rose-500/10' },
                    { label: 'Avg Trust Score', value: `${stats.avgTrustScore}%`, icon: <TrendingUp />, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
                ].map((s, i) => (
                    <div key={i} className="bg-card border border-border p-6 rounded-3xl shadow-sm">
                        <div className={`w-12 h-12 rounded-2xl ${s.bg} ${s.color} flex items-center justify-center mb-4`}>
                            {s.icon}
                        </div>
                        <p className="text-sm text-muted-foreground font-medium">{s.label}</p>
                        <h3 className="text-3xl font-bold mt-1">{s.value}</h3>
                    </div>
                ))}
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-card border border-border rounded-3xl p-6 shadow-sm">
                    <div className="flex justify-between items-center mb-8">
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <Activity className="text-primary" size={20} />
                            Behavioral Integrity Flow
                        </h2>
                        <select className="bg-accent/50 border-none rounded-xl text-xs font-bold px-3 py-2 outline-none">
                            <option>Last 24 Hours</option>
                            <option>Last 7 Days</option>
                        </select>
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} domain={[0, 100]} />
                                <Tooltip 
                                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '16px', border: '1px solid hsl(var(--border))' }}
                                />
                                <Area type="monotone" dataKey="score" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorScore)" strokeWidth={3} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-card border border-border rounded-3xl p-6 shadow-sm flex flex-col">
                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                        <ShieldCheck className="text-emerald-500" size={20} />
                        Active Risks
                    </h2>
                    <div className="space-y-4 flex-1 overflow-auto">
                        {stats.alertsToday === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-8">
                                <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mb-4">
                                    <ShieldCheck className="text-emerald-500" size={32} />
                                </div>
                                <p className="font-medium">No major threats detected today.</p>
                            </div>
                        ) : (
                            alerts.slice(0, 3).map(a => (
                                <div key={a.id} className="p-3 bg-rose-500/5 border-l-4 border-rose-500 rounded-r-xl">
                                    <p className="text-xs font-bold text-rose-500 uppercase">{a.severity} risk</p>
                                    <p className="text-sm font-medium mt-1">{a.reason}</p>
                                </div>
                            ))
                        )}
                    </div>
                    <button onClick={() => setView('alerts')} className="mt-6 w-full py-3 bg-accent hover:bg-accent/70 rounded-2xl text-sm font-bold transition-all">
                        View Full Alert Log
                    </button>
                </div>
            </div>
        </div>
    );

    const renderUsers = () => (
        <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold tracking-tight">User Biometric Profiles</h2>
                <div className="flex gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                        <input type="text" placeholder="Search user..." className="bg-card border border-border rounded-xl pl-10 pr-4 py-2 text-sm outline-none w-64 focus:ring-1 focus:ring-primary/50" />
                    </div>
                    <button className="p-2 border border-border rounded-xl hover:bg-accent"><Filter size={20} /></button>
                </div>
            </div>

            <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-sm">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-accent/30 border-b border-border">
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">User</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Status</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Role</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Trust Score</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Active Sessions</th>
                            <th className="px-6 py-4 text-right"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                        {users.map((user) => (
                            <tr key={user.id} 
                                onClick={() => setSelectedUser(user)}
                                className="hover:bg-accent/10 transition-colors group cursor-pointer"
                            >
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold">
                                            {user.username[0].toUpperCase()}
                                        </div>
                                        <span className="font-bold">{user.username}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                                        user.active_sessions > 0 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-muted text-muted-foreground'
                                    }`}>
                                        {user.active_sessions > 0 ? 'Active' : 'Offline'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-sm capitalize font-medium">{user.role}</td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <div className="flex-1 max-w-[100px] h-1.5 bg-accent rounded-full overflow-hidden">
                                            <div className="h-full bg-primary" style={{ width: '85%' }}></div>
                                        </div>
                                        <span className="text-sm font-bold">85%</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-sm font-bold">{user.active_sessions}</td>
                                <td className="px-6 py-4 text-right">
                                    <button className="p-2 hover:bg-accent rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                                        <ArrowRight size={20} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {users.length === 0 && (
                    <div className="p-12 text-center text-muted-foreground">No users found. Sessions will appear once data is captured.</div>
                )}
            </div>
        </div>
    );

    return (
        <div className="space-y-8">
            <header className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Security Command Center</h1>
                    <p className="text-muted-foreground flex items-center gap-2">
                        <Clock size={14} />
                        Real-time behavioral monitoring active
                    </p>
                </div>
                {!selectedUser && (
                    <div className="bg-card border border-border p-1 rounded-2xl flex gap-1">
                        <button 
                            onClick={() => setView('overview')}
                            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${view === 'overview' ? 'bg-primary text-primary-foreground shadow-md' : 'text-muted-foreground hover:bg-accent'}`}
                        >
                            Overview
                        </button>
                        <button 
                            onClick={() => setView('users')}
                            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${view === 'users' ? 'bg-primary text-primary-foreground shadow-md' : 'text-muted-foreground hover:bg-accent'}`}
                        >
                            User Profiles
                        </button>
                        <button 
                            onClick={() => setView('alerts')}
                            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${view === 'alerts' ? 'bg-primary text-primary-foreground shadow-md' : 'text-muted-foreground hover:bg-accent'}`}
                        >
                            Alert Logs
                        </button>
                    </div>
                )}
            </header>

            {loading ? (
                <div className="h-64 flex items-center justify-center">
                    <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
                </div>
            ) : (
                <>
                    {selectedUser ? renderProfile() : (
                        <>
                            {view === 'overview' && renderOverview()}
                            {view === 'users' && renderUsers()}
                            {view === 'alerts' && renderAlerts()}
                        </>
                    )}
                </>
            )}
        </div>
    );
};

export default AdminDashboard;
