import React, { useState, useEffect } from 'react';
import { type AdminUser, type Bike, type BikeUnit, type Offer, type Enquiry, type Review, type Transaction, type Employee, type SiteContent, type Application, type PickupLocation } from '../types';
import {
    DashboardIcon as ViewGridIcon,
    LogoutIcon,
    MenuAlt2Icon,
    ClipboardListIcon,
    ShoppingBagIcon as CreditCardIcon,
    BikeIcon,
    ChartBarIcon,
    UsersIcon,
    PlusIcon as PlusCircleIcon,
    SparklesIcon,
    LocationMarkerIcon,
    TagIcon,
    MailIcon,
    CheckCircleIcon,
    StarIcon,
    CurrencyRupeeIcon,
    DocumentTextIcon,
    InboxIcon,
    PlayIcon,
    WrenchIcon
} from './icons/Icons';
import { getBikeImage } from '../src/assets/bikeImports';
import Card from './Card';
import BookingManagementPanel from './BookingManagementPanel';
import TransactionManagementPanel from './TransactionManagementPanel';
import api from '../src/api';
import RoadRobosInventoryManager from './RoadRobosInventoryManager';
import BikeFactoryManager, { type NewBike } from './BikeFactoryManager';
import RevenueTicker from './RevenueTicker';

interface ManagerDashboardProps {
    user: AdminUser;
    onLogout: () => void;
    bikes: Bike[];
    setBikes: React.Dispatch<React.SetStateAction<Bike[]>>;
    bikeUnits: BikeUnit[];
    setBikeUnits: React.Dispatch<React.SetStateAction<BikeUnit[]>>;
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
}

type ManagerPanel = 'dashboard' | 'bookings' | 'fleet' | 'stock' | 'transactions' | 'reports' | 'locations' | 'offers' | 'enquiries' | 'applications' | 'reviews';

// Removed Sphere3D component as it clashes with the flat, premium website theme

