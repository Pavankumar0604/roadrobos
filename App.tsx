import React, { useState, useCallback, lazy, Suspense, useEffect } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import ValueProps from './components/ValueProps';
import FeaturedFleet from './components/FeaturedFleet';
import Locations from './components/Locations';
import Reviews from './components/Reviews';
import AppPromo from './components/AppPromo';
import Footer from './components/Footer';
import LoadingSpinner from './components/LoadingSpinner';
import WelcomeModal from './components/WelcomeModal';


import { type Bike, type SearchParams, type BookingDetails, type AdminUser, type Offer, type Review, type Enquiry, type Transaction, type Employee, type SiteContent, type Application } from './types';
import { bikes as initialBikes, offersData as initialOffers, reviewsData as initialReviews, pickupLocations as initialLocations, enquiriesData as initialEnquiries, transactionsData as initialTransactions, initialEmployees, initialSiteContent, initialAdminUsers, jobOpenings, initialApplications } from './constants';

// --- Lazy-loaded Page Components ---
const SearchResultsPage = lazy(() => import('./components/SearchResultsPage'));
const BikeDetailPage = lazy(() => import('./components/BikeDetailPage'));
const BookingPage = lazy(() => import('./components/BookingPage'));
const ConfirmationPage = lazy(() => import('./components/ConfirmationPage'));
const AboutPage = lazy(() => import('./components/AboutPage'));
const TariffPage = lazy(() => import('./components/TariffPage'));
const FAQPage = lazy(() => import('./components/FAQPage'));
const TermsPage = lazy(() => import('./components/TermsPage'));
const ContactPage = lazy(() => import('./components/ContactPage'));
const OffersPage = lazy(() => import('./components/OffersPage'));
const PartnerPage = lazy(() => import('./components/PartnerPage'));
const HowItWorksPage = lazy(() => import('./components/HowItWorksPage'));
const LoginPage = lazy(() => import('./components/LoginPage'));
const PrivacyPolicyPage = lazy(() => import('./components/PrivacyPolicyPage'));
const CancellationPolicyPage = lazy(() => import('./components/CancellationPolicyPage'));
const PressPage = lazy(() => import('./components/PressPage'));
const AdminDashboard = lazy(() => import('./components/AdminDashboard'));
const CareersPage = lazy(() => import('./components/CareersPage'));
const FleetPage = lazy(() => import('./components/FleetPage'));


type View = 'home' | 'searchResults' | 'bikeDetail' | 'booking' | 'confirmation' | 'about' | 'tariff' | 'faq' | 'terms' | 'contact' | 'offers' | 'partner' | 'howItWorks' | 'login' | 'adminDashboard' | 'privacyPolicy' | 'cancellationPolicy' | 'press' | 'careers' | 'fleet';

