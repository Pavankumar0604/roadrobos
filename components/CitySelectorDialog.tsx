import React, { useState, useMemo } from 'react';
import { type City } from '../types';
import { XIcon, SearchIcon } from './icons/Icons';

interface CitySelectorDialogProps {
  cities: City[];
  onClose: () => void;
  onSelectCity: (city: City) => void;
}

const CitySelectorDialog: React.FC<CitySelectorDialogProps> = ({ cities, onClose, onSelectCity }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCities = useMemo(() => {
    return cities.filter(city => 
      city.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [cities, searchTerm]);

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 z-[60] flex items-center justify-center p-4"
      aria-modal="true"
      role="dialog"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-lg w-full max-w-4xl max-h-[90vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-4 border-b flex justify-between items-center">
          <div className="relative w-full mr-4">
             <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <SearchIcon className="h-5 w-5" />
            </span>
            <input
              type="text"
              placeholder="Search or type city to select"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-16 py-2 bg-white border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-input-focus text-text-body placeholder-text-muted"
            />
             {searchTerm && (
                <button 
                    onClick={() => setSearchTerm('')} 
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-text-muted hover:text-primary font-medium"
                >
                    Clear
                </button>
            )}
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800" aria-label="Close dialog">
            <XIcon className="h-6 w-6" />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto">
          <div className="flex flex-wrap gap-3">
            {filteredCities.map(city => (
              <button
                key={city.name}
                onClick={() => onSelectCity(city)}
                className="px-4 py-2 bg-accent text-primary border border-card rounded-full hover:bg-primary hover:text-white transition-colors duration-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-secondary"
                aria-label={`Select city ${city.name}`}
              >
                {city.name}
              </button>
            ))}
          </div>
          {filteredCities.length === 0 && (
            <div className="text-center py-10 text-gray-500">
              <p>No cities found matching your search.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CitySelectorDialog;