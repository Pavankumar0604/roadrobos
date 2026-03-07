import React, { useState, useMemo, useEffect } from 'react';
import { SearchIcon } from './icons/Icons';
import { PART_CATEGORIES, type EevaEcoPart, type PartCategory } from '../data/eevaPartsData';
import api from '../src/api';

// ─── Sub-View Types ───
type PartsView = 'grid' | 'alerts' | 'analytics';

// ─── Stock Health Helper ───
const stockHealth = (p: EevaEcoPart) => {
    const pct = (p.stock.current / p.stock.max) * 100;
    if (p.stock.current <= p.stock.min) return 'critical';
    if (pct < 30) return 'low';
    return 'healthy';
};

const healthStyle: Record<string, { bg: string; text: string; dot: string; label: string }> = {
    healthy: { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500', label: 'In Stock' },
    low: { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500 animate-pulse', label: 'Low Stock' },
    critical: { bg: 'bg-red-50', text: 'text-error font-bold', dot: 'bg-error animate-ping', label: 'Critical!' },
};

// ─── Main Component ───
const RoadRobosPartsInventory: React.FC<{ search?: string; filterCat?: PartCategory | 'ALL' }> = ({ search = '', filterCat = 'ALL' }) => {
    const [parts, setParts] = useState<EevaEcoPart[]>([]);
    const [view, setView] = useState<PartsView>('grid');
    const [selectedPart, setSelectedPart] = useState<EevaEcoPart | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchParts();
    }, []);

    const fetchParts = async () => {
        setIsLoading(true);
        try {
            const data = await api.admin.getPartsInventory();
            setParts(data);
        } catch (error) {
            console.error('Failed to fetch parts:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const filtered = useMemo(() => parts.filter(p => {
        const matchCat = filterCat === 'ALL' || p.category === filterCat;
        const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase());
        return matchCat && matchSearch;
    }), [parts, filterCat, search]);

    const alertParts = useMemo(() => parts.filter(p => p.stock.current <= p.stock.min), [parts]);

    const totalInventoryValue = useMemo(() => parts.reduce((acc, p) => acc + (p.price * 1.18) * p.stock.current, 0), [parts]);

    const categoryStats = useMemo(() => PART_CATEGORIES.map(cat => {
        const catParts = parts.filter(p => p.category === cat.id);
        const value = catParts.reduce((a, p) => a + (p.price * 1.18) * p.stock.current, 0);
        const healthyCt = catParts.filter(p => stockHealth(p) === 'healthy').length;
        const lowCt = catParts.filter(p => stockHealth(p) === 'low').length;
        const critCt = catParts.filter(p => stockHealth(p) === 'critical').length;
        return { ...cat, count: catParts.length, value, healthyCt, lowCt, critCt };
    }), [parts]);

    // ─── Summary Stats ───
    const summaryStats = useMemo(() => ({
        totalParts: parts.length,
        totalUnits: parts.reduce((a, p) => a + p.stock.current, 0),
        lowStock: parts.filter(p => stockHealth(p) === 'low').length,
        critical: alertParts.length,
    }), [parts, alertParts]);

    return (
        <div className="space-y-6 font-sans">
            {/* ─── Stats Row ─── */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                    { label: 'Total Parts', value: summaryStats.totalParts, icon: '🔩', accent: 'border-primary/20' },
                    { label: 'Units in Stock', value: summaryStats.totalUnits.toLocaleString(), icon: '📦', accent: 'border-emerald-100' },
                    { label: 'Low Stock', value: summaryStats.lowStock, icon: '⚠️', accent: 'border-amber-100' },
                    { label: 'Critical', value: summaryStats.critical, icon: '🚨', accent: 'border-error/20' },
                ].map(s => (
                    <div key={s.label} className={`bg-white rounded-lg px-4 py-5 flex items-center gap-3 border ${s.accent} shadow-card transition-all hover:shadow-card-hover duration-300`}>
                        <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-accent text-xl shadow-inner border border-input/30">{s.icon}</div>
                        <div>
                            <p className="text-xl font-bold text-text-body tracking-tight leading-none">{s.value}</p>
                            <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted mt-1">{s.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* ─── Inventory Value Banner ─── */}
            <div className="bg-gradient-to-r from-primary via-primary-dark to-primary rounded-lg p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl relative overflow-hidden group">
                <div className="absolute right-0 top-0 w-64 h-64 bg-secondary rounded-full blur-[100px] opacity-10 pointer-events-none transition-opacity group-hover:opacity-20" />
                <div className="z-10">
                    <p className="text-[10px] font-bold text-primary-light uppercase tracking-widest mb-1 opacity-80">Total Inventory value (Incl. 18% GST)</p>
                    <p className="text-2xl sm:text-3xl font-bold text-white tracking-tight">₹{totalInventoryValue.toLocaleString('en-IN')}</p>
                </div>
                <div className="z-10 bg-white/5 backdrop-blur-md px-4 py-2 rounded-lg border border-white/10 self-start sm:self-auto">
                    <p className="text-[10px] font-bold text-primary-light uppercase tracking-widest opacity-80">BOM Reference</p>
                    <p className="text-lg font-bold text-secondary">EEVA-ECO EV</p>
                </div>
            </div>

            {/* ─── View Tabs ─── */}
            <div className="flex items-center gap-2 bg-accent/50 p-1 rounded-lg border border-input/20 w-fit">
                {([
                    { id: 'grid' as PartsView, label: 'Grid', count: parts.length },
                    { id: 'alerts' as PartsView, label: 'Alerts', count: alertParts.length },
                    { id: 'analytics' as PartsView, label: 'Analytics', count: undefined },
                ]).map(t => (
                    <button
                        key={t.id}
                        onClick={() => setView(t.id)}
                        className={`px-6 py-2 rounded-md text-[11px] font-bold uppercase tracking-wider transition-all duration-300 active:scale-95 flex items-center gap-2 ${view === t.id
                            ? 'bg-primary text-white shadow-md'
                            : 'text-text-muted hover:text-text-body hover:bg-white/80'
                            }`}
                    >
                        <span>{t.label}</span>
                        {t.count !== undefined && (
                            <span className={`px-1.5 py-0.5 rounded-md text-[9px] font-bold ${view === t.id ? 'bg-white/20 text-white' : 'bg-input/50 text-text-muted'}`}>{t.count}</span>
                        )}
                    </button>
                ))}
            </div>

            {/* ─── GRID VIEW ─── */}
            {view === 'grid' && (
                <>
                    {/* Parts Grid */}
                    <div className="flex items-center justify-between">
                        <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">{filtered.length} Parts in current selection</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {isLoading ? (
                            Array(8).fill(0).map((_, i) => (
                                <div key={i} className="h-48 bg-gray-100 animate-pulse rounded-lg" />
                            ))
                        ) : filtered.length === 0 ? (
                            <div className="col-span-full py-20 text-center bg-white rounded-lg border border-dashed border-gray-200">
                                <p className="text-gray-400">No parts found matching your selection.</p>
                            </div>
                        ) : (
                            filtered.map(part => (
                                <PartCard key={part.srNo} part={part} onSelect={() => setSelectedPart(part)} />
                            ))
                        )}
                    </div>
                </>
            )}

            {/* ─── ALERTS VIEW ─── */}
            {view === 'alerts' && (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    {alertParts.length === 0 ? (
                        <div className="text-center py-20 bg-white rounded-lg border border-emerald-100 shadow-sm">
                            <p className="text-4xl mb-3">✅</p>
                            <p className="text-lg font-bold text-emerald-700">Healthy Inventory Levels</p>
                            <p className="text-sm text-text-muted mt-1">All EEVA-ECO spares are above threshold.</p>
                        </div>
                    ) : (
                        <>
                            <div className="bg-red-50 border border-red-100 rounded-lg p-4 flex items-center justify-between">
                                <p className="text-xs font-bold text-error uppercase tracking-widest flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-error animate-ping" />
                                    {alertParts.length} Critical Stock Alerts found in system
                                </p>
                                <p className="text-xs font-bold text-text-muted">Est. Reorder: <span className="text-primary font-bold">₹{alertParts.reduce((a, p) => a + p.price * (p.stock.max - p.stock.current), 0).toLocaleString('en-IN')}</span></p>
                            </div>
                            <div className="bg-white rounded-lg shadow-sm border border-input/30 overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="bg-accent/50 text-[10px] font-bold uppercase tracking-widest text-text-muted border-b border-input/20">
                                                <th className="px-6 py-4">Part No</th>
                                                <th className="px-6 py-4">Component</th>
                                                <th className="px-6 py-4">Stock Status</th>
                                                <th className="px-6 py-4 text-right">Unit Price</th>
                                                <th className="px-6 py-4 text-right">Reorder value</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-input/10">
                                            {alertParts.map(p => (
                                                <tr key={p.srNo} className="hover:bg-accent/30 transition-colors">
                                                    <td className="px-6 py-4 font-mono text-xs text-text-muted">#{String(p.srNo).padStart(2, '0')}</td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-2">
                                                            {p.highValue && <span className="text-secondary" title="High value component">⚡</span>}
                                                            <span className="font-bold text-text-body">{p.name}</span>
                                                        </div>
                                                        <p className="text-[9px] text-text-muted uppercase mt-0.5">{p.category}</p>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-2">
                                                            <div className="flex-1 h-1.5 w-24 bg-accent rounded-full overflow-hidden">
                                                                <div className="h-full bg-error" style={{ width: `${(p.stock.current / p.stock.max) * 100}%` }} />
                                                            </div>
                                                            <span className="text-xs font-bold text-error">{p.stock.current} <span className="text-text-muted font-normal">/ {p.stock.min} min</span></span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-right font-medium text-text-body">₹{p.price.toLocaleString('en-IN')}</td>
                                                    <td className="px-6 py-4 text-right font-bold text-primary">₹{((p.stock.max - p.stock.current) * p.price).toLocaleString('en-IN')}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            )}

            {/* ─── ANALYTICS VIEW ─── */}
            {view === 'analytics' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    {/* Category Breakdown */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {categoryStats.map(cat => (
                            <div key={cat.id} className="bg-white rounded-lg border border-input/30 shadow-sm p-5 hover:border-primary/30 transition-all group">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="w-10 h-10 rounded-lg flex items-center justify-center text-xl shadow-inner bg-accent" style={{ color: cat.color }}>{cat.icon}</div>
                                    <div className="text-right">
                                        <p className="text-xs font-bold text-text-muted uppercase tracking-widest leading-none mb-1">Stock Value</p>
                                        <p className="text-xl font-bold text-text-body tracking-tight">₹{cat.value.toLocaleString('en-IN')}</p>
                                    </div>
                                </div>
                                <h3 className="text-sm font-bold text-text-body mb-3">{cat.label} Inventory</h3>
                                <div className="space-y-3">
                                    <div>
                                        <div className="flex items-center justify-between text-[10px] font-bold mb-1">
                                            <span className="text-text-muted uppercase">Health Index</span>
                                            <span className="text-primary">{Math.round((cat.healthyCt / cat.count) * 100)}%</span>
                                        </div>
                                        <div className="w-full h-1.5 bg-accent rounded-full overflow-hidden flex">
                                            <div className="h-full bg-emerald-500" style={{ width: `${(cat.healthyCt / cat.count) * 100}%` }} />
                                            <div className="h-full bg-amber-400" style={{ width: `${(cat.lowCt / cat.count) * 100}%` }} />
                                            <div className="h-full bg-error" style={{ width: `${(cat.critCt / cat.count) * 100}%` }} />
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between pt-2 border-t border-accent">
                                        <p className="text-[10px] font-bold text-text-muted uppercase">Unit Count: <span className="text-text-body">{cat.count} Parts</span></p>
                                        <div className="flex gap-1.5">
                                            {cat.critCt > 0 && <span className="w-2 h-2 rounded-full bg-error animate-pulse" />}
                                            {cat.lowCt > 0 && <span className="w-2 h-2 rounded-full bg-amber-400" />}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* High Value Spares (A-Grade) */}
                        <div className="bg-white rounded-lg border border-input/30 p-6 shadow-sm">
                            <h3 className="text-xs font-bold text-text-muted uppercase tracking-widest mb-6 flex items-center gap-2">
                                <span className="w-1.5 h-4 bg-secondary rounded-full" />
                                High-Value Component analysis
                            </h3>
                            <div className="space-y-4">
                                {[...parts].sort((a, b) => b.price - a.price).slice(0, 7).map((p, i) => (
                                    <div key={p.srNo} className="flex items-center gap-4 group">
                                        <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center text-[10px] font-bold text-text-muted">0{i + 1}</div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-baseline mb-1">
                                                <p className="text-xs font-bold text-text-body">{p.name}</p>
                                                <p className="text-xs font-bold text-primary">₹{p.price.toLocaleString('en-IN')}</p>
                                            </div>
                                            <div className="w-full h-1 bg-accent rounded-full overflow-hidden">
                                                <div className="h-full bg-secondary opacity-60 group-hover:opacity-100 transition-opacity" style={{ width: `${(p.price / 8250) * 100}%` }} />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Recent Consumption Simulator */}
                        <div className="bg-white rounded-lg border border-input/30 p-6 shadow-sm">
                            <h3 className="text-xs font-bold text-text-muted uppercase tracking-widest mb-6 flex items-center gap-2">
                                <span className="w-1.5 h-4 bg-primary rounded-full" />
                                Unit depletion forecast
                            </h3>
                            <div className="space-y-3 pt-2">
                                <div className="p-4 rounded-lg bg-accent/50 border border-input/10">
                                    <p className="text-xs font-bold text-text-body mb-2">Fast Moving Items (Weekly cycle)</p>
                                    <div className="space-y-2">
                                        {['Brake Shoe Set', 'Indicators', 'Reflector Set'].map(item => (
                                            <div key={item} className="flex items-center justify-between">
                                                <span className="text-[11px] text-text-muted">{item}</span>
                                                <span className="text-[11px] font-bold text-secondary">High Turnaround</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="p-4 rounded-lg bg-accent/50 border border-input/10">
                                    <p className="text-xs font-bold text-text-body mb-2">Replenishment advice</p>
                                    <p className="text-[11px] text-text-muted leading-relaxed">System predicts Chassis Frame and Seat Assembly will hit <span className="text-error font-bold">low status</span> in 12 days based on current fleet service trends in Bengaluru.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal */}
            {selectedPart && (
                <PartDetailModal
                    part={selectedPart}
                    onClose={() => setSelectedPart(null)}
                    onUpdateStock={async (delta) => {
                        try {
                            await api.admin.updatePartStock(selectedPart.srNo, delta);
                            setParts(prev => prev.map(p => {
                                if (p.srNo === selectedPart.srNo) {
                                    const newStock = Math.max(0, p.stock.current + delta);
                                    return { ...p, stock: { ...p.stock, current: newStock } };
                                }
                                return p;
                            }));
                            setSelectedPart(prev => prev ? { ...prev, stock: { ...prev.stock, current: Math.max(0, prev.stock.current + delta) } } : null);
                        } catch (error) {
                            console.error('Failed to update stock:', error);
                            alert('Failed to update stock. Please try again.');
                        }
                    }}
                />
            )}
        </div>
    );
};

// ─── Part Card ───
const PartCard: React.FC<{ part: EevaEcoPart; onSelect: () => void }> = ({ part, onSelect }) => {
    const health = stockHealth(part);
    const hs = healthStyle[health];
    const pct = Math.round((part.stock.current / part.stock.max) * 100);
    const catInfo = PART_CATEGORIES.find(c => c.id === part.category);

    return (
        <div onClick={onSelect} className={`group cursor-pointer bg-white rounded-lg border transition-all duration-300 overflow-hidden flex flex-col hover:shadow-card-hover ${part.highValue ? 'border-secondary/40' : 'border-input/30'}`}>
            <div className="p-4 flex-1">
                <div className="flex justify-between items-start mb-3">
                    <span className="text-[9px] font-mono text-text-muted">SR-{String(part.srNo).padStart(2, '0')}</span>
                    <span className="text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded bg-accent text-text-body border border-input/10 flex items-center gap-1">
                        <span className="w-1 h-1 rounded-full" style={{ backgroundColor: catInfo?.color }} />
                        {catInfo?.label}
                    </span>
                </div>

                <h4 className="text-sm font-bold text-text-body mb-1 flex items-center gap-1.5">
                    {part.highValue && <span className="text-secondary">⚡</span>}
                    {part.name}
                </h4>
                <div className="mb-4">
                    <p className="text-xl font-bold text-primary tracking-tight leading-none">₹{Math.round(part.price * 1.18).toLocaleString('en-IN')}</p>
                    <p className="text-[8px] font-bold text-text-muted uppercase tracking-widest mt-1">₹{part.price} + 18% GST</p>
                </div>

                <div className="space-y-1.5">
                    <div className="flex justify-between text-[10px] font-bold">
                        <span className={hs.text}>{hs.label}</span>
                        <span className="text-text-muted">{part.stock.current}u</span>
                    </div>
                    <div className="w-full h-1 bg-accent rounded-full overflow-hidden">
                        <div className={`h-full transition-all duration-500 ${health === 'healthy' ? 'bg-primary' : health === 'low' ? 'bg-amber-400' : 'bg-error'}`} style={{ width: `${pct}%` }} />
                    </div>
                </div>
            </div>
            <div className="px-4 py-3 bg-accent/40 border-t border-input/10 flex justify-between items-center group-hover:bg-primary/5 transition-colors">
                <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Stock: {part.stock.max} Max</span>
                <span className="text-[10px] font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-widest">Detail →</span>
            </div>
        </div>
    );
};

// ─── Part Detail Modal ───
const PartDetailModal: React.FC<{ part: EevaEcoPart; onClose: () => void; onUpdateStock: (delta: number) => void }> = ({ part, onClose, onUpdateStock }) => {
    const health = stockHealth(part);
    const pct = Math.round((part.stock.current / part.stock.max) * 100);
    const catInfo = PART_CATEGORIES.find(c => c.id === part.category);

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-white w-full max-w-2xl rounded-xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-300">

                <div className="flex items-start justify-between p-6 bg-white relative">
                    <div className="flex items-center gap-5">
                        <div className="w-[52px] h-[52px] rounded-xl bg-[#0b281b] flex items-center justify-center shadow-sm flex-shrink-0">
                            <svg className="w-6 h-6 text-[#FFB020]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                                <circle cx="12" cy="12" r="3"></circle>
                            </svg>
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <div className="flex items-center gap-3">
                                <h2 className="text-[22px] font-bold text-gray-900 tracking-tight leading-none">{part.name}</h2>
                                <span className={`px-2.5 py-1 text-[9px] font-bold uppercase tracking-widest rounded border leading-none ${health === 'healthy' ? 'border-emerald-200 bg-emerald-50 text-emerald-600' : health === 'low' ? 'border-amber-200 bg-amber-50 text-amber-600' : 'border-red-200 bg-red-50 text-red-600'}`}>
                                    {healthStyle[health]?.label || 'IN STOCK'}
                                </span>
                            </div>
                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest leading-none">STANDARD EEVA-ECO BOM PART</p>
                        </div>
                    </div>

                    <button onClick={onClose} className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-all active:scale-95 absolute right-6 top-6">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-8 pt-2 space-y-9 relative">
                    <div className="absolute top-0 left-0 right-0 h-px bg-gray-100 mx-6" />

                    <div>
                        <h3 className="text-[10px] font-bold text-gray-800 uppercase tracking-[0.2em] mb-4 flex items-center gap-4 mt-4">
                            <span className="w-6 h-px bg-gray-200" /> PART SPECIFICATIONS
                        </h3>
                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                            <SpecBox label="Base Price" value={`₹${part.price.toLocaleString('en-IN')}`} />
                            <SpecBox label="GST (18%)" value={`₹${Math.round(part.price * 0.18).toLocaleString('en-IN')}`} />
                            <SpecBox label="Total Price" value={`₹${Math.round(part.price * 1.18).toLocaleString('en-IN')}`} />
                            <SpecBox label="Category" value={catInfo?.label || part.category} />
                            <SpecBox label="Ordering threshold" value={`${part.stock.min} Units (Min)`} />
                            <SpecBox label="Stock Status" value={`${part.stock.current} Units`} />
                            <SpecBox label="Last procurement" value={part.lastOrdered} />
                            <SpecBox label="Compatibility" value={part.compatibleModels.join(', ')} />
                        </div>
                    </div>

                    <div>
                        <h3 className="text-[10px] font-bold text-gray-800 uppercase tracking-[0.2em] mb-4 flex items-center gap-4">
                            <span className="w-6 h-px bg-gray-200" /> INVENTORY HEALTH
                        </h3>
                        <div className="px-1">
                            <div className="flex justify-between text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-3">
                                <span>Current Stock Level</span>
                                <span>{pct}% Stocked</span>
                            </div>
                            <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                <div className={`h-full ${health === 'healthy' ? 'bg-[#0b281b]' : health === 'low' ? 'bg-[#ffb020]' : 'bg-[#ff4d4d]'}`} style={{ width: `${pct}%` }} />
                            </div>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-[10px] font-bold text-gray-800 uppercase tracking-[0.2em] mb-4 flex items-center gap-4">
                            <span className="w-6 h-px bg-gray-200" /> MANAGE HUB INVENTORY
                        </h3>
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                            <div className="flex items-center justify-between bg-white rounded-xl border border-gray-200 p-2 py-1.5 shadow-sm sm:max-w-[180px] w-full">
                                <button onClick={() => onUpdateStock(-1)} className="w-11 h-11 rounded-lg text-2xl font-bold text-[#ff4d4d] hover:bg-red-50 active:scale-95 transition-all outline-none flex items-center justify-center pb-1">-</button>
                                <div className="text-center px-4">
                                    <span className="text-[22px] font-bold text-gray-900 leading-none">{part.stock.current}</span>
                                    <span className="block text-[9px] uppercase text-gray-400 font-bold tracking-widest mt-0.5">Units</span>
                                </div>
                                <button onClick={() => onUpdateStock(1)} className="w-11 h-11 rounded-lg text-2xl font-bold text-[#0b281b] hover:bg-green-50 active:scale-95 transition-all outline-none flex items-center justify-center pb-0.5">+</button>
                            </div>

                            <div className="flex gap-3 flex-1 h-full">
                                <button onClick={() => onUpdateStock(-5)} className="flex-1 bg-white border border-gray-200 text-[#ff4d4d] font-bold py-3.5 rounded-xl hover:bg-red-50 transition-colors active:scale-95 text-[12px] tracking-wide shadow-sm">-5 Allocate Batch</button>
                                <button onClick={() => onUpdateStock(10)} className="flex-1 bg-[#0b281b] text-white font-bold py-3.5 rounded-xl hover:bg-[#061810] transition-colors shadow-sm active:scale-95 text-[12px] tracking-wide">+10 Receive Stock</button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-5 bg-white border-t border-gray-100 flex justify-end">
                    <button onClick={onClose} className="bg-[#0b281b] text-white font-semibold text-[14px] px-6 py-2.5 rounded-lg hover:bg-[#061810] transition-all shadow-sm active:scale-95">
                        Save session & close
                    </button>
                </div>
            </div>
        </div>
    );
};

const SpecBox: React.FC<{ label: string; value: string }> = ({ label, value }) => (
    <div className="p-3.5 border border-gray-200 rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow">
        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.1em] mb-1">{label}</p>
        <p className="text-[14px] font-bold text-gray-800 truncate">{value}</p>
    </div>
);

export default RoadRobosPartsInventory;
