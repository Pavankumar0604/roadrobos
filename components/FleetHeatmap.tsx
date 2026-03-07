import React, { useMemo, useState } from 'react';
import { ScooterUnit, BENGALURU_STATIONS } from '../data/fleetStatusData';

interface FleetHeatmapProps {
    scooters: ScooterUnit[];
    onSelectArea?: (area: string) => void;
}

const STATUS_COLORS: Record<string, string> = {
    rentedRunning: '#FF6347', // Tomato
    readyRent: '#10B981',     // Emerald Green
    inService: '#EF4444',     // Red error
};

const FleetHeatmap: React.FC<FleetHeatmapProps> = ({ scooters, onSelectArea }) => {
    const [hoveredStation, setHoveredStation] = useState<string | null>(null);

    // Group scooters by area for the map display
    const areaStats = useMemo(() => {
        const stats: Record<string, { total: number; rented: number; ready: number; service: number }> = {};

        // Initialize with all map stations
        BENGALURU_STATIONS.forEach(st => {
            stats[st.name] = { total: 0, rented: 0, ready: 0, service: 0 };
        });

        // Populate counts
        scooters.forEach(s => {
            const area = s.location.area || s.station || 'Unknown';
            if (!stats[area]) stats[area] = { total: 0, rented: 0, ready: 0, service: 0 };

            stats[area].total++;
            if (s.currentStatus === 'rentedRunning') stats[area].rented++;
            else if (s.currentStatus === 'readyRent') stats[area].ready++;
            else if (s.currentStatus === 'inService') stats[area].service++;
        });

        return stats;
    }, [scooters]);

    return (
        <div className="bg-white rounded-xl shadow-lg border border-input/30 p-6 relative overflow-hidden font-sans group hover:shadow-xl transition-shadow h-full flex flex-col">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="text-sm font-black uppercase tracking-widest text-primary flex items-center gap-2">
                        <span className="w-1.5 h-4 bg-secondary rounded-full"></span>
                        Live Regional Telemetry
                    </h3>
                    <p className="text-[10px] text-text-muted mt-1 uppercase font-bold">Bengaluru Metro Area Grid</p>
                </div>
                <div className="flex gap-3 text-[9px] font-bold uppercase">
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-secondary"></span> Active</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-primary"></span> Ready</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-error"></span> Service</span>
                </div>
            </div>

            {/* Simulated Map Container */}
            <div className="relative flex-1 bg-accent/40 rounded-lg border border-input/20 overflow-hidden min-h-[300px]">
                {/* SVG Map Background Lines (Grid simulation) */}
                <svg className="absolute inset-0 w-full h-full opacity-10" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1" />
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#grid)" />

                    {/* Fake road networks */}
                    <path d="M 10 50 Q 150 200 350 150 T 800 300" fill="none" stroke="currentColor" strokeWidth="4" className="opacity-20 stroke-primary" />
                    <path d="M 200 0 Q 300 250 150 500" fill="none" stroke="currentColor" strokeWidth="2" className="opacity-20 stroke-primary" />
                </svg>

                {/* Plotting Stations */}
                {BENGALURU_STATIONS.map(st => {
                    const data = areaStats[st.name];
                    if (!data) return null;

                    const isHovered = hoveredStation === st.name;
                    const hasRented = data.rented > 0;

                    return (
                        <div
                            key={st.name}
                            className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center cursor-pointer group/pin"
                            style={{ top: `${st.y}%`, left: `${st.x}%` }}
                            onMouseEnter={() => setHoveredStation(st.name)}
                            onMouseLeave={() => setHoveredStation(null)}
                            onClick={() => onSelectArea?.(st.name)}
                        >
                            {/* Radar Ping for active zones */}
                            {hasRented && (
                                <div className="absolute inset-0 bg-secondary rounded-full opacity-40 blur-md scale-150 animate-pulse"></div>
                            )}

                            {/* The Pin */}
                            <div className={`relative z-10 w-6 h-6 rounded-full border-2 border-white flex items-center justify-center shadow-md transition-transform duration-300 ${isHovered ? 'scale-125 z-50' : 'scale-100'}`}
                                style={{
                                    backgroundColor: data.service > 0 ? STATUS_COLORS.inService : (data.rented > 0 ? STATUS_COLORS.rentedRunning : STATUS_COLORS.readyRent)
                                }}
                            >
                                <span className="text-[9px] font-black text-white">{data.total}</span>
                            </div>

                            {/* Area Label (show on hover or if large cluster) */}
                            <div className={`absolute top-full mt-1 px-2 py-0.5 bg-white/90 backdrop-blur text-[9px] font-bold text-text-body rounded shadow-sm border border-input/20 whitespace-nowrap transition-all duration-300 ${isHovered ? 'opacity-100 translate-y-0 z-50' : 'opacity-0 -translate-y-2 pointer-events-none'}`}>
                                {st.name}
                                <div className="flex gap-2 mt-1 border-t border-input/10 pt-1">
                                    <span className="text-secondary">{data.rented} Rented</span>
                                    <span className="text-primary">{data.ready} Ready</span>
                                </div>
                            </div>
                        </div>
                    );
                })}

                {/* Live Scanning overlay effect */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent h-[10%] w-full animate-[scan_4s_ease-in-out_infinite] pointer-events-none"></div>
            </div>

            <style>{`
                @keyframes scan {
                    0% { top: -10%; opacity: 0; }
                    10% { opacity: 1; }
                    90% { opacity: 1; }
                    100% { top: 110%; opacity: 0; }
                }
            `}</style>
        </div>
    );
};

export default FleetHeatmap;
