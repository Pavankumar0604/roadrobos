import React, { useState, useEffect, useMemo } from 'react';
import {
    ShieldCheckIcon,
    CogIcon,
    BeakerIcon,
    LightningBoltIcon,
    CpuChipIcon as ChipIcon,
    ExclamationIcon,
    RefreshIcon,
    SearchIcon,
    CheckCircleIcon,
    BanIcon,
    LogoutIcon,
    ChevronDownIcon,
    SparklesIcon,
    BikeIcon,
    ViewGridIcon,
    MenuAlt2Icon,
    ClipboardListIcon,
    WrenchIcon,
    UserCircleIcon,
} from './icons/Icons';
import { type AdminUser, type Bike, type BikeUnit } from '../types';
import api from '../src/api';
import RoadRobosPartsInventory from './RoadRobosPartsInventory';
import FleetStatusTower from './FleetStatusTower';
import { FLEET_SCOOTERS, ScooterStatusType, ScooterUnit } from '../data/fleetStatusData';
import { PART_CATEGORIES, type PartCategory } from '../data/eevaPartsData';

type InventoryTab = 'vehicles' | 'parts';
type CheckStatus = 'pending' | 'in-progress' | 'completed' | 'failed';
type VehicleStatus = 'readyToRent' | 'inService' | 'criticalFix' | 'rented' | 'awaitingApproval';

interface VehicleChecks {
    fleet: CheckStatus;
    wash: CheckStatus;
    battery: CheckStatus;
    controller: CheckStatus;
    brake: CheckStatus;
    wiring: CheckStatus;
    fault: CheckStatus;
    forkBalls: CheckStatus;
    shockAbsorbers: CheckStatus;
    sanitization: CheckStatus;
}

interface InventoryBike extends Bike {
    checks: VehicleChecks;
    status: VehicleStatus;
    unit?: BikeUnit; // Optional unit info
}

const STATIONS: { id: keyof VehicleChecks; label: string; icon: React.FC<React.SVGProps<SVGSVGElement>> }[] = [
    { id: 'fleet', label: 'Fleet Check', icon: CogIcon },
    { id: 'wash', label: 'Wash', icon: BeakerIcon },
    { id: 'battery', label: 'Battery', icon: LightningBoltIcon },
    { id: 'controller', label: 'Controller', icon: ChipIcon },
    { id: 'brake', label: 'Brakes', icon: ShieldCheckIcon },
    { id: 'wiring', label: 'Wiring', icon: RefreshIcon },
    { id: 'fault', label: 'Fault Scan', icon: ExclamationIcon },
    { id: 'forkBalls', label: 'Fork Balls', icon: CogIcon },
    { id: 'shockAbsorbers', label: 'Shock Absorbers', icon: ShieldCheckIcon },
    { id: 'sanitization', label: 'Sanitize', icon: CheckCircleIcon },
];

