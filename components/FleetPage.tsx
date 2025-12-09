import React, { useMemo } from 'react';
import { type Bike } from '../types';
import BikeCard from './BikeCard';

interface FleetPageProps {
    bikes: Bike[];
    onSelectBike: (bike: Bike) => void;
}

const FleetPage: React.FC<FleetPageProps> = ({ bikes, onSelectBike }) => {
    
    const bikesByCategory = useMemo(() => {
        const categories: (Bike['type'])[] = ['Electric', 'Scooter', 'Geared', 'Superbike'];
        const grouped: { [key in Bike['type']]?: Bike[] } = {};

        for (const bike of bikes) {
            if (!grouped[bike.type]) {
                grouped[bike.type] = [];
            }
            grouped[bike.type]!.push(bike);
        }

        return categories.map(category => ({
            name: category,
            bikes: grouped[category] || [],
        })).filter(group => group.bikes.length > 0);

    }, [bikes]);

    return (
        <div className="bg-accent">
            {/* Hero */}
            <section className="bg-primary text-white text-center py-20">
                <div className="container mx-auto px-4">
                    <h1 className="text-3xl md:text-4xl font-heading font-extrabold uppercase tracking-widest">Our Fleet</h1>
                    <p className="mt-4 text-lg text-gray-200 max-w-2xl mx-auto">A wide range of bikes to suit every rider's need. From nimble electric scooters to powerful superbikes, find your perfect ride with us.</p>
                </div>
            </section>

            <main className="py-16 md:py-20">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
                    {bikesByCategory.map(category => (
                        <section key={category.name} id={category.name.toLowerCase()}>
                             <div className="text-left mb-8">
                                <h2 className="text-2xl md:text-3xl font-heading font-extrabold uppercase tracking-widest text-primary">{category.name} Bikes</h2>
                                <p className="mt-2 text-gray-600">
                                    {
                                        category.name === 'Electric' ? 'Eco-friendly and efficient rides for the modern city.' :
                                        category.name === 'Scooter' ? 'Easy-to-handle scooters perfect for daily commutes.' :
                                        category.name === 'Geared' ? 'Versatile and powerful bikes for city and highway riding.' :
                                        'High-performance machines for the ultimate thrill.'
                                    }
                                </p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {category.bikes.map(bike => (
                                    <BikeCard key={bike.id} bike={bike} onSelectBike={onSelectBike} />
                                ))}
                            </div>
                        </section>
                    ))}
                </div>
            </main>
        </div>
    );
};

export default FleetPage;
