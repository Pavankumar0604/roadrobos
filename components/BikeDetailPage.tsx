import React, { useState, useMemo, useEffect } from 'react';
import { type Bike, type SearchParams } from '../types';
import BikeCard from './BikeCard';
import { ChevronLeftIcon, ChevronRightIcon, ShieldCheckIcon, SupportIcon, CogIcon, CalendarIcon, ClockIcon } from './icons/Icons';
import Card from './Card';

interface BikeDetailPageProps {
    bike: Bike;
    allBikes: Bike[];
    searchParams: SearchParams | null;
    onBack: () => void;
    onBookNow: (bike: Bike, searchParams: SearchParams, addons: { helmet: boolean; insurance: boolean; }, totalFare: number) => void;
    onSelectBike: (bike: Bike) => void;
}

const ImageCarousel: React.FC<{ images: string[], bikeName: string }> = ({ images, bikeName }) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    const prevSlide = () => setCurrentIndex(i => (i === 0 ? images.length - 1 : i - 1));
    const nextSlide = () => setCurrentIndex(i => (i === images.length - 1 ? 0 : i + 1));

    return (
        <div className="relative w-full aspect-[4/3] overflow-hidden rounded-xl shadow-lg">
            <div className="flex transition-transform duration-500 ease-in-out h-full" style={{ transform: `translateX(-${currentIndex * 100}%)` }}>
                {images.map((img, index) => (
                    <img key={index} src={img} alt={`${bikeName} view ${index + 1}`} className="w-full h-full object-cover flex-shrink-0" />
                ))}
            </div>
            <button onClick={prevSlide} aria-label="Previous image" className="absolute top-1/2 left-2 transform -translate-y-1/2 bg-white/70 hover:bg-white rounded-full p-2 focus:outline-none focus:ring-2 focus:ring-primary">
                <ChevronLeftIcon className="h-6 w-6 text-gray-800" />
            </button>
            <button onClick={nextSlide} aria-label="Next image" className="absolute top-1/2 right-2 transform -translate-y-1/2 bg-white/70 hover:bg-white rounded-full p-2 focus:outline-none focus:ring-2 focus:ring-primary">
                <ChevronRightIcon className="h-6 w-6 text-gray-800" />
            </button>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
                {images.map((_, index) => (
                    <button key={index} onClick={() => setCurrentIndex(index)} aria-label={`Go to image ${index+1}`} className={`h-2 w-2 rounded-full ${currentIndex === index ? 'bg-white' : 'bg-white/50'}`}></button>
                ))}
            </div>
        </div>
    );
};


