import React, { useState } from 'react';
import { type JobOpening, type Application } from '../types';
import { ArrowRightIcon, GlobeAltIcon, HeartIcon, RocketLaunchIcon, TrophyIcon, UsersIcon } from './icons/Icons';
import ApplicationFormModal from './ApplicationFormModal';

interface CareersPageProps {
  jobOpenings: JobOpening[];
  onApplicationSubmit: (applicationData: Omit<Application, 'id' | 'submittedAt' | 'status'>) => void;
}

const cultureItems = [
    { icon: <RocketLaunchIcon className="h-8 w-8 text-primary"/>, title: 'Drive Innovation', description: 'Be at the forefront of the EV revolution in urban mobility.' },
    { icon: <GlobeAltIcon className="h-8 w-8 text-primary"/>, title: 'Create Impact', description: 'Contribute to a sustainable future by reducing carbon emissions.' },
    { icon: <UsersIcon className="h-8 w-8 text-primary"/>, title: 'Grow Together', description: 'Join a collaborative team that values learning and personal growth.' },
    { icon: <TrophyIcon className="h-8 w-8 text-primary"/>, title: 'Celebrate Success', description: 'We recognize hard work and celebrate our collective achievements.' },
];

const benefits = ['Competitive Salary', 'Health Insurance', 'Flexible Work Hours', 'Generous Leave Policy', 'Team Outings', 'Free Bike Rentals'];

const CareersPage: React.FC<CareersPageProps> = ({ jobOpenings, onApplicationSubmit }) => {
    const [applyingForJob, setApplyingForJob] = useState<JobOpening | null>(null);

    const handleApplyClick = (job: JobOpening) => {
        setApplyingForJob(job);
    };

    const handleSubmitApplication = (applicationData: Omit<Application, 'id' | 'submittedAt' | 'status'>) => {
        onApplicationSubmit(applicationData);
        setApplyingForJob(null); // Close modal on successful submit
        alert(`Thank you for applying for the ${applicationData.job.title} position! Your application has been submitted.`);
    };

    return (
        <div className="bg-white">
            {/* Hero */}
            <section className="relative h-[60vh] min-h-[450px] flex items-center justify-center text-white">
                <img 
                    src="https://picsum.photos/seed/team-photo/1920/1080" 
                    alt="Diverse team collaborating in an office"
                    className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-primary bg-opacity-70"></div>
                <div className="relative z-10 text-center px-4">
                    <h1 className="text-3xl md:text-5xl font-heading font-extrabold uppercase tracking-widest">Join Our Mission</h1>
                    <p className="mt-4 text-lg md:text-xl max-w-3xl mx-auto">We're building the future of urban mobility. Be a part of a passionate team that's making a real-world impact.</p>
                </div>
            </section>

            {/* Why Work With Us */}
            <section className="py-20 bg-accent">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16 max-w-4xl mx-auto">
                        <h2 className="text-2xl md:text-3xl font-heading font-extrabold uppercase tracking-widest text-primary">Why Join RoAd RoBo’s?</h2>
                        <p className="mt-4 text-lg text-gray-700">
                           We are more than just a bike rental company. We are a team of innovators, problem-solvers, and environmental enthusiasts dedicated to creating sustainable solutions for India's bustling cities.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {cultureItems.map(item => (
                            <div key={item.title} className="bg-white p-6 rounded-xl shadow-subtle text-center transform transition-transform hover:-translate-y-2">
                                <div className="flex justify-center items-center h-16 w-16 mx-auto bg-primary/10 rounded-full">{item.icon}</div>
                                <h3 className="text-lg font-heading font-extrabold uppercase tracking-widest mt-4">{item.title}</h3>
                                <p className="text-gray-600 mt-2 text-sm">{item.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Perks & Benefits */}
            <section className="py-20 bg-white">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                        <div>
                            <img src="https://picsum.photos/seed/office-perks/800/600" alt="Happy employees in a modern office" className="rounded-xl shadow-lg"/>
                        </div>
                        <div>
                             <h2 className="text-2xl font-heading font-extrabold uppercase tracking-widest text-primary mb-6 flex items-center gap-3">
                                <HeartIcon className="h-8 w-8"/>
                                Perks & Benefits
                            </h2>
                            <p className="text-gray-600 mb-6">We care about our team's well-being and success. Here are some of the benefits you'll enjoy as part of the RoAd RoBo’s family.</p>
                             <div className="grid grid-cols-2 gap-4">
                                {benefits.map(benefit => (
                                    <div key={benefit} className="flex items-center">
                                        <div className="flex-shrink-0 bg-secondary text-white rounded-full p-1 mr-3">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                                        </div>
                                        <span className="text-gray-700">{benefit}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            
            {/* Current Openings */}
            <section id="openings" className="py-20 bg-accent">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
                    <div className="text-center mb-12">
                        <h2 className="text-2xl md:text-3xl font-heading font-extrabold uppercase tracking-widest text-primary">Current Openings</h2>
                        <p className="mt-3 text-lg text-gray-600">Find your place on our team. We’re looking for talented individuals to help us grow.</p>
                    </div>
                    <div className="bg-white rounded-xl shadow-md overflow-hidden">
                        <div className="space-y-4 p-6">
                           {jobOpenings.length > 0 ? (
                                jobOpenings.map(job => (
                                     <div key={job.id} className="p-4 border rounded-lg flex flex-col sm:flex-row justify-between items-center gap-4 hover:bg-gray-50/50 transition-colors">
                                        <div>
                                            <h3 className="text-xl font-bold text-primary">{job.title}</h3>
                                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500 mt-1">
                                                <span>{job.department}</span>
                                                <span className="hidden sm:inline">•</span>
                                                <span>{job.location}</span>
                                                <span className="hidden sm:inline">•</span>
                                                <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full text-xs font-semibold">{job.type}</span>
                                            </div>
                                        </div>
                                        <button onClick={() => handleApplyClick(job)} className="bg-primary text-white font-semibold py-2 px-6 rounded-lg hover:bg-opacity-90 transition-all w-full sm:w-auto flex-shrink-0">
                                            Apply Now
                                        </button>
                                    </div>
                                ))
                           ) : (
                                <div className="text-center p-8">
                                    <p className="text-gray-600">There are currently no open positions. Please check back later!</p>
                                </div>
                           )}
                        </div>
                    </div>
                     <p className="text-center text-gray-600 mt-8">Don't see a role that fits? <a href="#" className="text-primary font-semibold hover:underline">Send us your resume</a> for future opportunities.</p>
                </div>
            </section>
            {applyingForJob && (
                <ApplicationFormModal
                    job={applyingForJob}
                    isOpen={!!applyingForJob}
                    onClose={() => setApplyingForJob(null)}
                    onSubmit={handleSubmitApplication}
                />
            )}
        </div>
    );
};

export default CareersPage;
