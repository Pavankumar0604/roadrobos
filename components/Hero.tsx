import React, { useState, useRef, useEffect } from 'react';
import { CalendarIcon, ClockIcon, XIcon, ChevronDownIcon, LocationMarkerIcon } from './icons/Icons';
import { type SearchParams } from '../types';
import Card from './Card';
import DateTimePicker from './DateTimePicker';

interface HeroProps {
  onSearch: (params: Omit<SearchParams, 'city'>) => void;
  city: string;
  isSearchFormVisible: boolean;
  onCloseSearchForm: () => void;
  pickupLocations: string[];
  heroTitleTemplate: string;
  heroSubtitle: string;
}

const formatDateForDisplay = (date: Date | null): string => {
  if (!date) return '';
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
};

const formatDateForApi = (date: Date): { date: string; time: string } => {
  const dateStr = date.toISOString().split('T')[0];
  const timeStr = date.toTimeString().substring(0, 5);
  return { date: dateStr, time: timeStr };
};

const Hero: React.FC<HeroProps> = ({ onSearch, city, isSearchFormVisible, onCloseSearchForm, pickupLocations, heroTitleTemplate, heroSubtitle }) => {
  const [pickupLocation, setPickupLocation] = useState('');
  const [pickupDateTime, setPickupDateTime] = useState<Date | null>(null);
  const [dropoffDateTime, setDropoffDateTime] = useState<Date | null>(null);
  const [error, setError] = useState('');
  const [activePicker, setActivePicker] = useState<'pickup' | 'dropoff' | null>(null);
  
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const heroTitle = heroTitleTemplate.replace(/\[city\]/g, city);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
            setIsDropdownOpen(false);
        }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
        document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSearchClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!pickupLocation) {
        setError('Please select a pickup location.');
        return;
    }
    if (!pickupDateTime || !dropoffDateTime) {
      setError('Please select both pickup and drop-off dates and times.');
      return;
    }
    if (dropoffDateTime <= pickupDateTime) {
      setError('Drop-off time must be after pickup time.');
      return;
    }
    setError('');
    
    const pickup = formatDateForApi(pickupDateTime);
    const drop = formatDateForApi(dropoffDateTime);
    
    onSearch({
      pickupLocation,
      pickupDate: pickup.date,
      pickupTime: pickup.time,
      dropDate: drop.date,
      dropTime: drop.time
    });
  };

  const handleDateTimeChange = (date: Date) => {
    if (activePicker === 'pickup') {
      setPickupDateTime(date);
      if (dropoffDateTime && date >= dropoffDateTime) {
        setDropoffDateTime(null); // Reset dropoff if it's no longer valid
      }
    } else {
      setDropoffDateTime(date);
    }
    setActivePicker(null);
  };
  
  return (
    <>
      <section id="hero" className="relative bg-cover bg-center" style={{ backgroundImage: "url('https://wallpapers.com/images/high/five-1920x1080-motorcycle-ducati-rkwevohcnfthpurc.webp')" }}>
        <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent"></div>
        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-12 md:pt-40 md:pb-24 lg:pt-48 lg:pb-32">
          <div className={`grid ${isSearchFormVisible ? 'md:grid-cols-2' : 'md:grid-cols-1'} gap-8 lg:gap-16 items-center`}>
            
            {/* Left Column: Text Content */}
            <div className={`text-white ${isSearchFormVisible ? 'text-center md:text-left' : 'text-center md:col-span-2'}`}>
              <h1 className="text-3xl lg:text-4xl xl:text-5xl font-heading font-extrabold uppercase tracking-widest !leading-tight">{heroTitle}</h1>
              <p className={`mt-4 text-lg md:text-xl text-white/80 max-w-lg mx-auto ${isSearchFormVisible ? 'md:mx-0' : ''}`}>{heroSubtitle}</p>
            </div>

            {/* Right Column: Search Form */}
            {isSearchFormVisible && (
              <div id="hero-search-form" className="w-full max-w-md mx-auto md:mx-0 md:justify-self-end">
                 <Card className="p-6 relative">
                    <button onClick={onCloseSearchForm} aria-label="Close search form" className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 z-10 p-1 rounded-full hover:bg-gray-100">
                        <XIcon className="h-5 w-5" />
                    </button>
                    <form className="space-y-4 text-gray-700">
                      <div>
                        <label htmlFor="pickup-location-btn" className="block text-xs font-semibold uppercase tracking-wider text-gray-500">Pickup Location</label>
                        <div className="relative mt-1" ref={dropdownRef}>
                          <button
                            type="button"
                            id="pickup-location-btn"
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            className="w-full text-left flex items-center justify-between bg-white border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-input-focus px-3 py-2"
                            aria-haspopup="listbox"
                            aria-expanded={isDropdownOpen}
                          >
                            <div className="flex items-center">
                              <LocationMarkerIcon className="h-5 w-5 text-gray-400 mr-2" />
                              <span className={pickupLocation ? 'text-text-body' : 'text-text-muted'}>
                                {pickupLocation || 'Select a pickup point'}
                              </span>
                            </div>
                            <ChevronDownIcon className={`h-5 w-5 text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                          </button>

                          {isDropdownOpen && (
                            <ul
                              className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto"
                              role="listbox"
                            >
                              {pickupLocations.map(point => (
                                <li
                                  key={point}
                                  onClick={() => {
                                    setPickupLocation(point);
                                    setIsDropdownOpen(false);
                                  }}
                                  className="px-4 py-2 text-text-body hover:bg-gray-100 cursor-pointer"
                                  role="option"
                                  aria-selected={pickupLocation === point}
                                >
                                  {point}
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500">Pickup</label>
                        <button type="button" onClick={() => setActivePicker('pickup')} className="mt-1 w-full text-left flex items-center bg-white border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-input-focus text-text-body px-3 py-2">
                          <CalendarIcon className="h-5 w-5 text-gray-400 mr-2" />
                          <span className={pickupDateTime ? 'text-text-body' : 'text-text-muted'}>
                            {pickupDateTime ? formatDateForDisplay(pickupDateTime) : 'Select Date & Time'}
                          </span>
                        </button>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500">Drop-off</label>
                         <button type="button" onClick={() => setActivePicker('dropoff')} disabled={!pickupDateTime} className="mt-1 w-full text-left flex items-center bg-white border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-input-focus text-text-body px-3 py-2 disabled:opacity-50 disabled:cursor-not-allowed">
                          <CalendarIcon className="h-5 w-5 text-gray-400 mr-2" />
                           <span className={dropoffDateTime ? 'text-text-body' : 'text-text-muted'}>
                            {dropoffDateTime ? formatDateForDisplay(dropoffDateTime) : 'Select Date & Time'}
                          </span>
                        </button>
                      </div>
                      
                      {error && <p className="text-error pt-1 text-sm">{error}</p>}
                      
                      <button
                        onClick={handleSearchClick}
                        aria-label="Search for bikes"
                        className="w-full bg-primary text-white font-bold py-3 px-6 rounded-lg hover:bg-opacity-90 transition-all"
                      >
                        Search Bikes
                      </button>
                    </form>
                </Card>
              </div>
            )}

          </div>
        </div>
      </section>

      {activePicker && (
        <DateTimePicker
          isOpen={!!activePicker}
          onClose={() => setActivePicker(null)}
          onChange={handleDateTimeChange}
          value={activePicker === 'pickup' ? pickupDateTime : dropoffDateTime}
          minDate={activePicker === 'dropoff' ? pickupDateTime : new Date()}
          title={`Select ${activePicker === 'pickup' ? 'Pickup' : 'Drop-off'} Date & Time`}
        />
      )}
    </>
  );
};

export default Hero;