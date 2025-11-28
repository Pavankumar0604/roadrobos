import { type Bike, type FAQItem, type City, type Offer, type CaseStudy, type PartnerFAQ, type AdminUser, type Role, type Employee, type Enquiry, type Review, type Transaction, type SiteContent, type PressRelease, type JobOpening, type Application } from './types';
import { bikeImages } from './src/assets/bikeImports';

export const bikes: Bike[] = [
  // --- Zeeon Eeva e Color Variants ---
  {
    id: 801,
    name: 'Zeeon Eeva e (Silver)',
    images: bikeImages.zeeoneevasilver, // Silver variant
    type: 'Electric',
    specs: { cc: 'Top Speed: 50 km/h', transmission: 'Automatic' },
    price: { hour: 35, day: 550, week: 3500, month: 11000 },
    minBookingDur: { hour: 10, day: 1 },
    kmLimit: { hour: 10, day: 120, week: 700, month: 2500 },
    excessKmCharge: 3,
    deposit: 2000,
    availability: 'Available',
  },
  {
    id: 802,
    name: 'Zeeon Eeva e (Red)',
    images: bikeImages.zeeoneevaered, // Red variant
    type: 'Electric',
    specs: { cc: 'Top Speed: 50 km/h', transmission: 'Automatic' },
    price: { hour: 35, day: 550, week: 3500, month: 11000 },
    minBookingDur: { hour: 10, day: 1 },
    kmLimit: { hour: 10, day: 120, week: 700, month: 2500 },
    excessKmCharge: 3,
    deposit: 2000,
    availability: 'Available',
  },
  {
    id: 803,
    name: 'Zeeon Eeva e (Blue)',
    images: bikeImages.zeeoneevaeblue, // Blue variant
    type: 'Electric',
    specs: { cc: 'Top Speed: 50 km/h', transmission: 'Automatic' },
    price: { hour: 35, day: 550, week: 3500, month: 11000 },
    minBookingDur: { hour: 10, day: 1 },
    kmLimit: { hour: 10, day: 120, week: 700, month: 2500 },
    excessKmCharge: 3,
    deposit: 2000,
    availability: 'Available',
  },
  {
    id: 804,
    name: 'Zeeon Eeva e (White)',
    images: bikeImages.zeeoneevaewhite, // White variant
    type: 'Electric',
    specs: { cc: 'Top Speed: 50 km/h', transmission: 'Automatic' },
    price: { hour: 35, day: 550, week: 3500, month: 11000 },
    minBookingDur: { hour: 10, day: 1 },
    kmLimit: { hour: 10, day: 120, week: 700, month: 2500 },
    excessKmCharge: 3,
    deposit: 2000,
    availability: 'Available',
  },
  {
    id: 805,
    name: 'Zeeon Eeva e (Black)',
    images: bikeImages.zeeoneevaeblack, // Black variant
    type: 'Electric',
    specs: { cc: 'Top Speed: 50 km/h', transmission: 'Automatic' },
    price: { hour: 35, day: 550, week: 3500, month: 11000 },
    minBookingDur: { hour: 10, day: 1 },
    kmLimit: { hour: 10, day: 120, week: 700, month: 2500 },
    excessKmCharge: 3,
    deposit: 2000,
    availability: 'Available',
  },
  {
    id: 6,
    name: 'Ather 450X',
    images: bikeImages.ather450x,
    type: 'Electric',
    specs: { cc: 'Electric', transmission: 'Automatic' },
    price: { hour: 80, day: 1100, week: 6500, month: 20000 },
    minBookingDur: { hour: 10, day: 1 },
    kmLimit: { hour: 10, day: 120, week: 700, month: 2500 },
    excessKmCharge: 4,
    deposit: 2000,
    availability: 'Available',
  },
  // --- Petrol Bikes ---
  {
    id: 1,
    name: 'Honda Activa 6G',
    images: bikeImages.hondaactiva,
    type: 'Scooter',
    specs: { cc: '110cc', transmission: 'Automatic' },
    price: { hour: 30, day: 450, week: 2800, month: 8000 },
    minBookingDur: { hour: 10, day: 1 },
    kmLimit: { hour: 10, day: 100, week: 600, month: 2000 },
    excessKmCharge: 3,
    deposit: 1000,
    availability: 'Available',
  },
  {
    id: 2,
    name: 'Royal Enfield Classic 350',
    images: bikeImages.royalenfieldclassic,
    type: 'Fuel',
    specs: { cc: '350cc', transmission: 'Manual' },
    price: { hour: 120, day: 1800, week: 10000, month: 30000 },
    minBookingDur: { hour: 10, day: 1 },
    kmLimit: { hour: 10, day: 150, week: 900, month: 3000 },
    excessKmCharge: 8,
    deposit: 2500,
    availability: 'Coming Soon',
  },
  {
    id: 3,
    name: 'BMW G310 R',
    images: bikeImages.bmwg310r,
    type: 'Superbike',
    specs: { cc: '313cc', transmission: 'Manual' },
    price: { hour: 150, day: 2200, week: 14000, month: 45000 },
    minBookingDur: { hour: 10, day: 1 },
    kmLimit: { hour: 10, day: 200, week: 1200, month: 4000 },
    excessKmCharge: 12,
    deposit: 3000,
    availability: 'Available',
  },
  {
    id: 4,
    name: 'TVS Jupiter 125',
    images: bikeImages.tvsjupiter125,
    type: 'Scooter',
    specs: { cc: '125cc', transmission: 'Automatic' },
    price: { hour: 35, day: 500, week: 3000, month: 8500 },
    minBookingDur: { hour: 10, day: 1 },
    kmLimit: { hour: 10, day: 100, week: 600, month: 2000 },
    excessKmCharge: 3,
    deposit: 1000,
    availability: 'Available',
  },
  {
    id: 5,
    name: 'Yamaha MT-15',
    images: bikeImages.yamahamt15,
    type: 'Fuel',
    specs: { cc: '155cc', transmission: 'Manual' },
    price: { hour: 100, day: 1500, week: 8500, month: 25000 },
    minBookingDur: { hour: 10, day: 1 },
    kmLimit: { hour: 10, day: 150, week: 900, month: 3000 },
    excessKmCharge: 6,
    deposit: 2000,
    availability: 'Limited',
  },
];


