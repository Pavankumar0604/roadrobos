import React, { useState, useEffect } from 'react';
import { MenuIcon, XIcon, ChevronDownIcon, LocationMarkerIcon, PhoneIcon, LogoutIcon } from './icons/Icons';
import CitySelectorDialog from './CitySelectorDialog';
import { cities } from '../constants';
import { type City } from '../types';

interface HeaderProps {
    selectedCity: string;
    onCityChange: (city: string) => void;
    currentView: string;
    onGoHome?: () => void;
    onBookNowRedirect?: () => void;
    onShowAndScrollToSearchForm?: () => void;
    onGoToTariff?: () => void;
    onGoToOffers?: () => void;
    onGoToPartner?: () => void;
    onGoToHowItWorks?: () => void;
    onGoToContact?: () => void;
    onGoToLogin?: () => void;
    onGoToFleet?: () => void;
    isAdminLoggedIn?: boolean;
    onLogout?: () => void;
}

const Header: React.FC<HeaderProps> = ({ 
    selectedCity, onCityChange, currentView, onGoHome, onBookNowRedirect, onShowAndScrollToSearchForm, onGoToTariff, onGoToOffers, onGoToPartner, 
    onGoToHowItWorks, onGoToContact, onGoToLogin, onGoToFleet, isAdminLoggedIn, onLogout 
}) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isCitySelectorOpen, setIsCitySelectorOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const isHomePage = currentView === 'home';

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };
        handleScroll(); // Set initial state
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setIsMenuOpen(false);
            }
        };
        if (isMenuOpen) {
            document.body.style.overflow = 'hidden';
            document.addEventListener('keydown', handleEscape);
        }
        return () => {
            document.body.style.overflow = 'auto';
            document.removeEventListener('keydown', handleEscape);
        };
    }, [isMenuOpen]);

    const desktopNavLinks = [
        { name: 'How It Works', action: onGoToHowItWorks, viewId: 'howItWorks' },
        { name: 'Our Fleet', action: onGoToFleet, viewId: 'fleet' },
        { name: 'Pricing', action: onGoToTariff, viewId: 'tariff' },
        { name: 'Deals', action: onGoToOffers, viewId: 'offers' },
        { name: 'Become a Partner', action: onGoToPartner, viewId: 'partner' },
        { name: 'Contact Us', action: onGoToContact, viewId: 'contact' },
    ];
    
    const mobileNavLinks = [
        { name: 'Home', action: onGoHome },
        { name: 'How It Works', action: onGoToHowItWorks },
        { name: 'Our Fleet', action: onGoToFleet },
        { name: 'Pricing', action: onGoToTariff },
        { name: 'Deals', action: onGoToOffers },
        { name: 'Become a Partner', action: onGoToPartner },
        { name: 'Contact Us', action: onGoToContact },
    ];
    
    const handleSelectCity = (city: City) => {
        onCityChange(city.name);
        setIsCitySelectorOpen(false);
    };
    
    const handleNavLinkClick = (e: React.MouseEvent, action?: () => void, isMobile: boolean = false) => {
        if (action) {
            e.preventDefault();
            action();
        }
        if (isMobile) {
            setIsMenuOpen(false);
        }
    }

    const handleBookNowClick = (e: React.MouseEvent) => {
        e.preventDefault();

        if (currentView === 'home') {
            onShowAndScrollToSearchForm?.();
        } else if (onBookNowRedirect) {
            onBookNowRedirect();
        } else if (onGoHome) {
            onGoHome();
        }
    };


    const isTransparent = isHomePage && !isScrolled;
    
    const headerClasses = isTransparent 
        ? 'bg-transparent' 
        : 'bg-white shadow-md';

    const linkClasses = isTransparent 
        ? 'text-white hover:text-white/80' 
        : 'text-gray-600 hover:text-primary';
        
    return (
        <>
            <div className="fixed top-0 left-0 right-0 z-50">
                <header className={`transition-all duration-300 ${headerClasses}`}>
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-between h-16">
                            {/* Left Side */}
                            <div className="flex-1">
                                <div className="flex items-center gap-4">
                                    <a href="#" onClick={(e) => handleNavLinkClick(e, onGoHome)} className="flex items-center">
                                        <div className="bg-primary text-white font-extrabold text-lg leading-none p-2 rounded-md">
                                            RoAd<br />RoBo’s
                                        </div>
                                    </a>
                                </div>
                            </div>

                            {/* Center Nav (Desktop) */}
                            <nav className="hidden md:flex flex-1 items-center justify-center space-x-4">
                                {desktopNavLinks.map(link => {
                                    const isActive = link.viewId === currentView;
                                    return (
                                        <a key={link.name} href={'#'} onClick={(e) => handleNavLinkClick(e, link.action)} className="relative transition-colors text-sm whitespace-nowrap px-1 py-2">
                                            <span className={`${isActive ? (!isTransparent ? 'text-primary font-semibold' : 'text-white font-semibold') : linkClasses}`}>
                                                {link.name}
                                            </span>
                                            {isActive && (
                                                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-secondary rounded-full"></span>
                                            )}
                                        </a>
                                    );
                                })}
                            </nav>
                            
                            {/* Right Side (Desktop) / Hamburger (Mobile) */}
                            <div className="flex-1 flex justify-end">
                                {/* Mobile Hamburger */}
                                <div className="md:hidden">
                                    <button onClick={() => setIsMenuOpen(true)} aria-label="Open menu">
                                        <MenuIcon className={`h-6 w-6 transition-colors ${!isTransparent ? 'text-primary' : 'text-white'}`} />
                                    </button>
                                </div>

                                {/* Desktop Right Side */}
                                <div className="hidden md:flex items-center">
                                    <button
                                        onClick={() => setIsCitySelectorOpen(true)}
                                        className={`rounded-lg px-3 py-1.5 flex items-center space-x-2 transition-all ${isTransparent ? 'border border-white/50 text-white hover:bg-white/10' : 'border border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                                    >
                                        <LocationMarkerIcon className={`h-5 w-5 transition-colors ${isTransparent ? 'text-white/80' : 'text-gray-500'}`} />
                                        <span className="text-sm max-w-[120px] truncate">{selectedCity}</span>
                                        <ChevronDownIcon className={`h-4 w-4 transition-colors ${isTransparent ? 'text-white/80' : 'text-gray-500'}`} />
                                    </button>
                                    {isAdminLoggedIn ? (
                                        <button onClick={onLogout} className={`ml-4 transition-colors whitespace-nowrap flex items-center gap-1.5 ${linkClasses}`}>
                                            <LogoutIcon className="h-5 w-5" /> Logout
                                        </button>
                                    ) : (
                                        <>
                                            <a href="#login" onClick={(e) => handleNavLinkClick(e, onGoToLogin)} className={`ml-4 transition-colors whitespace-nowrap ${linkClasses}`}>Login / Sign Up</a>
                                            <button onClick={handleBookNowClick} className={`ml-4 font-semibold px-3 py-1 rounded-lg transition-all ${isTransparent ? 'border-2 border-white text-white hover:bg-white/10' : 'bg-primary text-white hover:bg-opacity-90'}`}>Book Now</button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </header>
            </div>
            
            {/* Mobile Side Drawer & Overlay */}
            <div className={`fixed inset-0 z-[60] md:hidden ${isMenuOpen ? 'block' : 'hidden'}`} role="dialog" aria-modal="true" aria-labelledby="mobile-menu-title">
                <div className="fixed inset-0 bg-black/60" aria-hidden="true" onClick={() => setIsMenuOpen(false)}></div>
                <div className={`fixed top-0 left-0 h-full w-[70%] max-w-xs bg-white shadow-xl transition-transform duration-300 ease-in-out ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                    <div className="flex flex-col h-full">
                        <div className="flex items-center justify-between p-4 border-b">
                            <h2 id="mobile-menu-title" className="text-xl font-bold text-primary">Menu</h2>
                            <button onClick={() => setIsMenuOpen(false)} aria-label="Close menu">
                                <XIcon className="h-6 w-6 text-primary" />
                            </button>
                        </div>
                        <div className="flex-grow p-4 overflow-y-auto">
                            <button
                                onClick={() => {
                                    setIsCitySelectorOpen(true);
                                    setIsMenuOpen(false);
                                }}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 flex items-center justify-between text-gray-700 hover:bg-gray-50 mb-4"
                            >
                                <div className="flex items-center space-x-2">
                                    <LocationMarkerIcon className="h-5 w-5 text-gray-500" />
                                    <span className="text-sm font-medium">{selectedCity}</span>
                                </div>
                                <ChevronDownIcon className="h-4 w-4 text-gray-500" />
                            </button>
                             <nav className="flex flex-col space-y-1">
                                {mobileNavLinks.map(link => (
                                    <a key={link.name} href="#" onClick={(e) => handleNavLinkClick(e, link.action, true)} className="text-lg text-gray-700 p-3 rounded-md hover:bg-gray-100 hover:text-primary transition-colors">{link.name}</a>
                                ))}
                            </nav>
                        </div>
                        <div className="p-4 border-t space-y-2">
                             {isAdminLoggedIn ? (
                                <a href="#logout" onClick={(e) => handleNavLinkClick(e, onLogout, true)} className="block w-full text-center text-lg text-gray-700 p-3 rounded-md hover:bg-gray-100 hover:text-primary transition-colors">Logout</a>
                            ) : (
                                <a href="#login" onClick={(e) => handleNavLinkClick(e, onGoToLogin, true)} className="block w-full text-center text-lg text-gray-700 p-3 rounded-md hover:bg-gray-100 hover:text-primary transition-colors">Login / Sign Up</a>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile persistent search button */}
            {!isAdminLoggedIn && (
                <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white p-3 border-t shadow-lg z-40">
                    <button onClick={handleBookNowClick} className="w-full text-center bg-secondary text-white font-bold py-3 rounded-lg hover:bg-opacity-90 transition-all block">
                        Search Bikes
                    </button>
                </div>
            )}
            
            {isCitySelectorOpen && (
                <CitySelectorDialog
                    cities={cities}
                    onClose={() => setIsCitySelectorOpen(false)}
                    onSelectCity={handleSelectCity}
                />
            )}
        </>
    );
};

export default Header;