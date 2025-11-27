/**
 * README: RoAd RoBo’s "Become a Partner" Page Prototype
 *
 * This component is a self-contained, interactive prototype of the "Become a Partner" page.
 *
 * --- THEME TOKENS ---
 * - Primary Color: #084C3E (class: text-primary, bg-primary)
 * - Accent Color: #2EB67D (class: text-secondary, bg-secondary)
 * - Warm CTA Accent: #FF7A59 (class: text-accent-warm, bg-accent-warm)
 * - Background: #F9FAFB (class: bg-accent)
 *
 * --- DATA SHAPES ---
 * See `types.ts` for full interfaces.
 * - PartnerApplication: Payload for the partnership application form.
 * - CaseStudy: Content for partner success stories.
 * - PartnerFAQ: Content for the frequently asked questions section.
 *
 * --- BACKEND HOOKUP INSTRUCTIONS ---
 * 1. Form Submission: The form `onSubmit` handler currently simulates a network request.
 *    - Replace `console.log` with a `fetch` or `axios` call to your backend.
 *    - Endpoint Suggestion: POST /api/partner-applications
 *    - The payload should match the `PartnerApplication` interface. Handle file uploads using multipart/form-data.
 * 2. Dynamic Content: Case studies and FAQs are currently hardcoded from `constants.ts`.
 *    - Fetch this data from a CMS or a dedicated API endpoint to make it manageable.
 *    - Endpoint Suggestions: GET /api/content/partner-case-studies, GET /api/content/partner-faqs
 */
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { type PartnerApplication, type CaseStudy, type PartnerFAQ } from '../types';
import { cities, caseStudies, partnerFaqs } from '../constants';
import { ArrowRightIcon, ChevronDownIcon, CheckCircleIcon, CpuChipIcon, CurrencyDollarIcon, PresentationChartLineIcon, DocumentCheckIcon, DocumentDownloadIcon, UploadIcon, XIcon, ArrowUpIcon, UserCircleIcon, MailIcon, PhoneIcon } from './icons/Icons';
import Card from './Card';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// --- Analytics Stub ---
const trackEvent = (eventName: string, properties: Record<string, any> = {}) => {
  console.log(`ANALYTICS EVENT: ${eventName}`, properties);
};

const initialFormState: PartnerApplication = {
  partnershipType: '',
  fullName: '',
  businessName: '',
  email: '',
  phone: '',
  city: 'Bangalore',
  locality: '',
  fleetSize: '',
  vehicleTypes: { scooter: false, geared: false, electric: false },
  contactMethod: 'Phone',
  message: '',
};