export const faqData: FAQItem[] = [
  {
    question: 'What documents are required?',
    answer: 'You will need a valid driving license, and a government-issued ID proof (like Aadhaar card, Voter ID, or Passport). For international visitors, a valid international driving permit is required.'
  },
  {
    question: 'How is the deposit handled?',
    answer: 'A refundable security deposit is collected at the time of pickup. The amount varies depending on the bike model. It will be refunded to your original payment method within 5-7 business days after the bike is returned in good condition.'
  },
  {
    question: 'Can I extend my booking?',
    answer: 'Yes, you can extend your booking subject to availability. Please contact our support team at least 4 hours before your scheduled drop-off time. Extension charges will be applicable as per the standard rates.'
  },
  {
    question: 'Are helmets included?',
    answer: 'Yes, one helmet is provided complimentary with every booking. A second helmet can be availed for a nominal fee. We strongly advise all riders to wear a helmet for their safety.'
  },
  {
    question: 'What if a bike breaks down?',
    answer: 'We provide 24/7 roadside assistance. In the unfortunate event of a breakdown, please contact our support helpline immediately. We will arrange for assistance or a replacement vehicle at the earliest.'
  },
  {
    question: 'How do refunds work?',
    answer: 'For cancellations made up to 24 hours before pickup, a full refund is provided. For cancellations within 24 hours, a cancellation fee may apply. The refund for the security deposit is processed after the trip ends and the bike is inspected.'
  }
];

