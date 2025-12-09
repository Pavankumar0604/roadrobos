import React, { useState } from 'react';
import { MailIcon, PhoneIncomingIcon, OfficeBuildingIcon, CheckCircleIcon } from './icons/Icons';
import Card from './Card';
import { supabase } from '../src/supabaseClient';

interface ContactPageProps {
    contactEmail: string;
    contactPhone: string;
}

const ContactPage: React.FC<ContactPageProps> = ({ contactEmail, contactPhone }) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        city: '',
        message: '',
    });
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const validate = () => {
        const newErrors: { [key: string]: string } = {};
        if (!formData.name.trim()) newErrors.name = 'Full name is required.';
        if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'A valid email is required.';
        if (!formData.phone || !/^\d{10}$/.test(formData.phone)) newErrors.phone = 'A 10-digit phone number is required.';
        if (!formData.message.trim()) newErrors.message = 'Message cannot be empty.';
        return newErrors;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const validationErrors = validate();
        setErrors(validationErrors);

        if (Object.keys(validationErrors).length === 0) {
            setIsSubmitting(true);
            try {
                // Save enquiry directly to database (bypass Edge Function)
                const { data, error } = await supabase
                    .from('enquiries')
                    .insert({
                        name: formData.name,
                        email: formData.email,
                        phone: formData.phone,
                        message: formData.message,
                        status: 'New'
                    })
                    .select()
                    .single();

                if (error) {
                    console.error('Failed to submit enquiry:', error);
                    throw new Error(error.message);
                }

                console.log('Enquiry submitted successfully:', data);
                setIsSubmitted(true);

                // Reset form
                setFormData({
                    name: '',
                    email: '',
                    phone: '',
                    city: '',
                    message: '',
                });
            } catch (error: any) {
                console.error('Failed to submit enquiry:', error);
                alert('Failed to submit your message. Please try again.');
            } finally {
                setIsSubmitting(false);
            }
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className="bg-white">
            {/* Hero */}
            <section className="bg-primary text-white text-center py-20">
                <div className="container mx-auto px-4">
                    <h1 className="text-3xl md:text-4xl font-heading font-extrabold uppercase tracking-widest">Need Help? Get in Touch.</h1>
                    <p className="mt-4 text-lg text-gray-200 max-w-2xl mx-auto">Whether you have a question about our bikes, pricing, or anything else, our team is ready to answer all your questions.</p>
                </div>
            </section>

            <section className="py-16 md:py-20">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16 items-start">
                        {/* Contact Info */}
                        <div className="space-y-8">
                            <div className="text-center md:text-left">
                                <h2 className="text-2xl font-heading font-extrabold uppercase tracking-widest text-primary">Contact Information</h2>
                                <p className="mt-2 text-gray-600">Reach out to us through any of the following channels.</p>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="flex-shrink-0 bg-primary/10 rounded-full p-3 mt-1">
                                    <MailIcon className="w-6 h-6 text-primary" />
                                </div>
                                <div>
                                    <h3 className="text-base font-heading font-extrabold uppercase tracking-widest">Email Us</h3>
                                    <p className="text-gray-600">For support, partnerships, or press inquiries.</p>
                                    <a href={`mailto:${contactEmail}`} className="text-primary font-semibold hover:underline">{contactEmail}</a>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="flex-shrink-0 bg-primary/10 rounded-full p-3 mt-1">
                                    <PhoneIncomingIcon className="w-6 h-6 text-primary" />
                                </div>
                                <div>
                                    <h3 className="text-base font-heading font-extrabold uppercase tracking-widest">Call Us</h3>
                                    <p className="text-gray-600">Our lines are open 24/7 for booking and support.</p>
                                    <a href={`tel:${contactPhone}`} className="text-primary font-semibold hover:underline">{contactPhone}</a>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="flex-shrink-0 bg-primary/10 rounded-full p-3 mt-1">
                                    <OfficeBuildingIcon className="w-6 h-6 text-primary" />
                                </div>
                                <div>
                                    <h3 className="text-base font-heading font-extrabold uppercase tracking-widest">Our Office</h3>
                                    <p className="text-gray-600">Sebchris Mobility Pvt. Ltd.</p>
                                    <p className="text-gray-600">13 & 14, Horamavu Agara Village,</p>
                                    <p className="text-gray-600">K.R. Puram Hobli, Kalyan Nagar Post,</p>
                                    <p className="text-gray-600">Bengaluru - 560043</p>
                                    <p className="mt-1 text-sm text-gray-500">Opening Hours: Mon-Fri, 9 AM - 6 PM</p>
                                </div>
                            </div>
                        </div>

                        {/* Contact Form */}
                        <Card className="p-0">
                            {isSubmitted ? (
                                <div className="text-center p-8 flex flex-col items-center justify-center min-h-[400px]">
                                    <CheckCircleIcon className="w-16 h-16 text-secondary" />
                                    <h2 className="text-xl font-heading font-extrabold uppercase tracking-widest text-primary mt-4">Thank you!</h2>
                                    <p className="mt-2 text-gray-600">Your message has been sent. Our team will get back to you shortly.</p>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} noValidate>
                                    <div className="p-6 border-b border-card">
                                        <h2 className="text-xl font-heading font-extrabold uppercase tracking-widest text-primary">Send us a Message</h2>
                                    </div>
                                    <div className="p-6 space-y-4">
                                        <div>
                                            <label htmlFor="name" className="block text-sm font-medium text-text-body mb-1">Full Name</label>
                                            <input type="text" name="name" id="name" placeholder="John Doe" value={formData.name} onChange={handleChange} className={`w-full p-3 bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-input-focus ${errors.name ? 'border-error' : 'border-input'}`} required aria-invalid={!!errors.name} />
                                            {errors.name && <p className="text-error text-xs mt-1">{errors.name}</p>}
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div>
                                                <label htmlFor="email" className="block text-sm font-medium text-text-body mb-1">Email Address</label>
                                                <input type="email" name="email" id="email" placeholder="you@example.com" value={formData.email} onChange={handleChange} className={`w-full p-3 bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-input-focus ${errors.email ? 'border-error' : 'border-input'}`} required aria-invalid={!!errors.email} />
                                                {errors.email && <p className="text-error text-xs mt-1">{errors.email}</p>}
                                            </div>
                                            <div>
                                                <label htmlFor="phone" className="block text-sm font-medium text-text-body mb-1">Phone Number</label>
                                                <input type="tel" name="phone" id="phone" placeholder="10-digit number" value={formData.phone} onChange={handleChange} className={`w-full p-3 bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-input-focus ${errors.phone ? 'border-error' : 'border-input'}`} required aria-invalid={!!errors.phone} />
                                                {errors.phone && <p className="text-error text-xs mt-1">{errors.phone}</p>}
                                            </div>
                                        </div>
                                        <div>
                                            <label htmlFor="city" className="block text-sm font-medium text-text-body mb-1">Your City (Optional)</label>
                                            <input type="text" name="city" id="city" placeholder="e.g., Bangalore" value={formData.city} onChange={handleChange} className="w-full p-3 bg-white border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-input-focus" />
                                        </div>
                                        <div>
                                            <label htmlFor="message" className="block text-sm font-medium text-text-body mb-1">Message</label>
                                            <textarea name="message" id="message" rows={5} placeholder="How can we help you today?" value={formData.message} onChange={handleChange} className={`w-full p-3 bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-input-focus ${errors.message ? 'border-error' : 'border-input'}`} required aria-invalid={!!errors.message}></textarea>
                                            {errors.message && <p className="text-error text-xs mt-1">{errors.message}</p>}
                                        </div>
                                    </div>
                                    <div className="p-6 bg-gray-50 rounded-b-card">
                                        <button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="w-full bg-secondary text-white font-bold py-3 rounded-lg hover:bg-opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {isSubmitting ? 'Sending...' : 'Submit'}
                                        </button>
                                    </div>
                                </form>
                            )}
                        </Card>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default ContactPage;