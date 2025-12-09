import React, { useState } from 'react';
import Card from './Card';
import { type Transaction } from '../types';

interface TransactionPanelProps {
    transactions: Transaction[];
    setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
}

const TransactionManagementPanel: React.FC<TransactionPanelProps> = ({ transactions, setTransactions }) => {
    const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'month' | 'year' | 'custom'>('all');
    const [customStartDate, setCustomStartDate] = useState('');
    const [customEndDate, setCustomEndDate] = useState('');
    const [showCustomDatePicker, setShowCustomDatePicker] = useState(false);

    // Filter transactions based on date filter
    const filteredTransactions = transactions.filter(t => {
        const transactionDate = new Date(t.date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        switch (dateFilter) {
            case 'today':
                const transDate = new Date(transactionDate);
                transDate.setHours(0, 0, 0, 0);
                return transDate.getTime() === today.getTime();

            case 'month':
                return transactionDate.getMonth() === today.getMonth() &&
                    transactionDate.getFullYear() === today.getFullYear();

            case 'year':
                return transactionDate.getFullYear() === today.getFullYear();

            case 'custom':
                if (!customStartDate || !customEndDate) return true;
                const start = new Date(customStartDate);
                const end = new Date(customEndDate);
                end.setHours(23, 59, 59, 999);
                return transactionDate >= start && transactionDate <= end;

            case 'all':
            default:
                return true;
        }
    });

    const handleExport = () => {
        const headers = ["Transaction ID", "Booking ID", "Customer Name", "Amount", "Status", "Date"];
        const csvContent = "data:text/csv;charset=utf-8,"
            + headers.join(",") + "\n"
            + filteredTransactions.map(t => [t.id, t.bookingId, t.customerName, t.amount, t.status, new Date(t.date).toLocaleString()].join(",")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `transactions-${dateFilter}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleDelete = (id: string) => {
        if (window.confirm('Are you sure you want to delete this transaction record?')) {
            setTransactions(currentTransactions => currentTransactions.filter(t => t.id !== id));
        }
    };

    const handleApplyCustomFilter = () => {
        if (customStartDate && customEndDate) {
            setDateFilter('custom');
            setShowCustomDatePicker(false);
        } else {
            alert('Please select both start and end dates');
        }
    };

    return (
        <div className="animate-fade-in">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                    <h1 className="text-3xl font-bold font-sans">Transactions</h1>
                    <p className="text-gray-600 mt-1">View all payment records. Showing: {filteredTransactions.length} of {transactions.length}</p>
                </div>
                <button onClick={handleExport} className="border border-primary text-primary font-semibold py-2 px-4 rounded-lg flex items-center gap-2 hover:bg-gray-50 transition">
                    Export to Excel (.csv)
                </button>
            </div>

            {/* Date Filter Controls */}
            <Card className="p-4 mb-6">
                <div className="flex flex-col gap-4">
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={() => setDateFilter('all')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${dateFilter === 'all'
                                ? 'bg-primary text-white shadow'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            All Time
                        </button>
                        <button
                            onClick={() => setDateFilter('today')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${dateFilter === 'today'
                                ? 'bg-primary text-white shadow'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            Today
                        </button>
                        <button
                            onClick={() => setDateFilter('month')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${dateFilter === 'month'
                                ? 'bg-primary text-white shadow'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            This Month
                        </button>
                        <button
                            onClick={() => setDateFilter('year')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${dateFilter === 'year'
                                ? 'bg-primary text-white shadow'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            This Year
                        </button>
                        <button
                            onClick={() => setShowCustomDatePicker(!showCustomDatePicker)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${dateFilter === 'custom'
                                ? 'bg-primary text-white shadow'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            Custom Range
                        </button>
                    </div>

                    {/* Custom Date Range Picker */}
                    {showCustomDatePicker && (
                        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-end p-4 bg-gray-50 rounded-lg">
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                                <input
                                    type="date"
                                    value={customStartDate}
                                    onChange={(e) => setCustomStartDate(e.target.value)}
                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                                />
                            </div>
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                                <input
                                    type="date"
                                    value={customEndDate}
                                    onChange={(e) => setCustomEndDate(e.target.value)}
                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                                />
                            </div>
                            <button
                                onClick={handleApplyCustomFilter}
                                className="bg-primary text-white font-semibold py-2 px-6 rounded-lg hover:shadow transition"
                            >
                                Apply Filter
                            </button>
                        </div>
                    )}
                </div>
            </Card>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4">
                {filteredTransactions.length === 0 ? (
                    <Card className="p-8 text-center">
                        <p className="text-gray-500">No transactions found for the selected date range.</p>
                    </Card>
                ) : (
                    filteredTransactions.map(t => (
                        <Card key={t.id} className="p-4 space-y-3 hover-lift">
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className="font-medium text-text-body">{t.customerName}</div>
                                    <div className="font-mono text-xs text-text-muted">{t.id}</div>
                                </div>
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${t.status === 'Paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                    {t.status}
                                </span>
                            </div>
                            <div className="border-t border-card pt-2 space-y-1 text-sm">
                                <div className="flex justify-between"><span className="text-text-muted">Amount:</span><span className="font-bold text-text-body">₹{t.amount.toFixed(2)}</span></div>
                                <div className="flex justify-between"><span className="text-text-muted">Date:</span><span className="font-medium text-text-body">{new Date(t.date).toLocaleDateString()}</span></div>
                            </div>
                            <div className="pt-2 border-t border-card flex justify-end gap-4">
                                <button className="text-primary hover:underline font-medium text-sm">View</button>
                                <button onClick={() => handleDelete(t.id)} className="text-error hover:underline font-medium text-sm">Delete</button>
                            </div>
                        </Card>
                    ))
                )}
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block">
                <Card hover className="overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">Transaction ID</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">Customer</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">Amount</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">Date</th>
                                    <th className="px-6 py-3 text-right text-xs font-semibold text-text-muted uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-card">
                                {filteredTransactions.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                                            No transactions found for the selected date range.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredTransactions.map(t => (
                                        <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap font-mono text-xs text-text-body">{t.id}</td>
                                            <td className="px-6 py-4 whitespace-nowrap font-medium text-text-body">{t.customerName}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-text-body font-semibold">₹{t.amount.toFixed(2)}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${t.status === 'Paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                                    {t.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-text-muted">{new Date(t.date).toLocaleDateString()}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right font-medium space-x-4">
                                                <button className="text-primary hover:underline">View</button>
                                                <button onClick={() => handleDelete(t.id)} className="text-error hover:underline">Delete</button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default TransactionManagementPanel;
