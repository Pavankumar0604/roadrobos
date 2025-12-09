import React, { useState } from 'react';
import { type Bike } from '../types';
import Card from './Card';

interface BikeCardProps {
    bike: Bike;
    onSelectBike: (bike: Bike) => void;
}

const BikeCard: React.FC<BikeCardProps> = ({ bike, onSelectBike }) => {
    const [isImageLoaded, setIsImageLoaded] = useState(false);
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);

    const displayImage = bike.images[selectedImageIndex] || bike.images[0];

    return (
        <Card className="overflow-hidden transform transition-all hover:shadow-md hover:-translate-y-1 group">
            <div className={`h-56 flex items-center justify-center p-4 transition-colors ${!isImageLoaded ? 'bg-gray-200 animate-pulse' : 'bg-gray-100'}`}>
                <img
                    src={displayImage}
                    alt={`${bike.name} side profile`}
                    className={`w-full h-full object-contain transition-opacity duration-300 ${isImageLoaded ? 'opacity-100' : 'opacity-0'}`}
                    onLoad={() => setIsImageLoaded(true)}
                />
            </div>
            {bike.colorVariants && (
                <div className="px-5 pt-3 pb-0">
                    <div className="flex gap-1.5 flex-wrap justify-center">
                        {bike.colorVariants.map((variant) => (
                            <button
                                key={variant.imageIndex}
                                onClick={() => setSelectedImageIndex(variant.imageIndex)}
                                className={`w-6 h-6 rounded-full border-2 transition-all hover:scale-110 ${selectedImageIndex === variant.imageIndex
                                    ? 'border-primary ring-2 ring-primary ring-offset-1'
                                    : 'border-gray-300 hover:border-gray-500'
                                    }`}
                                style={{
                                    background: `linear-gradient(135deg, hsl(${variant.imageIndex * 20}, 70%, 60%), hsl(${variant.imageIndex * 20 + 40}, 70%, 50%))`
                                }}
                                title={variant.colorName}
                                aria-label={`Select ${variant.colorName}`}
                            />
                        ))}
                    </div>
                </div>
            )}
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