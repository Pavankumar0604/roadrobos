import React from 'react';
import Card from '../Card';

interface GradientStatCardProps {
    label: string;
    value: string | number;
    color: 'green' | 'blue' | 'purple' | 'orange';
    icon: React.FC<React.SVGProps<SVGSVGElement>>;
}

const GradientStatCard: React.FC<GradientStatCardProps> = ({ label, value, color, icon: Icon }) => {
    const gradients: Record<string, string> = {
        green: 'bg-gradient-to-br from-[#10B96B] to-[#0A8C50]',
        blue: 'bg-gradient-to-br from-[#4F6BF5] to-[#3950C9]',
        purple: 'bg-gradient-to-br from-[#A855F7] to-[#8031C5]',
        orange: 'bg-gradient-to-br from-[#F55246] to-[#C73328]'
    };

    return (
        <div className={`relative p-6 rounded-xl overflow-hidden shadow-lg ${gradients[color]} transition-transform hover:-translate-y-1 duration-300`}>
            {/* Top right circular decor */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" />

            <div className="relative z-10 flex flex-col h-full justify-between">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center mb-6 border border-white/10 shadow-inner">
                    <Icon className="w-6 h-6 text-white" />
                </div>

                <div>
                    <h4 className="text-[32px] md:text-[40px] font-black text-white tracking-tight leading-none mb-2 break-words">{value}</h4>
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-white/80" />
                        <p className="text-xs md:text-sm font-semibold text-white/90 uppercase tracking-wider">{label}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GradientStatCard;
