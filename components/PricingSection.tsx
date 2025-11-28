import React, { useState, useMemo } from 'react';
import { type Bike } from '../types';
import { InformationCircleIcon, ChevronDownIcon, CashIcon, GaugeIcon, TrendingUpIcon } from './icons/Icons';
import BikeCard from './BikeCard';

interface PricingSectionProps {
    city: string;
    onSelectBike: (bike: Bike) => void;
    bikes: Bike[];
}

type TariffType = 'Hourly' | 'Daily' | 'Weekly' | 'Monthly';
const TARIFFS: TariffType[] = ['Hourly', 'Daily', 'Weekly', 'Monthly'];
const TARIFF_KEY_MAP: Record<TariffType, keyof Bike['price']> = {
    'Hourly': 'hour',
    'Daily': 'day',
    'Weekly': 'week',
    'Monthly': 'month',
};
const BIKE_TYPES: ('All' | Bike['type'])[] = ['All', 'Scooter', 'Geared', 'Electric', 'Superbike'];

const PricingSection: React.FC<PricingSectionProps> = ({ city, onSelectBike, bikes }) => {
    const [activeTariff, setActiveTariff] = useState<TariffType>('Daily');
    const [activeBikeType, setActiveBikeType] = useState<typeof BIKE_TYPES[number]>('All');
    const [sortBy, setSortBy] = useState('price-asc');
    const [selectedImageIndexes, setSelectedImageIndexes] = useState<Record<number, number>>({});

    const displayedBikes = useMemo(() => {
        let filtered = [...bikes];

        if (activeBikeType !== 'All') {
            filtered = filtered.filter(bike => bike.type === activeBikeType);
        }

        const tariffKey = TARIFF_KEY_MAP[activeTariff];

        filtered.sort((a, b) => {
            if (a.availability === 'Coming Soon') return 1;
            if (b.availability === 'Coming Soon') return -1;
            const priceA = a.price[tariffKey];
            const priceB = b.price[tariffKey];
            if (sortBy === 'price-asc') return priceA - priceB;
            if (sortBy === 'price-desc') return priceB - priceA;
            return 0;
        });

        return filtered;
    }, [activeTariff, activeBikeType, sortBy, bikes]);

    const getTariffDetails = (bike: Bike) => {
        const tariffKey = TARIFF_KEY_MAP[activeTariff];
        const kmLimitKey = TARIFF_KEY_MAP[activeTariff];

        let price = bike.price[tariffKey];
        let priceUnit = `/${tariffKey}`;
        if (activeTariff === 'Hourly') priceUnit = '/hr';

        let kmLimit = bike.kmLimit[kmLimitKey];
        let kmUnit = `km/${tariffKey}`;
        if (activeTariff === 'Hourly') kmUnit = 'km/hr';

        return { price, priceUnit, kmLimit, kmUnit };
    };

    const pricingFaqs = [
        { q: 'What happens if I exceed the kilometre limit?', a: 'An excess charge per kilometer, as mentioned in the tariff table, will be applicable for every extra kilometer you ride.' },
        { q: 'Can I extend my rental beyond the booked period?', a: 'Yes, extensions are possible subject to availability. Please contact our support team to extend your booking and make the necessary payment.' },
        { q: 'When is the deposit refunded?', a: 'The security deposit is refunded to your original payment method within 5-7 business days after the bike is returned and inspected for damages.' },
    ];

    const handleColorSelect = (bikeId: number, imageIndex: number) => {
        setSelectedImageIndexes(prev => ({ ...prev, [bikeId]: imageIndex }));
    };

    const getDisplayImage = (bike: Bike) => {
        if (selectedImageIndexes[bike.id] !== undefined) {
            return bike.images[selectedImageIndexes[bike.id]];
        }
        return bike.images[0];
    };

    return (
        <section id="pricing" className="py-20 bg-accent">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="text-center mb-8">
                    <h2 className="text-2xl md:text-3xl font-heading font-extrabold uppercase tracking-widest text-primary">Tariff & Pricing</h2>
                    <p className="mt-3 text-lg text-gray-600">Transparent bike rental fares in {city} – no hidden charges</p>
                    <p className="mt-4 text-xs text-gray-500">*All prices exclude taxes and fuel. Images for representation only.</p>
                </div>

                {/* Intro */}
                <div className="max-w-4xl mx-auto bg-white p-6 rounded-xl shadow-sm mb-12">
                    <p className="text-center text-gray-700">At RoAd RoBo's, we believe renting a bike should be simple, affordable and flexible. Whether you need a ride for a few hours, a full day, or a whole month — choose your duration, pick your bike, and you're good to go.</p>
                </div>

                {/* Filters */}
                <div className="mb-8 p-4 bg-white rounded-xl shadow-sm flex flex-col md:flex-row justify-between items-center gap-4 sticky top-16 z-30">
                    <div className="flex flex-wrap justify-center bg-gray-100 p-1 rounded-lg">
                        {TARIFFS.map(tariff => (
                            <button key={tariff} onClick={() => setActiveTariff(tariff)} className={`px-3 py-2 text-sm font-semibold rounded-md transition-colors ${activeTariff === tariff ? 'bg-primary text-white shadow' : 'text-gray-600 hover:bg-gray-200'}`}>
                                {tariff}
                            </button>
                        ))}
                    </div>
                    <div className="flex items-center gap-4">
                        <select value={activeBikeType} onChange={e => setActiveBikeType(e.target.value as any)} className="bg-white border border-input rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-input-focus text-sm p-2">
                            {BIKE_TYPES.map(type => <option key={type} value={type}>{type} Bikes</option>)}
                        </select>
                        <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="bg-white border border-input rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-input-focus text-sm p-2">
                            <option value="price-asc">Price: Low to High</option>
                            <option value="price-desc">Price: High to Low</option>
                        </select>
                    </div>
                </div>

                {/* Pricing Table (Desktop) */}
                <div className="hidden md:block bg-white rounded-xl shadow-subtle overflow-hidden">
                    <table className="w-full text-sm text-left text-gray-600">
                        <thead className="bg-gray-50 text-xs uppercase tracking-wider">
                            <tr>
                                <th className="p-4">Bike Model</th>
                                <th className="p-4 text-center">Rate</th>
                                <th className="p-4 text-center">
                                    <div className="flex items-center justify-center gap-1">
                                        <GaugeIcon className="h-4 w-4" />
                                        <span>KM Limit</span>
                                    </div>
                                </th>
                                <th className="p-4 text-center">
                                    <div className="flex items-center justify-center gap-1">
                                        <TrendingUpIcon className="h-4 w-4" />
                                        <span>Excess KM</span>
                                    </div>
                                </th>
                                <th className="p-4 text-center">
                                    <div className="flex items-center justify-center gap-1">
                                        <CashIcon className="h-4 w-4" />
                                        <span>Deposit</span>
                                    </div>
                                </th>
                                <th className="p-4"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {displayedBikes.map((bike, index) => {
                                const { price, priceUnit, kmLimit, kmUnit } = getTariffDetails(bike);
                                const displayImage = getDisplayImage(bike);
                                return (
                                    <tr key={bike.id} className={`border-t ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                                        <td className="p-4">
                                            <div className="flex items-center gap-4">
                                                <div className="flex flex-col items-center">
                                                    <img src={displayImage} alt={bike.name} className="h-20 w-28 object-contain rounded-md" />
                                                    {bike.colorVariants && (
                                                        <div className="flex gap-1 mt-2 flex-wrap max-w-[80px]">
                                                            {bike.colorVariants.map((variant) => (
                                                                <button
                                                                    key={variant.imageIndex}
                                                                    onClick={() => handleColorSelect(bike.id, variant.imageIndex)}
                                                                    className={`w-4 h-4 rounded-full border-2 transition-all hover:scale-110 ${(selectedImageIndexes[bike.id] ?? 0) === variant.imageIndex
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
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-primary">{bike.name}</p>
                                                    <p className="text-xs text-gray-500">{bike.type} | {bike.specs.cc}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4 text-center font-semibold text-primary">{bike.availability === 'Coming Soon' ? 'N/A' : `₹${price}`}<span className="font-normal text-gray-500 text-xs">{priceUnit}</span></td>
                                        <td className="p-4 text-center">{bike.availability === 'Coming Soon' ? 'N/A' : <>{kmLimit}<span className="text-xs">{kmUnit}</span></>}</td>
                                        <td className="p-4 text-center">{bike.availability === 'Coming Soon' ? 'N/A' : `₹${bike.excessKmCharge}/km`}</td>
                                        <td className="p-4 text-center">{bike.availability === 'Coming Soon' ? 'N/A' : `₹${bike.deposit}`}</td>
                                        <td className="p-4">
                                            <button
                                                onClick={() => onSelectBike(bike)}
                                                disabled={bike.availability === 'Coming Soon'}
                                                className="bg-primary text-white font-semibold px-4 py-2 rounded-lg hover:bg-opacity-90 transition-all text-xs whitespace-nowrap disabled:bg-gray-400 disabled:cursor-not-allowed"
                                            >
                                                {bike.availability === 'Coming Soon' ? 'Coming Soon' : 'View Details'}
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Pricing Cards (Mobile) */}
                <div className="md:hidden space-y-4">
                    {displayedBikes.map(bike => (
                        <BikeCard key={bike.id} bike={bike} onSelectBike={onSelectBike} />
                    ))}
                </div>

                {/* Important Notes */}
                <div className="mt-12 bg-white p-6 rounded-xl shadow-sm">
                    <h3 className="text-lg font-heading font-extrabold uppercase tracking-widest text-primary mb-4">Important Notes</h3>
                    <ul className="space-y-3 text-gray-600 text-sm list-disc list-inside">
                        <li><span className="font-semibold">Deposit:</span> All rentals require a refundable deposit which will be returned after vehicle inspection.</li>
                        <li><span className="font-semibold">Fuel:</span> Fuel costs are not included. Please return the bike with the same fuel level to avoid charges.</li>
                        <li><span className="font-semibold">Late Returns:</span> Extra charges will be applicable if the bike is returned after the scheduled drop-off time.</li>
                        <li><span className="font-semibold">Excess Kilometres:</span> Each booking includes a km-limit; excess kms will incur extra charges as shown above.</li>
                        <li><span className="font-semibold">Insurance & Safety:</span> A helmet is included. Optional personal insurance is available for an extra fee.</li>
                    </ul>
                    <a href="#" className="text-sm text-primary font-semibold mt-4 inline-block hover:underline">View full terms & conditions</a>
                </div>

                {/* Quick FAQ */}
                <div className="mt-12 max-w-4xl mx-auto">
                    <h3 className="text-lg font-heading font-extrabold uppercase tracking-widest text-primary mb-4 text-center">Quick Questions</h3>
                    <div className="space-y-4">
                        {pricingFaqs.map(faq => (
                            <details key={faq.q} className="bg-white p-4 rounded-lg shadow-sm group">
                                <summary className="flex justify-between items-center font-medium cursor-pointer list-none">
                                    <span>{faq.q}</span>
                                    <ChevronDownIcon className="h-5 w-5 text-gray-500 transition-transform duration-300 group-open:rotate-180" />
                                </summary>
                                <div className="text-gray-600 mt-3 text-sm">{faq.a}</div>
                            </details>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default PricingSection;