const PartnerPage: React.FC = () => {
  const [formState, setFormState] = useState<PartnerApplication>(initialFormState);
  const [errors, setErrors] = useState<Partial<Record<keyof PartnerApplication | 'vehicleTypes' | 'terms', string>>>({});
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [applicationId, setApplicationId] = useState('');

  // -- Calculator State --
  const [calcFleetSize, setCalcFleetSize] = useState(10);
  const [calcUtilization, setCalcUtilization] = useState(70);
  const estimatedEarnings = useMemo(() => {
    const avgDailyRent = 800;
    const revenueShare = 0.85;
    return (calcFleetSize * (calcUtilization / 100) * avgDailyRent * 30 * revenueShare).toLocaleString('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 });
  }, [calcFleetSize, calcUtilization]);

  useEffect(() => {
    trackEvent('partner_page_view');
  }, []);
  
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleCheckboxChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormState(prev => ({
      ...prev,
      vehicleTypes: { ...prev.vehicleTypes, [name]: checked }
    }));
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      // Basic file size check (5MB)
      const validFiles = files.filter((file: File) => file.size <= 5 * 1024 * 1024);
      if (validFiles.length < files.length) {
        alert('Some files were too large (max 5MB) and were not added.');
      }
      setUploadedFiles(prev => [...prev, ...validFiles]);
    }
  };
  
  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};
    if (!formState.partnershipType) newErrors.partnershipType = 'Please select a partnership type.';
    if (!formState.fullName.trim()) newErrors.fullName = 'Full name is required.';
    if (!formState.email || !/\S+@\S+\.\S+/.test(formState.email)) newErrors.email = 'A valid email is required.';
    if (!formState.phone || !/^\d{10}$/.test(formState.phone)) newErrors.phone = 'A 10-digit phone number is required.';
    if (!formState.city) newErrors.city = 'Please select your city.';
    if (!formState.fleetSize || Number(formState.fleetSize) <= 0) newErrors.fleetSize = 'Please enter a valid fleet size.';
    if (!formState.vehicleTypes.scooter && !formState.vehicleTypes.geared && !formState.vehicleTypes.electric) {
        newErrors.vehicleTypes = 'Please select at least one vehicle type.';
    }
    if (!termsAccepted) newErrors.terms = 'You must agree to the terms.';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    trackEvent('partner_apply_click');
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    // --- API Call Stub ---
    await new Promise(resolve => setTimeout(resolve, 1500)); 
    const generatedId = `PART-${Math.floor(10000 + Math.random() * 90000)}`;
    setApplicationId(generatedId);
    console.log('SUBMITTING PAYLOAD:', { ...formState, files: uploadedFiles.map(f => f.name) });
    trackEvent('partner_form_submit', { applicationId: generatedId, partnershipType: formState.partnershipType });
    // --- End Stub ---
    setIsSubmitting(false);
    setIsSuccess(true);
  };

  const handleScrollToForm = (e: React.MouseEvent) => {
    e.preventDefault();
    trackEvent('partner_hero_apply_click');
    document.getElementById('partner-form')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };
  
  const handleDownloadPartnerPack = () => {
    trackEvent('partner_pack_download');
    
    const doc = new jsPDF();
    const pageHeight = doc.internal.pageSize.height;
    let y = 20;

    // --- Header ---
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(8, 76, 62); // Primary color
    doc.text("RoAd RoBo's Partner Pack", doc.internal.pageSize.getWidth() / 2, y, { align: 'center' });
    y += 10;
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(15, 23, 42); // text-body color
    doc.text("Your Guide to Growing Your Fleet Business", doc.internal.pageSize.getWidth() / 2, y, { align: 'center' });
    y += 15;

    const addSection = (title: string, body: string | string[]) => {
        if (y > pageHeight - 40) { // check for page break
            doc.addPage();
            y = 20;
        }
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(8, 76, 62);
        doc.text(title, 14, y);
        y += 8;

        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(71, 85, 105); // text-muted-color
        
        const textToRender = Array.isArray(body) ? body.join('\n') : body;
        const splitBody = doc.splitTextToSize(textToRender, 180);
        doc.text(splitBody, 14, y);
        y += splitBody.length * 5 + 5;
    }

    // --- Introduction ---
    addSection("Introduction", "Welcome! This document provides an overview of the RoAd RoBo's partnership program. We're excited to explore how we can grow together. Our mission is to build a reliable and extensive network of rental bikes across India, and our partners are crucial to this vision.");

    // --- Why Partner With Us? ---
    addSection("Why Partner With Us?", [
        "- Reliable Demand: Get a consistent stream of bookings from our large user base.",
        "- Integrated Tech: Use our partner app for seamless fleet management, booking tracking, and analytics.",
        "- Fast Payouts: Receive your earnings on a reliable weekly or bi-weekly schedule.",
        "- Operations Support: Our dedicated team assists with onboarding, training, and day-to-day operational queries."
    ]);

    // --- How It Works ---
    addSection("The Onboarding Process", [
        "1. Apply & Qualify: Submit your application through our website. Our team reviews your profile.",
        "2. Onboard & Integrate: Complete KYC verification, sign our partnership agreement, and list your bikes on our platform.",
        "3. Receive Bookings: Once your fleet is live, you'll start receiving bookings from our customers.",
        "4. Earn & Scale: Manage your bookings, get timely payouts, and scale your business with our support."
    ]);

    // --- Estimated Earnings Table ---
    if (y > pageHeight - 60) {
        doc.addPage();
        y = 20;
    }
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(8, 76, 62);
    doc.text("Estimated Earnings Potential", 14, y);
    y += 10;
    autoTable(doc, {
        startY: y,
        head: [['Fleet Size', 'Utilization', 'Avg. Daily Rate', 'Estimated Monthly Revenue']],
        body: [
            ['10 Bikes', '70%', '₹800', '₹1,78,500'],
            ['25 Bikes', '75%', '₹800', '₹4,78,125'],
            ['50 Bikes', '80%', '₹800', '₹10,20,000'],
        ],
        theme: 'striped',
        headStyles: { fillColor: [8, 76, 62] },
    });
    y = (doc as any).lastAutoTable.finalY + 10;
    doc.setFontSize(8);
    doc.setTextColor(100);
    doc.text("*Figures are estimates based on an 85% revenue share for partners. Actuals may vary based on location, bike model, and demand.", 14, y);
    y += 15;

    // --- Contact Info ---
    addSection("Next Steps & Contact", "Ready to join? Fill out the application form on our website. If you have any questions, please don't hesitate to reach out to our partnerships team.");
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(71, 85, 105);
    doc.text("Email: partners@roadrobos.com", 14, y);
    y += 6;
    doc.text("Phone: +91-9844991225", 14, y);

    doc.save('RoAd_RoBos_Partner_Pack.pdf');
  };

  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="relative h-[70vh] min-h-[500px] flex items-center bg-cover bg-center text-white" style={{ backgroundImage: "url('https://picsum.photos/seed/partnerhero/1920/1080')" }}>
        <div className="absolute inset-0 bg-primary/70"></div>
        <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl md:text-5xl font-heading font-extrabold uppercase tracking-widest">Become a RoAd RoBo’s Partner</h1>
          <p className="mt-4 text-lg md:text-xl max-w-3xl mx-auto">Grow your fleet, earn steady revenue. We provide bookings, tech & marketing — you provide bikes and local operations.</p>
          <div className="mt-8 flex flex-col sm:flex-row justify-center items-center gap-4">
            <a href="#partner-form" onClick={handleScrollToForm} className="bg-accent-warm font-bold py-3 px-8 rounded-xl text-lg hover:bg-opacity-90 transition-all shadow-lg">Apply Now</a>
            <button onClick={handleDownloadPartnerPack} className="border-2 border-white font-semibold py-3 px-8 rounded-xl text-lg hover:bg-white/10 transition-all flex items-center gap-2">
                <DocumentDownloadIcon className="w-6 h-6" />
                Download Partner Pack
            </button>
          </div>
        </div>
      </section>

      <main className="py-16 md:py-24 bg-accent">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            {/* Value Props */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 -mt-32 relative z-20">
                {[
                    { icon: <ArrowUpIcon className="h-8 w-8 text-primary" />, title: 'Reliable Demand' },
                    { icon: <CpuChipIcon className="h-8 w-8 text-primary" />, title: 'Integrated Tech' },
                    { icon: <CurrencyDollarIcon className="h-8 w-8 text-primary" />, title: 'Fast Payouts' },
                    { icon: <PresentationChartLineIcon className="h-8 w-8 text-primary" />, title: 'Operations Support' }
                ].map(prop => (
                    <div key={prop.title} className="bg-white p-6 rounded-xl shadow-md text-center">
                        <div className="flex justify-center items-center h-16 w-16 mx-auto bg-primary/10 rounded-full">{prop.icon}</div>
                        <h3 className="text-lg font-heading font-extrabold uppercase tracking-widest mt-4">{prop.title}</h3>
                    </div>
                ))}
            </section>
            
            <div className="lg:grid lg:grid-cols-3 lg:gap-12 mt-20">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-20">
                    {/* How It Works */}
                    <section>
                         <h2 className="text-2xl md:text-3xl font-heading font-extrabold uppercase tracking-widest text-center mb-12">How Partnership Works</h2>
                         <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
                            {[
                                { title: 'Apply & Qualify', desc: 'Submit your application. Our team reviews your profile.' },
                                { title: 'Onboard & Integrate', desc: 'Complete KYC, sign agreement, and list your bikes.' },
                                { title: 'Receive Bookings', desc: 'Go live on our platform and get instant bookings.' },
                                { title: 'Earn & Scale', desc: 'Get weekly payouts and grow your business with us.' }
                            ].map((step, i) => (
                                <div key={step.title} className="relative">
                                    <div className="flex items-center justify-center h-16 w-16 mx-auto bg-secondary text-white rounded-full text-2xl font-bold">
                                        {i + 1}
                                    </div>
                                    <h3 className="text-base font-heading font-extrabold uppercase tracking-widest mt-4">{step.title}</h3>
                                    <p className="text-sm text-gray-600 mt-1">{step.desc}</p>
                                </div>
                            ))}
                         </div>
                    </section>
                    
                     {/* Earnings Calculator */}
                    <section className="bg-white p-8 rounded-xl shadow-subtle">
                        <h2 className="text-2xl font-heading font-extrabold uppercase tracking-widest text-center mb-6">Estimate Your Earnings</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                            <div className="space-y-4">
                                <div>
                                    <label htmlFor="calc-fleet-size" className="block text-sm font-medium text-gray-700">Your Fleet Size</label>
                                    <input type="range" id="calc-fleet-size" min="1" max="100" value={calcFleetSize} onChange={e => setCalcFleetSize(Number(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer" />
                                    <div className="text-center font-bold mt-1">{calcFleetSize} bikes</div>
                                </div>
                                <div>
                                    <label htmlFor="calc-utilization" className="block text-sm font-medium text-gray-700">Estimated Utilization</label>
                                    <input type="range" id="calc-utilization" min="10" max="95" step="5" value={calcUtilization} onChange={e => setCalcUtilization(Number(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer" />
                                    <div className="text-center font-bold mt-1">{calcUtilization}%</div>
                                </div>
                            </div>
                            <div className="text-center bg-primary/10 p-6 rounded-lg">
                                <p className="text-sm font-semibold uppercase tracking-wider text-primary">Estimated Monthly Earnings</p>
                                <p className="text-4xl font-bold text-primary mt-2">{estimatedEarnings}</p>
                                <p className="text-xs text-gray-500 mt-2">*This is an estimate. Actual earnings may vary.</p>
                            </div>
                        </div>
                    </section>
                </div>

                {/* Onboarding Form */}
                <aside id="partner-form" className="lg:sticky top-24 h-fit mt-16 lg:mt-0">
                     <Card className="p-0">
                        <form onSubmit={handleSubmit} noValidate className="space-y-4">
                            <div className="p-6">
                                <h3 className="text-xl font-heading font-extrabold uppercase tracking-widest text-center">Let's Get Started!</h3>
                                <p className="text-center text-sm text-gray-600 pb-2">Fill out the form to begin your partnership journey.</p>
                            </div>
                            <div className="px-6 space-y-4">
                                <div>
                                    <select name="partnershipType" value={formState.partnershipType} onChange={handleInputChange} className={`w-full p-3 bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-input-focus ${errors.partnershipType ? 'border-error' : 'border-input'}`}>
                                        <option value="" disabled>Select Partnership Type</option>
                                        <option>Fleet Owner</option>
                                        <option>Dealer</option>
                                        <option>Service Center</option>
                                        <option>Corporate</option>
                                        <option>Other</option>
                                    </select>
                                    {errors.partnershipType && <p className="text-error text-xs mt-1">{errors.partnershipType}</p>}
                                </div>

                                <div>
                                    <input type="text" name="fullName" placeholder="Full Name" value={formState.fullName} onChange={handleInputChange} className={`w-full p-3 bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-input-focus ${errors.fullName ? 'border-error' : 'border-input'}`} />
                                    {errors.fullName && <p className="text-error text-xs mt-1">{errors.fullName}</p>}
                                </div>

                                <div>
                                    <input type="email" name="email" placeholder="Email Address" value={formState.email} onChange={handleInputChange} className={`w-full p-3 bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-input-focus ${errors.email ? 'border-error' : 'border-input'}`} />
                                    {errors.email && <p className="text-error text-xs mt-1">{errors.email}</p>}
                                </div>

                                <div>
                                    <input type="tel" name="phone" placeholder="10-digit Phone Number" value={formState.phone} onChange={handleInputChange} className={`w-full p-3 bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-input-focus ${errors.phone ? 'border-error' : 'border-input'}`} />
                                    {errors.phone && <p className="text-error text-xs mt-1">{errors.phone}</p>}
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <select name="city" value={formState.city} onChange={handleInputChange} className={`w-full p-3 bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-input-focus ${errors.city ? 'border-error' : 'border-input'}`}>
                                            {cities.slice(0, 5).map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                                        </select>
                                        {errors.city && <p className="text-error text-xs mt-1">{errors.city}</p>}
                                    </div>
                                    <div>
                                    <input type="number" name="fleetSize" placeholder="Fleet Size" value={formState.fleetSize} onChange={handleInputChange} className={`w-full p-3 bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-input-focus ${errors.fleetSize ? 'border-error' : 'border-input'}`} />
                                    {errors.fleetSize && <p className="text-error text-xs mt-1">{errors.fleetSize}</p>}
                                    </div>
                                </div>

                                <div>
                                    <p className="text-sm font-medium text-gray-700 mb-2">Primary Vehicle Types</p>
                                    <div className="flex flex-wrap gap-4">
                                        {Object.keys(formState.vehicleTypes).map(type => (
                                            <label key={type} className="flex items-center">
                                                <input type="checkbox" name={type} checked={formState.vehicleTypes[type as keyof typeof formState.vehicleTypes]} onChange={handleCheckboxChange} className="h-4 w-4 focus:ring-secondary border-gray-300 rounded" />
                                                <span className="ml-2 text-sm text-gray-700 capitalize">{type}</span>
                                            </label>
                                        ))}
                                    </div>
                                    {errors.vehicleTypes && <p className="text-error text-xs mt-1">{errors.vehicleTypes}</p>}
                                </div>

                                <div className="flex items-start pt-2">
                                    <input id="terms" type="checkbox" checked={termsAccepted} onChange={() => setTermsAccepted(p => !p)} className={`mt-1 h-4 w-4 focus:ring-secondary border-gray-300 rounded ${errors.terms ? 'border-error' : ''}`} />
                                    <div className="ml-3 text-sm">
                                        <label htmlFor="terms" className="text-gray-700">I agree to the <a href="#" className="font-semibold text-primary hover:underline">Partner Terms</a></label>
                                        {errors.terms && <p className="text-error text-xs">{errors.terms}</p>}
                                    </div>
                                </div>
                            </div>
                            
                            <div className="p-6 bg-gray-50/50 rounded-b-card mt-4">
                                <button type="submit" disabled={isSubmitting} className="w-full bg-secondary text-white font-bold py-3 rounded-lg hover:bg-opacity-90 transition-all disabled:opacity-50">
                                    {isSubmitting ? 'Submitting...' : 'Submit Application'}
                                </button>
                            </div>
                        </form>
                    </Card>
                </aside>
            </div>
            
             {/* Case Studies */}
            <section className="mt-20">
                <h2 className="text-2xl md:text-3xl font-heading font-extrabold uppercase tracking-widest text-center mb-12">Success Stories from Our Partners</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {caseStudies.map(cs => (
                        <div key={cs.id} className="bg-white rounded-xl shadow-subtle p-6 text-center">
                            <img src={cs.image} alt={cs.partnerName} className="w-24 h-24 rounded-full mx-auto object-cover border-4 border-white shadow-md -mt-12"/>
                            <p className="text-4xl font-bold text-secondary mt-4">{cs.metric}</p>
                            <p className="text-sm font-semibold text-gray-600">{cs.metricLabel}</p>
                            <blockquote className="text-gray-700 mt-4 italic">"{cs.quote}"</blockquote>
                            <p className="font-bold mt-4">- {cs.partnerName}</p>
                        </div>
                    ))}
                </div>
            </section>
            
            {/* FAQs */}
            <section className="mt-20 max-w-4xl mx-auto">
                 <h2 className="text-2xl md:text-3xl font-heading font-extrabold uppercase tracking-widest text-center mb-12">Frequently Asked Questions</h2>
                 <div className="space-y-3">
                    {partnerFaqs.map(faq => (
                        <details key={faq.question} className="bg-white p-4 rounded-lg shadow-sm group">
                            <summary className="flex justify-between items-center font-medium cursor-pointer list-none">
                                <span>{faq.question}</span>
                                <ChevronDownIcon className="h-5 w-5 text-gray-500 transition-transform duration-300 group-open:rotate-180" />
                            </summary>
                            <div className="text-gray-600 mt-3 text-sm">{faq.answer}</div>
                        </details>
                    ))}
                 </div>
            </section>
        </div>
      </main>

      {/* Success Modal */}
      {isSuccess && (
        <div className="fixed inset-0 bg-black/60 z-[70] flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-lg w-full max-w-md text-center p-8">
                <CheckCircleIcon className="w-16 h-16 text-secondary mx-auto"/>
                <h2 className="text-xl font-heading font-extrabold uppercase tracking-widest mt-4">Application Received!</h2>
                <p className="text-gray-600 mt-2">Our Partnerships team will contact you within 48 hours.</p>
                <div className="mt-4 bg-accent p-3 rounded-lg">
                    <p className="text-sm uppercase tracking-wider">Application ID</p>
                    <p className="text-xl font-mono font-bold tracking-widest">{applicationId}</p>
                </div>
                <button onClick={() => { setIsSuccess(false); setFormState(initialFormState); setTermsAccepted(false); }} className="mt-6 w-full bg-primary text-white font-semibold py-2.5 rounded-lg hover:bg-opacity-90">
                    Close
                </button>
            </div>
        </div>
      )}
    </div>
  );
};

export default PartnerPage;