/**
 * README: RoAd RoBo’s Offers Page Prototype
 *
 * This component is a self-contained, interactive prototype of the "Offers" page.
 *
 * --- THEME TOKENS ---
 * - Primary Color: #084C3E (class: text-primary, bg-primary)
 * - Accent Color: #2EB67D (class: text-secondary, bg-secondary)
 * - Warm CTA Accent: #FF7A59 (class: text-accent-warm, bg-accent-warm)
 * - Background: #F9FAFB (class: bg-accent)
 *
 * --- DATA SHAPE (for `Offer` type) ---
 * See `types.ts` for the full interface. Key fields include:
 * - id: string
 * - title: string
 * - type: 'app' | 'first' | 'seasonal' | 'referral' | 'corporate'
 * - code: string | null
 * - discountPercent?: number | null
 * - validityDate: string
 *
 * --- BACKEND HOOKUP INSTRUCTIONS ---
 * This is a client-side prototype. To connect to a backend:
 * 1. Fetch offers: Replace the static `offersData` import with an API call.
 *    - Example Endpoint: GET /api/offers
 *    - Handle loading and error states.
 * 2. Apply offer: The "Book Now" buttons currently open a stub modal.
 *    - This should trigger your application's booking flow, passing the `offer.id` or `offer.code`.
 *    - An API might be needed to validate the offer code before checkout.
 *    - Example Endpoint: POST /api/apply-offer (body: { cartId, offerCode })
 */
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { type Offer } from '../types';
import { ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon, ClipboardCopyIcon, GiftIcon, SearchIcon, SparklesIcon, TagIcon, XIcon, CheckCircleIcon } from './icons/Icons';
import Card from './Card';

interface OffersPageProps {
    offers: Offer[];
}

type OfferType = 'All' | Offer['type'];
const OFFER_TYPES: OfferType[] = ['All', 'seasonal', 'first', 'app', 'referral', 'corporate'];
const OFFER_TYPE_NAMES: Record<Offer['type'], string> = {
    seasonal: 'Seasonal',
    first: 'First Ride',
    app: 'App Exclusive',
    referral: 'Referral',
    corporate: 'Corporate',
}

// --- Sub-components ---

const OfferCard: React.FC<{ offer: Offer; onCopyCode: (code: string) => void; onBookNow: (offer: Offer) => void }> = ({ offer, onCopyCode, onBookNow }) => {
    // Analytics hook stub
    const trackEvent = (eventName: string, offerId: string) => console.log(`EVENT: ${eventName}`, { offerId });

    useEffect(() => {
        trackEvent('offer_view', offer.id);
    }, [offer.id]);

    const handleBookClick = () => {
        trackEvent('offer_book_click', offer.id);
        onBookNow(offer);
    };

    const handleCopyClick = (code: string) => {
        trackEvent('offer_copy', offer.id);
        onCopyCode(code);
    };

    return (
        <Card className="overflow-hidden flex flex-col group transition-all duration-300 hover:shadow-md hover:-translate-y-1 p-0">
            <div className="relative">
                <img src={offer.imagePlaceholder} alt={offer.title} className="w-full h-40 object-cover" />
                <div className="absolute top-2 right-2">
                    {(offer.discountPercent || offer.flatAmount) && (
                        <span className="bg-accent-warm text-white text-sm font-bold px-3 py-1 rounded-full">
                            {offer.discountPercent ? `${offer.discountPercent}% OFF` : `₹${offer.flatAmount} OFF`}
                        </span>
                    )}
                </div>
            </div>
            <div className="p-5 flex flex-col flex-grow">
                <div className="flex flex-wrap gap-2 text-xs mb-2">
                    <span className="bg-primary/10 text-primary font-semibold px-2 py-1 rounded">{OFFER_TYPE_NAMES[offer.type]}</span>
                    {offer.applicableCities[0] !== 'All' && <span className="bg-gray-100 text-gray-700 font-semibold px-2 py-1 rounded">City: {offer.applicableCities[0]}</span>}
                    {offer.endsIn && <span className="bg-red-100 text-red-800 font-semibold px-2 py-1 rounded">Ends in: {offer.endsIn} days</span>}
                </div>
                <h3 className="text-lg font-bold text-primary flex-grow">{offer.title}</h3>
                <p className="text-sm text-gray-500 mt-1">{offer.autoApplied ? "Auto-applied at checkout" : `Use code: ${offer.code}`}</p>
                <ul className="text-sm text-gray-600 mt-3 space-y-1 list-disc list-inside flex-grow">
                    {offer.descriptionBullets.map((bullet, i) => <li key={i}>{bullet}</li>)}
                </ul>
                <p className="text-xs text-gray-400 mt-4">Valid till {offer.validityDate} • T&Cs apply</p>
                <div className="grid grid-cols-2 gap-3 mt-4">
                    {offer.code && (
                        <button onClick={() => handleCopyClick(offer.code!)} className="w-full flex items-center justify-center gap-2 border border-primary text-primary font-semibold py-2.5 rounded-lg hover:bg-primary/5 transition-all">
                            <ClipboardCopyIcon className="w-4 h-4" /> Copy Code
                        </button>
                    )}
                    <button onClick={handleBookClick} className={`w-full bg-primary text-white font-semibold py-2.5 rounded-lg hover:bg-opacity-90 transition-all ${!offer.code ? 'col-span-2' : ''}`}>
                        Book Now
                    </button>
                </div>
            </div>
        </Card>
    );
};

