import React from 'react';
import { StarIcon, CheckCircleIcon } from './icons/Icons';
import Card from './Card';
import { type Review } from '../types';

interface ReviewsProps {
    reviews: Review[];
}

const Reviews: React.FC<ReviewsProps> = ({ reviews }) => {
    const approvedReviews = reviews.filter(r => r.status === 'Approved').slice(0, 3);
    
    // Fallback to static reviews if no approved reviews are available from the state
    const displayReviews = approvedReviews.length > 0 ? approvedReviews : [
      { name: 'Aarav Sharma', rating: 5, text: "Seamless experience! The bike was in great condition and the doorstep delivery was a huge plus. Will definitely rent from RoAd RoBo’s again." },
      { name: 'Priya Patel', rating: 4, text: "Good service and affordable pricing. The app is easy to use. The helmet provided could have been cleaner, but overall a positive experience." },
      { name: 'Vikram Singh', rating: 5, text: "Took a Royal Enfield for a weekend trip. The process was smooth, and the support team was very helpful. Highly recommended for bike rentals in Bangalore." }
    ];

    return (
        <section className="py-20 bg-accent">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h2 className="text-2xl md:text-3xl font-heading font-extrabold uppercase tracking-widest text-primary">Trusted by Thousands of Riders</h2>
                    <p className="mt-3 text-lg text-gray-600 flex items-center justify-center">
                        4.6 <StarIcon className="h-6 w-6 text-yellow-400 ml-1" /> average rating
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {displayReviews.map((review, index) => (
                        <Card key={index}>
                           <div className="p-6">
                             <div className="flex items-center mb-4">
                                 <div className="flex">
                                     {[...Array(5)].map((_, i) => (
                                         <StarIcon key={i} className={`h-5 w-5 ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'}`} />
                                     ))}
                                 </div>
                             </div>
                             <p className="text-gray-600 italic">"{review.text}"</p>
                             <p className="font-semibold text-right mt-4">- {review.name}</p>
                           </div>
                        </Card>
                    ))}
                </div>

                 <div className="mt-20 text-center">
                    <h2 className="text-2xl font-heading font-extrabold uppercase tracking-widest text-primary mb-6">Peace of Mind, Guaranteed</h2>
                    <Card className="max-w-4xl mx-auto p-0">
                      <div className="grid grid-cols-1 md:grid-cols-2">
                        {/* Partners Section */}
                        <div className="p-8 border-b md:border-b-0 md:border-r border-card">
                          <h3 className="text-lg font-heading font-extrabold uppercase tracking-widest text-primary mb-4">Our Trusted Partners</h3>
                          <p className="text-gray-600 text-sm mb-6">We collaborate with industry leaders to ensure a secure and reliable experience for you.</p>
                          <div className="flex flex-wrap justify-center items-center gap-x-8 gap-y-6">
                            <img src="https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg" alt="Stripe Logo" className="h-8" loading="lazy" decoding="async" />
                            <img src="https://listingprowp.com/wp-content/uploads/2020/09/RAZORPAY_DetailsPage.png" alt="Razorpay Logo" className="h-8" loading="lazy" decoding="async" />
                            <img src="https://logos-world.net/wp-content/uploads/2020/11/Zomato-Logo-700x394.png" alt="Zomato Logo" className="h-7" loading="lazy" decoding="async" />
                            <img src="https://1000logos.net/wp-content/uploads/2021/05/Swiggy-logo-768x432.jpg" alt="Swiggy Logo" className="h-10" loading="lazy" decoding="async" />
                            <img src="https://mir-s3-cdn-cf.behance.net/project_modules/2800_webp/c79cc971959541.5bd75efd34d39.jpg" alt="Dunzo Logo" className="h-7" loading="lazy" decoding="async" />
                            <img src="https://upload.wikimedia.org/wikipedia/commons/e/eb/Porter-logo.png?20190930101009" alt="Porter Logo" className="h-7" loading="lazy" decoding="async" />
                          </div>
                        </div>

                        {/* Security Section */}
                        <div className="p-8">
                          <h3 className="text-lg font-heading font-extrabold uppercase tracking-widest text-primary mb-4">Your Security is Our Priority</h3>
                          <ul className="space-y-3 text-left">
                            <li className="flex items-start">
                              <CheckCircleIcon className="h-6 w-6 text-secondary flex-shrink-0 mr-3 mt-0.5" />
                              <span className="text-gray-700"><strong>KYC Verified Riders:</strong> All our riders undergo a mandatory document verification process.</span>
                            </li>
                            <li className="flex items-start">
                              <CheckCircleIcon className="h-6 w-6 text-secondary flex-shrink-0 mr-3 mt-0.5" />
                              <span className="text-gray-700"><strong>Secure Online Payments:</strong> Your payments are processed through secure, encrypted gateways.</span>
                            </li>
                             <li className="flex items-start">
                              <CheckCircleIcon className="h-6 w-6 text-secondary flex-shrink-0 mr-3 mt-0.5" />
                              <span className="text-gray-700"><strong>Comprehensive Insurance:</strong> Optional insurance coverage for a worry-free ride.</span>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </Card>
                </div>
            </div>
        </section>
    );
};

export default Reviews;