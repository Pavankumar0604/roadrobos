import React, { useState, useMemo } from 'react';
import { type Bike, type SearchParams } from '../types';
import BikeCard from './BikeCard';
import Filters from './Filters';
import { FilterIcon, XIcon } from './icons/Icons';

interface SearchResultsPageProps {
    searchParams: SearchParams;
    bikes: Bike[];
    onSelectBike: (bike: Bike) => void;
}

const SearchResultsPage: React.FC<SearchResultsPageProps> = ({ searchParams, bikes, onSelectBike }) => {
    const [filters, setFilters] = useState({
        bikeTypes: ['All'],
        priceRange: [0, 10000],
    });
    const [isFiltersOpen, setIsFiltersOpen] = useState(false);

    const filteredBikes = useMemo(() => {
        return bikes.filter(bike => {
            if (!filters.bikeTypes.includes('All') && !filters.bikeTypes.includes(bike.type)) {
                return false;
            }
            const [minPrice, maxPrice] = filters.priceRange;
            if (bike.price.day < minPrice || bike.price.day > maxPrice) {
                return false;
            }
            return true;
        });
    }, [bikes, filters]);

    const handleFilterChange = (newFilters: any) => {
        setFilters(prev => ({ ...prev, ...newFilters }));
    };

    return (
        <>
            {/* Search Summary Banner */}
            <div className="bg-accent border-b">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <h1 className="text-lg md:text-xl font-heading font-extrabold uppercase tracking-widest text-primary">Bikes available in {searchParams.city}</h1>
                     <div className="text-gray-600 text-sm mt-2 flex flex-col sm:flex-row sm:items-center sm:gap-4">
                        <p>
                            <span className="font-medium">Pickup:</span> {new Date(searchParams.pickupDate).toDateString()} at {searchParams.pickupTime}
                        </p>
                        <div className="hidden sm:block border-l h-4 border-gray-300"></div>
                        <p>
                            <span className="font-medium">Drop-off:</span> {new Date(searchParams.dropDate).toDateString()} at {searchParams.dropTime}
                        </p>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
                <div className="flex flex-col md:flex-row gap-8">
                    {/* Filters Sidebar (Desktop) */}
                    <aside className="hidden md:block w-full md:w-1/4 lg:w-1/5">
                        <div className="sticky top-24">
                            <h2 className="text-lg font-heading font-extrabold uppercase tracking-widest mb-4">Filters</h2>
                            <Filters filters={filters} onFilterChange={handleFilterChange} />
                        </div>
                    </aside>

                    {/* Mobile Filter Button */}
                    <div className="md:hidden">
                        <button onClick={() => setIsFiltersOpen(true)} className="flex w-full justify-center items-center gap-2 bg-white border border-gray-300 p-3 rounded-lg shadow-sm font-semibold">
                            <FilterIcon className="h-5 w-5 text-primary" />
                            <span>Filters</span>
                        </button>
                    </div>

                    {/* Results */}
                    <main className="w-full md:w-3/4 lg:w-4/5">
                        <h2 className="text-lg font-heading font-extrabold uppercase tracking-widest mb-4">{filteredBikes.length} Bikes Found</h2>
                        {filteredBikes.length > 0 ? (
                            <>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                                    {filteredBikes.map(bike => (
                                        <BikeCard key={bike.id} bike={bike} onSelectBike={onSelectBike} />
                                    ))}
                                </div>
                                {/* Pagination/Load More */}
                                <div className="text-center mt-12">
                                    <button className="bg-primary text-white font-semibold px-6 py-3 rounded-lg hover:bg-opacity-90 transition-all">
                                        Load More
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div className="text-center py-16 bg-accent rounded-lg">
                                <h2 className="text-xl font-heading font-extrabold uppercase tracking-widest text-primary">No bikes found</h2>
                                <p className="text-gray-600 mt-2">No bikes found for those dates — try changing times or location.</p>
                            </div>
                        )}
                    </main>
                </div>
            </div>

            {/* Mobile Filter Panel */}
            <div className={`fixed inset-0 bg-black bg-opacity-50 z-50 transition-opacity md:hidden ${isFiltersOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={() => setIsFiltersOpen(false)}>
                <div className={`fixed inset-y-0 left-0 w-4/5 max-w-sm bg-white shadow-xl transform transition-transform duration-300 ease-in-out ${isFiltersOpen ? 'translate-x-0' : '-translate-x-full'}`} onClick={e => e.stopPropagation()}>
                    <div className="p-4 border-b flex justify-between items-center">
                        <h2 className="text-lg font-heading font-extrabold uppercase tracking-widest">Filters</h2>
                        <button onClick={() => setIsFiltersOpen(false)} aria-label="Close filters">
                            <XIcon className="h-6 w-6 text-gray-600" />
                        </button>
                    </div>
                    <div className="p-4 overflow-y-auto h-[calc(100%-120px)]">
                        <Filters filters={filters} onFilterChange={handleFilterChange} />
                    </div>
                    <div className="p-4 border-t absolute bottom-0 left-0 right-0 bg-white">
                        <button onClick={() => setIsFiltersOpen(false)} className="w-full bg-secondary text-white font-semibold py-3 rounded-lg">
                            Apply Filters
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default SearchResultsPage;