export const cities: City[] = [
  // Karnataka Cities (30)
  { name: 'Bangalore', image: 'https://source.unsplash.com/200x200/?Bangalore,city' },
  { name: 'Bangalore Airport', image: 'https://source.unsplash.com/200x200/?airport,bangalore' },
  { name: 'Mysore', image: 'https://source.unsplash.com/200x200/?Mysore' },
  { name: 'Mangalore', image: 'https://source.unsplash.com/200x200/?Mangalore' },
  { name: 'Hubli-Dharwad', image: 'https://source.unsplash.com/200x200/?Hubli' },
  { name: 'Gulbarga', image: 'https://source.unsplash.com/200x200/?Gulbarga' },
  { name: 'Davanagere', image: 'https://source.unsplash.com/200x200/?Davanagere' },
  { name: 'Belagavi', image: 'https://source.unsplash.com/200x200/?Belagavi' },
  { name: 'Bellary', image: 'https://source.unsplash.com/200x200/?Bellary' },
  { name: 'Tumkur', image: 'https://source.unsplash.com/200x200/?Tumkur' },
  { name: 'Bijapur', image: 'https://source.unsplash.com/200x200/?Bijapur' },
  { name: 'Shimoga', image: 'https://source.unsplash.com/200x200/?Shimoga' },
  { name: 'Raichur', image: 'https://source.unsplash.com/200x200/?Raichur' },
  { name: 'Bidar', image: 'https://source.unsplash.com/200x200/?Bidar' },
  { name: 'Hospet', image: 'https://source.unsplash.com/200x200/?Hospet' },
  { name: 'Gadag-Betageri', image: 'https://source.unsplash.com/200x200/?Gadag' },
  { name: 'Chitradurga', image: 'https://source.unsplash.com/200x200/?Chitradurga' },
  { name: 'Kolar', image: 'https://source.unsplash.com/200x200/?Kolar' },
  { name: 'Mandya', image: 'https://source.unsplash.com/200x200/?Mandya' },
  { name: 'Hassan', image: 'https://source.unsplash.com/200x200/?Hassan' },
  { name: 'Karwar', image: 'https://source.unsplash.com/200x200/?Karwar' },
  { name: 'Udupi', image: 'https://source.unsplash.com/200x200/?Udupi' },
  { name: 'Bagalkot', image: 'https://source.unsplash.com/200x200/?Bagalkot' },
  { name: 'Chikkaballapur', image: 'https://source.unsplash.com/200x200/?Chikkaballapur' },
  { name: 'Ramanagara', image: 'https://source.unsplash.com/200x200/?Ramanagara' },
  { name: 'Yadgir', image: 'https://source.unsplash.com/200x200/?Yadgir' },
  { name: 'Koppal', image: 'https://source.unsplash.com/200x200/?Koppal' },
  { name: 'Chikmagalur', image: 'https://source.unsplash.com/200x200/?Chikmagalur' },
  { name: 'Coorg', image: 'https://source.unsplash.com/200x200/?Coorg' },
  { name: 'Hampi', image: 'https://source.unsplash.com/200x200/?Hampi' },
  // Other Specified Cities
  { name: 'Agra', image: 'https://source.unsplash.com/200x200/?Agra,India' },
  { name: 'Ahmedabad', image: 'https://source.unsplash.com/200x200/?Ahmedabad' },
  { name: 'Bhubaneswar', image: 'https://source.unsplash.com/200x200/?Bhubaneswar' },
  { name: 'Calicut', image: 'https://source.unsplash.com/200x200/?Calicut,India' },
  { name: 'Chandigarh', image: 'https://source.unsplash.com/200x200/?Chandigarh' },
  { name: 'Cochin', image: 'https://source.unsplash.com/200x200/?Cochin' },
  { name: 'Delhi', image: 'https://source.unsplash.com/200x200/?Delhi,India' },
  { name: 'Gandhinagar', image: 'https://source.unsplash.com/200x200/?Gandhinagar' },
  { name: 'Guntur', image: 'https://source.unsplash.com/200x200/?Guntur' },
  { name: 'Gurugram', image: 'https://source.unsplash.com/200x200/?Gurugram' },
  { name: 'Guwahati', image: 'https://source.unsplash.com/200x200/?Guwahati' },
  { name: 'Hyderabad', image: 'https://source.unsplash.com/200x200/?Hyderabad,India' },
  { name: 'Chennai', image: 'https://source.unsplash.com/200x200/?Chennai' },
  { name: 'Mumbai', image: 'https://source.unsplash.com/200x200/?Mumbai' },
];

