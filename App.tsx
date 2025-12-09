import React, { useState, useCallback, lazy, Suspense, useEffect } from 'react';
import { supabase } from './src/supabaseClient';
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
import { initialSiteContent, jobOpenings, initialAdminUsers, offersData } from './constants'; // Only keep essential constants
import api from './src/api';

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

  // --- Centralized App State (empty by default - loaded from DB) ---
  const [bikes, setBikes] = useState<Bike[]>([]);
  const [pickupLocations, setPickupLocations] = useState<string[]>([]);
  const [offers, setOffers] = useState<Offer[]>(offersData); // Initialize with constants as fallback
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [siteContent, setSiteContent] = useState<SiteContent>(initialSiteContent); // Keep default for UI
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>(initialAdminUsers); // Keep for login
  const [applications, setApplications] = useState<Application[]>([]);


  // Admin State
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState<AdminUser | null>(null);

  // Coupon State (simulates per-session user usage)
  const [usedCoupons, setUsedCoupons] = useState<string[]>([]);



  // Fetch Public Data on Mount
  useEffect(() => {
    const fetchPublicData = async () => {
      try {
        const [
          fetchedBikes,
          fetchedLocations,
          fetchedOffers,
          fetchedReviews,
          fetchedEmployees,
          fetchedSiteContent
        ] = await Promise.all([
          api.bike.getAll(),
          api.admin.getLocations(), // Publicly accessible now
          api.admin.getOffers(),    // Publicly accessible now
          api.admin.getReviews(),   // Publicly accessible now
          api.admin.getEmployees(), // Publicly accessible now
          api.admin.getSiteContent() // Publicly accessible now
        ]);

        if (fetchedBikes) setBikes(fetchedBikes);
        if (fetchedLocations) setPickupLocations(fetchedLocations);
        // Merge API offers with local constants (prefer API if same ID, or just append)
        // Here we just set fetched offers, BUT if fetched is empty or fails, we kept the initial state.
        // If we want BOTH, we should merge.
        if (fetchedOffers && fetchedOffers.length > 0) {
          setOffers(prev => {
            // Combine unique offers by code or id
            const combined = [...prev, ...fetchedOffers];
            // Remove duplicates based on ID
            const unique = Array.from(new Map(combined.map(item => [item.id, item])).values());
            return unique;
          });
        }
        if (fetchedReviews) setReviews(fetchedReviews);
        if (fetchedEmployees) setEmployees(fetchedEmployees);
        if (fetchedSiteContent && Object.keys(fetchedSiteContent).length > 0) {
          setSiteContent(fetchedSiteContent);
        }
      } catch (error) {
        console.error("Failed to fetch public data", error);
        // Fallback to initial constants is automatic since state already has them
      }
    };

    fetchPublicData();
  }, []);

  // Fetch Admin Data on Login
  useEffect(() => {
    if (isAdminLoggedIn) {
      const fetchAdminData = async () => {
        try {
          const [
            fetchedEnquiries,
            fetchedAdminUsers,
            fetchedApplications,
            fetchedTransactions
          ] = await Promise.all([
            api.admin.getEnquiries(),
            api.admin.getAdminUsers(),
            api.admin.getApplications(),
            api.admin.getTransactions()
          ]);

          setEnquiries(fetchedEnquiries);
          setAdminUsers(fetchedAdminUsers);
          setApplications(fetchedApplications);
          setTransactions(fetchedTransactions);
        } catch (error) {
          console.error("Failed to fetch admin data", error);
        }
      };
      fetchAdminData();
    }
  }, [isAdminLoggedIn]);

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
    setOffers(prevOffers => prevOffers.map(o => o.code === couponCode ? { ...o, totalUses: o.totalUses + 1 } : o));
  };

  const handlePaymentSuccess = (finalBookingDetails: Omit<BookingDetails, 'bookingId' | 'transactionId'> & { bookingId?: string, transactionId?: string }, usedCouponCode?: string) => {
    // Use proper IDs from backend/BookingPage or fallbacks if something goes wrong (shouldn't happen with updated BookingPage)
    const bookingId = finalBookingDetails.bookingId || `RRS-${Date.now()}`;
    const transactionId = finalBookingDetails.transactionId || `txn_${Date.now().toString(36)}`;

    const newTransaction: Transaction = {
      id: transactionId,
      bookingId,
      customerName: finalBookingDetails.user.userName,
      amount: finalBookingDetails.totalFare,
      status: 'Paid', // Or 'Pending' for cash, but UI treats success here.
      date: new Date().toISOString(),
    };
    // Update transactions list locally for immediate feedback (though fresh fetch next admin login will get it too)
    setTransactions(prev => [newTransaction, ...prev]);

    const fullBookingDetails: BookingDetails = { ...finalBookingDetails, bookingId, transactionId };
    setConfirmedBooking(fullBookingDetails);

    if (usedCouponCode) {
      handleCouponUsed(usedCouponCode);
    }

    navigateTo('confirmation');
  };

  const handleReviewSubmit = async (newReview: Omit<Review, 'id' | 'status'>) => {
    try {
      // Save review directly to database (bypass Edge Function)
      const { data, error } = await supabase
        .from('reviews')
        .insert({
          name: newReview.name,
          rating: newReview.rating,
          text: newReview.text,
          user_id: null, // Anonymous reviews - no user ID
          status: 'Pending'
        })
        .select()
        .single();

      if (error) {
        console.error('Failed to submit review:', error);
        throw new Error(error.message);
      }

      // Update local state with the new review
      const review: Review = {
        id: data.id.toString(),
        name: data.name,
        rating: data.rating,
        text: data.text,
        userId: newReview.userId, // Use the userId from the form submission
        status: data.status
      };

      setReviews(prev => [review, ...prev]);
      console.log('Review submitted for moderation:', review);
    } catch (error) {
      console.error('Failed to submit review:', error);
      throw error;
    }
  };

  const handleApplicationSubmit = async (applicationData: Omit<Application, 'id' | 'submittedAt' | 'status'>) => {
    try {
      const newApplication: Application = {
        ...applicationData,
        id: `app${Date.now()}`,
        submittedAt: new Date().toISOString(),
        status: 'New',
      };
      await api.admin.createApplication(newApplication);
      setApplications(prev => [newApplication, ...prev]);
      console.log('Application submitted:', newApplication);
    } catch (error) {
      console.error('Failed to submit application:', error);
    }
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
