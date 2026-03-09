import React, { useMemo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    CogIcon,
    LightningBoltIcon,
    CheckCircleIcon,
    PlusIcon,
    SparklesIcon,
    CpuChipIcon as ChipIcon,
    RefreshIcon,
    QrcodeIcon,
    ChevronDownIcon,
    TrashIcon,
    BikeIcon
} from './icons/Icons';
import confetti from 'canvas-confetti';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { type Bike, type BikeUnit } from '../types';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export interface NewBike {
    uniqueId: string;
    chassisNumber: string;
    color: string;
    modelName: string;
    status: 'readyRent';
    battery: number;
    checks: Record<string, boolean>;
}

interface BikeFactoryProps {
    bikes: Bike[];
    bikeUnits: BikeUnit[];
    onDeploy: (modelId: number, rrsId: string, regNum: string, color: string) => void;
    onDelete?: (bikeId: number) => void;
}

const COLOR_CONFIGS: Record<string, { label: string; hex: string; bg: string; glow: string }> = {
    silver: { label: 'Silver', hex: '#E5E7EB', bg: 'bg-gray-200 text-gray-800', glow: 'rgba(229, 231, 235, 0.5)' },
    black: { label: 'Black', hex: '#1F2937', bg: 'bg-gray-800 text-white', glow: 'rgba(31, 41, 55, 0.5)' },
    red: { label: 'Red', hex: '#EF4444', bg: 'bg-red-500 text-white', glow: 'rgba(239, 68, 68, 0.5)' },
    blue: { label: 'Blue', hex: '#1E3A8A', bg: 'bg-[#1E3A8A] text-white', glow: 'rgba(30, 58, 138, 0.5)' },
    default: { label: 'Standard', hex: '#084C3E', bg: 'bg-primary text-white', glow: 'rgba(8, 76, 62, 0.2)' }
};

const BASE_CHASSIS_NUM = 1234;