export const offersData: Offer[] = [
  {
    id: 'o1',
    title: 'Flat 20% off on Gear Bikes (2+ days)',
    type: 'seasonal',
    code: 'GEAR20',
    discountPercent: 20,
    validityDate: '2025-11-30',
    applicableCities: ['Bangalore', 'Chennai'],
    minBooking: '2 days',
    imagePlaceholder: 'https://picsum.photos/seed/offer1/600/400',
    descriptionBullets: ['Minimum booking of 48 hours required.', 'Applicable on Royal Enfield, Yamaha, and BMW models.', 'Cannot be combined with other offers.'],
    endsIn: 30,
    status: 'Active',
    usageLimitPerUser: 1,
    totalUses: 112,
  },
  {
    id: 'o2',
    title: 'First Ride Special — ₹250 off',
    type: 'first',
    code: 'WELCOME250',
    flatAmount: 250,
    validityDate: '2025-12-31',
    applicableCities: ['All'],
    minBooking: '₹1000',
    imagePlaceholder: 'https://picsum.photos/seed/offer2/600/400',
    descriptionBullets: ['Valid only for first-time users.', 'Minimum booking value of ₹1000.', 'Applicable on all bike models.'],
    status: 'Active',
    usageLimitPerUser: 1,
    totalUses: 258,
  },
  {
    id: 'o3',
    title: 'App Exclusive — 10% off',
    type: 'app',
    code: null,
    discountPercent: 10,
    validityDate: 'Ongoing',
    autoApplied: true,
    applicableCities: ['All'],
    imagePlaceholder: 'https://picsum.photos/seed/offer3/600/400',
    descriptionBullets: ['Offer automatically applied on app bookings.', 'Maximum discount of ₹150.', 'Valid on all bookings made via the RoAd RoBo’s app.'],
    status: 'Active',
    usageLimitPerUser: 99,
    totalUses: 1045,
  },
  {
    id: 'o4',
    title: 'Weekend Saver — Free Helmet + Insurance',
    type: 'seasonal',
    code: 'WKNDSAFE',
    flatAmount: 0,
    validityDate: 'Recurring (weekends)',
    applicableCities: ['Bangalore'],
    imagePlaceholder: 'https://picsum.photos/seed/offer4/600/400',
    descriptionBullets: ['Get a complimentary second helmet and basic insurance.', 'Valid for bookings on Saturday & Sunday.', 'Applicable only in Bangalore.'],
    endsIn: 2,
    status: 'Active',
    usageLimitPerUser: 1,
    totalUses: 76,
  },
  {
    id: 'o5',
    title: 'Refer & Earn — ₹200 each',
    type: 'referral',
    code: null,
    flatAmount: 200,
    validityDate: 'Ongoing',
    applicableCities: ['All'],
    imagePlaceholder: 'https://picsum.photos/seed/offer5/600/400',
    descriptionBullets: ['Share your referral code with friends.', 'You both get ₹200 in your wallet after their first ride.', 'No limit on referrals.'],
    status: 'Disabled',
    usageLimitPerUser: 99,
    totalUses: 310,
  },
  {
    id: 'o6',
    title: 'Corporate Monthly Plan',
    type: 'corporate',
    code: null,
    validityDate: 'Ongoing',
    applicableCities: ['All'],
    imagePlaceholder: 'https://picsum.photos/seed/offer6/600/400',
    descriptionBullets: ['Special discounted rates for businesses.', 'Flexible monthly plans.', 'Contact our sales team for a custom quote.'],
    status: 'Active',
    usageLimitPerUser: 99,
    totalUses: 45,
  },
  {
    id: 'o7',
    title: 'Festive Ride Sale — Up to 25% Off',
    type: 'seasonal',
    code: 'FEST25',
    discountPercent: 25,
    validityDate: '2025-11-15',
    applicableCities: ['All'],
    imagePlaceholder: 'https://picsum.photos/seed/offer7/600/400',
    descriptionBullets: ['Offer valid during the festive season.', 'Discount varies by bike model.', 'Check bike details for exact discount.'],
    endsIn: 15,
    status: 'Active',
    usageLimitPerUser: 1,
    totalUses: 189,
  },
  {
    id: 'o8',
    title: 'Electric Bike Week — 15% off EVs',
    type: 'seasonal',
    code: 'ECO15',
    discountPercent: 15,
    applicableCities: ['All'],
    validityDate: '2025-10-31',
    imagePlaceholder: 'https://picsum.photos/seed/offer8/600/400',
    descriptionBullets: ['Promoting green rides!', 'Flat 15% off on all electric bikes.', 'Help us build a sustainable future.'],
    endsIn: 20,
    status: 'Active',
    usageLimitPerUser: 1,
    totalUses: 98,
  },
];

export const caseStudies: CaseStudy[] = [
  {
    id: 'cs1',
    partnerName: 'Bangalore Bike Bros',
    metric: '+40%',
    metricLabel: 'Monthly Revenue',
    quote: 'Partnering with RoAd RoBo’s was the best decision for our business. Our fleet utilization has never been higher.',
    image: 'https://picsum.photos/seed/partner_cs1/400/400',
  },
  {
    id: 'cs2',
    partnerName: 'Chennai Moto Hub',
    metric: '2.5x',
    metricLabel: 'Booking Growth in 6 months',
    quote: 'The technology and marketing support are top-notch. We can focus on what we do best: maintaining our bikes.',
    image: 'https://picsum.photos/seed/partner_cs2/400/400',
  },
  {
    id: 'cs3',
    partnerName: 'Hyderabad Wheels',
    metric: '95%',
    metricLabel: 'Fleet Utilization',
    quote: 'Consistent bookings and fast payouts have transformed our operations. The partner dashboard is incredibly easy to use.',
    image: 'https://picsum.photos/seed/partner_cs3/400/400',
  },
];

