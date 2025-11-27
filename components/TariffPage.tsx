import React from 'react';
import PricingSection from './PricingSection';
import { type Bike } from '../types';

interface TariffPageProps {
    city: string;
    onSelectBike: (bike: Bike) => void;
    bikes: Bike[];
}

const TariffPage: React.FC<TariffPageProps> = ({ city, onSelectBike, bikes }) => {
    return (
        <div>
            {/* The PricingSection component contains all the required elements for the tariff page. */}
            <PricingSection city={city} onSelectBike={onSelectBike} bikes={bikes} />
        </div>
    );
};

export default TariffPage;
