import React, { useState, useEffect } from 'react';
import { type AdminUser, type Bike, type Offer, type Enquiry, AvailabilityStatus, type Review, type Transaction, type Employee, type SiteContent, type Role, type Application } from '../types';
import { CogIcon, LogoutIcon, PencilAltIcon, UsersIcon, ViewGridIcon, XIcon, MenuAlt2Icon, ClipboardListIcon, LocationMarkerIcon, TagIcon, MailIcon, TrashIcon, PlusIcon, StarIcon, CreditCardIcon, DocumentCheckIcon, DocumentDownloadIcon, ChartBarIcon } from './icons/Icons';
import Card from './Card';
import { adminRoles } from '../constants';
import api from '../src/api';
import ReportsPanel from './ReportsPanel';
import TransactionManagementPanel from './TransactionManagementPanel';
import BookingManagementPanel from './BookingManagementPanel';

interface AdminDashboardProps {
    user: AdminUser;
    onLogout: () => void;
    bikes: Bike[];
    setBikes: React.Dispatch<React.SetStateAction<Bike[]>>;
    locations: string[];
    setLocations: React.Dispatch<React.SetStateAction<string[]>>;
    offers: Offer[];
    setOffers: React.Dispatch<React.SetStateAction<Offer[]>>;
    enquiries: Enquiry[];
    setEnquiries: React.Dispatch<React.SetStateAction<Enquiry[]>>;
    reviews: Review[];
    setReviews: React.Dispatch<React.SetStateAction<Review[]>>;
    transactions: Transaction[];
    setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
    employees: Employee[];
    setEmployees: React.Dispatch<React.SetStateAction<Employee[]>>;
    siteContent: SiteContent;
    setSiteContent: React.Dispatch<React.SetStateAction<SiteContent>>;
    adminUsers: AdminUser[];
    setAdminUsers: React.Dispatch<React.SetStateAction<AdminUser[]>>;
    applications: Application[];
    setApplications: React.Dispatch<React.SetStateAction<Application[]>>;
}

type AdminPanel = 'dashboard' | 'bookings' | 'fleet' | 'locations' | 'offers' | 'enquiries' | 'reviews' | 'transactions' | 'content' | 'users' | 'settings' | 'employees' | 'applications' | 'reports';

