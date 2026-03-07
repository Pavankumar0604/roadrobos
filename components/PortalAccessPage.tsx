import React from 'react';
import { KeyIcon, ShieldCheckIcon, CogIcon } from './icons/Icons';

interface PortalAccessPageProps {
    onGoToAdminLogin: () => void;
    onGoToManagerLogin: () => void;
    onBackToHome: () => void;
}

const PortalAccessPage: React.FC<PortalAccessPageProps> = ({ onGoToAdminLogin, onGoToManagerLogin, onBackToHome }) => {
    return (
        <div className="bg-accent min-h-screen flex items-center justify-center p-4 font-sans relative overflow-hidden">
            {/* Decorative background elements */}
            <div className="absolute top-0 left-0 w-72 h-72 bg-primary/5 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-secondary/5 rounded-full translate-x-1/3 translate-y-1/3 blur-3xl"></div>
            <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-primary/3 rounded-full -translate-x-1/2 -translate-y-1/2 blur-2xl"></div>

            <div className="w-full max-w-5xl relative z-10">
                {/* Header */}
                <div className="text-center mb-10">
                    <h1 onClick={onBackToHome} className="text-5xl font-bold text-primary leading-tight cursor-pointer hover:opacity-80 transition-opacity">
                        RoAd<br />RoBo's
                    </h1>
                    <p className="text-gray-500 mt-2 text-sm font-medium tracking-widest uppercase">Select Your Portal</p>
                </div>

                {/* Portal Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 max-w-4xl mx-auto">
                    {/* Admin Portal Card */}
                    <button
                        onClick={onGoToAdminLogin}
                        className="group relative bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 hover:border-secondary/30 text-left focus:outline-none focus:ring-4 focus:ring-secondary/20"
                    >
                        {/* Top accent bar */}
                        <div className="h-1.5 bg-gradient-to-r from-secondary via-yellow-400 to-secondary"></div>

                        <div className="p-10">
                            {/* Icon */}
                            <div className="w-16 h-16 rounded-2xl bg-secondary/10 flex items-center justify-center mb-6 group-hover:bg-secondary/20 group-hover:scale-110 transition-all duration-300">
                                <KeyIcon className="w-8 h-8 text-secondary" />
                            </div>

                            {/* Content */}
                            <h2 className="text-2xl font-bold text-primary mb-2 group-hover:text-secondary transition-colors">
                                Admin Portal
                            </h2>
                            <p className="text-gray-500 text-sm leading-relaxed mb-8">
                                Full system access. Manage bikes, bookings, analytics, employees, and site content.
                            </p>

                            {/* CTA */}
                            <div className="flex items-center gap-2 text-secondary font-bold text-sm uppercase tracking-wider group-hover:gap-3 transition-all duration-300">
                                <span>Sign In</span>
                                <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                                </svg>
                            </div>
                        </div>

                        {/* Hover glow */}
                        <div className="absolute inset-0 bg-gradient-to-br from-secondary/0 via-secondary/0 to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl"></div>
                    </button>

                    {/* Manager Portal Card */}
                    <button
                        onClick={onGoToManagerLogin}
                        className="group relative bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 hover:border-primary/30 text-left focus:outline-none focus:ring-4 focus:ring-primary/20"
                    >
                        {/* Top accent bar */}
                        <div className="h-1.5 bg-gradient-to-r from-primary via-teal-400 to-primary"></div>

                        <div className="p-10">
                            {/* Icon */}
                            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-300">
                                <ShieldCheckIcon className="w-8 h-8 text-primary" />
                            </div>

                            {/* Content */}
                            <h2 className="text-2xl font-bold text-primary mb-2 group-hover:text-teal-600 transition-colors">
                                Manager Portal
                            </h2>
                            <p className="text-gray-500 text-sm leading-relaxed mb-8">
                                Operations & Technical access. Monitor fleet status, track bookings, and manage service logs.
                            </p>

                            {/* CTA */}
                            <div className="flex items-center gap-2 text-primary font-bold text-sm uppercase tracking-wider group-hover:gap-3 transition-all duration-300">
                                <span>Sign In</span>
                                <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                                </svg>
                            </div>
                        </div>

                        {/* Hover glow */}
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/0 via-primary/0 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl"></div>
                    </button>
                </div>

                {/* Footer */}
                <div className="text-center mt-12 space-y-4">
                    <p className="text-xs text-gray-400 font-medium">
                        For authorized personnel only.{' '}
                        <button onClick={onBackToHome} className="text-primary hover:underline transition-all">
                            Return to site
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default PortalAccessPage;