export const partnerFaqs: PartnerFAQ[] = [
  {
    question: 'How long does the onboarding process take?',
    answer: 'Once your application is submitted and documents are verified, the entire onboarding process typically takes 5-7 business days. This includes a quality check of your fleet and integration with our platform.',
  },
  {
    question: 'How and when do I get paid?',
    answer: 'We process partner payouts on a weekly basis. Earnings are transferred directly to your registered bank account. You can track all your earnings and payout statements in the partner dashboard.',
  },
  {
    question: 'What kind of support can I expect?',
    answer: 'You will have a dedicated Partner Success Manager to assist you. Additionally, our 24/7 support team is available for any operational queries, and our tech team provides support for platform-related issues.',
  },
  {
    question: 'What happens if a customer damages a bike?',
    answer: 'Our comprehensive damage policy covers such incidents. We handle the customer-side process, including collecting damage fees. Repair costs are assessed transparently, and we work with you to get the bike back on the road quickly.',
  },
];

export const adminRoles: { [key: string]: Role } = {
  superAdmin: { id: 'r1', name: 'Super Admin', permissions: ['*'] },
  contentEditor: { id: 'r2', name: 'Content Editor', permissions: ['edit_content', 'edit_settings'] },
  supportStaff: { id: 'r3', name: 'Support Staff', permissions: ['view_bookings'] },
};

export const initialAdminUsers: AdminUser[] = [
  {
    id: 'u1',
    name: 'Admin User',
    email: 'admin@roadrobos.com',
    passwordHash: 'admin123', // This is for prototype only. Use a proper hash in production.
    role: adminRoles.superAdmin,
  },
  {
    id: 'u2',
    name: 'Content Editor',
    email: 'editor@roadrobos.com',
    passwordHash: 'editor123',
    role: adminRoles.contentEditor,
  },
];

export const initialEmployees: Employee[] = [
  { id: 'e1', name: 'Rohan Sharma', email: 'rohan.s@roadrobos.com', role: 'Operations', status: 'Active' },
  { id: 'e2', name: 'Priya Verma', email: 'priya.v@roadrobos.com', role: 'Support', status: 'Active' },
  { id: 'e3', name: 'Amit Kumar', email: 'amit.k@roadrobos.com', role: 'Marketing', status: 'Inactive' },
  { id: 'e4', name: 'Sunita Menon', email: 'sunita.m@roadrobos.com', role: 'Tech', status: 'Active' },
  { id: 'e5', name: 'Chris Evans', email: 'chris.e@roadrobos.com', role: 'Operations', status: 'Active' },
];

export const pickupLocations: string[] = [
  'Babusapalya',
  'Ejipura',
  'Jayanagar',
  'Kanakapura Road',
  'Koramangala',
  'Shivajinagar'
];

export const enquiriesData: Enquiry[] = [
  { id: 'enq1', name: 'Ravi Kumar', email: 'ravi.k@example.com', phone: '9876543210', message: 'I am interested in a long-term rental for 3 months. Can you provide a custom quote for a Honda Activa?', city: 'Bangalore', receivedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), status: 'New' },
  { id: 'enq2', name: 'Anjali Desai', email: 'anjali.d@example.com', phone: '9123456780', message: 'Do you offer any corporate plans for a team of 15 employees for daily commute?', city: 'Pune', receivedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), status: 'Read' },
  { id: 'enq3', name: 'Sanjay Singh', email: 'sanjay.s@example.com', phone: '9988776655', message: 'I faced an issue with payment. The amount was debited but the booking was not confirmed. Please check.', city: 'Delhi', receivedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), status: 'Archived' },
];

