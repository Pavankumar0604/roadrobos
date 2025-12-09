import React, { useState, useMemo, useEffect } from 'react';
import { ChevronLeftIcon, ChevronRightIcon, XIcon, ChevronDownIcon } from './icons/Icons';

interface DateTimePickerProps {
    isOpen: boolean;
    onClose: () => void;
    onChange: (date: Date) => void;
    value?: Date | null;
    minDate?: Date | null;
    title: string;
}

const DateTimePicker: React.FC<DateTimePickerProps> = ({ isOpen, onClose, onChange, value, minDate, title }) => {
    const initialDate = value || new Date();
    if (minDate && initialDate < minDate) {
        initialDate.setTime(minDate.getTime());
    }

    const [viewingMonth, setViewingMonth] = useState(new Date(initialDate.getFullYear(), initialDate.getMonth(), 1));
    const [selectedDate, setSelectedDate] = useState(initialDate);

    useEffect(() => {
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
      };
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }, [onClose]);

    const daysInMonth = useMemo(() => {
        const date = new Date(Date.UTC(viewingMonth.getFullYear(), viewingMonth.getMonth() + 1, 0));
        return date.getUTCDate();
    }, [viewingMonth]);

    const startDayOfMonth = useMemo(() => {
        const date = new Date(Date.UTC(viewingMonth.getFullYear(), viewingMonth.getMonth(), 1));
        return date.getUTCDay();
    }, [viewingMonth]);

    const calendarGrid = useMemo(() => {
        const grid: (number | null)[] = [];
        for (let i = 0; i < startDayOfMonth; i++) {
            grid.push(null);
        }
        for (let i = 1; i <= daysInMonth; i++) {
            grid.push(i);
        }
        return grid;
    }, [startDayOfMonth, daysInMonth]);

    const handlePrevMonth = () => {
        setViewingMonth(new Date(viewingMonth.getFullYear(), viewingMonth.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setViewingMonth(new Date(viewingMonth.getFullYear(), viewingMonth.getMonth() + 1, 1));
    };

    const handleDayClick = (day: number) => {
        const newDate = new Date(selectedDate);
        newDate.setFullYear(viewingMonth.getFullYear());
        newDate.setMonth(viewingMonth.getMonth());
        newDate.setDate(day);
        setSelectedDate(newDate);
    };

    const handleTimeChange = (type: 'hour' | 'minute', val: number) => {
        const newDate = new Date(selectedDate);
        if (type === 'hour') newDate.setHours(val);
        if (type === 'minute') newDate.setMinutes(val);
        setSelectedDate(newDate);
    };

    const handleDone = () => {
        onChange(selectedDate);
    };
    
    const isDayDisabled = (day: number) => {
        if (!minDate) return false;
        const checkDate = new Date(viewingMonth.getFullYear(), viewingMonth.getMonth(), day);
        // Compare dates only, ignoring time
        const minDateWithoutTime = new Date(minDate);
        minDateWithoutTime.setHours(0,0,0,0);
        
        return checkDate < minDateWithoutTime;
    }

    if (!isOpen) return null;

    const monthName = viewingMonth.toLocaleString('default', { month: 'long' });
    const year = viewingMonth.getFullYear();

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={onClose} role="dialog" aria-modal="true">
            <div className="bg-white rounded-xl shadow-lg w-full max-w-sm" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b flex justify-between items-center">
                    <h2 className="text-lg font-semibold text-primary">{title}</h2>
                    <button onClick={onClose} aria-label="Close date time picker"><XIcon className="w-6 h-6 text-gray-500 hover:text-gray-700" /></button>
                </div>
                <div className="p-4">
                    {/* Calendar */}
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <button onClick={handlePrevMonth} aria-label="Previous month"><ChevronLeftIcon className="w-6 h-6 text-primary" /></button>
                            <span className="font-semibold text-primary">{monthName} {year}</span>
                            <button onClick={handleNextMonth} aria-label="Next month"><ChevronRightIcon className="w-6 h-6 text-primary" /></button>
                        </div>
                        <div className="grid grid-cols-7 text-center text-sm text-gray-500 mb-2">
                            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => <div key={d}>{d}</div>)}
                        </div>
                        <div className="grid grid-cols-7 text-center">
                            {calendarGrid.map((day, index) => {
                                const isSelected = day === selectedDate.getDate() && viewingMonth.getMonth() === selectedDate.getMonth() && viewingMonth.getFullYear() === selectedDate.getFullYear();
                                const isDisabled = day ? isDayDisabled(day) : true;
                                
                                return (
                                    <div key={index} className="py-1">
                                        {day && (
                                            <button
                                                onClick={() => handleDayClick(day)}
                                                disabled={isDisabled}
                                                aria-label={`Select day ${day}`}
                                                className={`w-9 h-9 rounded-full transition-colors
                                                    ${isSelected ? 'bg-primary text-white' : ''}
                                                    ${!isSelected && !isDisabled ? 'hover:bg-gray-200' : ''}
                                                    ${isDisabled ? 'text-gray-300 cursor-not-allowed' : ''}
                                                `}
                                            >
                                                {day}
                                            </button>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                    {/* Time */}
                    <div className="mt-4 pt-4 border-t">
                        <label className="block text-center font-semibold mb-2 text-primary">TIME</label>
                        <div className="flex justify-center items-center gap-2">
                            <div className="relative">
                                <select
                                    value={selectedDate.getHours()}
                                    onChange={(e) => handleTimeChange('hour', parseInt(e.target.value))}
                                    className="bg-gray-700 text-white border-0 rounded-lg p-3 pr-10 appearance-none focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white cursor-pointer"
                                    aria-label="Hour"
                                >
                                    {[...Array(24).keys()].map(h => <option key={h} value={h} className="bg-gray-700 text-white">{h.toString().padStart(2, '0')}</option>)}
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-white">
                                    <ChevronDownIcon className="w-5 h-5" />
                                </div>
                            </div>
                            <span className="text-2xl font-bold text-gray-700">:</span>
                            <div className="relative">
                                <select
                                    value={selectedDate.getMinutes() - (selectedDate.getMinutes() % 15)}
                                    onChange={(e) => handleTimeChange('minute', parseInt(e.target.value))}
                                    className="bg-gray-700 text-white border-0 rounded-lg p-3 pr-10 appearance-none focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white cursor-pointer"
                                    aria-label="Minute"
                                >
                                    {[0, 15, 30, 45].map(m => <option key={m} value={m} className="bg-gray-700 text-white">{m.toString().padStart(2, '0')}</option>)}
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-white">
                                    <ChevronDownIcon className="w-5 h-5" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="p-4 bg-gray-50 rounded-b-xl">
                    <button onClick={handleDone} className="w-full bg-secondary text-white font-bold py-3 rounded-lg hover:bg-opacity-90 transition-all">
                        Done
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DateTimePicker;