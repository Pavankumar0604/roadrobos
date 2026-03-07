import React from 'react';

interface PremiumStatCardProps {
    label: string;
    value: string | number;
    color: 'emerald' | 'blue' | 'amber' | 'rose';
    icon: React.FC<React.SVGProps<SVGSVGElement>>;
    description?: string;
}

const PremiumStatCard: React.FC<PremiumStatCardProps> = ({ label, value, color, icon: Icon, description }) => {
    const gradients: Record<string, string> = {
        emerald: 'from-emerald-600 to-green-700 shadow-emerald-900/20',
        blue: 'from-blue-600 to-blue-800 shadow-blue-900/20',
        amber: 'from-amber-500 to-orange-600 shadow-amber-900/20',
        rose: 'from-rose-500 to-red-700 shadow-red-900/20'
    };

    const iconColors: Record<string, string> = {
        emerald: 'bg-emerald-400/20 text-emerald-100 border-emerald-400/30',
        blue: 'bg-blue-400/20 text-blue-100 border-blue-400/30',
        amber: 'bg-amber-400/20 text-amber-100 border-amber-400/30',
        rose: 'bg-rose-400/20 text-rose-100 border-rose-400/30'
    };

    return (
        <div className={`relative p-7 rounded-3xl overflow-hidden bg-gradient-to-br transition-all duration-500 hover:-translate-y-1.5 hover:shadow-2xl shadow-xl flex flex-col justify-between h-full group ${gradients[color]}`}>
            {/* Background pattern */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-10 -mt-10 blur-3xl transition-all duration-700 group-hover:scale-150 group-hover:bg-white/10" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/5 rounded-full -ml-8 -mb-8 blur-2xl" />

            <div className="relative z-10">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 border backdrop-blur-md shadow-inner transition-transform duration-500 group-hover:rotate-12 ${iconColors[color]}`}>
                    <Icon className="w-7 h-7" />
                </div>

                <div className="space-y-1">
                    <p className="text-[11px] font-black text-white/50 uppercase tracking-[0.2em] leading-none mb-1">{label}</p>
                    <h4 className="text-3xl md:text-4xl font-black text-white tracking-tighter leading-none italic">{value}</h4>
                </div>
            </div>

            {description && (
                <div className="relative z-10 mt-6 pt-4 border-t border-white/10">
                    <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">{description}</p>
                </div>
            )}

            {/* Subtle glow on hover */}
            <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
        </div>
    );
};

export default PremiumStatCard;
