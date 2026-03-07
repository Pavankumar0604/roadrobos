import React, { useState } from 'react';
import { MenuAlt2Icon, XIcon, LogoutIcon } from '../icons/Icons';
import { type AdminUser } from '../../types';

interface NavItem {
    id: string;
    label: string;
    icon: React.ReactNode;
}

interface DashboardLayoutProps {
    roleName: string;
    roleSubtitle: string;
    navItems: NavItem[];
    activePanel: string;
    onNavClick: (panelId: any) => void;
    user: AdminUser;
    onLogout: () => void;
    children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({
    roleName,
    roleSubtitle,
    navItems,
    activePanel,
    onNavClick,
    user,
    onLogout,
    children
}) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="flex min-h-screen bg-slate-50 font-sans">
            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
                fixed inset-y-0 left-0 z-50 w-72 bg-primary transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                <div className="flex flex-col h-full">
                    {/* Sidebar Header */}
                    <div className="p-8 pb-6 text-center">
                        <h1 className="text-3xl font-black text-white leading-none tracking-tight mb-2 uppercase">
                            {roleName}
                        </h1>
                        <p className="text-base font-semibold text-white/80 uppercase tracking-widest leading-none mt-1">
                            {roleSubtitle}
                        </p>
                    </div>

                    <div className="px-6 mb-6">
                        <div className="h-px bg-white/10 w-full" />
                    </div>

                    {/* Navigation */}
                    <nav className="flex-grow px-4 space-y-1.5 overflow-y-auto scrollbar-hide">
                        {navItems.map((item) => {
                            const isActive = activePanel === item.id;
                            return (
                                <button
                                    key={item.id}
                                    onClick={() => {
                                        onNavClick(item.id);
                                        setIsSidebarOpen(false);
                                    }}
                                    className={`
                                        w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-200 group
                                        ${isActive
                                            ? 'bg-white/10 text-white font-bold'
                                            : 'text-white/60 hover:bg-white/5 hover:text-white'}
                                    `}
                                >
                                    <div className={`transition-transform duration-300 ${isActive ? 'scale-110 text-white' : 'group-hover:scale-110 group-hover:text-white'}`}>
                                        {item.icon}
                                    </div>
                                    <span className="text-sm tracking-tight">{item.label}</span>
                                    {isActive && (
                                        <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary-light shadow-[0_0_8px_#22C55E]" />
                                    )}
                                </button>
                            );
                        })}
                    </nav>

                    {/* Sidebar Footer */}
                    <div className="p-6 mt-auto">
                        <div className="bg-white/5 backdrop-blur-sm p-4 rounded-2xl border border-white/5 mb-4 group transition-all hover:bg-white/10 duration-300">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-green-400 to-emerald-600 flex items-center justify-center text-primary font-black text-lg shadow-lg">
                                    {user.name.charAt(0).toUpperCase()}
                                </div>
                                <div className="overflow-hidden text-left">
                                    <p className="text-sm font-black text-white truncate italic uppercase tracking-tight leading-none">{user.name}</p>
                                    <p className="text-[10px] font-bold text-green-400 uppercase tracking-widest mt-1.5">
                                        {user.role.name}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={onLogout}
                            className="w-full flex items-center justify-center gap-3 py-3.5 rounded-xl bg-white/5 text-white/70 font-bold text-[10px] uppercase tracking-widest hover:bg-red-600 hover:text-white hover:border-red-600 transition-all active:scale-95 border border-white/5 group"
                        >
                            <LogoutIcon className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> SIGN OUT
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-grow flex flex-col min-w-0">
                {/* Header (Mobile Toggle) */}
                <header className="h-20 bg-white shadow-sm flex items-center justify-between px-6 sticky top-0 z-30 border-b border-slate-200 lg:hidden">
                    <button
                        onClick={() => setIsSidebarOpen(true)}
                        className="p-2 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200 shadow-sm"
                    >
                        <MenuAlt2Icon className="w-6 h-6 text-primary" />
                    </button>

                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-black italic text-xs">RR</div>
                        <span className="text-sm font-black text-primary tracking-tight">ROBOT CONTROL</span>
                    </div>

                    <div className="w-10"></div>
                </header>

                {/* Content */}
                <main className="flex-grow p-4 md:p-8 lg:p-12 overflow-x-hidden">
                    <div className="max-w-[1600px] mx-auto animate-fade-in">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
