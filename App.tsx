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
import ErrorBoundary from './components/ErrorBoundary';

import { type Bike, type BikeUnit, type SearchParams, type BookingDetails, type AdminUser, type Offer, type Review, type Enquiry, type Transaction, type Employee, type SiteContent, type Application, type PickupLocation } from './types';
import { initialSiteContent, jobOpenings, initialAdminUsers, offersData, bikes as constantsBikes, pickupLocations as constantsLocations } from './constants'; // Only keep essential constants
import api from '@/src/api';

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
const ManagerLoginPage = lazy(() => import('./components/ManagerLoginPage'));
const ManagerDashboard = lazy(() => import('./components/ManagerDashboard'));
const ServiceManagerDashboard = lazy(() => import('./components/ServiceManagerDashboard'));
const CareersPage = lazy(() => import('./components/CareersPage'));
const FleetPage = lazy(() => import('./components/FleetPage'));
const PortalAccessPage = lazy(() => import('./components/PortalAccessPage'));

type View = 'home' | 'searchResults' | 'bikeDetail' | 'booking' | 'confirmation' | 'about' | 'tariff' | 'faq' | 'terms' | 'contact' | 'offers' | 'partner' | 'howItWorks' | 'login' | 'managerLogin' | 'portalAccess' | 'adminDashboard' | 'managerDashboard' | 'serviceManagerDashboard' | 'privacyPolicy' | 'cancellationPolicy' | 'press' | 'careers' | 'fleet';