const GradientStatCard = ({ label, value, color, icon: Icon, onClick }: { label: string, value: string | number, color: 'green' | 'blue' | 'purple' | 'orange', icon: any, onClick?: () => void }) => {
    const gradients: Record<string, string> = {
        green: 'bg-gradient-to-br from-[#059669] via-[#10B981] to-[#34D399]',
        blue: 'bg-gradient-to-br from-[#2563EB] via-[#3B82F6] to-[#60A5FA]',
        purple: 'bg-gradient-to-br from-[#7C3AED] via-[#8B5CF6] to-[#A78BFA]',
        orange: 'bg-gradient-to-br from-[#EA580C] via-[#F97316] to-[#FB923C]'
    };

    const shadows: Record<string, string> = {
        green: 'shadow-emerald-500/20',
        blue: 'shadow-blue-500/20',
        purple: 'shadow-purple-500/20',
        orange: 'shadow-orange-500/20'
    };

    return (
        <div
            onClick={onClick}
            className={`relative p-5 rounded-2xl overflow-hidden shadow-xl ${gradients[color]} ${shadows[color]} transition-all duration-500 hover:-translate-y-1.5 hover:shadow-2xl group ${onClick ? 'cursor-pointer active:scale-95' : ''}`}
        >
            {/* Glossy overlay */}
            <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            {/* Decorative glass orbs */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-3xl transition-transform duration-700 group-hover:scale-125" />
            <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-black/10 rounded-full blur-2xl" />

            <div className="relative z-10 flex flex-col h-full justify-between">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-xl rounded-xl flex items-center justify-center mb-6 border border-white/20 shadow-inner group-hover:rotate-6 transition-transform duration-500">
                    <Icon className="w-6 h-6 text-white" />
                </div>

                <div>
                    <h4 className="text-3xl md:text-4xl font-black text-white tracking-tighter leading-none mb-2 italic">
                        {value}
                    </h4>
                    <div className="flex items-center gap-2">
                        <p className="text-[10px] font-black text-white/70 uppercase tracking-[0.2em]">{label}</p>
                    </div>
                </div>

                {/* Glassy line at bottom */}
                <div className="mt-4 h-[1px] w-full bg-white/5" />
            </div>
        </div>
    );
};

const OutlinedStatCard = ({ label, value, color, icon: Icon }: { label: string, value: string | number, color: 'yellow' | 'blue' | 'green', icon: any }) => {
    const colors: Record<string, { border: string, text: string, iconBg: string, iconText: string, dot: string }> = {
        yellow: { border: 'border-[#FBBF24]', text: 'text-[#F59E0B]', iconBg: 'bg-[#FEF3C7]', iconText: 'text-[#F59E0B]', dot: 'bg-[#F59E0B]' },
        blue: { border: 'border-[#3B82F6]', text: 'text-[#2563EB]', iconBg: 'bg-[#DBEAFE]', iconText: 'text-[#2563EB]', dot: 'bg-[#3B82F6]' },
        green: { border: 'border-[#10B981]', text: 'text-[#059669]', iconBg: 'bg-[#D1FAE5]', iconText: 'text-[#059669]', dot: 'bg-[#10B981]' }
    };

    const config = colors[color];

    return (
        <Card className={`p-6 border-2 shadow-sm rounded-xl flex items-center justify-between ${config.border} bg-white transition-all hover:shadow-md duration-300`}>
            <div>
                <div className="flex items-center gap-2 mb-2">
                    <div className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
                    <p className="text-sm font-bold text-text-muted">{label}</p>
                </div>
                <h4 className={`text-4xl font-black tracking-tight leading-none ${config.text}`}>{value}</h4>
            </div>

            <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${config.iconBg} ${config.iconText}`}>
                <Icon className="w-7 h-7" />
            </div>
        </Card>
    );
};

const ManagerDashboard: React.FC<ManagerDashboardProps> = (props) => {
    const { user, onLogout, bikes, transactions, enquiries, setTransactions } = props;
    const [activePanel, setActivePanel] = useState<ManagerPanel>('dashboard');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [bookingsFilter, setBookingsFilter] = useState<'all' | 'active' | 'completed' | 'cancelled'>('all');
    const [bookingsPaymentFilter, setBookingsPaymentFilter] = useState<'all' | 'paid' | 'pending'>('all');
    const [isRefreshing, setIsRefreshing] = useState(false); // Used in case you decide to add refreshing back

    const navItems = [
        { id: 'dashboard', label: 'Dashboard Home', icon: <ViewGridIcon className="w-[22px] h-[22px]" /> },
        { id: 'fleet', label: 'Fleet Management', icon: <BikeIcon className="w-[22px] h-[22px]" /> },
        { id: 'stock', label: 'Assembly & Deployment', icon: <DocumentTextIcon className="w-[22px] h-[22px]" /> },
    ];

    const handleNavClick = (panel: ManagerPanel) => {
        setActivePanel(panel);
        setIsSidebarOpen(false);
    };

    const handleDeployBikes = async (modelId: number, rrsId: string, regNum: string, color: string) => {
        try {
            // 1. Create individual unit record
            await api.admin.addBikeUnit({
                bike_id: modelId,
                unit_number: rrsId,
                registration_number: regNum,
                color_name: color,
                status: 'Ready'
            });

            // 2. Refresh bike units
            const updatedUnits = await api.admin.getBikeUnits();
            props.setBikeUnits(updatedUnits);

            setActivePanel('fleet');
        } catch (error: any) {
            console.error('Failed to deploy bike unit:', error);
            alert(`Deployment failed: ${error.message}`);
        }
    };

    const handleDeleteBike = async (bikeId: number) => {
        if (window.confirm('Are you sure you want to decommission this model and all its local stock records?')) {
            try {
                // Find associated units before deletion to clean up
                const associatedUnits = props.bikeUnits.filter(u => Number(u.bike_id) === Number(bikeId));

                // Persistent deletion via API (mock or Supabase)
                await api.admin.deleteBike(bikeId);

                // Delete associated units
                for (const unit of associatedUnits) {
                    await api.admin.deleteBikeUnit(unit.id);
                }

                // Update UI state
                props.setBikes(prev => prev.filter(b => b.id !== bikeId));
                props.setBikeUnits(prev => prev.filter(u => Number(u.bike_id) !== Number(bikeId)));
            } catch (error) {
                console.error('Failed to delete bike:', error);
                alert('Failed to decommission asset from database.');
            }
        }
    };

    const renderPanel = () => {
        switch (activePanel) {
            case 'bookings': return <BookingManagementPanel initialFilter={bookingsFilter} initialPaymentFilter={bookingsPaymentFilter} />;
            case 'transactions': return <TransactionManagementPanel transactions={transactions} setTransactions={setTransactions} />;
            case 'fleet': return <RoadRobosInventoryManager user={user} bikes={bikes} setBikes={props.setBikes} bikeUnits={props.bikeUnits} setBikeUnits={props.setBikeUnits} onLogout={onLogout} onBackToDashboard={() => setActivePanel('dashboard')} />;
            case 'stock': return <BikeFactoryManager bikes={bikes} bikeUnits={props.bikeUnits} onDeploy={handleDeployBikes} onDelete={handleDeleteBike} />;
            case 'dashboard':
            default:
                return (
                    <ManagerHomePanel
                        user={user}
                        bikes={bikes}
                        bikeUnits={props.bikeUnits}
                        transactions={transactions}
                        enquiries={enquiries}
                        setActivePanel={(panel, filters) => {
                            if (filters) {
                                if (filters.filter) setBookingsFilter(filters.filter);
                                if (filters.paymentFilter) setBookingsPaymentFilter(filters.paymentFilter);
                            } else {
                                // Reset filters if none provided
                                setBookingsFilter('all');
                                setBookingsPaymentFilter('all');
                            }
                            setActivePanel(panel);
                        }}
                    />
                );
        }
    };

    const SidebarContent = () => (
        <>
            <div className="p-6 text-center border-b border-white/20">
                <h1 className="text-2xl font-bold text-white leading-tight">RoAd RoBo's</h1>
                <p className="text-sm opacity-80 text-white/80">Manager Panel</p>
            </div>
            <nav className="flex-grow p-3 overflow-y-auto scrollbar-hide">
                {navItems.map(item => {
                    const isActive = activePanel === item.id;
                    return (
                        <button
                            key={item.id}
                            onClick={() => handleNavClick(item.id as ManagerPanel)}
                            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition mb-1 ${isActive
                                ? 'bg-white/20 text-white'
                                : 'text-white/70 hover:bg-white/10 hover:text-white'
                                }`}
                        >
                            <div className="shrink-0">{item.icon}</div>
                            <span>{item.label}</span>
                        </button>
                    );
                })}
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
                <button
                    onClick={onLogout}
                    className="w-full flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold py-2.5 rounded-lg text-sm transition-all duration-200"
                >
                    <LogoutIcon className="w-5 h-5" /> Logout
                </button>
            </div>
        </>
    );

    // Unified view management via renderPanel

    return (
        <div className="flex min-h-screen bg-accent font-sans selection:bg-primary/20 overflow-x-hidden">
            {/* Sidebar (Desktop) */}
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
            <main className="flex-1 p-2 md:p-6 lg:p-8 flex flex-col w-full overflow-x-hidden">
                <div className="lg:hidden flex items-center justify-between mb-4">
                    <div className="flex items-center">
                        <button onClick={() => setIsSidebarOpen(true)} className="p-2 rounded-md text-gray-600 hover:bg-gray-200">
                            <MenuAlt2Icon className="w-6 h-6" />
                        </button>
                        <h2 className="text-lg font-bold ml-4">Manager Panel</h2>
                    </div>
                </div>
                <div className="flex-grow">
                    {renderPanel()}
                </div>
            </main>
        </div>
    );
};

