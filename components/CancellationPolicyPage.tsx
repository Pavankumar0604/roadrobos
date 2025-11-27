import React from 'react';
import Card from './Card';

const CancellationPolicyPage: React.FC = () => {
    return (
        <div className="bg-accent py-12 md:py-20">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h1 className="text-3xl md:text-4xl font-heading font-extrabold uppercase tracking-widest text-primary">Cancellation & Refund Policy</h1>
                    <p className="mt-3 text-lg text-gray-600">Clear and simple policies for your peace of mind.</p>
                </div>

                <main className="max-w-4xl mx-auto space-y-10">
                    <Card className="p-8">
                        <h2 className="text-xl font-heading font-extrabold uppercase tracking-widest text-primary mb-4">Cancellation Charges</h2>
                        <p className="text-gray-600 mb-6">Our cancellation policy is based on the time of cancellation before your scheduled pickup time.</p>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 border-b">
                                    <tr>
                                        <th className="p-4 font-semibold text-primary">Cancellation Timeframe</th>
                                        <th className="p-4 font-semibold text-primary">Applicable Charges</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="border-b">
                                        <td className="p-4 font-medium text-gray-700">More than 7 days before pickup</td>
                                        <td className="p-4 text-green-600 font-semibold">0% (Full Refund)</td>
                                    </tr>
                                    <tr className="border-b">
                                        <td className="p-4 font-medium text-gray-700">Between 3 to 7 days before pickup</td>
                                        <td className="p-4 text-yellow-600 font-semibold">50% of the booking amount</td>
                                    </tr>
                                    <tr className="border-b">
                                        <td className="p-4 font-medium text-gray-700">Less than 3 days before pickup</td>
                                        <td className="p-4 text-red-600 font-semibold">100% of the booking amount (No Refund)</td>
                                    </tr>
                                    <tr>
                                        <td className="p-4 font-medium text-gray-700">No Show</td>
                                        <td className="p-4 text-red-600 font-semibold">100% of the booking amount (No Refund)</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </Card>
                    
                    <Card className="p-8">
                        <h2 className="text-xl font-heading font-extrabold uppercase tracking-widest text-primary mb-4">How to Cancel</h2>
                        <p className="text-gray-600">You can cancel your booking through the following methods:</p>
                        <ul className="list-disc list-inside mt-4 space-y-2 text-gray-700">
                            <li><strong>RoAd RoBo’s App:</strong> Navigate to 'My Bookings', select your upcoming trip, and click on the 'Cancel' option.</li>
                            <li><strong>Customer Support:</strong> Call our 24/7 helpline at +91-9844991225 or email us at support@roadrobos.com with your booking ID.</li>
                        </ul>
                        <p className="text-sm mt-4 text-gray-500">Note: Cancellations are effective only after you receive a confirmation email from us.</p>
                    </Card>

                    <Card className="p-8">
                        <h2 className="text-xl font-heading font-extrabold uppercase tracking-widest text-primary mb-4">Refund Process</h2>
                         <p className="text-gray-600">Eligible refunds will be processed as follows:</p>
                        <ul className="list-disc list-inside mt-4 space-y-2 text-gray-700">
                            <li>Refunds are initiated within 48 hours of cancellation confirmation.</li>
                            <li>The amount will be credited back to your original payment source within <strong>5-7 business days</strong>.</li>
                            <li>The security deposit is a separate transaction and will be refunded post-trip after the vehicle is returned in good condition.</li>
                        </ul>
                    </Card>

                     <Card className="p-8">
                        <h2 className="text-xl font-heading font-extrabold uppercase tracking-widest text-primary mb-4">Booking Modifications</h2>
                         <p className="text-gray-600">Any modifications to your booking, such as changing the date, time, or bike model, are subject to availability and may incur additional charges. Please contact our support team at least 6 hours before your pickup time for any modification requests.</p>
                    </Card>

                </main>
            </div>
        </div>
    );
};

export default CancellationPolicyPage;