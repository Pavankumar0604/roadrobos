import React from 'react';
import { LogoutIcon } from '../icons/Icons';
import { type AdminUser } from '../../types';

interface NavItem {
    id: string;
    label: string;
    icon: React.ReactNode;
}

interface UnifiedSidebarProps {
    roleName: string;
    roleSubtitle: string;
    navItems: NavItem[];
    activePanel: string;
    onNavClick: (panelId: any) => void;
    user: AdminUser;
    onLogout: () => void;
    isSidebarOpen: boolean;
    setIsSidebarOpen: (isOpen: boolean) => void;
}

const UnifiedSidebar: React.FC<UnifiedSidebarProps> = ({
    roleName,
    roleSubtitle,
    navItems,
    activePanel,
    onNavClick,
    user,
    onLogout,
    isSidebarOpen,
    setIsSidebarOpen
}) => {
    return (
        <>
            {/* Sidebar Content (Extracted for reuse in mobile/desktop contexts) */}
            <div className={`bg-primary text-white flex flex-col h-full w-full shadow-2xl overflow-y-auto`}>
                <div className="pt-10 pb-6 text-center bg-transparent shrink-0">
                    <h1 className="text-3xl font-black leading-none tracking-tight mb-2 text-white">
                        {roleName}
                    </h1>
                    <span className="text-base font-semibold text-white/80">{roleSubtitle}</span>
                </div>

                <div className="w-full h-px bg-white/10 mb-6 shrink-0" />

                <nav className="flex-grow px-4 space-y-1 mt-2 overflow-y-auto scrollbar-hide">
                    {navItems.map(item => {
                        const isActive = activePanel === item.id;
                        return (
                            <button
                                key={item.id}
                                onClick={() => onNavClick(item.id)}
                                className={`w-full flex items-center gap-4 px-4 py-3 rounded-md transition-all duration-300 ${isActive
                                    ? 'bg-white/10 text-white font-bold'
                                    : 'text-white/90 font-semibold hover:bg-white/5'
                                    }`}
                            >
                                <div className={`${isActive ? 'text-white' : 'text-white/90'} w-6 h-6 flex items-center justify-center shrink-0`}>
                                    {item.icon}
                                </div>
                                <span className="text-base tracking-tight truncate">{item.label}</span>
                            </button>
                        );
                    })}
                </nav>

                <div className="p-6 mt-auto border-t border-white/10 bg-transparent shrink-0">
                    <div className="flex items-center gap-4 mb-6 px-2 text-left">
                        <div className="w-10 h-10 rounded-lg bg-emerald-500 flex items-center justify-center text-primary font-black shadow-lg text-lg italic shrink-0">
                            {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-sm font-black truncate text-white italic uppercase tracking-tight leading-none">{user.name}</p>
                            <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest mt-1 truncate">
                                {user.role.name}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onLogout}
                        className="w-full flex items-center justify-center gap-3 py-3.5 rounded-xl bg-white/5 text-white/70 font-bold text-[10px] uppercase tracking-widest hover:bg-error hover:text-white transition-all active:scale-95 group"
                    >
                        <LogoutIcon className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> SIGN OUT
                    </button>
                </div>
            </div>
        </>
    );
};

export default UnifiedSidebar;
