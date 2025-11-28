import React, { useState, useEffect } from 'react';
import { type Bike, type SearchParams, type BookingDetails, type Offer, type RiderInformation, COMPANY_INFO } from '../types';
import { bikes } from '../constants';
import { ArrowRightIcon, CheckCircleIcon, CreditCardIcon, DocumentTextIcon, UserCircleIcon, XIcon } from './icons/Icons';
import PaymentModal from './PaymentModal';

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
              <span className={`absolute top-10 w-max left-1/2 -translate-x-1/2 text-center text-xs sm:text-sm font-medium ${index <= step ? 'text-primary' : 'text-gray-500'}`}>{s.name}</span>
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
    idProof: 'Aadhaar Card',
    idNumber: '',
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

  const [document, setDocument] = useState<File | null>(null);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  // Coupon state
  const [couponCode, setCouponCode] = useState('');
  const [couponError, setCouponError] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<Offer | null>(null);
  const [finalFare, setFinalFare] = useState(totalFare);
  const [discount, setDiscount] = useState(0);

  // Generate application number when entering Step 2 (local generation instead of API call)
  useEffect(() => {
    if (step === 1 && !applicationNumber && !loadingAppNumber) {
      setLoadingAppNumber(true);
      // Generate application number locally: RRB-[timestamp]-[random4digits]
      const timestamp = Date.now();
      const random4Digits = Math.floor(1000 + Math.random() * 9000);
      const generatedAppNumber = `RRB-${timestamp}-${random4Digits}`;

      setApplicationNumber(generatedAppNumber);
      setRiderInfo(prev => ({ ...prev, applicationNumber: generatedAppNumber }));
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
    if (coupon.discountPercent) {
      discountAmount = (totalFare * coupon.discountPercent) / 100;
    } else if (coupon.flatAmount) {
      discountAmount = coupon.flatAmount;
    }

    setAppliedCoupon(coupon);
    setDiscount(discountAmount);
    setFinalFare(totalFare - discountAmount);
    setCouponCode('');
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setDiscount(0);
    setFinalFare(totalFare);
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
    if (!riderInfo.idProof) newErrors.idProof = 'ID proof type is required.';
    if (!riderInfo.idNumber) newErrors.idNumber = 'ID number is required.';
    if (!riderInfo.vehicleIdNumber) newErrors.vehicleIdNumber = 'Vehicle ID number is required.';
    if (!document) newErrors.document = 'Please upload your driving licence.';
    if (!termsAccepted) newErrors.terms = 'You must accept the terms and conditions.';

    setErrors(newErrors);
    if (Object.keys(newErrors).length === 0) {
      setStep(2);
    }
  };

  const handlePayment = () => {
    setIsPaymentModalOpen(true);
  };

  const handlePaymentSuccess = () => {
    setIsPaymentModalOpen(false);
    onConfirmBooking({ ...bookingDetails, totalFare: finalFare, user: riderInfo as RiderInformation }, appliedCoupon?.code);
  };

  const formatDate = (dateStr: string, timeStr: string) => {
    if (!dateStr || !timeStr) return 'N/A';
    const date = new Date(`${dateStr}T${timeStr}`);
    return date.toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true });
  };

  const inputClasses = (hasError: boolean) =>
    `mt-1 block w-full p-3 bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-input-focus ${hasError ? 'border-error' : 'border-input'}`;


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
                        <button onClick={handleApplyCoupon} className="bg-primary text-white font-semibold px-4 py-2 rounded-lg hover:bg-opacity-90">Apply</button>
                      </div>
                    )}
                    {couponError && <p className="text-error text-sm mt-1">{couponError}</p>}
                  </div>

                  <div className="border-t pt-4">
                    <h4 className="font-semibold text-lg mb-2">Fare Breakdown</h4>
                    <div className="space-y-1 text-gray-700">
                      <div className="flex justify-between"><span>Base Fare</span><span>₹{(totalFare - (addons.helmet ? 50 : 0) - (addons.insurance ? 100 : 0)).toFixed(2)}</span></div>
                      {addons.helmet && <div className="flex justify-between"><span>Extra Helmet</span><span>₹50.00</span></div>}
                      {addons.insurance && <div className="flex justify-between"><span>Insurance</span><span>₹100.00</span></div>}
                      {discount > 0 && <div className="flex justify-between text-green-600"><span>Discount</span><span>- ₹{discount.toFixed(2)}</span></div>}

                      <div className="flex justify-between font-bold text-lg border-t pt-2 mt-2"><span>Total Payable</span><span>₹{finalFare.toFixed(2)}</span></div>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">A refundable deposit of ₹{bike.deposit} will be collected at pickup.</p>
                  </div>
                </div>
              </div>
              <div className="mt-8 flex justify-between items-center">
                <button onClick={onBack} className="text-primary font-semibold hover:underline"> &larr; Back to Details</button>
                <button onClick={validateStep1} className="bg-secondary text-white font-bold py-3 px-6 rounded-lg hover:bg-opacity-90 flex items-center gap-2">
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
                    <label htmlFor="userName" className="block text-sm font-medium text-gray-700">User's Name *</label>
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="idProof" className="block text-sm font-medium text-gray-700">ID Proof *</label>
                    <select
                      id="idProof"
                      value={riderInfo.idProof || 'Aadhaar Card'}
                      onChange={e => handleRiderInfoChange('idProof', e.target.value as 'Aadhaar Card' | 'PAN Card')}
                      className={inputClasses(!!errors.idProof)}
                    >
                      <option value="Aadhaar Card">Aadhaar Card</option>
                      <option value="PAN Card">PAN Card</option>
                    </select>
                    {errors.idProof && <p className="text-red-500 text-xs mt-1">{errors.idProof}</p>}
                  </div>
                  <div>
                    <label htmlFor="idNumber" className="block text-sm font-medium text-gray-700">ID Number *</label>
                    <input
                      type="text"
                      id="idNumber"
                      value={riderInfo.idNumber || ''}
                      onChange={e => handleRiderInfoChange('idNumber', e.target.value)}
                      className={inputClasses(!!errors.idNumber)}
                    />
                    {errors.idNumber && <p className="text-red-500 text-xs mt-1">{errors.idNumber}</p>}
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
              </div>

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
                      onChange={e => handleRiderInfoChange('vehicleName', e.target.value)}
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
                    >
                      <option value="">Select type</option>
                      <option value="Electric">Electric</option>
                      <option value="Fuel">Fuel</option>
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
                        <span>{document ? document.name : 'Upload a file'}</span>
                        <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={e => setDocument(e.target.files ? e.target.files[0] : null)} />
                      </label>
                      <p className="pl-1">{!document && 'or drag and drop'}</p>
                    </div>
                    <p className="text-xs text-gray-500">PNG, JPG, PDF up to 10MB</p>
                  </div>
                </div>
                {errors.document && <p className="text-red-500 text-xs mt-1">{errors.document}</p>}
              </div>

              {/* Terms & Conditions */}
              <div className="flex items-start mb-6">
                <div className="flex items-center h-5">
                  <input id="terms" name="terms" type="checkbox" checked={termsAccepted} onChange={e => setTermsAccepted(e.target.checked)} className={`focus:ring-primary h-4 w-4 text-primary border-gray-300 rounded ${errors.terms ? 'border-red-500' : ''}`} />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="terms" className="font-medium text-gray-700">I agree to the <a href="#" className="text-primary hover:underline">Terms and Conditions</a></label>
                  {errors.terms && <p className="text-red-500 text-xs">{errors.terms}</p>}
                </div>
              </div>

              {/* Navigation */}
              <div className="mt-8 flex justify-between items-center">
                <button onClick={() => setStep(0)} className="text-primary font-semibold hover:underline">&larr; Back to Summary</button>
                <button onClick={validateStep2} className="bg-secondary text-white font-bold py-3 px-6 rounded-lg hover:bg-opacity-90 flex items-center gap-2">
                  Proceed to Payment <ArrowRightIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="bg-white p-8 rounded-xl shadow-md text-center">
              <h2 className="text-xl font-heading font-extrabold uppercase tracking-widest mb-4">Step 3: Complete Payment</h2>
              <p className="text-gray-600 mb-6">Click the button below to open the secure payment gateway.</p>
              <div className="mt-8 flex justify-between items-center max-w-md mx-auto">
                <button onClick={() => setStep(1)} className="text-primary font-semibold hover:underline">&larr; Back to Details</button>
                <button onClick={handlePayment} className="bg-secondary text-white font-bold py-3 px-8 rounded-lg hover:bg-opacity-90">
                  Pay ₹{finalFare.toFixed(2)}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      {isPaymentModalOpen && (
        <PaymentModal
          amount={finalFare}
          onClose={() => setIsPaymentModalOpen(false)}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </>
  );
};

export default BookingPage;