const BookingWidget: React.FC<{ bike: Bike, searchParams: SearchParams | null, onBookNow: BikeDetailPageProps['onBookNow'] }> = ({ bike, searchParams, onBookNow }) => {
    
    const getDefaultSearchParams = (): SearchParams => {
        const now = new Date();
        const pickupDate = now.toISOString().split('T')[0];
        const pickupTime = now.toTimeString().substring(0,5);
        now.setDate(now.getDate() + 1);
        const dropDate = now.toISOString().split('T')[0];
        const dropTime = pickupTime;

        return {
            pickupLocation: searchParams?.pickupLocation || 'Central Bangalore',
            pickupDate: searchParams?.pickupDate || pickupDate,
            pickupTime: searchParams?.pickupTime || pickupTime,
            dropDate: searchParams?.dropDate || dropDate,
            dropTime: searchParams?.dropTime || dropTime,
            city: searchParams?.city || 'Bangalore',
        };
    };
    
    const [currentSearchParams, setCurrentSearchParams] = useState<SearchParams>(getDefaultSearchParams());
    
    const [addons, setAddons] = useState({ helmet: false, insurance: false });

    const getMinDate = () => {
        const now = new Date();
        now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
        return now.toISOString().split('T')[0];
    };
    
    const { totalPrice, durationText, error } = useMemo(() => {
        const { pickupDate, pickupTime, dropDate, dropTime } = currentSearchParams;
        if (!pickupDate || !pickupTime || !dropDate || !dropTime) {
            return { totalPrice: 0, durationText: '0 days', error: 'Please select pickup and drop-off times.' };
        }
        const start = new Date(`${pickupDate}T${pickupTime}`);
        const end = new Date(`${dropDate}T${dropTime}`);
        
        if (end <= start) {
            return { totalPrice: 0, durationText: '0 days', error: 'Drop-off must be after pickup.' };
        }
        
        const totalHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);

        let cost = 0;
        let remainingHours = totalHours;

        const months = Math.floor(remainingHours / (30 * 24));
        cost += months * bike.price.month;
        remainingHours %= (30 * 24);

        const weeks = Math.floor(remainingHours / (7 * 24));
        cost += weeks * bike.price.week;
        remainingHours %= (7 * 24);
        
        const days = Math.floor(remainingHours / 24);
        cost += days * bike.price.day;
        remainingHours %= 24;

        cost += Math.ceil(remainingHours) * bike.price.hour;

        if (addons.helmet) cost += 50;
        if (addons.insurance) cost += 100;
        
        const totalDays = (totalHours / 24).toFixed(1);

        return { totalPrice: cost, durationText: `${totalDays} days`, error: '' };
    }, [currentSearchParams, addons, bike]);
    
    const handleBooking = () => {
      onBookNow(bike, currentSearchParams, addons, totalPrice);
    };

    return (
         <Card className="p-6 sticky top-24">
            <h3 className="text-xl font-heading font-extrabold uppercase tracking-widest mb-4">Book Your Ride</h3>
             <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500">Pickup</label>
                <div className="mt-1 flex items-center space-x-2">
                  <div className="relative w-full">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none"><CalendarIcon className="h-5 w-5 text-gray-400" /></span>
                    <input type="date" aria-label="Pickup Date" min={getMinDate()} value={currentSearchParams.pickupDate} onChange={e => setCurrentSearchParams(d => ({...d, pickupDate: e.target.value}))} className="block w-full pl-10 bg-white border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-input-focus text-text-body px-3 py-2" />
                  </div>
                   <div className="relative w-full">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none"><ClockIcon className="h-5 w-5 text-gray-400" /></span>
                    <input type="time" aria-label="Pickup Time" value={currentSearchParams.pickupTime} onChange={e => setCurrentSearchParams(d => ({...d, pickupTime: e.target.value}))} className="block w-full pl-10 bg-white border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-input-focus text-text-body px-3 py-2" />
                  </div>
                </div>
              </div>
              <div className="mt-4">
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500">Drop-off</label>
                <div className="mt-1 flex items-center space-x-2">
                  <div className="relative w-full">
                     <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none"><CalendarIcon className="h-5 w-5 text-gray-400" /></span>
                    <input type="date" aria-label="Drop-off Date" min={currentSearchParams.pickupDate || getMinDate()} disabled={!currentSearchParams.pickupDate} value={currentSearchParams.dropDate} onChange={e => setCurrentSearchParams(d => ({...d, dropDate: e.target.value}))} className="block w-full pl-10 bg-white border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-input-focus text-text-body disabled:opacity-50 px-3 py-2" />
                  </div>
                  <div className="relative w-full">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none"><ClockIcon className="h-5 w-5 text-gray-400" /></span>
                    <input type="time" aria-label="Drop-off Time" value={currentSearchParams.dropTime} onChange={e => setCurrentSearchParams(d => ({...d, dropTime: e.target.value}))} className="block w-full pl-10 bg-white border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-input-focus text-text-body px-3 py-2" />
                  </div>
                </div>
              </div>
              <div className="mt-6 border-t pt-4">
                <h4 className="font-semibold text-lg">Add-ons</h4>
                <div className="mt-3 space-y-2">
                   <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer">
                        <div>
                            <span className="font-medium">Extra Helmet</span>
                        </div>
                        <div className="flex items-center space-x-3">
                            <span className="font-semibold text-primary">₹50</span>
                            <input type="checkbox" checked={addons.helmet} onChange={() => setAddons(a => ({...a, helmet: !a.helmet}))} className="h-5 w-5 rounded text-primary focus:ring-primary"/>
                        </div>
                   </label>
                   <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer">
                        <div>
                            <span className="font-medium">Personal Insurance</span>
                        </div>
                        <div className="flex items-center space-x-3">
                            <span className="font-semibold text-primary">₹100</span>
                            <input type="checkbox" checked={addons.insurance} onChange={() => setAddons(a => ({...a, insurance: !a.insurance}))} className="h-5 w-5 rounded text-primary focus:ring-primary"/>
                        </div>
                   </label>
                </div>
            </div>
            {error && <p className="text-error text-sm mt-4">{error}</p>}
            <div className="mt-6 pt-4 border-t">
                 <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-gray-800">Total Price</span>
                    <div className="text-right">
                        <p className="text-2xl font-bold text-primary">₹{totalPrice.toFixed(2)}</p>
                        <p className="text-xs text-gray-500">for {durationText}</p>
                    </div>
                 </div>
                 <button onClick={handleBooking} disabled={!!error || totalPrice === 0} className="w-full mt-4 bg-secondary text-white font-bold py-3 rounded-lg hover:bg-opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                    Book Now
                 </button>
                 <p className="text-xs text-gray-500 mt-2 text-center">Refundable deposit of ₹{bike.deposit} collected at pickup.</p>
            </div>
        </Card>
    );
}

