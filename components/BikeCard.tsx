import React, { useState } from 'react';
import { type Bike } from '../types';
import Card from './Card';

interface BikeCardProps {
    bike: Bike;
    onSelectBike: (bike: Bike) => void;
}

const BikeCard: React.FC<BikeCardProps> = ({ bike, onSelectBike }) => {
    const [isImageLoaded, setIsImageLoaded] = useState(false);

    return (
        <Card className="overflow-hidden transform transition-all hover:shadow-md hover:-translate-y-1 group">
            <div className={`h-48 flex items-center justify-center p-2 transition-colors ${!isImageLoaded ? 'bg-gray-200 animate-pulse' : 'bg-gray-100'}`}>
                <img 
                    src={bike.images[0]} 
                    alt={`${bike.name} side profile`} 
                    className={`w-full h-full object-contain transition-opacity duration-300 ${isImageLoaded ? 'opacity-100' : 'opacity-0'}`}
                    onLoad={() => setIsImageLoaded(true)}
                />
            </div>
            <div className="p-5">
                <div className="flex justify-between items-start">
                    <h3 className="text-lg font-bold text-primary">{bike.name}</h3>
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${bike.availability === 'Available' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {bike.availability}
                    </span>
                </div>
                <p className="text-sm text-gray-500 mt-1">{bike.specs.cc} | {bike.specs.transmission}</p>
                <div className="mt-4 flex justify-between items-center">
                    <div>
                        <p className="text-primary font-bold text-lg">₹{bike.price.hour}<span className="text-sm font-normal text-gray-500">/hr</span></p>
                        <p className="text-gray-500 text-sm">₹{bike.price.day}/day</p>
                    </div>
                     <p className="text-sm text-gray-500">Deposit: ₹{bike.deposit}</p>
                </div>
                 <button 
                    onClick={() => onSelectBike(bike)}
                    aria-label={`View details for ${bike.name}`}
                    className="w-full mt-5 bg-primary text-white font-semibold py-2.5 rounded-lg hover:bg-opacity-90 transition-all"
                >
                    View Details
                </button>
            </div>
        </Card>
    );
}

export default React.memo(BikeCard);