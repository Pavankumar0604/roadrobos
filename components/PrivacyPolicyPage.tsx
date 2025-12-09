import React from 'react';

const PrivacyPolicyPage: React.FC = () => {
    return (
        <div className="bg-white py-12 md:py-20">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h1 className="text-3xl md:text-4xl font-heading font-extrabold uppercase tracking-widest text-primary">Privacy Policy</h1>
                    <p className="mt-3 text-lg text-gray-600">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                </div>

                <main className="prose prose-lg max-w-4xl mx-auto text-gray-700 leading-relaxed">
                    <section>
                        <h2 className="text-xl font-heading font-extrabold uppercase tracking-widest text-primary">1. Introduction</h2>
                        <p>SebChris Mobility Pvt Ltd. ("RoAd RoBo’s", "we", "us", "our") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website, mobile application, and bike rental services (collectively, the "Services").</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-heading font-extrabold uppercase tracking-widest text-primary mt-8">2. Information We Collect</h2>
                        <p>We may collect information about you in a variety of ways. The information we may collect via the Services includes:</p>
                        <ul>
                            <li><strong>Personal Data:</strong> Personally identifiable information, such as your name, email address, phone number, and demographic information, that you voluntarily give to us when you register or make a booking.</li>
                            <li><strong>Financial Data:</strong> Financial information, such as data related to your payment method (e.g., valid credit card number, card brand, expiration date) that we may collect when you make a purchase. We store only very limited, if any, financial information that we collect. Otherwise, all financial information is stored by our payment processor.</li>
                            <li><strong>Derivative Data:</strong> Information our servers automatically collect when you access the Services, such as your IP address, your browser type, your operating system, your access times, and the pages you have viewed directly before and after accessing the Services.</li>
                            <li><strong>Mobile Device Data:</strong> Device information such as your mobile device ID, model, and manufacturer, and information about the location of your device, if you access the Services from a mobile device.</li>
                        </ul>
                    </section>
                    
                    <section>
                        <h2 className="text-xl font-heading font-extrabold uppercase tracking-widest text-primary mt-8">3. Use of Your Information</h2>
                        <p>Having accurate information about you permits us to provide you with a smooth, efficient, and customized experience. Specifically, we may use information collected about you via the Services to:</p>
                        <ul>
                            <li>Create and manage your account.</li>
                            <li>Process your bookings and payments.</li>
                            <li>Email you regarding your account or order.</li>
                            <li>Enable user-to-user communications.</li>
                            <li>Monitor and analyze usage and trends to improve your experience with the Services.</li>
                            <li>Notify you of updates to the Services.</li>
                            <li>Prevent fraudulent transactions, monitor against theft, and protect against criminal activity.</li>
                            <li>Request feedback and contact you about your use of the Services.</li>
                            <li>Resolve disputes and troubleshoot problems.</li>
                        </ul>
                    </section>
                    
                    <section>
                        <h2 className="text-xl font-heading font-extrabold uppercase tracking-widest text-primary mt-8">4. Disclosure of Your Information</h2>
                        <p>We may share information we have collected about you in certain situations. Your information may be disclosed as follows:</p>
                        <ul>
                            <li><strong>By Law or to Protect Rights:</strong> If we believe the release of information about you is necessary to respond to legal process, to investigate or remedy potential violations of our policies, or to protect the rights, property, and safety of others, we may share your information as permitted or required by any applicable law, rule, or regulation.</li>
                            <li><strong>Third-Party Service Providers:</strong> We may share your information with third parties that perform services for us or on our behalf, including payment processing, data analysis, email delivery, hosting services, customer service, and marketing assistance.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-heading font-extrabold uppercase tracking-widest text-primary mt-8">5. Security of Your Information</h2>
                        <p>We use administrative, technical, and physical security measures to help protect your personal information. While we have taken reasonable steps to secure the personal information you provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable, and no method of data transmission can be guaranteed against any interception or other type of misuse.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-heading font-extrabold uppercase tracking-widest text-primary mt-8">6. Contact Us</h2>
                        <p>If you have questions or comments about this Privacy Policy, please contact us at:</p>
                        <p>
                            SebChris Mobility Pvt. Ltd.<br/>
                            13 & 14, Horamavu Agara Village,<br/>
                            K.R. Puram Hobli, Kalyan Nagar Post,<br/>
                            Bengaluru - 560043<br/>
                            Email: <a href="mailto:privacy@roadrobos.com">privacy@roadrobos.com</a>
                        </p>
                    </section>
                </main>
            </div>
        </div>
    );
};

export default PrivacyPolicyPage;
