import React, { useState, useMemo } from 'react';
import { faqData } from '../constants';
import { type FAQItem } from '../types';
import { ChevronDownIcon, SearchIcon } from './icons/Icons';

const FAQItemComponent: React.FC<{ item: FAQItem, isOpen: boolean, onClick: () => void }> = ({ item, isOpen, onClick }) => {
    return (
        <div className="border-b">
            <button
                onClick={onClick}
                className="w-full flex justify-between items-center text-left py-5"
                aria-expanded={isOpen}
            >
                <span className="text-lg font-medium text-primary">{item.question}</span>
                <ChevronDownIcon className={`h-6 w-6 text-primary transition-transform duration-300 ${isOpen ? 'transform rotate-180' : ''}`} />
            </button>
            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96' : 'max-h-0'}`}>
                 <div className="pb-5 pr-10 text-gray-600">
                    {item.answer}
                </div>
            </div>
        </div>
    );
};

const FAQPage: React.FC = () => {
    const [openIndex, setOpenIndex] = useState<number | null>(0);
    const [searchTerm, setSearchTerm] = useState('');

    const handleClick = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };
    
    const filteredFaqs = useMemo(() => {
        if (!searchTerm) return faqData;
        return faqData.filter(item =>
            item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.answer.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [searchTerm]);

    return (
        <section className="py-20 bg-white">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
                <div className="text-center mb-12">
                    <h1 className="text-3xl md:text-4xl font-heading font-extrabold uppercase tracking-widest text-primary">Frequently Asked Questions</h1>
                    <p className="mt-3 text-lg text-gray-600">Find answers to your questions about booking, documents, pricing, and more.</p>
                </div>
                
                <div className="relative mb-10">
                  <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Search questions (e.g., 'deposit')"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition"
                    aria-label="Search FAQs"
                  />
                </div>

                <div>
                    {filteredFaqs.length > 0 ? (
                        filteredFaqs.map((item, index) => (
                            <FAQItemComponent
                                key={index}
                                item={item}
                                isOpen={openIndex === index}
                                onClick={() => handleClick(index)}
                            />
                        ))
                    ) : (
                        <div className="text-center py-10 text-gray-500">
                            <p>No questions found matching your search.</p>
                        </div>
                    )}
                </div>
                
                <div className="mt-16 text-center bg-accent p-8 rounded-lg">
                    <h3 className="text-xl font-heading font-extrabold uppercase tracking-widest text-primary">Still have a question?</h3>
                    <p className="mt-2 text-gray-600">Our support team is here to help you 24/7. Don't hesitate to reach out.</p>
                    <a href="#" className="mt-4 inline-block bg-primary text-white font-semibold px-6 py-3 rounded-lg hover:bg-opacity-90 transition-all">
                        Contact Support
                    </a>
                </div>
            </div>
        </section>
    );
};

export default FAQPage;