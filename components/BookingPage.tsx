import React, { useState, useEffect } from 'react';
import { type Bike, type SearchParams, type BookingDetails, type Offer, type RiderInformation, COMPANY_INFO } from '../types';
import { bikes } from '../constants';
import { ArrowRightIcon, CheckCircleIcon, CreditCardIcon, DocumentTextIcon, UserCircleIcon, XIcon, ShieldCheckIcon } from './icons/Icons';
import { calculateFare } from '../src/utils/pricing';
import { uploadBookingDocuments } from '../src/utils/fileUpload';
import api, { paymentAPI } from '../src/api';
import { supabase } from '../src/supabaseClient'; // Import supabase directly
import { RAZORPAY_KEY_ID } from '../constants';

interface BookingPageProps {
  bookingDetails: Omit<BookingDetails, 'user' | 'bookingId' | 'transactionId'>;
  onConfirmBooking: (details: Omit<BookingDetails, 'bookingId' | 'transactionId'>, usedCouponCode?: string) => void;
  onBack: () => void;
  offers: Offer[];
  usedCoupons: string[];
}

const ProgressIndicator: React.FC<{ step: number }> = ({ step }) => {
  const steps = [
    { name: 'Summary', icon: <CheckCircleIcon /> },
    { name: 'Details', icon: <UserCircleIcon /> },
    { name: 'Payment', icon: <CreditCardIcon /> },
  ];
  return (
    <nav aria-label="Progress">
      <div className="flex justify-center">
        <ol role="list" className="flex items-center">
          {steps.map((s, index) => (
            <li key={s.name} className={`relative ${index !== steps.length - 1 ? 'pr-12 sm:pr-20' : ''}`}>
              {index < step ? (
                <>
                  <div className="absolute inset-0 flex items-center" aria-hidden="true">
                    <div className="h-0.5 w-full bg-secondary"></div>
                  </div>
                  <div className="relative flex h-8 w-8 items-center justify-center bg-secondary rounded-full">
                    <CheckCircleIcon className="h-5 w-5 text-white" aria-hidden="true" />
                  </div>
                </>
              ) : index === step ? (
                <>
                  <div className="absolute inset-0 flex items-center" aria-hidden="true">
                    <div className="h-0.5 w-full bg-gray-200"></div>
                  </div>
                  <div className="relative flex h-8 w-8 items-center justify-center bg-white border-2 border-secondary rounded-full" aria-current="step">
                    <span className="h-2.5 w-2.5 bg-secondary rounded-full" aria-hidden="true"></span>
                  </div>
                </>
              ) : (
                <>
                  <div className="absolute inset-0 flex items-center" aria-hidden="true">
                    <div className="h-0.5 w-full bg-gray-200"></div>
                  </div>
                  <div className="group relative flex h-8 w-8 items-center justify-center bg-white border-2 border-gray-300 rounded-full">
                    <span className="h-2.5 w-2.5 bg-transparent rounded-full" aria-hidden="true"></span>
                  </div>
                </>
              )}
              <span className={`absolute top-10 left-0 whitespace-nowrap text-center text-xs sm:text-sm font-medium ${index <= step ? 'text-primary' : 'text-gray-500'}`} style={{ transform: 'translateX(-50%)', left: '1rem' }}>{s.name}</span>
            </li>
          ))}
        </ol>
      </div>
    </nav>
  );
};


