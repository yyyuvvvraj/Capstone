import React from 'react';
import { 
  Plus, 
  ArrowUpRight, 
  Clock, 
  Calendar, 
  FileText, 
  Mail as MailIcon, 
  Users
} from 'lucide-react';

const UserDashboard = () => {
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <header className="flex justify-between items-end">
                <div>
                    <h1 className="text-4xl font-bold tracking-tight">System Overview</h1>
                    <p className="text-muted-foreground mt-2">Welcome back to your workspace. Everything seems secure.</p>
                </div>
                <button className="bg-primary hover:opacity-90 text-primary-foreground px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-primary/20 transition-all">
                    <Plus size={20} />
                    New Project
                </button>
            </header>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Unread Emails', value: '12', icon: <MailIcon />, color: 'bg-blue-500/10 text-blue-500' },
                    { label: 'Active Tasks', value: '08', icon: <Clock />, color: 'bg-orange-500/10 text-orange-500' },
                    { label: 'Documents', value: '45', icon: <FileText />, color: 'bg-emerald-500/10 text-emerald-500' },
                    { label: 'Team Members', value: '04', icon: <Users />, color: 'bg-purple-500/10 text-purple-500' },
                ].map((stat, i) => (
                    <div key={i} className="bg-card border border-border p-6 rounded-3xl group hover:border-primary/50 transition-all duration-300">
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-3 rounded-2xl ${stat.color}`}>
                                {React.cloneElement(stat.icon, { size: 24 })}
                            </div>
                            <ArrowUpRight size={16} className="text-muted-foreground group-hover:text-primary transition-colors" />
                        </div>
                        <p className="text-sm text-muted-foreground font-medium">{stat.label}</p>
                        <h3 className="text-3xl font-bold mt-1">{stat.value}</h3>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Activity */}
                <div className="lg:col-span-2 bg-card border border-border rounded-3xl overflow-hidden shadow-sm">
                    <div className="p-6 border-b border-border flex justify-between items-center">
                        <h2 className="text-xl font-bold">Recommended Actions</h2>
                        <button className="text-primary text-sm font-semibold hover:underline">View All</button>
                    </div>
                    <div className="p-6 space-y-6">
                        {[
                            { title: 'Update project documentation', category: 'General', time: '2h ago', status: 'Pending' },
                            { title: 'Review team performance quarterly', category: 'HR', time: '5h ago', status: 'Overdue' },
                            { title: 'Sync database with production', category: 'DevOps', time: '1d ago', status: 'Completed' },
                        ].map((item, i) => (
                            <div key={i} className="flex items-center justify-between group cursor-pointer hover:bg-accent/30 p-2 -mx-2 rounded-2xl transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center font-bold text-muted-foreground">
                                        {item.category[0]}
                                    </div>
                                    <div>
                                        <h4 className="font-semibold group-hover:text-primary transition-colors">{item.title}</h4>
                                        <p className="text-xs text-muted-foreground">{item.category} • {item.time}</p>
                                    </div>
                                </div>
                                <span className={`text-xs px-3 py-1 rounded-full font-bold ${
                                    item.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-500' : 
                                    item.status === 'Overdue' ? 'bg-destructive/10 text-destructive' : 'bg-orange-500/10 text-orange-500'
                                }`}>
                                    {item.status}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Calendar Card */}
                <div className="bg-card border border-border rounded-3xl p-6 shadow-sm">
                    <div className="flex items-center gap-3 mb-6">
                        <Calendar className="text-primary" size={20} />
                        <h2 className="text-xl font-bold">Upcoming Events</h2>
                    </div>
                    <div className="space-y-4">
                        {[
                            { name: 'Architecture Review', time: '14:00 - 15:30', date: 'Today' },
                            { name: 'Team Sync', time: '10:00 - 11:00', date: 'Tomorrow' },
                            { name: 'Sprint Planning', time: '11:30 - 13:00', date: 'Mar 15' },
                        ].map((event, i) => (
                            <div key={i} className="border-l-4 border-primary/30 pl-4 py-2 hover:border-primary transition-all cursor-pointer">
                                <p className="text-xs text-muted-foreground font-medium">{event.date} • {event.time}</p>
                                <h4 className="font-bold">{event.name}</h4>
                            </div>
                        ))}
                    </div>
                    <button className="w-full mt-6 py-3 border border-dashed border-border rounded-2xl text-muted-foreground hover:bg-accent hover:border-primary transition-all text-sm font-medium">
                        + Add Schedule
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UserDashboard;
