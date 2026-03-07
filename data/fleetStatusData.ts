// ─── Real-Time Fleet Status Data ─── //

export type ScooterStatusType = 'rentedRunning' | 'readyRent' | 'inService' | 'awaitingApproval';

export interface ScooterUnit {
    id: string;
    regNumber: string;
    model: string;
    currentStatus: ScooterStatusType;
    location: { area: string; lat: number; lng: number };
    statusChangedAt: string;
    // Status-specific metadata
    rental?: { customerName: string; phone: string; startTime: string; revenuePerHour: number; kmDriven: number };
    booking?: { bookingId: string; customerName: string; pickupDate: string; pickupTime: string };
    service?: { failedChecks: string[]; etaHours: number; partsNeeded: { name: string; price: number }[]; assignedTech: string };
    station?: string;
    allChecksPassed?: boolean;
    lastServiceKm?: number;
}

export interface FleetAlert {
    id: string;
    type: 'return' | 'service' | 'booking' | 'revenue';
    message: string;
    timestamp: string;
    scooterId?: string;
    priority: 'low' | 'medium' | 'high';
}

// Bengaluru station coordinates (simplified for SVG map)
export const BENGALURU_STATIONS = [
    { name: 'Yelahanka', lat: 13.1007, lng: 77.5963, x: 45, y: 15 },
    { name: 'Whitefield', lat: 12.9698, lng: 77.7500, x: 82, y: 45 },
    { name: 'Electronic City', lat: 12.8399, lng: 77.6770, x: 65, y: 85 },
    { name: 'Koramangala', lat: 12.9352, lng: 77.6245, x: 55, y: 55 },
    { name: 'Indiranagar', lat: 12.9784, lng: 77.6408, x: 60, y: 40 },
    { name: 'HSR Layout', lat: 12.9116, lng: 77.6474, x: 58, y: 65 },
    { name: 'Marathahalli', lat: 12.9591, lng: 77.7009, x: 75, y: 48 },
    { name: 'Hebbal', lat: 13.0358, lng: 77.5970, x: 48, y: 25 },
    { name: 'BTM Layout', lat: 12.9166, lng: 77.6101, x: 50, y: 62 },
    { name: 'JP Nagar', lat: 12.9063, lng: 77.5857, x: 42, y: 70 },
];

