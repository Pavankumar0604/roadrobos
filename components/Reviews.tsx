import React from 'react';
import { StarIcon, CheckCircleIcon } from './icons/Icons';
import Card from './Card';
import { type Review } from '../types';

// Import logos
import ampupLogo from '../src/assets/logos/ampuplogo.png';
import mindmeshLogo from '../src/assets/logos/mindmeshlogo.png';
import zelioLogo from '../src/assets/logos/zeliologo.png';
import flowattLogo from '../src/assets/logos/flowattlogo.webp';
import razorpayLogo from '../src/assets/logos/razorpaylogo.png';

interface ReviewsProps {
  reviews: Review[];
}

const Reviews: React.FC<ReviewsProps> = ({ reviews }) => {
  const approvedReviews = reviews.filter(r => r.status === 'Approved');

  // Calculate average rating
  const averageRating = approvedReviews.length > 0
    ? (approvedReviews.reduce((sum, r) => sum + r.rating, 0) / approvedReviews.length).toFixed(1)
    : '5.0'; // Default to 5.0 if no reviews yet (or 0.0, but positive starts are better)

  // Fallback to static reviews if no approved reviews are available from the state
  const displayReviews = approvedReviews.length > 0 ? approvedReviews.slice(0, 3) : [
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
            {averageRating} <StarIcon className="h-6 w-6 text-yellow-400 ml-1" /> average rating
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
                <div className="flex flex-col items-center gap-y-8">
                  {/* Row 1: AmpUp Logo */}
                  <div className="w-full flex justify-center">
                    <img src={ampupLogo} alt="AmpUp Logo" className="h-20 hover:scale-110 transition-all duration-300 drop-shadow-md hover:drop-shadow-xl" />
                  </div>

                  {/* Row 2: Other Partners */}
                  <div className="flex flex-wrap justify-center items-center gap-x-10 gap-y-8">
                    <img src={mindmeshLogo} alt="Mindmesh Logo" className="h-12 hover:scale-110 transition-transform duration-200" />
                    <img src={zelioLogo} alt="Zeelio Logo" className="h-9 hover:scale-110 transition-transform duration-200" />
                    <img src={flowattLogo} alt="Flowatt Logo" className="h-10 hover:scale-110 transition-transform duration-200 invert hue-rotate-180" />
                    <img src={razorpayLogo} alt="Razorpay Logo" className="h-9 hover:scale-110 transition-transform duration-200" />
                    <img src="https://1000logos.net/wp-content/uploads/2021/05/Swiggy-logo-768x432.jpg" alt="Swiggy Logo" className="h-10 hover:scale-110 transition-transform duration-200" />
                    <img src="https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg" alt="Stripe Logo" className="h-9 hover:scale-110 transition-transform duration-200" />
                    <img src="https://logos-world.net/wp-content/uploads/2020/11/Zomato-Logo-700x394.png" alt="Zomato Logo" className="h-8 hover:scale-110 transition-transform duration-200" />
                    <img src="https://upload.wikimedia.org/wikipedia/commons/e/eb/Porter-logo.png?20190930101009" alt="Porter Logo" className="h-8 hover:scale-110 transition-transform duration-200" />
                  </div>
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
                    <div className="text-gray-700">
                      <div className="flex items-center gap-2 flex-wrap">
                        <strong>Comprehensive Insurance:</strong>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
                          Registered Vehicles Only
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-gray-600">
                        Optional insurance coverage for registered fuel vehicles (not available for electric bikes). Enjoy a worry-free ride with complete protection.
                      </p>
                    </div>
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