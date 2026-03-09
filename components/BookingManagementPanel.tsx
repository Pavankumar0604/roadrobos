import React, { useState, useEffect } from 'react';
import Card from './Card';
import { supabase } from '../src/supabaseClient';
import api from '../src/api';
import { ChevronDownIcon, SearchIcon } from './icons/Icons';

interface Booking {
    id: string;
    booking_id: string;
    user_name: string;
    user_email: string;
    user_phone: string;
    bike_name: string;
    pickup_date: string;
    pickup_time: string;
    drop_date: string;
    drop_time: string;
    pickup_location: string;
    total_fare: number;
    payment_mode: string;
    payment_status: string;
    created_at: string;
    status?: string;
}

interface BookingManagementPanelProps {
    initialFilter?: 'all' | 'active' | 'completed' | 'cancelled';
    initialPaymentFilter?: 'all' | 'paid' | 'pending';
}

const BookingManagementPanel: React.FC<BookingManagementPanelProps> = ({ initialFilter = 'all', initialPaymentFilter = 'all' }) => {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'active' | 'completed' | 'cancelled'>(initialFilter);
    const [paymentFilter, setPaymentFilter] = useState<'all' | 'paid' | 'pending'>(initialPaymentFilter);
    const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
    const [isPaymentDropdownOpen, setIsPaymentDropdownOpen] = useState(false);

    useEffect(() => {
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('bookings')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;

            // Map flat bookings row to our Booking interface
            const formattedData = (data || []).map((b: any) => ({
                ...b,
                user_name: b.user_name || b.rider_name || 'Guest User',
                user_email: b.user_email || b.email_id || 'N/A',
                user_phone: b.user_phone || b.contact_number || 'N/A',
                bike_name: b.vehicle_name || b.bike_name || 'Unknown Bike',
                total_fare: Number(b.total_payable || b.total_fare || 0),
            }));

            setBookings(formattedData);
        } catch (error) {
            console.error('Error fetching bookings:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleMarkPaid = async (bookingId: string) => {
        if (!confirm('Are you sure you want to mark this booking as COMPLETED/PAID? Cash should be collected.')) return;

        try {
            // Update via API
            await api.booking.updatePaymentStatus(bookingId, 'completed', 'CASH');

            // Update local state
            setBookings(prev => prev.map(b =>
                b.id === bookingId
                    ? { ...b, payment_status: 'completed', payment_mode: 'CASH' }
                    : b
            ));
            alert('Payment marked as Collected/Completed.');
        } catch (error) {
            console.error('Error updating payment:', error);
            alert('Failed to update payment status.');
        }
    };

    const isActiveBooking = (booking: Booking) => {
        const dropDate = new Date(`${booking.drop_date}T${booking.drop_time}`);
        return dropDate >= new Date();
    };

    const filteredBookings = bookings.filter(b => {
        // Status filter
        if (filter === 'active' && !isActiveBooking(b)) return false;
        if (filter === 'completed' && isActiveBooking(b)) return false;
        if (filter === 'cancelled' && b.status !== 'Cancelled') return false;

        // Payment filter
        if (paymentFilter === 'paid' && b.payment_status?.toLowerCase() !== 'completed') return false;
        if (paymentFilter === 'pending' && b.payment_status?.toLowerCase() === 'completed') return false;

        return true;
    });

    const activeBookings = bookings.filter(isActiveBooking);
    const completedBookings = bookings.filter(b => !isActiveBooking(b));

    const handleExport = () => {
        const headers = ["Booking ID", "Customer", "Email", "Phone", "Bike", "Pickup", "Drop-off", "Amount", "Payment Mode", "Payment Status"];
        const csvContent = "data:text/csv;charset=utf-8,"
            + headers.join(",") + "\n"
            + filteredBookings.map(b => [
                b.booking_id,
                b.user_name,
                b.user_email,
                b.user_phone,
                b.bike_name,
                `${b.pickup_date} ${b.pickup_time}`,
                `${b.drop_date} ${b.drop_time}`,
                b.total_fare,
                b.payment_mode,
                b.payment_status
            ].join(",")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `bookings-${filter}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="animate-fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                    <h1 className="text-3xl font-black uppercase tracking-widest bg-gradient-to-r from-primary to-emerald-400 bg-clip-text text-transparent drop-shadow-sm">Bookings</h1>
                    <p className="text-gray-600 mt-1">
                        Manage all bike rental bookings.
                        <span className="ml-2 font-semibold text-green-600">{activeBookings.length} Active</span>
                        <span className="mx-1">•</span>
                        <span className="font-semibold text-gray-600">{completedBookings.length} Completed</span>
                        <span className="mx-1">•</span>
                        <span className="font-semibold text-blue-600">{filteredBookings.length} Showing</span>
                    </p>
                </div>
                <button
                    onClick={handleExport}
                    className="bg-primary text-white font-semibold py-2 px-4 rounded-lg hover:shadow-lg transition flex items-center gap-2"
                >
                    📥 Export to CSV
                </button>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-4 mb-8">
                {/* Booking Status Dropdown */}
                <div className="relative">
                    <button
                        onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
                        className="px-5 py-3 bg-white border border-gray-100 rounded-2xl text-[11px] font-black uppercase tracking-wider text-[#0A2540] flex items-center gap-3 shadow-sm hover:border-primary transition-all active:scale-95 group min-w-[220px]"
                    >
                        <div className={`w-2 h-2 rounded-full ${filter === 'all' ? 'bg-primary' : filter === 'active' ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                        <span>{filter === 'all' ? 'All Bookings' : filter === 'active' ? 'Live/Active' : 'History/Completed'}</span>
                        <div className="ml-auto flex items-center gap-2">
                            <span className="opacity-40 text-[10px] bg-gray-100 px-1.5 py-0.5 rounded-md">
                                {filter === 'all' ? bookings.length : filter === 'active' ? activeBookings.length : completedBookings.length}
                            </span>
                            <ChevronDownIcon className={`w-4 h-4 transition-transform duration-500 ${isStatusDropdownOpen ? 'rotate-180 text-primary' : 'text-gray-300 group-hover:text-primary'}`} />
                        </div>
                    </button>

                    {isStatusDropdownOpen && (
                        <>
                            <div className="fixed inset-0 z-40" onClick={() => setIsStatusDropdownOpen(false)} />
                            <div className="absolute top-full left-0 mt-2 w-full bg-white/80 backdrop-blur-xl rounded-2xl shadow-premium border border-white/20 p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-300">
                                <div className="max-h-64 overflow-y-auto scrollbar-hide space-y-1">
                                    {[
                                        { id: 'all', label: 'All Bookings', count: bookings.length, color: 'bg-primary' },
                                        { id: 'active', label: 'Live/Active', count: activeBookings.length, color: 'bg-emerald-500' },
                                        { id: 'completed', label: 'History/Completed', count: completedBookings.length, color: 'bg-gray-400' }
                                    ].map(opt => (
                                        <button
                                            key={opt.id}
                                            onClick={() => {
                                                setFilter(opt.id as any);
                                                setIsStatusDropdownOpen(false);
                                            }}
                                            className={`w-full text-left px-4 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest flex items-center justify-between transition-all ${filter === opt.id ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'hover:bg-gray-50/50 text-gray-400'}`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`w-1.5 h-1.5 rounded-full ${filter === opt.id ? 'bg-white' : opt.color}`} />
                                                {opt.label}
                                            </div>
                                            <span className={`text-[10px] ${filter === opt.id ? 'bg-white/20' : 'bg-gray-100'} px-2 py-0.5 rounded-full`}>{opt.count}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* Payment Status Dropdown */}
                <div className="relative">
                    <button
                        onClick={() => setIsPaymentDropdownOpen(!isPaymentDropdownOpen)}
                        className="px-5 py-3 bg-white border border-gray-100 rounded-2xl text-[11px] font-black uppercase tracking-wider text-[#0A2540] flex items-center gap-3 shadow-sm hover:border-primary transition-all active:scale-95 group min-w-[200px]"
                    >
                        <div className={`w-2 h-2 rounded-full ${paymentFilter === 'all' ? 'bg-primary' : paymentFilter === 'paid' ? 'bg-emerald-500' : 'bg-amber-400'}`} />
                        <span>{paymentFilter === 'all' ? 'All Payments' : paymentFilter === 'paid' ? 'Paid Only' : 'Pending/Cash'}</span>
                        <ChevronDownIcon className={`w-4 h-4 ml-auto transition-transform duration-500 ${isPaymentDropdownOpen ? 'rotate-180 text-primary' : 'text-gray-300 group-hover:text-primary'}`} />
                    </button>

                    {isPaymentDropdownOpen && (
                        <>
                            <div className="fixed inset-0 z-40" onClick={() => setIsPaymentDropdownOpen(false)} />
                            <div className="absolute top-full left-0 mt-2 w-full bg-white/80 backdrop-blur-xl rounded-2xl shadow-premium border border-white/20 p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-300">
                                <div className="max-h-64 overflow-y-auto scrollbar-hide space-y-1">
                                    {[
                                        { id: 'all', label: 'All Payments', color: 'bg-primary' },
                                        { id: 'paid', label: 'Paid Only', color: 'bg-emerald-500' },
                                        { id: 'pending', label: 'Pending/Cash', color: 'bg-amber-400' }
                                    ].map(opt => (
                                        <button
                                            key={opt.id}
                                            onClick={() => {
                                                setPaymentFilter(opt.id as any);
                                                setIsPaymentDropdownOpen(false);
                                            }}
                                            className={`w-full text-left px-4 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest flex items-center gap-3 transition-all ${paymentFilter === opt.id ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'hover:bg-gray-50/50 text-gray-400'}`}
                                        >
                                            <div className={`w-1.5 h-1.5 rounded-full ${paymentFilter === opt.id ? 'bg-white' : opt.color}`} />
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4">
                {filteredBookings.length === 0 ? (
                    <Card className="p-8 text-center">
                        <p className="text-gray-500">No bookings found matching the selected filters.</p>
                    </Card>
                ) : (
                    filteredBookings.map(booking => {
                        const isActive = isActiveBooking(booking);
                        return (
                            <Card key={booking.id} className="p-4 space-y-3">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <div className="font-bold text-lg text-primary">{booking.booking_id}</div>
                                        <div className="text-sm text-gray-600">{booking.user_name}</div>
                                        <div className="text-xs text-gray-500">{booking.user_phone}</div>
                                    </div>
                                    <div className="flex flex-col items-end gap-1">
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                            }`}>
                                            {isActive ? '🟢 Active' : '📜 Completed'}
                                        </span>
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${booking.payment_status?.toLowerCase() === 'paid'
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-yellow-100 text-yellow-800'
                                            }`}>
                                            {booking.payment_status || 'Pending'}
                                        </span>
                                        {booking.payment_status?.toLowerCase() !== 'paid' && (
                                            <button
                                                onClick={() => handleMarkPaid(booking.id)}
                                                className="mt-1 text-[10px] bg-green-600 text-white px-2 py-0.5 rounded hover:bg-green-700 transition"
                                            >
                                                Mark Paid
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <div className="border-t pt-3 space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">🏍️ Bike:</span>
                                        <span className="font-semibold">{booking.bike_name}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">📍 Location:</span>
                                        <span className="font-medium">{booking.pickup_location || 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">📅 Pickup:</span>
                                        <span className="font-medium">{booking.pickup_date} {booking.pickup_time}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">📅 Drop:</span>
                                        <span className="font-medium">{booking.drop_date} {booking.drop_time}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">💰 Amount:</span>
                                        <span className="font-bold text-primary text-lg">₹{booking.total_fare?.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">💳 Mode:</span>
                                        <span className="font-medium">{booking.payment_mode || 'N/A'}</span>
                                    </div>
                                </div>

                                <div className="pt-3 border-t flex justify-end gap-3">
                                    <button className="text-primary hover:underline font-medium text-sm">View Details</button>
                                    <button className="text-blue-600 hover:underline font-medium text-sm">Contact Customer</button>
                                </div>
                            </Card>
                        );
                    })
                )}
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block">
                <Card hover className="overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Booking ID</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Customer</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Bike</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Pickup</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Drop-off</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Amount</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Payment</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>

                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredBookings.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                                            No bookings found matching the selected filters.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredBookings.map(booking => {
                                        const isActive = isActiveBooking(booking);
                                        return (
                                            <tr key={booking.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-4 py-4 whitespace-nowrap font-mono text-xs font-bold text-primary">{booking.booking_id}</td>
                                                <td className="px-4 py-4 whitespace-nowrap">
                                                    <div className="font-medium text-gray-900">{booking.user_name}</div>
                                                    <div className="text-xs text-gray-500">{booking.user_phone}</div>
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap font-medium">{booking.bike_name}</td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm">
                                                    <div>{booking.pickup_date}</div>
                                                    <div className="text-xs text-gray-500">{booking.pickup_time}</div>
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm">
                                                    <div>{booking.drop_date}</div>
                                                    <div className="text-xs text-gray-500">{booking.drop_time}</div>
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap font-bold text-primary">₹{(booking.total_fare || 0).toFixed(2)}</td>
                                                <td className="px-4 py-4 whitespace-nowrap">
                                                    <div className="text-sm">{booking.payment_mode || 'N/A'}</div>
                                                    <span className={`inline-flex px-2 text-xs font-semibold rounded-full ${booking.payment_status?.toLowerCase() === 'paid'
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-yellow-100 text-yellow-800'
                                                        }`}>
                                                        {booking.payment_status || 'Pending'}
                                                    </span>
                                                    {booking.payment_status?.toLowerCase() !== 'paid' && (
                                                        <button
                                                            onClick={() => handleMarkPaid(booking.id)}
                                                            className="ml-2 text-[10px] bg-green-600 text-white px-2 py-0.5 rounded hover:bg-green-700 transition"
                                                            title="Mark as Cash Collected/Paid"
                                                        >
                                                            Mark Paid
                                                        </button>
                                                    )}
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap">
                                                    <span className={`px-3 py-1 inline-flex text-xs font-semibold rounded-full ${isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                                        }`}>
                                                        {isActive ? '🟢 Active' : '📜 Completed'}
                                                    </span>
                                                </td>

                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default BookingManagementPanel;
