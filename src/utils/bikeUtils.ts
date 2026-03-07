import { type Bike } from '../../types';

/**
 * Groups a flat list of bikes (individual fleet units) by their name.
 * This ensures that on public listing pages, riders see one card per model/color
 * with the total aggregate units available.
 */
export const groupBikesByName = (bikes: Bike[]): Bike[] => {
    const groupedMap = new Map<string, Bike>();

    bikes.forEach(bike => {
        const existing = groupedMap.get(bike.name);

        if (existing) {
            // Sum up available units
            existing.availableCount = (existing.availableCount || 0) + (bike.availableCount || 0);
            existing.totalStock = (existing.totalStock || 0) + (bike.totalStock || 0);
            existing.bookedCount = (existing.bookedCount || 0) + (bike.bookedCount || 0);

            // If any bike in the group is 'Available', the aggregate card should be 'Available'
            // Unless the existing one is already 'Available'
            if (bike.availability === 'Available') {
                existing.availability = 'Available';
            } else if (existing.availability !== 'Available' && bike.availability === 'Limited') {
                existing.availability = 'Limited';
            }
        } else {
            // Clone the bike object to avoid mutating the original array
            groupedMap.set(bike.name, { ...bike });
        }
    });

    return Array.from(groupedMap.values());
};
