import React, { useState, useEffect } from 'react';
import { MenuIcon, XIcon, ChevronDownIcon, LocationMarkerIcon, PhoneIcon, LogoutIcon, ShieldCheckIcon, SearchIcon, KeyIcon } from './icons/Icons';
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
    onGoToManagerLogin?: () => void;
    onGoToPortalAccess?: () => void;
    onGoToFleet?: () => void;
    isAdminLoggedIn?: boolean;
    onLogout?: () => void;
}

const Header: React.FC<HeaderProps> = ({
    selectedCity, onCityChange, currentView, onGoHome, onBookNowRedirect, onShowAndScrollToSearchForm, onGoToTariff, onGoToOffers, onGoToPartner,
    onGoToHowItWorks, onGoToContact, onGoToLogin, onGoToManagerLogin, onGoToPortalAccess, onGoToFleet, isAdminLoggedIn, onLogout
}) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isCityDropdownOpen, setIsCityDropdownOpen] = useState(false);
    const [citySearch, setCitySearch] = useState('');
    const [isScrolled, setIsScrolled] = useState(false);
    const isHomePage = currentView === 'home';

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };
        handleScroll();
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setIsMenuOpen(false);
                setIsCityDropdownOpen(false);
            }
        };
        const handleClickOutside = (e: MouseEvent) => {
            if (isCityDropdownOpen && !(e.target as Element).closest('.city-dropdown-container')) {
                setIsCityDropdownOpen(false);
            }
        }
        if (isMenuOpen || isCityDropdownOpen) {
            document.addEventListener('keydown', handleEscape);
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isMenuOpen, isCityDropdownOpen]);

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
        setIsCityDropdownOpen(false);
        setCitySearch('');
    };

    const filteredCities = cities.filter(c =>
        c.name.toLowerCase().includes(citySearch.toLowerCase())
    );

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
                                            RoAd<br />RoBo's
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
                                    <div className="relative city-dropdown-container">
                                        <button
                                            onClick={() => setIsCityDropdownOpen(!isCityDropdownOpen)}
                                            className={`rounded-lg px-3 py-1.5 flex items-center space-x-2 transition-all ${isTransparent ? 'border border-white/50 text-white hover:bg-white/10' : 'border border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                                        >
                                            <LocationMarkerIcon className={`h-5 w-5 transition-colors ${isTransparent ? 'text-white/80' : 'text-gray-500'}`} />
                                            <span className="text-sm max-w-[120px] truncate">{selectedCity}</span>
                                            <ChevronDownIcon className={`h-4 w-4 transition-colors ${isTransparent ? 'text-white/80' : 'text-gray-500'} ${isCityDropdownOpen ? 'rotate-180' : ''}`} />
                                        </button>

                                        {isCityDropdownOpen && (
                                            <div className="absolute top-full right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-20 animate-scale-in">
                                                <div className="p-3 border-b bg-gray-50">
                                                    <div className="relative">
                                                        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                        <input
                                                            type="text"
                                                            placeholder="Search your city..."
                                                            value={citySearch}
                                                            onChange={(e) => setCitySearch(e.target.value)}
                                                            className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                                            autoFocus
                                                        />
                                                    </div>
                                                </div>
                                                <div className="max-h-80 overflow-y-auto p-2">
                                                    {filteredCities.map((city) => (
                                                        <button
                                                            key={city.name}
                                                            onClick={() => handleSelectCity(city)}
                                                            className={`w-full text-left px-4 py-2.5 rounded-lg text-sm transition-colors flex items-center justify-between group ${selectedCity === city.name ? 'bg-primary text-white' : 'text-gray-700 hover:bg-primary/10 hover:text-primary'
                                                                }`}
                                                        >
                                                            <span>{city.name}</span>
                                                            {selectedCity === city.name && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                                                        </button>
                                                    ))}
                                                    {filteredCities.length === 0 && (
                                                        <div className="py-8 text-center text-gray-400 text-sm italic">
                                                            No cities found...
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    {isAdminLoggedIn ? (
                                        <button onClick={onLogout} className={`ml-4 transition-colors whitespace-nowrap flex items-center gap-1.5 ${linkClasses}`}>
                                            <LogoutIcon className="h-5 w-5" /> Logout
                                        </button>
                                    ) : (
                                        <div className="flex items-center gap-3 ml-4">
                                            <a
                                                href="#portal"
                                                onClick={(e) => handleNavLinkClick(e, onGoToPortalAccess)}
                                                className={`group relative flex items-center gap-2 px-5 py-2 rounded-full border-2 transition-all duration-500 hover:shadow-lg active:scale-95 ${isTransparent
                                                    ? 'border-white/30 text-white hover:border-white hover:bg-white/10'
                                                    : 'border-primary/10 text-primary hover:border-primary/30 hover:bg-primary/5'
                                                    }`}
                                            >
                                                <ShieldCheckIcon className="w-4 h-4 text-secondary transition-all duration-300 group-hover:scale-110" />
                                                <span className="text-[10px] font-black uppercase tracking-[0.2em] whitespace-nowrap">Portal Access</span>

                                                {/* Subtle shine on hover */}
                                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out pointer-events-none"></div>
                                            </a>
                                            <button
                                                onClick={handleBookNowClick}
                                                className={`flex flex-col items-center justify-center w-[82px] h-[52px] border-2 rounded-lg transition-all duration-300 shadow-lg active:scale-95 group overflow-hidden ${isTransparent
                                                    ? 'border-white text-white hover:bg-white/20'
                                                    : 'border-primary bg-primary text-white hover:bg-primary/90 hover:shadow-primary/20'
                                                    }`}
                                            >
                                                <span className="text-[14px] font-black leading-none tracking-tight uppercase">Book</span>
                                                <span className="text-[14px] font-black leading-none tracking-tight uppercase mt-0.5">Now</span>
                                            </button>
                                        </div>
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
                            <div className="mb-4">
                                <button
                                    onClick={() => setIsCityDropdownOpen(!isCityDropdownOpen)}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 flex items-center justify-between text-gray-700 hover:bg-gray-50"
                                >
                                    <div className="flex items-center space-x-2">
                                        <LocationMarkerIcon className="h-5 w-5 text-gray-500" />
                                        <span className="text-sm font-medium">{selectedCity}</span>
                                    </div>
                                    <ChevronDownIcon className={`h-4 w-4 text-gray-500 transition-transform ${isCityDropdownOpen ? 'rotate-180' : ''}`} />
                                </button>

                                {isCityDropdownOpen && (
                                    <div className="mt-2 border border-gray-100 rounded-lg overflow-hidden bg-gray-50 max-h-60 overflow-y-auto">
                                        {cities.map((city) => (
                                            <button
                                                key={city.name}
                                                onClick={() => handleSelectCity(city)}
                                                className={`w-full text-left px-4 py-3 text-sm border-b border-gray-100 last:border-0 ${selectedCity === city.name ? 'bg-primary/10 text-primary font-bold' : 'text-gray-600 hover:bg-gray-100'
                                                    }`}
                                            >
                                                {city.name}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
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
                                <div className="px-6 py-4">
                                    <a
                                        href="#portal"
                                        onClick={(e) => handleNavLinkClick(e, onGoToPortalAccess, true)}
                                        className="group relative flex items-center justify-center gap-3 w-full border-2 border-primary/20 py-4 rounded-full hover:bg-primary/5 transition-all duration-300 active:scale-95"
                                    >
                                        <ShieldCheckIcon className="w-5 h-5 text-secondary transition-transform group-hover:scale-110" />
                                        <span className="text-primary font-black uppercase text-[12px] tracking-[0.25em] whitespace-nowrap">Portal Access</span>

                                        {/* Subtle shine on hover */}
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out pointer-events-none"></div>
                                    </a>
                                </div>
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

        </>
    );
};

export default Header;