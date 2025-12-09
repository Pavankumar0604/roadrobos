import React from 'react';

const BIKE_TYPES = ['All', 'Scooter', 'Geared', 'Electric', 'Superbike'];
const PRICE_RANGES = [
    { label: 'All', range: [0, 10000] },
    { label: 'Under ₹500', range: [0, 500] },
    { label: '₹500 - ₹1000', range: [500, 1000] },
    { label: '₹1000 - ₹2000', range: [1000, 2000] },
    { label: 'Above ₹2000', range: [2000, 10000] },
];

interface FiltersProps {
    filters: {
        bikeTypes: string[];
        priceRange: number[];
    };
    onFilterChange: (newFilters: any) => void;
}

const Filters: React.FC<FiltersProps> = ({ filters, onFilterChange }) => {

    const handleBikeTypeChange = (type: string) => {
        const currentTypes = filters.bikeTypes;
        let newTypes: string[];

        if (type === 'All') {
            newTypes = ['All'];
        } else {
            const withoutAll = currentTypes.includes('All') ? [] : [...currentTypes];
            
            if (withoutAll.includes(type)) {
                newTypes = withoutAll.filter(t => t !== type);
            } else {
                newTypes = [...withoutAll, type];
            }

            if (newTypes.length === 0) {
                newTypes = ['All'];
            }
        }
        onFilterChange({ bikeTypes: newTypes });
    };

    return (
        <div>
            {/* Bike Type Filter */}
            <div>
                <h3 className="font-semibold mb-3 text-gray-800 tracking-wide uppercase text-sm">Bike Type</h3>
                <div className="space-y-2">
                    {BIKE_TYPES.map(type => (
                        <label key={type} className="flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                name="bikeType"
                                value={type}
                                checked={filters.bikeTypes.includes(type)}
                                onChange={() => handleBikeTypeChange(type)}
                                className="h-4 w-4 focus:ring-secondary rounded"
                            />
                            <span className="ml-3 text-gray-700">{type}</span>
                        </label>
                    ))}
                </div>
            </div>

            {/* Price Range Filter */}
            <div className="mt-8">
                <h3 className="font-semibold mb-3 text-gray-800 tracking-wide uppercase text-sm">Price Range (per day)</h3>
                 <div className="space-y-2">
                    {PRICE_RANGES.map(pr => (
                        <label key={pr.label} className="flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                name="priceRange"
                                value={JSON.stringify(pr.range)}
                                checked={JSON.stringify(filters.priceRange) === JSON.stringify(pr.range)}
                                onChange={e => onFilterChange({ priceRange: JSON.parse(e.target.value) })}
                                className="h-4 w-4 focus:ring-secondary rounded"
                            />
                            <span className="ml-3 text-gray-700">{pr.label}</span>
                        </label>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Filters;