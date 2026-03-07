import React from 'react';
import Card from '../Card';

interface OutlinedStatCardProps {
    label: string;
    value: string | number;
    color: 'yellow' | 'blue' | 'green';
    icon: React.FC<React.SVGProps<SVGSVGElement>>;
}

const OutlinedStatCard: React.FC<OutlinedStatCardProps> = ({ label, value, color, icon: Icon }) => {
    const colors: Record<string, { border: string, text: string, iconBg: string, iconText: string, dot: string }> = {
        yellow: { border: 'border-[#FBBF24]', text: 'text-[#F59E0B]', iconBg: 'bg-[#FEF3C7]', iconText: 'text-[#F59E0B]', dot: 'bg-[#F59E0B]' },
        blue: { border: 'border-[#3B82F6]', text: 'text-[#2563EB]', iconBg: 'bg-[#DBEAFE]', iconText: 'text-[#2563EB]', dot: 'bg-[#3B82F6]' },
        green: { border: 'border-[#10B981]', text: 'text-[#059669]', iconBg: 'bg-[#D1FAE5]', iconText: 'text-[#059669]', dot: 'bg-[#10B981]' }
    };

    const config = colors[color];

    return (
        <Card className={`p-6 border-2 shadow-sm rounded-xl flex items-center justify-between ${config.border} bg-white transition-all hover:shadow-md duration-300`}>
            <div>
                <div className="flex items-center gap-2 mb-2">
                    <div className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
                    <p className="text-xs font-bold text-text-muted uppercase tracking-wider">{label}</p>
                </div>
                <h4 className={`text-3xl md:text-4xl font-black tracking-tight leading-none ${config.text}`}>{value}</h4>
            </div>

            <div className={`w-12 h-12 md:w-14 md:h-14 rounded-xl flex items-center justify-center ${config.iconBg} ${config.iconText}`}>
                <Icon className="w-6 h-6 md:w-7 md:h-7" />
            </div>
        </Card>
    );
};

export default OutlinedStatCard;
