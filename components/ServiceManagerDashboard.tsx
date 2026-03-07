import React, { useState, useMemo, useEffect } from 'react';
import Card from './Card';
import {
    CogIcon,
    WrenchIcon,
    ClipboardListIcon,
    ExclamationIcon,
    CheckCircleIcon,
    ClockIcon,
    LogoutIcon,
    UserCircleIcon,
    SearchIcon,
    ChevronRightIcon,
    MenuAlt2Icon,
    InboxIcon,
    PlayIcon,
    RefreshIcon
} from './icons/Icons';
import { EEVA_ECO_PARTS, PART_CATEGORIES, type EevaEcoPart, type PartCategory } from '../data/eevaPartsData';
import { type AdminUser, type Bike, type BikeUnit } from '../types';
import { api } from '../src/api';

interface ServiceManagerDashboardProps {
    user: AdminUser;
    onLogout: () => void;
    bikes: Bike[];
    bikeUnits: BikeUnit[];
    onUpdateBike?: (id: number, bike: Partial<Bike>) => Promise<void>;
    onUpdateUnit?: (id: string, unit: Partial<BikeUnit>) => Promise<void>;
}

type ServicePanel = 'queue' | 'history' | 'inventory' | 'team' | 'alerts';
type FilterStatus = 'all' | 'pending' | 'in_progress' | 'completed';

const ServiceGradientCard = ({
    label, value, color, icon: Icon, sublabel, onClick
}: {
    label: string;
    value: string | number;
    color: 'green' | 'blue' | 'purple' | 'orange';
    icon: any;
    sublabel?: string;
    onClick?: () => void;
}) => {
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
                        <p className="text-[10px] font-black text-white/70 uppercase tracking-[0.2em] leading-none">{label}</p>
                    </div>
                    {sublabel && (
                        <p className="mt-2 text-[9px] font-bold uppercase tracking-widest text-white/50">{sublabel}</p>
                    )}
                </div>

                {/* Glassy line at bottom */}
                <div className="mt-4 h-[1px] w-full bg-white/5" />
            </div>
        </div>
    );
};

