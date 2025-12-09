import React from 'react';
import { FacebookIcon, InstagramIcon, YoutubeIcon } from './icons/Icons';

interface FooterProps {
    onGoToAbout: () => void;
    onGoToTariff: () => void;
    onGoToHowItWorks: () => void;
    onGoToFAQ: () => void;
    onGoToTerms: () => void;
    onGoToPrivacyPolicy: () => void;
    onGoToCancellationPolicy: () => void;
    onGoToContact: () => void;
    onGoToPress: () => void;
    onGoToCareers: () => void;
    onGoToFleet: () => void;
    contactEmail: string;
    contactPhone: string;
}

const Footer: React.FC<FooterProps> = ({ onGoToAbout, onGoToTariff, onGoToHowItWorks, onGoToFAQ, onGoToTerms, onGoToPrivacyPolicy, onGoToCancellationPolicy, onGoToContact, onGoToPress, onGoToCareers, onGoToFleet, contactEmail, contactPhone }) => {
    const handleAboutClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        onGoToAbout();
    };
    
    const handleTariffClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        onGoToTariff();
    };

    const handleHowItWorksClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        onGoToHowItWorks();
    };
    
    const handleFAQClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        onGoToFAQ();
    };
    
    const handleTermsClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        onGoToTerms();
    };

    const handlePrivacyPolicyClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        onGoToPrivacyPolicy();
    };

    const handleCancellationPolicyClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        onGoToCancellationPolicy();
    };

    const handleContactClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        onGoToContact();
    };

    const handlePressClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        onGoToPress();
    };

    const handleCareersClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        onGoToCareers();
    };

    const handleFleetClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        onGoToFleet();
    };

    return (
        <footer className="bg-primary text-white pt-16 pb-8">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
                    <div className="col-span-2 lg:col-span-1 mb-8 lg:mb-0">
                        <h2 className="text-2xl font-bold text-white">RoAd RoBo’s</h2>
                        <p className="text-gray-300 mt-2 text-sm">Ride Smart, Rent Easy.</p>
                         <div className="flex space-x-4 mt-6">
                            <a href="#" aria-label="Facebook" className="text-gray-300 hover:text-white"><FacebookIcon className="h-6 w-6" /></a>
                            <a href="#" aria-label="Instagram" className="text-gray-300 hover:text-white"><InstagramIcon className="h-6 w-6" /></a>
                            <a href="#" aria-label="YouTube" className="text-gray-300 hover:text-white"><YoutubeIcon className="h-6 w-6" /></a>
                        </div>
                    </div>

                    <div>
                        <h3 className="font-heading font-extrabold tracking-wider uppercase">Company</h3>
                        <ul className="mt-4 space-y-2 text-gray-300">
                            <li><a href="#about" onClick={handleAboutClick} className="hover:text-white">About</a></li>
                            <li><a href="#" onClick={handlePressClick} className="hover:text-white">Press</a></li>
                            <li><a href="#" onClick={handleCareersClick} className="hover:text-white">Careers</a></li>
                        </ul>
                    </div>

                     <div>
                        <h3 className="font-heading font-extrabold tracking-wider uppercase">For Riders</h3>
                        <ul className="mt-4 space-y-2 text-gray-300">
                            <li><a href="#" onClick={handleHowItWorksClick} className="hover:text-white">How it Works</a></li>
                            <li><a href="#pricing" onClick={handleTariffClick} className="hover:text-white">Pricing</a></li>
                            <li><a href="#fleet" onClick={handleFleetClick} className="hover:text-white">Fleet</a></li>
                        </ul>
                    </div>

                     <div>
                        <h3 className="font-heading font-extrabold tracking-wider uppercase">Support</h3>
                        <ul className="mt-4 space-y-2 text-gray-300">
                            <li><a href="#" onClick={handleContactClick} className="hover:text-white">Contact Us</a></li>
                            <li><a href="#faq" onClick={handleFAQClick} className="hover:text-white">Help Center</a></li>
                            <li><a href="#cancellation" onClick={handleCancellationPolicyClick} className="hover:text-white">Cancellations</a></li>
                        </ul>
                    </div>
                     <div>
                        <h3 className="font-heading font-extrabold tracking-wider uppercase">Legal</h3>
                        <ul className="mt-4 space-y-2 text-gray-300">
                            <li><a href="#terms" onClick={handleTermsClick} className="hover:text-white">Terms</a></li>
                            <li><a href="#privacy" onClick={handlePrivacyPolicyClick} className="hover:text-white">Privacy Policy</a></li>
                        </ul>
                    </div>

                </div>

                <div className="mt-12 border-t border-white/20 pt-8 text-sm text-gray-300 text-center md:text-left">
                    <div className="md:flex md:justify-between">
                         <p>
                           Contact: <a href={`mailto:${contactEmail}`} className="hover:text-white">{contactEmail}</a> | <a href={`tel:${contactPhone}`} className="hover:text-white">{contactPhone}</a>
                        </p>
                        <p className="mt-4 md:mt-0">
                            © {new Date().getFullYear()} Sebchris Mobility Pvt. Ltd. (RoAd RoBo’s)
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;