const App: React.FC = () => {
  const [view, setView] = useState<View>('home');
  const [selectedCity, setSelectedCity] = useState('Bangalore');
  const [searchParams, setSearchParams] = useState<SearchParams | null>(null);
  const [selectedBike, setSelectedBike] = useState<Bike | null>(null);
  const [bookingDetails, setBookingDetails] = useState<Omit<BookingDetails, 'user' | 'bookingId' | 'transactionId'> | null>(null);
  const [confirmedBooking, setConfirmedBooking] = useState<BookingDetails | null>(null);
  const [isSearchFormVisible, setIsSearchFormVisible] = useState(false);
  const [isWelcomeModalOpen, setIsWelcomeModalOpen] = useState(false);

  // --- Centralized App State (loads constants.ts defaults to show UI immediately, then overridden by DB) ---
  const [bikes, setBikes] = useState<Bike[]>(constantsBikes);
  const [bikeUnits, setBikeUnits] = useState<BikeUnit[]>([]);
  const [pickupLocations, setPickupLocations] = useState<PickupLocation[]>(constantsLocations);
  const [offers, setOffers] = useState<Offer[]>(offersData); // Initialize with constants as fallback
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [siteContent, setSiteContent] = useState<SiteContent>(initialSiteContent); // Keep default for UI
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>(initialAdminUsers); // Keep for login
  const [applications, setApplications] = useState<Application[]>([]);


  // Admin/Manager/Service State
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [isManagerLoggedIn, setIsManagerLoggedIn] = useState(false);
  const [isServiceManagerLoggedIn, setIsServiceManagerLoggedIn] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState<AdminUser | null>(null);

  // Coupon State (simulates per-session user usage)
  const [usedCoupons, setUsedCoupons] = useState<string[]>([]);



  // Fetch Public Data on Mount
  useEffect(() => {
    const fetchPublicData = async () => {
      try {
        const [
          fetchedBikes,
          fetchedUnits,
          fetchedLocations,
          fetchedOffers,
          fetchedReviews,
          fetchedEmployees,
          fetchedSiteContent
        ] = await Promise.all([
          api.bike.getAll(),
          api.admin.getBikeUnits(),
          api.admin.getLocations(), // Publicly accessible now
          api.admin.getOffers(),    // Publicly accessible now
          api.admin.getReviews(),   // Publicly accessible now
          api.admin.getEmployees(), // Publicly accessible now
          api.admin.getSiteContent() // Publicly accessible now
        ]);

        if (fetchedBikes && fetchedBikes.length > 0) {
          setBikes(fetchedBikes);
        }
        if (fetchedUnits) {
          setBikeUnits(fetchedUnits);
        }
        if (fetchedLocations && fetchedLocations.length >= 6) {
          setPickupLocations(fetchedLocations);
        }
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
    if (isAdminLoggedIn || isManagerLoggedIn || isServiceManagerLoggedIn) {
      const fetchAdminData = async () => {
        try {
          const [
            fetchedEnquiries,
            fetchedAdminUsers,
            fetchedApplications,
            fetchedTransactions,
            fetchedParts
          ] = await Promise.all([
            api.admin.getEnquiries(),
            api.admin.getAdminUsers(),
            api.admin.getApplications(),
            api.admin.getTransactions(),
            api.admin.getPartsInventory()
          ]);

          setEnquiries(fetchedEnquiries);
          setAdminUsers(fetchedAdminUsers);
          setApplications(fetchedApplications);
          setTransactions(fetchedTransactions);
          // If we had a state for parts in App.tsx we would set it here, 
          // but ServiceManagerDashboard handles its own if passed bikes/units.
          // Actually, let's keep it simple. ServiceManagerDashboard can fetch its own parts if needed.
        } catch (error) {
          console.error("Failed to fetch admin data", error);
        }
      };
      fetchAdminData();
    }
  }, [isAdminLoggedIn, isManagerLoggedIn, isServiceManagerLoggedIn]);

  const handleSearch = (params: Omit<SearchParams, 'city'>) => {
    setSearchParams({ ...params, city: selectedCity });
    setSelectedBike(null);
    setView('searchResults');
    setIsSearchFormVisible(false);
    window.scrollTo(0, 0);
  };

  const resetToHome = useCallback((options: { scrollToTop?: boolean } = {}) => {
    const { scrollToTop = true } = options;
    setSearchParams(null);
    setSelectedBike(null);
    setView('home');
    setIsSearchFormVisible(false);
    if (scrollToTop) {
      window.scrollTo(0, 0);
    }
  }, []);

  const navigateTo = useCallback((targetView: View) => {
    setView(targetView);
    window.scrollTo(0, 0);
  }, []);

  const handleGoHome = useCallback(() => resetToHome(), [resetToHome]);
  const handleBookNowRedirect = useCallback(() => {
    setView('home');
    setSearchParams(null);
    setSelectedBike(null);
    setIsSearchFormVisible(true);
    window.scrollTo(0, 0);
  }, []);
  const handleGoToAbout = useCallback(() => navigateTo('about'), [navigateTo]);
  const handleGoToTariff = useCallback(() => navigateTo('tariff'), [navigateTo]);
  const handleGoToOffers = useCallback(() => navigateTo('offers'), [navigateTo]);
  const handleGoToPartner = useCallback(() => navigateTo('partner'), [navigateTo]);
  const handleGoToHowItWorks = useCallback(() => navigateTo('howItWorks'), [navigateTo]);
  const handleGoToFAQ = useCallback(() => navigateTo('faq'), [navigateTo]);
  const handleGoToTerms = useCallback(() => navigateTo('terms'), [navigateTo]);
  const handleGoToContact = useCallback(() => navigateTo('contact'), [navigateTo]);
  const handleGoToLogin = useCallback(() => navigateTo('login'), [navigateTo]);
  const handleGoToManagerLogin = useCallback(() => navigateTo('managerLogin'), [navigateTo]);
  const handleGoToPrivacyPolicy = useCallback(() => navigateTo('privacyPolicy'), [navigateTo]);
  const handleGoToCancellationPolicy = useCallback(() => navigateTo('cancellationPolicy'), [navigateTo]);
  const handleGoToPress = useCallback(() => navigateTo('press'), [navigateTo]);
  const handleGoToCareers = useCallback(() => navigateTo('careers'), [navigateTo]);
  const handleGoToFleet = useCallback(() => navigateTo('fleet'), [navigateTo]);
  const handleGoToPortalAccess = useCallback(() => navigateTo('portalAccess'), [navigateTo]);

  const showAndScrollToSearchForm = useCallback(() => {
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
  }, []);

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

  const handleUpdateBike = async (id: number, updatedFields: Partial<Bike>) => {
    try {
      await api.admin.updateBike(id, updatedFields);
      setBikes(prev => prev.map(b => b.id === id ? { ...b, ...updatedFields } : b));
    } catch (error) {
      console.error(`Failed to update bike ${id}:`, error);
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
    if (user.role.name === 'Manager') {
      setIsManagerLoggedIn(true);
      navigateTo('managerDashboard');
    } else if (user.role.name === 'Service Manager') {
      setIsServiceManagerLoggedIn(true);
      navigateTo('serviceManagerDashboard');
    } else {
      setIsAdminLoggedIn(true);
      navigateTo('adminDashboard');
    }
  };

  const handleLogout = () => {
    setLoggedInUser(null);
    setIsAdminLoggedIn(false);
    setIsManagerLoggedIn(false);
    setIsServiceManagerLoggedIn(false);
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
            <FeaturedFleet bikes={bikes} onSelectBike={handleSelectBike} city={selectedCity} />
            <ValueProps />
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

    if (view === 'managerLogin') {
      return <ManagerLoginPage onLoginSuccess={handleLoginSuccess} onBackToHome={handleGoHome} />;
    }


    if (view === 'portalAccess') {
      return <PortalAccessPage
        onGoToAdminLogin={handleGoToLogin}
        onGoToManagerLogin={handleGoToManagerLogin}
        onBackToHome={handleGoHome}
      />;
    }

    if (view === 'adminDashboard' && isAdminLoggedIn && loggedInUser) {
      return <AdminDashboard
        user={loggedInUser}
        onLogout={handleLogout}
        bikes={bikes} setBikes={setBikes}
        bikeUnits={bikeUnits} setBikeUnits={setBikeUnits}
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

    if (view === 'managerDashboard' && isManagerLoggedIn && loggedInUser) {
      return <ManagerDashboard
        user={loggedInUser}
        onLogout={handleLogout}
        bikes={bikes} setBikes={setBikes}
        bikeUnits={bikeUnits} setBikeUnits={setBikeUnits}
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

    if (view === 'serviceManagerDashboard' && isServiceManagerLoggedIn && loggedInUser) {
      return <ServiceManagerDashboard
        user={loggedInUser}
        onLogout={handleGoHome}
        bikes={bikes}
        bikeUnits={bikeUnits}
        onUpdateBike={async (id, data) => {
          try {
            const updated = await api.admin.updateBike(id, data);
            setBikes(prev => prev.map(b => b.id === id ? { ...b, ...updated } : b));
          } catch (error) {
            console.error('Failed to update bike from service hub:', error);
          }
        }}
        onUpdateUnit={async (id, data) => {
          try {
            const updated = await api.admin.updateBikeUnit(id, data);
            setBikeUnits(prev => prev.map(u => u.id === id ? { ...u, ...updated } : u));
          } catch (error) {
            console.error('Failed to update unit from service hub:', error);
          }
        }}
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
          onGoToManagerLogin={handleGoToManagerLogin}
          onGoToPortalAccess={handleGoToPortalAccess}
          onGoToFleet={handleGoToFleet}
          isAdminLoggedIn={isAdminLoggedIn || isManagerLoggedIn || isServiceManagerLoggedIn}
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
    <ErrorBoundary>
      <div className="bg-white font-sans text-primary overflow-x-hidden">
        <Suspense fallback={<LoadingSpinner />}>
          {renderContent()}
        </Suspense>
      </div>
    </ErrorBoundary>
  );
};

export default App;
