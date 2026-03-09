import React, { useState, useEffect } from 'react';
import { type AdminUser, type Bike, type BikeUnit, type Offer, type Enquiry, AvailabilityStatus, type Review, type Transaction, type Employee, type SiteContent, type Role, type Application, type PickupLocation, type LocationStatus } from '../types';
import { CogIcon, LogoutIcon, PencilAltIcon, UsersIcon, ViewGridIcon, XIcon, MenuAlt2Icon, ClipboardListIcon, LocationMarkerIcon, TagIcon, MailIcon, TrashIcon, PlusIcon, StarIcon, CreditCardIcon, DocumentCheckIcon, DocumentDownloadIcon, ChartBarIcon } from './icons/Icons';
import Card from './Card';
import { GradientStatCard, OutlinedStatCard } from './shared/GradientStatCard';
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
    locations: PickupLocation[];
    setLocations: React.Dispatch<React.SetStateAction<PickupLocation[]>>;
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
    bikeUnits: BikeUnit[];
    setBikeUnits: React.Dispatch<React.SetStateAction<BikeUnit[]>>;
}

type AdminPanel = 'dashboard' | 'bookings' | 'fleet' | 'locations' | 'offers' | 'enquiries' | 'reviews' | 'transactions' | 'content' | 'users' | 'settings' | 'employees' | 'applications' | 'reports';

