import React from 'react';
import { type PickupLocation } from '../types';

interface LocationsProps {
    pickupLocations: PickupLocation[];
}

const Locations: React.FC<LocationsProps> = ({ pickupLocations }) => {
    const getStatusStyles = (status: PickupLocation['status']) => {
        switch (status) {
            case 'active':
                return {
                    pill: 'bg-emerald-50 text-emerald-900 border-emerald-100',
                    dot: 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]'
                };
            case 'busy':
                return {
                    pill: 'bg-orange-50 text-orange-900 border-orange-100',
                    dot: 'bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.4)]'
                };
            case 'unavailable':
                return {
                    pill: 'bg-slate-50 text-slate-500 border-slate-100',
                    dot: 'bg-slate-400'
                };
            default:
                return {
                    pill: 'bg-gray-50 text-gray-700 border-gray-100',
                    dot: 'bg-gray-400'
                };
        }
    };

    return (
        <section className="py-20 bg-[#f8f9fa] relative overflow-hidden">
            {/* Map background overlay */}
            <div className="absolute inset-0 z-0 opacity-[0.05] pointer-events-none">
                <img
                    src="https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&q=80&w=2000"
                    alt="Map Background"
                    className="w-full h-full object-cover"
                />
            </div>

            {/* Book-like structure at the bottom */}
            <div className="absolute bottom-0 left-0 w-full h-32 z-0 pointer-events-none overflow-hidden">
                <svg viewBox="0 0 1440 320" preserveAspectRatio="none" className="w-full h-full opacity-[0.08]">
                    <path
                        fill="#0A2540"
                        d="M0,160 C180,160 360,320 720,320 C1080,320 1260,160 1440,160 L1440,320 L0,320 Z"
                    />
                    <path
                        fill="none"
                        stroke="#0A2540"
                        strokeWidth="1"
                        d="M720,160 L720,320"
                        className="opacity-20"
                    />
                </svg>
                <div className="absolute inset-0 bg-gradient-to-t from-white to-transparent h-full"></div>
            </div>

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="text-center mb-10">
                    <h2 className="text-2xl md:text-3xl font-heading font-extrabold uppercase tracking-widest text-primary">Pickup Points in Bangalore</h2>
                    <p className="mt-2 text-gray-500 text-sm md:text-base font-medium">Find us conveniently located across Bangalore's major hubs</p>
                </div>

                {/* Horizontal Scrolling Container */}
                <div className="relative group">
                    <div className="flex overflow-x-auto pb-6 pt-2 gap-4 no-scrollbar scroll-smooth snap-x snap-mandatory">
                        <div className="flex-shrink-0 w-2 md:w-4" />

                        {pickupLocations.map((location) => {
                            const styles = getStatusStyles(location.status);
                            return (
                                <div
                                    key={location.name}
                                    className={`
                                        flex-shrink-0 snap-center flex items-center gap-3 px-6 py-3.5 
                                        rounded-full border shadow-sm transition-all duration-300 
                                        hover:shadow-md hover:-translate-y-0.5 cursor-default
                                        ${styles.pill}
                                    `}
                                >
                                    <span className="font-bold text-sm md:text-base whitespace-nowrap tracking-wide">
                                        {location.name}
                                    </span>
                                    <div className={`w-2.5 h-2.5 rounded-full ${styles.dot}`} />
                                </div>
                            );
                        })}

                        <div className="flex-shrink-0 w-2 md:w-4" />
                    </div>

                    {/* Artistic gradient fades for horizontal scroll indication */}
                    <div className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-white to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-white to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .no-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .no-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            ` }} />
        </section>
    );
};

export default Locations;
