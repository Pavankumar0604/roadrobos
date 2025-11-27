import React from 'react';

const AppPromo: React.FC = () => {
    const handleStoreClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        alert('Coming Soon! Our app is currently under development.');
    };

    return (
        <section id="app-promo" className="bg-accent py-16">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-white rounded-xl shadow-md p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="text-center md:text-left">
                        <h2 className="text-2xl font-heading font-extrabold uppercase tracking-widest text-primary">Book Faster — Get the RoAd RoBo’s App</h2>
                        <p className="mt-2 text-gray-600">Instant bookings, exclusive offers & trip history tracking.</p>
                    </div>
                    <div className="flex items-center gap-4 flex-col sm:flex-row">
                        <a href="#" aria-label="Get it on Google Play" onClick={handleStoreClick}>
                            <img src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg" alt="Google Play Store badge" className="h-14" />
                        </a>
                        <a href="#" aria-label="Download on the App Store" onClick={handleStoreClick}>
                            <img src="https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg" alt="Apple App Store badge" className="h-14" />
                        </a>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default AppPromo;