const AdminDashboard: React.FC<AdminDashboardProps> = (props) => {
    const { user, onLogout, reviews, setReviews, bikes, setBikes, locations, setLocations, offers, setOffers, enquiries, setEnquiries, transactions, setTransactions, employees, setEmployees, siteContent, setSiteContent, adminUsers, setAdminUsers, applications, setApplications, bikeUnits, setBikeUnits } = props;

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
            const [bikesData, offersData, enquiriesData, reviewsData, employeesData, applicationsData, transactionsData, unitsData] = await Promise.all([
                api.admin.getBikes(),
                api.admin.getOffers(),
                api.admin.getEnquiries(),
                api.admin.getReviews(),
                api.admin.getEmployees(),
                api.admin.getApplications(),
                api.admin.getTransactions(),
                api.admin.getBikeUnits()
            ]);

            setBikes(bikesData);
            setOffers(offersData);
            setEnquiries(enquiriesData);
            setReviews(reviewsData);
            setEmployees(employeesData);
            setApplications(applicationsData);
            setTransactions(transactionsData);
            setBikeUnits(unitsData);
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
        { id: 'fleet', label: 'Model Catalog', icon: <ClipboardListIcon className="w-5 h-5" /> },
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
            case 'fleet': return <BikeManagementPanel fleet={bikes} setFleet={setBikes} bikeUnits={bikeUnits} />;
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
            <div className="p-6 text-center border-b border-white/20">
                <h1 className="text-2xl font-bold text-white leading-tight">RoAd RoBo's</h1>
                <p className="text-sm opacity-80 text-white/80">Admin Panel</p>
            </div>
            <nav className="flex-grow p-3 overflow-y-auto scrollbar-hide">
                {navItems.map(item => (
                    <button
                        key={item.id}
                        onClick={() => handleNavClick(item.id as AdminPanel)}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition mb-1 ${activePanel === item.id
                            ? 'bg-white/20 text-white'
                            : 'text-white/70 hover:bg-white/10 hover:text-white'
                            }`}
                    >
                        <div className="shrink-0">{item.icon}</div>
                        <span>{item.label}</span>
                    </button>
                ))}
            </nav>
            <div className="p-4 border-t border-white/20 bg-black/10">
                <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white font-bold border border-white/10">
                        {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                        <p className="text-sm font-semibold text-white leading-tight">{user.name}</p>
                        <p className="text-xs text-green-200/70 font-medium uppercase tracking-wider">Administrator</p>
                    </div>
                </div>
                <button onClick={onLogout} className="w-full flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold py-2.5 rounded-lg text-sm transition-all duration-200">
                    <LogoutIcon className="w-5 h-5" /> Logout
                </button>
            </div>
        </>
    );

    return (
        <div className="flex min-h-screen bg-accent font-sans selection:bg-primary/20 overflow-x-hidden">
            {/* Ambient Background Elements — identical to Manager/Service panels */}
            <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
                <div className="absolute top-[-15%] right-[-10%] w-[60%] h-[60%] bg-primary/5 rounded-full blur-[160px]" />
                <div className="absolute bottom-[5%] left-[-5%] w-[45%] h-[45%] bg-primary-light/5 rounded-full blur-[140px]" />
            </div>

            {/* Sidebar (Desktop) — fixed + h-screen matching Manager/Service */}
            <aside className="hidden lg:flex w-64 bg-primary text-white flex-col h-screen fixed shadow-2xl z-50">
                <SidebarContent />
            </aside>

            {/* Content Spacer for fixed sidebar */}
            <div className="hidden lg:block w-64 flex-shrink-0" />

            {/* Mobile Sidebar */}
            <div className={`fixed inset-0 z-[100] lg:hidden ${isSidebarOpen ? 'block' : 'hidden'}`}>
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)}></div>
                <aside className={`fixed top-0 left-0 h-full w-64 bg-primary text-white flex flex-col transition-transform duration-500 ease-out shadow-2xl ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                    <SidebarContent />
                </aside>
            </div>

            {/* Main Content */}
            <main className="flex-1 p-2 md:p-6 lg:p-8 overflow-y-auto max-h-screen scrollbar-hide flex flex-col w-full overflow-x-hidden">
                <div className="lg:hidden flex items-center justify-between mb-4 mt-2">
                    <div className="flex items-center">
                        <button onClick={() => setIsSidebarOpen(true)} className="p-2 rounded-md text-gray-600 hover:bg-gray-200">
                            <MenuAlt2Icon className="w-6 h-6" />
                        </button>
                        <h2 className="text-lg font-bold ml-4">Admin Panel</h2>
                    </div>
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
        <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-10">
                <div>
                    <h1 className="text-3xl font-bold text-text-body">Welcome back, {user.name}!</h1>
                    <p className="text-gray-600 mt-1">Here's a quick overview of your business.</p>
                </div>
            </div>

            {/* Primary Stats Row — identical GradientStatCard as Manager/Service */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                <GradientStatCard
                    label="Total Revenue"
                    value={`₹${(stats.totalRevenue || 0).toLocaleString()}`}
                    color="green"
                    icon={CreditCardIcon}
                    sublabel="All time earnings"
                    onClick={() => setActivePanel('transactions')}
                />
                <GradientStatCard
                    label="Total Bookings"
                    value={stats.totalBookings}
                    color="blue"
                    icon={ClipboardListIcon}
                    sublabel="Confirmed & active"
                    onClick={() => setActivePanel('bookings')}
                />
                <GradientStatCard
                    label="Bikes in Fleet"
                    value={stats.bikeCount}
                    color="purple"
                    icon={ViewGridIcon}
                    sublabel="Models in catalog"
                    onClick={() => setActivePanel('fleet')}
                />
                <GradientStatCard
                    label="Fleet Utilization"
                    value={`${stats.fleetUtilization}%`}
                    color="orange"
                    icon={ChartBarIcon}
                    sublabel="Active rental rate"
                    onClick={() => setActivePanel('reports')}
                />
            </div>

            {/* Secondary Stats — OutlinedStatCard matching ManagerDashboard */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <OutlinedStatCard
                    label="Pending Enquiries"
                    value={stats.pendingEnquiries}
                    color="yellow"
                    icon={MailIcon}
                    onClick={() => setActivePanel('enquiries')}
                />
                <OutlinedStatCard
                    label="Pending Reviews"
                    value={stats.pendingReviews}
                    color="blue"
                    icon={StarIcon}
                    onClick={() => setActivePanel('reviews')}
                />
                <OutlinedStatCard
                    label="New Applications"
                    value={stats.newPartners}
                    color="green"
                    icon={UsersIcon}
                    onClick={() => setActivePanel('applications')}
                />
            </div>

            {/* Admin Quick Actions — matches Manager/Service 'Rapid Operations' card exactly */}
            <div className="mt-8">
                <Card className="p-8 border border-input/30 bg-white shadow-card rounded-2xl">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-black text-text-body tracking-tight uppercase italic">Admin Tools</h2>
                        <span className="px-3 py-1 bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-widest rounded-md">Control Center</span>
                    </div>
                    <div className="flex flex-wrap gap-4">
                        <button
                            onClick={() => setActivePanel('reports')}
                            className="group bg-primary text-white font-bold py-3.5 px-6 rounded-lg hover:bg-black transition-all flex items-center gap-3 shadow-md shadow-primary/20 active:scale-95 text-[11px] uppercase tracking-widest"
                        >
                            <ChartBarIcon className="w-5 h-5" />
                            <span>View Reports</span>
                        </button>
                        <button
                            onClick={() => setActivePanel('fleet')}
                            className="group bg-secondary text-white font-bold py-3.5 px-6 rounded-lg hover:bg-secondary-light transition-all flex items-center gap-3 shadow-md shadow-secondary/20 active:scale-95 text-[11px] uppercase tracking-widest"
                        >
                            <ViewGridIcon className="w-5 h-5" />
                            <span>Manage Fleet</span>
                        </button>
                        <button
                            onClick={() => setActivePanel('applications')}
                            className="group border border-input/50 text-text-body font-bold py-3.5 px-6 rounded-lg hover:border-primary/40 hover:bg-primary/5 transition-all flex items-center gap-3 active:scale-95 text-[11px] uppercase tracking-widest"
                        >
                            <DocumentCheckIcon className="w-5 h-5" />
                            <span>Review Applications</span>
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
        images: ['', '', ''], kmLimit: { hour: 0, day: 0, week: 0, month: 0 }, excessKmCharge: 0, minBookingDur: { hour: 0, day: 0 },
        colorVariants: []
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
                        <h2 className="text-xl font-bold">{bike ? 'Edit' : 'Create'} Model Variant</h2>
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

                        <div className="pt-4 border-t">
                            <label className="text-sm font-bold block mb-2 text-primary uppercase tracking-widest">Color Variants</label>
                            <div className="space-y-2">
                                {(formData.colorVariants || []).map((cv, idx) => (
                                    <div key={idx} className="flex gap-2 items-center">
                                        <input
                                            placeholder="Color Name (e.g. Silver)"
                                            value={cv.colorName}
                                            onChange={(e) => {
                                                const newVariants = [...(formData.colorVariants || [])];
                                                newVariants[idx].colorName = e.target.value;
                                                setFormData(prev => ({ ...prev, colorVariants: newVariants }));
                                            }}
                                            className={`${inputClass} mt-0`}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setFormData(prev => ({
                                                    ...prev,
                                                    colorVariants: prev.colorVariants?.filter((_, i) => i !== idx)
                                                }));
                                            }}
                                            className="p-2 text-red-500 hover:bg-red-50 rounded"
                                        >
                                            <XIcon className="w-5 h-5" />
                                        </button>
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    onClick={() => {
                                        setFormData(prev => ({
                                            ...prev,
                                            colorVariants: [...(prev.colorVariants || []), { colorName: '', imageUrl: '' }]
                                        }));
                                    }}
                                    className="text-xs font-bold text-secondary uppercase bg-secondary/5 hover:bg-secondary/10 px-3 py-2 rounded-lg transition-colors flex items-center gap-2 mt-2"
                                >
                                    <PlusIcon className="w-3.5 h-3.5" /> Add Color Variant
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="p-4 bg-gray-50 flex justify-end gap-4">
                        <button type="button" onClick={onClose} className="border border-gray-300 font-semibold py-2 px-4 rounded-lg">Cancel</button>
                        <button type="submit" className="bg-secondary text-white font-semibold py-2 px-4 rounded-lg">Save Model</button>
                    </div>
                </form>
            </Card>
        </div>
    );
};

const BikeManagementPanel: React.FC<{ fleet: Bike[]; setFleet: React.Dispatch<React.SetStateAction<Bike[]>>; bikeUnits: BikeUnit[] }> = ({ fleet, setFleet, bikeUnits }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBike, setEditingBike] = useState<Bike | null>(null);

    const handleAdd = () => { setEditingBike(null); setIsModalOpen(true); };
    const handleEdit = (bike: Bike) => { setEditingBike(bike); setIsModalOpen(true); };
    const handleDelete = async (id: number) => {
        if (window.confirm('Are you sure you want to delete this bike?')) {
            // Find and delete associated units to prevent orphans
            const allUnits = await api.admin.getBikeUnits();
            const associatedUnits = allUnits.filter((u: any) => Number(u.bike_id) === Number(id));

            for (const unit of associatedUnits) {
                await api.admin.deleteBikeUnit(unit.id);
            }

            // Delete the main bike record
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
                    <h1 className="text-3xl font-black uppercase tracking-widest bg-gradient-to-r from-primary to-emerald-400 bg-clip-text text-transparent drop-shadow-sm">Model Catalog</h1>
                    <p className="text-gray-600 mt-1">Define bike variants and master data.</p>
                </div>
                <button onClick={handleAdd} className="bg-secondary text-white font-semibold py-2 px-4 rounded-lg flex items-center gap-2">
                    <PlusIcon className="w-5 h-5" /> New Model
                </button>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4">
                {fleet.map(bike => (
                    <Card key={bike.id} className="p-0 overflow-hidden group hover:shadow-2xl transition-all duration-500 border-none bg-white relative">
                        {/* Premium Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                        <div className="h-40 bg-gray-50 flex items-center justify-center p-6 relative overflow-hidden">
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,theme(colors.gray.200)_0%,transparent_70%)] opacity-30" />
                            <img className="h-full w-full object-contain drop-shadow-xl group-hover:scale-110 transition-transform duration-700 relative z-10" src={bike.images[0]} alt={bike.name} />
                            <div className="absolute top-3 right-3 flex flex-wrap gap-1 max-w-[80px] justify-end">
                                {(bike.colorVariants || []).map((cv, i) => (
                                    <div key={i} className="w-3 h-3 rounded-full border border-white shadow-sm" title={cv.colorName} style={{ backgroundColor: cv.colorName.toLowerCase() || '#ccc' }} />
                                ))}
                            </div>
                        </div>

                        <div className="p-5 flex flex-col gap-4 relative z-10">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-xl font-black text-[#0A2540] tracking-tight uppercase italic leading-none mb-1">{bike.name}</h3>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{bike.specs.cc} &bull; {bike.type}</p>
                                </div>
                                <span className={`px-2 py-0.5 text-[9px] font-black rounded-lg border-2 uppercase tracking-widest ${bike.availability === 'Available' ? 'border-emerald-100 bg-emerald-50 text-emerald-600' :
                                    bike.availability === 'Limited' ? 'border-amber-100 bg-amber-50 text-amber-600' : 'border-blue-100 bg-blue-50 text-blue-600'
                                    }`}>{bike.availability}</span>
                            </div>

                            <div className="grid grid-cols-2 gap-4 py-3 border-y border-gray-50 text-[11px] font-bold">
                                <div><span className="text-gray-400 block mb-0.5">Day Rate</span><span className="text-[#0A2540]">₹{bike.price.day}</span></div>
                                <div><span className="text-gray-400 block mb-0.5">Security</span><span className="text-[#0A2540]">₹{bike.deposit}</span></div>
                                <div className="col-span-2">
                                    <span className="text-gray-400 block mb-1">Live Inventory</span>
                                    <div className="flex gap-2">
                                        <div className="flex-1 bg-gray-50 rounded-lg p-2 flex flex-col items-center">
                                            <span className="text-[9px] text-primary">Total</span>
                                            <span className="text-sm font-black text-primary">{bikeUnits.filter(u => Number(u.bike_id) === Number(bike.id)).length}</span>
                                        </div>
                                        <div className="flex-1 bg-gray-50 rounded-lg p-2 flex flex-col items-center">
                                            <span className="text-[9px] text-emerald-600">Ready</span>
                                            <span className="text-sm font-black text-emerald-600">{bikeUnits.filter(u => Number(u.bike_id) === Number(bike.id) && u.status === 'Ready').length}</span>
                                        </div>
                                        <div className="flex-1 bg-gray-50 rounded-lg p-2 flex flex-col items-center">
                                            <span className="text-[9px] text-error">Active</span>
                                            <span className="text-sm font-black text-error">{bikeUnits.filter(u => Number(u.bike_id) === Number(bike.id) && u.status === 'Rented').length}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-2">
                                <button onClick={() => handleEdit(bike)} className="text-[10px] font-black text-primary uppercase tracking-widest hover:bg-primary/5 px-4 py-2 rounded-lg transition-colors">Configure</button>
                                <button onClick={() => handleDelete(bike.id)} className="text-[10px] font-black text-error uppercase tracking-widest hover:bg-error/5 px-4 py-2 rounded-lg transition-colors">Retire</button>
                            </div>
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
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">Bike</th>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">Type</th>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">Rates</th>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">Deposit</th>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">Fleet (T/B/A)</th>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">Status</th>
                                    <th scope="col" className="px-4 py-3 text-center text-xs font-semibold text-text-muted uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-card">
                                {fleet.map(bike => (
                                    <tr key={bike.id}>
                                        <td className="px-4 py-4 whitespace-nowrap">
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
                                        <td className="px-4 py-4 whitespace-nowrap text-text-muted">{bike.type}</td>
                                        <td className="px-4 py-4">
                                            <div className="text-text-body font-medium">₹{bike.price.day} / day</div>
                                            <div className="text-text-muted text-xs">₹{bike.price.hour} / hr</div>
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap text-text-muted">₹{bike.deposit}</td>
                                        <td className="px-4 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-xs font-bold text-text-body">Live Stock: {bikeUnits.filter(u => Number(u.bike_id) === Number(bike.id)).length}</span>
                                                <span className="text-[10px] text-error">On Field: {bikeUnits.filter(u => Number(u.bike_id) === Number(bike.id) && u.status === 'Rented').length}</span>
                                                <span className="text-[10px] text-success">At Hub: {bikeUnits.filter(u => Number(u.bike_id) === Number(bike.id) && u.status === 'Ready').length}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${bike.availability === 'Available' ? 'bg-green-100 text-green-800' :
                                                bike.availability === 'Limited' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'
                                                }`}>{bike.availability}</span>
                                        </td>
                                        <td className="px-4 py-4 text-center font-medium">
                                            <div className="flex justify-center items-center gap-3">
                                                <button onClick={() => handleEdit(bike)} className="text-primary hover:text-primary-dark transition-colors font-semibold px-2 py-1.5 rounded-lg hover:bg-primary/5 text-xs">
                                                    Edit
                                                </button>
                                                <button onClick={() => handleDelete(bike.id)} className="text-error hover:text-error-dark transition-colors font-semibold px-2 py-1.5 rounded-lg hover:bg-error/5 text-xs">
                                                    Delete
                                                </button>
                                            </div>
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

const LocationFormModal: React.FC<{ location: PickupLocation | null, onSave: (location: PickupLocation, originalName?: string) => void, onClose: () => void }> = ({ location, onSave, onClose }) => {
    const [name, setName] = useState(location?.name || '');
    const [status, setStatus] = useState<LocationStatus>(location?.status || 'active');

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-md">
                <form onSubmit={(e) => { e.preventDefault(); onSave({ name, status }, location?.name || undefined); }}>
                    <div className="p-6 border-b flex justify-between items-center">
                        <h2 className="text-xl font-bold">{location ? 'Edit' : 'Add'} Location</h2>
                        <button type="button" onClick={onClose}><XIcon className="w-6 h-6" /></button>
                    </div>
                    <div className="p-6 space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Location Name</label>
                            <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full p-2 bg-white border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary/50" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Status</label>
                            <select value={status} onChange={e => setStatus(e.target.value as LocationStatus)} className="w-full p-2 bg-white border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary/50">
                                <option value="active">Active (Green)</option>
                                <option value="busy">Busy (Orange)</option>
                                <option value="unavailable">Unavailable (Gray)</option>
                            </select>
                        </div>
                    </div>
                    <div className="p-4 bg-gray-50 flex justify-end gap-4">
                        <button type="button" onClick={onClose} className="border border-gray-300 font-semibold py-2 px-4 rounded-lg">Cancel</button>
                        <button type="submit" className="bg-secondary text-white font-semibold py-2 px-4 rounded-lg">Save</button>
                    </div>
                </form>
            </Card>
        </div>
    )
}

const LocationManagementPanel: React.FC<{ locations: PickupLocation[]; setLocations: React.Dispatch<React.SetStateAction<PickupLocation[]>> }> = ({ locations, setLocations }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingLocation, setEditingLocation] = useState<PickupLocation | null>(null);

    const handleAdd = () => { setEditingLocation(null); setIsModalOpen(true); };
    const handleEdit = (loc: PickupLocation) => { setEditingLocation(loc); setIsModalOpen(true); };
    const handleDelete = async (locName: string) => {
        if (window.confirm('Are you sure you want to delete this location?')) {
            await api.admin.deleteLocation(locName);
            setLocations(currentLocations => currentLocations.filter(l => l.name !== locName));
        }
    };
    const handleSave = async (location: PickupLocation, originalName?: string) => {
        if (originalName) {
            await api.admin.updateLocation(originalName, location.name);
            // Note: Since API might not support updating status yet, we just update local state
            setLocations(prev => prev.map(l => l.name === originalName ? location : l));
        } else {
            await api.admin.createLocation(location.name);
            setLocations(prev => [...prev, location]);
        }
        setIsModalOpen(false);
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-black uppercase tracking-widest bg-gradient-to-r from-primary to-emerald-400 bg-clip-text text-transparent drop-shadow-sm">Pickup Locations</h1>
                    <p className="text-gray-600 mt-1">Manage pickup and drop-off points.</p>
                </div>
                <button onClick={handleAdd} className="bg-secondary text-white font-semibold py-2 px-4 rounded-lg flex items-center gap-2"><PlusIcon className="w-5 h-5" /> Add Location</button>
            </div>
            <Card className="p-6">
                <ul className="space-y-3">
                    {locations.map(location => (
                        <li key={location.name} className="flex justify-between items-center p-3 bg-accent rounded-lg">
                            <div className="flex items-center gap-3">
                                <span className="font-medium">{location.name}</span>
                                <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${location.status === 'active' ? 'bg-green-100 text-green-700' :
                                    location.status === 'busy' ? 'bg-orange-100 text-orange-700' :
                                        'bg-gray-100 text-gray-700'
                                    }`}>
                                    {location.status}
                                </span>
                            </div>
                            <div className="space-x-4">
                                <button onClick={() => handleEdit(location)} className="text-primary hover:underline text-sm font-medium">Edit</button>
                                <button onClick={() => handleDelete(location.name)} className="text-error hover:underline text-sm font-medium">Delete</button>
                            </div>
                        </li>
                    ))}
                </ul>
            </Card>
            {isModalOpen && <LocationFormModal location={editingLocation} onSave={handleSave} onClose={() => setIsModalOpen(false)} />}
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
                                    <th className="px-6 py-3 text-center text-xs font-semibold text-text-muted uppercase tracking-wider min-w-[150px]">Actions</th>
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
                                        <td className="px-6 py-4 whitespace-nowrap text-center font-medium">
                                            <div className="flex justify-center items-center gap-3">
                                                <button onClick={() => handleEdit(offer)} className="text-primary hover:text-primary-dark transition-colors font-semibold flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-primary/5">
                                                    Edit
                                                </button>
                                                <button onClick={() => handleDelete(offer.id)} className="text-error hover:text-error-dark transition-colors font-semibold flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-error/5">
                                                    Delete
                                                </button>
                                            </div>
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
                                    <th className="px-6 py-3 text-center text-xs font-semibold text-text-muted uppercase tracking-wider min-w-[150px]">Actions</th>
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
                                        <td className="px-6 py-4 whitespace-nowrap text-center font-medium">
                                            <div className="flex justify-center items-center gap-3">
                                                <button onClick={() => setViewingEnquiry(enquiry)} className="text-primary hover:text-primary-dark transition-colors font-semibold flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-primary/5">
                                                    View
                                                </button>
                                                <button onClick={() => handleDelete(enquiry.id)} className="text-error hover:text-error-dark transition-colors font-semibold flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-error/5">
                                                    Delete
                                                </button>
                                            </div>
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
                                    <th className="px-6 py-3 text-center text-xs font-semibold text-text-muted uppercase tracking-wider min-w-[200px]">Actions</th>
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
                                        <td className="px-6 py-4 whitespace-nowrap text-center font-medium">
                                            <div className="flex justify-center items-center gap-2">
                                                {review.status !== 'Approved' && (
                                                    <button onClick={() => handleStatusChange(review.id, 'Approved')} className="text-green-600 hover:text-green-700 transition-colors font-semibold px-2 py-1 rounded hover:bg-green-50">
                                                        Approve
                                                    </button>
                                                )}
                                                {review.status !== 'Rejected' && (
                                                    <button onClick={() => handleStatusChange(review.id, 'Rejected')} className="text-yellow-600 hover:text-yellow-700 transition-colors font-semibold px-2 py-1 rounded hover:bg-yellow-50">
                                                        Reject
                                                    </button>
                                                )}
                                                <button onClick={() => handleDelete(review.id)} className="text-error hover:text-error-dark transition-colors font-semibold px-2 py-1 rounded hover:bg-error/5">
                                                    Delete
                                                </button>
                                                <button onClick={() => handleBlockUser(review.userId)} className="text-error border border-error/20 hover:bg-error/5 transition-colors font-semibold px-2 py-1 rounded text-xs">
                                                    Block
                                                </button>
                                            </div>
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
    const [isSaving, setIsSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

    useEffect(() => {
        setContent(siteContent);
    }, [siteContent]);

    const handleSave = async () => {
        setIsSaving(true);
        setSaveStatus('idle');
        try {
            await api.admin.updateSiteContent(content);
            setSiteContent(content);
            setSaveStatus('success');
            setTimeout(() => setSaveStatus('idle'), 3000); // Clear success message after 3s
        } catch (error) {
            console.error("Failed to save content", error);
            setSaveStatus('error');
        } finally {
            setIsSaving(false);
        }
    };

    const handleHomeChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setContent(prev => ({ ...prev, home: { ...prev.home, [name]: value } }));
    };

    return (
        <div className="animate-fade-in max-w-4xl">
            <div className="mb-8">
                <h1 className="text-3xl font-black uppercase tracking-widest bg-gradient-to-r from-primary to-emerald-400 bg-clip-text text-transparent drop-shadow-sm">Site Content</h1>
                <p className="text-gray-500 mt-2 text-sm leading-relaxed max-w-2xl">
                    Manage the text content displayed across your website. Changes made here will be reflected instantly on the public-facing pages.
                </p>
            </div>

            <div className="space-y-6">
                {/* Home Page Section */}
                <Card className="overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300">
                    <div className="bg-gray-50/50 border-b border-gray-100 px-6 py-4">
                        <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                            <DocumentCheckIcon className="w-5 h-5 text-primary" />
                            Home Page Content
                        </h2>
                        <p className="text-xs text-gray-500 mt-1">Configure the main headlines and introductory text.</p>
                    </div>

                    <div className="p-6 space-y-6">
                        {/* Hero Title */}
                        <div className="group">
                            <label htmlFor="content-title" className="block text-xs font-black uppercase tracking-widest text-gray-700 mb-2 transition-colors group-focus-within:text-primary">
                                Hero Title Template
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    id="content-title"
                                    name="heroTitleTemplate"
                                    value={content.home.heroTitleTemplate}
                                    onChange={handleHomeChange}
                                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-800 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all pr-12"
                                    placeholder="Enter hero title..."
                                />
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 opacity-0 group-focus-within:opacity-100 transition-opacity">
                                    <PencilAltIcon className="w-4 h-4 text-primary" />
                                </div>
                            </div>
                            <p className="text-[11px] text-gray-400 mt-2 font-medium">Tip: Use <code className="bg-gray-100 text-primary px-1.5 py-0.5 rounded text-[10px] mx-1">[city]</code> as a dynamic placeholder for the user's location.</p>
                        </div>

                        {/* Hero Subtitle */}
                        <div className="group">
                            <label htmlFor="content-subtitle" className="block text-xs font-black uppercase tracking-widest text-gray-700 mb-2 transition-colors group-focus-within:text-primary">
                                Hero Subtitle Description
                            </label>
                            <textarea
                                id="content-subtitle"
                                name="heroSubtitle"
                                rows={4}
                                value={content.home.heroSubtitle}
                                onChange={handleHomeChange}
                                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-800 text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                                placeholder="Write a compelling subtitle that describes your service..."
                            />
                            <div className="flex justify-between items-center mt-2">
                                <p className="text-[11px] text-gray-400 font-medium">Keep it concise and engaging. Supported on all devices.</p>
                                <span className={`text-[10px] font-bold ${content.home.heroSubtitle.length > 150 ? 'text-amber-500' : 'text-gray-400'}`}>
                                    {content.home.heroSubtitle.length} chars
                                </span>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Save Bar */}
                <div className="sticky bottom-4 z-10 flex items-center justify-between p-4 bg-white/90 backdrop-blur-xl border border-gray-200 rounded-2xl shadow-premium animate-in slide-in-from-bottom-4">
                    <div className="flex items-center gap-3">
                        {saveStatus === 'success' && (
                            <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg text-sm font-bold animate-in fade-in zoom-in duration-300">
                                <DocumentCheckIcon className="w-4 h-4" />
                                Content successfully published
                            </div>
                        )}
                        {saveStatus === 'error' && (
                            <div className="flex items-center gap-2 text-red-600 bg-red-50 px-3 py-1.5 rounded-lg text-sm font-bold animate-in fade-in zoom-in duration-300">
                                <XIcon className="w-4 h-4" />
                                Save failed. Check permissions (RLS).
                            </div>
                        )}
                        {saveStatus === 'idle' && !isSaving && (
                            <span className="text-gray-400 text-xs font-medium pl-2 hidden sm:block">All changes are drafted locally until saved.</span>
                        )}
                    </div>

                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className={`
                            flex items-center gap-2 py-2.5 px-6 rounded-xl font-bold text-sm tracking-wide transition-all active:scale-95
                            ${isSaving ? 'bg-primary/70 cursor-wait text-white select-none' : 'bg-primary text-white hover:shadow-lg hover:shadow-primary/30'}
                        `}
                    >
                        {isSaving ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <DocumentCheckIcon className="w-4 h-4" />
                                Publish Changes
                            </>
                        )}
                    </button>
                </div>
            </div>
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
                    role: user.role.id
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
                    <h1 className="text-3xl font-black uppercase tracking-widest bg-gradient-to-r from-primary to-emerald-400 bg-clip-text text-transparent drop-shadow-sm">Users & Roles</h1>
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
                                    <th scope="col" className="px-6 py-3 text-center text-xs font-semibold text-text-muted uppercase tracking-wider min-w-[150px]">Actions</th>
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
                                        <td className="px-6 py-4 whitespace-nowrap text-center font-medium">
                                            <div className="flex justify-center items-center gap-3">
                                                <button onClick={() => handleEdit(u)} className="text-primary hover:text-primary-dark transition-colors font-semibold px-3 py-1.5 rounded-lg hover:bg-primary/10">
                                                    Edit
                                                </button>
                                                <button onClick={() => handleDelete(u.id)} className="text-error hover:text-error-dark transition-colors font-semibold px-3 py-1.5 rounded-lg hover:bg-error/10">
                                                    Delete
                                                </button>
                                            </div>
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
            <h1 className="text-3xl font-black uppercase tracking-widest bg-gradient-to-r from-primary to-emerald-400 bg-clip-text text-transparent drop-shadow-sm">Site Settings</h1>
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
                                    <th scope="col" className="px-6 py-3 text-center text-xs font-semibold text-text-muted uppercase tracking-wider min-w-[150px]">Actions</th>
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
                                        <td className="px-6 py-4 whitespace-nowrap text-center font-medium">
                                            <div className="flex justify-center items-center gap-3">
                                                <button onClick={() => handleEdit(employee)} className="text-primary hover:text-primary-dark transition-colors font-semibold px-3 py-1.5 rounded-lg hover:bg-primary/10">
                                                    Edit
                                                </button>
                                                <button onClick={() => handleDelete(employee.id)} className="text-error hover:text-error-dark transition-colors font-semibold px-3 py-1.5 rounded-lg hover:bg-error/10">
                                                    Delete
                                                </button>
                                            </div>
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
                                    <th className="px-6 py-3 text-center text-xs font-semibold text-text-muted uppercase tracking-wider min-w-[180px]">Actions</th>
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
                                        <td className="px-6 py-4 whitespace-nowrap text-center font-medium">
                                            <div className="flex justify-center items-center gap-3">
                                                <button onClick={() => handleDownloadResume(app)} className="text-primary hover:text-primary-dark transition-colors font-semibold flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-primary/5">
                                                    <DocumentDownloadIcon className="w-4 h-4" /> Resume
                                                </button>
                                                <button onClick={() => handleDelete(app.id)} className="text-error hover:text-error-dark transition-colors font-semibold flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-error/5">
                                                    <TrashIcon className="w-4 h-4" /> Delete
                                                </button>
                                            </div>
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