const AdminDashboard: React.FC<AdminDashboardProps> = (props) => {
    const { user, onLogout, reviews, setReviews, bikes, setBikes, locations, setLocations, offers, setOffers, enquiries, setEnquiries, transactions, setTransactions, employees, setEmployees, siteContent, setSiteContent, adminUsers, setAdminUsers, applications, setApplications } = props;

    // Restore active panel from localStorage or default to 'applications'
    const [activePanel, setActivePanel] = useState<AdminPanel>(() => {
        const saved = localStorage.getItem('adminActivePanel');
        return (saved as AdminPanel) || 'applications';
    });
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Save active panel to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem('adminActivePanel', activePanel);
    }, [activePanel]);

    // Refresh data function
    const refreshData = async () => {
        setIsRefreshing(true);
        try {
            // Fetch latest data based on current panel
            const [bikesData, offersData, enquiriesData, reviewsData, employeesData, applicationsData, transactionsData] = await Promise.all([
                api.admin.getBikes(),
                api.admin.getOffers(),
                api.admin.getEnquiries(),
                api.admin.getReviews(),
                api.admin.getEmployees(),
                api.admin.getApplications(),
                api.admin.getTransactions()
            ]);

            setBikes(bikesData);
            setOffers(offersData);
            setEnquiries(enquiriesData);
            setReviews(reviewsData);
            setEmployees(employeesData);
            setApplications(applicationsData);
            setTransactions(transactionsData);
        } catch (error) {
            console.error('Error refreshing data:', error);
        } finally {
            setIsRefreshing(false);
        }
    };

    // Auto-refresh every 30 seconds
    useEffect(() => {
        const interval = setInterval(refreshData, 30000); // 30 seconds
        return () => clearInterval(interval);
    }, []);

    // Refresh data on manual browser refresh (page load)
    useEffect(() => {
        refreshData();
    }, []);

    const navItems = [
        { id: 'dashboard', label: 'Dashboard', icon: <ViewGridIcon className="w-5 h-5" /> },
        { id: 'bookings', label: 'Bookings', icon: <ClipboardListIcon className="w-5 h-5" /> },
        { id: 'fleet', label: 'Bike Fleet', icon: <ClipboardListIcon className="w-5 h-5" /> },
        { id: 'locations', label: 'Pickup Locations', icon: <LocationMarkerIcon className="w-5 h-5" /> },
        { id: 'offers', label: 'Offers', icon: <TagIcon className="w-5 h-5" /> },
        { id: 'enquiries', label: 'Enquiries', icon: <MailIcon className="w-5 h-5" /> },
        { id: 'applications', label: 'Applications', icon: <DocumentCheckIcon className="w-5 h-5" /> },
        { id: 'reviews', label: 'Reviews', icon: <StarIcon className="w-5 h-5" /> },
        { id: 'transactions', label: 'Transactions', icon: <CreditCardIcon className="w-5 h-5" /> },
        { id: 'content', label: 'Content', icon: <PencilAltIcon className="w-5 h-5" /> },
        { id: 'users', label: 'Users & Roles', icon: <UsersIcon className="w-5 h-5" /> },
        { id: 'settings', label: 'Site Settings', icon: <CogIcon className="w-5 h-5" /> },
        { id: 'employees', label: 'Employees', icon: <UsersIcon className="w-5 h-5" /> },
        { id: 'reports', label: 'Reports', icon: <ChartBarIcon className="w-5 h-5" /> },
    ];

    const handleNavClick = (panel: AdminPanel) => {
        setActivePanel(panel);
        setIsSidebarOpen(false);
    }

    const renderPanel = () => {
        switch (activePanel) {
            case 'bookings': return <BookingManagementPanel />;
            case 'fleet': return <BikeManagementPanel fleet={bikes} setFleet={setBikes} />;
            case 'locations': return <LocationManagementPanel locations={locations} setLocations={setLocations} />;
            case 'offers': return <OfferManagementPanel offers={offers} setOffers={setOffers} />;
            case 'enquiries': return <EnquiryManagementPanel enquiries={enquiries} setEnquiries={setEnquiries} />;
            case 'reviews': return <ReviewManagementPanel reviews={reviews} setReviews={setReviews} />;
            case 'transactions': return <TransactionManagementPanel transactions={transactions} setTransactions={setTransactions} />;
            case 'content': return <ContentManagementPanel siteContent={siteContent} setSiteContent={setSiteContent} />;
            case 'users': return <UserManagementPanel adminUsers={adminUsers} setAdminUsers={setAdminUsers} />;
            case 'settings': return <SiteSettingsPanel siteContent={siteContent} setSiteContent={setSiteContent} />;
            case 'employees': return <EmployeesPanel employees={employees} setEmployees={setEmployees} />;
            case 'applications': return <ApplicationsPanel applications={applications} setApplications={setApplications} />;
            case 'reports': return <ReportsPanel transactions={transactions} />;
            case 'dashboard':
            default:
                return <DashboardHomePanel user={user} setActivePanel={setActivePanel} />;
        }
    };

    const SidebarContent = () => (
        <>
            <div className="p-4 border-b border-white/20 text-center">
                <h1 className="text-2xl font-bold leading-tight">RoAd RoBo's</h1>
                <span className="text-sm opacity-80">Admin Panel</span>
            </div>
            <nav className="flex-grow p-3 overflow-y-auto">
                {navItems.map(item => (
                    <button
                        key={item.id}
                        onClick={() => handleNavClick(item.id as AdminPanel)}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition mb-1 ${activePanel === item.id ? 'bg-white/20' : 'hover:bg-white/10'
                            }`}
                    >
                        <div>{item.icon}</div>
                        <span>{item.label}</span>
                    </button>
                ))}
            </nav>
            <div className="p-4 border-t border-white/20 bg-black/10">
                <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold">
                        {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                        <p className="text-sm font-semibold text-white">{user.name}</p>
                        <p className="text-xs text-green-200/70">{user.role.name}</p>
                    </div>
                </div>
                <button onClick={onLogout} className="w-full flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold py-2.5 rounded-lg text-sm transition-all duration-200 hover:shadow-lg">
                    <LogoutIcon className="w-5 h-5" /> Logout
                </button>
            </div>
        </>
    );

    return (
        <div className="flex min-h-screen bg-accent">
            {/* Sidebar (Desktop) */}
            <aside className="hidden lg:flex w-64 bg-primary text-white flex-col shadow-xl">
                <SidebarContent />
            </aside>

            {/* Mobile Sidebar */}
            <div className={`fixed inset-0 z-40 lg:hidden ${isSidebarOpen ? 'block' : 'hidden'}`}>
                <div className="fixed inset-0 bg-black/60" onClick={() => setIsSidebarOpen(false)}></div>
                <aside className={`fixed top-0 left-0 h-full w-64 bg-primary text-white flex flex-col transition-transform duration-300 ease-in-out shadow-xl ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                    <SidebarContent />
                </aside>
            </div>

            {/* Main Content */}
            <main className="flex-1 p-4 sm:p-6 lg:p-8 flex flex-col">
                <div className="lg:hidden flex items-center justify-between mb-4">
                    <div className="flex items-center">
                        <button onClick={() => setIsSidebarOpen(true)} className="p-2 rounded-md text-gray-600 hover:bg-gray-200">
                            <MenuAlt2Icon className="w-6 h-6" />
                        </button>
                        <h2 className="text-lg font-bold ml-4">Admin Panel</h2>
                    </div>
                    {isRefreshing && (
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                            <span>Refreshing...</span>
                        </div>
                    )}
                </div>
                {/* Desktop refresh indicator */}
                <div className="hidden lg:flex justify-end mb-4">
                    {isRefreshing && (
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                            <span>Refreshing data...</span>
                        </div>
                    )}
                </div>
                <div className="flex-grow">
                    {renderPanel()}
                </div>
            </main>
        </div>
    );
};

// --- Panel Components ---

const DashboardHomePanel: React.FC<{ user: AdminUser; setActivePanel: (panel: AdminPanel) => void }> = ({ user, setActivePanel }) => {
    const [stats, setStats] = useState({
        totalBookings: 0,
        totalRevenue: 0,
        fleetUtilization: 0,
        newPartners: 0,
        pendingEnquiries: 0,
        pendingReviews: 0,
        bikeCount: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.admin.getDashboardStats()
            .then(setStats)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;
    }

    return (
        <div className="animate-fade-in">
            <h1 className="text-3xl font-bold text-text-body">Welcome back, {user.name}!</h1>
            <p className="text-gray-600 mt-1">Here's a quick overview of your business.</p>

            {/* Main Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mt-8">
                <Card className="p-6 text-center bg-green-600 text-white">
                    <div>
                        <div className="inline-block p-3 bg-white/20 rounded-full mb-2">
                            <CreditCardIcon className="w-6 h-6" />
                        </div>
                        <h3 className="text-3xl font-bold mb-1">₹{(stats.totalRevenue || 0).toLocaleString()}</h3>
                        <p className="text-sm">Total Revenue</p>
                    </div>
                </Card>
                <Card className="p-6 text-center bg-blue-600 text-white">
                    <div>
                        <div className="inline-block p-3 bg-white/20 rounded-full mb-2">
                            <ClipboardListIcon className="w-6 h-6" />
                        </div>
                        <h3 className="text-3xl font-bold mb-1">{stats.totalBookings}</h3>
                        <p className="text-sm">Total Bookings</p>
                    </div>
                </Card>
                <Card className="p-6 text-center bg-purple-600 text-white">
                    <div>
                        <div className="inline-block p-3 bg-white/20 rounded-full mb-2">
                            <ViewGridIcon className="w-6 h-6" />
                        </div>
                        <h3 className="text-3xl font-bold mb-1">{stats.bikeCount}</h3>
                        <p className="text-sm">Bikes in Fleet</p>
                    </div>
                </Card>
                <Card className="p-6 text-center bg-orange-600 text-white">
                    <div>
                        <div className="inline-block p-3 bg-white/20 rounded-full mb-2">
                            <ChartBarIcon className="w-6 h-6" />
                        </div>
                        <h3 className="text-3xl font-bold mb-1">{stats.fleetUtilization}%</h3>
                        <p className="text-sm">Fleet Utilization</p>
                    </div>
                </Card>
            </div>

            {/* Pending Items Row */}
            {/* Pending Items Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mt-6">
                <Card className="p-5 flex items-center justify-between border-l-4 border-yellow-500">
                    <div>
                        <p className="text-gray-600 text-sm font-medium">Pending Enquiries</p>
                        <h3 className="text-3xl font-bold text-yellow-600 mt-1">{stats.pendingEnquiries}</h3>
                    </div>
                    <div className="bg-yellow-100 p-4 rounded-full">
                        <MailIcon className="w-7 h-7 text-yellow-600" />
                    </div>
                </Card>
                <Card className="p-5 flex items-center justify-between border-l-4 border-blue-500">
                    <div>
                        <p className="text-gray-600 text-sm font-medium">Pending Reviews</p>
                        <h3 className="text-3xl font-bold text-blue-600 mt-1">{stats.pendingReviews}</h3>
                    </div>
                    <div className="bg-blue-100 p-4 rounded-full">
                        <StarIcon className="w-7 h-7 text-blue-600" />
                    </div>
                </Card>
                <Card className="p-5 flex items-center justify-between border-l-4 border-green-500">
                    <div>
                        <p className="text-gray-600 text-sm font-medium">New Applications</p>
                        <h3 className="text-3xl font-bold text-green-600 mt-1">{stats.newPartners}</h3>
                    </div>
                    <div className="bg-green-100 p-4 rounded-full">
                        <UsersIcon className="w-7 h-7 text-green-600" />
                    </div>
                </Card>
            </div>

            {/* Quick Actions */}
            <div className="mt-8">
                <Card className="p-6">
                    <h2 className="text-xl font-bold mb-4 text-text-body">Quick Actions</h2>
                    <div className="flex flex-wrap gap-4">
                        <button
                            onClick={() => setActivePanel('reports')}
                            className="bg-primary text-white font-semibold py-3 px-6 rounded-lg hover:bg-primary-light transition flex items-center gap-2"
                        >
                            <ChartBarIcon className="w-5 h-5" /> View Reports
                        </button>
                    </div>
                </Card>
            </div>
        </div>
    );
};

const BikeFormModal: React.FC<{ bike: Bike | null; onSave: (bikeData: Bike) => void; onClose: () => void }> = ({ bike, onSave, onClose }) => {
    const [formData, setFormData] = useState<Partial<Bike>>(bike || {
        name: '', type: 'Scooter', availability: 'Available', specs: { cc: '', transmission: 'Automatic' },
        price: { hour: 0, day: 0, week: 0, month: 0 }, deposit: 0,
        images: ['', '', ''], kmLimit: { hour: 0, day: 0, week: 0, month: 0 }, excessKmCharge: 0, minBookingDur: { hour: 0, day: 0 }
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        if (name.startsWith('price.')) {
            const key = name.split('.')[1] as keyof Bike['price'];
            setFormData(prev => ({ ...prev, price: { ...prev.price!, [key]: Number(value) } }));
        } else if (name.startsWith('specs.')) {
            const key = name.split('.')[1] as keyof Bike['specs'];
            setFormData(prev => ({ ...prev, specs: { ...prev.specs!, [key]: value } }));
        } else if (name.startsWith('images.')) {
            const index = Number(name.split('.')[1]);
            const newImages = [...(formData.images || ['', '', ''])];
            newImages[index] = value;
            setFormData(prev => ({ ...prev, images: newImages }));
        }
        else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData as Bike);
    };

    const inputClass = "w-full p-2 bg-white border border-input rounded-lg mt-1 focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-input-focus";

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-2xl flex flex-col">
                <form onSubmit={handleSubmit}>
                    <div className="p-6 border-b flex justify-between items-center">
                        <h2 className="text-xl font-bold">{bike ? 'Edit' : 'Add'} Bike</h2>
                        <button type="button" onClick={onClose}><XIcon className="w-6 h-6" /></button>
                    </div>
                    <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div><label>Name</label><input type="text" name="name" value={formData.name} onChange={handleChange} className={inputClass} /></div>
                            <div><label>Type</label><select name="type" value={formData.type} onChange={handleChange} className={`${inputClass} bg-white`}><option>Scooter</option><option>Geared</option><option>Electric</option><option>Superbike</option></select></div>
                            <div><label>CC / Range</label><input type="text" name="specs.cc" value={formData.specs?.cc} onChange={handleChange} className={inputClass} /></div>
                            <div><label>Transmission</label><select name="specs.transmission" value={formData.specs?.transmission} onChange={handleChange} className={`${inputClass} bg-white`}><option>Automatic</option><option>Manual</option></select></div>
                            <div><label>Day Rate (₹)</label><input type="number" name="price.day" value={formData.price?.day} onChange={handleChange} className={inputClass} /></div>
                            <div><label>Hour Rate (₹)</label><input type="number" name="price.hour" value={formData.price?.hour} onChange={handleChange} className={inputClass} /></div>
                            <div><label>Deposit (₹)</label><input type="number" name="deposit" value={formData.deposit} onChange={handleChange} className={inputClass} /></div>
                            <div><label>Availability</label><select name="availability" value={formData.availability} onChange={handleChange} className={`${inputClass} bg-white`}><option>Available</option><option>Limited</option><option>Coming Soon</option></select></div>
                        </div>
                        <div><label>Image URL 1</label><input type="text" name="images.0" value={formData.images?.[0]} onChange={handleChange} className={inputClass} /></div>
                        <div><label>Image URL 2</label><input type="text" name="images.1" value={formData.images?.[1]} onChange={handleChange} className={inputClass} /></div>
                        <div><label>Image URL 3</label><input type="text" name="images.2" value={formData.images?.[2]} onChange={handleChange} className={inputClass} /></div>
                    </div>
                    <div className="p-4 bg-gray-50 flex justify-end gap-4">
                        <button type="button" onClick={onClose} className="border border-gray-300 font-semibold py-2 px-4 rounded-lg">Cancel</button>
                        <button type="submit" className="bg-secondary text-white font-semibold py-2 px-4 rounded-lg">Save Bike</button>
                    </div>
                </form>
            </Card>
        </div>
    );
};

const BikeManagementPanel: React.FC<{ fleet: Bike[]; setFleet: React.Dispatch<React.SetStateAction<Bike[]>> }> = ({ fleet, setFleet }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBike, setEditingBike] = useState<Bike | null>(null);

    const handleAdd = () => { setEditingBike(null); setIsModalOpen(true); };
    const handleEdit = (bike: Bike) => { setEditingBike(bike); setIsModalOpen(true); };
    const handleDelete = async (id: number) => {
        if (window.confirm('Are you sure you want to delete this bike?')) {
            await api.admin.deleteBike(id);
            setFleet(currentFleet => currentFleet.filter(b => b.id !== id));
        }
    };
    const handleSave = async (bikeData: Bike) => {
        if (bikeData.id) {
            await api.admin.updateBike(bikeData.id, bikeData);
            setFleet(prev => prev.map(b => b.id === bikeData.id ? bikeData : b));
        } else {
            const response = await api.admin.createBike(bikeData);
            setFleet(prev => [...prev, { ...bikeData, id: response.id }]);
        }
        setIsModalOpen(false);
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold">Bike Fleet</h1>
                    <p className="text-gray-600 mt-1">Manage all bikes available for rent.</p>
                </div>
                <button onClick={handleAdd} className="bg-secondary text-white font-semibold py-2 px-4 rounded-lg flex items-center gap-2">
                    <PlusIcon className="w-5 h-5" /> Add Bike
                </button>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4">
                {fleet.map(bike => (
                    <Card key={bike.id} className="p-4 space-y-3">
                        <div className="flex justify-between items-start">
                            <div className="flex items-center">
                                <img className="h-12 w-16 object-cover rounded-md bg-gray-100" src={bike.images[0]} alt={bike.name} />
                                <div className="ml-4">
                                    <div className="font-medium text-text-body">{bike.name}</div>
                                    <div className="text-text-muted text-xs">{bike.specs.cc}</div>
                                </div>
                            </div>
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${bike.availability === 'Available' ? 'bg-green-100 text-green-800' :
                                bike.availability === 'Limited' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'
                                }`}>{bike.availability}</span>
                        </div>
                        <div className="border-t border-card pt-2 space-y-1 text-sm">
                            <div className="flex justify-between"><span className="text-text-muted">Type:</span><span className="font-medium text-text-body">{bike.type}</span></div>
                            <div className="flex justify-between"><span className="text-text-muted">Rate (Day):</span><span className="font-medium text-text-body">₹{bike.price.day}</span></div>
                            <div className="flex justify-between"><span className="text-text-muted">Deposit:</span><span className="font-medium text-text-body">₹{bike.deposit}</span></div>
                        </div>
                        <div className="pt-2 border-t border-card flex justify-end gap-4">
                            <button onClick={() => handleEdit(bike)} className="text-primary hover:underline font-medium text-sm">Edit</button>
                            <button onClick={() => handleDelete(bike.id)} className="text-error hover:underline font-medium text-sm">Delete</button>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block">
                <Card className="overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm divide-y divide-card">
                            <thead className="bg-gray-50/50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">Bike</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">Type</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">Rates</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">Deposit</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">Status</th>
                                    <th scope="col" className="px-6 py-3 text-right text-xs font-semibold text-text-muted uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-card">
                                {fleet.map(bike => (
                                    <tr key={bike.id}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-12 w-16">
                                                    <img className="h-12 w-16 object-cover rounded-md bg-gray-100" src={bike.images[0]} alt={bike.name} />
                                                </div>
                                                <div className="ml-4">
                                                    <div className="font-medium text-text-body">{bike.name}</div>
                                                    <div className="text-text-muted text-xs">{bike.specs.cc}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-text-muted">{bike.type}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-text-body font-medium">₹{bike.price.day} / day</div>
                                            <div className="text-text-muted text-xs">₹{bike.price.hour} / hr</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-text-muted">₹{bike.deposit}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${bike.availability === 'Available' ? 'bg-green-100 text-green-800' :
                                                bike.availability === 'Limited' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'
                                                }`}>{bike.availability}</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right font-medium space-x-4">
                                            <button onClick={() => handleEdit(bike)} className="text-primary hover:underline">Edit</button>
                                            <button onClick={() => handleDelete(bike.id)} className="text-error hover:underline">Delete</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>
            {isModalOpen && <BikeFormModal bike={editingBike} onSave={handleSave} onClose={() => setIsModalOpen(false)} />}
        </div>
    );
};

const LocationFormModal: React.FC<{ locationName: string | null, onSave: (name: string, originalName?: string) => void, onClose: () => void }> = ({ locationName, onSave, onClose }) => {
    const [name, setName] = useState(locationName || '');
    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-md">
                <form onSubmit={(e) => { e.preventDefault(); onSave(name, locationName || undefined); }}>
                    <div className="p-6 border-b flex justify-between items-center"><h2 className="text-xl font-bold">{locationName ? 'Edit' : 'Add'} Location</h2><button type="button" onClick={onClose}><XIcon className="w-6 h-6" /></button></div>
                    <div className="p-6"><label>Location Name</label><input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full p-2 bg-white border border-input rounded-lg mt-1 focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-input-focus" /></div>
                    <div className="p-4 bg-gray-50 flex justify-end gap-4"><button type="button" onClick={onClose} className="border border-gray-300 font-semibold py-2 px-4 rounded-lg">Cancel</button><button type="submit" className="bg-secondary text-white font-semibold py-2 px-4 rounded-lg">Save</button></div>
                </form>
            </Card>
        </div>
    )
}

const LocationManagementPanel: React.FC<{ locations: string[]; setLocations: React.Dispatch<React.SetStateAction<string[]>> }> = ({ locations, setLocations }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingLocation, setEditingLocation] = useState<string | null>(null);

    const handleAdd = () => { setEditingLocation(null); setIsModalOpen(true); };
    const handleEdit = (loc: string) => { setEditingLocation(loc); setIsModalOpen(true); };
    const handleDelete = async (loc: string) => {
        if (window.confirm('Are you sure you want to delete this location?')) {
            await api.admin.deleteLocation(loc);
            setLocations(currentLocations => currentLocations.filter(l => l !== loc));
        }
    };
    const handleSave = async (newName: string, originalName?: string) => {
        if (originalName) {
            await api.admin.updateLocation(originalName, newName);
            setLocations(prev => prev.map(l => l === originalName ? newName : l));
        } else {
            await api.admin.createLocation(newName);
            setLocations(prev => [...prev, newName]);
        }
        setIsModalOpen(false);
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold">Pickup Locations</h1>
                    <p className="text-gray-600 mt-1">Manage pickup and drop-off points.</p>
                </div>
                <button onClick={handleAdd} className="bg-secondary text-white font-semibold py-2 px-4 rounded-lg flex items-center gap-2"><PlusIcon className="w-5 h-5" /> Add Location</button>
            </div>
            <Card className="p-6">
                <ul className="space-y-3">
                    {locations.map(location => (
                        <li key={location} className="flex justify-between items-center p-3 bg-accent rounded-lg">
                            <span className="font-medium">{location}</span>
                            <div className="space-x-4">
                                <button onClick={() => handleEdit(location)} className="text-primary hover:underline text-sm font-medium">Edit</button>
                                <button onClick={() => handleDelete(location)} className="text-error hover:underline text-sm font-medium">Delete</button>
                            </div>
                        </li>
                    ))}
                </ul>
            </Card>
            {isModalOpen && <LocationFormModal locationName={editingLocation} onSave={handleSave} onClose={() => setIsModalOpen(false)} />}
        </div>
    );
};

const OfferFormModal: React.FC<{ offer: Partial<Offer> | null, onSave: (offer: Offer) => void, onClose: () => void }> = ({ offer, onSave, onClose }) => {
    const [formData, setFormData] = useState<Partial<Offer>>(offer || { status: 'Active', usageLimitPerUser: 1, type: 'seasonal' });
    const inputClass = "w-full p-2 bg-white border border-input rounded-lg mt-1 focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-input-focus";

    useEffect(() => {
        setFormData(offer || { status: 'Active', usageLimitPerUser: 1, type: 'seasonal', title: '', code: '' });
    }, [offer]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData as Offer);
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-lg">
                <form onSubmit={handleSubmit}>
                    <div className="p-6 border-b flex justify-between items-center">
                        <h2 className="text-xl font-bold">{offer?.id ? 'Edit' : 'Add'} Offer</h2>
                        <button type="button" onClick={onClose}><XIcon className="w-6 h-6" /></button>
                    </div>
                    <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                        <div><label>Title</label><input type="text" name="title" value={formData.title || ''} onChange={handleChange} className={inputClass} /></div>
                        <div><label>Code</label><input type="text" name="code" value={formData.code || ''} onChange={handleChange} className={inputClass} /></div>
                        <div className="grid grid-cols-2 gap-4">
                            <div><label>Discount %</label><input type="number" name="discountPercent" value={formData.discountPercent || ''} onChange={handleChange} className={inputClass} /></div>
                            <div><label>Flat Amount (₹)</label><input type="number" name="flatAmount" value={formData.flatAmount || ''} onChange={handleChange} className={inputClass} /></div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div><label>Status</label><select name="status" value={formData.status} onChange={handleChange} className={`${inputClass} bg-white`}><option value="Active">Active</option><option value="Disabled">Disabled</option></select></div>
                            <div><label>Usage Limit/User</label><input type="number" name="usageLimitPerUser" value={formData.usageLimitPerUser || 1} onChange={handleChange} className={inputClass} /></div>
                        </div>
                    </div>
                    <div className="p-4 bg-gray-50 flex justify-end gap-4">
                        <button type="button" onClick={onClose} className="border border-gray-300 font-semibold py-2 px-4 rounded-lg">Cancel</button>
                        <button type="submit" className="bg-secondary text-white font-semibold py-2 px-4 rounded-lg">Save Offer</button>
                    </div>
                </form>
            </Card>
        </div>
    )
};