export const reviewsData: Review[] = [
  {
    id: 'rev1',
    name: 'Aarav Sharma',
    rating: 5,
    text: "Seamless experience! The bike was in great condition and the doorstep delivery was a huge plus. Will definitely rent from RoAd RoBo’s again.",
    status: 'Approved',
    userId: 'user123',
  },
  {
    id: 'rev2',
    name: 'Priya Patel',
    rating: 4,
    text: "Good service and affordable pricing. The app is easy to use. The helmet provided could have been cleaner, but overall a positive experience.",
    status: 'Approved',
    userId: 'user456',
  },
  {
    id: 'rev3',
    name: 'Vikram Singh',
    rating: 5,
    text: "Took a Royal Enfield for a weekend trip. The process was smooth, and the support team was very helpful. Highly recommended for bike rentals in Bangalore.",
    status: 'Approved',
    userId: 'user789',
  },
  {
    id: 'rev4',
    name: 'Neha Reddy',
    rating: 3,
    text: 'The booking was easy, but the pickup was a bit delayed. Bike was good though.',
    status: 'Pending',
    userId: 'user101',
  },
];

export const transactionsData: Transaction[] = [
  { id: 'txn_123abc', bookingId: 'RRB-1672531200000', customerName: 'Aarav Sharma', amount: 1800, status: 'Paid', date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 'txn_456def', bookingId: 'RRB-1672617600000', customerName: 'Priya Patel', amount: 550, status: 'Paid', date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() },
];

export const initialSiteContent: SiteContent = {
  home: {
    heroTitleTemplate: 'Rent Bikes in [city] — From ₹25/hr',
    heroSubtitle: 'Hourly, daily & monthly rentals. Doorstep pickup, verified bikes & optional insurance.'
  },
  contact: {
    email: 'chris@roadrobos.com',
    phone: '+91-9844991225'
  }
};

export const pressReleases: PressRelease[] = [
  {
    id: 'pr1',
    title: 'RoAd RoBo’s Launches in Chennai and Hyderabad, Expanding its Green Footprint',
    date: '2024-10-15T10:00:00Z',
    summary: 'SebChris Mobility today announced the expansion of its popular electric scooter rental service, RoAd RoBo’s, to two new major metropolitan areas: Chennai and Hyderabad. This move marks a significant step in the company’s mission to provide sustainable last-mile logistics solutions across India.',
    link: '#',
  },
  {
    id: 'pr2',
    title: 'SebChris Mobility Secures Seed Funding to Accelerate EV Adoption in Last-Mile Delivery',
    date: '2024-09-01T09:00:00Z',
    summary: 'The funding will be used to double the fleet size, enhance the proprietary IoT technology for better vehicle management, and expand operations to five more cities by the end of 2025.',
    link: '#',
  },
  {
    id: 'pr3',
    title: 'RoAd RoBo’s Partners with Major Food Delivery Platforms',
    date: '2024-07-20T11:30:00Z',
    summary: 'In a strategic partnership, RoAd RoBo’s will now offer exclusive, highly-subsidized electric scooter rental plans for delivery executives associated with top food delivery aggregators, reducing their operational costs and carbon emissions.',
    link: '#',
  }
];

export const jobOpenings: JobOpening[] = [
  { id: 'job1', title: 'Operations Manager', location: 'Bangalore, IN', type: 'Full-time', department: 'Operations' },
  { id: 'job2', title: 'Customer Support Executive', location: 'Bangalore, IN', type: 'Full-time', department: 'Support' },
  { id: 'job3', title: 'Service Engineer', location: 'Bangalore, IN', type: 'Full-time', department: 'Operations' },
  { id: 'job4', title: 'Digital Marketing Intern', location: 'Bangalore, IN', type: 'Internship', department: 'Marketing' },
];

export const initialApplications: Application[] = [
  {
    id: 'app1',
    job: jobOpenings[2], // Service Engineer
    applicantName: 'Jane Doe',
    applicantEmail: 'jane.doe@example.com',
    applicantPhone: '9876543210',
    resumeFileName: 'JaneDoe_Resume.pdf',
    resumeFileContent: 'data:application/pdf;base64,U2ltdWxhdGVkIFBERiBjb250ZW50', // Simulated base64
    submittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'New',
  },
  {
    id: 'app2',
    job: jobOpenings[0], // Operations Manager
    applicantName: 'John Smith',
    applicantEmail: 'john.smith@example.com',
    applicantPhone: '8765432109',
    resumeFileName: 'JSmith_CV.pdf',
    resumeFileContent: 'data:application/pdf;base64,U2ltdWxhdGVkIFBERiBjb250ZW50IDIK', // Simulated base64
    submittedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'Under Review',
  },
];
// Razorpay Public Key for Frontend Use (Test Key)
export const RAZORPAY_KEY_ID = 'rzp_test_Rkl2jHVEiOd4H5';