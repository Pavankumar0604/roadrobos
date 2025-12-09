import React from 'react';
import { RocketLaunchIcon, ShieldCheckIcon, CpuChipIcon, CheckCircleIcon } from './icons/Icons';
import { cities } from '../constants';

const techFeatures = [
    { title: 'IoT Systems', description: 'For smart vehicle management and real-time monitoring of our fleet.', icon: <CpuChipIcon className="h-8 w-8 text-primary"/> },
    { title: 'Predictive Maintenance', description: 'Ensuring scooter reliability and minimizing downtime through data-driven insights.', icon: <ShieldCheckIcon className="h-8 w-8 text-primary"/> },
    { title: 'Mobile App Integration', description: 'Providing real-time tracking, seamless navigation, and an enhanced user experience.', icon: <RocketLaunchIcon className="h-8 w-8 text-primary"/> },
];

const leadership = [
    { name: 'Mr. Santhosh Kumar (John Sam)', title: 'Director', image: 'https://picsum.photos/seed/santhosh/400/400' },
    { name: 'Mrs. Theresa', title: 'Director', image: 'https://picsum.photos/seed/theresa/400/400' },
];

const AboutPage: React.FC = () => {
    return (
        <div>
            {/* Hero */}
            <section className="relative h-[50vh] min-h-[400px] flex items-center justify-center text-white">
                <img 
                    src="https://picsum.photos/seed/green-logistics/1920/1080" 
                    alt="Electric scooters lined up"
                    className="absolute inset-0 w-full h-full object-cover"
                    loading="lazy"
                    decoding="async"
                />
                <div className="absolute inset-0 bg-primary bg-opacity-70"></div>
                <div className="relative z-10 text-center px-4">
                    <h1 className="text-3xl md:text-5xl font-heading font-extrabold uppercase tracking-widest">Empowering a Greener Future</h1>
                    <p className="mt-4 text-lg md:text-xl max-w-3xl mx-auto">Pioneering electric mobility solutions that drive sustainable growth and innovation for India's delivery landscape.</p>
                </div>
            </section>

            {/* Mission & Overview */}
            <section className="py-20 bg-accent">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16 max-w-4xl mx-auto">
                        <h2 className="text-2xl md:text-3xl font-heading font-extrabold uppercase tracking-widest text-primary">Our Mission</h2>
                        <p className="mt-4 text-lg text-gray-700">
                            To empower the delivery ecosystem while promoting sustainable, reliable electric mobility solutions, helping businesses enhance operational efficiency, reduce their carbon footprint, and smoothly transition to greener logistics.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center max-w-5xl mx-auto">
                        <div>
                            <img src="https://picsum.photos/seed/delivery-exec/800/600" alt="Delivery executive on an electric scooter" className="rounded-xl shadow-lg"/>
                        </div>
                        <div className="space-y-4">
                            <h3 className="text-xl font-heading font-extrabold uppercase tracking-widest text-primary">Transforming Last-Mile Logistics</h3>
                            <p className="text-gray-600">
                                Sebchris Mobility aims to transform last-mile logistics in Bengaluru through a clean-energy scooter rental platform. Our primary clients include delivery executives, B2B/B2C companies, and Third-Party Logistics (3PL) providers.
                            </p>
                             <ul className="space-y-2">
                                <li className="flex items-start"><CheckCircleIcon className="h-6 w-6 text-secondary flex-shrink-0 mr-2 mt-0.5" /><span className="text-gray-700">Enhance operational efficiency</span></li>
                                <li className="flex items-start"><CheckCircleIcon className="h-6 w-6 text-secondary flex-shrink-0 mr-2 mt-0.5" /><span className="text-gray-700">Reduce carbon footprint</span></li>
                                <li className="flex items-start"><CheckCircleIcon className="h-6 w-6 text-secondary flex-shrink-0 mr-2 mt-0.5" /><span className="text-gray-700">Transition to greener logistics</span></li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* Technology & Innovation */}
            <section className="py-20 bg-white">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-2xl md:text-3xl font-heading font-extrabold uppercase tracking-widest text-primary">Technology & Innovation</h2>
                         <p className="mt-3 text-lg text-gray-600 max-w-3xl mx-auto">Our tech-driven approach ensures high performance, reduced downtime, and operational transparency.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                        {techFeatures.map(value => (
                            <div key={value.title} className="text-center p-6">
                                <div className="flex justify-center items-center h-20 w-20 mx-auto bg-primary/10 rounded-full">
                                    {value.icon}
                                </div>
                                <h3 className="text-xl font-heading font-extrabold uppercase tracking-widest mt-6">{value.title}</h3>
                                <p className="text-gray-600 mt-2">{value.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Leadership Section */}
            <section className="py-20 bg-accent">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-2xl md:text-3xl font-heading font-extrabold uppercase tracking-widest text-primary">Our Leadership</h2>
                        <p className="mt-3 text-lg text-gray-600">Prioritizing innovation and social responsibility.</p>
                    </div>
                    <div className="flex justify-center flex-wrap gap-8 max-w-3xl mx-auto">
                        {leadership.map(member => (
                            <div key={member.name} className="bg-white rounded-xl shadow-subtle text-center p-6 transform transition-transform hover:-translate-y-2 w-full sm:w-64">
                                <img src={member.image} alt={member.name} className="w-32 h-32 rounded-full mx-auto object-cover border-4 border-white shadow-md" loading="lazy" decoding="async"/>
                                <h3 className="text-xl font-bold mt-4">{member.name}</h3>
                                <p className="text-secondary font-semibold">{member.title}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
            
            {/* Our Presence */}
            <section className="py-20 bg-white">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-2xl md:text-3xl font-heading font-extrabold uppercase tracking-widest text-primary">Where to Find Us</h2>
                        <p className="mt-3 text-lg text-gray-600">Serving riders in cities all over India.</p>
                    </div>
                    <div className="flex flex-wrap justify-center gap-3 max-w-4xl mx-auto">
                        {cities.map(city => (
                            <span key={city.name} className="bg-primary/10 text-primary font-medium px-4 py-2 rounded-full shadow-sm">
                                {city.name}
                            </span>
                        ))}
                         <span className="bg-gray-200 text-gray-600 font-medium px-4 py-2 rounded-full shadow-sm">
                            + Many more coming soon!
                        </span>
                    </div>
                </div>
            </section>

            {/* Social Proof */}
            <section className="py-20 bg-gray-100">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h3 className="text-xl font-heading font-extrabold uppercase tracking-widest text-primary mb-8">Recognized for Excellence</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 max-w-4xl mx-auto items-center justify-items-center">
                        <img src="https://tse1.mm.bing.net/th/id/OIP.hecez_mdWP4E6X9sZ2RhEQHaHh?cb=ucfimg2ucfimg=1&rs=1&pid=ImgDetMain&o=7&rm=3" alt="Award Logo 1" className="h-16 md:h-20 w-auto object-contain" loading="lazy" decoding="async" />
                        <img src="https://mdproton.mghstage.com/wp-content/uploads/mdproton-centor-of-excellence-e1677516319615.png" alt="Award Logo 2" className="h-16 md:h-20 w-auto object-contain" loading="lazy" decoding="async" />
                        <img src="https://www.faypwc.com/wp-content/uploads/2024/02/2024-Annual-Awards-Badge-800x800.png" alt="Award Logo 3" className="h-16 md:h-20 w-auto object-contain" loading="lazy" decoding="async" />
                        <img src="https://tse1.mm.bing.net/th/id/OIP.MLm9SWpHTdRgB-buTjqoZgHaGm?cb=ucfimg2ucfimg=1&w=999&h=891&rs=1&pid=ImgDetMain&o=7&rm=3" alt="Award Logo 4" className="h-16 md:h-20 w-auto object-contain" loading="lazy" decoding="async" />
                    </div>
                </div>
            </section>
        </div>
    );
};

export default AboutPage;