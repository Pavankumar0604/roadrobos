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
                name: bookingDetails.user.name,
                rating,
                text: reviewText,
                userId: 'simulated-user-id-' + bookingDetails.user.name.split(' ')[0],
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
                ['Rider Name', user.name],
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
                ['Payment Status', 'Paid'],
            ],
            theme: 'grid',
            headStyles: { fillColor: [8, 76, 62] },
        });

        doc.setFontSize(10);
        doc.text('Thank you for riding with RoAd RoBo\'s!', 14, (doc as any).lastAutoTable.finalY + 20);
        
        doc.save(`receipt-${bookingId}.pdf`);
    };

    return (
        <div className="bg-accent min-h-screen py-16">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
                <div className="bg-white p-8 md:p-12 rounded-xl shadow-lg text-center">
                    <CheckCircleIcon className="w-16 h-16 text-secondary mx-auto"/>
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
                                <img src={bike.images[0]} alt={bike.name} className="rounded-lg mb-2 shadow-sm"/>
                                <h3 className="font-semibold">{bike.name}</h3>
                                <p className="text-sm text-gray-500">{bike.type} | {bike.specs.cc}</p>
                            </div>
                            <div className="space-y-3">
                                <p><strong className="block text-sm text-gray-500">Pickup:</strong> {formatDate(searchParams.pickupDate, searchParams.pickupTime)}</p>
                                <p><strong className="block text-sm text-gray-500">Drop-off:</strong> {formatDate(searchParams.dropDate, searchParams.dropTime)}</p>
                                <p><strong className="block text-sm text-gray-500">Rider:</strong> {user.name}</p>
                                <div>
                                    <h4 className="text-lg font-bold mt-4">Payment Details</h4>
                                    <p><strong className="block text-sm text-gray-500">Status:</strong> <span className="font-semibold text-green-600">Payment Successful</span></p>
                                    <p><strong className="block text-sm text-gray-500">Total Paid:</strong> <span className="font-bold text-primary">₹{totalFare.toFixed(2)}</span></p>
                                    <p><strong className="block text-sm text-gray-500">Transaction ID:</strong> <span className="font-mono text-xs">{transactionId}</span></p>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
                        <button onClick={handleDownloadReceipt} className="border border-primary text-primary font-semibold py-2 px-6 rounded-lg hover:bg-primary/5 transition flex items-center justify-center gap-2">
                            <DocumentDownloadIcon className="w-5 h-5"/> Download Receipt
                        </button>
                        <button className="border border-primary text-primary font-semibold py-2 px-6 rounded-lg hover:bg-primary/5 transition">
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
                    <button onClick={onBookAnother} className="bg-secondary text-white font-bold py-3 px-8 rounded-lg hover:bg-opacity-90 transition-all">
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
                                <CheckCircleIcon className="w-12 h-12 text-secondary mx-auto"/>
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