const BikeFactoryManager: React.FC<BikeFactoryProps> = ({ bikes, bikeUnits, onDeploy, onDelete }) => {
    // Filter base bikes (those that are not units)
    const baseBikes = useMemo(() => bikes.filter(b => !b.name.includes(' - RRS')), [bikes]);
    const inventoryUnits = useMemo(() => bikeUnits, [bikeUnits]);

    const [selectedBikeId, setSelectedBikeId] = useState<number | null>(baseBikes[0]?.id || null);
    const [selectedColor, setSelectedColor] = useState<string>('');
    const [unitNumber, setUnitNumber] = useState<string>('');
    const [regNumber, setRegNumber] = useState<string>('');
    const [isDeploying, setIsDeploying] = useState(false);
    const [isHoveringDeploy, setIsHoveringDeploy] = useState(false);
    const [hasAttemptedDeploy, setHasAttemptedDeploy] = useState(false);

    // Auto-select first color variant when model changes
    useEffect(() => {
        const bike = baseBikes.find(b => b.id === selectedBikeId);
        if (bike && bike.colorVariants && bike.colorVariants.length > 0) {
            setSelectedColor(bike.colorVariants[0].colorName);
        } else {
            setSelectedColor('Standard');
        }
        setHasAttemptedDeploy(false); // Reset validation state on model change
    }, [selectedBikeId, baseBikes]);

    const selectedBike = useMemo(() => baseBikes.find(b => b.id === selectedBikeId), [baseBikes, selectedBikeId]);

    const activeAesthetic = useMemo(() => {
        if (selectedColor) {
            const name = selectedColor.toLowerCase();
            if (name.includes('silver')) return COLOR_CONFIGS.silver;
            if (name.includes('black')) return COLOR_CONFIGS.black;
            if (name.includes('red')) return COLOR_CONFIGS.red;
            if (name.includes('blue')) return COLOR_CONFIGS.blue;
        }
        return COLOR_CONFIGS.default;
    }, [selectedColor]);

    const previewBike = useMemo(() => {
        const paddedNum = unitNumber.padStart(4, '0');
        const rrsId = `RRS${paddedNum}`;
        return {
            uniqueId: rrsId,
            chassisNumber: `CH-KA01-${BASE_CHASSIS_NUM + inventoryUnits.length}`,
            color: selectedColor || 'Standard',
            modelName: selectedBike?.name || 'Zelio Eeva E',
            registration: regNumber || 'NOT ASSIGNED'
        };
    }, [unitNumber, regNumber, selectedColor, inventoryUnits, selectedBike]);

    const handleDeploy = () => {
        setHasAttemptedDeploy(true);

        if (!unitNumber || !selectedBikeId || !selectedColor) {
            // Visual cues will handle the error conveying instead of alert()
            return;
        }

        setIsDeploying(true);
        setTimeout(() => {
            confetti({ particleCount: 60, spread: 50, origin: { y: 0.7 } });

            onDeploy(selectedBikeId, previewBike.uniqueId, regNumber, selectedColor);
            setUnitNumber('');
            setRegNumber('');
            setHasAttemptedDeploy(false);
            setIsDeploying(false);
            // We keep the selected bike and color for batch addition if needed

            try {
                const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
                if (ctx) {
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();
                    osc.connect(gain);
                    gain.connect(ctx.destination);
                    osc.frequency.setValueAtTime(800, ctx.currentTime);
                    osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.1);
                    gain.gain.setValueAtTime(0.5, ctx.currentTime);
                    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
                    osc.start();
                    osc.stop(ctx.currentTime + 0.1);
                }
            } catch (e) { /* ignore */ }
        }, 1200);
    };

    return (
        <div className="w-full space-y-8 animate-in fade-in duration-700">
            {/* ─── FACTORY SECTION ─── */}
            <div className="w-full min-h-[500px] bg-white rounded-3xl shadow-premium border border-gray-100 overflow-hidden flex flex-col xl:flex-row relative">
                <motion.div
                    animate={{ backgroundColor: activeAesthetic.glow, scale: isHoveringDeploy ? 1.2 : 1 }}
                    className="absolute -top-40 -left-40 w-96 h-96 blur-[120px] rounded-full opacity-20 pointer-events-none z-0"
                />

                {/* LEFT: COMMAND CENTER */}
                <div className="w-full xl:w-[400px] p-8 flex flex-col z-10 border-b xl:border-b-0 xl:border-r border-gray-100 bg-white/40 backdrop-blur-xl">
                    <div className="mb-8">
                        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-3">
                            <div className="p-3 bg-primary/10 rounded-2xl">
                                <PlusIcon className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-[#0A2540] tracking-tight">Stock Factory</h2>
                                <p className="text-[10px] uppercase font-black text-gray-400 mt-0.5 tracking-[0.2em]">Asset Configuration</p>
                            </div>
                        </motion.div>
                    </div>

                    <div className="space-y-6 flex-1">
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-2.5">
                            <label className="text-[10px] font-black uppercase text-[#0A2540] tracking-[0.15em]">Step 1: Select Model & Color</label>
                            <div className="relative">
                                <select
                                    value={selectedBikeId || ''}
                                    onChange={(e) => setSelectedBikeId(Number(e.target.value))}
                                    className="w-full bg-white border-2 border-gray-100 p-4 rounded-xl text-sm font-bold text-[#0A2540] appearance-none focus:border-primary transition-all outline-none"
                                >
                                    {baseBikes.map(bike => (
                                        <option key={bike.id} value={bike.id}>{bike.name}</option>
                                    ))}
                                </select>
                                <ChevronDownIcon className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                            </div>

                            {/* Integrated Color Selection */}
                            <div className="grid grid-cols-2 gap-2 mt-4">
                                {(selectedBike?.colorVariants || []).map((cv, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setSelectedColor(cv.colorName)}
                                        className={cn(
                                            "p-3 rounded-xl border-2 text-xs font-bold transition-all flex items-center gap-2",
                                            selectedColor === cv.colorName
                                                ? "border-primary bg-primary/5 text-primary"
                                                : "border-gray-100 hover:border-gray-200 text-gray-400 bg-white"
                                        )}
                                    >
                                        <div className="w-3 h-3 rounded-full shadow-inner" style={{ backgroundColor: COLOR_CONFIGS[cv.colorName.toLowerCase()]?.hex || '#ccc' }} />
                                        {cv.colorName}
                                    </button>
                                ))}
                            </div>
                        </motion.div>

                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="space-y-2.5">
                            <label className="text-[10px] font-black uppercase text-[#0A2540] tracking-[0.15em]">Step 2: Assign Unique ID (Required)</label>
                            <div className="flex items-center gap-0">
                                <div className="h-[54px] bg-gray-100 px-4 flex items-center justify-center rounded-l-xl border-2 border-r-0 border-gray-100 font-black text-gray-400 font-mono tracking-tighter shadow-inner">
                                    <span className="text-sm">RRS</span>
                                </div>
                                <input
                                    type="text"
                                    value={unitNumber}
                                    onChange={(e) => {
                                        setUnitNumber(e.target.value.replace(/[^0-9]/g, '').slice(0, 4));
                                        if (hasAttemptedDeploy) setHasAttemptedDeploy(false);
                                    }}
                                    className={cn(
                                        "flex-1 h-[54px] bg-white border-2 p-4 rounded-r-xl text-lg font-mono font-black text-primary outline-none transition-all tabular-nums",
                                        hasAttemptedDeploy && !unitNumber ? "border-red-500 focus:border-red-500" : "border-gray-100 focus:border-primary"
                                    )}
                                    placeholder="0001"
                                />
                            </div>
                            {hasAttemptedDeploy && !unitNumber && (
                                <p className="text-xs text-red-500 font-bold mt-1">Unique ID is required to deploy</p>
                            )}
                        </motion.div>

                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="space-y-2.5">
                            <label className="text-[10px] font-black uppercase text-[#0A2540] tracking-[0.15em]">Step 3: Plate Number (Optional)</label>
                            <input
                                type="text"
                                value={regNumber}
                                onChange={(e) => setRegNumber(e.target.value.toUpperCase())}
                                className="w-full bg-white border-2 border-gray-100 p-4 rounded-xl text-lg font-mono font-black text-primary outline-none focus:border-primary transition-all tabular-nums"
                                placeholder="KA-05-EB-1234"
                            />
                        </motion.div>
                    </div>

                    <div className="mt-10">
                        <button
                            onMouseEnter={() => setIsHoveringDeploy(true)}
                            onMouseLeave={() => setIsHoveringDeploy(false)}
                            onClick={handleDeploy}
                            disabled={isDeploying || !unitNumber}
                            className={cn(
                                "w-full py-5 rounded-2xl font-black uppercase tracking-widest text-sm shadow-2xl transition-all duration-500 flex items-center justify-center gap-3 relative overflow-hidden group",
                                (isDeploying || !unitNumber) ? "bg-gray-100 text-gray-400 cursor-not-allowed shadow-none" : "bg-primary text-white hover:shadow-primary/30 hover:-translate-y-1 active:scale-95"
                            )}
                        >
                            {isDeploying ? (
                                <><RefreshIcon className="w-5 h-5 animate-spin" /><span>Registering...</span></>
                            ) : (
                                <><span>Deploy to Fleet</span><LightningBoltIcon className="w-5 h-5 text-secondary animate-pulse" /></>
                            )}
                            {!isDeploying && unitNumber && <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite]" />}
                        </button>
                    </div>
                </div>

                {/* RIGHT: LIVE UNIT PREVIEW */}
                <div className="flex-1 bg-gray-50/55 p-8 flex flex-col items-center justify-center relative">
                    <div className="absolute top-8 left-8 flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#0A2540]">Unit Configuration Preview</h3>
                    </div>

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={previewBike.uniqueId + selectedBikeId}
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                            className="w-full max-w-[340px] bg-white rounded-3xl p-8 border border-gray-100 shadow-2xl relative overflow-hidden group"
                        >
                            <div className="absolute inset-0 opacity-[0.04] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 1.2px, transparent 1.2px)', backgroundSize: '16px 16px' }} />
                            <div className="flex items-center justify-between mb-8 relative z-10">
                                <div className="flex items-center gap-2.5">
                                    <div className={cn("w-4 h-4 rounded-full shadow-inner", activeAesthetic.bg)} />
                                    <span className="text-xs font-black uppercase tracking-widest text-[#0A2540]">{activeAesthetic.label}</span>
                                </div>
                                <div className="px-3 py-1.5 bg-primary/5 rounded-full border border-primary/10">
                                    <span className="text-[10px] font-black text-primary uppercase tracking-widest">Single Unit</span>
                                </div>
                            </div>
                            <div className="space-y-1 mb-8">
                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">Asset Identifier</p>
                                <h4 className="text-4xl font-black tracking-tighter text-[#0A2540] font-mono group-hover:text-primary transition-colors">{previewBike.uniqueId}</h4>
                                <p className="text-[10px] font-bold text-primary mt-1">{previewBike.modelName} - {previewBike.uniqueId}</p>
                            </div>
                            <div className="pt-6 border-t border-gray-50 space-y-4 relative z-10">
                                <div className="flex justify-between">
                                    <div className="space-y-1">
                                        <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Model Base</p>
                                        <p className="text-sm font-bold text-[#0A2540]">{previewBike.modelName}</p>
                                    </div>
                                    <div className="space-y-1 text-right">
                                        <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Status</p>
                                        <p className="text-xs font-black text-emerald-500 uppercase flex items-center justify-end gap-1.5"><CheckCircleIcon className="w-3.5 h-3.5" /> Ready</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl border border-gray-100">
                                    <div className="flex-1">
                                        <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Plate Recognition</p>
                                        <p className="text-xs font-mono font-bold text-[#0A2540]">{previewBike.registration}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl border border-gray-100">
                                    <ChipIcon className="w-5 h-5 text-primary" />
                                    <div className="flex-1">
                                        <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">System Hash (Chassis)</p>
                                        <p className="text-xs font-mono font-bold text-[#0A2540]">{previewBike.chassisNumber}</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>

            {/* ─── RECENTLY DEPLOYED SECTION ─── */}
            <div className="bg-[#0A2540] rounded-3xl p-8 overflow-hidden relative group">
                <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 blur-[100px] pointer-events-none" />

                <div className="flex items-center justify-between mb-8 relative z-10">
                    <div>
                        <h2 className="text-xl font-black text-white tracking-tight uppercase italic">Factory Log / Recent Activity</h2>
                        <p className="text-xs font-bold text-white/40 uppercase tracking-widest mt-1">Live from the assembly floor</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="px-4 py-2 bg-white/5 rounded-xl border border-white/10 flex items-center gap-3">
                            <span className="text-[10px] font-black text-white uppercase tracking-widest">{inventoryUnits.length} Units Active</span>
                        </div>
                    </div>
                </div>

                <div className="flex flex-wrap gap-4 pb-4">
                    {inventoryUnits.slice(-8).reverse().map((unit) => (
                        <motion.div
                            key={unit.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex-1 min-w-[240px] max-w-[320px] bg-white/5 hover:bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/10 transition-all hover:border-white/20 group/unit shadow-lg"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-[10px] font-mono text-white/60 tracking-wider">#{unit.unit_number}</span>
                                <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                            </div>
                            <h4 className="text-sm font-bold text-white truncate mb-1">{unit.bikes?.name || 'Asset'}</h4>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLOR_CONFIGS[unit.color_name?.toLowerCase()]?.hex || '#666' }} />
                                <p className="text-[9px] font-black text-white/70 uppercase tracking-[0.2em]">{unit.color_name || 'Standard'}</p>
                            </div>
                            <p className="text-[9px] font-black text-primary uppercase tracking-[0.2em] mt-1">{unit.registration_number || 'REG: PENDING'}</p>

                            <div className="mt-4 flex items-center justify-between pt-4 border-t border-white/5">
                                <span className="text-[8px] font-black text-white/30 uppercase tracking-widest">{new Date(unit.created_at).toLocaleDateString()}</span>
                                <span className="px-2 py-0.5 text-[9px] font-black text-secondary uppercase tracking-widest italic bg-secondary/10 rounded-lg">{unit.status}</span>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* ─── ASSET REGISTRY TABLE ─── */}
            <div className="bg-white rounded-3xl shadow-premium border border-gray-100 overflow-hidden">
                <div className="p-8 border-b border-gray-100 flex items-center justify-between bg-gray-50/30">
                    <div>
                        <h2 className="text-xl font-black text-[#0A2540] tracking-tight uppercase">Master Registry</h2>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Full database of physical stock</p>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-white text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 border-b border-gray-100">
                                <th className="px-8 py-5">Asset ID</th>
                                <th className="px-8 py-5">Variant / Model</th>
                                <th className="px-8 py-5">Color</th>
                                <th className="px-8 py-5">Plate Number</th>
                                <th className="px-8 py-5">Status</th>
                                {onDelete && <th className="px-8 py-5 text-right">Actions</th>}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {inventoryUnits.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="py-20 text-center">
                                        <p className="text-sm font-bold text-gray-300 uppercase tracking-widest italic">Warehouse Empty</p>
                                    </td>
                                </tr>
                            ) : (
                                inventoryUnits.slice().reverse().map((unit) => (
                                    <tr key={unit.id} className="group hover:bg-gray-50/50 transition-colors">
                                        <td className="px-8 py-5">
                                            <span className="text-sm font-black text-[#0A2540] font-mono">#{unit.unit_number}</span>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLOR_CONFIGS[unit.color_name.toLowerCase()]?.hex || '#084C3E' }} />
                                                <span className="text-sm font-bold text-gray-700">{unit.bikes?.name || 'Base Model'}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-2.5 h-2.5 rounded-full shadow-inner border border-black/10" style={{ backgroundColor: COLOR_CONFIGS[unit.color_name?.toLowerCase()]?.hex || '#ccc' }} />
                                                <span className="text-sm font-bold text-[#0A2540]">{unit.color_name || 'Standard'}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-4">
                                            <span className="text-xs font-mono font-black text-gray-400">{unit.registration_number || '-'}</span>
                                        </td>
                                        <td className="px-8 py-4">
                                            <span className={cn(
                                                "text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full",
                                                unit.status === 'Ready' ? "bg-emerald-50 text-emerald-600 border border-emerald-100" :
                                                    unit.status === 'In Service' ? "bg-blue-50 text-blue-600 border border-blue-100" :
                                                        "bg-amber-50 text-amber-600 border border-amber-100"
                                            )}>
                                                {unit.status}
                                            </span>
                                        </td>
                                        {onDelete && (
                                            <td className="px-8 py-5 text-right">
                                                <button
                                                    onClick={() => onDelete(Number(unit.bike_id))}
                                                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                                >
                                                    <TrashIcon className="w-4 h-4" />
                                                </button>
                                            </td>
                                        )}
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <style>{`
                @keyframes shimmer { 100% { transform: translateX(100%); } }
            `}</style>
        </div>
    );
};

export default BikeFactoryManager;