const STATUS_CONFIG: Record<VehicleStatus, { label: string; color: string; dot: string }> = {
    readyToRent: { label: 'Ready', color: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
    inService: { label: 'In Service', color: 'bg-primary/5 text-primary border-primary/20', dot: 'bg-primary animate-pulse' },
    criticalFix: { label: 'Critical Fix', color: 'bg-error/5 text-error border-error/20', dot: 'bg-error animate-ping' },
    rented: { label: 'Rented', color: 'bg-secondary/5 text-secondary border-secondary/20', dot: 'bg-secondary' },
    awaitingApproval: { label: 'Awaiting Audit', color: 'bg-indigo-50 text-indigo-700 border-indigo-200', dot: 'bg-indigo-500 shadow-sm' },
};

const defaultChecks = (): VehicleChecks => ({
    fleet: 'completed', wash: 'completed', battery: 'completed', controller: 'completed',
    brake: 'completed', wiring: 'completed', fault: 'completed',
    forkBalls: 'completed', shockAbsorbers: 'completed', sanitization: 'completed',
});

const deriveStatus = (bike: Bike | InventoryBike): VehicleStatus => {
    // If it's an InventoryBike (has a unit), use unit status first
    if ('unit' in bike && bike.unit) {
        if (bike.unit.status === 'Ready') return 'readyToRent';
        if (bike.unit.status === 'Rented') return 'rented';
        if (bike.unit.status === 'In Service') return 'inService';
        if (bike.unit.status === 'Awaiting Approval') return 'awaitingApproval';
        if (bike.unit.status === 'Critical Fix') return 'criticalFix';
    }

    // Fallback to model-level status (deprecated legacy logic)
    if (bike.currentStatus === 'awaitingApproval') return 'awaitingApproval';
    if (bike.availability === 'Maintenance' || bike.availability === 'Service' || bike.availability === 'In Service') return 'inService';
    if (bike.availability === 'Critical Fix') return 'criticalFix';

    if (bike.availability === 'Available' || bike.currentStatus === 'readyRent') {
        return 'readyToRent';
    }

    return 'rented';
};

const NewUnitRow: React.FC<{ bikes: Bike[]; onAdd: (bikeId: number, rrsId: string, regNum: string, color: string) => void }> = ({ bikes, onAdd }) => {
    const [bikeId, setBikeId] = useState<number>(bikes[0]?.id || 0);
    const [rrsId, setRrsId] = useState('');
    const [regNum, setRegNum] = useState('');
    const [color, setColor] = useState('');

    const handleAdd = () => {
        onAdd(bikeId, rrsId, regNum, color);
        setRrsId('');
        setRegNum('');
        setColor('');
    };

    return (
        <tr className="bg-gray-50/30">
            <td className="px-6 py-4">
                <input
                    value={rrsId}
                    onChange={e => setRrsId(e.target.value)}
                    placeholder="RRS0001"
                    className="w-full p-2 border border-gray-200 rounded-lg text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none"
                />
                <select
                    value={bikeId}
                    onChange={e => setBikeId(Number(e.target.value))}
                    className="w-full mt-1 p-1 text-[10px] border border-gray-100 rounded bg-white font-bold"
                >
                    {bikes.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
            </td>
            <td className="px-6 py-4 text-center">
                <input
                    value={regNum}
                    onChange={e => setRegNum(e.target.value)}
                    placeholder="Reg No"
                    className="w-full p-2 border border-gray-200 rounded-lg text-sm font-bold text-center focus:ring-2 focus:ring-primary/20 outline-none"
                />
            </td>
            <td className="px-6 py-4 text-center">
                <input
                    value={color}
                    onChange={e => setColor(e.target.value)}
                    placeholder="Color"
                    className="w-full p-2 border border-gray-200 rounded-lg text-sm font-bold text-center focus:ring-2 focus:ring-primary/20 outline-none"
                />
            </td>
            <td className="px-6 py-4">
                <span className="text-gray-400 text-[10px] font-black uppercase tracking-widest">New Unit</span>
            </td>
            <td className="px-6 py-4 text-right">
                <button
                    onClick={handleAdd}
                    className="bg-primary text-white px-6 py-2 rounded-xl font-bold text-xs shadow-md hover:shadow-lg transition-all active:scale-95"
                >
                    Add Unit
                </button>
            </td>
        </tr>
    );
};

const RoadRobosInventoryManager: React.FC<{
    user: AdminUser;
    bikes: Bike[];
    setBikes: React.Dispatch<React.SetStateAction<Bike[]>>;
    bikeUnits: BikeUnit[];
    setBikeUnits: React.Dispatch<React.SetStateAction<BikeUnit[]>>;
    onLogout: () => void;
    onBackToDashboard?: () => void;
}> = ({ user, bikes, setBikes, bikeUnits, setBikeUnits, onLogout, onBackToDashboard }) => {
    const [checksMap, setChecksMap] = useState<Record<number, VehicleChecks>>({});
    const [auditMap, setAuditMap] = useState<Record<number, Record<string, boolean>>>({});
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState<VehicleStatus | 'all'>('all');
    const [filterCat, setFilterCat] = useState<PartCategory | 'ALL'>('ALL');
    const [towerFilter, setTowerFilter] = useState<ScooterStatusType | 'ALL'>('ALL');
    const [expandedId, setExpandedId] = useState<number | null>(null);
    const [activeTab, setActiveTab] = useState<InventoryTab>('vehicles');
    const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
    const [isCatDropdownOpen, setIsCatDropdownOpen] = useState(false);
    const [isFleetDropdownOpen, setIsFleetDropdownOpen] = useState(false);
    const [currentTime, setCurrentTime] = useState(new Date());

    const evBikes = useMemo(() => bikes.filter(b => b.type === 'Electric'), [bikes]);

    useEffect(() => {
        setChecksMap(prev => {
            const next = { ...prev };
            evBikes.forEach(b => {
                if (!next[b.id]) next[b.id] = defaultChecks();
            });
            return next;
        });
    }, [evBikes]);

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const handleToggleCheck = (bikeId: number, stationId: keyof VehicleChecks) => {
        setChecksMap(prev => {
            const cur = (prev[bikeId] ?? defaultChecks())[stationId];
            const next: CheckStatus = cur === 'pending' ? 'completed' : cur === 'completed' ? 'failed' : 'pending';
            return { ...prev, [bikeId]: { ...(prev[bikeId] ?? defaultChecks()), [stationId]: next } };
        });
    };

    const handleToggleAudit = (bikeId: number, stationLabel: string) => {
        setAuditMap(prev => {
            const bikeAudit = prev[bikeId] || {};
            return {
                ...prev,
                [bikeId]: {
                    ...bikeAudit,
                    [stationLabel]: !bikeAudit[stationLabel]
                }
            };
        });
    };

    const handleUpdateStock = async (bike: Bike, field: 'totalStock' | 'bookedCount', value: number) => {
        const updatedBike: Bike = {
            ...bike,
            [field]: value,
            images: bike.images || [],
            colorVariants: bike.colorVariants || []
        };
        // Recalculate availableCount for consistency
        updatedBike.availableCount = (updatedBike.totalStock || 0) - (updatedBike.bookedCount || 0);

        try {
            await api.admin.updateBike(bike.id, updatedBike);
            setBikes(prev => prev.map(b => b.id === bike.id ? updatedBike : b));
        } catch (error) {
            console.error('Failed to update stock:', error);
            alert('Failed to update stock. Please try again.');
        }
    };

    const handleAddUnit = async (bikeId: number, rrsId: string, regNum: string, color: string) => {
        if (!rrsId) {
            alert('RRS ID is required');
            return;
        }
        try {
            const newUnitData = {
                bike_id: bikeId,
                unit_number: rrsId,
                registration_number: regNum,
                color_name: color,
                status: 'Ready'
            };
            const data = await api.admin.addBikeUnit(newUnitData);
            if (data) {
                setBikeUnits(prev => [...prev, data]);
            }
        } catch (error: any) {
            console.error('Failed to add unit:', error);
            alert(`Failed to add unit: ${error.message || 'Unknown error'}`);
        }
    };

    const handleUpdateUnit = async (unitId: string, updates: Partial<BikeUnit>) => {
        try {
            const data = await api.admin.updateBikeUnit(unitId, updates);
            if (data) {
                setBikeUnits(prev => prev.map(u => u.id === unitId ? { ...u, ...updates } : u));
            }
        } catch (error: any) {
            console.error('Failed to update unit:', error);
            alert(`Failed to update unit: ${error.message || 'Unknown error'}`);
        }
    };

    const handleDeleteUnit = async (unitId: string) => {
        if (!window.confirm('Are you sure you want to delete this unit?')) return;
        try {
            await api.admin.deleteBikeUnit(unitId);
            setBikeUnits(prev => prev.filter(u => u.id !== unitId));
        } catch (error: any) {
            console.error('Failed to delete unit:', error);
            alert(`Failed to delete unit: ${error.message || 'Unknown error'}`);
        }
    };

    const handleMoveToService = async (bike: InventoryBike) => {
        if (bike.unit) {
            handleUpdateUnit(bike.unit.id, {
                status: 'In Service',
                // Explicitly reset service status metadata if it exists on the model
                service_status: 'pending'
            } as any);
        } else {
            try {
                // For models, we update the bike object directly
                const updated = await api.admin.updateBike(bike.id, {
                    availability: 'In Service',
                    service_status: 'pending'
                });
                setBikes(prev => prev.map(b => b.id === bike.id ? { ...b, ...updated } : b));
            } catch (error) {
                console.error('Failed to move model to service:', error);
            }
        }
    };

    const handleApproveService = async (bike: InventoryBike) => {
        if (bike.unit) {
            handleUpdateUnit(bike.unit.id, { status: 'Ready' });
        } else {
            try {
                const updated = await api.admin.updateBike(bike.id, { availability: 'Available' });
                setBikes(prev => prev.map(b => b.id === bike.id ? { ...b, ...updated } : b));
            } catch (error) {
                console.error('Failed to approve model service:', error);
            }
        }
    };

    const handleRejectService = async (bike: InventoryBike) => {
        if (bike.unit) {
            handleUpdateUnit(bike.unit.id, { status: 'In Service' });
        } else {
            try {
                const updated = await api.admin.updateBike(bike.id, { availability: 'Critical Fix' });
                setBikes(prev => prev.map(b => b.id === bike.id ? { ...b, ...updated } : b));
            } catch (error) {
                console.error('Failed to reject model service:', error);
            }
        }
    };



    const filteredBikeUnits = useMemo(() => {
        return bikeUnits.filter(u => {
            const matchesSearch = !search ||
                u.rrs_id.toLowerCase().includes(search.toLowerCase()) ||
                u.registration_number?.toLowerCase().includes(search.toLowerCase()) ||
                u.model_name.toLowerCase().includes(search.toLowerCase());
            const matchesStatus = filterStatus === 'all' || u.status.toLowerCase() === filterStatus.toLowerCase();
            return matchesSearch && matchesStatus;
        });
    }, [bikeUnits, search, filterStatus]);

    const inventoryBikes: InventoryBike[] = useMemo(() => {
        // We only show bikes that are in the filtered units list
        const validUnits = filteredBikeUnits.filter(u => u.unit_number && !u.unit_number.toLowerCase().includes('demo'));

        return validUnits.map(unit => {
            const parentBike = bikes.find(b => Number(b.id) === Number(unit.bike_id));
            const resolvedBike = parentBike || bikes[0];

            // Status mapping from unit status to VehicleStatus
            let status: VehicleStatus = deriveStatus({ ...resolvedBike, unit } as any);

            // Clean the name. If parentBike already has the RRS ID, don't duplicate it.
            let baseName = parentBike?.name || (unit.bikes as any)?.name || resolvedBike?.name || 'Unknown Model';
            if (baseName.includes(` - ${unit.unit_number}`)) {
                baseName = baseName.replace(` - ${unit.unit_number}`, '');
            }

            return {
                ...resolvedBike, // Fallback if model not found
                id: Number(unit.id.split('-').pop()) || resolvedBike?.id || 0, // Unique ID for the inventory item
                name: `${baseName} - ${unit.unit_number}`,
                checks: checksMap[unit.id as any] ?? defaultChecks(),
                status: status,
                unit: unit,
                // Override available count logic since this is a single unit
                availableCount: unit.status === 'Ready' ? 1 : 0,
                totalStock: 1,
                bookedCount: unit.status === 'Rented' ? 1 : 0
            };
        });
    }, [filteredBikeUnits, bikes, checksMap]);

    const filtered = useMemo(() => inventoryBikes.filter(b => {
        // All primary filtering is now done in filteredBikeUnits -> inventoryBikes
        // This 'filtered' memo applies the towerFilter (Visualization filter)
        let matchTowerFilter = true;
        if (towerFilter !== 'ALL') {
            if (towerFilter === 'readyRent') matchTowerFilter = b.status === 'readyToRent';
            else if (towerFilter === 'inService') matchTowerFilter = b.status === 'inService' || b.status === 'criticalFix';
            else if (towerFilter === 'awaitingApproval') matchTowerFilter = b.status === 'awaitingApproval';
            else if (towerFilter === 'rentedRunning') matchTowerFilter = (b.bookedCount ?? 0) > 0;
            else matchTowerFilter = false;
        }

        return matchTowerFilter;
    }), [inventoryBikes, towerFilter]);

    // Map inventory models to Fleet Units for the Tower (1:1 mapping as requested)
    const towerUnits = useMemo((): ScooterUnit[] => {
        return inventoryBikes.map(b => {
            let towerStatus: ScooterStatusType = 'readyRent';

            // Map InventoryBike status to ScooterStatusType
            if (b.status === 'inService' || b.status === 'criticalFix') {
                towerStatus = 'inService';
            } else if (b.status === 'awaitingApproval') {
                towerStatus = 'awaitingApproval';
            } else if (b.status === 'readyToRent') {
                towerStatus = 'readyRent';
            } else if (b.status === 'rented') {
                towerStatus = 'rentedRunning';
            }

            return {
                id: b.id.toString(),
                regNumber: `RR-${b.id}`,
                model: b.name,
                currentStatus: towerStatus,
                location: { area: 'Local Hub', lat: 0, lng: 0 },
                statusChangedAt: new Date().toISOString()
            };
        });
    }, [inventoryBikes]);

    const stats = useMemo(() => ({
        total: inventoryBikes.length,
        ready: inventoryBikes.filter(v => v.status === 'readyToRent').length,
        inService: inventoryBikes.filter(v => v.status === 'inService').length,
        critical: inventoryBikes.filter(v => v.status === 'criticalFix').length,
    }), [inventoryBikes]);

    return (
        <div className="min-h-screen bg-[#F8FAFC] font-sans flex flex-col text-[#0A2540] relative z-0 overflow-x-hidden">
            <main className="flex-1 p-2 sm:p-4 lg:p-6 flex flex-col space-y-8 animate-in fade-in duration-500 max-w-[1600px] mx-auto w-full">
                {/* ─── Fleet Status Visualization ─── */}
                <div className="flex flex-col items-center justify-center">
                    <FleetStatusTower
                        scooters={towerUnits}
                        activeFilter={towerFilter}
                        onFilterChange={setTowerFilter}
                    />
                </div>

                {/* ─── Premium Navigation & View Switcher ─── */}
                <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                    {/* Tab Navigation */}
                    <div className="flex bg-white/50 backdrop-blur-md p-1.5 rounded-2xl border border-gray-100 shadow-sm overflow-x-auto scrollbar-hide">
                        <button
                            onClick={() => { setActiveTab('vehicles'); setFilterStatus('all'); setSearch(''); }}
                            className={`flex items-center gap-3 px-6 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${activeTab === 'vehicles' ? 'bg-white text-primary shadow-md' : 'text-gray-500 hover:text-gray-700 hover:bg-white/50'}`}
                        >
                            <BikeIcon className="w-4 h-4" />
                            <span>Fleet Inventory</span>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] ${activeTab === 'vehicles' ? 'bg-primary text-white' : 'bg-gray-100'}`}>{stats.total}</span>
                        </button>
                        <button
                            onClick={() => { setActiveTab('parts'); setFilterCat('ALL'); setSearch(''); }}
                            className={`flex items-center gap-3 px-6 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${activeTab === 'parts' ? 'bg-white text-primary shadow-md' : 'text-gray-500 hover:text-gray-700 hover:bg-white/50'}`}
                        >
                            <SparklesIcon className="w-4 h-4" />
                            <span>Spares Bay</span>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] ${activeTab === 'parts' ? 'bg-primary text-white' : 'bg-gray-100'}`}>46</span>
                        </button>
                    </div>

                    {/* View Toggle */}
                    <div className="flex bg-white/50 backdrop-blur-md p-1.5 rounded-2xl border border-gray-100 shadow-sm">
                        <button
                            onClick={() => setViewMode('cards')}
                            className={`p-2 rounded-xl transition-all duration-300 ${viewMode === 'cards' ? 'bg-white shadow-md text-primary' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            <ViewGridIcon className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => setViewMode('table')}
                            className={`p-2 rounded-xl transition-all duration-300 ${viewMode === 'table' ? 'bg-white shadow-md text-primary' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            <MenuAlt2Icon className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Unified Context-Aware Filters */}
                <div className="bg-white rounded-2xl shadow-premium p-4 flex flex-col md:flex-row gap-4 justify-between items-center border-none mb-6">
                    <div className="relative w-full md:w-80 group">
                        <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-primary transition-colors" />
                        <input
                            type="text"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder={activeTab === 'vehicles' ? "Search by ID or unit name..." : "Search spares by name or SR#..."}
                            className="w-full pl-12 pr-4 py-3 text-sm font-medium bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-[#0A2540] placeholder:text-gray-400"
                        />
                    </div>
                    <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                        {activeTab === 'vehicles' ? (
                            <div className="flex flex-wrap items-center gap-3">
                                {/* Fleet Status Dropdown */}
                                <div className="relative">
                                    <button
                                        onClick={() => setIsFleetDropdownOpen(!isFleetDropdownOpen)}
                                        className="px-4 py-2.5 bg-white border border-gray-100 rounded-xl text-xs font-bold text-[#0A2540] flex items-center gap-3 shadow-sm hover:border-primary transition-all active:scale-95 min-w-[200px]"
                                    >
                                        {filterStatus === 'all' ? (
                                            <>
                                                <div className="w-2 h-2 rounded-full bg-primary" />
                                                <span>All Fleet Status</span>
                                            </>
                                        ) : (
                                            <>
                                                <div className={`w-2 h-2 rounded-full ${STATUS_CONFIG[filterStatus as VehicleStatus]?.dot || 'bg-gray-300'}`} />
                                                <span>{STATUS_CONFIG[filterStatus as VehicleStatus]?.label}</span>
                                            </>
                                        )}
                                        <ChevronDownIcon className={`w-4 h-4 ml-auto transition-transform duration-300 ${isFleetDropdownOpen ? 'rotate-180 text-primary' : 'text-gray-400'}`} />
                                    </button>

                                    {isFleetDropdownOpen && (
                                        <>
                                            <div className="fixed inset-0 z-40" onClick={() => setIsFleetDropdownOpen(false)} />
                                            <div className="absolute top-full left-0 mt-2 w-full min-w-[240px] bg-white rounded-2xl shadow-premium border border-gray-100 p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-300">
                                                <div className="max-h-64 overflow-y-auto scrollbar-hide space-y-1">
                                                    <button
                                                        onClick={() => {
                                                            setFilterStatus('all');
                                                            setIsFleetDropdownOpen(false);
                                                        }}
                                                        className={`w-full text-left px-3 py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-wider flex items-center gap-3 transition-colors ${filterStatus === 'all' ? 'bg-primary text-white' : 'hover:bg-gray-50 text-gray-500'}`}
                                                    >
                                                        <div className={`w-1.5 h-1.5 rounded-full ${filterStatus === 'all' ? 'bg-white' : 'bg-primary'}`} />
                                                        All Units
                                                    </button>
                                                    {(['readyToRent', 'inService', 'criticalFix', 'rented', 'awaitingApproval'] as const).map(s => (
                                                        <button
                                                            key={s}
                                                            onClick={() => {
                                                                setFilterStatus(s);
                                                                setIsFleetDropdownOpen(false);
                                                            }}
                                                            className={`w-full text-left px-3 py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-wider flex items-center gap-3 transition-colors ${filterStatus === s ? 'text-white' : 'hover:bg-gray-50 text-gray-400'}`}
                                                            style={filterStatus === s ? { backgroundColor: STATUS_CONFIG[s].color.split(' ')[0].replace('bg-', '') === 'primary' ? '#084C3E' : (s === 'criticalFix' ? '#EF4444' : (s === 'readyToRent' ? '#10B981' : (s === 'rented' ? '#FF6347' : '#6366F1'))) } : {}}
                                                        >
                                                            <div className={`w-1.5 h-1.5 rounded-full ${filterStatus === s ? 'bg-white' : (STATUS_CONFIG[s].dot || 'bg-gray-300')}`} />
                                                            {STATUS_CONFIG[s].label}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="relative">
                                <button
                                    onClick={() => setIsCatDropdownOpen(!isCatDropdownOpen)}
                                    className="px-4 py-2.5 bg-white border border-gray-100 rounded-xl text-xs font-bold text-[#0A2540] flex items-center gap-3 shadow-sm hover:border-primary transition-all active:scale-95 min-w-[200px]"
                                >
                                    {filterCat === 'ALL' ? (
                                        <>
                                            <div className="w-2 h-2 rounded-full bg-primary" />
                                            <span>All Spare Categories</span>
                                        </>
                                    ) : (
                                        <>
                                            <span className="text-sm">{PART_CATEGORIES.find(c => c.id === filterCat)?.icon}</span>
                                            <span>{PART_CATEGORIES.find(c => c.id === filterCat)?.label}</span>
                                        </>
                                    )}
                                    <ChevronDownIcon className={`w-4 h-4 ml-auto transition-transform duration-300 ${isCatDropdownOpen ? 'rotate-180 text-primary' : 'text-gray-400'}`} />
                                </button>

                                {isCatDropdownOpen && (
                                    <>
                                        <div className="fixed inset-0 z-40" onClick={() => setIsCatDropdownOpen(false)} />
                                        <div className="absolute top-full left-0 mt-2 w-full min-w-[240px] bg-white rounded-2xl shadow-premium border border-gray-100 p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-300">
                                            <div className="max-h-64 overflow-y-auto scrollbar-hide space-y-1">
                                                <button
                                                    onClick={() => {
                                                        setFilterCat('ALL');
                                                        setIsCatDropdownOpen(false);
                                                    }}
                                                    className={`w-full text-left px-3 py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-wider flex items-center gap-3 transition-colors ${filterCat === 'ALL' ? 'bg-primary text-white' : 'hover:bg-gray-50 text-gray-500'}`}
                                                >
                                                    <div className={`w-1.5 h-1.5 rounded-full ${filterCat === 'ALL' ? 'bg-white' : 'bg-primary'}`} />
                                                    All Spares
                                                </button>
                                                {PART_CATEGORIES.map(cat => (
                                                    <button
                                                        key={cat.id}
                                                        onClick={() => {
                                                            setFilterCat(cat.id);
                                                            setIsCatDropdownOpen(false);
                                                        }}
                                                        className={`w-full text-left px-3 py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-wider flex items-center gap-3 transition-colors ${filterCat === cat.id ? 'text-white' : 'hover:bg-gray-50 text-gray-400'}`}
                                                        style={filterCat === cat.id ? { backgroundColor: cat.color } : {}}
                                                    >
                                                        <span className="text-xs">{cat.icon}</span>
                                                        {cat.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {activeTab === 'vehicles' && (
                    <div className="space-y-6 animate-in slide-in-from-bottom-2 duration-300">
                        <div className="flex flex-col md:flex-row gap-6 justify-between items-end mb-8">
                            <div>
                                <h2 className="text-xl font-black text-[#0A2540] tracking-tight">Fleet Command Center</h2>
                                <p className="text-gray-500 mt-1 font-medium flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                    Monitoring {inventoryBikes.length} Units
                                </p>
                            </div>

                            <div className="flex items-center gap-2 bg-white p-1.5 rounded-xl border border-gray-100 shadow-sm h-fit">
                                <button
                                    onClick={() => setViewMode('cards')}
                                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${viewMode === 'cards' ? 'bg-[#E9FF70] text-[#0F3323] shadow-sm' : 'text-gray-500 hover:text-[#0A2540]'}`}
                                >
                                    <ViewGridIcon className="w-4 h-4" /> Cards
                                </button>
                                <button
                                    onClick={() => setViewMode('table')}
                                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${viewMode === 'table' ? 'bg-[#E9FF70] text-[#0F3323] shadow-sm' : 'text-gray-500 hover:text-[#0A2540]'}`}
                                >
                                    <ClipboardListIcon className="w-4 h-4" /> Table
                                </button>
                            </div>
                        </div>
                        {evBikes.length === 0 ? (
                            <div className="text-center py-20 bg-white rounded-xl border border-dashed border-input shadow-sm">
                                <p className="text-4xl mb-4">🏠</p>
                                <p className="font-bold text-text-body text-xl">No electric fleet found.</p>
                                <p className="text-text-muted text-sm mt-1">Sync your database or add units via Admin Portal.</p>
                            </div>
                        ) : viewMode === 'cards' ? (
                            <>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in slide-in-from-bottom-4 duration-500">
                                    {filtered.map((bike, index) => {
                                        const uniqueKey = bike.unit ? bike.unit.id : bike.id;
                                        return (
                                            <VehicleCard
                                                key={uniqueKey}
                                                bike={bike}
                                                checks={bike.checks}
                                                auditState={auditMap[uniqueKey as any] || {}}
                                                onToggleAudit={(label) => handleToggleAudit(uniqueKey as any, label)}
                                                isExpanded={expandedId === uniqueKey as any}
                                                onToggleExpand={() => setExpandedId(expandedId === uniqueKey as any ? null : uniqueKey as any)}
                                                onToggleCheck={(key) => handleToggleCheck(uniqueKey as any, key)}
                                                onSendToService={() => handleMoveToService(bike)}
                                                onApproveService={() => handleApproveService(bike)}
                                                onRejectService={handleRejectService}
                                            />
                                        )
                                    })}
                                    {filtered.length === 0 && (
                                        <div className="col-span-full text-center py-20 bg-white rounded-xl border border-input shadow-sm">
                                            <p className="text-4xl mb-4">🔍</p>
                                            <p className="font-bold text-text-muted">No units match these filters.</p>
                                        </div>
                                    )}
                                </div>

                                {/* VehicleSpecsPanel rendered outside card grid to avoid overflow-hidden issues */}
                                {expandedId !== null && (() => {
                                    const expandedBike = filtered.find(b => (b.unit ? b.unit.id : b.id) === expandedId) || inventoryBikes.find(b => (b.unit ? b.unit.id : b.id) === expandedId);
                                    if (!expandedBike) return null;
                                    const uniqueKey = expandedBike.unit ? expandedBike.unit.id : expandedBike.id;
                                    return (
                                        <VehicleSpecsPanel
                                            bike={expandedBike}
                                            isOpen={true}
                                            onClose={() => setExpandedId(null)}
                                            auditState={auditMap[uniqueKey as any] || {}}
                                            onToggleAudit={(label) => handleToggleAudit(uniqueKey as any, label)}
                                            onApproveService={() => handleApproveService(expandedBike)}
                                            onRejectService={() => handleRejectService(expandedBike)}
                                        />
                                    );
                                })()}
                            </>
                        ) : (
                            <div className="bg-white rounded-[24px] border border-gray-100 shadow-premium overflow-hidden animate-in fade-in duration-500">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead className="bg-gray-50/80 border-b border-gray-100">
                                            <tr>
                                                <th className="px-6 py-4 text-left font-bold text-gray-400 uppercase tracking-wider text-xs">RRS ID / Model</th>
                                                <th className="px-6 py-4 text-center font-bold text-gray-400 uppercase tracking-wider text-xs whitespace-nowrap">Registration</th>
                                                <th className="px-6 py-4 text-center font-bold text-gray-400 uppercase tracking-wider text-xs whitespace-nowrap">Color</th>
                                                <th className="px-6 py-4 text-left font-bold text-gray-400 uppercase tracking-wider text-xs">Status</th>
                                                <th className="px-6 py-4 text-right font-bold text-gray-400 uppercase tracking-wider text-xs">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {filtered.map(bike => {
                                                const unit = bike.unit;
                                                const sc = STATUS_CONFIG[bike.status];
                                                if (!unit) return null; // Only show units in table mode
                                                return (
                                                    <tr key={unit.id} className="hover:bg-gray-50/50 transition-colors">
                                                        <td className="px-6 py-4">
                                                            <div className="font-bold text-[#0A2540]">{unit.unit_number}</div>
                                                            <div className="text-[10px] text-gray-400 uppercase tracking-widest font-black mt-0.5">{bike.name}</div>
                                                        </td>
                                                        <td className="px-6 py-4 text-center">
                                                            <input
                                                                type="text"
                                                                value={unit.registration_number || ''}
                                                                onChange={e => handleUpdateUnit(unit.id, { registration_number: e.target.value })}
                                                                placeholder="KA-xx-xxxx"
                                                                className="w-32 p-1.5 border border-gray-200 rounded-lg text-center font-bold focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-white text-[#0A2540]"
                                                            />
                                                        </td>
                                                        <td className="px-6 py-4 text-center">
                                                            <input
                                                                type="text"
                                                                value={unit.color_name || ''}
                                                                onChange={e => handleUpdateUnit(unit.id, { color_name: e.target.value })}
                                                                placeholder="Color"
                                                                className="w-24 p-1.5 border border-gray-200 rounded-lg text-center font-bold focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-white text-[#0A2540]"
                                                            />
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <select
                                                                value={unit.status}
                                                                onChange={e => handleUpdateUnit(unit.id, { status: e.target.value as any })}
                                                                className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest rounded-lg border outline-none cursor-pointer ${sc.color}`}
                                                            >
                                                                <option value="Ready">Ready</option>
                                                                <option value="In Service">In Service</option>
                                                                <option value="Rented">Rented</option>
                                                            </select>
                                                        </td>
                                                        <td className="px-6 py-4 text-right">
                                                            <button
                                                                onClick={() => handleDeleteUnit(unit.id)}
                                                                className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                                                                title="Delete Unit"
                                                            >
                                                                <LogoutIcon className="w-5 h-5 rotate-180" />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                            {/* Add New Unit Row */}
                                            <NewUnitRow bikes={bikes} onAdd={handleAddUnit} />
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'parts' && (
                    <div className="animate-in slide-in-from-bottom-2 duration-300">
                        <RoadRobosPartsInventory search={search} filterCat={filterCat} />
                    </div>
                )}
            </main>
        </div>
    );
};

const VehicleCard: React.FC<{
    bike: InventoryBike;
    checks: VehicleChecks;
    auditState: Record<string, boolean>;
    onToggleAudit: (label: string) => void;
    isExpanded: boolean;
    onToggleExpand: () => void;
    onToggleCheck: (key: keyof VehicleChecks) => void;
    onApproveService: () => void;
    onRejectService: (bike: Bike) => void;
}> = ({ bike, checks, auditState, onToggleAudit, isExpanded, onToggleExpand, onToggleCheck, onSendToService, onApproveService, onRejectService }) => {
    const sc = STATUS_CONFIG[bike.status];
    const completedChecks = Object.values(checks).filter(c => c === 'completed').length;
    const total = STATIONS.length;
    const progress = Math.round((completedChecks / total) * 100);

    return (
        <div className="bg-white rounded-[20px] shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden border border-gray-100 group relative">
            {/* Status Color Band (gradient) */}
            <div className={`h-1.5 w-full ${bike.status === 'readyToRent' ? 'bg-gradient-to-r from-emerald-400 to-emerald-500' :
                bike.status === 'inService' ? 'bg-gradient-to-r from-amber-400 to-amber-500' :
                    bike.status === 'criticalFix' ? 'bg-gradient-to-r from-red-500 to-rose-600' :
                        bike.status === 'awaitingApproval' ? 'bg-gradient-to-r from-indigo-500 to-blue-500' : 'bg-gradient-to-r from-gray-300 to-gray-400'
                }`} />

            {/* Image Section */}
            <div className="h-28 flex items-center justify-center p-3 bg-gradient-to-b from-gray-50/80 to-white relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,theme(colors.gray.100)_0%,transparent_70%)] opacity-50" />
                <img src={bike.images?.[0] || ''} alt={bike.name} className="w-full h-full object-contain drop-shadow-md transition-transform duration-500 group-hover:scale-110 relative z-10" />

                {/* Modern pill for ID */}
                <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded-full bg-white/90 backdrop-blur-md border border-gray-200 text-[9px] font-black text-gray-600 tracking-wider shadow-sm z-20 flex items-center gap-1">
                    <span className={`w-1 h-1 rounded-full ${sc.dot}`} />
                    {bike.unit ? bike.unit.unit_number : `MODEL #${bike.id}`}
                </div>
            </div>

            <div className="p-3 flex-1 flex flex-col z-20 bg-white">
                <div className="flex justify-between items-start mb-2">
                    <div>
                        <h3 className="text-[15px] font-black text-[#0A2540] leading-none tracking-tight mb-1">{bike.name}</h3>
                        <p className="text-[8px] text-gray-400 font-bold uppercase tracking-widest">{bike.specs?.transmission || 'EEVA-ECO PLATFORM'}</p>
                    </div>

                    <div className={`px-1.5 py-0.5 text-[8px] font-bold rounded-lg border uppercase tracking-widest flex items-center gap-1 ${sc.color} shadow-sm shrink-0`}>
                        {sc.label}
                    </div>
                </div>

                <div className="mt-auto pt-2 w-full">
                    <div className="flex items-center justify-between text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-1">
                        <span className="flex items-center gap-1"><ShieldCheckIcon className="w-2.5 h-2.5 text-gray-400" /> Health</span>
                        <span className={`font-black ${progress === 100 ? 'text-emerald-500' : 'text-[#0A2540]'}`}>{progress}%</span>
                    </div>
                    <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden shadow-inner">
                        <div className={`h-full transition-all duration-1000 ease-out rounded-full ${progress === 100 ? 'bg-gradient-to-r from-emerald-400 to-emerald-500' : 'bg-gradient-to-r from-slate-700 to-[#0b281b]'}`} style={{ width: `${progress}%` }} />
                    </div>
                </div>
            </div>

            <div className="px-3 pb-3 pt-0.5 flex flex-col gap-1.5 z-20 bg-white">
                <button
                    onClick={onToggleExpand}
                    className={`w-full py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 font-black text-[10px] uppercase tracking-[0.05em] shadow-sm transition-all active:scale-[0.98] ${bike.status === 'readyToRent' ? 'bg-gray-100 text-gray-600 hover:bg-primary/10 hover:text-primary hover:shadow-md' : 'bg-[#E9FF70] text-[#0b281b] hover:bg-[#d4e85d]'}`}
                >
                    <ShieldCheckIcon className="w-3.5 h-3.5" />
                    <span>{bike.status === 'readyToRent' ? 'Diagnosis' : 'Review'}</span>
                </button>

                {bike.status !== 'inService' && bike.status !== 'criticalFix' && bike.status !== 'awaitingApproval' && (
                    <button
                        onClick={onSendToService}
                        className="w-full py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 text-gray-500 bg-gray-50 border border-gray-100 font-black text-[9px] uppercase tracking-widest hover:border-red-200 hover:text-red-600 hover:bg-red-50 transition-all active:scale-[0.98]"
                    >
                        <WrenchIcon className="w-3 h-3" />
                        <span>Service</span>
                    </button>
                )}
            </div>
            <VehicleSpecsPanel
                bike={bike}
                isOpen={isExpanded}
                onClose={onToggleExpand}
                auditState={auditState}
                onToggleAudit={onToggleAudit}
                onApproveService={onApproveService}
                onRejectService={() => onRejectService(bike)}
            />
        </div >
    );
};

const VehicleSpecsPanel: React.FC<{
    bike: InventoryBike;
    isOpen: boolean;
    onClose: () => void;
    auditState: Record<string, boolean>;
    onToggleAudit: (label: string) => void;
    onApproveService: () => void;
    onRejectService: () => void;
}> = ({ bike, isOpen, onClose, auditState, onToggleAudit, onApproveService, onRejectService }) => {

    if (!isOpen) return null;

    const toggleStep = (label: string) => {
        if (bike.status === 'readyToRent') return; // Locked when ready
        onToggleAudit(label);
    };

    const verifiedCount = Object.values(auditState).filter(Boolean).length;
    const totalChecksRequired = STATIONS.length;
    const isVerificationComplete = verifiedCount >= totalChecksRequired;
    const verifyProgress = Math.round((verifiedCount / totalChecksRequired) * 100);

    const isReady = bike.status === 'readyToRent';
    const needsApproval = bike.status !== 'readyToRent';

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-white w-full max-w-2xl rounded-xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-300">

                <div className="flex items-start justify-between p-6 bg-white relative">
                    <div className="flex items-center gap-5">
                        <div className="w-[52px] h-[52px] rounded-xl bg-[#0b281b] flex items-center justify-center shadow-sm flex-shrink-0">
                            <svg className="w-6 h-6 text-[#FFB020]" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.381z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <div className="flex items-center gap-3">
                                <h2 className="text-[22px] font-bold text-gray-900 tracking-tight leading-none">{bike.name}</h2>
                                <span className={`px-2.5 py-1 text-[9px] font-bold uppercase tracking-widest rounded border leading-none ${STATUS_CONFIG[bike.status]?.color || 'border-emerald-200 bg-emerald-50 text-emerald-600'
                                    }`}>
                                    {STATUS_CONFIG[bike.status]?.label || STATUS_CONFIG.readyToRent.label}
                                </span>
                            </div>
                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest leading-none">EEVA-ECO EV PLATFORM &bull; 2026 EDITION</p>
                        </div>
                    </div>

                    <button onClick={onClose} className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-all active:scale-95 absolute right-6 top-6">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-8 pt-2 space-y-10 relative">
                    <div className="absolute top-0 left-0 right-0 h-px bg-gray-100 mx-6" />

                    {/* Floating decorative dots */}
                    <div className="absolute top-12 left-[38%] w-1.5 h-1.5 bg-pink-400 rounded-full shadow-[0_0_8px_2px_rgba(244,114,182,0.6)] animate-pulse" />
                    <div className="absolute top-6 right-[22%] w-1.5 h-1.5 bg-pink-400 rounded-full shadow-[0_0_8px_2px_rgba(244,114,182,0.6)] animate-pulse" style={{ animationDelay: '1s' }} />
                    <div className="absolute top-[35%] right-[10%] w-1 h-1 bg-pink-400 rounded-full shadow-[0_0_8px_2px_rgba(244,114,182,0.6)] animate-pulse" style={{ animationDelay: '2s' }} />

                    {/* ─── SECTION 1: Technician's Diagnostic Report ─── */}
                    <div>
                        <div className="flex items-center justify-between mb-5">
                            <h3 className="text-[10px] font-bold text-gray-800 uppercase tracking-[0.2em] flex items-center gap-4">
                                <span className="w-6 h-px bg-gray-200" /> TECHNICIAN'S DIAGNOSTIC REPORT
                            </h3>
                            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest bg-gray-50 px-2 py-1 rounded border border-gray-100">
                                COMPLETED BY: {bike.assignedTech || 'Lead Tech'}
                            </span>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                            {Object.entries(bike.checks || {}).map(([label, status]) => (
                                <div
                                    key={label}
                                    className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl border text-[11px] font-bold transition-all duration-300 w-full text-left ${status === 'completed'
                                        ? 'border-emerald-200/60 bg-gradient-to-br from-emerald-50 to-white text-emerald-800 shadow-[0_2px_10px_-3px_rgba(16,185,129,0.1)]'
                                        : 'border-slate-200/60 bg-slate-50/50 text-slate-400'
                                        }`}
                                >
                                    <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 ${status === 'completed' ? 'bg-emerald-100 rotate-0 scale-100' : 'bg-transparent -rotate-90 scale-95'}`}>
                                        {status === 'completed' ? (
                                            <CheckCircleIcon className="w-5 h-5 text-emerald-500 animate-in zoom-in spin-in-12 duration-300 drop-shadow-sm" />
                                        ) : (
                                            <span className="text-slate-300 font-bold text-[14px] leading-none transition-all">&minus;</span>
                                        )}
                                    </div>
                                    <span className="truncate uppercase tracking-wider">{label}</span>
                                </div>
                            ))}
                            {(!bike.checks || Object.keys(bike.checks).length === 0) && (
                                <div className="col-span-full py-4 text-center border border-dashed border-gray-200 rounded-lg">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">No diagnostic data available</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ─── SECTION 2: Repair Bill (Spares & Logistics) ─── */}
                    <div>
                        <h3 className="text-[10px] font-bold text-gray-800 uppercase tracking-[0.2em] mb-5 flex items-center gap-4">
                            <span className="w-6 h-px bg-gray-200" /> LOGISTICS & SPARE PARTS LOG
                        </h3>
                        {bike.spareParts && bike.spareParts.length > 0 ? (
                            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                                <div className="p-4 bg-gray-50/50 border-b border-gray-100 flex justify-between items-center">
                                    <div className="flex items-center gap-2">
                                        <CogIcon className="w-4 h-4 text-emerald-500" />
                                        <span className="text-[11px] font-black text-gray-700 uppercase tracking-widest">{bike.spareParts.length} Components Replaced</span>
                                    </div>
                                    <span className="text-[12px] font-black text-emerald-600 tabular-nums">
                                        TOTAL: ₹{bike.spareParts.reduce((acc, p) => acc + (p.total || 0), 0)}
                                    </span>
                                </div>
                                <div className="max-h-60 overflow-y-auto">
                                    <table className="w-full text-[11px] font-bold">
                                        <thead className="sticky top-0 bg-white shadow-sm text-gray-400 uppercase tracking-widest">
                                            <tr>
                                                <th className="px-5 py-2.5 text-left font-black text-[9px]">Description</th>
                                                <th className="px-5 py-2.5 text-right font-black text-[9px]">Total (Incl. Tax)</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {bike.spareParts.map((part, idx) => (
                                                <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                                                    <td className="px-5 py-3 text-gray-700">
                                                        <div className="uppercase">{part.name}</div>
                                                        <div className="text-[8px] text-gray-400 font-bold tracking-widest mt-0.5">GENUINE REPLACEMENT</div>
                                                    </td>
                                                    <td className="px-5 py-3 text-right text-primary font-black">₹{part.total}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        ) : (
                            <div className="p-8 text-center bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
                                <SearchIcon className="w-6 h-6 text-gray-300 mx-auto mb-2" />
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">No spare parts were logged during this service session.</p>
                            </div>
                        )}
                    </div>

                    {/* ─── SECTION 3: Component Telemetry ─── */}
                    <div>
                        <h3 className="text-[10px] font-bold text-gray-800 uppercase tracking-[0.2em] mb-5 flex items-center gap-4">
                            <span className="w-6 h-px bg-gray-200" /> LIVE COMPONENT TELEMETRY
                        </h3>
                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                            <SpecBox label="Drive system" value={bike.specs.transmission} />
                            <SpecBox label="Software Build" value="v2.1.0-RC" />
                            <SpecBox label="Top Performance" value={`${bike.specs.cc} CC Equiv.`} />
                            <SpecBox label="Battery health" value="98.2% SOH" />
                            <SpecBox label="Controller load" value="Nominal" />
                            <SpecBox label="GPS Lock" value="Bengaluru Hub" />
                        </div>
                    </div>

                    {/* ─── SECTION 4: Manager Audit Checklist ─── */}
                    <div>
                        <div className="flex items-center justify-between mb-5 pt-4 border-t border-gray-100">
                            <h3 className={`text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-4 ${isReady ? 'text-emerald-500' : 'text-primary'}`}>
                                <span className={`w-6 h-px ${isReady ? 'bg-emerald-200' : 'bg-primary/20'}`} />
                                {isReady ? 'AUDITED AND VERIFIED' : 'FINAL MANAGER AUDIT'}
                            </h3>
                            <span className={`px-2 py-1 rounded-full text-[10px] font-black tabular-nums transition-all ${isReady || isVerificationComplete ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-400'}`}>
                                {isReady ? 'AUTHENTICATED' : `${verifiedCount}/${totalChecksRequired} STEPS AUDITED`}
                            </span>
                        </div>

                        {/* Audit progress bar */}
                        <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden mb-8">
                            <div
                                className={`h-full transition-all duration-700 ease-out rounded-full ${isVerificationComplete ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.4)]' : 'bg-primary'}`}
                                style={{ width: `${verifyProgress}%` }}
                            />
                        </div>

                        <div className="grid gap-3 w-full">
                            {STATIONS.map((station, idx) => {
                                const isVerified = isReady || auditState[station.label] || false;

                                return (
                                    <div
                                        key={station.id}
                                        onClick={() => toggleStep(station.label)}
                                        className={`group relative flex items-center gap-4 px-5 py-4 rounded-xl border-2 transition-all duration-300 w-full overflow-hidden ${isReady
                                            ? 'border-emerald-100 bg-emerald-50/20 cursor-default'
                                            : isVerified
                                                ? 'border-emerald-500 bg-emerald-50/50 shadow-sm cursor-pointer'
                                                : 'border-gray-200 bg-white hover:border-primary/20 hover:shadow-md cursor-pointer'
                                            }`}
                                    >
                                        <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center shrink-0 transition-all duration-300 ${isVerified
                                            ? 'border-emerald-500 bg-emerald-500 text-white scale-110'
                                            : 'border-gray-200 text-transparent group-hover:border-primary group-hover:bg-primary/5'
                                            }`}>
                                            <CheckCircleIcon className={`w-4 h-4 ${isVerified ? 'opacity-100' : 'opacity-0'}`} />
                                        </div>

                                        <div className="flex-1">
                                            <div className={`flex items-center gap-2 text-sm font-black transition-colors ${isVerified ? 'text-emerald-800' : 'text-gray-700 group-hover:text-primary'}`}>
                                                {isReady ? 'Checkpoint Verified' : `Audit Step ${idx + 1}`}: {station.label}
                                            </div>
                                            <div className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">
                                                {isReady ? 'Certified & Logged' : 'Verify Technician Installation + Calibration'}
                                            </div>
                                        </div>

                                        {isVerified && (
                                            <div className="flex items-center gap-1.5 px-2 py-1 bg-emerald-100 rounded text-[9px] font-black text-emerald-600 uppercase tracking-tighter">
                                                <ShieldCheckIcon className="w-3 h-3" />
                                                {isReady ? 'VERIFIED' : 'Verified'}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* ─── FOOTER: Action Buttons ─── */}
                <div className="p-5 bg-white border-t border-gray-100 flex items-center gap-3">
                    {needsApproval ? (
                        <>
                            <button
                                onClick={() => { onRejectService(); onClose(); }}
                                className="flex-1 py-3.5 px-6 rounded-xl border-2 border-red-100 bg-red-50 text-red-600 font-bold text-[12px] uppercase tracking-widest hover:bg-red-100 hover:border-red-200 transition-colors active:scale-[0.98]"
                            >
                                Return to Service
                            </button>
                            <button
                                onClick={() => { onApproveService(); onClose(); }}
                                disabled={!isVerificationComplete}
                                className={`flex-[2] flex justify-center items-center gap-3 py-3.5 px-6 rounded-xl font-bold text-[13px] uppercase tracking-[0.1em] transition-all duration-300 ${isVerificationComplete
                                    ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 hover:bg-emerald-600 active:scale-[0.98]'
                                    : 'bg-gray-100 text-gray-400 cursor-not-allowed opacity-80 border border-gray-200'
                                    }`}
                            >
                                <span>{isVerificationComplete ? 'Approve for Rent' : `Complete All Checks (${verifiedCount}/${totalChecksRequired})`}</span>
                                {isVerificationComplete && (
                                    <svg className="w-4 h-4 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                    </svg>
                                )}
                            </button>
                        </>
                    ) : (
                        <button onClick={onClose} className="w-full bg-[#0b281b] text-white font-semibold text-[14px] px-6 py-3 rounded-xl hover:bg-[#061810] transition-all shadow-sm active:scale-95">
                            Close Health Report
                        </button>
                    )}
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

export default RoadRobosInventoryManager;