const BikeDetailPage: React.FC<BikeDetailPageProps> = ({ bike, allBikes, searchParams, onBack, onBookNow, onSelectBike }) => {
    const similarBikes = useMemo(() => {
        return allBikes.filter(b => b.type === bike.type && b.id !== bike.id).slice(0, 3);
    }, [allBikes, bike]);

    const AssurancesSection = (
        <div className="border-t pt-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-center md:text-left">
               <div className="flex items-center gap-4">
                   <div className="flex-shrink-0 bg-primary/10 rounded-full p-3"><ShieldCheckIcon className="w-8 h-8 text-primary"/></div>
                   <div className="text-left">
                       <h4 className="text-base font-heading font-extrabold uppercase tracking-widest">Verified & Insured</h4>
                       <p className="text-gray-600 text-sm">Every bike is thoroughly inspected and comes with optional insurance for a worry-free ride.</p>
                   </div>
               </div>
               <div className="flex items-center gap-4">
                    <div className="flex-shrink-0 bg-primary/10 rounded-full p-3"><SupportIcon className="w-8 h-8 text-primary"/></div>
                   <div className="text-left">
                       <h4 className="text-base font-heading font-extrabold uppercase tracking-widest">24/7 Roadside Assistance</h4>
                       <p className="text-gray-600 text-sm">We've got your back. Our support team is available around the clock to assist you.</p>
                   </div>
               </div>
            </div>
        </div>
    );

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
            {searchParams && (
                <button onClick={onBack} className="text-primary font-semibold mb-6 hover:underline">&larr; Back to Results</button>
            )}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 xl:gap-12">
                {/* Left Column */}
                <div className="lg:col-span-2 space-y-8">
                    <ImageCarousel images={bike.images} bikeName={bike.name} />
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold text-primary">{bike.name}</h1>
                        <p className="text-lg text-gray-600 mt-1">{bike.type === 'Geared' ? "A timeless ride for the open road." : "Your perfect city companion."}</p>
                    </div>
                    {/* Specs & Pricing */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-accent p-6 rounded-xl">
                            <h3 className="text-lg font-heading font-extrabold uppercase tracking-widest text-primary flex items-center gap-2"><CogIcon className="w-6 h-6 text-primary"/>Specifications</h3>
                            <ul className="mt-4 space-y-2 text-gray-700">
                                <li className="flex justify-between"><span>Engine:</span><span className="font-semibold">{bike.specs.cc}</span></li>
                                <li className="flex justify-between"><span>Transmission:</span><span className="font-semibold">{bike.specs.transmission}</span></li>
                                <li className="flex justify-between"><span>Type:</span><span className="font-semibold">{bike.type}</span></li>
                                <li className="flex justify-between"><span>Fuel/Charge:</span><span className="font-semibold">{bike.type === 'Electric' ? 'Electric' : 'Petrol'}</span></li>
                            </ul>
                        </div>
                        <div className="bg-accent p-6 rounded-xl">
                            <h3 className="text-lg font-heading font-extrabold uppercase tracking-widest text-primary">Pricing</h3>
                             <ul className="mt-4 space-y-2 text-gray-700">
                                <li className="flex justify-between"><span>Hourly Rate:</span><span className="font-semibold">₹{bike.price.hour}/hr</span></li>
                                <li className="flex justify-between"><span>Daily Rate:</span><span className="font-semibold">₹{bike.price.day}/day</span></li>
                                <li className="flex justify-between"><span>Deposit:</span><span className="font-semibold">₹{bike.deposit} (Refundable)</span></li>
                                <li className="flex justify-between"><span>Excess KM Charge:</span><span className="font-semibold">₹{bike.excessKmCharge}/km</span></li>
                            </ul>
                        </div>
                    </div>
                     {/* Assurances (Desktop) */}
                    <div className="hidden lg:block">
                        {AssurancesSection}
                    </div>
                </div>

                {/* Right Column - Booking Widget */}
                <aside className="hidden lg:block">
                   <BookingWidget bike={bike} searchParams={searchParams} onBookNow={onBookNow} />
                </aside>
            </div>
            
            {/* Mobile Booking Widget & Assurances */}
            <div className="lg:hidden mt-8">
                <BookingWidget bike={bike} searchParams={searchParams} onBookNow={onBookNow} />
                <div className="mt-8">
                    {AssurancesSection}
                </div>
            </div>

            {/* Similar Bikes */}
            {similarBikes.length > 0 && (
                 <div className="mt-16 pt-12 border-t">
                    <h2 className="text-2xl font-heading font-extrabold uppercase tracking-widest text-center mb-8">You Might Also Like</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {similarBikes.map(b => (
                            <BikeCard key={b.id} bike={b} onSelectBike={onSelectBike} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default BikeDetailPage;