const ServiceCard: React.FC<{
    bike: Bike,
    onUpdateStatus: (id: number | string, status: string, additionalData?: any) => void
}> = ({ bike, onUpdateStatus }) => {
    const isCritical = bike.availability === 'Critical Fix';
    const currentStatus = bike.service_status || 'pending';
    const [isWorkbenchOpen, setIsWorkbenchOpen] = useState(false);

    // Use the bike's existing checks or provide defaults
    const [localChecks, setLocalChecks] = useState<Record<string, string>>(
        bike.checks || {
            'Battery Health': 'completed',
            'Motor Controller': 'completed',
            'Hydraulic Brakes': 'pending',
            'Tire Pressure': 'pending',
            'System Flash': 'pending',
            'Light Array': 'pending',
            'Bodywork': 'pending',
            'Suspension': 'pending',
            'TFT Display': 'pending',
            'Sanitization': 'pending'
        }
    );

    const [selectedParts, setSelectedParts] = useState<any[]>(bike.spareParts || []);

    const toggleCheck = (label: string) => {
        if (currentStatus !== 'in_progress') return;
        setLocalChecks(prev => ({
            ...prev,
            [label]: prev[label] === 'completed' ? 'pending' : 'completed'
        }));
    };

    const addPart = (part: any) => {
        if (currentStatus !== 'in_progress') return;
        const baseCost = part.cost;
        const tax = Math.round(baseCost * 0.18);
        const total = baseCost + tax;

        setSelectedParts(prev => [
            ...prev,
            { ...part, tax, total, timestamp: new Date().toISOString() }
        ]);
    };

    const removePart = (index: number) => {
        if (currentStatus !== 'in_progress') return;
        setSelectedParts(prev => prev.filter((_, i) => i !== index));
    };

    const completedCount = Object.values(localChecks).filter(v => v === 'completed').length;
    const totalChecks = Object.keys(localChecks).length;
    const progress = Math.round((completedCount / totalChecks) * 100);
    const allDone = progress === 100;

    const totalPartsCost = selectedParts.reduce((acc, p) => acc + p.total, 0);

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'pending': return <InboxIcon className="w-4 h-4" />;
            case 'in_progress': return <PlayIcon className="w-4 h-4" />;
            case 'completed': return <CheckCircleIcon className="w-4 h-4" />;
            default: return <ClockIcon className="w-4 h-4" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'bg-amber-50 text-amber-700 border-amber-100';
            case 'in_progress': return 'bg-blue-50 text-blue-700 border-blue-100';
            case 'completed': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
            default: return 'bg-gray-50 text-gray-700 border-gray-100';
        }
    };

    const getNextStatusInfo = (status: string) => {
        switch (status) {
            case 'pending':
                return { nextStatus: 'in_progress', buttonLabel: 'Initiate Service', icon: <PlayIcon className="w-4 h-4" />, disabled: false };
            case 'in_progress':
                return {
                    nextStatus: 'completed',
                    buttonLabel: allDone ? 'Submit for Audit' : 'Diag. Incomplete',
                    icon: <CheckCircleIcon className="w-4 h-4" />,
                    disabled: !allDone
                };
            default:
                return { nextStatus: status, buttonLabel: 'Awaiting Verification', icon: <ClockIcon className="w-4 h-4" />, disabled: true };
        }
    };

    const { nextStatus, buttonLabel, icon, disabled } = getNextStatusInfo(currentStatus);

    return (
        <div className={`group bg-white rounded-3xl border border-input/30 transition-all duration-500 overflow-hidden flex flex-col hover:shadow-2xl hover:-translate-y-1 ${isCritical ? 'border-error/40 shadow-lg shadow-error/10' : 'shadow-xl shadow-black/5'}`}>
            {/* Status Color Band (Subtle) */}
            <div className={`h-2 w-full ${isCritical ? 'bg-gradient-to-r from-error to-red-400' :
                currentStatus === 'completed' ? 'bg-gradient-to-r from-emerald-500 to-teal-400' :
                    currentStatus === 'in_progress' ? 'bg-gradient-to-r from-blue-500 to-indigo-400' : 'bg-gradient-to-r from-amber-400 to-orange-300'
                }`} />

            <div className="p-5 flex-1 flex flex-col">
                <div className="flex justify-between items-center mb-4">
                    <span className="text-[10px] font-mono text-text-muted uppercase">
                        {(bike as any).unit?.unit_number || `SR-#${bike.id.toString().padStart(4, '0')}`}
                    </span>
                    <div className={`px-2 py-0.5 text-[9px] font-bold rounded border uppercase tracking-widest flex items-center gap-1.5 ${getStatusColor(currentStatus)}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${getStatusColor(currentStatus).split(' ')[0]}`} />
                        {currentStatus.replace('_', ' ')}
                    </div>
                </div>

                <div className="flex gap-4 mb-4">
                    <div className="w-16 h-16 rounded-lg bg-accent flex items-center justify-center p-2 border border-input/10">
                        {bike.images?.[0] ? (
                            <img src={bike.images[0]} alt={bike.name} className="w-full h-full object-contain mix-blend-multiply" />
                        ) : (
                            <WrenchIcon className="w-8 h-8 text-text-muted" />
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <h4 className="text-lg font-bold text-text-body leading-tight tracking-tight mb-0.5 truncate uppercase">{bike.name}</h4>
                        <div className="flex items-center gap-2">
                            <p className={`text-[10px] font-bold uppercase tracking-wider ${isCritical ? 'text-error' : 'text-text-muted'}`}>
                                {isCritical ? 'CRITICAL MISSION' : 'STANDARD OPS'} &bull; {bike.assignedTech || 'UNASSIGNED'}
                            </p>
                            {selectedParts.length > 0 && (
                                <span className="flex items-center gap-1 px-1.5 py-0.5 bg-emerald-100 text-emerald-700 text-[8px] font-black rounded-full uppercase animate-pulse">
                                    <CogIcon className="w-2 h-2" />
                                    {selectedParts.length} Parts
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <div>
                        <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider mb-1.5">
                            <span className="text-text-body">Workbench Progress</span>
                            <span className={`${allDone ? 'text-emerald-500' : 'text-primary'}`}>{progress}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-accent rounded-full overflow-hidden">
                            <div
                                className={`h-full transition-all duration-1000 ease-out ${allDone ? 'bg-emerald-500' : 'bg-primary'}`}
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    </div>

                    <button
                        onClick={() => setIsWorkbenchOpen(!isWorkbenchOpen)}
                        className={`w-full py-4 rounded-xl border text-[11px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all duration-300 shadow-lg ${isWorkbenchOpen ? 'bg-primary text-white border-primary shadow-primary/20 hover:bg-primary/90' : 'bg-white border-input/30 hover:border-primary/40 text-text-body hover:shadow-md'}`}
                    >
                        <ClipboardListIcon className={`w-5 h-5 transition-transform duration-300 ${isWorkbenchOpen ? 'rotate-180 opacity-70' : 'group-hover:scale-110'}`} />
                        {isWorkbenchOpen ? 'Close Report' : 'Open Report'}
                    </button>

                    <div className={`overflow-hidden transition-all duration-500 ease-in-out ${isWorkbenchOpen ? 'max-h-[1200px] opacity-100' : 'max-h-0 opacity-0'}`}>
                        {/* 10-Point Checklist */}
                        <div className="mt-6 mb-6">
                            <h5 className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-3">Diagnostic Sequence</h5>
                            <div className="grid grid-cols-2 gap-2">
                                {Object.entries(localChecks).map(([label, status]) => (
                                    <button
                                        key={label}
                                        disabled={currentStatus !== 'in_progress'}
                                        onClick={() => toggleCheck(label)}
                                        className={`flex items-center justify-between p-4 rounded-xl border transition-all duration-300 ${status === 'completed'
                                            ? 'bg-emerald-50/50 border-emerald-200 text-emerald-700 shadow-sm'
                                            : 'bg-gray-50/50 border-input/20 text-text-muted hover:border-primary/30'
                                            } ${currentStatus === 'in_progress' ? 'active:scale-95' : 'opacity-80 cursor-not-allowed'}`}
                                    >
                                        <span className="text-[10px] font-black uppercase truncate pr-2 tracking-tighter">{label}</span>
                                        {status === 'completed' ? (
                                            <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                                                <CheckCircleIcon className="w-3.5 h-3.5 text-white" />
                                            </div>
                                        ) : <div className="w-5 h-5 rounded-full border-2 border-input/30 bg-white" />}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Spares Bay */}
                        <div className="mb-6 pt-6 border-t border-input/10">
                            <div className="flex justify-between items-center mb-3">
                                <h5 className="text-[10px] font-black uppercase tracking-widest text-text-muted">Logistics Bay</h5>
                                <div className="text-right">
                                    <span className="text-[12px] font-bold text-emerald-600">₹{totalPartsCost}</span>
                                </div>
                            </div>

                            <div className="space-y-2 mb-4 max-h-48 overflow-y-auto scrollbar-hide">
                                {selectedParts.map((part, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-3 bg-accent rounded-md border border-input/10">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-bold text-text-body uppercase">{part.name}</span>
                                            <span className="text-[8px] font-bold text-text-muted uppercase tracking-tighter">₹{part.total} incl. GST</span>
                                        </div>
                                        {currentStatus === 'in_progress' && (
                                            <button onClick={() => removePart(idx)} className="text-text-muted hover:text-error transition-colors">
                                                ×
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {currentStatus === 'in_progress' && (
                                <div className="grid grid-cols-2 gap-2 p-2 bg-white border border-dashed border-input/30 rounded-lg max-h-48 overflow-y-auto scrollbar-hide">
                                    {EEVA_ECO_PARTS.map(part => {
                                        const isAlreadyAdded = selectedParts.some(p => (p.id === part.srNo || p.srNo === part.srNo));
                                        return (
                                            <button
                                                key={part.srNo}
                                                onClick={() => addPart({ ...part, id: part.srNo, cost: part.price })}
                                                className={`p-2 border rounded-md text-left transition-all text-[9px] font-bold uppercase tracking-tight flex items-center justify-between group/part ${isAlreadyAdded
                                                    ? 'bg-emerald-50 border-emerald-100 text-emerald-700'
                                                    : 'bg-white border-input/30 text-text-muted hover:border-primary/30 hover:text-text-body'}`}
                                            >
                                                <span className="truncate pr-1">{part.name}</span>
                                                <span className={`${isAlreadyAdded ? 'text-emerald-500' : 'text-gray-400 group-hover/part:text-primary'}`}>+</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-auto px-5 py-4 bg-accent/50 border-t border-input/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white/50">
                        <UserCircleIcon className="w-5 h-5" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-text-body uppercase tracking-tight">{bike.assignedTech || 'Ravi Shankar'}</span>
                        <span className="text-[8px] font-bold text-text-muted uppercase tracking-widest leading-none">Lead Tech</span>
                    </div>
                </div>
                <button
                    disabled={disabled}
                    onClick={() => onUpdateStatus(bike.id, nextStatus, { checks: localChecks, spareParts: selectedParts })}
                    className={`px-4 py-2 text-[10px] font-bold uppercase tracking-widest rounded-md transition-all flex items-center gap-2 ${disabled
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-input/20'
                        : 'bg-[#0b281b] text-white hover:bg-black shadow-sm shadow-black/10'
                        }`}
                >
                    {icon}
                    {buttonLabel}
                </button>
            </div>

            {/* Auto-save/Manual Save Indicator for Workbench */}
            {currentStatus === 'in_progress' && (
                <div className="px-5 py-2 bg-white border-t border-input/5 flex justify-end">
                    <button
                        onClick={() => onUpdateStatus(bike.id, 'in_progress', { checks: localChecks, spareParts: selectedParts })}
                        className="text-[9px] font-black text-primary uppercase tracking-widest hover:underline flex items-center gap-1"
                    >
                        <RefreshIcon className="w-3 h-3" />
                        Save Workbench Progress
                    </button>
                </div>
            )}
        </div>
    );
};
const FILTER_CONFIGS: Record<ServicePanel, { placeholder: string, filters: { id: string, label: string, color?: string, icon?: string }[] }> = {
    queue: {
        placeholder: "Search units by ID or name...",
        filters: [
            { id: 'all', label: 'All Units' },
            { id: 'pending', label: 'Pending Service' },
            { id: 'in_progress', label: 'In Progress' }
        ]
    },
    history: {
        placeholder: "Search repair logs...",
        filters: [
            { id: 'all', label: 'All History' },
            { id: 'Verified', label: 'Verified' },
            { id: 'In Audit', label: 'In Audit' }
        ]
    },
    inventory: {
        placeholder: "Search spares by name or SR#...",
        filters: [
            { id: 'ALL', label: 'All Spares' },
            ...PART_CATEGORIES.map(c => ({ id: c.id, label: c.label, color: c.color, icon: c.icon }))
        ]
    },
    team: {
        placeholder: "Search staff...",
        filters: [
            { id: 'all', label: 'All Staff' },
            { id: 'Online', label: 'Online' },
            { id: 'Busy', label: 'Busy' },
            { id: 'Away', label: 'Away' }
        ]
    },
    alerts: {
        placeholder: "Search telemetry...",
        filters: [
            { id: 'all', label: 'All Alerts' },
            { id: 'Critical', label: 'Critical' },
            { id: 'Warning', label: 'Warning' },
            { id: 'Info', label: 'Info' }
        ]
    }
};

const ServiceManagerDashboard: React.FC<ServiceManagerDashboardProps> = ({ user, onLogout, bikes, bikeUnits, onUpdateBike, onUpdateUnit }) => {
    const [activePanel, setActivePanel] = useState<ServicePanel>('queue');
    const [filterStatus, setFilterStatus] = useState<FilterStatus>('all'); // Used for Queue
    const [searchQuery, setSearchQuery] = useState('');
    const [filterCat, setFilterCat] = useState<PartCategory | 'ALL'>('ALL'); // Used for Inventory
    const [historyFilter, setHistoryFilter] = useState('all');
    const [teamFilter, setTeamFilter] = useState('all');
    const [alertsFilter, setAlertsFilter] = useState('all');
    const [inventoryParts, setInventoryParts] = useState<EevaEcoPart[]>(EEVA_ECO_PARTS);
    const [team, setTeam] = useState<any[]>([]);
    const [history, setHistory] = useState<any[]>([]);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchDashboardData = async () => {
            setLoading(true);
            try {
                const [partsData, employeesData, logsData] = await Promise.all([
                    api.admin.getPartsInventory(),
                    api.admin.getEmployees(),
                    api.admin.getServiceLogs ? api.admin.getServiceLogs() : Promise.resolve([])
                ]);
                setInventoryParts(partsData.length > 0 ? partsData : EEVA_ECO_PARTS);
                setTeam(employeesData.length > 0 ? employeesData : [
                    { name: 'Ravi Shankar', role: 'Lead Mechanic', status: 'Online', specialty: 'Drivetrain', tasks: 3, avatar: 'RS' },
                    { name: 'Priya Das', role: 'Diagnostics Expert', status: 'Busy', specialty: 'Electronics', tasks: 5, avatar: 'PD' },
                    { name: 'Arjun Mehra', role: 'Junior Tech', status: 'Online', specialty: 'Assembly', tasks: 2, avatar: 'AM' },
                    { name: 'Sarah Khan', role: 'Battery Specialist', status: 'Away', specialty: 'EV Systems', tasks: 0, avatar: 'SK' },
                    { name: 'Vijay Varma', role: 'Quality Control', status: 'Online', specialty: 'Final Inspection', tasks: 4, avatar: 'VV' },
                ]);
                setHistory(logsData.length > 0 ? logsData : [
                    { id: '102k', name: 'Ather 450X', tech: 'Ravi S.', parts: 'Brake Pads', cost: 750, date: 'Mar 05, 2026', status: 'Verified' },
                    { id: '105p', name: 'Activa 6G', tech: 'Priya D.', parts: 'Battery', cost: 4200, date: 'Mar 04, 2026', status: 'Verified' },
                    { id: '209x', name: 'MT-15 V2', tech: 'Arjun M.', parts: 'Chain Kit', cost: 1850, date: 'Mar 03, 2026', status: 'In Audit' },
                    { id: '311m', name: 'Classic 350', tech: 'Ravi S.', parts: 'Mirror Set', cost: 600, date: 'Mar 02, 2026', status: 'Verified' },
                ]);
            } catch (error) {
                console.error("Failed to fetch dashboard data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, []);

    // Derived Stats
    const stats = useMemo(() => {
        const queueUnits = bikeUnits.filter(u => u.status === 'In Service');
        const queueModels = bikes.filter(b => b.availability === 'Maintenance' || b.availability === 'Service');

        const allQueue = [
            ...queueModels.map(b => ({ service_status: b.service_status || 'pending' })),
            ...queueUnits.map(u => ({ service_status: (u as any).service_status || 'pending' }))
        ];

        return {
            inService: allQueue.length,
            pending: allQueue.filter(q => q.service_status === 'pending').length,
            inProgress: allQueue.filter(q => q.service_status === 'in_progress').length,
            completed: allQueue.filter(q => q.service_status === 'completed').length,
            avgWaitTime: '4.2 hrs'
        };
    }, [bikes, bikeUnits]);

    const serviceQueue = useMemo(() => {
        const unitsInQueue = bikeUnits
            .filter(u => u.status === 'In Service')
            .map(u => {
                const parent = bikes.find(b => Number(b.id) === Number(u.bike_id)) || bikes[0];
                return {
                    ...parent,
                    id: u.id as any, // Cast to numeric-compatible for types, but it's a string
                    name: `${parent.name} - ${u.unit_number}`,
                    service_status: (u as any).service_status || 'pending',
                    unit: u, // Attach unit info
                    availability: 'Service' as const
                };
            });

        const modelsInQueue = bikes
            .filter(b => b.availability === 'Maintenance' || b.availability === 'Service' || b.availability === 'In Service')
            .map(b => ({ ...b, service_status: b.service_status || 'pending' }));

        return [...unitsInQueue, ...modelsInQueue]
            .filter(b => filterStatus === 'all' || b.service_status === filterStatus)
            .filter(b => b.name.toLowerCase().includes(searchQuery.toLowerCase()) || b.id.toString().includes(searchQuery));
    }, [bikes, bikeUnits, searchQuery, filterStatus]);

    const filteredHistory = useMemo(() => {
        return history
            .filter(item => historyFilter === 'all' || item.status === historyFilter)
            .filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()) || (item.id || '').toLowerCase().includes(searchQuery.toLowerCase()) || (item.tech || '').toLowerCase().includes(searchQuery.toLowerCase()));
    }, [searchQuery, historyFilter, history]);

    const filteredTeam = useMemo(() => {
        return team
            .filter(tech => teamFilter === 'all' || tech.status === teamFilter)
            .filter(tech => tech.name.toLowerCase().includes(searchQuery.toLowerCase()) || (tech.role || '').toLowerCase().includes(searchQuery.toLowerCase()));
    }, [searchQuery, teamFilter, team]);

    const filteredAlerts = useMemo(() => {
        const raw: { unit: string; msg: string; time: string; level: string; bikeId?: number | string; type: 'unit' | 'model' }[] = [];

        bikes.forEach(bike => {
            if (bike.availability === 'Critical Fix') {
                raw.push({ unit: `MDL-${bike.id}`, msg: `Critical hardware fault reported on ${bike.name}`, time: 'Just now', level: 'Critical', bikeId: bike.id, type: 'model' });
            } else if (bike.availability === 'Maintenance' || bike.availability === 'Service' || bike.availability === 'In Service') {
                raw.push({ unit: `MDL-${bike.id}`, msg: `Scheduled maintenance pending for ${bike.name}`, time: 'Recent', level: 'Warning', bikeId: bike.id, type: 'model' });
            }
        });

        bikeUnits.forEach(unit => {
            const parent = bikes.find(b => Number(b.id) === Number(unit.bike_id));
            if (unit.status === 'In Service') {
                const level = parent?.availability === 'Critical Fix' ? 'Critical' : 'Warning';
                const msg = level === 'Critical' ? `Critical alert: unit requires immediate attention` : `Unit flagged for routine service inspection`;
                raw.push({ unit: unit.unit_number, msg: `${msg} (${parent?.name || 'Unknown'})`, time: 'Recent', level, bikeId: unit.id, type: 'unit' });
            }
        });

        return raw
            .filter(alert => alertsFilter === 'all' || alert.level === alertsFilter)
            .filter(alert => alert.msg.toLowerCase().includes(searchQuery.toLowerCase()) || alert.unit.toLowerCase().includes(searchQuery.toLowerCase()));
    }, [searchQuery, alertsFilter, bikes, bikeUnits]);

    const handleUpdatePartStock = async (srNo: string | number, delta: number) => {
        try {
            await api.admin.updatePartStock(Number(srNo), delta);
            setInventoryParts(prev => prev.map(p =>
                p.srNo === srNo
                    ? { ...p, stock: { ...p.stock, current: Math.max(0, p.stock.current + delta) } }
                    : p
            ));
        } catch (error) {
            console.error("Failed to update part stock:", error);
            alert("Inventory update failed. Check connection.");
        }
    };

    const handleUpdateStatus = async (id: number | string, newStatus: string, technicalData?: { checks: any, spareParts: any[] }) => {
        const isUnit = typeof id === 'string';

        let updatedData: any = {
            service_status: newStatus,
            checks: technicalData?.checks,
            spareParts: technicalData?.spareParts,
        };

        if (newStatus === 'completed') {
            updatedData.currentStatus = 'awaitingApproval';
        }

        try {
            if (isUnit) {
                if (onUpdateUnit) {
                    await onUpdateUnit(id, updatedData);
                } else {
                    await api.admin.updateBikeUnit(id, updatedData);
                    window.location.reload();
                }
            } else {
                if (onUpdateBike) {
                    await onUpdateBike(id as number, updatedData);
                } else {
                    await api.admin.updateBike(id as number, updatedData);
                    window.location.reload();
                }
            }
        } catch (error) {
            console.error(`Failed to update ${isUnit ? 'unit' : 'bike'} ${id} to status ${newStatus}:`, error);
        }
    };

    const SidebarItem = ({ id, label, icon: Icon }: { id: ServicePanel, label: string, icon: any }) => (
        <button
            onClick={() => setActivePanel(id)}
            className={`w-full flex items-center gap-4 px-4 py-3 rounded-md transition-all duration-300 ${activePanel === id
                ? 'bg-white/10 text-white font-bold'
                : 'text-white/90 font-semibold hover:bg-white/5'
                }`}
        >
            <Icon className={`w-6 h-6 shrink-0 ${activePanel === id ? 'text-white' : 'text-white/90'}`} />
            <span className="text-base tracking-tight">{label}</span>
        </button>
    );

    const Sidebar = () => (
        <aside className={`bg-primary text-white flex flex-col h-screen fixed shadow-2xl z-50 transition-transform duration-500 ease-out hidden lg:flex w-64 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
            <div className="p-6 text-center border-b border-white/20">
                <h1 className="text-2xl font-bold text-white leading-tight">RoAd RoBo's</h1>
                <p className="text-sm opacity-80 text-white/80">Service Hub</p>
            </div>
            <nav className="flex-grow p-3 overflow-y-auto">
                <button
                    onClick={() => setActivePanel('queue')}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition mb-1 ${activePanel === 'queue'
                        ? 'bg-white/20 text-white'
                        : 'text-white/70 hover:bg-white/10 hover:text-white'
                        }`}
                >
                    <InboxIcon className="w-5 h-5 shrink-0" />
                    <span>Service Queue</span>
                </button>
                <button
                    onClick={() => setActivePanel('history')}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition mb-1 ${activePanel === 'history'
                        ? 'bg-white/20 text-white'
                        : 'text-white/70 hover:bg-white/10 hover:text-white'
                        }`}
                >
                    <ClipboardListIcon className="w-5 h-5 shrink-0" />
                    <span>Repair Logs</span>
                </button>
                <button
                    onClick={() => setActivePanel('inventory')}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition mb-1 ${activePanel === 'inventory'
                        ? 'bg-white/20 text-white'
                        : 'text-white/70 hover:bg-white/10 hover:text-white'
                        }`}
                >
                    <WrenchIcon className="w-5 h-5 shrink-0" />
                    <span>Parts & Spares</span>
                </button>

                <div className="pt-6">
                    <p className="text-[10px] font-bold text-white/30 mb-2 px-4 uppercase tracking-[0.2em]">Operations</p>
                    <button
                        onClick={() => setActivePanel('team')}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition mb-1 ${activePanel === 'team' ? 'bg-white/20 text-white' : 'text-white/70 hover:bg-white/10 hover:text-white'}`}
                    >
                        <UserCircleIcon className="w-5 h-5 shrink-0" />
                        <span>Technical Team</span>
                    </button>
                    <button
                        onClick={() => setActivePanel('alerts')}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition mb-1 ${activePanel === 'alerts' ? 'bg-white/20 text-white' : 'text-white/70 hover:bg-white/10 hover:text-white'}`}
                    >
                        <ExclamationIcon className="w-5 h-5 shrink-0" />
                        <span>System Alerts</span>
                    </button>
                </div>
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
        </aside>
    );

    return (
        <div className="flex min-h-screen bg-accent font-sans selection:bg-primary/20 overflow-x-hidden">
            {/* Ambient Background Elements */}
            <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
                <div className="absolute top-[-15%] right-[-10%] w-[60%] h-[60%] bg-primary/5 rounded-full blur-[160px]" />
                <div className="absolute bottom-[5%] left-[-5%] w-[45%] h-[45%] bg-primary-light/5 rounded-full blur-[140px]" />
            </div>

            {/* Sidebar (Desktop) */}
            <aside className="hidden lg:flex w-64 bg-primary text-white flex-col h-screen fixed shadow-2xl z-50">
                <Sidebar />
            </aside>

            {/* Content Spacer for fixed sidebar */}
            <div className="hidden lg:block w-64 flex-shrink-0" />

            {/* Mobile Sidebar */}
            <div className={`fixed inset-0 z-[100] lg:hidden ${isSidebarOpen ? 'block' : 'hidden'}`}>
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)}></div>
                <aside className={`fixed top-0 left-0 h-full w-64 bg-primary text-white flex flex-col transition-transform duration-500 ease-out shadow-2xl ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                    <Sidebar />
                </aside>
            </div>

            {/* Main Content */}
            <main className="flex-1 p-2 md:p-6 lg:p-12 overflow-y-auto max-h-screen scrollbar-hide flex flex-col w-full overflow-x-hidden">
                <div className="lg:hidden flex items-center justify-between mb-4 mt-2">
                    <div className="flex items-center">
                        <button onClick={() => setIsSidebarOpen(true)} className="p-2 rounded-md text-gray-600 hover:bg-gray-200">
                            <MenuAlt2Icon className="w-6 h-6" />
                        </button>
                        <h2 className="text-lg font-bold ml-4">Service Hub</h2>
                    </div>
                </div>

                {/* Header Row */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-10">
                    <div>
                        <h1 className="text-3xl font-bold text-text-body">Welcome back, {user.name}!</h1>
                        <p className="text-gray-600 mt-1">Here's a quick overview of your business.</p>
                    </div>

                    <div className="flex items-center gap-4 w-full md:w-auto">
                        {/* Search moved to filter row for unified look */}
                    </div>
                </div>

                {/* Stats Grid - Real-time service metrics (clickable) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
                    <ServiceGradientCard
                        label="In Service"
                        value={stats.inService}
                        icon={WrenchIcon}
                        color="green"
                        sublabel="Units under maintenance"
                        onClick={() => { setActivePanel('queue'); setFilterStatus('all'); }}
                    />
                    <ServiceGradientCard
                        label="Pending"
                        value={stats.pending}
                        icon={InboxIcon}
                        color="blue"
                        sublabel="Awaiting service start"
                        onClick={() => { setActivePanel('queue'); setFilterStatus('pending'); }}
                    />
                    <ServiceGradientCard
                        label="In Progress"
                        value={stats.inProgress}
                        icon={PlayIcon}
                        color="purple"
                        sublabel="Active service jobs"
                        onClick={() => { setActivePanel('queue'); setFilterStatus('in_progress'); }}
                    />
                    <ServiceGradientCard
                        label="Completed"
                        value={stats.completed}
                        icon={CheckCircleIcon}
                        color="orange"
                        sublabel="Awaiting audit approval"
                        onClick={() => { setActivePanel('history'); setFilterStatus('completed'); }}
                    />
                </div>

                <div className="bg-white rounded-2xl shadow-premium p-4 flex flex-col md:flex-row gap-4 justify-between items-center border-none mb-10">
                    <div className="relative w-full md:w-80 group">
                        <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-primary transition-colors" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            placeholder={FILTER_CONFIGS[activePanel].placeholder}
                            className="w-full pl-12 pr-4 py-3 text-sm font-medium bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-[#0A2540] placeholder:text-gray-400"
                        />
                    </div>
                    <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-hide w-full md:w-auto">
                        {FILTER_CONFIGS[activePanel].filters.map((filter) => {
                            let isActive = false;
                            let onClick = () => { };

                            if (activePanel === 'queue') {
                                isActive = filterStatus === filter.id;
                                onClick = () => setFilterStatus(filter.id as FilterStatus);
                            } else if (activePanel === 'history') {
                                isActive = historyFilter === filter.id;
                                onClick = () => setHistoryFilter(filter.id);
                            } else if (activePanel === 'inventory') {
                                isActive = filterCat === filter.id;
                                onClick = () => setFilterCat(filter.id as any);
                            } else if (activePanel === 'team') {
                                isActive = teamFilter === filter.id;
                                onClick = () => setTeamFilter(filter.id);
                            } else if (activePanel === 'alerts') {
                                isActive = alertsFilter === filter.id;
                                onClick = () => setAlertsFilter(filter.id);
                            }

                            return (
                                <button
                                    key={filter.id}
                                    onClick={onClick}
                                    className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all whitespace-nowrap active:scale-95 flex items-center gap-2 ${isActive
                                        ? 'text-white shadow-md'
                                        : 'bg-white text-gray-500 hover:text-[#0A2540] hover:bg-gray-50 border border-gray-100'
                                        }`}
                                    style={isActive ? { backgroundColor: filter.color || '#084C3E' } : {}}
                                >
                                    {filter.icon && <span>{filter.icon}</span>}
                                    {filter.label}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Dashboard Panels */}
                <div className="animate-in fade-in slide-in-from-bottom-12 duration-1000">
                    {activePanel === 'queue' && (
                        <div className="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-12">
                            {serviceQueue.length > 0 ? (
                                serviceQueue.map(bike => (
                                    <ServiceCard key={bike.id} bike={bike} onUpdateStatus={handleUpdateStatus} />
                                ))
                            ) : (
                                <div className="col-span-full py-24 bg-white border border-input/30 rounded-2xl flex flex-col items-center justify-center text-center shadow-card">
                                    <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mb-6">
                                        <CheckCircleIcon className="w-10 h-10 text-emerald-500" />
                                    </div>
                                    <h4 className="text-2xl font-black text-text-body tracking-tight uppercase italic mb-2">Operations Clear</h4>
                                    <p className="text-[11px] font-bold text-text-muted uppercase tracking-widest max-w-sm">No high-priority units in this queue.</p>
                                </div>
                            )}
                        </div>
                    )}

                    {activePanel === 'history' && (
                        <div className="space-y-6">
                            <div className="bg-white rounded-2xl shadow-premium border border-gray-100 overflow-hidden">
                                <div className="p-6 border-b border-gray-50 bg-gray-50/30 flex justify-between items-center">
                                    <h3 className="text-lg font-black text-[#0A2540] uppercase italic tracking-tight">Recent Interventions</h3>
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Showing last 30 days</span>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-gray-50/50 border-b border-gray-100">
                                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Unit ID</th>
                                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Technician</th>
                                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Parts Used</th>
                                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Cost (₹)</th>
                                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Date</th>
                                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {filteredHistory.map((log, i) => (
                                                <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <div className="flex flex-col">
                                                            <span className="text-sm font-bold text-[#0A2540]">{log.name}</span>
                                                            <span className="text-[10px] font-mono text-gray-400 uppercase">#{log.id}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm font-semibold text-gray-600">{log.tech}</td>
                                                    <td className="px-6 py-4 text-sm font-medium text-gray-600">{log.parts}</td>
                                                    <td className="px-6 py-4 text-sm font-black text-[#084C3E]">₹{log.cost}</td>
                                                    <td className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">{log.date}</td>
                                                    <td className="px-6 py-4">
                                                        <span className={`px-2 py-1 rounded text-[9px] font-black uppercase tracking-widest ${log.status === 'Verified' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                                            {log.status}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {activePanel === 'inventory' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700 font-sans">
                            {/* Inventory Header Stats */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                {[
                                    { label: 'Total Spares', value: inventoryParts.length, icon: '⚙️', color: 'bg-blue-50 text-blue-600' },
                                    { label: 'Stock Volume', value: inventoryParts.reduce((acc, p) => acc + p.stock.current, 0), icon: '📦', color: 'bg-emerald-50 text-emerald-600' },
                                    { label: 'Low Alert', value: inventoryParts.filter(p => p.stock.current <= p.stock.min).length, icon: '⚠️', color: 'bg-amber-50 text-amber-600' },
                                    { label: 'Hub Value', value: `₹${inventoryParts.reduce((acc, p) => acc + (p.price * 1.18) * p.stock.current, 0).toLocaleString('en-IN')}`, icon: '💰', color: 'bg-purple-50 text-purple-600' },
                                ].map((stat, i) => (
                                    <div key={i} className="bg-white p-5 rounded-2xl shadow-premium border border-gray-100 flex items-center gap-4">
                                        <div className={`w-12 h-12 rounded-xl ${stat.color} flex items-center justify-center text-xl shadow-inner`}>{stat.icon}</div>
                                        <div>
                                            <p className="text-xl font-black text-[#0A2540] tracking-tight leading-none">{stat.value}</p>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">{stat.label}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Parts Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                                {inventoryParts
                                    .filter(p => (filterCat === 'ALL' || p.category === filterCat) &&
                                        (!searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase())))
                                    .map(part => {
                                        const isLow = part.stock.current <= part.stock.min;
                                        const pct = Math.round((part.stock.current / part.stock.max) * 100);
                                        return (
                                            <div key={part.srNo} className="bg-white rounded-[20px] shadow-lg border border-gray-100 overflow-hidden flex flex-col group hover:shadow-2xl transition-all duration-500">
                                                <div className="p-5 flex-1 flex flex-col">
                                                    <div className="flex justify-between items-start mb-4">
                                                        <span className="text-[9px] font-mono text-gray-400 uppercase tracking-tighter">SR-{String(part.srNo).padStart(2, '0')}</span>
                                                        <div className={`px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest ${isLow ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>
                                                            {isLow ? 'Critical' : 'In Stock'}
                                                        </div>
                                                    </div>
                                                    <h4 className="text-sm font-black text-[#0A2540] uppercase tracking-tight mb-4 group-hover:text-primary transition-colors leading-tight min-h-[40px] line-clamp-2">
                                                        {part.name}
                                                    </h4>
                                                    <div className="mt-auto">
                                                        <p className="text-xl font-black text-[#084C3E] leading-none mb-1">₹{Math.round(part.price * 1.18).toLocaleString('en-IN')}</p>
                                                        <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest opacity-60">Inclusive of Tax</p>
                                                    </div>
                                                    <div className="mt-5 space-y-2">
                                                        <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                                                            <span className="text-gray-400">Hub Stock</span>
                                                            <span className={isLow ? 'text-red-600' : 'text-[#0A2540]'}>{part.stock.current}u</span>
                                                        </div>
                                                        <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden shadow-inner">
                                                            <div className={`h-full rounded-full transition-all duration-1000 ${isLow ? 'bg-red-500' : 'bg-[#084C3E]'}`} style={{ width: `${pct}%` }} />
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="p-2 flex gap-2 bg-gray-50/50 border-t border-gray-50">
                                                    <button
                                                        onClick={() => handleUpdatePartStock(part.srNo, -1)}
                                                        className="flex-1 py-2.5 text-[9px] font-black text-white bg-gradient-to-r from-red-500 to-rose-600 rounded-xl uppercase tracking-widest hover:shadow-lg hover:shadow-red-500/30 transition-all duration-300 active:scale-95 shadow-sm flex items-center justify-center gap-1.5 group"
                                                    >
                                                        <span className="text-[14px] leading-none group-hover:-translate-x-0.5 transition-transform">-</span> Issue
                                                    </button>
                                                    <button
                                                        onClick={() => handleUpdatePartStock(part.srNo, 1)}
                                                        className="flex-1 py-2.5 text-[9px] font-black text-[#084C3E] bg-white border border-gray-100 rounded-xl uppercase tracking-widest hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-700 hover:shadow-lg hover:shadow-emerald-500/10 transition-all duration-300 active:scale-95 shadow-sm flex items-center justify-center gap-1.5 group"
                                                    >
                                                        <span className="text-[14px] leading-none group-hover:translate-x-0.5 transition-transform">+</span> Refill
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                            </div>
                        </div>
                    )}

                    {activePanel === 'team' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredTeam.map((tech, i) => (
                                <Card key={i} className="p-6 border border-input/20 hover:border-primary/30 transition-all group overflow-hidden relative">
                                    <div className="absolute top-0 right-0 p-2">
                                        <div className={`w-2 h-2 rounded-full ${tech.status === 'Online' ? 'bg-emerald-500' : tech.status === 'Busy' ? 'bg-amber-500' : 'bg-gray-400'} shadow-[0_0_8px_rgba(0,0,0,0.1)]`} />
                                    </div>
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold border border-primary/20">
                                            {tech.avatar}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-text-body uppercase tracking-tight">{tech.name}</h4>
                                            <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">{tech.role}</p>
                                        </div>
                                    </div>
                                    <div className="space-y-3 pb-4 border-b border-input/10">
                                        <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                                            <span className="text-text-muted">Specialty</span>
                                            <span className="text-text-body">{tech.specialty}</span>
                                        </div>
                                        <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                                            <span className="text-text-muted">Active Tasks</span>
                                            <span className={`px-2 py-0.5 rounded ${tech.tasks > 4 ? 'bg-error/10 text-error' : 'bg-primary/10 text-primary'}`}>{tech.tasks}</span>
                                        </div>
                                    </div>
                                    <div className="mt-4 flex gap-2">
                                        <button className="flex-1 py-2 bg-accent hover:bg-primary/5 text-text-body text-[9px] font-bold uppercase tracking-widest rounded transition-colors">Log Interv.</button>
                                        <button className="flex-1 py-2 bg-primary text-white text-[9px] font-bold uppercase tracking-widest rounded hover:bg-black transition-colors">Assign</button>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}

                    {activePanel === 'alerts' && (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between bg-white p-6 rounded-2xl shadow-sm border border-input/30">
                                <div>
                                    <h3 className="text-lg font-black text-text-body uppercase italic tracking-tight">Active Telemetry Alerts</h3>
                                    <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mt-1">Real-time system diagnostics</p>
                                </div>
                                {filteredAlerts.filter(a => a.level === 'Critical').length > 0 && (
                                    <span className="bg-error font-bold text-white text-[10px] uppercase px-3 py-1.5 rounded-full animate-pulse shadow-lg shadow-error/20 flex items-center gap-1.5">
                                        <span className="w-1.5 h-1.5 rounded-full bg-white" />
                                        {filteredAlerts.filter(a => a.level === 'Critical').length} Critical
                                    </span>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in slide-in-from-bottom-4 duration-500">
                                {filteredAlerts.length > 0 ? filteredAlerts.map((alert, i) => (
                                    <div key={i} className={`group relative bg-white rounded-[20px] p-6 shadow-lg border hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 overflow-hidden ${alert.level === 'Critical' ? 'border-error/30' : alert.level === 'Warning' ? 'border-amber-400/30' : 'border-blue-400/30'}`}>
                                        {/* Glossy Overlay */}
                                        <div className={`absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-500 ${alert.level === 'Critical' ? 'bg-error' : alert.level === 'Warning' ? 'bg-amber-500' : 'bg-blue-500'}`} />

                                        <div className="flex justify-between items-start mb-4 relative z-10">
                                            <div className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-sm ${alert.level === 'Critical' ? 'bg-error/10 text-error border border-error/20' : alert.level === 'Warning' ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-blue-50 text-blue-700 border border-blue-200'}`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${alert.level === 'Critical' ? 'bg-error animate-pulse' : alert.level === 'Warning' ? 'bg-amber-500' : 'bg-blue-500'}`} />
                                                {alert.level}
                                            </div>
                                            <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">{alert.time}</span>
                                        </div>

                                        <div className="relative z-10">
                                            <h4 className="text-[15px] font-black text-text-body leading-snug mb-2 group-hover:text-primary transition-colors">{alert.msg}</h4>
                                            <div className="flex items-center gap-2 mb-4">
                                                <span className="text-[10px] font-mono font-bold text-primary bg-primary/5 px-2 py-0.5 rounded tracking-tighter border border-primary/10">{alert.unit}</span>
                                            </div>
                                        </div>

                                        <div className="mt-auto pt-4 border-t border-input/10 relative z-10 flex gap-2">
                                            <button
                                                onClick={() => {
                                                    setSearchQuery(alert.unit);
                                                    setActivePanel('queue');
                                                }}
                                                className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-sm ${alert.level === 'Critical' ? 'bg-error text-white hover:bg-red-600' : 'bg-[#0b281b] text-white hover:bg-black'}`}
                                            >
                                                Assess Unit
                                            </button>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="col-span-full py-24 bg-white border border-input/30 rounded-2xl flex flex-col items-center justify-center text-center shadow-card">
                                        <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mb-6">
                                            <CheckCircleIcon className="w-10 h-10 text-emerald-500" />
                                        </div>
                                        <h4 className="text-2xl font-black text-text-body tracking-tight uppercase italic mb-2">Systems Nominal</h4>
                                        <p className="text-[11px] font-bold text-text-muted uppercase tracking-widest max-w-sm">No active telemetry alerts found in the fleet.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default ServiceManagerDashboard;
