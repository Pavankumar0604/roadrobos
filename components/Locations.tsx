import React from 'react';

interface LocationsProps {
    pickupLocations: string[];
}

const Locations: React.FC<LocationsProps> = ({ pickupLocations }) => {
    return (
        <section className="py-20 bg-white relative">
            <img 
              src="https://picsum.photos/seed/map/1920/1080" 
              alt="City map background"
              className="absolute inset-0 w-full h-full object-cover opacity-5"
              loading="lazy"
              decoding="async"
            />
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
                <div className="text-center mb-12">
                    <h2 className="text-2xl md:text-3xl font-heading font-extrabold uppercase tracking-widest text-primary">Pickup Points in Bangalore</h2>
                    <p className="mt-3 text-lg text-gray-600">Conveniently located across the city for you.</p>
                </div>
                <div className="flex flex-wrap justify-center gap-3">
                    {pickupLocations.map(location => (
                        <span key={location} className="bg-primary/10 text-primary font-medium px-4 py-2 rounded-full shadow-sm">
                            {location}
                        </span>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Locations;
