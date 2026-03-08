import React from 'react';
import Card from '../Card';

// ─── Gradient Stat Card (identical to ManagerDashboard & ServiceManagerDashboard) ───
export const GradientStatCard = ({
    label, value, color, icon: Icon, sublabel, onClick
}: {
    label: string;
    value: string | number;
    color: 'green' | 'blue' | 'purple' | 'orange';
    icon: any;
    sublabel?: string;
    onClick?: () => void;
}) => {
    const gradients: Record<string, string> = {
        green: 'bg-gradient-to-br from-[#059669] via-[#10B981] to-[#34D399]',
        blue: 'bg-gradient-to-br from-[#2563EB] via-[#3B82F6] to-[#60A5FA]',
        purple: 'bg-gradient-to-br from-[#7C3AED] via-[#8B5CF6] to-[#A78BFA]',
        orange: 'bg-gradient-to-br from-[#EA580C] via-[#F97316] to-[#FB923C]'
    };

    const shadows: Record<string, string> = {
        green: 'shadow-emerald-500/20',
        blue: 'shadow-blue-500/20',
        purple: 'shadow-purple-500/20',
        orange: 'shadow-orange-500/20'
    };

    return (
        <div
            onClick={onClick}
            className={`relative p-5 rounded-2xl overflow-hidden shadow-xl ${gradients[color]} ${shadows[color]} transition-all duration-500 hover:-translate-y-1.5 hover:shadow-2xl group ${onClick ? 'cursor-pointer active:scale-95' : ''}`}
        >
            {/* Glossy overlay */}
            <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            {/* Decorative glass orbs */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-3xl transition-transform duration-700 group-hover:scale-125" />
            <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-black/10 rounded-full blur-2xl" />

            <div className="relative z-10 flex flex-col h-full justify-between">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-xl rounded-xl flex items-center justify-center mb-6 border border-white/20 shadow-inner group-hover:rotate-6 transition-transform duration-500">
                    <Icon className="w-6 h-6 text-white" />
                </div>

                <div>
                    <h4 className="text-3xl md:text-4xl font-black text-white tracking-tighter leading-none mb-2 italic">
                        {value}
                    </h4>
                    <div className="flex items-center gap-2">
                        <p className="text-[10px] font-black text-white/70 uppercase tracking-[0.2em] leading-none">{label}</p>
                    </div>
                    {sublabel && (
                        <p className="mt-2 text-[9px] font-bold uppercase tracking-widest text-white/50">{sublabel}</p>
                    )}
                </div>

                {/* Glassy line at bottom */}
                <div className="mt-4 h-[1px] w-full bg-white/5" />
            </div>
        </div>
    );
};

// ─── Outlined Stat Card (from ManagerDashboard — for secondary/alert metrics) ───
export const OutlinedStatCard = ({
    label, value, color, icon: Icon, onClick
}: {
    label: string;
    value: string | number;
    color: 'yellow' | 'blue' | 'green';
    icon: any;
    onClick?: () => void;
}) => {
    const colors: Record<string, { border: string, text: string, iconBg: string, iconText: string, dot: string }> = {
        yellow: { border: 'border-[#FBBF24]', text: 'text-[#F59E0B]', iconBg: 'bg-[#FEF3C7]', iconText: 'text-[#F59E0B]', dot: 'bg-[#F59E0B]' },
        blue: { border: 'border-[#3B82F6]', text: 'text-[#2563EB]', iconBg: 'bg-[#DBEAFE]', iconText: 'text-[#2563EB]', dot: 'bg-[#3B82F6]' },
        green: { border: 'border-[#10B981]', text: 'text-[#059669]', iconBg: 'bg-[#D1FAE5]', iconText: 'text-[#059669]', dot: 'bg-[#10B981]' }
    };

    const cfg = colors[color];

    return (
        <Card
            onClick={onClick}
            className={`p-6 border-2 shadow-sm rounded-xl flex items-center justify-between ${cfg.border} bg-white transition-all hover:shadow-md duration-300 ${onClick ? 'cursor-pointer active:scale-95' : ''}`}
        >
            <div>
                <div className="flex items-center gap-2 mb-2">
                    <div className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                    <p className="text-sm font-bold text-text-muted">{label}</p>
                </div>
                <h4 className={`text-4xl font-black tracking-tight leading-none ${cfg.text}`}>{value}</h4>
            </div>

            <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${cfg.iconBg} ${cfg.iconText}`}>
                <Icon className="w-7 h-7" />
            </div>
        </Card>
    );
};
