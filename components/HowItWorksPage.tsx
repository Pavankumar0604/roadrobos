import React from 'react';
import { PencilAltIcon, KeyIcon, RefreshIcon, ClipboardListIcon, ShieldCheckIcon, ChevronDownIcon, CheckCircleIcon } from './icons/Icons';

const steps = [
  {
    icon: <PencilAltIcon className="h-10 w-10 text-white" />,
    title: 'Choose & Book',
    description: 'Browse our extensive fleet of scooters, geared bikes, and superbikes. Select your desired bike, choose your rental dates and times, and specify your pickup location. Complete the booking online in just a few clicks.'
  },
  {
    icon: <KeyIcon className="h-10 w-10 text-white" />,
    title: 'Verify & Ride',
    description: 'Head to your selected pickup point or wait for our doorstep delivery. Complete a quick digital verification by showing your documents. Grab your sanitized helmet and you’re ready to hit the road.'
  },
  {
    icon: <RefreshIcon className="h-10 w-10 text-white" />,
    title: 'Return & Refund',
    description: 'Return the bike to the designated drop-off point at the end of your trip. The bike must be returned without any damage; otherwise, the security deposit refund will not be initiated. We will perform a thorough inspection of the bike upon return, and if no damage is found, your security deposit will be promptly refunded to your account within 5 to 7 business days.'
  }
];

const documents = [
  { name: 'Valid Driving License', description: 'Original DL is mandatory for verification.' },
  { name: 'ID Proof', description: 'Aadhaar Card, Voter ID, or Passport.' },
  { name: 'Booking Confirmation', description: 'Digital copy on your phone is sufficient.' },
];

const safetyGuidelines = [
  { title: 'Always Wear a Helmet', description: 'We provide one sanitized helmet, and you can rent another. Safety is non-negotiable.' },
  { title: 'Follow Traffic Rules', description: 'Respect speed limits, signals, and lane discipline to ensure a safe journey for everyone.' },
  { title: 'Pre-Ride Check', description: 'Before starting, do a quick check of brakes, lights, and tire pressure.' },
  { title: 'No Racing or Stunts', description: 'Our bikes are for commuting and touring, not for any illegal or dangerous activities.' },
];

const processFaqs = [
  { q: 'Can I choose a different drop-off location?', a: 'Currently, we support same-location pickup and drop-off. We are working on introducing one-way rentals soon.' },
  { q: 'What if I am late for pickup?', a: 'Your booking is held for up to 2 hours from the pickup time. Please contact support if you are running late to avoid auto-cancellation.' },
  { q: 'Is fuel included in the rental?', a: 'Fuel is not included. The bike will be provided with a certain level of fuel, and you are required to return it with the same level.' },
];

const HowItWorksPage: React.FC = () => {
  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="bg-primary text-white text-center py-20">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-heading font-extrabold uppercase tracking-widest">Renting a Bike is Simple</h1>
          <p className="mt-4 text-lg text-gray-200 max-w-2xl mx-auto">Follow our easy 3-step process to get on the road in minutes. Your next adventure is just a few clicks away.</p>
        </div>
      </section>

      {/* Steps Section */}
      <section className="py-20 bg-accent">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center relative">
            {/* Dashed lines for larger screens */}
            <div className="hidden md:block absolute top-1/2 left-0 w-full h-px -mt-5">
              <svg width="100%" height="2" className="absolute" style={{ top: '-10px' }}>
                <line x1="15%" y1="1" x2="85%" y2="1" stroke="#084C3E" strokeWidth="2" strokeDasharray="8 8" opacity="0.3" />
              </svg>
            </div>

            {steps.map((step, index) => (
              <div key={index} className="relative z-10 bg-white p-6 rounded-xl shadow-subtle border">
                <div className="flex items-center justify-center h-20 w-20 mx-auto bg-secondary rounded-full">
                  {step.icon}
                </div>
                <h3 className="text-xl font-heading font-extrabold uppercase tracking-widest mt-6">{index + 1}. {step.title}</h3>
                <p className="text-gray-600 mt-2">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What You'll Need */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="text-center md:text-left">
              <h2 className="text-2xl md:text-3xl font-heading font-extrabold uppercase tracking-widest text-primary flex items-center gap-3">
                <ClipboardListIcon className="h-10 w-10" />
                What You'll Need
              </h2>
              <p className="mt-4 text-lg text-gray-600">To ensure a smooth and quick verification process, please have the following documents ready at the time of pickup.</p>
            </div>
            <div className="space-y-4">
              {documents.map(doc => (
                <div key={doc.name} className="bg-accent p-4 rounded-lg flex items-center">
                  <CheckCircleIcon className="h-6 w-6 text-secondary flex-shrink-0 mr-4" />
                  <div>
                    <h4 className="font-semibold text-primary">{doc.name}</h4>
                    <p className="text-sm text-gray-600">{doc.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Safety Section */}
      <section className="py-20 bg-accent">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-heading font-extrabold uppercase tracking-widest text-primary flex items-center justify-center gap-3">
              <ShieldCheckIcon className="h-10 w-10" />
              Safety is Our Priority
            </h2>
            <p className="mt-4 text-lg text-gray-600">Your safety is paramount. Please adhere to these guidelines for a secure ride.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {safetyGuidelines.map(item => (
              <div key={item.title} className="bg-white p-6 rounded-xl shadow-subtle text-center transform transition-transform hover:-translate-y-2">
                <h3 className="text-xl font-semibold">{item.title}</h3>
                <p className="text-gray-600 mt-2">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick FAQ */}
      <section className="py-20 bg-white">
        <div className="max-w-3xl mx-auto container px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-heading font-extrabold uppercase tracking-widest text-primary mb-8 text-center">Quick Questions</h2>
          <div className="space-y-4">
            {processFaqs.map(faq => (
              <details key={faq.q} className="bg-accent p-4 rounded-lg group">
                <summary className="flex justify-between items-center font-medium cursor-pointer list-none">
                  <span>{faq.q}</span>
                  <ChevronDownIcon className="h-5 w-5 text-gray-500 transition-transform duration-300 group-open:rotate-180" />
                </summary>
                <div className="text-gray-600 mt-3 text-sm">{faq.a}</div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary text-white text-center py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-heading font-extrabold uppercase tracking-widest">Ready to Start Your Journey?</h2>
          <p className="mt-3 text-lg text-gray-200">Browse our fleet and book your perfect ride today.</p>
          <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="mt-6 bg-secondary text-white font-bold py-3 px-8 rounded-lg hover:bg-opacity-90 transition-all text-lg">
            Browse Bikes
          </button>
        </div>
      </section>
    </div>
  );
};

export default HowItWorksPage;