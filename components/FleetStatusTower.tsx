import React, { useState, useEffect, useMemo } from 'react';
import { ScooterStatusType, ScooterUnit } from '../data/fleetStatusData';

interface FleetStatusTowerProps {
    scooters: ScooterUnit[];
    onFilterChange: (status: ScooterStatusType | 'ALL') => void;
    activeFilter: ScooterStatusType | 'ALL';
}

const Sphere3D = ({ color, glow }: { color: string; glow: string }) => (
    <div className="relative w-12 h-12 flex items-center justify-center mb-4 px-1">
        <div
            className="w-8 h-8 rounded-full relative z-10 transition-transform duration-500 group-hover:scale-110"
            style={{
                background: `radial-gradient(circle at 35% 35%, white 0%, ${color} 70%, black 100%)`,
                boxShadow: `
                    inset -4px -4px 8px rgba(0,0,0,0.4),
                    inset 4px 4px 8px rgba(255,255,255,0.4),
                    0 12px 24px -6px ${glow}
                `
            }}
        />
        {/* Specular highlight */}
        <div className="absolute top-4 left-4 w-3 h-2 bg-white/40 rounded-full blur-[1px] transform -rotate-45 z-20 pointer-events-none" />

        {/* Floor shadow */}
        <div
            className="absolute bottom-1 w-8 h-2 rounded-[100%] blur-[6px] opacity-30 transform scale-x-150"
            style={{ backgroundColor: color }}
        />
    </div>
);

const AnimatedCounter = ({ value }: { value: number }) => {
    const [displayValue, setDisplayValue] = useState(value);

    useEffect(() => {
        let current = displayValue;
        const step = value > displayValue ? 1 : -1;
        const timer = setInterval(() => {
            if (current !== value) {
                current += step;
                setDisplayValue(current);
            } else {
                clearInterval(timer);
            }
        }, 50);
        return () => clearInterval(timer);
    }, [value]);

    return (
        <span className="inline-block transition-all duration-300 relative">
            {displayValue}
        </span>
    );
};

const TOWER_CONFIG: Record<ScooterStatusType, { label: string; color: string; bg: string; icon: React.ReactNode; shadow: string }> = {
    rentedRunning: {
        label: 'RENTED & RUNNING',
        color: '#E11D48',
        bg: 'bg-red-500',
        icon: <Sphere3D color="#E11D48" glow="rgba(225, 29, 72, 0.5)" />,
        shadow: 'shadow-red-500/10'
    },
    readyRent: {
        label: 'READY FOR RENT',
        color: '#10B981',
        bg: 'bg-emerald-500',
        icon: <Sphere3D color="#10B981" glow="rgba(16, 185, 129, 0.5)" />,
        shadow: 'shadow-emerald-500/10'
    },
    inService: {
        label: 'IN SERVICE',
        color: '#6366F1',
        bg: 'bg-indigo-500',
        icon: (
            <div className="relative w-12 h-12 flex items-center justify-center mb-4">
                <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center relative z-10 shadow-inner group-hover:bg-indigo-100 transition-colors">
                    <svg className="w-5 h-5 text-indigo-500 transform rotate-45 group-hover:rotate-[135deg] transition-transform duration-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                </div>
                <div className="absolute bottom-1 w-6 h-1.5 bg-indigo-500 rounded-full blur-[6px] opacity-20" />
            </div>
        ),
        shadow: 'shadow-indigo-500/10'
    },
    awaitingApproval: {
        label: 'AWAITING APPROVAL',
        color: '#F59E0B',
        bg: 'bg-amber-500',
        icon: <Sphere3D color="#F59E0B" glow="rgba(245, 158, 11, 0.5)" />,
        shadow: 'shadow-amber-500/10'
    },
};

const FleetStatusTower: React.FC<FleetStatusTowerProps> = ({ scooters, onFilterChange, activeFilter }) => {
    const counts = useMemo(() => {
        return scooters.reduce((acc, s) => {
            acc[s.currentStatus] = (acc[s.currentStatus] || 0) + 1;
            return acc;
        }, {
            rentedRunning: 0,
            readyRent: 0,
            inService: 0,
            awaitingApproval: 0
        } as Record<ScooterStatusType, number>);
    }, [scooters]);

    return (
        <div className="w-full bg-white/50 backdrop-blur-md rounded-[32px] border border-white/60 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)] overflow-hidden font-sans relative px-8 py-6">
            {/* Hierarchical Tower Visualization */}
            <div className="flex flex-col md:flex-row items-stretch justify-center gap-4">
                {(Object.entries(TOWER_CONFIG) as [ScooterStatusType, typeof TOWER_CONFIG[ScooterStatusType]][]).map(([key, config]) => {
                    const count = (counts as any)[key];
                    const isActive = activeFilter === key;
                    const isAll = activeFilter === 'ALL';
                    const opacity = !isAll && !isActive ? 'opacity-30 grayscale-[70%] scale-[0.96]' : 'opacity-100 scale-100';

                    return (
                        <button
                            key={key}
                            onClick={() => onFilterChange(isActive ? 'ALL' : key)}
                            className={`group relative flex-1 flex flex-col items-center transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] hover:-translate-y-3 ${opacity}`}
                        >
                            <div className={`w-full bg-white rounded-[28px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 flex flex-col items-center justify-center py-5 px-4 relative transition-all duration-700 group-hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] ${isActive ? 'ring-2 ring-indigo-500/30 border-indigo-100 shadow-[0_20px_50px_rgba(99,102,241,0.12)]' : ''}`}>

                                {config.icon}

                                <span className="text-[32px] font-black tracking-tighter text-[#0A2540] leading-none mb-2 group-hover:scale-110 transition-transform duration-500">
                                    <AnimatedCounter value={count} />
                                </span>

                                <div className={`absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1/3 h-1 rounded-full ${config.bg} opacity-10 group-hover:opacity-100 transition-opacity blur-[2px]`} />
                            </div>

                            <h3 className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 mt-4 group-hover:text-[#0A2540] transition-colors duration-300 text-center">
                                {config.label}
                            </h3>
                        </button>
                    );
                })}
            </div>

            {/* View All Bar */}
            {activeFilter !== 'ALL' && (
                <div className="bg-accent/50 p-3 text-center border-t border-input/20 animate-in fade-in slide-in-from-top-2">
                    <button
                        onClick={() => onFilterChange('ALL')}
                        className="text-xs font-bold text-primary uppercase tracking-widest hover:underline"
                    >
                        ← Clear Filter & View Entire Fleet
                    </button>
                </div>
            )}
        </div>
    );
};

export default FleetStatusTower;
