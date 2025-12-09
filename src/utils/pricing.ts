import { Bike } from '../../types';

interface PricingParams {
    bike: Bike;
    pickupDate: string;
    pickupTime: string;
    dropDate: string;
    dropTime: string;
    addons: {
        helmet: boolean;
        insurance: boolean;
    };
    paymentMode: 'CASH' | 'ONLINE';
}

interface FareBreakdown {
    baseFare: number;
    addonsCost: number;
    platformFee: number;  // 2% for all bookings
    totalPayable: number;
    durationText: string;
}

export const calculateFare = ({
    bike,
    pickupDate,
    pickupTime,
    dropDate,
    dropTime,
    addons,
    paymentMode
}: PricingParams): FareBreakdown => {
    if (!pickupDate || !pickupTime || !dropDate || !dropTime) {
        return {
            baseFare: 0,
            addonsCost: 0,
            platformFee: 0,
            totalPayable: 0,
            durationText: '0 days'
        };
    }

    const start = new Date(`${pickupDate}T${pickupTime}`);
    const end = new Date(`${dropDate}T${dropTime}`);

    if (end <= start) {
        return {
            baseFare: 0,
            addonsCost: 0,
            platformFee: 0,
            totalPayable: 0,
            durationText: '0 days'
        };
    }

    const totalHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    let remainingHours = totalHours;
    let baseFare = 0;

    // Yearly
    if (bike.price.yearly) {
        const years = Math.floor(remainingHours / (365 * 24));
        baseFare += years * bike.price.yearly;
        remainingHours %= (365 * 24);
    }

    // Quarterly
    if (bike.price.quarterly) {
        const quarters = Math.floor(remainingHours / (90 * 24));
        baseFare += quarters * bike.price.quarterly;
        remainingHours %= (90 * 24);
    }

    // Monthly
    const months = Math.floor(remainingHours / (30 * 24));
    baseFare += months * bike.price.month;
    remainingHours %= (30 * 24);

    // Weekly
    const weeks = Math.floor(remainingHours / (7 * 24));
    baseFare += weeks * bike.price.week;
    remainingHours %= (7 * 24);

    // Daily
    const days = Math.floor(remainingHours / 24);
    baseFare += days * bike.price.day;
    remainingHours %= 24;

    // Hourly
    baseFare += Math.ceil(remainingHours) * bike.price.hour;

    // Addons
    let addonsCost = 0;
    if (addons.helmet) addonsCost += 50;
    if (addons.insurance) addonsCost += 100;

    // Platform Fee: Always 2% for all bookings
    const platformFee = Number(((baseFare + addonsCost) * 0.02).toFixed(2));

    const totalPayable = baseFare + addonsCost + platformFee;
    const totalDays = (totalHours / 24).toFixed(1);

    return {
        baseFare: Number(baseFare.toFixed(2)),
        addonsCost: Number(addonsCost.toFixed(2)),
        platformFee,
        totalPayable: Number(totalPayable.toFixed(2)),
        durationText: `${totalDays} days`
    };
};
