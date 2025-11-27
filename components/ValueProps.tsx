import React from 'react';
import { CurrencyRupeeIcon, LocationMarkerIcon, ShieldCheckIcon, SupportIcon } from './icons/Icons';
import Card from './Card';

const valueProps = [
  {
    icon: <CurrencyRupeeIcon className="h-8 w-8 text-primary" />,
    title: 'Affordable Rates',
    description: 'Transparent pricing from ₹25/hr.',
  },
  {
    icon: <LocationMarkerIcon className="h-8 w-8 text-primary" />,
    title: 'Doorstep Pickup',
    description: 'Delivered to your location anywhere in the city.',
  },
  {
    icon: <ShieldCheckIcon className="h-8 w-8 text-primary" />,
    title: 'Verified & Insured',
    description: 'Every bike inspected, insurance available.',
  },
  {
    icon: <SupportIcon className="h-8 w-8 text-primary" />,
    title: '24/7 Support',
    description: 'We ride with you, round the clock.',
  },
];

const ValueProps: React.FC = () => {
  return (
    <section className="py-16 bg-accent">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {valueProps.map((prop, index) => (
            <Card key={index} className="text-center transform transition-transform hover:-translate-y-2">
              <div className="p-6">
                <div className="flex justify-center items-center h-16 w-16 mx-auto bg-primary/10 rounded-full">
                  {prop.icon}
                </div>
                <h3 className="text-lg font-heading font-extrabold uppercase tracking-widest mt-4">{prop.title}</h3>
                <p className="text-gray-600 mt-1">{prop.description}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default React.memo(ValueProps);