const OfferManagementPanel: React.FC<{ offers: Offer[]; setOffers: React.Dispatch<React.SetStateAction<Offer[]>> }> = ({ offers, setOffers }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingOffer, setEditingOffer] = useState<Offer | null>(null);

    const handleAdd = () => { setEditingOffer(null); setIsModalOpen(true); };
    const handleEdit = (offer: Offer) => { setEditingOffer(offer); setIsModalOpen(true); };
    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this offer?')) {
            await api.admin.deleteOffer(id);
            setOffers(currentOffers => currentOffers.filter(o => o.id !== id));
        }
    };
    const handleSave = async (offer: Offer) => {
        if (offer.id) {
            await api.admin.updateOffer(offer.id, offer);
            setOffers(prev => prev.map(o => o.id === offer.id ? offer : o));
        } else {
            const newId = `o${Date.now()}`;
            const newOffer = { ...offer, id: newId, totalUses: 0, descriptionBullets: [], imagePlaceholder: 'https://picsum.photos/seed/new-offer/600/400', applicableCities: ['All'] };
            await api.admin.createOffer(newOffer);
            setOffers(prev => [...prev, newOffer]);
        }
        setIsModalOpen(false);
    };
    const handleToggleStatus = async (id: string) => {
        const offer = offers.find(o => o.id === id);
        if (offer) {
            const newStatus = offer.status === 'Active' ? 'Disabled' : 'Active';
            await api.admin.updateOffer(id, { ...offer, status: newStatus });
            setOffers(prev => prev.map(o => o.id === id ? { ...o, status: newStatus } : o));
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold">Offers & Coupons</h1>
                    <p className="text-gray-600 mt-1">Create and manage discounts.</p>
                </div>
                <button onClick={handleAdd} className="bg-secondary text-white font-semibold py-2 px-4 rounded-lg flex items-center gap-2">
                    <PlusIcon className="w-5 h-5" /> Add Offer
                </button>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4">
                {offers.map(offer => (
                    <Card key={offer.id} className="p-4 space-y-3">
                        <div className="flex justify-between items-start">
                            <div className="font-medium text-text-body pr-4">{offer.title}</div>
                            <button onClick={() => handleToggleStatus(offer.id)} className={`flex-shrink-0 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${offer.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                {offer.status}
                            </button>
                        </div>
                        <div className="border-t border-card pt-2 space-y-1 text-sm">
                            <div className="flex justify-between"><span className="text-text-muted">Code:</span><span className="font-mono text-secondary">{offer.code || 'N/A'}</span></div>
                            <div className="flex justify-between"><span className="text-text-muted">Discount:</span><span className="font-semibold text-text-body">{offer.discountPercent ? `${offer.discountPercent}% OFF` : offer.flatAmount ? `₹${offer.flatAmount} OFF` : '—'}</span></div>
                            <div className="flex justify-between"><span className="text-text-muted">Total Uses:</span><span className="font-medium text-text-body">{offer.totalUses}</span></div>
                        </div>
                        <div className="pt-2 border-t border-card flex justify-end gap-4">
                            <button onClick={() => handleEdit(offer)} className="text-primary hover:underline font-medium text-sm">Edit</button>
                            <button onClick={() => handleDelete(offer.id)} className="text-error hover:underline font-medium text-sm">Delete</button>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block">
                <Card className="overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50/50">
                                <tr >
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">Title</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">Code</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">Discount</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">Total Uses</th>
                                    <th className="px-6 py-3 text-right text-xs font-semibold text-text-muted uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-card">
                                {offers.map(offer => (
                                    <tr key={offer.id}>
                                        <td className="px-6 py-4 whitespace-nowrap font-medium text-text-body">{offer.title}</td>
                                        <td className="px-6 py-4 whitespace-nowrap font-mono text-secondary">{offer.code || 'N/A'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap font-semibold text-text-body">
                                            {offer.discountPercent ? `${offer.discountPercent}% OFF` : offer.flatAmount ? `₹${offer.flatAmount} OFF` : '—'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <button onClick={() => handleToggleStatus(offer.id)} className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${offer.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                                {offer.status}
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-text-muted">{offer.totalUses}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right font-medium space-x-4">
                                            <button onClick={() => handleEdit(offer)} className="text-primary hover:underline">Edit</button>
                                            <button onClick={() => handleDelete(offer.id)} className="text-error hover:underline">Delete</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>
            {isModalOpen && <OfferFormModal offer={editingOffer} onSave={handleSave} onClose={() => setIsModalOpen(false)} />}
        </div>
    );
};

const EnquiryManagementPanel: React.FC<{ enquiries: Enquiry[]; setEnquiries: React.Dispatch<React.SetStateAction<Enquiry[]>> }> = ({ enquiries, setEnquiries }) => {
    const [viewingEnquiry, setViewingEnquiry] = useState<Enquiry | null>(null);

    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this enquiry?')) {
            await api.admin.deleteEnquiry(id);
            setEnquiries(currentEnquiries => currentEnquiries.filter(e => e.id !== id));
        }
    };

    return (
        <div>
            <h1 className="text-3xl font-bold">Enquiries</h1>
            <p className="text-gray-600 mt-1">View messages from customers.</p>

            {/* Mobile Card View */}
            <div className="md:hidden mt-8 bg-white rounded-lg shadow-sm overflow-hidden">
                <ul className="divide-y divide-gray-200">
                    {enquiries.map(enquiry => (
                        <li key={enquiry.id} className="p-4">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="font-semibold text-primary">{enquiry.name}</p>
                                    <p className="text-sm text-gray-500">{enquiry.email}</p>
                                </div>
                                <span className={`flex-shrink-0 px-2 py-1 text-xs font-semibold rounded-full ${enquiry.status === 'New' ? 'bg-blue-100 text-blue-800' :
                                    enquiry.status === 'Read' ? 'bg-gray-100 text-gray-800' : 'bg-green-100 text-green-800'
                                    }`}>{enquiry.status}</span>
                            </div>
                            <p className="text-sm text-gray-600 mt-2 pt-2 border-t border-gray-100 truncate">{enquiry.message}</p>
                            <div className="mt-3 flex justify-end gap-4">
                                <button onClick={() => setViewingEnquiry(enquiry)} className="text-primary hover:underline font-medium text-sm">View</button>
                                <button onClick={() => handleDelete(enquiry.id)} className="text-error hover:underline font-medium text-sm">Delete</button>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>


            {/* Desktop Table View */}
            <div className="hidden md:block mt-8">
                <Card className="overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50/50">
                                <tr >
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">From</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">Message</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-right text-xs font-semibold text-text-muted uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-card">
                                {enquiries.map(enquiry => (
                                    <tr key={enquiry.id}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="font-medium">{enquiry.name}</div>
                                            <div className="text-text-muted text-xs">{enquiry.email}</div>
                                        </td>
                                        <td className="px-6 py-4 max-w-sm text-text-muted truncate">
                                            {enquiry.message}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${enquiry.status === 'New' ? 'bg-blue-100 text-blue-800' :
                                                enquiry.status === 'Read' ? 'bg-gray-100 text-gray-800' : 'bg-green-100 text-green-800'
                                                }`}>{enquiry.status}</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right font-medium space-x-4">
                                            <button onClick={() => setViewingEnquiry(enquiry)} className="text-primary hover:underline">View</button>
                                            <button onClick={() => handleDelete(enquiry.id)} className="text-error hover:underline">Delete</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>

            {viewingEnquiry && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
                    <Card className="w-full max-w-lg">
                        <div className="p-6 border-b flex justify-between items-center"><h2 className="text-xl font-bold">Enquiry from {viewingEnquiry.name}</h2><button onClick={() => setViewingEnquiry(null)}><XIcon className="w-6 h-6" /></button></div>
                        <div className="p-6 space-y-2">
                            <p><strong>Email:</strong> {viewingEnquiry.email}</p>
                            <p><strong>Phone:</strong> {viewingEnquiry.phone}</p>
                            <p className="pt-2"><strong>Message:</strong></p>
                            <p className="bg-accent p-3 rounded-md">{viewingEnquiry.message}</p>
                        </div>
                        <div className="p-4 bg-gray-50 flex justify-end"><button onClick={() => setViewingEnquiry(null)} className="border border-gray-300 font-semibold py-2 px-4 rounded-lg">Close</button></div>
                    </Card>
                </div>
            )}
        </div>
    );
};

const ReviewManagementPanel: React.FC<{ reviews: Review[]; setReviews: React.Dispatch<React.SetStateAction<Review[]>> }> = ({ reviews, setReviews }) => {

    const handleStatusChange = async (id: string, status: Review['status']) => {
        await api.admin.updateReview(id, { status });
        setReviews(prev => prev.map(r => r.id === id ? { ...r, status } : r));
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to permanently delete this review?')) {
            await api.admin.deleteReview(id);
            setReviews(currentReviews => currentReviews.filter(r => r.id !== id));
        }
    };

    const handleBlockUser = (userId?: string) => {
        if (!userId) {
            alert('Cannot block user: No User ID associated.');
            return;
        }
        if (window.confirm(`Are you sure you want to block this user (ID: ${userId})? This will delete all their reviews.`)) {
            // In a real app, you'd add the user ID to a blocklist.
            // Here, we'll just remove all their reviews for simulation.
            setReviews(currentReviews => currentReviews.filter(r => r.userId !== userId));
            alert(`User ${userId} blocked and their reviews have been removed.`);
        }
    };

    const getStatusColor = (status: Review['status']) => {
        switch (status) {
            case 'Approved': return 'bg-green-100 text-green-800';
            case 'Rejected': return 'bg-red-100 text-red-800';
            case 'Pending':
            default: return 'bg-yellow-100 text-yellow-800';
        }
    };

    return (
        <div>
            <h1 className="text-3xl font-bold">Review Management</h1>
            <p className="text-gray-600 mt-1">Approve, reject, or delete customer feedback.</p>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4 mt-8">
                {reviews.map(review => (
                    <Card key={review.id} className="p-4 space-y-3">
                        <div className="flex justify-between items-start">
                            <div>
                                <div className="font-medium text-text-body">{review.name}</div>
                                <div className="flex items-center text-sm">
                                    {review.rating} <StarIcon className="w-4 h-4 text-yellow-400 ml-1" />
                                </div>
                            </div>
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(review.status)}`}>
                                {review.status}
                            </span>
                        </div>
                        <p className="text-sm text-text-muted pt-2 border-t border-card">{review.text}</p>
                        <div className="pt-2 border-t border-card flex flex-wrap justify-end gap-x-4 gap-y-2">
                            {review.status !== 'Approved' && <button onClick={() => handleStatusChange(review.id, 'Approved')} className="text-green-600 hover:underline font-medium text-sm">Approve</button>}
                            {review.status !== 'Rejected' && <button onClick={() => handleStatusChange(review.id, 'Rejected')} className="text-yellow-600 hover:underline font-medium text-sm">Reject</button>}
                            <button onClick={() => handleDelete(review.id)} className="text-error hover:underline font-medium text-sm">Delete</button>
                            <button onClick={() => handleBlockUser(review.userId)} className="text-error hover:underline font-medium text-sm">Block User</button>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block mt-8">
                <Card className="overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50/50">
                                <tr >
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">Reviewer</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">Review</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">Rating</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-right text-xs font-semibold text-text-muted uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-card">
                                {reviews.map(review => (
                                    <tr key={review.id}>
                                        <td className="px-6 py-4 whitespace-nowrap font-medium text-text-body">{review.name}</td>
                                        <td className="px-6 py-4 max-w-sm text-text-muted truncate">
                                            {review.text}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                {review.rating} <StarIcon className="w-4 h-4 text-yellow-400 ml-1" />
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(review.status)}`}>
                                                {review.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right font-medium space-x-2">
                                            {review.status !== 'Approved' && <button onClick={() => handleStatusChange(review.id, 'Approved')} className="text-green-600 hover:underline">Approve</button>}
                                            {review.status !== 'Rejected' && <button onClick={() => handleStatusChange(review.id, 'Rejected')} className="text-yellow-600 hover:underline">Reject</button>}
                                            <button onClick={() => handleDelete(review.id)} className="text-error hover:underline">Delete</button>
                                            <button onClick={() => handleBlockUser(review.userId)} className="text-error hover:underline">Block User</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>
        </div>
    );
};


const ContentManagementPanel: React.FC<{ siteContent: SiteContent, setSiteContent: React.Dispatch<React.SetStateAction<SiteContent>> }> = ({ siteContent, setSiteContent }) => {
    const [content, setContent] = useState(siteContent);

    useEffect(() => {
        setContent(siteContent);
    }, [siteContent]);

    const handleSave = async () => {
        await api.admin.updateSiteContent(content);
        setSiteContent(content);
        alert('Content Saved!');
    };

    const handleHomeChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setContent(prev => ({ ...prev, home: { ...prev.home, [name]: value } }));
    };

    return (
        <div>
            <h1 className="text-3xl font-bold">Content Management</h1>
            <p className="text-gray-600 mt-1">Edit the text content for various pages on your site.</p>
            <Card className="mt-8 p-6">
                <div className="space-y-4">
                    <div>
                        <label htmlFor="content-title" className="block text-sm font-medium mb-1">Home Page Hero Title Template</label>
                        <input type="text" id="content-title" name="heroTitleTemplate" value={content.home.heroTitleTemplate} onChange={handleHomeChange} className="w-full p-3 bg-white border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-input-focus" />
                        <p className="text-xs text-gray-500 mt-1">Use `[city]` as a placeholder for the city name.</p>
                    </div>
                    <div>
                        <label htmlFor="content-subtitle" className="block text-sm font-medium mb-1">Home Page Hero Subtitle</label>
                        <textarea id="content-subtitle" name="heroSubtitle" rows={3} value={content.home.heroSubtitle} onChange={handleHomeChange} className="w-full p-3 bg-white border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-input-focus" />
                    </div>
                </div>
                <div className="mt-6 text-right">
                    <button onClick={handleSave} className="bg-secondary text-white font-bold py-2 px-6 rounded-lg">Save Changes</button>
                </div>
            </Card>
        </div>
    );
};

const UserFormModal: React.FC<{ user: Partial<AdminUser> | null; onSave: (userData: AdminUser) => void; onClose: () => void }> = ({ user, onSave, onClose }) => {
    const [formData, setFormData] = useState<Partial<AdminUser>>(user || { name: '', email: '', role: adminRoles.supportStaff });
    const inputClass = "w-full p-2 bg-white border border-input rounded-lg mt-1 focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-input-focus";

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        if (name === "role") {
            const roleKey = Object.keys(adminRoles).find(key => adminRoles[key].name === value) || 'supportStaff';
            setFormData(prev => ({ ...prev, role: adminRoles[roleKey] }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData as AdminUser);
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-lg">
                <form onSubmit={handleSubmit}>
                    <div className="p-6 border-b flex justify-between items-center"><h2 className="text-xl font-bold">{user?.id ? 'Edit' : 'Add'} User</h2><button type="button" onClick={onClose}><XIcon className="w-6 h-6" /></button></div>
                    <div className="p-6 space-y-4">
                        <div><label>Full Name</label><input type="text" name="name" value={formData.name} onChange={handleChange} className={inputClass} /></div>
                        <div><label>Email</label><input type="email" name="email" value={formData.email} onChange={handleChange} className={inputClass} /></div>
                        <div><label>Password</label><input type="password" name="passwordHash" placeholder={user?.id ? "Enter new password to change" : "Enter password"} onChange={handleChange} className={inputClass} /></div>
                        <div><label>Role</label><select name="role" value={formData.role?.name} onChange={handleChange} className={`${inputClass} bg-white`}>{Object.values(adminRoles).map(r => <option key={r.id}>{r.name}</option>)}</select></div>
                    </div>
                    <div className="p-4 bg-gray-50 flex justify-end gap-4"><button type="button" onClick={onClose} className="border border-gray-300 font-semibold py-2 px-4 rounded-lg">Cancel</button><button type="submit" className="bg-secondary text-white font-semibold py-2 px-4 rounded-lg">Save User</button></div>
                </form>
            </Card>
        </div>
    );
};


const UserManagementPanel: React.FC<{ adminUsers: AdminUser[]; setAdminUsers: React.Dispatch<React.SetStateAction<AdminUser[]>> }> = ({ adminUsers, setAdminUsers }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<AdminUser | null>(null);

    const handleAdd = () => { setEditingUser(null); setIsModalOpen(true); };
    const handleEdit = (user: AdminUser) => { setEditingUser(user); setIsModalOpen(true); };
    const handleDelete = (id: string) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            setAdminUsers(currentUsers => currentUsers.filter(u => u.id !== id));
        }
    };
    const handleSave = async (user: AdminUser) => {
        try {
            if (user.id) {
                // Update role? We don't have update user endpoint yet fully fleshed out for name/email change in auth
                // But we can update role?
                // For now, let's just handle password reset if provided
                if (user.passwordHash) {
                    await api.admin.resetUserPassword(user.user_id || user.id, user.passwordHash); // passwordHash field here holds plain text new password
                    alert('Password updated successfully');
                }

                // Refresh list
                const users = await api.admin.getAdminUsers();
                setAdminUsers(users);
            } else {
                // Create New
                const res = await api.admin.createAdminUser({
                    email: user.email,
                    password: user.passwordHash, // temporary holding plain password
                    name: user.name,
                    role: user.role.name
                });

                // Refresh list
                const users = await api.admin.getAdminUsers();
                setAdminUsers(users);
            }
            setIsModalOpen(false);
        } catch (err: any) {
            alert('Operation failed: ' + (err.message || 'Unknown error'));
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold">Users & Roles</h1>
                    <p className="text-gray-600 mt-1">Manage administrators and their permissions.</p>
                </div>
                <button onClick={handleAdd} className="bg-secondary text-white font-semibold py-2 px-4 rounded-lg flex items-center gap-2"><PlusIcon className="w-5 h-5" /> Add New User</button>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4 mt-8">
                {adminUsers.map(u => (
                    <Card key={u.id} className="p-4 space-y-3">
                        <div className="flex justify-between items-start">
                            <div>
                                <div className="text-text-body font-medium">{u.name}</div>
                                <div className="text-text-muted text-sm">{u.email}</div>
                            </div>
                            <span className="bg-primary/10 text-primary px-2 py-1 rounded-full text-xs font-medium">{u.role.name}</span>
                        </div>
                        <div className="pt-2 border-t border-card flex justify-end gap-4">
                            <button onClick={() => handleEdit(u)} className="text-primary hover:underline font-medium text-sm">Edit</button>
                            <button onClick={() => handleDelete(u.id)} className="text-error hover:underline font-medium text-sm">Delete</button>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block mt-8">
                <Card className="overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50/50">
                                <tr >
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">Name</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">Email</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">Role</th>
                                    <th scope="col" className="px-6 py-3 text-right text-xs font-semibold text-text-muted uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-card">
                                {adminUsers.map(u => (
                                    <tr key={u.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-text-body font-medium">{u.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-text-muted">{u.email}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="bg-primary/10 text-primary px-2 py-1 rounded-full text-xs font-medium">{u.role.name}</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right font-medium space-x-4">
                                            <button onClick={() => handleEdit(u)} className="text-primary hover:underline">Edit</button>
                                            <button onClick={() => handleDelete(u.id)} className="text-error hover:underline">Delete</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>
            {isModalOpen && <UserFormModal user={editingUser} onSave={handleSave} onClose={() => setIsModalOpen(false)} />}
        </div>
    )
};


const SiteSettingsPanel: React.FC<{ siteContent: SiteContent, setSiteContent: React.Dispatch<React.SetStateAction<SiteContent>> }> = ({ siteContent, setSiteContent }) => {
    const [settings, setSettings] = useState(siteContent.contact);

    useEffect(() => {
        setSettings(siteContent.contact);
    }, [siteContent]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSettings(prev => ({ ...prev, [e.target.name]: e.target.value }));
    }

    const handleSave = () => {
        setSiteContent(prev => ({ ...prev, contact: settings }));
        alert('Settings Saved!');
    }

    return (
        <div>
            <h1 className="text-3xl font-bold">Site Settings</h1>
            <p className="text-gray-600 mt-1">Update global site information.</p>
            <Card className="mt-8 p-6 space-y-6">
                <div>
                    <h3 className="text-lg font-semibold mb-2">Contact Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="contact-email" className="block text-sm font-medium mb-1">Support Email</label>
                            <input type="email" id="contact-email" name="email" value={settings.email} onChange={handleChange} className="w-full p-3 bg-white border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-input-focus" />
                        </div>
                        <div>
                            <label htmlFor="contact-phone" className="block text-sm font-medium mb-1">Support Phone</label>
                            <input type="tel" id="contact-phone" name="phone" value={settings.phone} onChange={handleChange} className="w-full p-3 bg-white border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-input-focus" />
                        </div>
                    </div>
                </div>
                <div>
                    <h3 className="text-lg font-semibold mb-2">Branding</h3>
                    <div>
                        <label htmlFor="logo-upload" className="block text-sm font-medium mb-1">Upload New Logo</label>
                        <input type="file" id="logo-upload" className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20" />
                        <p className="text-xs text-gray-500 mt-1">Recommended format: SVG or PNG. Max size: 1MB.</p>
                    </div>
                </div>
                <div className="mt-6 text-right border-t pt-6">
                    <button onClick={handleSave} className="bg-secondary text-white font-bold py-2 px-6 rounded-lg">Save Settings</button>
                </div>
            </Card>
        </div>
    );
};

const EmployeeFormModal: React.FC<{ employee: Employee | null; onSave: (employeeData: Employee) => void; onClose: () => void }> = ({ employee, onSave, onClose }) => {
    const [formData, setFormData] = useState<Partial<Employee>>(employee || { name: '', email: '', role: 'Support', status: 'Active' });
    const inputClass = "w-full p-2 bg-white border border-input rounded-lg mt-1 focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-input-focus";

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData as Employee);
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-lg">
                <form onSubmit={handleSubmit}>
                    <div className="p-6 border-b flex justify-between items-center"><h2 className="text-xl font-bold">{employee ? 'Edit' : 'Add'} Employee</h2><button type="button" onClick={onClose}><XIcon className="w-6 h-6" /></button></div>
                    <div className="p-6 space-y-4">
                        <div><label>Full Name</label><input type="text" name="name" value={formData.name} onChange={handleChange} className={inputClass} /></div>
                        <div><label>Email</label><input type="email" name="email" value={formData.email} onChange={handleChange} className={inputClass} /></div>
                        <div className="grid grid-cols-2 gap-4">
                            <div><label>Role</label><select name="role" value={formData.role} onChange={handleChange} className={`${inputClass} bg-white`}><option>Operations</option><option>Support</option><option>Marketing</option><option>Tech</option></select></div>
                            <div><label>Status</label><select name="status" value={formData.status} onChange={handleChange} className={`${inputClass} bg-white`}><option>Active</option><option>Inactive</option></select></div>
                        </div>
                    </div>
                    <div className="p-4 bg-gray-50 flex justify-end gap-4"><button type="button" onClick={onClose} className="border border-gray-300 font-semibold py-2 px-4 rounded-lg">Cancel</button><button type="submit" className="bg-secondary text-white font-semibold py-2 px-4 rounded-lg">Save</button></div>
                </form>
            </Card>
        </div>
    );
};

const EmployeesPanel: React.FC<{ employees: Employee[]; setEmployees: React.Dispatch<React.SetStateAction<Employee[]>> }> = ({ employees, setEmployees }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

    const handleAdd = () => { setEditingEmployee(null); setIsModalOpen(true); };
    const handleEdit = (emp: Employee) => { setEditingEmployee(emp); setIsModalOpen(true); };
    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this employee?')) {
            await api.admin.deleteEmployee(id);
            setEmployees(currentEmployees => currentEmployees.filter(e => e.id !== id));
        }
    };
    const handleSave = async (employee: Employee) => {
        if (employee.id) {
            await api.admin.updateEmployee(employee.id, employee);
            setEmployees(prev => prev.map(e => e.id === employee.id ? employee : e));
        } else {
            const newId = `e${Date.now()}`;
            const newEmployee = { ...employee, id: newId };
            await api.admin.createEmployee(newEmployee);
            setEmployees(prev => [...prev, newEmployee]);
        }
        setIsModalOpen(false);
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold">Employee Management</h1>
                    <p className="text-gray-600 mt-1">Add, edit, and manage employee profiles and access levels.</p>
                </div>
                <button onClick={handleAdd} className="bg-secondary text-white font-semibold py-2 px-4 rounded-lg flex items-center gap-2"><PlusIcon className="w-5 h-5" /> Add Employee</button>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4 mt-8">
                {employees.map(employee => (
                    <Card key={employee.id} className="p-4 space-y-3">
                        <div className="flex justify-between items-start">
                            <div>
                                <div className="text-text-body font-medium">{employee.name}</div>
                                <div className="text-text-muted text-sm">{employee.email}</div>
                            </div>
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${employee.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                {employee.status}
                            </span>
                        </div>
                        <div className="text-sm pt-2 border-t border-card">
                            <span className="text-text-muted">Role: </span>
                            <span className="font-medium text-text-body">{employee.role}</span>
                        </div>
                        <div className="pt-2 border-t border-card flex justify-end gap-4">
                            <button onClick={() => handleEdit(employee)} className="text-primary hover:underline font-medium text-sm">Edit</button>
                            <button onClick={() => handleDelete(employee.id)} className="text-error hover:underline font-medium text-sm">Delete</button>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block mt-8">
                <Card className="overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50/50">
                                <tr >
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">Name</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">Email</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">Role</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">Status</th>
                                    <th scope="col" className="px-6 py-3 text-right text-xs font-semibold text-text-muted uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-card">
                                {employees.map(employee => (
                                    <tr key={employee.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-text-body font-medium">{employee.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-text-muted">{employee.email}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-text-muted">{employee.role}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${employee.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                }`}>
                                                {employee.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right font-medium space-x-4">
                                            <button onClick={() => handleEdit(employee)} className="text-primary hover:underline">Edit</button>
                                            <button onClick={() => handleDelete(employee.id)} className="text-error hover:underline">Delete</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>
            {isModalOpen && <EmployeeFormModal employee={editingEmployee} onSave={handleSave} onClose={() => setIsModalOpen(false)} />}
        </div>
    );
};

const ApplicationsPanel: React.FC<{ applications: Application[], setApplications: React.Dispatch<React.SetStateAction<Application[]>> }> = ({ applications, setApplications }) => {

    const handleStatusChange = async (id: string, newStatus: Application['status']) => {
        await api.admin.updateApplication(id, newStatus);
        setApplications(prev => prev.map(app => app.id === id ? { ...app, status: newStatus } : app));
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this application? This action cannot be undone.')) {
            try {
                await api.admin.deleteApplication(id);
                setApplications(prev => prev.filter(app => app.id !== id));
            } catch (error) {
                console.error('Failed to delete application:', error);
                alert('Failed to delete application');
            }
        }
    };

    const handleDownloadResume = (app: Application) => {
        const link = document.createElement('a');
        link.href = app.resumeFileContent; // Assumes base64 data URL
        link.download = app.resumeFileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const getStatusColor = (status: Application['status']) => {
        switch (status) {
            case 'Hired': return 'bg-green-100 text-green-800';
            case 'Interviewing': return 'bg-blue-100 text-blue-800';
            case 'Under Review': return 'bg-purple-100 text-purple-800';
            case 'Rejected': return 'bg-red-100 text-red-800';
            case 'New': default: return 'bg-yellow-100 text-yellow-800';
        }
    };

    return (
        <div>
            <h1 className="text-3xl font-bold">Job Applications</h1>
            <p className="text-gray-600 mt-1">Review and manage candidate applications.</p>

            <div className="mt-8">
                <Card className="overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50/50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">Applicant</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">Position</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">Submitted</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-right text-xs font-semibold text-text-muted uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-card">
                                {applications.map(app => (
                                    <tr key={app.id}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="font-medium text-text-body">{app.applicantName}</div>
                                            <div className="text-text-muted text-xs">{app.applicantEmail}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-text-muted">{app.job.title}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-text-muted">{new Date(app.submittedAt).toLocaleDateString()}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <select
                                                value={app.status}
                                                onChange={(e) => handleStatusChange(app.id, e.target.value as Application['status'])}
                                                className={`p-1 rounded-md text-xs border-gray-300 focus:outline-none focus:ring-2 focus:ring-secondary/50 ${getStatusColor(app.status).replace('bg-', 'bg-opacity-50 border-2 border-')}`}
                                                style={{ backgroundColor: 'transparent' }}
                                            >
                                                <option>New</option>
                                                <option>Under Review</option>
                                                <option>Interviewing</option>
                                                <option>Hired</option>
                                                <option>Rejected</option>
                                            </select>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right font-medium space-x-4">
                                            <button onClick={() => handleDownloadResume(app)} className="text-primary hover:underline inline-flex items-center gap-1"><DocumentDownloadIcon className="w-4 h-4" /> Resume</button>
                                            <button onClick={() => handleDelete(app.id)} className="text-error hover:underline"><TrashIcon className="w-4 h-4 inline-block -mt-1" /> Delete</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>
        </div>
    );
};


export default AdminDashboard;