const App: React.FC = () => {
  const [view, setView] = useState<View>('home');
  const [selectedCity, setSelectedCity] = useState('Bangalore');
  const [searchParams, setSearchParams] = useState<SearchParams | null>(null);
  const [selectedBike, setSelectedBike] = useState<Bike | null>(null);
  const [bookingDetails, setBookingDetails] = useState<Omit<BookingDetails, 'user' | 'bookingId' | 'transactionId'> | null>(null);
  const [confirmedBooking, setConfirmedBooking] = useState<BookingDetails | null>(null);
  const [isSearchFormVisible, setIsSearchFormVisible] = useState(false);
  const [isWelcomeModalOpen, setIsWelcomeModalOpen] = useState(false);
  
  // --- Centralized App State ---
  const [bikes, setBikes] = useState<Bike[]>(initialBikes);
  const [pickupLocations, setPickupLocations] = useState<string[]>(initialLocations);
  const [offers, setOffers] = useState<Offer[]>(initialOffers);
  const [enquiries, setEnquiries] = useState<Enquiry[]>(initialEnquiries);
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [employees, setEmployees] = useState<Employee[]>(initialEmployees);
  const [siteContent, setSiteContent] = useState<SiteContent>(initialSiteContent);
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>(initialAdminUsers);
  const [applications, setApplications] = useState<Application[]>(initialApplications);


  // Admin State
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState<AdminUser | null>(null);
  
  // Coupon State (simulates per-session user usage)
  const [usedCoupons, setUsedCoupons] = useState<string[]>([]);

  useEffect(() => {
    // Show welcome modal only once per session
    const hasSeenModal = sessionStorage.getItem('welcomeModalShown');
    if (!hasSeenModal) {
      const timer = setTimeout(() => {
        setIsWelcomeModalOpen(true);
        sessionStorage.setItem('welcomeModalShown', 'true');
      }, 2000); // Show after 2 seconds
      return () => clearTimeout(timer);
    }
  }, []);

  const handleSearch = (params: Omit<SearchParams, 'city'>) => {
    setSearchParams({ ...params, city: selectedCity });
    setSelectedBike(null);
    setView('searchResults');
    setIsSearchFormVisible(false);
    window.scrollTo(0, 0);
  };
  
  const resetToHome = (options: { scrollToTop?: boolean } = {}) => {
    const { scrollToTop = true } = options;
    setSearchParams(null);
    setSelectedBike(null);
    setView('home');
    setIsSearchFormVisible(false);
    if (scrollToTop) {
        window.scrollTo(0, 0);
    }
  };

  const navigateTo = (targetView: View) => {
    setView(targetView);
    window.scrollTo(0, 0);
  };
  
  const handleGoHome = () => resetToHome();
  const handleBookNowRedirect = () => {
    setView('home');
    setSearchParams(null);
    setSelectedBike(null);
    setIsSearchFormVisible(true);
    window.scrollTo(0, 0);
  };
  const handleGoToAbout = () => navigateTo('about');
  const handleGoToTariff = () => navigateTo('tariff');
  const handleGoToOffers = () => navigateTo('offers');
  const handleGoToPartner = () => navigateTo('partner');
  const handleGoToHowItWorks = () => navigateTo('howItWorks');
  const handleGoToFAQ = () => navigateTo('faq');
  const handleGoToTerms = () => navigateTo('terms');
  const handleGoToContact = () => navigateTo('contact');
  const handleGoToLogin = () => navigateTo('login');
  const handleGoToPrivacyPolicy = () => navigateTo('privacyPolicy');
  const handleGoToCancellationPolicy = () => navigateTo('cancellationPolicy');
  const handleGoToPress = () => navigateTo('press');
  const handleGoToCareers = () => navigateTo('careers');
  const handleGoToFleet = () => navigateTo('fleet');
  
  const showAndScrollToSearchForm = () => {
    setIsSearchFormVisible(true);
    // Use a timeout to ensure the element is rendered before scrolling/focusing
    setTimeout(() => {
        const searchForm = document.getElementById('hero-search-form');
        if (searchForm) {
            searchForm.scrollIntoView({ behavior: 'smooth', block: 'center' });
            const firstInput = searchForm.querySelector<HTMLInputElement>('button[id="pickup-location-btn"]');
            if (firstInput) {
                firstInput.focus();
            }
        }
    }, 100);
  };

  const handleSelectBike = useCallback((bike: Bike) => {
    setSelectedBike(bike);
    navigateTo('bikeDetail');
  }, []);

  const handleBookNow = useCallback((bike: Bike, searchParams: SearchParams, addons: { helmet: boolean; insurance: boolean; }, totalFare: number) => {
    setBookingDetails({ bike, searchParams, addons, totalFare });
    navigateTo('booking');
  }, []);

  const handleBackToSearch = () => {
    setSelectedBike(null);
    setView('searchResults');
  };

  const handleCouponUsed = (couponCode: string) => {
    setUsedCoupons(prev => [...prev, couponCode]);
    setOffers(prevOffers => prevOffers.map(o => o.code === couponCode ? {...o, totalUses: o.totalUses + 1} : o));
  };

  const handlePaymentSuccess = (finalBookingDetails: Omit<BookingDetails, 'bookingId' | 'transactionId'>, usedCouponCode?: string) => {
    const bookingId = `RRB-${Date.now()}`;
    const transactionId = `txn_${Date.now().toString(36)}`;

    const newTransaction: Transaction = {
        id: transactionId,
        bookingId,
        customerName: finalBookingDetails.user.name,
        amount: finalBookingDetails.totalFare,
        status: 'Paid',
        date: new Date().toISOString(),
    };
    setTransactions(prev => [newTransaction, ...prev]);
    
    const fullBookingDetails: BookingDetails = { ...finalBookingDetails, bookingId, transactionId };
    setConfirmedBooking(fullBookingDetails);
    
    if (usedCouponCode) {
      handleCouponUsed(usedCouponCode);
    }
    
    navigateTo('confirmation');
  };
  
  const handleReviewSubmit = (newReview: Omit<Review, 'id' | 'status'>) => {
    const review: Review = {
      ...newReview,
      id: `rev${Date.now()}`,
      status: 'Pending',
    };
    setReviews(prev => [review, ...prev]);
    // In a real app, this would be an API call
    console.log('New review submitted for moderation:', review);
  };

  const handleApplicationSubmit = (applicationData: Omit<Application, 'id' | 'submittedAt' | 'status'>) => {
    const newApplication: Application = {
      ...applicationData,
      id: `app${Date.now()}`,
      submittedAt: new Date().toISOString(),
      status: 'New',
    };
    setApplications(prev => [newApplication, ...prev]);
  };

  const handleLoginSuccess = (user: AdminUser) => {
    setLoggedInUser(user);
    setIsAdminLoggedIn(true);
    navigateTo('adminDashboard');
  };
  
  const handleLogout = () => {
    setLoggedInUser(null);
    setIsAdminLoggedIn(false);
    resetToHome();
  };

  const handleCloseWelcomeModal = () => {
    setIsWelcomeModalOpen(false);
  };

  const handleWelcomeModalBookNow = () => {
    handleCloseWelcomeModal();
    showAndScrollToSearchForm();
  };

  const renderPublicContent = () => {
    switch (view) {
      case 'howItWorks': return <HowItWorksPage />;
      case 'partner': return <PartnerPage />;
      case 'offers': return <OffersPage offers={offers} />;
      case 'about': return <AboutPage />;
      case 'tariff': return <TariffPage city={selectedCity} onSelectBike={handleSelectBike} bikes={bikes} />;
      case 'faq': return <FAQPage />;
      case 'terms': return <TermsPage />;
      case 'contact': return <ContactPage contactEmail={siteContent.contact.email} contactPhone={siteContent.contact.phone} />;
      case 'privacyPolicy': return <PrivacyPolicyPage />;
      case 'cancellationPolicy': return <CancellationPolicyPage />;
      case 'press': return <PressPage contactEmail={siteContent.contact.email} contactPhone={siteContent.contact.phone} />;
      case 'careers': return <CareersPage jobOpenings={jobOpenings} onApplicationSubmit={handleApplicationSubmit} />;
      case 'fleet': return <FleetPage bikes={bikes} onSelectBike={handleSelectBike} />;
      case 'confirmation': return confirmedBooking ? <ConfirmationPage bookingDetails={confirmedBooking} onBookAnother={handleGoHome} onReviewSubmit={handleReviewSubmit} /> : null;
      case 'booking': return bookingDetails ? <BookingPage bookingDetails={bookingDetails} onConfirmBooking={handlePaymentSuccess} onBack={() => setView('bikeDetail')} offers={offers} usedCoupons={usedCoupons} /> : null;
      case 'bikeDetail': return selectedBike ? <BikeDetailPage bike={selectedBike} allBikes={bikes} searchParams={searchParams} onBack={handleBackToSearch} onBookNow={handleBookNow} onSelectBike={handleSelectBike} /> : null;
      case 'searchResults': return searchParams ? <SearchResultsPage searchParams={searchParams} bikes={bikes} onSelectBike={handleSelectBike} /> : null;
      case 'home':
      default:
        return (
          <>
            <Hero 
              onSearch={handleSearch} 
              city={selectedCity} 
              isSearchFormVisible={isSearchFormVisible}
              onCloseSearchForm={() => setIsSearchFormVisible(false)}
              pickupLocations={pickupLocations}
              heroTitleTemplate={siteContent.home.heroTitleTemplate}
              heroSubtitle={siteContent.home.heroSubtitle}
            />
            <ValueProps />
            <FeaturedFleet bikes={bikes} onSelectBike={handleSelectBike} city={selectedCity} />
            <Locations pickupLocations={pickupLocations} />
            <Reviews reviews={reviews} />
            <AppPromo />
          </>
        );
    }
  };

  const renderContent = () => {
    if (view === 'login') {
      return <LoginPage onLoginSuccess={handleLoginSuccess} onBackToHome={handleGoHome} adminUsers={adminUsers} />;
    }
    
    if (view === 'adminDashboard' && isAdminLoggedIn && loggedInUser) {
       return <AdminDashboard 
         user={loggedInUser} 
         onLogout={handleLogout} 
         bikes={bikes} setBikes={setBikes}
         locations={pickupLocations} setLocations={setPickupLocations}
         offers={offers} setOffers={setOffers}
         enquiries={enquiries} setEnquiries={setEnquiries}
         reviews={reviews} setReviews={setReviews} 
         transactions={transactions} setTransactions={setTransactions}
         employees={employees} setEmployees={setEmployees}
         siteContent={siteContent} setSiteContent={setSiteContent}
         adminUsers={adminUsers} setAdminUsers={setAdminUsers}
         applications={applications} setApplications={setApplications}
      />;
    }
    
    return (
      <>
        <Header 
          selectedCity={selectedCity} 
          onCityChange={setSelectedCity}
          currentView={view}
          onGoHome={view !== 'home' ? handleGoHome : undefined}
          onBookNowRedirect={handleBookNowRedirect}
          onShowAndScrollToSearchForm={showAndScrollToSearchForm}
          onGoToTariff={handleGoToTariff}
          onGoToOffers={handleGoToOffers}
          onGoToPartner={handleGoToPartner}
          onGoToHowItWorks={handleGoToHowItWorks}
          onGoToContact={handleGoToContact}
          onGoToLogin={handleGoToLogin}
          onGoToFleet={handleGoToFleet}
          isAdminLoggedIn={isAdminLoggedIn}
          onLogout={handleLogout}
        />
        <main>
          {renderPublicContent()}
        </main>
        <Footer 
          onGoToAbout={handleGoToAbout} 
          onGoToTariff={handleGoToTariff} 
          onGoToHowItWorks={handleGoToHowItWorks} 
          onGoToFAQ={handleGoToFAQ} 
          onGoToTerms={handleGoToTerms} 
          onGoToContact={handleGoToContact} 
          onGoToPrivacyPolicy={handleGoToPrivacyPolicy}
          onGoToCancellationPolicy={handleGoToCancellationPolicy}
          onGoToPress={handleGoToPress}
          onGoToCareers={handleGoToCareers}
          onGoToFleet={handleGoToFleet}
          contactEmail={siteContent.contact.email} contactPhone={siteContent.contact.phone} />
        <WelcomeModal 
            isOpen={isWelcomeModalOpen && view === 'home'} 
            onClose={handleCloseWelcomeModal}
            onBookNow={handleWelcomeModalBookNow}
        />
      </>
    );
  }

  return (
    <div className="bg-white font-sans text-primary overflow-x-hidden">
      <Suspense fallback={<LoadingSpinner />}>
        {renderContent()}
      </Suspense>
    </div>
  );
};

export default App;
