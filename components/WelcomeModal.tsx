import React, { useEffect } from 'react';
import { XIcon, GiftIcon } from './icons/Icons';

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBookNow: () => void;
}

const WelcomeModal: React.FC<WelcomeModalProps> = ({ isOpen, onClose, onBookNow }) => {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.addEventListener('keydown', handleEsc);
    }

    return () => {
      document.body.style.overflow = 'auto';
      document.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 z-[70] flex items-center justify-center p-4 transition-opacity duration-300"
      aria-modal="true"
      role="dialog"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-lg w-full max-w-md text-center p-8 transform transition-all duration-300 scale-95 opacity-0 animate-fade-in-scale"
        onClick={(e) => e.stopPropagation()}
        style={{ animationFillMode: 'forwards' }}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
          aria-label="Close"
        >
          <XIcon className="w-6 h-6" />
        </button>

        <div className="flex justify-center items-center h-16 w-16 mx-auto bg-primary/10 rounded-full mb-4">
          <GiftIcon className="w-8 h-8 text-primary" />
        </div>

        <h2 className="text-2xl font-heading font-extrabold uppercase tracking-widest text-primary">
          Welcome to RoAd RoBo’s!
        </h2>
        <p className="mt-2 text-gray-600">
          As a token of our appreciation, here's a little something for your first ride with us.
        </p>

        <div className="my-6">
          <p className="text-sm text-gray-500">Enjoy 10% off your first booking with code:</p>
          <div className="mt-2 inline-block bg-accent border-2 border-dashed border-secondary text-secondary font-mono text-lg font-bold px-4 py-2 rounded-lg">
            WELCOME10
          </div>
        </div>

        <button
          onClick={onBookNow}
          className="w-full bg-secondary text-white font-bold py-3 px-6 rounded-lg hover:bg-opacity-90 transition-all"
        >
          Book Your Ride
        </button>
        
        <style>{`
          @keyframes fade-in-scale {
            from {
              transform: scale(0.95);
              opacity: 0;
            }
            to {
              transform: scale(1);
              opacity: 1;
            }
          }
          .animate-fade-in-scale {
            animation: fade-in-scale 0.3s ease-out;
          }
        `}</style>
      </div>
    </div>
  );
};

export default WelcomeModal;