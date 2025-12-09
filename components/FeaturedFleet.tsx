import React from 'react';
import { type Bike } from '../types';
import BikeCard from './BikeCard';

interface FeaturedFleetProps {
    bikes: Bike[];
    onSelectBike: (bike: Bike) => void;
    city: string;
}

const FeaturedFleet: React.FC<FeaturedFleetProps> = ({ bikes, onSelectBike, city }) => {
    // Show available or limited bikes first, then coming soon
    const sortedBikes = [...bikes].sort((a, b) => {
        if (a.availability === 'Coming Soon' && b.availability !== 'Coming Soon') return 1;
        if (a.availability !== 'Coming Soon' && b.availability === 'Coming Soon') return -1;
        return 0;
    });

    return (
        <section className="py-20 bg-white">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h2 className="text-2xl md:text-3xl font-heading font-extrabold uppercase tracking-widest text-primary">Popular Bikes in {city}</h2>
                    <p className="mt-3 text-lg text-gray-600">Choose from scooters, gear bikes and electric rides.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {sortedBikes.slice(0, 6).map(bike => (
                        <BikeCard key={bike.id} bike={bike} onSelectBike={onSelectBike} />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default FeaturedFleet;
