export type AvailabilityStatus = 'Available' | 'Limited' | 'Coming Soon';

export interface Bike {
  id: number;
  name: string;
  images: string[];
  type: 'Scooter' | 'Fuel' | 'Electric' | 'Superbike';
  specs: {
    cc: string;
    transmission: string;
  };
  price: {
    hour: number;
    day: number;
    week: number;
    month: number;
  };
  minBookingDur: {
    hour: number;
    day: number;
  };
  kmLimit: {
    hour: number;
    day: number;
    week: number;
    month: number;
  };
  excessKmCharge: number;
  deposit: number;
  availability: AvailabilityStatus;
  colorVariants?: { colorName: string; imageIndex: number }[];
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface City {
  name: string;
  image: string;
}

export interface SearchParams {
  pickupLocation: string;
  pickupDate: string;
  pickupTime: string;
  dropDate: string;
  dropTime: string;
  city: string;
}

// Company Information Constants
export const COMPANY_INFO = {
  name: "RoAd RoBo's - Bike Rentals",
  address: "13 & 14, Horamavu Agara Village, \nKalyan Nagar,Babusapalya,\n Bengaluru - 560043",
  gstNumber: "29ABRCS0299J1ZH"
};

// Rider Information for enhanced booking form
export interface RiderInformation {
  // Application & Identity
  applicationNumber: string;
  userName: string;
  idProof: 'Aadhaar Card' | 'PAN Card';
  idNumber: string;

  // Contact Information
  contactNumber: string;
  alternateNumber?: string;
  emailId: string;

  // Address Information
  localAddress: string;
  localAddressProof?: string;
  permanentAddress: string;
  permanentAddressProof: string;

  // Optional fields
  deliveryExecutive?: boolean;
  deliveryId?: string;

  // Rental Period
  rentalPeriodCommencementDate: string;
  startedDate: string;
  returnDate: string;

  // Vehicle Details
  vehicleName: string;
  vehicleType: string;
  vehicleCategory: string;
  vehicleColor: string;
  vehicleIdNumber: string;
}

export interface BookingDetails {
  bookingId: string;
  bike: Bike;
  searchParams: SearchParams;
  user: RiderInformation;
  addons: {
    helmet: boolean;
    insurance: boolean;
  };
  totalFare: number;
  transactionId?: string;
}

export interface Offer {
  id: string;
  title: string;
  type: 'app' | 'first' | 'seasonal' | 'referral' | 'corporate';
  code: string | null;
  discountPercent?: number | null;
  flatAmount?: number | null;
  validityDate: string;
  applicableCities: string[];
  minBooking?: string;
  imagePlaceholder: string;
  descriptionBullets: string[];
  endsIn?: number;
  autoApplied?: boolean;
  status: 'Active' | 'Disabled';
  usageLimitPerUser: number; // e.g., 1 for once per day
  totalUses: number;
}

export interface PartnerApplication {
  partnershipType: 'Fleet Owner' | 'Dealer' | 'Service Center' | 'Corporate' | 'Other' | '';
  fullName: string;
  businessName?: string;
  email: string;
  phone: string;
  city: string;
  locality?: string;
  fleetSize: number | '';
  vehicleTypes: {
    scooter: boolean;
    geared: boolean;
    electric: boolean;
  };
  contactMethod: 'Phone' | 'Email';
  message?: string;
}

export interface CaseStudy {
  id: string;
  partnerName: string;
  metric: string;
  metricLabel: string;
  quote: string;
  image: string;
}

export interface PartnerFAQ {
  question: string;
  answer: string;
}

export interface Role {
  id: string;
  name: 'Super Admin' | 'Content Editor' | 'Support Staff';
  permissions: string[];
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  passwordHash: string; // NOTE: In a real app, this would be a hash, not plain text.
  role: Role;
}

export interface Employee {
  id: string;
  name: string;
  email: string;
  role: 'Operations' | 'Support' | 'Marketing' | 'Tech';
  status: 'Active' | 'Inactive';
}

export interface Enquiry {
  id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  city?: string;
  receivedAt: string;
  status: 'New' | 'Read' | 'Archived';
}

export interface Review {
  id: string;
  name: string;
  rating: number;
  text: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  userId?: string;
}

export interface Transaction {
  id: string;
  bookingId: string;
  customerName: string;
  amount: number;
  status: 'Paid' | 'Pending' | 'Failed';
  date: string;
}

export interface SiteContent {
  home: {
    heroTitleTemplate: string;
    heroSubtitle: string;
  };
  contact: {
    email: string;
    phone: string;
  };
}

export interface PressRelease {
  id: string;
  title: string;
  date: string;
  summary: string;
  link: string;
}

export interface JobOpening {
  id: string;
  title: string;
  location: string;
  type: 'Full-time' | 'Part-time' | 'Internship';
  department: 'Operations' | 'Tech' | 'Marketing' | 'Support';
}

export interface Application {
  id: string;
  job: JobOpening;
  applicantName: string;
  applicantEmail: string;
  applicantPhone: string;
  resumeFileName: string;
  resumeFileContent: string; // In a real app, this would be a URL to a file in storage.
  submittedAt: string;
  status: 'New' | 'Under Review' | 'Interviewing' | 'Rejected' | 'Hired';
}