const Carousel: React.FC<{ offers: Offer[], onBookNow: (offer: Offer) => void }> = ({ offers, onBookNow }) => {
    const slides = offers.filter(o => o.type === 'seasonal').slice(0, 2);
    const [currentIndex, setCurrentIndex] = useState(0);

    const nextSlide = useCallback(() => {
        setCurrentIndex(prev => (prev === slides.length - 1 ? 0 : prev + 1));
    }, [slides.length]);

    useEffect(() => {
        if (slides.length === 0) return;
        const interval = setInterval(nextSlide, 4000);
        return () => clearInterval(interval);
    }, [nextSlide, slides.length]);

    if (slides.length === 0) {
        return <div className="h-64 md:h-80 bg-gray-200 rounded-xl flex items-center justify-center"><p>No featured offers available right now.</p></div>;
    }

    return (
        <div className="relative w-full overflow-hidden rounded-xl shadow-md">
            <div className="flex transition-transform duration-700 ease-in-out" style={{ transform: `translateX(-${currentIndex * 100}%)` }}>
                {slides.map(slide => (
                    <div key={slide.id} className="relative w-full flex-shrink-0 h-64 md:h-80">
                        <img src={slide.imagePlaceholder} alt={slide.title} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/50 flex flex-col justify-center items-start p-8 md:p-12 text-white">
                            <h2 className="text-2xl md:text-3xl font-heading font-extrabold uppercase tracking-widest">{slide.title}</h2>
                            <p className="mt-2 text-lg">{slide.descriptionBullets[0]}</p>
                            <button onClick={() => onBookNow(slide)} className="mt-4 bg-accent-warm font-bold py-2 px-6 rounded-lg hover:bg-opacity-90 transition-all">
                                Learn More
                            </button>
                        </div>
                    </div>
                ))}
            </div>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
                {slides.map((_, index) => (
                    <button key={index} onClick={() => setCurrentIndex(index)} className={`h-2 rounded-full transition-all ${currentIndex === index ? 'w-6 bg-white' : 'w-2 bg-white/50'}`} aria-label={`Go to slide ${index + 1}`}></button>
                ))}
            </div>
        </div>
    );
};

const OfferDetailModal: React.FC<{ offer: Offer; onClose: () => void }> = ({ offer, onClose }) => {
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', handleEsc);
        document.body.style.overflow = 'hidden';
        return () => {
            document.removeEventListener('keydown', handleEsc);
            document.body.style.overflow = 'auto';
        };
    }, [onClose]);

    return (
        <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4" role="dialog" aria-modal="true" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b flex justify-between items-center">
                    <h2 className="text-lg font-heading font-extrabold uppercase tracking-widest text-primary">{offer.title}</h2>
                    <button onClick={onClose} aria-label="Close dialog"><XIcon className="h-6 w-6 text-gray-500 hover:text-gray-800" /></button>
                </div>
                <div className="p-6 overflow-y-auto space-y-4">
                    <p><strong>Details:</strong> This is a stubbed modal. In a real application, it would show full terms, applicable bikes, and a clear booking path.</p>
                    <p><strong>Code:</strong> {offer.code || 'N/A'}</p>
                    <p><strong>Validity:</strong> {offer.validityDate}</p>
                </div>
                <div className="p-4 bg-gray-50 border-t mt-auto">
                    <button className="w-full bg-accent-warm text-white font-bold py-3 rounded-lg hover:bg-opacity-90 transition-all">Book Now & Apply Offer</button>
                </div>
            </div>
        </div>
    );
};

