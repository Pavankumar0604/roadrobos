import React, { useState } from 'react';
import { type Bike, type SearchParams, type BookingDetails, type Offer } from '../types';
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
        { name: 'Summary', icon: <CheckCircleIcon/> },
        { name: 'Details', icon: <UserCircleIcon/> },
        { name: 'Payment', icon: <CreditCardIcon/> },
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
  const [userDetails, setUserDetails] = useState({ name: '', email: '', phone: '' });
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
    if (!userDetails.name) newErrors.name = 'Full name is required.';
    if (!userDetails.email || !/\S+@\S+\.\S+/.test(userDetails.email)) newErrors.email = 'A valid email is required.';
    if (!userDetails.phone || !/^\d{10}$/.test(userDetails.phone)) newErrors.phone = 'A 10-digit phone number is required.';
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
    onConfirmBooking({ ...bookingDetails, totalFare: finalFare, user: userDetails }, appliedCoupon?.code);
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
                      Proceed to Details <ArrowRightIcon className="w-5 h-5"/>
                  </button>
              </div>
            </div>
          )}
          
          {step === 1 && (
            <div className="bg-white p-8 rounded-xl shadow-md">
              <h2 className="text-xl font-heading font-extrabold uppercase tracking-widest mb-6">Step 2: Rider Information</h2>
              <div className="space-y-4">
                  <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name</label>
                      <input type="text" id="name" value={userDetails.name} onChange={e => setUserDetails({...userDetails, name: e.target.value})} className={inputClasses(!!errors.name)} />
                      {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                  </div>
                  <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
                      <input type="email" id="email" value={userDetails.email} onChange={e => setUserDetails({...userDetails, email: e.target.value})} className={inputClasses(!!errors.email)} />
                      {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                  </div>
                  <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone Number</label>
                      <input type="tel" id="phone" value={userDetails.phone} onChange={e => setUserDetails({...userDetails, phone: e.target.value})} className={inputClasses(!!errors.phone)} />
                      {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                  </div>
                  <div>
                      <label htmlFor="document" className="block text-sm font-medium text-gray-700">Upload Driving Licence (PDF/JPG)</label>
                      <div className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 ${errors.document ? 'border-red-500' : 'border-gray-300'} border-dashed rounded-md`}>
                          <div className="space-y-1 text-center">
                              <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400"/>
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
                  <div className="flex items-start">
                      <div className="flex items-center h-5">
                          <input id="terms" name="terms" type="checkbox" checked={termsAccepted} onChange={e => setTermsAccepted(e.target.checked)} className={`focus:ring-primary h-4 w-4 text-primary border-gray-300 rounded ${errors.terms ? 'border-red-500' : ''}`} />
                      </div>
                      <div className="ml-3 text-sm">
                          <label htmlFor="terms" className="font-medium text-gray-700">I agree to the <a href="#" className="text-primary hover:underline">Terms and Conditions</a></label>
                          {errors.terms && <p className="text-red-500 text-xs">{errors.terms}</p>}
                      </div>
                  </div>
              </div>
              <div className="mt-8 flex justify-between items-center">
                  <button onClick={() => setStep(0)} className="text-primary font-semibold hover:underline">&larr; Back to Summary</button>
                  <button onClick={validateStep2} className="bg-secondary text-white font-bold py-3 px-6 rounded-lg hover:bg-opacity-90 flex items-center gap-2">
                      Proceed to Payment <ArrowRightIcon className="w-5 h-5"/>
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