const ManagerHomePanel: React.FC<{
    user: AdminUser;
    bikes: Bike[];
    bikeUnits: BikeUnit[];
    transactions: Transaction[];
    enquiries: Enquiry[];
    setActivePanel: (p: ManagerPanel, filters?: { filter?: any, paymentFilter?: any }) => void
}> = ({ user, bikes, bikeUnits, transactions, enquiries, setActivePanel }) => {
    return (
        <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <div className="flex flex-col justify-between items-start mb-10">
                <div>
                    <h1 className="text-3xl font-bold text-text-body">Welcome back, {user.name}!</h1>
                    <p className="text-gray-600 mt-1">Here's a quick overview of your business.</p>
                </div>
            </div>

            <RevenueTicker transactions={transactions} />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-12 mb-8">
                <GradientStatCard
                    label="Total Revenue"
                    value={`₹${transactions.reduce((acc, curr) => acc + curr.amount, 0).toLocaleString()}`}
                    color="green"
                    icon={CurrencyRupeeIcon}
                    onClick={() => setActivePanel('bookings', { paymentFilter: 'paid' })}
                />
                <GradientStatCard
                    label="Total Bookings"
                    value={transactions.length}
                    color="blue"
                    icon={ClipboardListIcon}
                    onClick={() => setActivePanel('bookings', { filter: 'active' })}
                />
                <GradientStatCard
                    label="Bikes in Fleet"
                    value={bikeUnits.length}
                    color="purple"
                    icon={WrenchIcon}
                    onClick={() => setActivePanel('fleet')}
                />
                <GradientStatCard
                    label="Fleet Utilization"
                    value={`${bikeUnits.length > 0 ? Math.round((bikeUnits.filter(u => u.status === 'Rented').length / bikeUnits.length) * 100) : 0}%`}
                    color="orange"
                    icon={ChartBarIcon}
                    onClick={() => setActivePanel('fleet')}
                />
            </div>


            <div className="mt-8">
                <Card className="p-8 border border-input/30 bg-white shadow-card rounded-2xl">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-black text-text-body tracking-tight uppercase italic">Rapid Operations</h2>
                        <span className="px-3 py-1 bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-widest rounded-md">Pro Tools</span>
                    </div>
                    <div className="flex flex-wrap gap-4">
                        <button
                            onClick={() => setActivePanel('fleet')}
                            className="group bg-primary text-white font-bold py-3.5 px-6 rounded-lg hover:bg-black transition-all flex items-center gap-3 shadow-md shadow-primary/20 active:scale-95 text-[11px] uppercase tracking-widest"
                        >
                            <BikeIcon className="w-5 h-5 transition-transform" />
                            <span>Manage Fleet</span>
                        </button>
                        <button
                            onClick={() => setActivePanel('stock')}
                            className="group bg-secondary text-white font-bold py-3.5 px-6 rounded-lg hover:bg-secondary-light transition-all flex items-center gap-3 shadow-md shadow-secondary/20 active:scale-95 text-[11px] uppercase tracking-widest"
                        >
                            <PlusCircleIcon className="w-5 h-5 transition-transform" />
                            <span>Assembly & Deployment</span>
                        </button>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default ManagerDashboard;