const Toast: React.FC<{ message: string, show: boolean }> = ({ message, show }) => (
    <div className={`fixed bottom-5 right-5 bg-primary text-white px-5 py-3 rounded-lg shadow-lg transition-transform duration-300 ${show ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
        <p className="flex items-center gap-2"><CheckCircleIcon className="w-5 h-5"/> {message}</p>
    </div>
);


// --- Main Page Component ---
const OffersPage: React.FC<OffersPageProps> = ({ offers }) => {
    const [filters, setFilters] = useState<{ city: string; type: OfferType; search: string }>({ city: 'Bangalore', type: 'All', search: '' });
    const [sort, setSort] = useState('popular');
    const [showToast, setShowToast] = useState(false);
    const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);

    const handleFilterChange = (key: keyof typeof filters, value: string) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const filteredAndSortedOffers = useMemo(() => {
        let items = offers.filter(o => o.status === 'Active');
        // Filter
        if (filters.type !== 'All') {
            items = items.filter(o => o.type === filters.type);
        }
        if (filters.search) {
            const searchTerm = filters.search.toLowerCase();
            items = items.filter(o => o.title.toLowerCase().includes(searchTerm) || o.code?.toLowerCase().includes(searchTerm));
        }
        // Sort
        if (sort === 'ending-soon') {
            items.sort((a, b) => (a.endsIn || 999) - (b.endsIn || 999));
        }
        if (sort === 'highest-discount') {
            const getDiscountValue = (o: Offer) => o.discountPercent || (o.flatAmount ? o.flatAmount / 10 : 0);
            items.sort((a, b) => getDiscountValue(b) - getDiscountValue(a));
        }
        return items;
    }, [filters, sort, offers]);
    
    const handleCopyCode = useCallback((code: string) => {
        navigator.clipboard.writeText(code);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 2000);
    }, []);

    return (
        <div className="bg-accent">
            {/* Hero */}
            <section className="bg-primary text-white text-center py-20 relative overflow-hidden">
                <div className="absolute inset-0 bg-cover bg-center opacity-10" style={{ backgroundImage: "url('https://picsum.photos/seed/offerhero/1920/1080')" }}></div>
                <div className="container mx-auto px-4 relative z-10">
                    <h1 className="text-3xl md:text-4xl font-heading font-extrabold uppercase tracking-widest">Exclusive Offers & Deals</h1>
                    <p className="mt-4 text-lg text-gray-200 max-w-3xl mx-auto">Ride More, Save More with RoAd RoBo’s. Seasonal discounts, app-only deals and referral rewards. Offers valid for a limited time.</p>
                    <button onClick={() => document.getElementById('offers-grid')?.scrollIntoView({ behavior: 'smooth' })} className="mt-8 bg-accent-warm font-bold py-3 px-8 rounded-lg hover:bg-opacity-90 transition-all text-lg">
                        Book Now & Save
                    </button>
                </div>
            </section>
            
            {/* Filter & Sort Bar */}
            <div className="sticky top-16 bg-accent/80 backdrop-blur-sm z-40 border-b">
                 <div className="container mx-auto px-4 py-4">
                    <Card className="p-4">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                            <div className="flex-grow w-full md:w-auto">
                               <div className="relative">
                                   <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"/>
                                   <input type="search" placeholder="Search offers (e.g., 'first', 'GEAR20')" value={filters.search} onChange={e => handleFilterChange('search', e.target.value)} className="w-full pl-10 pr-4 py-2 bg-white border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-input-focus"/>
                               </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className="text-sm font-medium hidden lg:inline">Sort by:</span>
                                <select value={sort} onChange={e => setSort(e.target.value)} className="bg-white border border-input rounded-lg text-sm p-2.5 focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-input-focus">
                                    <option value="popular">Most Popular</option>
                                    <option value="ending-soon">Ending Soon</option>
                                    <option value="highest-discount">Highest Discount</option>
                                </select>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-4">
                            {OFFER_TYPES.map(type => (
                                 <button key={type} onClick={() => handleFilterChange('type', type)} className={`px-3 py-1.5 text-sm font-semibold rounded-full transition-colors ${filters.type === type ? 'bg-primary text-white' : 'bg-white text-gray-700 hover:bg-gray-200 border'}`}>
                                    {type === 'All' ? 'All' : OFFER_TYPE_NAMES[type as Offer['type']]}
                                </button>
                            ))}
                        </div>
                    </Card>
                 </div>
            </div>

            <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Promotional Banner */}
                <section className="mb-12">
                    <Carousel offers={offers} onBookNow={setSelectedOffer} />
                </section>
                
                {/* Offers Grid */}
                <section id="offers-grid">
                    <div className="flex justify-between items-baseline mb-6">
                        <h2 className="text-xl md:text-2xl font-heading font-extrabold uppercase tracking-widest text-primary flex items-center gap-2">
                           <GiftIcon className="w-7 h-7"/> Active Offers
                        </h2>
                        <span className="text-gray-500 font-medium">Showing {filteredAndSortedOffers.length} offers</span>
                    </div>
                    {filteredAndSortedOffers.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {filteredAndSortedOffers.map(offer => <OfferCard key={offer.id} offer={offer} onCopyCode={handleCopyCode} onBookNow={setSelectedOffer} />)}
                        </div>
                    ) : (
                        <div className="text-center py-16 bg-white rounded-xl">
                            <h3 className="text-2xl font-bold">No Offers Found</h3>
                            <p className="text-gray-600 mt-2">Please adjust your filters or check back later!</p>
                        </div>
                    )}
                </section>
                
                {/* Terms & Conditions Accordion */}
                <section className="mt-20 max-w-4xl mx-auto">
                    <h2 className="text-2xl font-heading font-extrabold uppercase tracking-widest text-center mb-6 text-primary">Before You Ride — Offer T&Cs</h2>
                    <div className="space-y-2">
                         <details className="bg-white p-4 rounded-lg shadow-sm group">
                            <summary className="flex justify-between items-center font-medium cursor-pointer list-none">
                                <span>Applicability & Limitations</span>
                                <ChevronDownIcon className="h-5 w-5 text-gray-500 transition-transform duration-300 group-open:rotate-180" />
                            </summary>
                            <div className="text-gray-600 mt-3 text-sm">Each offer is valid only for the specified period, cities, and bike models. Offers cannot be combined unless explicitly stated. RoAd RoBo’s reserves the right to modify or withdraw an offer at any time.</div>
                        </details>
                         <details className="bg-white p-4 rounded-lg shadow-sm group">
                            <summary className="flex justify-between items-center font-medium cursor-pointer list-none">
                                <span>Cancellation & Refund Rules</span>
                                <ChevronDownIcon className="h-5 w-5 text-gray-500 transition-transform duration-300 group-open:rotate-180" />
                            </summary>
                            <div className="text-gray-600 mt-3 text-sm">If a booking made with an offer is cancelled, the offer becomes void and cannot be reused. Refunds will be processed based on the amount paid after the discount was applied, as per our standard cancellation policy.</div>
                        </details>
                    </div>
                </section>
                
                 {/* CTA Footer Strip */}
                <section className="mt-20">
                     <div className="bg-white rounded-xl shadow-md p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
                        <div className="text-center md:text-left">
                            <h2 className="text-2xl font-heading font-extrabold uppercase tracking-widest text-primary">Ready to Ride?</h2>
                            <p className="mt-2 text-gray-600">Browse our fleet and apply your favorite offer at checkout.</p>
                        </div>
                        <div className="flex items-center gap-4 flex-col sm:flex-row">
                            <button className="bg-accent-warm text-white font-bold py-3 px-8 rounded-lg hover:bg-opacity-90 transition-all text-lg">Browse Fleet</button>
                        </div>
                    </div>
                </section>
            </main>
            
            {selectedOffer && <OfferDetailModal offer={selectedOffer} onClose={() => setSelectedOffer(null)} />}
            <Toast message="Code copied to clipboard!" show={showToast} />
        </div>
    );
};

export default OffersPage;
