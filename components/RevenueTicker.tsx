import React, { useMemo } from 'react';
import { type Transaction } from '../types';

const DAILY_TARGET = 25000;

const RevenueTicker: React.FC<{ transactions: Transaction[] }> = ({ transactions }) => {
    // ── Today's date string in YYYY-MM-DD (IST) ──
    const todayStr = useMemo(() => {
        const now = new Date();
        return now.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' }); // 'YYYY-MM-DD'
    }, []);

    // ── Split today's vs all-time ──
    const { todayRevenue, todayPaid, todayPending, recentSales, totalAllTime } = useMemo(() => {
        let todayRevenue = 0;
        let todayPaid = 0;
        let todayPending = 0;
        let totalAllTime = 0;
        const recentSales: Transaction[] = [];

        // Sort by date desc
        const sorted = [...transactions].sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );

        for (const t of transactions) {
            const tDate = t.date?.substring(0, 10); // 'YYYY-MM-DD'
            if (tDate === todayStr) {
                if (t.status === 'Paid') {
                    todayRevenue += t.amount;
                    todayPaid++;
                } else if (t.status === 'Pending') {
                    todayPending++;
                }
            }
            if (t.status === 'Paid') totalAllTime += t.amount;
        }

        // Last 3 paid transactions (any day) for pulse feed
        for (const t of sorted) {
            if (t.status === 'Paid' && recentSales.length < 3) recentSales.push(t);
        }

        return { todayRevenue, todayPaid, todayPending, recentSales, totalAllTime };
    }, [transactions, todayStr]);

    const pct = Math.min(100, (todayRevenue / DAILY_TARGET) * 100);
    const hasData = transactions.length > 0;

    return (
        <div className="bg-gradient-to-br from-primary-dark via-primary to-primary-dark rounded-xl p-6 shadow-xl relative overflow-hidden group border border-white/10">
            <div className="absolute top-0 right-0 w-32 h-32 bg-secondary opacity-20 blur-3xl rounded-full group-hover:opacity-40 transition-opacity duration-700" />

            <div className="flex flex-col md:flex-row gap-6 items-stretch justify-between relative z-10">

                {/* ── LEFT: Today's Revenue ── */}
                <div className="flex-1 w-full">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary-light mb-1">
                        Live Revenue · Today
                    </p>
                    <div className="flex items-baseline gap-2 flex-wrap">
                        <span className="text-4xl md:text-5xl font-black tracking-tighter text-white tabular-nums drop-shadow-md">
                            ₹{todayRevenue.toLocaleString('en-IN')}
                        </span>
                        <span className="text-sm font-bold text-white/60">/ day</span>
                    </div>

                    {/* Progress bar toward daily target */}
                    <div className="mt-4">
                        <div className="flex justify-between items-end mb-1.5 text-[10px] font-bold uppercase tracking-wider text-white/80">
                            <span>Daily Target: ₹{DAILY_TARGET.toLocaleString('en-IN')}</span>
                            <span className="text-secondary-light">{pct.toFixed(1)}%</span>
                        </div>
                        <div className="w-full h-2 bg-black/40 rounded-full overflow-hidden shadow-inner relative">
                            <div className="absolute inset-0 bg-primary-dark/50" />
                            <div
                                className="h-full bg-gradient-to-r from-secondary-light to-secondary rounded-full transition-all duration-700 ease-out relative overflow-hidden"
                                style={{ width: `${pct}%` }}
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
                            </div>
                        </div>
                    </div>

                    {/* Quick stats row */}
                    <div className="mt-4 grid grid-cols-3 gap-2">
                        {[
                            { label: 'Paid Today', value: todayPaid, color: 'text-emerald-400' },
                            { label: 'Pending', value: todayPending, color: 'text-amber-400' },
                            { label: 'All-Time ₹', value: `₹${(totalAllTime / 1000).toFixed(1)}K`, color: 'text-primary-light' },
                        ].map(s => (
                            <div key={s.label} className="bg-black/20 rounded-lg px-3 py-2 border border-white/10 text-center">
                                <p className={`text-base font-black ${s.color}`}>{s.value}</p>
                                <p className="text-[9px] text-white/50 uppercase tracking-widest mt-0.5">{s.label}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── RIGHT: Recent Sales Pulse ── */}
                <div className="w-full md:w-auto min-w-[260px] bg-black/20 backdrop-blur-md border border-white/10 rounded-lg p-4 shadow-inner flex flex-col gap-3">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        Recent Sales
                    </p>

                    {hasData && recentSales.length > 0 ? (
                        <div className="space-y-2.5 flex-1">
                            {recentSales.map((t, i) => (
                                <div key={t.id} className={`animate-in slide-in-from-right-4 fade-in duration-500`} style={{ animationDelay: `${i * 80}ms` }}>
                                    <div className="flex items-center justify-between">
                                        <p className="text-[12px] font-bold text-emerald-400 truncate max-w-[140px]">{t.customerName}</p>
                                        <p className="text-[12px] font-black text-white">₹{t.amount.toLocaleString('en-IN')}</p>
                                    </div>
                                    <div className="flex items-center justify-between mt-0.5">
                                        <p className="text-[9px] text-white/40 font-mono truncate">{t.bookingId}</p>
                                        <p className="text-[9px] text-white/40 font-mono">{new Date(t.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</p>
                                    </div>
                                    {i < recentSales.length - 1 && <div className="mt-2 h-px bg-white/10" />}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-white/50 italic flex-1 flex items-center">No paid transactions yet today.</p>
                    )}

                    <div className="pt-2 border-t border-white/10 flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-white/60">
                        <span>Total Bookings</span>
                        <span className="text-white font-black">{transactions.length}</span>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes shimmer { 100% { transform: translateX(100%); } }
            `}</style>
        </div>
    );
};

export default RevenueTicker;