const BookingPage: React.FC<BookingPageProps> = ({ bookingDetails, onConfirmBooking, onBack, offers, usedCoupons }) => {
  const { bike, searchParams, addons, totalFare } = bookingDetails;
  const [step, setStep] = useState(0);

  // Enhanced rider information state
  const [riderInfo, setRiderInfo] = useState<Partial<RiderInformation>>({
    applicationNumber: '',
    userName: '',
    contactNumber: '',
    alternateNumber: '',
    emailId: '',
    localAddress: '',
    localAddressProof: '',
    permanentAddress: '',
    permanentAddressProof: 'Aadhaar Card',
    aadhaarDocument: '',
    aadhaarNumber: '',
    panCardDocument: '',
    panNumber: '',
    deliveryExecutive: false,
    deliveryId: '',
    rentalPeriodCommencementDate: searchParams.pickupDate,
    startedDate: searchParams.pickupDate,
    returnDate: searchParams.dropDate,
    vehicleName: bike.name,
    vehicleType: bike.type,
    vehicleCategory: '',
    vehicleColor: '',
    vehicleIdNumber: ''
  });

  const [applicationNumber, setApplicationNumber] = useState('');
  const [loadingAppNumber, setLoadingAppNumber] = useState(false);

  const [drivingLicenceFile, setDrivingLicenceFile] = useState<File | null>(null);
  const [aadhaarFile, setAadhaarFile] = useState<File | null>(null);
  const [panCardFile, setPanCardFile] = useState<File | null>(null);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [documentsAcknowledged, setDocumentsAcknowledged] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);

  // Coupon state
  const [couponCode, setCouponCode] = useState('');
  const [couponError, setCouponError] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<Offer | null>(null);
  const [discount, setDiscount] = useState(0);

  // Pricing calculation
  const onlineFareDetails = calculateFare({
    bike,
    pickupDate: searchParams.pickupDate,
    pickupTime: searchParams.pickupTime,
    dropDate: searchParams.dropDate,
    dropTime: searchParams.dropTime,
    addons,
    paymentMode: 'ONLINE'
  });

  const cashFareDetails = calculateFare({
    bike,
    pickupDate: searchParams.pickupDate,
    pickupTime: searchParams.pickupTime,
    dropDate: searchParams.dropDate,
    dropTime: searchParams.dropTime,
    addons,
    paymentMode: 'CASH'
  });

  // Derived totals with discount applied
  const baseTotal = onlineFareDetails.baseFare + onlineFareDetails.addonsCost;
  const subtotalAfterDiscount = Math.max(0, baseTotal - discount);

  // Platform fee: 2% of BASE TOTAL (before discount)
  // This ensures we collect the fee even if the coupon gives 100% off.
  const platformFee = Number((baseTotal * 0.02).toFixed(2));

  // Final total (same for both online and cash)
  const totalPayable = subtotalAfterDiscount + platformFee;


  const [isProcessing, setIsProcessing] = useState(false);

  // Fetch logged-in user on mount
  useEffect(() => {
    const fetchUser = async () => {
      try {
        // Direct Supabase call to avoid potential api.auth issue
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setRiderInfo(prev => ({
            ...prev,
            userId: user.id,
            emailId: user.email || prev.emailId,
            userName: user.user_metadata?.full_name || prev.userName,
            contactNumber: user.user_metadata?.phone || prev.contactNumber
          }));
        }
      } catch (err) {
        console.log('User not logged in or fetch failed', err);
      }
    };
    fetchUser();
  }, []);

  // Generate application number when entering Step 2 (local generation instead of API call)
  useEffect(() => {
    if (step === 1 && !applicationNumber && !loadingAppNumber) {
      setLoadingAppNumber(true);

      // Generate application number locally with sequential increment
      // Format: RR'S + 4 digits (e.g., RR'S 0059)
      // Logic: Start at 59, increase significantly (random 20-100) on each new app
      const STORAGE_KEY = 'roadrobos_app_number';
      const lastNum = parseInt(localStorage.getItem(STORAGE_KEY) || '59', 10);

      // Calculate next number with significant jump
      const increment = Math.floor(Math.random() * 80) + 20; // Jump between 20 and 100
      const nextNum = lastNum + increment;

      // Save for next time
      localStorage.setItem(STORAGE_KEY, nextNum.toString());

      // Format with padding
      const paddedNum = nextNum.toString().padStart(4, '0');
      const newAppNumber = `RR'S ${paddedNum}`;

      setApplicationNumber(newAppNumber);
      setRiderInfo(prev => ({ ...prev, applicationNumber: newAppNumber }));
      setLoadingAppNumber(false);
    }
  }, [step, applicationNumber, loadingAppNumber]);

  const handleRiderInfoChange = (field: keyof RiderInformation, value: any) => {
    // Auto-set vehicle type when vehicle name is selected
    if (field === 'vehicleName') {
      const selectedBike = bikes.find(b => b.name === value);
      if (selectedBike) {
        setRiderInfo(prev => ({ ...prev, vehicleName: value, vehicleType: selectedBike.type }));
        return;
      }
    }
    setRiderInfo(prev => ({ ...prev, [field]: value }));
  };

  const handleApplyCoupon = () => {
    setCouponError('');
    const coupon = offers.find(o => o.code?.toLowerCase() === couponCode.toLowerCase());

    if (!coupon || coupon.status === 'Disabled') {
      setCouponError('Invalid or expired coupon code.');
      return;
    }

    if (usedCoupons.includes(coupon.code!)) {
      setCouponError('You have already used this coupon for this session.');
      return;
    }

    // Additional validation (e.g., min booking value) can be added here

    let discountAmount = 0;
    console.log('=== COUPON DEBUG ===');
    console.log('Coupon Object:', coupon);
    console.log('Coupon discountPercent:', coupon.discountPercent);
    console.log('Coupon flatAmount:', coupon.flatAmount);
    console.log('Base Total:', baseTotal);

    // Use baseTotal for calculation to ensure it matches the displayed fare
    if (coupon.discountPercent) {
      discountAmount = (baseTotal * coupon.discountPercent) / 100;
      console.log('Calculated Discount Amount:', discountAmount);
    } else if (coupon.flatAmount) {
      discountAmount = coupon.flatAmount;
      console.log('Flat Discount Amount:', discountAmount);
    }

    console.log('Final Discount Amount:', discountAmount);
    setAppliedCoupon(coupon);
    setDiscount(discountAmount);
    setCouponCode('');
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setDiscount(0);
    setCouponError('');
  };

  const validateStep1 = () => {
    setStep(1);
  };

  const validateStep2 = () => {
    const newErrors: { [key: string]: string } = {};

    // Required fields validation
    if (!riderInfo.userName) newErrors.userName = 'Name is required.';
    if (!riderInfo.contactNumber || !/^\d{10}$/.test(riderInfo.contactNumber)) newErrors.contactNumber = 'A valid 10-digit contact number is required.';
    if (riderInfo.alternateNumber && !/^\d{10}$/.test(riderInfo.alternateNumber)) newErrors.alternateNumber = 'Alternate number must be 10 digits.';
    if (!riderInfo.emailId || !/\S+@\S+\.\S+/.test(riderInfo.emailId)) newErrors.emailId = 'A valid email is required.';
    if (!riderInfo.localAddress) newErrors.localAddress = 'Local address is required.';
    if (!riderInfo.permanentAddress) newErrors.permanentAddress = 'Permanent address is required.';
    if (!riderInfo.permanentAddress) newErrors.permanentAddress = 'Permanent address is required.';

    // Aadhaar Validation
    if (!riderInfo.aadhaarNumber) {
      newErrors.aadhaarNumber = 'Aadhaar number is required.';
    } else if (!/^\d{12}$/.test(riderInfo.aadhaarNumber)) {
      newErrors.aadhaarNumber = 'Invalid Aadhaar number (must be 12 digits).';
    }
    if (!aadhaarFile) newErrors.aadhaarDocument = 'Aadhaar card document is required.';

    // PAN Validation
    if (!riderInfo.panNumber) {
      newErrors.panNumber = 'PAN number is required.';
    } else if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(riderInfo.panNumber.toUpperCase())) {
      newErrors.panNumber = 'Invalid PAN format (e.g., ABCDE1234F).';
    }
    if (!panCardFile) newErrors.panCardDocument = 'PAN card document is required.';
    if (!riderInfo.vehicleIdNumber) newErrors.vehicleIdNumber = 'Vehicle ID number is required.';
    if (!drivingLicenceFile) newErrors.document = 'Please upload your driving licence.';
    if (!termsAccepted) newErrors.terms = 'You must accept the terms and conditions.';
    if (!documentsAcknowledged) newErrors.documents = 'You must acknowledge the document submission requirement.';

    setErrors(newErrors);
    if (Object.keys(newErrors).length === 0) {
      setStep(2);
    }
  };

  const loadRazorpayScript = (src: string) => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = () => {
        resolve(true);
      };
      script.onerror = () => {
        resolve(false);
      };
      document.body.appendChild(script);
    });
  };

  const handleOnlinePayment = async () => {
    setIsProcessing(true);
    try {
      // 1. Load Razorpay SDK
      const scriptLoaded = await loadRazorpayScript('https://checkout.razorpay.com/v1/checkout.js');
      if (!scriptLoaded) {
        throw new Error('Razorpay SDK failed to load. Please check your internet connection.');
      }

      // 2. Upload documents to Supabase Storage
      console.log('Uploading documents to Supabase Storage...');
      const documentUrls = await uploadBookingDocuments({
        aadhaar: aadhaarFile || undefined,
        pan: panCardFile || undefined,
        license: drivingLicenceFile || undefined
      });
      console.log('Document URLs:', documentUrls);

      // 3. Map frontend riderInfo to backend expected format  
      const apiUser = {
        userId: (riderInfo as any).userId,
        userName: riderInfo.userName,
        emailId: riderInfo.emailId,
        contactNumber: riderInfo.contactNumber,
        altContactNumber: riderInfo.alternateNumber,
        address: riderInfo.localAddress,
        idCardType: 'Aadhaar Card',
        idCardNumber: riderInfo.aadhaarNumber,
        // Add document URLs
        aadhaarDocumentUrl: documentUrls.aadhaarUrl,
        panDocumentUrl: documentUrls.panUrl,
        licenseDocumentUrl: documentUrls.licenseUrl
      };

      // 2. Initiate Booking & Create Order using API
      // Note: This now ONLY creates the Razorpay order, no DB insert yet.
      const bookingPayload = {
        bike,
        searchParams,
        user: apiUser,
        addons,
        paymentMode: 'ONLINE',
        baseFare: onlineFareDetails.baseFare,
        platformFee: platformFee,
        totalPayable: totalPayable,
        paymentStatus: 'PENDING',
        // Pass coupon details so backend knows about the discount
        couponCode: appliedCoupon?.code || null,
        discountAmount: discount || 0
      };

      // Use the API client methodology
      const data = await api.booking.initiate(bookingPayload);

      // Extract bookingId (generated ref) and order details
      const { bookingId, razorpayOrderId, amount, currency } = data;

      // 3. Initialize Razorpay Checkout
      const options = {
        key: RAZORPAY_KEY_ID,
        amount: amount, // Amount in paise
        currency: currency,
        name: 'RoAd RoBos',
        description: 'Bike Rental Payment',
        order_id: razorpayOrderId,
        handler: async function (response: any) {
          try {
            // 4. Verify Payment AND Create Booking
            // We pass the bookingPayload so the backend can create the record now.
            const verifyResponse = await paymentAPI.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              booking_id: bookingId,
              bookingData: { ...bookingPayload, bookingId } // Pass full data for creation
            });

            if (verifyResponse.success) {
              onConfirmBooking({
                ...bookingDetails,
                platformFee: platformFee,
                totalPayable: totalPayable,
                paymentMode: 'ONLINE',
                paymentStatus: 'PAID',
                // Use IDs from the final verification response
                bookingId: verifyResponse.bookingId || bookingId,
                transactionId: response.razorpay_payment_id,
                user: riderInfo as RiderInformation
              } as any, appliedCoupon?.code);
            } else {
              // Show actual error from backend
              const errorMsg = verifyResponse.error || 'Payment verification failed';
              const errorDetails = verifyResponse.details ? `\n\nDetails: ${verifyResponse.details}` : '';
              throw new Error(errorMsg + errorDetails);
            }
          } catch (err: any) {
            console.error('Payment verification error:', err);
            alert(`Payment verification failed:\n${err.message}\n\nPlease contact support with your payment details if money was deducted.`);
          }
        },
        prefill: {
          name: riderInfo.userName,
          email: riderInfo.emailId,
          contact: riderInfo.contactNumber
        },
        theme: {
          color: '#084C3E'
        }
      };

      const paymentObject = new (window as any).Razorpay(options);
      paymentObject.open();

    } catch (error: any) {
      console.error('Online payment error:', error);
      alert(`Payment failed: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCashBooking = async () => {
    setIsProcessing(true);
    try {
      // STEP 1: Upload documents to Supabase Storage
      console.log('Uploading documents to Supabase Storage...');
      const documentUrls = await uploadBookingDocuments({
        aadhaar: aadhaarFile || undefined,
        pan: panCardFile || undefined,
        license: drivingLicenceFile || undefined
      });
      console.log('Document URLs:', documentUrls);

      // STEP 2: Map frontend riderInfo to backend expected format
      const apiUser = {
        ...riderInfo,
        userId: (riderInfo as any).userId,
        altContactNumber: riderInfo.alternateNumber,
        address: riderInfo.localAddress,
        location: searchParams.city || 'Bangalore',
        idCardType: 'Aadhaar Card',
        idCardNumber: riderInfo.aadhaarNumber,
        licenseNumber: 'See Upload',
        rentalPeriodCommencementDate: riderInfo.rentalPeriodCommencementDate,
        // Add document URLs
        aadhaarDocumentUrl: documentUrls.aadhaarUrl,
        panDocumentUrl: documentUrls.panUrl,
        licenseDocumentUrl: documentUrls.licenseUrl
      };

      const bookingPayload = {
        bike,
        searchParams,
        user: apiUser,
        addons,
        paymentMode: 'CASH',
        baseFare: cashFareDetails.baseFare,
        platformFee: platformFee,
        totalPayable: totalPayable,
        paymentStatus: 'PENDING'
      };

      // Call backend endpoint for cash booking using API
      const data = await api.booking.createCash(bookingPayload);

      // Success
      onConfirmBooking({
        ...bookingDetails,
        platformFee: platformFee,
        totalPayable: totalPayable,
        paymentMode: 'CASH',
        paymentStatus: 'PENDING',
        bookingId: data.bookingId,
        // For cash bookings, generate or use backend provided transaction/booking ID as ref
        transactionId: `CASH-${data.bookingId}`,
        user: riderInfo as RiderInformation
      } as any, appliedCoupon?.code);

    } catch (error: any) {
      console.error('Cash booking error:', error);
      alert(`Booking failed: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const formatDate = (dateStr: string, timeStr: string) => {
    if (!dateStr || !timeStr) return 'N/A';
    const date = new Date(`${dateStr}T${timeStr}`);
    return date.toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true });
  };

  const inputClasses = (hasError: boolean) =>
    `mt-1 block w-full p-3 bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-input-focus disabled:bg-gray-100 disabled:cursor-not-allowed ${hasError ? 'border-error' : 'border-input'}`;

  const selectedBike = bikes.find(b => b.name === riderInfo.vehicleName);
  const isVehicleSelected = !!selectedBike;

  return (
    <>
      <div className="bg-accent min-h-screen py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          <div className="bg-white p-4 sm:p-8 rounded-xl shadow-md mb-8">
            <ProgressIndicator step={step} />
          </div>

          {step === 0 && (
            <div className="bg-white p-8 rounded-xl shadow-md">
              <h2 className="text-xl font-heading font-extrabold uppercase tracking-widest mb-6">Step 1: Confirm Your Booking Summary</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <img src={bike.images[0]} alt={bike.name} className="w-full rounded-lg shadow-sm" />
                  <h3 className="text-xl font-bold mt-4">{bike.name}</h3>
                  <p className="text-gray-600">{bike.specs.cc} | {bike.type}</p>
                </div>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-lg">Trip Details</h4>
                    {searchParams.pickupLocation && (
                      <p className="text-gray-700 flex items-center gap-2 mb-2">
                        <svg className="w-5 h-5 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <strong>Pickup Location:</strong> {searchParams.pickupLocation}
                      </p>
                    )}
                    <p className="text-gray-700"><strong>Pickup:</strong> {formatDate(searchParams.pickupDate, searchParams.pickupTime)}</p>
                    <p className="text-gray-700"><strong>Drop-off:</strong> {formatDate(searchParams.dropDate, searchParams.dropTime)}</p>
                  </div>

                  {/* Coupon Section */}
                  <div className="border-t pt-4">
                    <label htmlFor="coupon" className="font-semibold text-lg mb-2 block">Apply Coupon</label>
                    {appliedCoupon ? (
                      <div className="flex items-center justify-between bg-green-50 text-green-800 p-3 rounded-lg">
                        <span className="font-semibold">Applied: {appliedCoupon.code}</span>
                        <button onClick={handleRemoveCoupon} className="font-bold text-lg">&times;</button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          id="coupon"
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                          placeholder="Enter coupon code"
                          className="w-full p-2 bg-white border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-input-focus"
                        />
                        <button onClick={handleApplyCoupon} className="bg-secondary text-white font-semibold px-5 py-2 rounded-xl hover:bg-opacity-90 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 shadow-md hover:shadow-lg">Apply</button>
                      </div>
                    )}
                    {couponError && <p className="text-error text-sm mt-1">{couponError}</p>}
                  </div>

                  <div className="border-t pt-4">
                    <h4 className="font-semibold text-lg mb-2">Fare Breakdown</h4>
                    <div className="space-y-1 text-gray-700">
                      <div className="flex justify-between"><span>Base Fare</span><span>₹{onlineFareDetails.baseFare.toFixed(2)}</span></div>
                      {addons.helmet && <div className="flex justify-between"><span>Extra Helmet</span><span>₹50.00</span></div>}
                      {addons.insurance && <div className="flex justify-between"><span>Insurance</span><span>₹100.00</span></div>}
                      {discount > 0 && <div className="flex justify-between text-green-600"><span>Discount</span><span>- ₹{discount.toFixed(2)}</span></div>}
                      <div className="flex justify-between text-gray-600 text-sm"><span>Platform Fee (2%)</span><span>₹{platformFee.toFixed(2)}</span></div>

                      <div className="flex justify-between font-bold text-lg border-t pt-2 mt-2"><span>Total Payable</span><span>₹{totalPayable.toFixed(2)}</span></div>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">A refundable deposit of ₹{bike.deposit} will be collected at pickup.</p>

                    {/* Payment Fee Notice */}
                    <div className="mt-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 p-4 rounded-xl">
                      <div className="flex items-start gap-3">
                        <div className="bg-blue-100 p-2 rounded-lg flex-shrink-0">
                          <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <h4 className="text-sm font-bold text-blue-900 mb-1 flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                            </svg>
                            Platform Fee Information
                          </h4>
                          <p className="text-xs text-blue-800 leading-relaxed">A <span className="font-bold">2% platform fee</span> applies to all website bookings to support our service operations.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-8 flex justify-between items-center">
                <button onClick={onBack} className="text-primary font-semibold hover:underline"> &larr; Back to Details</button>
                <button onClick={validateStep1} className="bg-secondary text-white font-bold py-3 px-8 rounded-xl hover:bg-opacity-90 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 shadow-md hover:shadow-lg flex items-center gap-2">
                  Proceed to Details <ArrowRightIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="bg-white p-8 rounded-xl shadow-md">
              <h2 className="text-xl font-heading font-extrabold uppercase tracking-widest mb-6">Step 2: Rider Information</h2>

              {/* Company Information Banner */}
              <div className="mb-8 bg-gradient-to-r from-primary to-secondary p-6 rounded-xl shadow-lg text-white">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <svg className="w-12 h-12 text-white opacity-90" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold mb-3">{COMPANY_INFO.name}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      <div className="flex items-start gap-2">
                        <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <div>
                          <p className="font-semibold">Registered Office:</p>
                          <p className="opacity-90 leading-relaxed whitespace-pre-line">{COMPANY_INFO.address}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <div>
                          <p className="font-semibold">GST Number:</p>
                          <p className="opacity-90 font-mono tracking-wide">{COMPANY_INFO.gstNumber}</p>
                          <p className="font-semibold mt-2">Udyam Number:</p>
                          <p className="opacity-90 font-mono tracking-wide">UDYAM-KR-03-0583439</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Application Number */}
              <div className="mb-6 p-4 bg-blue-50 border-l-4 border-blue-500 rounded-lg">
                <div className="flex items-center gap-3">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <div className="flex-1">
                    <label className="block text-sm font-semibold text-blue-900 mb-1">Application Number</label>
                    <input
                      type="text"
                      value={applicationNumber || "Generating..."}
                      disabled
                      className="w-full p-2 bg-white border border-blue-200 rounded-lg text-gray-800 font-mono text-lg font-semibold cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>

              {/* Personal Information Section */}
              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-2 border-b-2 border-primary pb-2 mb-4">
                  <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <h3 className="text-lg font-bold text-gray-900">Personal Information</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="userName" className="block text-sm font-medium text-gray-700">Full Name *</label>
                    <input
                      type="text"
                      id="userName"
                      value={riderInfo.userName || ''}
                      onChange={e => handleRiderInfoChange('userName', e.target.value)}
                      className={inputClasses(!!errors.userName)}
                    />
                    {errors.userName && <p className="text-red-500 text-xs mt-1">{errors.userName}</p>}
                  </div>
                  <div>
                    <label htmlFor="contactNumber" className="block text-sm font-medium text-gray-700">Contact Number *</label>
                    <input
                      type="tel"
                      id="contactNumber"
                      value={riderInfo.contactNumber || ''}
                      onChange={e => handleRiderInfoChange('contactNumber', e.target.value)}
                      className={inputClasses(!!errors.contactNumber)}
                      placeholder="10-digit phone number"
                    />
                    {errors.contactNumber && <p className="text-red-500 text-xs mt-1">{errors.contactNumber}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="alternateNumber" className="block text-sm font-medium text-gray-700">Alternate Number</label>
                    <input
                      type="tel"
                      id="alternateNumber"
                      value={riderInfo.alternateNumber || ''}
                      onChange={e => handleRiderInfoChange('alternateNumber', e.target.value)}
                      className={inputClasses(!!errors.alternateNumber)}
                      placeholder="10-digit phone number"
                    />
                    {errors.alternateNumber && <p className="text-red-500 text-xs mt-1">{errors.alternateNumber}</p>}
                  </div>
                  <div>
                    <label htmlFor="emailId" className="block text-sm font-medium text-gray-700">Email ID *</label>
                    <input
                      type="email"
                      id="emailId"
                      value={riderInfo.emailId || ''}
                      onChange={e => handleRiderInfoChange('emailId', e.target.value)}
                      className={inputClasses(!!errors.emailId)}
                    />
                    {errors.emailId && <p className="text-red-500 text-xs mt-1">{errors.emailId}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="localAddress" className="block text-sm font-medium text-gray-700">Local Address *</label>
                    <textarea
                      id="localAddress"
                      rows={3}
                      value={riderInfo.localAddress || ''}
                      onChange={e => handleRiderInfoChange('localAddress', e.target.value)}
                      className={inputClasses(!!errors.localAddress)}
                    />
                    {errors.localAddress && <p className="text-red-500 text-xs mt-1">{errors.localAddress}</p>}
                  </div>
                  <div>
                    <label htmlFor="localAddressProof" className="block text-sm font-medium text-gray-700">Local Address Proof</label>
                    <input
                      type="text"
                      id="localAddressProof"
                      value={riderInfo.localAddressProof || ''}
                      onChange={e => handleRiderInfoChange('localAddressProof', e.target.value)}
                      className={inputClasses(false)}
                      placeholder="e.g., Utility Bill, Rental Agreement"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="permanentAddress" className="block text-sm font-medium text-gray-700">Permanent Address *</label>
                    <textarea
                      id="permanentAddress"
                      rows={3}
                      value={riderInfo.permanentAddress || ''}
                      onChange={e => handleRiderInfoChange('permanentAddress', e.target.value)}
                      className={inputClasses(!!errors.permanentAddress)}
                    />
                    {errors.permanentAddress && <p className="text-red-500 text-xs mt-1">{errors.permanentAddress}</p>}
                  </div>
                  <div>
                    <label htmlFor="permanentAddressProof" className="block text-sm font-medium text-gray-700">Permanent Address Proof *</label>
                    <select
                      id="permanentAddressProof"
                      value={riderInfo.permanentAddressProof || 'Aadhaar Card'}
                      onChange={e => handleRiderInfoChange('permanentAddressProof', e.target.value)}
                      className={inputClasses(false)}
                    >
                      <option value="Aadhaar Card">Aadhaar Card</option>
                      <option value="Voter ID">Voter ID</option>
                      <option value="Passport">Passport</option>
                      <option value="Utility Bill">Utility Bill</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* ID Documents Upload Section */}
              <div className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border-l-4 border-yellow-500 rounded-lg mb-4 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <h4 className="font-semibold text-yellow-900">Secure Document Verification</h4>
                </div>
                <p className="text-sm text-yellow-800">Please provide document numbers and upload images for identity verification.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Aadhaar Section */}
                <div className="space-y-4">
                  <div>
                    <label htmlFor="aadhaarNumber" className="block text-sm font-medium text-gray-700 mb-1">Aadhaar Number *</label>
                    <input
                      type="text"
                      id="aadhaarNumber"
                      value={riderInfo.aadhaarNumber || ''}
                      onChange={e => {
                        const val = e.target.value.replace(/\D/g, '').slice(0, 12);
                        handleRiderInfoChange('aadhaarNumber', val);
                      }}
                      placeholder="12-digit Aadhaar Number"
                      className={inputClasses(!!errors.aadhaarNumber)}
                    />
                    {errors.aadhaarNumber && <p className="text-red-500 text-xs mt-1">{errors.aadhaarNumber}</p>}
                  </div>

                  <div>
                    <label htmlFor="aadhaar" className="block text-sm font-medium text-gray-700 mb-2">Upload Aadhaar Card *</label>
                    <div className={`relative flex justify-center px-4 py-6 border-2 ${errors.aadhaarDocument ? 'border-red-500' : 'border-gray-300'} border-dashed rounded-xl hover:border-primary transition-all duration-300 bg-gradient-to-br from-white to-gray-50`}>
                      <div className="space-y-2 text-center w-full">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <div className="flex flex-col items-center gap-2">
                          <label htmlFor="aadhaar-upload" className="relative cursor-pointer bg-white px-4 py-2 rounded-lg font-medium text-primary hover:text-white hover:bg-primary border border-primary transition-all duration-300 shadow-sm hover:shadow-md flex items-center gap-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <span>{aadhaarFile ? aadhaarFile.name : 'Choose File'}</span>
                            <input
                              id="aadhaar-upload"
                              name="aadhaar-upload"
                              type="file"
                              accept=".pdf,.jpg,.jpeg,.png"
                              className="sr-only"
                              onChange={e => {
                                const file = e.target.files ? e.target.files[0] : null;
                                setAadhaarFile(file);
                                if (file) {
                                  handleRiderInfoChange('aadhaarDocument', file.name);
                                }
                              }}
                            />
                          </label>
                          <span className="text-xs text-gray-400">or</span>
                          <label htmlFor="aadhaar-camera" className="relative cursor-pointer bg-white px-4 py-2 rounded-lg font-medium text-primary hover:text-white hover:bg-primary border border-primary transition-all duration-300 shadow-sm hover:shadow-md flex items-center gap-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span>Capture Photo</span>
                            <input
                              id="aadhaar-camera"
                              name="aadhaar-camera"
                              type="file"
                              accept="image/*"
                              capture="environment"
                              className="sr-only"
                              onChange={e => {
                                const file = e.target.files ? e.target.files[0] : null;
                                setAadhaarFile(file);
                                if (file) {
                                  handleRiderInfoChange('aadhaarDocument', file.name);
                                }
                              }}
                            />
                          </label>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">PDF, JPG, PNG (max 10MB)</p>
                      </div>
                    </div>
                    {errors.aadhaarDocument && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><span>⚠️</span>{errors.aadhaarDocument}</p>}
                  </div>
                </div>

                {/* PAN Section */}
                <div className="space-y-4">
                  <div>
                    <label htmlFor="panNumber" className="block text-sm font-medium text-gray-700 mb-1">PAN Number *</label>
                    <input
                      type="text"
                      id="panNumber"
                      value={riderInfo.panNumber || ''}
                      onChange={e => {
                        const val = e.target.value.toUpperCase().slice(0, 10);
                        handleRiderInfoChange('panNumber', val);
                      }}
                      placeholder="ABCDE1234F"
                      className={inputClasses(!!errors.panNumber)}
                    />
                    {errors.panNumber && <p className="text-red-500 text-xs mt-1">{errors.panNumber}</p>}
                  </div>

                  <div>
                    <label htmlFor="pancard" className="block text-sm font-medium text-gray-700 mb-2">Upload PAN Card *</label>
                    <div className={`relative flex justify-center px-4 py-6 border-2 ${errors.panCardDocument ? 'border-red-500' : 'border-gray-300'} border-dashed rounded-xl hover:border-primary transition-all duration-300 bg-gradient-to-br from-white to-gray-50`}>
                      <div className="space-y-2 text-center w-full">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <div className="flex flex-col items-center gap-2">
                          <label htmlFor="pancard-upload" className="relative cursor-pointer bg-white px-4 py-2 rounded-lg font-medium text-primary hover:text-white hover:bg-primary border border-primary transition-all duration-300 shadow-sm hover:shadow-md flex items-center gap-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <span>{panCardFile ? panCardFile.name : 'Choose File'}</span>
                            <input
                              id="pancard-upload"
                              name="pancard-upload"
                              type="file"
                              accept=".pdf,.jpg,.jpeg,.png"
                              className="sr-only"
                              onChange={e => {
                                const file = e.target.files ? e.target.files[0] : null;
                                setPanCardFile(file);
                                if (file) {
                                  handleRiderInfoChange('panCardDocument', file.name);
                                }
                              }}
                            />
                          </label>
                          <span className="text-xs text-gray-400">or</span>
                          <label htmlFor="pancard-camera" className="relative cursor-pointer bg-white px-4 py-2 rounded-lg font-medium text-primary hover:text-white hover:bg-primary border border-primary transition-all duration-300 shadow-sm hover:shadow-md flex items-center gap-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span>Capture Photo</span>
                            <input
                              id="pancard-camera"
                              name="pancard-camera"
                              type="file"
                              accept="image/*"
                              capture="environment"
                              className="sr-only"
                              onChange={e => {
                                const file = e.target.files ? e.target.files[0] : null;
                                setPanCardFile(file);
                                if (file) {
                                  handleRiderInfoChange('panCardDocument', file.name);
                                }
                              }}
                            />
                          </label>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">PDF, JPG, PNG (max 10MB)</p>
                      </div>
                    </div>
                    {errors.panCardDocument && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><span>⚠️</span>{errors.panCardDocument}</p>}
                  </div>
                </div>
              </div>


              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <input
                  type="checkbox"
                  id="deliveryExecutive"
                  checked={riderInfo.deliveryExecutive || false}
                  onChange={e => handleRiderInfoChange('deliveryExecutive', e.target.checked)}
                  className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
                />
                <label htmlFor="deliveryExecutive" className="text-sm font-medium text-gray-700">I am a Delivery Executive</label>
              </div>

              {riderInfo.deliveryExecutive && (
                <div>
                  <label htmlFor="deliveryId" className="block text-sm font-medium text-gray-700">Delivery ID</label>
                  <input
                    type="text"
                    id="deliveryId"
                    value={riderInfo.deliveryId || ''}
                    onChange={e => handleRiderInfoChange('deliveryId', e.target.value)}
                    className={inputClasses(false)}
                  />
                </div>
              )}


              {/* Rental Period Section */}
              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-2 border-b-2 border-secondary pb-2 mb-4">
                  <svg className="w-6 h-6 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <h3 className="text-lg font-bold text-gray-900">Rental Period</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="rentalPeriodCommencementDate" className="block text-sm font-medium text-gray-700">Commencement Date</label>
                    <input
                      type="date"
                      id="rentalPeriodCommencementDate"
                      value={riderInfo.rentalPeriodCommencementDate || ''}
                      onChange={e => handleRiderInfoChange('rentalPeriodCommencementDate', e.target.value)}
                      className={inputClasses(false)}
                    />
                  </div>
                  <div>
                    <label htmlFor="startedDate" className="block text-sm font-medium text-gray-700">Started Date</label>
                    <input
                      type="date"
                      id="startedDate"
                      value={riderInfo.startedDate || ''}
                      onChange={e => handleRiderInfoChange('startedDate', e.target.value)}
                      className={inputClasses(false)}
                    />
                  </div>
                  <div>
                    <label htmlFor="returnDate" className="block text-sm font-medium text-gray-700">Return Date</label>
                    <input
                      type="date"
                      id="returnDate"
                      value={riderInfo.returnDate || ''}
                      onChange={e => handleRiderInfoChange('returnDate', e.target.value)}
                      className={inputClasses(false)}
                    />
                  </div>
                </div>
              </div>

              {/* Vehicle Details Section */}
              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-2 border-b-2 border-green-600 pb-2 mb-4">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <h3 className="text-lg font-bold text-gray-900">Vehicle Details</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="vehicleName" className="block text-sm font-medium text-gray-700">Vehicle Name</label>
                    <select
                      id="vehicleName"
                      value={riderInfo.vehicleName || ''}
                      onChange={e => {
                        const newName = e.target.value;
                        handleRiderInfoChange('vehicleName', newName);
                        const bike = bikes.find(b => b.name === newName);
                        if (bike) {
                          const type = bike.type === 'Electric' ? 'Electric' : 'Gear';
                          handleRiderInfoChange('vehicleType', type);

                          // Extract color from vehicle name if present
                          // Format: "Vehicle Name (Color)"
                          const colorMatch = bike.name.match(/\(([^)]+)\)$/);
                          if (colorMatch) {
                            const color = colorMatch[1];
                            handleRiderInfoChange('vehicleColor', color);
                          } else {
                            // If no color in name, clear the color field
                            handleRiderInfoChange('vehicleColor', '');
                          }
                        } else {
                          handleRiderInfoChange('vehicleType', '');
                          handleRiderInfoChange('vehicleColor', '');
                        }
                      }}
                      className={inputClasses(false)}
                    >
                      <option value="">Select a vehicle</option>
                      {bikes.map(bike => (
                        <option key={bike.id} value={bike.name}>{bike.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="vehicleType" className="block text-sm font-medium text-gray-700">Type</label>
                    <select
                      id="vehicleType"
                      value={riderInfo.vehicleType || ''}
                      onChange={e => handleRiderInfoChange('vehicleType', e.target.value)}
                      className={inputClasses(false)}
                      disabled={isVehicleSelected}
                    >
                      <option value="">Select type</option>
                      <option value="Electric">Electric</option>
                      <option value="Gear">Gear</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="vehicleCategory" className="block text-sm font-medium text-gray-700">Category</label>
                    <input
                      type="text"
                      id="vehicleCategory"
                      value={riderInfo.vehicleCategory || ''}
                      onChange={e => handleRiderInfoChange('vehicleCategory', e.target.value)}
                      className={inputClasses(false)}
                      placeholder="e.g., Standard, Premium"
                    />
                  </div>
                  <div>
                    <label htmlFor="vehicleColor" className="block text-sm font-medium text-gray-700">Color</label>
                    <input
                      type="text"
                      id="vehicleColor"
                      value={riderInfo.vehicleColor || ''}
                      onChange={e => handleRiderInfoChange('vehicleColor', e.target.value)}
                      className={inputClasses(false)}
                      disabled={riderInfo.vehicleType === 'Electric'}
                      placeholder={riderInfo.vehicleType === 'Electric' ? 'Auto-filled from vehicle' : 'Enter color'}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="vehicleIdNumber" className="block text-sm font-medium text-gray-700">Vehicle ID Number *</label>
                  <input
                    type="text"
                    id="vehicleIdNumber"
                    value={riderInfo.vehicleIdNumber || ''}
                    onChange={e => handleRiderInfoChange('vehicleIdNumber', e.target.value)}
                    className={inputClasses(!!errors.vehicleIdNumber)}
                    placeholder="e.g., P5L2162560 / RR0 (WITH CHARGER RR-0)"
                  />
                  {errors.vehicleIdNumber && <p className="text-red-500 text-xs mt-1">{errors.vehicleIdNumber}</p>}
                  <p className="text-xs text-gray-500 mt-1">Vehicle registration or ID number</p>
                </div>
              </div>

              {/* Driving License Upload */}
              <div className="mb-6">
                <label htmlFor="document" className="block text-sm font-medium text-gray-700">Upload Driving Licence (PDF/JPG) *</label>
                <div className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 ${errors.document ? 'border-red-500' : 'border-gray-300'} border-dashed rounded-md`}>
                  <div className="space-y-1 text-center">
                    <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="flex text-sm text-gray-600">
                      <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-primary hover:text-secondary focus-within:outline-none">
                        <span>{drivingLicenceFile ? drivingLicenceFile.name : 'Upload a file'}</span>
                        <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={e => setDrivingLicenceFile(e.target.files ? e.target.files[0] : null)} />
                      </label>
                      <p className="pl-1">{!drivingLicenceFile && 'or drag and drop'}</p>
                    </div>
                    <p className="text-xs text-gray-500">PNG, JPG, PDF up to 10MB</p>
                  </div>
                </div>
                {errors.document && <p className="text-red-500 text-xs mt-1">{errors.document}</p>}
              </div>
              {/* Document Submission Acknowledgment */}
              <div className="flex items-start mb-6">
                <div className="flex items-center h-5">
                  <input id="documents" name="documents" type="checkbox" checked={documentsAcknowledged} onChange={e => setDocumentsAcknowledged(e.target.checked)} className={`focus:ring-primary h-4 w-4 text-primary border-gray-300 rounded ${errors.documents ? 'border-red-500' : ''}`} />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="documents" className="font-medium text-gray-700">
                    I acknowledge that I must submit <strong>original PAN and Aadhaar cards</strong> before vehicle pickup
                  </label>
                  {errors.documents && <p className="text-red-500 text-xs">{errors.documents}</p>}
                </div>
              </div>

              <div className="flex items-start mb-6">
                <div className="flex items-center h-5">
                  <input id="terms" name="terms" type="checkbox" checked={termsAccepted} onChange={e => setTermsAccepted(e.target.checked)} className={`focus:ring-primary h-4 w-4 text-primary border-gray-300 rounded ${errors.terms ? 'border-red-500' : ''}`} />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="terms" className="font-medium text-gray-700">I agree to the <a href="#" onClick={(e) => { e.preventDefault(); setIsTermsModalOpen(true); }} className="text-primary hover:underline cursor-pointer">Terms and Conditions</a></label>
                  {errors.terms && <p className="text-red-500 text-xs">{errors.terms}</p>}
                </div>
              </div>

              <div className="mt-8 flex justify-between items-center">
                <button onClick={() => setStep(0)} className="text-primary font-semibold hover:underline">&larr; Back to Summary</button>
                <button onClick={validateStep2} className="bg-secondary text-white font-bold py-3 px-8 rounded-xl hover:bg-opacity-90 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 shadow-md hover:shadow-lg flex items-center gap-2">
                  Proceed to Payment <ArrowRightIcon className="w-5 h-5" />
                </button>
              </div>
            </div >
          )}

          {
            step === 2 && (
              <div className="bg-white p-8 rounded-xl shadow-md">
                <h2 className="text-xl font-heading font-extrabold uppercase tracking-widest mb-2 text-center">Step 3: Complete Payment</h2>
                <p className="text-gray-600 mb-6 text-center text-sm">Choose your preferred payment method</p>

                <div className="max-w-xl mx-auto space-y-3">
                  {/* Pay Online Card */}
                  <button
                    type="button"
                    onClick={handleOnlinePayment}
                    disabled={isProcessing}
                    className="group w-full bg-secondary text-white p-4 rounded-xl hover:shadow-xl transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
                  >

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="bg-white/20 p-2 rounded-lg">
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                          </svg>
                        </div>
                        <div className="text-left">
                          <h3 className="font-bold text-base">Pay Online (Razorpay)</h3>
                          <p className="text-white/70 text-xs">Secure payment gateway</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-lg">₹{totalPayable.toFixed(2)}</span>
                      </div>
                    </div>

                  </button>

                  {/* Pay Cash Card */}
                  <button
                    type="button"
                    onClick={handleCashBooking}
                    disabled={isProcessing}
                    className="group w-full bg-white border-2 border-secondary text-secondary p-4 rounded-xl hover:shadow-xl hover:bg-gray-50 transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
                  >

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="bg-secondary/10 p-2 rounded-lg">
                          <svg className="w-5 h-5 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                        </div>
                        <div className="text-left">
                          <h3 className="font-bold text-base">Pay Cash </h3>
                          <p className="text-secondary/70 text-xs">Pay at pickup</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-lg text-gray-900">₹{totalPayable.toFixed(2)}</span>
                      </div>
                    </div>

                  </button>
                </div>

                <div className="mt-6 text-center">
                  <button onClick={() => setStep(1)} className="text-primary font-semibold hover:underline flex items-center justify-center gap-1 mx-auto">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to Details
                  </button>
                </div>
              </div>
            )
          }
        </div >
      </div >

      {/* Terms and Conditions Modal */}
      {
        isTermsModalOpen && (
          <div className="fixed inset-0 bg-black/60 z-[80] flex items-center justify-center p-4" onClick={() => setIsTermsModalOpen(false)}>
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
              {/* Modal Header */}
              <div className="p-6 border-b flex justify-between items-center">
                <h2 className="text-2xl font-heading font-extrabold uppercase tracking-widest text-primary">Terms & Conditions</h2>
                <button onClick={() => setIsTermsModalOpen(false)} className="text-gray-500 hover:text-gray-700" aria-label="Close terms modal">
                  <XIcon className="w-6 h-6" />
                </button>
              </div>

              {/* Modal Content - Scrollable */}
              <div className="flex-1 overflow-y-auto p-6 text-sm text-gray-700 leading-relaxed">
                <p className="text-sm text-gray-600 mb-6">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>

                <section className="mb-6">
                  <h3 className="text-lg font-bold text-primary mb-3">1. Defined Terms:</h3>
                  <p className="mb-2"><strong>1.1. "SEBCHRIS MOBILITY PVT LTD"</strong> (hereinafter referred as the Company). The registered address of the Company is 13 & 14, Horamavu Agara Village, Kalyan Nagar, Babusapalya, Bengaluru -560043.</p>
                  <p className="mb-2"><strong>1.2. "User"</strong> shall mean an individual or entity that has accepted the terms and conditions for leasing or renting a Vehicle from the Company.</p>
                  <p className="mb-2"><strong>1.3. "Agreement"</strong> means the Service Agreement between the Company and the User.</p>
                  <p className="mb-2"><strong>1.4. "Vehicle"</strong> shall mean any motorcycle, motorbike, or scooter provided by the Company to a User for leasing or renting.</p>
                  <p className="mb-2"><strong>1.5. "Conditions"</strong> means the General Conditions of Use governing the hiring, leasing, or renting of Vehicles.</p>
                </section>

                <section className="mb-6">
                  <h3 className="text-lg font-bold text-primary mb-3">2. Eligibility & Documentation:</h3>
                  <p className="mb-2"><strong>2.1. Age:</strong> The User must be 18 years old or older to hire a Vehicle.</p>
                  <p className="mb-2"><strong>2.2. Valid Driving Licence:</strong> The User must possess a valid driving licence issued by the relevant authorities in India.</p>
                  <p className="mb-2"><strong>2.3. Submission of Original Documents:</strong> The User shall submit original documents, including but not limited to, a driving licence, identity proof, and address proof.</p>
                </section>

                <section className="mb-6">
                  <h3 className="text-lg font-bold text-primary mb-3">3. Vehicle Use and Maintenance:</h3>
                  <p className="mb-2"><strong>3.1. Authorised Vehicle Use:</strong> The User is authorized to use only the Vehicle booked in their name.</p>
                  <p className="mb-2"><strong>3.2. Vehicle Condition Check:</strong> The User confirms having thoroughly inspected the vehicle before rental.</p>
                  <p className="mb-2"><strong>3.3. Safety and Responsibility:</strong> The Company shall not be responsible for the safety of the User. The User is required to wear a helmet and other safety gear as mandated by law.</p>
                  <p className="mb-2"><strong>3.4. Maintenance:</strong> The User agrees to maintain the scooter in good condition and return it in the same condition, subject to reasonable wear and tear.</p>
                </section>

                <section className="mb-6">
                  <h3 className="text-lg font-bold text-primary mb-3">4. Rental Period, Fees, and Charges:</h3>
                  <p className="mb-2"><strong>4.1. Rental Fees:</strong> The User agrees to pay the rental fees as specified by the company.</p>
                  <p className="mb-2"><strong>4.2. Late Return:</strong> Failure to return the Scooter by the scheduled return time will result in additional fees.</p>
                  <p className="mb-2"><strong>4.3. Security Deposit:</strong> A Security Deposit is required at the time of Vehicle rental. 50% will be refunded if conditions are met.</p>
                  <p className="mb-2"><strong>4.4. Non-Refundable Payments:</strong> All payments made by the User, except for the Security Deposit, are non-refundable.</p>
                </section>

                <section className="mb-6">
                  <h3 className="text-lg font-bold text-primary mb-3">5. Prohibited Uses:</h3>
                  <p className="mb-2">The User shall NOT:</p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Use the scooter for racing or reckless driving</li>
                    <li>Drive the scooter off-road</li>
                    <li>Operate the scooter under the influence of alcohol, drugs, or medicine</li>
                    <li>Engage in any criminal or illegal activities</li>
                    <li>Use a mobile phone while operating the scooter</li>
                  </ul>
                </section>

                <section className="mb-6">
                  <h3 className="text-lg font-bold text-primary mb-3">6. Liability:</h3>
                  <p className="mb-2"><strong>6.1. User Responsibility:</strong> The Company is not liable for any injuries, damages, losses, or death arising from the User's use of the Vehicle.</p>
                  <p className="mb-2"><strong>6.2. Reporting Incidents:</strong> In the event of theft, accident, or other incidents, the User must immediately report to the Company and the nearest police station.</p>
                </section>

                <section className="mb-6">
                  <h3 className="text-lg font-bold text-primary mb-3">7. Termination:</h3>
                  <p>The Company reserves the right to terminate this Agreement immediately if the User breaches any terms or conditions outlined herein.</p>
                </section>

                <section className="mb-6">
                  <h3 className="text-lg font-bold text-primary mb-3">8. Miscellaneous:</h3>
                  <p className="mb-2">This Agreement shall be governed by and construed in accordance with the laws of India. Any disputes arising out of this Agreement shall be subject to the exclusive jurisdiction of the courts of Bangalore.</p>
                  <p>By renting a vehicle from the Company, the User acknowledges that they have read, understood, and agreed to be bound by these Terms and Conditions.</p>
                </section>
              </div>

              {/* Modal Footer */}
              <div className="p-4 border-t bg-gray-50 rounded-b-xl">
                <button onClick={() => setIsTermsModalOpen(false)} className="w-full bg-primary text-white font-bold py-3 rounded-lg hover:bg-opacity-90 transition">
                  Close
                </button>
              </div>
            </div>
          </div>
        )
      }
    </>
  );
};

export default BookingPage;