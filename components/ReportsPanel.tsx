import React, { useState, useMemo } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    LineChart, Line
} from 'recharts';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { Transaction } from '../types';
import Card from './Card';
import { DocumentDownloadIcon } from './icons/Icons';

interface ReportsPanelProps {
    transactions: Transaction[];
}

type Period = 'daily' | 'monthly' | 'yearly';

const ReportsPanel: React.FC<ReportsPanelProps> = ({ transactions }) => {
    const [period, setPeriod] = useState<Period>('monthly');

    // 1. Process Data for Chart
    const chartData = useMemo(() => {
        const dataMap = new Map<string, { name: string; revenue: number; bookings: number }>();
        const now = new Date();

        transactions.forEach(t => {
            if (t.status !== 'Paid') return; // Only count paid transactions

            const date = new Date(t.date);
            let key = '';
            let label = '';

            if (period === 'yearly') {
                // Group by Month (Jan, Feb...)
                if (date.getFullYear() === now.getFullYear()) {
                    key = `${date.getMonth()}`;
                    label = date.toLocaleString('default', { month: 'short' });
                }
            } else if (period === 'monthly') {
                // Group by Day (1, 2, 3...)
                if (date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()) {
                    key = `${date.getDate()}`;
                    label = `${date.getDate()}`;
                }
            } else if (period === 'daily') {
                // Group by Hour? or just Last 7 Days? Let's do Last 7 Days for "Daily Trend"
                // Or maybe just today's transactions? 
                // "Daily Report" usually implies "Today's activity" or "Day wise breakdown"
                // Let's do Day-wise breakdown for the last 30 days
                key = date.toISOString().split('T')[0];
                label = date.toLocaleDateString();
            }

            if (key) {
                const existing = dataMap.get(key) || { name: label, revenue: 0, bookings: 0 };
                existing.revenue += t.amount;
                existing.bookings += 1;
                dataMap.set(key, existing);
            }
        });

        // Fill in missing gaps if needed, or just return sorted
        // For monthly/yearly, usually want all months/days
        return Array.from(dataMap.values());
    }, [transactions, period]);

    // 2. Export to Excel
    const exportToExcel = () => {
        const ws = XLSX.utils.json_to_sheet(transactions.map(t => ({
            ID: t.id,
            Customer: t.customerName,
            Amount: t.amount,
            Status: t.status,
            Date: new Date(t.date).toLocaleDateString(),
            BookingID: t.bookingId
        })));
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Transactions");
        XLSX.writeFile(wb, "RoadRobos_Report.xlsx");
    };

    // 3. Export to PDF
    const exportToPDF = () => {
        const doc = new jsPDF();
        doc.text("RoadRobos Transaction Report", 14, 20);

        const tableColumn = ["ID", "Customer", "Amount", "Status", "Date"];
        const tableRows = transactions.map(t => [
            t.id,
            t.customerName,
            `Rs. ${t.amount}`,
            t.status,
            new Date(t.date).toLocaleDateString()
        ]);

        (doc as any).autoTable({
            head: [tableColumn],
            body: tableRows,
            startY: 30,
        });

        doc.save("RoadRobos_Report.pdf");
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold font-sans">Reports & Analytics</h1>
                    <p className="text-gray-600 mt-1">Visualize revenue and booking trends.</p>
                </div>
                <div className="flex gap-2 bg-gray-100 rounded-lg p-1">
                    <button
                        onClick={() => setPeriod('daily')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition ${period === 'daily'
                            ? 'bg-white shadow text-primary'
                            : 'text-gray-600 hover:text-gray-900'
                            }`}
                    >
                        Daily
                    </button>
                    <button
                        onClick={() => setPeriod('monthly')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition ${period === 'monthly'
                            ? 'bg-white shadow text-primary'
                            : 'text-gray-600 hover:text-gray-900'
                            }`}
                    >
                        Monthly
                    </button>
                    <button
                        onClick={() => setPeriod('yearly')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition ${period === 'yearly'
                            ? 'bg-white shadow text-primary'
                            : 'text-gray-600 hover:text-gray-900'
                            }`}
                    >
                        Yearly
                    </button>
                </div>
            </div>

            {/* Graphs */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="p-6">
                    <h3 className="text-lg font-bold mb-4 text-text-body flex items-center gap-2">
                        Revenue Trend ({period})
                    </h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" style={{ opacity: 0.5 }} />
                                <XAxis dataKey="name" stroke="#6b7280" style={{ fontSize: '12px' }} />
                                <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#fff',
                                        border: '1px solid #e5e7eb',
                                        borderRadius: '4px',
                                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                    }}
                                />
                                <Legend wrapperStyle={{ fontSize: '14px' }} />
                                <Bar dataKey="revenue" fill="#084C3E" name="Revenue (₹)" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                <Card className="p-6">
                    <h3 className="text-lg font-bold mb-4 text-text-body flex items-center gap-2">
                        Booking Volume ({period})
                    </h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.5} />
                                <XAxis dataKey="name" stroke="#6b7280" style={{ fontSize: '12px' }} />
                                <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                        border: '1px solid #e5e7eb',
                                        borderRadius: '8px',
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                                    }}
                                />
                                <Legend wrapperStyle={{ fontSize: '14px' }} />
                                <Line
                                    type="monotone"
                                    dataKey="bookings"
                                    stroke="#ffa500"
                                    strokeWidth={3}
                                    name="Bookings"
                                    dot={{ fill: '#ffa500', r: 5 }}
                                    activeDot={{ r: 7 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
            </div>

            {/* Export Actions */}
            <Card className="p-6 bg-gradient-to-br from-white to-gray-50">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                    <div>
                        <h3 className="text-lg font-bold text-text-body">Export Data</h3>
                        <p className="text-sm text-gray-500 mt-1">Download complete transaction history</p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={exportToExcel}
                            className="bg-gradient-to-r from-green-600 to-green-700 text-white font-semibold py-2.5 px-5 rounded-lg hover:shadow-lg transition-all duration-200 flex items-center gap-2 hover:scale-105"
                        >
                            <DocumentDownloadIcon className="w-5 h-5" /> Excel
                        </button>
                        <button
                            onClick={exportToPDF}
                            className="bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold py-2.5 px-5 rounded-lg hover:shadow-lg transition-all duration-200 flex items-center gap-2 hover:scale-105"
                        >
                            <DocumentDownloadIcon className="w-5 h-5" /> PDF
                        </button>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default ReportsPanel;
