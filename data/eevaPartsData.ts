// ─── EEVA-ECO Electric Bike BOM - Complete Spare Parts Database ───

export type PartCategory = 'ELECTRICAL' | 'BODY' | 'CHASSIS' | 'LIGHTING' | 'BRAKES' | 'SUSPENSION';

export interface EevaEcoPart {
    srNo: number;
    name: string;
    price: number;
    category: PartCategory;
    stock: { current: number; min: number; max: number };
    highValue: boolean;
    lastOrdered: string;
    compatibleModels: string[];
}

export const PART_CATEGORIES: { id: PartCategory; label: string; icon: string; color: string }[] = [
    { id: 'ELECTRICAL', label: 'Electrical', icon: '⚡', color: '#FF6347' }, // Secondary Tomato
    { id: 'BODY', label: 'Body Plastics', icon: '🛡️', color: '#084C3E' },     // Primary Green
    { id: 'CHASSIS', label: 'Chassis', icon: '🔩', color: '#1E40AF' },       // Contrasting Blue
    { id: 'LIGHTING', label: 'Lighting', icon: '💡', color: '#F59E0B' },      // Warm
    { id: 'BRAKES', label: 'Brakes', icon: '🛑', color: '#DC2626' },          // Error/Red
    { id: 'SUSPENSION', label: 'Suspension', icon: '🔧', color: '#0D9488' }, // Teal
];

