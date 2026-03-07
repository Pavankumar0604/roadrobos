import React from 'react';
import { CheckCircleIcon } from '../icons/Icons';

interface Step {
    id: number;
    label: string;
    description: string;
}

const steps: Step[] = [
    { id: 1, label: 'New Appointment', description: 'Customer booked bike service' },
    { id: 2, label: 'FI Manager Assigns', description: 'Technician queue assignment' },
    { id: 3, label: 'In Progress', description: 'Technician working in real-time' },
    { id: 4, label: 'Service Completed', description: 'Quality check & ready for pickup' },
    { id: 5, label: 'Customer Notified', description: 'Payment & pickup confirmation' },
];

interface ServiceFlowTimelineProps {
    currentStep: number; // 1 to 5
}

const ServiceFlowTimeline: React.FC<ServiceFlowTimelineProps> = ({ currentStep }) => {
    return (
        <div className="py-8 w-full">
            <div className="flex items-center justify-between mb-2">
                <h3 className="text-xl font-black text-text-body tracking-tight uppercase italic">Service Life Cycle</h3>
                <span className="px-3 py-1 bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-widest rounded-md">Real-time Flow</span>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-input/30 shadow-sm overflow-hidden content-center">
                {/* Desktop Horizontal View */}
                <div className="hidden md:flex items-start justify-between relative">
                    {/* Background Line */}
                    <div className="absolute top-[1.4rem] left-0 w-full h-1 bg-gray-100 -z-0" />
                    <div
                        className="absolute top-[1.4rem] left-0 h-1 bg-primary transition-all duration-700 -z-0"
                        style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
                    />

                    {steps.map((step) => {
                        const isCompleted = step.id < currentStep;
                        const isCurrent = step.id === currentStep;
                        const isFuture = step.id > currentStep;

                        return (
                            <div key={step.id} className="relative z-10 flex flex-col items-center flex-1">
                                <div
                                    className={`w-12 h-12 rounded-full border-4 flex items-center justify-center transition-all duration-500 mb-3 ${isCompleted ? 'bg-primary border-primary text-white' :
                                            isCurrent ? 'bg-white border-primary text-primary shadow-[0_0_15px_rgba(8,76,62,0.3)] animate-pulse' :
                                                'bg-white border-gray-200 text-gray-400'
                                        }`}
                                >
                                    {isCompleted ? <CheckCircleIcon className="w-6 h-6" /> : <span className="font-black italic">{step.id}</span>}
                                </div>
                                <div className="text-center px-2">
                                    <p className={`text-[11px] font-black uppercase tracking-tight mb-1 ${isCurrent ? 'text-primary' : 'text-text-body'}`}>
                                        {step.label}
                                    </p>
                                    <p className="text-[9px] text-text-muted font-bold leading-tight max-w-[100px] mx-auto uppercase">
                                        {step.description}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Mobile Vertical View */}
                <div className="md:hidden flex flex-col space-y-6 relative">
                    {/* Background Line */}
                    <div className="absolute top-0 left-[23px] w-1 h-full bg-gray-100 -z-0" />
                    <div
                        className="absolute top-0 left-[23px] w-1 bg-primary transition-all duration-700 -z-0"
                        style={{ height: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
                    />

                    {steps.map((step) => {
                        const isCompleted = step.id < currentStep;
                        const isCurrent = step.id === currentStep;

                        return (
                            <div key={step.id} className="relative z-10 flex items-start gap-4">
                                <div
                                    className={`w-12 h-12 rounded-full border-4 flex items-center justify-center shrink-0 transition-all duration-500 ${isCompleted ? 'bg-primary border-primary text-white' :
                                            isCurrent ? 'bg-white border-primary text-primary shadow-[0_0_15px_rgba(8,76,62,0.3)]' :
                                                'bg-white border-gray-200 text-gray-400'
                                        }`}
                                >
                                    {isCompleted ? <CheckCircleIcon className="w-6 h-6" /> : <span className="font-black italic">{step.id}</span>}
                                </div>
                                <div className="pt-1">
                                    <p className={`text-[11px] font-black uppercase tracking-tight mb-0.5 ${isCurrent ? 'text-primary' : 'text-text-body'}`}>
                                        {step.label}
                                    </p>
                                    <p className="text-[9px] text-text-muted font-bold uppercase tracking-wider">
                                        {step.description}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default ServiceFlowTimeline;