// 50 Sample Scooters
export const FLEET_SCOOTERS: ScooterUnit[] = [
    // ═══ RENTED & RUNNING (23 scooters) ═══
    { id: 'SC-001', regNumber: 'KA01AB1234', model: 'Zelio Eeva E', currentStatus: 'rentedRunning', location: { area: 'Yelahanka', lat: 13.10, lng: 77.59 }, statusChangedAt: '2026-03-04T08:30:00', rental: { customerName: 'Rahul Sharma', phone: '+91 98765 43210', startTime: '2026-03-04T08:30:00', revenuePerHour: 150, kmDriven: 32 }, lastServiceKm: 450 },
    { id: 'SC-002', regNumber: 'KA01CD5678', model: 'Zelio Eeva E', currentStatus: 'rentedRunning', location: { area: 'Whitefield', lat: 12.97, lng: 77.75 }, statusChangedAt: '2026-03-04T07:00:00', rental: { customerName: 'Priya Nair', phone: '+91 87654 32109', startTime: '2026-03-04T07:00:00', revenuePerHour: 150, kmDriven: 45 }, lastServiceKm: 380 },
    { id: 'SC-003', regNumber: 'KA01EF9012', model: 'Zelio Eeva E', currentStatus: 'rentedRunning', location: { area: 'Electronic City', lat: 12.84, lng: 77.68 }, statusChangedAt: '2026-03-04T09:15:00', rental: { customerName: 'Arun Kumar', phone: '+91 76543 21098', startTime: '2026-03-04T09:15:00', revenuePerHour: 150, kmDriven: 18 }, lastServiceKm: 290 },
    { id: 'SC-004', regNumber: 'KA01GH3456', model: 'Zelio Eeva E', currentStatus: 'rentedRunning', location: { area: 'Koramangala', lat: 12.94, lng: 77.62 }, statusChangedAt: '2026-03-04T06:45:00', rental: { customerName: 'Sneha Patel', phone: '+91 65432 10987', startTime: '2026-03-04T06:45:00', revenuePerHour: 150, kmDriven: 56 }, lastServiceKm: 410 },
    { id: 'SC-005', regNumber: 'KA01IJ7890', model: 'Zelio Eeva E', currentStatus: 'rentedRunning', location: { area: 'Indiranagar', lat: 12.98, lng: 77.64 }, statusChangedAt: '2026-03-04T10:00:00', rental: { customerName: 'Vikram Singh', phone: '+91 54321 09876', startTime: '2026-03-04T10:00:00', revenuePerHour: 150, kmDriven: 12 }, lastServiceKm: 510 },
    { id: 'SC-006', regNumber: 'KA01KL1122', model: 'Zelio Eeva E', currentStatus: 'rentedRunning', location: { area: 'HSR Layout', lat: 12.91, lng: 77.65 }, statusChangedAt: '2026-03-04T08:00:00', rental: { customerName: 'Meera Reddy', phone: '+91 43210 98765', startTime: '2026-03-04T08:00:00', revenuePerHour: 150, kmDriven: 28 }, lastServiceKm: 340 },
    { id: 'SC-007', regNumber: 'KA01MN3344', model: 'Zelio Eeva E', currentStatus: 'rentedRunning', location: { area: 'Marathahalli', lat: 12.96, lng: 77.70 }, statusChangedAt: '2026-03-04T07:30:00', rental: { customerName: 'Deepak Joshi', phone: '+91 32109 87654', startTime: '2026-03-04T07:30:00', revenuePerHour: 150, kmDriven: 41 }, lastServiceKm: 470 },
    { id: 'SC-008', regNumber: 'KA01OP5566', model: 'Zelio Eeva E', currentStatus: 'rentedRunning', location: { area: 'Hebbal', lat: 13.04, lng: 77.60 }, statusChangedAt: '2026-03-04T09:45:00', rental: { customerName: 'Anita Bose', phone: '+91 21098 76543', startTime: '2026-03-04T09:45:00', revenuePerHour: 150, kmDriven: 9 }, lastServiceKm: 220 },
    { id: 'SC-009', regNumber: 'KA01QR7788', model: 'Zelio Eeva E', currentStatus: 'rentedRunning', location: { area: 'BTM Layout', lat: 12.92, lng: 77.61 }, statusChangedAt: '2026-03-04T06:00:00', rental: { customerName: 'Karthik M', phone: '+91 10987 65432', startTime: '2026-03-04T06:00:00', revenuePerHour: 150, kmDriven: 67 }, lastServiceKm: 490 },
    { id: 'SC-010', regNumber: 'KA01ST9900', model: 'Zelio Eeva E', currentStatus: 'rentedRunning', location: { area: 'JP Nagar', lat: 12.91, lng: 77.59 }, statusChangedAt: '2026-03-04T08:15:00', rental: { customerName: 'Lakshmi D', phone: '+91 09876 54321', startTime: '2026-03-04T08:15:00', revenuePerHour: 150, kmDriven: 24 }, lastServiceKm: 360 },
    { id: 'SC-011', regNumber: 'KA01UV1133', model: 'Zelio Eeva E', currentStatus: 'rentedRunning', location: { area: 'Yelahanka', lat: 13.11, lng: 77.60 }, statusChangedAt: '2026-03-04T07:45:00', rental: { customerName: 'Nikhil R', phone: '+91 98761 23456', startTime: '2026-03-04T07:45:00', revenuePerHour: 150, kmDriven: 38 }, lastServiceKm: 300 },
    { id: 'SC-012', regNumber: 'KA01WX3355', model: 'Zelio Eeva E', currentStatus: 'rentedRunning', location: { area: 'Whitefield', lat: 12.98, lng: 77.74 }, statusChangedAt: '2026-03-04T09:00:00', rental: { customerName: 'Pooja S', phone: '+91 87651 23456', startTime: '2026-03-04T09:00:00', revenuePerHour: 150, kmDriven: 16 }, lastServiceKm: 430 },
    { id: 'SC-013', regNumber: 'KA01YZ5577', model: 'Zelio Eeva E', currentStatus: 'rentedRunning', location: { area: 'Koramangala', lat: 12.93, lng: 77.63 }, statusChangedAt: '2026-03-04T10:30:00', rental: { customerName: 'Suresh B', phone: '+91 76541 23456', startTime: '2026-03-04T10:30:00', revenuePerHour: 150, kmDriven: 5 }, lastServiceKm: 270 },
    { id: 'SC-014', regNumber: 'KA01AA7799', model: 'Zelio Eeva E', currentStatus: 'rentedRunning', location: { area: 'Electronic City', lat: 12.85, lng: 77.67 }, statusChangedAt: '2026-03-04T06:30:00', rental: { customerName: 'Divya K', phone: '+91 65431 23456', startTime: '2026-03-04T06:30:00', revenuePerHour: 150, kmDriven: 58 }, lastServiceKm: 500 },
    { id: 'SC-015', regNumber: 'KA01BB1100', model: 'Zelio Eeva E', currentStatus: 'rentedRunning', location: { area: 'Indiranagar', lat: 12.97, lng: 77.65 }, statusChangedAt: '2026-03-04T08:45:00', rental: { customerName: 'Amit G', phone: '+91 54321 23456', startTime: '2026-03-04T08:45:00', revenuePerHour: 150, kmDriven: 22 }, lastServiceKm: 380 },
    { id: 'SC-016', regNumber: 'KA01CC2211', model: 'Zelio Eeva E', currentStatus: 'rentedRunning', location: { area: 'Marathahalli', lat: 12.95, lng: 77.71 }, statusChangedAt: '2026-03-04T07:15:00', rental: { customerName: 'Ritu M', phone: '+91 43211 23456', startTime: '2026-03-04T07:15:00', revenuePerHour: 150, kmDriven: 48 }, lastServiceKm: 420 },
    { id: 'SC-017', regNumber: 'KA01DD3322', model: 'Zelio Eeva E', currentStatus: 'rentedRunning', location: { area: 'HSR Layout', lat: 12.92, lng: 77.64 }, statusChangedAt: '2026-03-04T09:30:00', rental: { customerName: 'Sanjay P', phone: '+91 32101 23456', startTime: '2026-03-04T09:30:00', revenuePerHour: 150, kmDriven: 14 }, lastServiceKm: 310 },
    { id: 'SC-018', regNumber: 'KA01EE4433', model: 'Zelio Eeva E', currentStatus: 'rentedRunning', location: { area: 'Hebbal', lat: 13.03, lng: 77.59 }, statusChangedAt: '2026-03-04T06:15:00', rental: { customerName: 'Kavita N', phone: '+91 21091 23456', startTime: '2026-03-04T06:15:00', revenuePerHour: 150, kmDriven: 62 }, lastServiceKm: 480 },
    { id: 'SC-019', regNumber: 'KA01FF5544', model: 'Zelio Eeva E', currentStatus: 'rentedRunning', location: { area: 'BTM Layout', lat: 12.91, lng: 77.62 }, statusChangedAt: '2026-03-04T10:15:00', rental: { customerName: 'Rajesh T', phone: '+91 10981 23456', startTime: '2026-03-04T10:15:00', revenuePerHour: 150, kmDriven: 8 }, lastServiceKm: 250 },
    { id: 'SC-020', regNumber: 'KA01GG6655', model: 'Zelio Eeva E', currentStatus: 'rentedRunning', location: { area: 'JP Nagar', lat: 12.90, lng: 77.58 }, statusChangedAt: '2026-03-04T08:00:00', rental: { customerName: 'Swati L', phone: '+91 09871 23456', startTime: '2026-03-04T08:00:00', revenuePerHour: 150, kmDriven: 35 }, lastServiceKm: 390 },
    { id: 'SC-021', regNumber: 'KA01HH7766', model: 'Zelio Eeva E', currentStatus: 'rentedRunning', location: { area: 'Yelahanka', lat: 13.09, lng: 77.58 }, statusChangedAt: '2026-03-04T07:00:00', rental: { customerName: 'Manish Y', phone: '+91 98765 11111', startTime: '2026-03-04T07:00:00', revenuePerHour: 150, kmDriven: 43 }, lastServiceKm: 350 },
    { id: 'SC-022', regNumber: 'KA01II8877', model: 'Zelio Eeva E', currentStatus: 'rentedRunning', location: { area: 'Whitefield', lat: 12.96, lng: 77.76 }, statusChangedAt: '2026-03-04T09:00:00', rental: { customerName: 'Neha W', phone: '+91 87654 22222', startTime: '2026-03-04T09:00:00', revenuePerHour: 150, kmDriven: 19 }, lastServiceKm: 440 },
    { id: 'SC-023', regNumber: 'KA01JJ9988', model: 'Zelio Eeva E', currentStatus: 'rentedRunning', location: { area: 'Koramangala', lat: 12.94, lng: 77.61 }, statusChangedAt: '2026-03-04T06:45:00', rental: { customerName: 'Rohan K', phone: '+91 76543 33333', startTime: '2026-03-04T06:45:00', revenuePerHour: 150, kmDriven: 51 }, lastServiceKm: 460 },

    // ═══ READY FOR RENT (18 scooters) ═══
    { id: 'SC-024', regNumber: 'KA02AB1001', model: 'Zelio Eeva E', currentStatus: 'readyRent', location: { area: 'Yelahanka', lat: 13.10, lng: 77.59 }, statusChangedAt: '2026-03-04T06:00:00', station: 'Yelahanka Hub', allChecksPassed: true, lastServiceKm: 120 },
    { id: 'SC-025', regNumber: 'KA02AB1002', model: 'Zelio Eeva E', currentStatus: 'readyRent', location: { area: 'Yelahanka', lat: 13.10, lng: 77.60 }, statusChangedAt: '2026-03-04T06:00:00', station: 'Yelahanka Hub', allChecksPassed: true, lastServiceKm: 200 },
    { id: 'SC-026', regNumber: 'KA02AB1003', model: 'Zelio Eeva E', currentStatus: 'readyRent', location: { area: 'Yelahanka', lat: 13.11, lng: 77.59 }, statusChangedAt: '2026-03-04T05:30:00', station: 'Yelahanka Hub', allChecksPassed: true, lastServiceKm: 180 },
    { id: 'SC-027', regNumber: 'KA02AB1004', model: 'Zelio Eeva E', currentStatus: 'readyRent', location: { area: 'Yelahanka', lat: 13.10, lng: 77.58 }, statusChangedAt: '2026-03-04T05:30:00', station: 'Yelahanka Hub', allChecksPassed: true, lastServiceKm: 90 },
    { id: 'SC-028', regNumber: 'KA02AB1005', model: 'Zelio Eeva E', currentStatus: 'readyRent', location: { area: 'Yelahanka', lat: 13.09, lng: 77.60 }, statusChangedAt: '2026-03-04T06:15:00', station: 'Yelahanka Hub', allChecksPassed: true, lastServiceKm: 150 },
    { id: 'SC-029', regNumber: 'KA02AB1006', model: 'Zelio Eeva E', currentStatus: 'readyRent', location: { area: 'Yelahanka', lat: 13.10, lng: 77.61 }, statusChangedAt: '2026-03-04T06:15:00', station: 'Yelahanka Hub', allChecksPassed: true, lastServiceKm: 110 },
    { id: 'SC-030', regNumber: 'KA02AB1007', model: 'Zelio Eeva E', currentStatus: 'readyRent', location: { area: 'Yelahanka', lat: 13.11, lng: 77.60 }, statusChangedAt: '2026-03-04T06:00:00', station: 'Yelahanka Hub', allChecksPassed: true, lastServiceKm: 250 },
    { id: 'SC-031', regNumber: 'KA02AB1008', model: 'Zelio Eeva E', currentStatus: 'readyRent', location: { area: 'Yelahanka', lat: 13.10, lng: 77.59 }, statusChangedAt: '2026-03-04T06:00:00', station: 'Yelahanka Hub', allChecksPassed: true, lastServiceKm: 300 },
    { id: 'SC-032', regNumber: 'KA02AB1009', model: 'Zelio Eeva E', currentStatus: 'readyRent', location: { area: 'Yelahanka', lat: 13.10, lng: 77.60 }, statusChangedAt: '2026-03-04T06:30:00', station: 'Yelahanka Hub', allChecksPassed: true, lastServiceKm: 170 },
    { id: 'SC-033', regNumber: 'KA02AB1010', model: 'Zelio Eeva E', currentStatus: 'readyRent', location: { area: 'Yelahanka', lat: 13.11, lng: 77.59 }, statusChangedAt: '2026-03-04T06:30:00', station: 'Yelahanka Hub', allChecksPassed: true, lastServiceKm: 60 },
    { id: 'SC-034', regNumber: 'KA02WF2001', model: 'Zelio Eeva E', currentStatus: 'readyRent', location: { area: 'Whitefield', lat: 12.97, lng: 77.75 }, statusChangedAt: '2026-03-04T06:00:00', station: 'Whitefield Hub', allChecksPassed: true, lastServiceKm: 140 },
    { id: 'SC-035', regNumber: 'KA02WF2002', model: 'Zelio Eeva E', currentStatus: 'readyRent', location: { area: 'Whitefield', lat: 12.97, lng: 77.74 }, statusChangedAt: '2026-03-04T06:00:00', station: 'Whitefield Hub', allChecksPassed: true, lastServiceKm: 210 },
    { id: 'SC-036', regNumber: 'KA02WF2003', model: 'Zelio Eeva E', currentStatus: 'readyRent', location: { area: 'Whitefield', lat: 12.96, lng: 77.75 }, statusChangedAt: '2026-03-04T05:45:00', station: 'Whitefield Hub', allChecksPassed: true, lastServiceKm: 190 },
    { id: 'SC-037', regNumber: 'KA02WF2004', model: 'Zelio Eeva E', currentStatus: 'readyRent', location: { area: 'Whitefield', lat: 12.97, lng: 77.76 }, statusChangedAt: '2026-03-04T05:45:00', station: 'Whitefield Hub', allChecksPassed: true, lastServiceKm: 80 },
    { id: 'SC-038', regNumber: 'KA02WF2005', model: 'Zelio Eeva E', currentStatus: 'readyRent', location: { area: 'Whitefield', lat: 12.98, lng: 77.75 }, statusChangedAt: '2026-03-04T06:15:00', station: 'Whitefield Hub', allChecksPassed: true, lastServiceKm: 160 },
    { id: 'SC-039', regNumber: 'KA02WF2006', model: 'Zelio Eeva E', currentStatus: 'readyRent', location: { area: 'Whitefield', lat: 12.97, lng: 77.74 }, statusChangedAt: '2026-03-04T06:15:00', station: 'Whitefield Hub', allChecksPassed: true, lastServiceKm: 230 },
    { id: 'SC-040', regNumber: 'KA02WF2007', model: 'Zelio Eeva E', currentStatus: 'readyRent', location: { area: 'Whitefield', lat: 12.96, lng: 77.76 }, statusChangedAt: '2026-03-04T06:30:00', station: 'Whitefield Hub', allChecksPassed: true, lastServiceKm: 100 },
    { id: 'SC-041', regNumber: 'KA02WF2008', model: 'Zelio Eeva E', currentStatus: 'readyRent', location: { area: 'Whitefield', lat: 12.97, lng: 77.75 }, statusChangedAt: '2026-03-04T06:30:00', station: 'Whitefield Hub', allChecksPassed: true, lastServiceKm: 280 },

    // ═══ READY FOR BOOKING (6 scooters) ═══
    { id: 'SC-042', regNumber: 'KA03BK3001', model: 'Zelio Eeva E', currentStatus: 'readyRent', location: { area: 'Yelahanka', lat: 13.10, lng: 77.59 }, statusChangedAt: '2026-03-04T10:00:00', booking: { bookingId: 'BK-2026-0341', customerName: 'Arjun Mehta', pickupDate: '2026-03-05', pickupTime: '09:00 AM' }, lastServiceKm: 130 },
    { id: 'SC-043', regNumber: 'KA03BK3002', model: 'Zelio Eeva E', currentStatus: 'readyRent', location: { area: 'Whitefield', lat: 12.97, lng: 77.75 }, statusChangedAt: '2026-03-04T10:00:00', booking: { bookingId: 'BK-2026-0342', customerName: 'Simran Kaur', pickupDate: '2026-03-05', pickupTime: '10:00 AM' }, lastServiceKm: 175 },
    { id: 'SC-044', regNumber: 'KA03BK3003', model: 'Zelio Eeva E', currentStatus: 'readyRent', location: { area: 'Koramangala', lat: 12.94, lng: 77.62 }, statusChangedAt: '2026-03-04T09:30:00', booking: { bookingId: 'BK-2026-0343', customerName: 'Vishal Rao', pickupDate: '2026-03-05', pickupTime: '08:30 AM' }, lastServiceKm: 95 },
    { id: 'SC-045', regNumber: 'KA03BK3004', model: 'Zelio Eeva E', currentStatus: 'readyRent', location: { area: 'Indiranagar', lat: 12.98, lng: 77.64 }, statusChangedAt: '2026-03-04T09:30:00', booking: { bookingId: 'BK-2026-0344', customerName: 'Nandini S', pickupDate: '2026-03-05', pickupTime: '11:00 AM' }, lastServiceKm: 210 },
    { id: 'SC-046', regNumber: 'KA03BK3005', model: 'Zelio Eeva E', currentStatus: 'readyRent', location: { area: 'HSR Layout', lat: 12.91, lng: 77.65 }, statusChangedAt: '2026-03-04T10:15:00', booking: { bookingId: 'BK-2026-0345', customerName: 'Gaurav P', pickupDate: '2026-03-05', pickupTime: '09:30 AM' }, lastServiceKm: 145 },
    { id: 'SC-047', regNumber: 'KA03BK3006', model: 'Zelio Eeva E', currentStatus: 'readyRent', location: { area: 'Hebbal', lat: 13.04, lng: 77.60 }, statusChangedAt: '2026-03-04T10:15:00', booking: { bookingId: 'BK-2026-0346', customerName: 'Pallavi J', pickupDate: '2026-03-05', pickupTime: '10:30 AM' }, lastServiceKm: 260 },

    // ═══ IN SERVICE (3 scooters) ═══
    { id: 'SC-048', regNumber: 'KA04SV4001', model: 'Zelio Eeva E', currentStatus: 'inService', location: { area: 'Yelahanka', lat: 13.10, lng: 77.59 }, statusChangedAt: '2026-03-04T08:00:00', service: { failedChecks: ['Front Brake Drum', 'Brake Wire'], etaHours: 2, partsNeeded: [{ name: 'Front Brake Drum', price: 490 }, { name: 'Front Brake Wire', price: 160 }], assignedTech: 'Ravi K' }, lastServiceKm: 520 },
    { id: 'SC-049', regNumber: 'KA04SV4002', model: 'Zelio Eeva E', currentStatus: 'inService', location: { area: 'Whitefield', lat: 12.97, lng: 77.75 }, statusChangedAt: '2026-03-04T07:30:00', service: { failedChecks: ['Controller Unit'], etaHours: 4, partsNeeded: [{ name: 'Controller Unit', price: 2475 }], assignedTech: 'Sunil M' }, lastServiceKm: 490 },
    { id: 'SC-050', regNumber: 'KA04SV4003', model: 'Zelio Eeva E', currentStatus: 'inService', location: { area: 'Yelahanka', lat: 13.11, lng: 77.60 }, statusChangedAt: '2026-03-04T09:00:00', service: { failedChecks: ['Wash', 'Sanitization'], etaHours: 1, partsNeeded: [], assignedTech: 'Mohan D' }, lastServiceKm: 350 },
];

export const FLEET_ALERTS: FleetAlert[] = [
    { id: 'ALT-001', type: 'return', message: 'KA01AB1234 returned — 2min brake check needed', timestamp: '2026-03-04T13:45:00', scooterId: 'SC-001', priority: 'high' },
    { id: 'ALT-002', type: 'service', message: '3 scooters hit 500km — schedule service', timestamp: '2026-03-04T13:30:00', priority: 'medium' },
    { id: 'ALT-003', type: 'revenue', message: '+₹450 revenue from KA01CD5678 return', timestamp: '2026-03-04T13:15:00', scooterId: 'SC-002', priority: 'low' },
    { id: 'ALT-004', type: 'booking', message: 'Arjun Mehta confirmed pickup for tomorrow 9AM', timestamp: '2026-03-04T12:00:00', scooterId: 'SC-042', priority: 'medium' },
    { id: 'ALT-005', type: 'service', message: 'KA04SV4002 controller replacement — ETA 4hrs', timestamp: '2026-03-04T11:30:00', scooterId: 'SC-049', priority: 'high' },
];

// Revenue constants
export const REVENUE_CONFIG = {
    hourlyRate: 150,
    dailyTarget: 25000,
    currentDayRevenue: 21750, // 87% of target
};
