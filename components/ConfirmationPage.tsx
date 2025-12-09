import React, { useState } from 'react';
import { type BookingDetails, type Review } from '../types';
import { CheckCircleIcon, StarIcon, DocumentDownloadIcon } from './icons/Icons';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface ConfirmationPageProps {
    bookingDetails: BookingDetails;
    onBookAnother: () => void;
    onReviewSubmit: (review: Omit<Review, 'id' | 'status'>) => void;
}

const ConfirmationPage: React.FC<ConfirmationPageProps> = ({ bookingDetails, onBookAnother, onReviewSubmit }) => {
    const { bookingId, bike, searchParams, user, totalFare, transactionId } = bookingDetails;

    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [reviewText, setReviewText] = useState('');
    const [reviewSubmitted, setReviewSubmitted] = useState(false);

    const handleReviewSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (rating > 0 && reviewText.trim() !== '') {
            onReviewSubmit({
                name: bookingDetails.user.userName,
                rating,
                text: reviewText,
                userId: 'simulated-user-id-' + bookingDetails.user.userName.split(' ')[0],
            });
            setReviewSubmitted(true);
        }
    };

    const formatDate = (dateStr: string, timeStr: string) => {
        if (!dateStr || !timeStr) return 'N/A';
        const date = new Date(`${dateStr}T${timeStr}`);
        return date.toLocaleString('en-US', { month: 'long', day: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true });
    };

    const handleStoreClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        alert('Coming Soon! Our app is currently under development.');
    };

    const handleDownloadReceipt = () => {
        const doc = new jsPDF();

        doc.setFontSize(22);
        doc.setFont('helvetica', 'bold');
        doc.text("RoAd RoBo's", 14, 22);

        doc.setFontSize(16);
        doc.setFont('helvetica', 'normal');
        doc.text('Payment Receipt', 14, 32);

        doc.setFontSize(10);
        doc.text(`Date: ${new Date().toLocaleDateString()}`, 196, 22, { align: 'right' });
        doc.text(`Receipt for Booking #${bookingId}`, 196, 32, { align: 'right' });

        autoTable(doc, {
            startY: 45,
            head: [['Description', 'Details']],
            body: [
                ['Booking ID', bookingId],
                ['Transaction ID', transactionId || 'N/A'],
                ['Rider Name', user.userName],
                ['Bike Model', bike.name],
                ['Pickup', formatDate(searchParams.pickupDate, searchParams.pickupTime)],
                ['Drop-off', formatDate(searchParams.dropDate, searchParams.dropTime)],
            ],
            theme: 'striped',
            headStyles: { fillColor: [8, 76, 62] },
        });

        const finalY = (doc as any).lastAutoTable.finalY;

        autoTable(doc, {
            startY: finalY + 10,
            head: [['Fare Breakdown', 'Amount']],
            body: [
                ['Total Payable', `INR ${totalFare.toFixed(2)}`],
                ['Payment Method', bookingDetails.paymentMode === 'CASH' ? 'Cash at Pickup' : 'Online Payment'],
                ['Payment Status', bookingDetails.paymentStatus.charAt(0).toUpperCase() + bookingDetails.paymentStatus.slice(1).toLowerCase()],
            ],
            theme: 'grid',
            headStyles: { fillColor: [8, 76, 62] },
        });

        doc.setFontSize(10);
        doc.text('Thank you for riding with RoAd RoBo\'s!', 14, (doc as any).lastAutoTable.finalY + 20);

        doc.save(`receipt-${bookingId}.pdf`);
    };

    const handleShare = async () => {
        const shareData = {
            title: 'Booking Confirmed! 🏍️',
            text: `Booking Confirmed! 🏍️\nBooking ID: ${bookingId}\nBike: ${bike.name}\nPickup: ${formatDate(searchParams.pickupDate, searchParams.pickupTime)}\nDrop-off: ${formatDate(searchParams.dropDate, searchParams.dropTime)}\nAmount Paid: ₹${totalFare.toFixed(2)}\n\nRide with RoAd RoBo's!`,
            url: window.location.origin
        };

        try {
            if (navigator.share) {
                await navigator.share(shareData);
            } else {
                await navigator.clipboard.writeText(shareData.text);
                alert('Booking details copied to clipboard!');
            }
        } catch (err) {
            console.error('Error sharing:', err);
        }
    };

    return (
        <div className="bg-accent min-h-screen py-16">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
                <div className="bg-white p-8 md:p-12 rounded-xl shadow-lg text-center">
                    <CheckCircleIcon className="w-16 h-16 text-secondary mx-auto" />
                    <h1 className="text-2xl md:text-3xl font-heading font-extrabold uppercase tracking-widest text-primary mt-4">Booking Confirmed!</h1>
                    <p className="text-gray-600 mt-2">Your ride is all set. Thank you for choosing RoAd RoBo’s.</p>

                    <div className="mt-8 text-center border-2 border-dashed border-gray-300 p-4 rounded-lg">
                        <p className="text-sm uppercase tracking-wider text-gray-500">Your Booking ID</p>
                        <p className="text-2xl font-mono font-bold tracking-widest text-primary">{bookingId}</p>
                    </div>

                    <div className="mt-8 text-left border-t pt-6">
                        <h2 className="text-lg font-heading font-extrabold uppercase tracking-widest mb-4">Your Trip Summary</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div>
                                <img src={bike.images[0]} alt={bike.name} className="rounded-lg mb-2 shadow-sm" />
                                <h3 className="font-semibold">{bike.name}</h3>
                                <p className="text-sm text-gray-500">{bike.type} | {bike.specs.cc}</p>
                            </div>
                            <div className="space-y-3">
                                {searchParams.pickupLocation && (
                                    <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                                        <span className="text-sm text-gray-500 font-medium flex items-center gap-1">
                                            <svg className="w-4 h-4 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                            Location
                                        </span>
                                        <span className="text-sm font-semibold text-gray-900">{searchParams.pickupLocation}</span>
                                    </div>
                                )}
                                <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                                    <span className="text-sm text-gray-500 font-medium">Pickup</span>
                                    <span className="text-sm font-semibold text-gray-900">{formatDate(searchParams.pickupDate, searchParams.pickupTime)}</span>
                                </div>
                                <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                                    <span className="text-sm text-gray-500 font-medium">Drop-off</span>
                                    <span className="text-sm font-semibold text-gray-900">{formatDate(searchParams.dropDate, searchParams.dropTime)}</span>
                                </div>
                                <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                                    <span className="text-sm text-gray-500 font-medium">Rider</span>
                                    <span className="text-sm font-semibold text-gray-900">{user.userName}</span>
                                </div>
                                <div>
                                    <h4 className="text-lg font-bold mt-4 mb-2">Payment Details</h4>
                                    <div className="space-y-2">
                                        {bookingDetails.paymentMode === 'CASH' ? (
                                            <>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-sm text-gray-500 font-medium">Payment Method</span>
                                                    <span className="font-semibold text-amber-600 flex items-center gap-1">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                                                        </svg>
                                                        Cash at Pickup
                                                    </span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-sm text-gray-500 font-medium">Amount Payable</span>
                                                    <span className="font-bold text-primary text-lg">₹{bookingDetails.totalPayable?.toFixed(2) || totalFare.toFixed(2)}</span>
                                                </div>
                                                <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                                                    <p className="text-xs text-amber-800 font-medium flex items-start gap-2">
                                                        <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                                        </svg>
                                                        <span>Please bring exact cash amount at the time of vehicle pickup. No platform fee applied!</span>
                                                    </p>
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-sm text-gray-500 font-medium">Status</span>
                                                    <span className="font-semibold text-green-600 flex items-center gap-1">
                                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                        </svg>
                                                        Payment Successful
                                                    </span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-sm text-gray-500 font-medium">Total Paid</span>
                                                    <span className="font-bold text-primary">₹{bookingDetails.totalPayable?.toFixed(2) || totalFare.toFixed(2)}</span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-sm text-gray-500 font-medium">Transaction ID</span>
                                                    <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded text-gray-700">{transactionId}</span>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
                        <button onClick={handleDownloadReceipt} className="border border-primary text-primary font-semibold py-2 px-6 rounded-lg hover:bg-primary/5 transition flex items-center justify-center gap-2">
                            <DocumentDownloadIcon className="w-5 h-5" /> Download Receipt
                        </button>
                        <button onClick={handleShare} className="border border-primary text-primary font-semibold py-2 px-6 rounded-lg hover:bg-primary/5 transition">
                            Share Details
                        </button>
                    </div>

                </div>

                <div className="text-center mt-10">
                    <h3 className="text-lg font-heading font-extrabold uppercase tracking-widest mb-2">Manage your booking with our app!</h3>
                    <p className="text-gray-600 mb-4">Get trip reminders, easy extensions, and exclusive offers.</p>
                    <div className="flex items-center justify-center gap-4">
                        <a href="#" aria-label="Get it on Google Play" onClick={handleStoreClick}>
                            <img src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg" alt="Google Play Store badge" className="h-12" />
                        </a>
                        <a href="#" aria-label="Download on the App Store" onClick={handleStoreClick}>
                            <img src="https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg" alt="Apple App Store badge" className="h-12" />
                        </a>
                    </div>
                </div>

                <div className="text-center mt-10">
                    <button onClick={onBookAnother} className="bg-green-800 text-white font-bold py-3 px-8 rounded-lg hover:bg-green-900 transition-all">
                        Book Another Ride
                    </button>
                </div>

                <div className="mt-10">
                    <div className="bg-white p-8 rounded-xl shadow-lg">
                        {!reviewSubmitted ? (
                            <form onSubmit={handleReviewSubmit}>
                                <h3 className="text-xl font-heading font-extrabold uppercase tracking-widest text-center mb-4">Rate Your Ride</h3>
                                <div className="flex justify-center mb-4">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            type="button"
                                            key={star}
                                            onMouseEnter={() => setHoverRating(star)}
                                            onMouseLeave={() => setHoverRating(0)}
                                            onClick={() => setRating(star)}
                                            aria-label={`Rate ${star} stars`}
                                        >
                                            <StarIcon className={`w-8 h-8 cursor-pointer ${star <= (hoverRating || rating) ? 'text-yellow-400' : 'text-gray-300'}`} />
                                        </button>
                                    ))}
                                </div>
                                <textarea
                                    value={reviewText}
                                    onChange={(e) => setReviewText(e.target.value)}
                                    rows={4}
                                    placeholder="Tell us about your experience..."
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                                    required
                                />
                                <button
                                    type="submit"
                                    disabled={rating === 0 || reviewText.trim() === ''}
                                    className="w-full mt-4 bg-primary text-white font-bold py-3 rounded-lg hover:bg-opacity-90 transition-all disabled:opacity-50"
                                >
                                    Submit Review
                                </button>
                            </form>
                        ) : (
                            <div className="text-center">
                                <CheckCircleIcon className="w-12 h-12 text-secondary mx-auto" />
                                <h3 className="text-lg font-semibold mt-2">Thank you for your feedback!</h3>
                                <p className="text-gray-600">Your review has been submitted for approval.</p>
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default ConfirmationPage;