export const EEVA_ECO_PARTS: EevaEcoPart[] = [
    // ═══ ELECTRICAL (10 parts) ═══
    { srNo: 1, name: 'BLDC Motor', price: 8250, category: 'ELECTRICAL', stock: { current: 12, min: 5, max: 50 }, highValue: true, lastOrdered: '2026-02-20', compatibleModels: ['Zelio Eeva E', 'Ather 450X'] },
    { srNo: 2, name: 'Controller Unit', price: 2475, category: 'ELECTRICAL', stock: { current: 8, min: 4, max: 30 }, highValue: true, lastOrdered: '2026-02-18', compatibleModels: ['Zelio Eeva E', 'Ather 450X'] },
    { srNo: 3, name: 'Main Wire Harness', price: 1210, category: 'ELECTRICAL', stock: { current: 15, min: 6, max: 40 }, highValue: false, lastOrdered: '2026-02-25', compatibleModels: ['Zelio Eeva E'] },
    { srNo: 4, name: 'Battery Wire', price: 144, category: 'ELECTRICAL', stock: { current: 45, min: 15, max: 100 }, highValue: false, lastOrdered: '2026-03-01', compatibleModels: ['Zelio Eeva E', 'Ather 450X'] },
    { srNo: 5, name: 'DC-DC Converter', price: 250, category: 'ELECTRICAL', stock: { current: 20, min: 8, max: 60 }, highValue: false, lastOrdered: '2026-02-22', compatibleModels: ['Zelio Eeva E'] },
    { srNo: 6, name: 'Charging Socket', price: 180, category: 'ELECTRICAL', stock: { current: 18, min: 8, max: 50 }, highValue: false, lastOrdered: '2026-02-28', compatibleModels: ['Zelio Eeva E', 'Ather 450X'] },
    { srNo: 7, name: 'Ignition Switch', price: 330, category: 'ELECTRICAL', stock: { current: 22, min: 10, max: 50 }, highValue: false, lastOrdered: '2026-02-15', compatibleModels: ['Zelio Eeva E'] },
    { srNo: 8, name: 'Horn', price: 120, category: 'ELECTRICAL', stock: { current: 30, min: 10, max: 80 }, highValue: false, lastOrdered: '2026-03-02', compatibleModels: ['Zelio Eeva E', 'Ather 450X'] },
    { srNo: 9, name: 'Buzzer Unit', price: 85, category: 'ELECTRICAL', stock: { current: 25, min: 10, max: 60 }, highValue: false, lastOrdered: '2026-02-20', compatibleModels: ['Zelio Eeva E'] },
    { srNo: 10, name: 'Fuse Box Assembly', price: 95, category: 'ELECTRICAL', stock: { current: 28, min: 12, max: 70 }, highValue: false, lastOrdered: '2026-02-26', compatibleModels: ['Zelio Eeva E', 'Ather 450X'] },

    // ═══ BODY PLASTICS (10 parts) ═══
    { srNo: 11, name: 'Head Cover', price: 540, category: 'BODY', stock: { current: 14, min: 5, max: 30 }, highValue: false, lastOrdered: '2026-02-18', compatibleModels: ['Zelio Eeva E'] },
    { srNo: 12, name: 'Front Fender', price: 600, category: 'BODY', stock: { current: 10, min: 5, max: 25 }, highValue: false, lastOrdered: '2026-02-22', compatibleModels: ['Zelio Eeva E'] },
    { srNo: 13, name: 'Rear Fender', price: 660, category: 'BODY', stock: { current: 9, min: 5, max: 25 }, highValue: false, lastOrdered: '2026-02-22', compatibleModels: ['Zelio Eeva E'] },
    { srNo: 14, name: 'Seat Assembly', price: 1210, category: 'BODY', stock: { current: 7, min: 4, max: 20 }, highValue: false, lastOrdered: '2026-02-15', compatibleModels: ['Zelio Eeva E'] },
    { srNo: 15, name: 'Grip Set (L+R)', price: 360, category: 'BODY', stock: { current: 20, min: 10, max: 50 }, highValue: false, lastOrdered: '2026-03-01', compatibleModels: ['Zelio Eeva E', 'Ather 450X'] },
    { srNo: 16, name: 'Rear Carrier', price: 660, category: 'BODY', stock: { current: 11, min: 4, max: 25 }, highValue: false, lastOrdered: '2026-02-20', compatibleModels: ['Zelio Eeva E'] },
    { srNo: 17, name: 'Foot Rest (L+R)', price: 280, category: 'BODY', stock: { current: 16, min: 8, max: 40 }, highValue: false, lastOrdered: '2026-02-28', compatibleModels: ['Zelio Eeva E'] },
    { srNo: 18, name: 'Side Panel LHS', price: 440, category: 'BODY', stock: { current: 8, min: 4, max: 20 }, highValue: false, lastOrdered: '2026-02-16', compatibleModels: ['Zelio Eeva E'] },
    { srNo: 19, name: 'Side Panel RHS', price: 440, category: 'BODY', stock: { current: 8, min: 4, max: 20 }, highValue: false, lastOrdered: '2026-02-16', compatibleModels: ['Zelio Eeva E'] },
    { srNo: 20, name: 'Mud Flap', price: 100, category: 'BODY', stock: { current: 35, min: 10, max: 80 }, highValue: false, lastOrdered: '2026-03-02', compatibleModels: ['Zelio Eeva E', 'Ather 450X'] },

    // ═══ CHASSIS (8 parts) ═══
    { srNo: 21, name: 'Chassis Frame', price: 6000, category: 'CHASSIS', stock: { current: 3, min: 2, max: 10 }, highValue: true, lastOrdered: '2026-02-10', compatibleModels: ['Zelio Eeva E'] },
    { srNo: 22, name: 'Front Fork Assembly', price: 770, category: 'CHASSIS', stock: { current: 10, min: 4, max: 20 }, highValue: false, lastOrdered: '2026-02-20', compatibleModels: ['Zelio Eeva E'] },
    { srNo: 23, name: 'Handle Bar', price: 420, category: 'CHASSIS', stock: { current: 13, min: 5, max: 30 }, highValue: false, lastOrdered: '2026-02-25', compatibleModels: ['Zelio Eeva E'] },
    { srNo: 24, name: 'Side Stand', price: 150, category: 'CHASSIS', stock: { current: 18, min: 8, max: 40 }, highValue: false, lastOrdered: '2026-03-01', compatibleModels: ['Zelio Eeva E', 'Ather 450X'] },
    { srNo: 25, name: 'Main/Centre Stand', price: 300, category: 'CHASSIS', stock: { current: 12, min: 5, max: 25 }, highValue: false, lastOrdered: '2026-02-28', compatibleModels: ['Zelio Eeva E'] },
    { srNo: 26, name: 'Swing Arm', price: 880, category: 'CHASSIS', stock: { current: 6, min: 3, max: 15 }, highValue: false, lastOrdered: '2026-02-14', compatibleModels: ['Zelio Eeva E'] },
    { srNo: 27, name: 'Chain Sprocket Set', price: 520, category: 'CHASSIS', stock: { current: 14, min: 6, max: 30 }, highValue: false, lastOrdered: '2026-02-22', compatibleModels: ['Zelio Eeva E'] },
    { srNo: 28, name: 'Wheel Rim (Front)', price: 750, category: 'CHASSIS', stock: { current: 7, min: 3, max: 15 }, highValue: false, lastOrdered: '2026-02-18', compatibleModels: ['Zelio Eeva E'] },

    // ═══ LIGHTING (8 parts) ═══
    { srNo: 29, name: 'Head Light Assembly', price: 1100, category: 'LIGHTING', stock: { current: 25, min: 8, max: 40 }, highValue: false, lastOrdered: '2026-02-28', compatibleModels: ['Zelio Eeva E'] },
    { srNo: 30, name: 'Digital Speedometer', price: 715, category: 'LIGHTING', stock: { current: 10, min: 4, max: 20 }, highValue: false, lastOrdered: '2026-02-20', compatibleModels: ['Zelio Eeva E'] },
    { srNo: 31, name: 'Front Indicator LHS', price: 200, category: 'LIGHTING', stock: { current: 20, min: 8, max: 50 }, highValue: false, lastOrdered: '2026-03-01', compatibleModels: ['Zelio Eeva E'] },
    { srNo: 32, name: 'Front Indicator RHS', price: 200, category: 'LIGHTING', stock: { current: 20, min: 8, max: 50 }, highValue: false, lastOrdered: '2026-03-01', compatibleModels: ['Zelio Eeva E'] },
    { srNo: 33, name: 'Rear Indicator LHS', price: 200, category: 'LIGHTING', stock: { current: 18, min: 8, max: 50 }, highValue: false, lastOrdered: '2026-03-01', compatibleModels: ['Zelio Eeva E'] },
    { srNo: 34, name: 'Rear Indicator RHS', price: 200, category: 'LIGHTING', stock: { current: 18, min: 8, max: 50 }, highValue: false, lastOrdered: '2026-03-01', compatibleModels: ['Zelio Eeva E'] },
    { srNo: 35, name: 'Tail/Rear Light Assembly', price: 660, category: 'LIGHTING', stock: { current: 15, min: 5, max: 30 }, highValue: false, lastOrdered: '2026-02-25', compatibleModels: ['Zelio Eeva E'] },
    { srNo: 36, name: 'Reflector Set', price: 20, category: 'LIGHTING', stock: { current: 50, min: 20, max: 150 }, highValue: false, lastOrdered: '2026-03-02', compatibleModels: ['Zelio Eeva E', 'Ather 450X'] },

    // ═══ BRAKES (6 parts) ═══
    { srNo: 37, name: 'Front Brake Drum', price: 490, category: 'BRAKES', stock: { current: 16, min: 6, max: 30 }, highValue: false, lastOrdered: '2026-02-22', compatibleModels: ['Zelio Eeva E'] },
    { srNo: 38, name: 'Rear Brake Drum', price: 490, category: 'BRAKES', stock: { current: 14, min: 6, max: 30 }, highValue: false, lastOrdered: '2026-02-22', compatibleModels: ['Zelio Eeva E'] },
    { srNo: 39, name: 'Front Brake Wire', price: 160, category: 'BRAKES', stock: { current: 22, min: 10, max: 50 }, highValue: false, lastOrdered: '2026-02-28', compatibleModels: ['Zelio Eeva E'] },
    { srNo: 40, name: 'Rear Brake Wire', price: 150, category: 'BRAKES', stock: { current: 22, min: 10, max: 50 }, highValue: false, lastOrdered: '2026-02-28', compatibleModels: ['Zelio Eeva E'] },
    { srNo: 41, name: 'Brake Shoe Set (Front)', price: 180, category: 'BRAKES', stock: { current: 30, min: 12, max: 60 }, highValue: false, lastOrdered: '2026-03-01', compatibleModels: ['Zelio Eeva E', 'Ather 450X'] },
    { srNo: 42, name: 'Brake Shoe Set (Rear)', price: 180, category: 'BRAKES', stock: { current: 28, min: 12, max: 60 }, highValue: false, lastOrdered: '2026-03-01', compatibleModels: ['Zelio Eeva E', 'Ather 450X'] },

    // ═══ SUSPENSION (4 parts) ═══
    { srNo: 43, name: 'Front Shocker LHS', price: 700, category: 'SUSPENSION', stock: { current: 10, min: 4, max: 20 }, highValue: false, lastOrdered: '2026-02-18', compatibleModels: ['Zelio Eeva E'] },
    { srNo: 44, name: 'Front Shocker RHS', price: 700, category: 'SUSPENSION', stock: { current: 10, min: 4, max: 20 }, highValue: false, lastOrdered: '2026-02-18', compatibleModels: ['Zelio Eeva E'] },
    { srNo: 45, name: 'Rear Shocker Assembly', price: 1100, category: 'SUSPENSION', stock: { current: 8, min: 3, max: 15 }, highValue: false, lastOrdered: '2026-02-15', compatibleModels: ['Zelio Eeva E'] },
    { srNo: 46, name: 'Fork Ball Set', price: 60, category: 'SUSPENSION', stock: { current: 40, min: 15, max: 100 }, highValue: false, lastOrdered: '2026-03-02', compatibleModels: ['Zelio Eeva E', 'Ather 450X'] },
];
