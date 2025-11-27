import React, { useRef } from 'react';
import { DocumentDownloadIcon } from './icons/Icons';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const sections = [
    { id: 'defined-terms', title: 'Defined Terms' },
    { id: 'eligibility', title: 'Eligibility & Documentation' },
    { id: 'vehicle-use', title: 'Vehicle Use and Maintenance' },
    { id: 'rental-fees', title: 'Rental Period, Fees, and Charges' },
    { id: 'prohibited-uses', title: 'Prohibited Uses' },
    { id: 'liability', title: 'Liability' },
    { id: 'termination', title: 'Termination' },
    { id: 'extension', title: 'Rental Period Extension' },
    { id: 'miscellaneous', title: 'Miscellaneous' },
];

const TableOfContents: React.FC<{ onDownload: () => void }> = ({ onDownload }) => (
    <div className="sticky top-24">
        <h3 className="text-base font-heading font-extrabold uppercase tracking-widest text-primary mb-4">Table of Contents</h3>
        <ul className="space-y-2">
            {sections.map(section => (
                <li key={section.id}>
                    <a href={`#${section.id}`} className="text-primary hover:underline text-sm">{section.title}</a>
                </li>
            ))}
        </ul>
        <button onClick={onDownload} className="mt-6 inline-flex items-center gap-2 border border-primary text-primary font-semibold py-2 px-4 rounded-lg hover:bg-primary/5 transition text-sm">
            <DocumentDownloadIcon className="h-5 w-5"/>
            Download PDF
        </button>
    </div>
);

const TermsPage: React.FC = () => {
    const contentRef = useRef<HTMLElement>(null);

    const handleDownloadPDF = () => {
        const input = contentRef.current;
        if (input) {
            // Temporarily hide the Table of Contents for a cleaner PDF
            const toc = input.parentElement?.querySelector('aside');
            if (toc) toc.style.display = 'none';

            html2canvas(input, {
                scale: 2, // Higher scale for better resolution
                useCORS: true,
            }).then((canvas) => {
                const imgData = canvas.toDataURL('image/png');
                const pdf = new jsPDF('p', 'mm', 'a4');
                const imgProps = pdf.getImageProperties(imgData);
                const pdfWidth = pdf.internal.pageSize.getWidth();
                const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

                pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
                pdf.save('RoAd_RoBos_Terms_and_Conditions.pdf');

                // Restore the Table of Contents visibility
                if (toc) toc.style.display = 'block';
            }).catch(error => {
                console.error('Error generating PDF:', error);
                alert('Could not generate PDF. Please try again.');
                // Ensure TOC is restored even on error
                if (toc) toc.style.display = 'block';
            });
        }
    };

    return (
        <div className="bg-white py-12 md:py-20">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h1 className="text-3xl md:text-4xl font-heading font-extrabold uppercase tracking-widest text-primary">Terms & Conditions</h1>
                    <p className="mt-3 text-lg text-gray-600">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                </div>

                <div className="flex flex-col md:flex-row gap-8 lg:gap-12">
                    {/* Table of Contents (Desktop) */}
                    <aside className="hidden md:block w-full md:w-1/4">
                        <TableOfContents onDownload={handleDownloadPDF} />
                    </aside>

                    {/* Terms Content */}
                    <main ref={contentRef} className="w-full md:w-3/4 prose prose-lg max-w-none text-gray-700 leading-relaxed">
                        <section id="defined-terms">
                            <h2 className="text-xl font-heading font-extrabold uppercase tracking-widest text-primary">1. Defined Terms:</h2>
                            <p><strong>1.1. "SEBCHRIS MOBILITY PVT LTD"</strong> (hereinafter referred as the Company). The registered address of the Company is 13 & 14, Horamavu Agara Village, Kalyan Nagar, Babusapalya, Bengaluru -560043.</p>
                            <p><strong>1.2. "User"</strong> shall mean an individual or entity that has accepted the terms and conditions for leasing or renting a Vehicle from the Company.</p>
                            <p><strong>1.3. "Agreement"</strong> means the Service Agreement between the Company and the User.</p>
                            <p><strong>1.4. "Vehicle"</strong> shall mean any motorcycle, motorbike, or scooter (including, but not limited to, petrol or electric models) provided by the Company to a User for leasing or renting pursuant to the terms of this Agreement, for a duration determined between the Company and the User.</p>
                            <p><strong>1.5. "Conditions"</strong> means the General Conditions of Use governing the hiring, leasing, or renting of Vehicles, as amended or modified by the Company from time to time, and includes all applicable terms and conditions.</p>
                            <p><strong>1.6.</strong> These Conditions constitute a legally binding Agreement between the User and the Company, governed by and construed in accordance with the laws of India. The Company reserves the right to modify or update these Conditions at any time. No User is entitled to accept only part of the Conditions. In the event that any User fails to comply with any of the Conditions, the Company reserves the right, as its own discretion, to suspend or withdraw all Services to that User without any notice.</p>
                            <p><strong>1.7.</strong> In this Agreement, the Company and the User shall be collectively referred to as the "Parties" and individually as a "Party".</p>
                        </section>

                        <section id="eligibility">
                            <h2 className="text-xl font-heading font-extrabold uppercase tracking-widest text-primary mt-8">2. Eligibility & Documentation:</h2>
                            <p><strong>2.1. Age:</strong> The User must be 18 years old or older to hire a Vehicle.</p>
                            <p><strong>2.2. Valid Driving Licence:</strong> The User must possess a valid driving licence issued by the relevant authorities in India, which is applicable for the class of vehicle being hired.</p>
                            <p><strong>2.3. Submission of Original Documents:</strong> The User shall submit original documents, including but not limited to, a driving licence, identity proof, and address proof, as required by the Company.</p>
                            <p><strong>2.4. Acceptance of Use Data:</strong> The User consents to the Company collecting and using the User's personal data.</p>
                        </section>

                        <section id="vehicle-use">
                            <h2 className="text-xl font-heading font-extrabold uppercase tracking-widest text-primary mt-8">3. Vehicle Use and Maintenance:</h2>
                            <p><strong>3.1. Authorised Vehicle Use:</strong> The User is authorized to use only the Vehicle booked in their name and shall not use a Vehicle booked under another User's account, and shall not permit any other person to use the Vehicle under their account.</p>
                            <p><strong>3.2. Vehicle Condition Check:</strong> The User confirms having thoroughly inspected the vehicle and being satisfied with its condition, including but not limited to brakes, tires, and other safety features, before entering into this Agreement and commencing the rental.</p>
                            <p><strong>3.2. No Passengers or Loads:</strong> The User is not allowed to carry any load or any passenger in the Vehicle.</p>
                            <p><strong>3.3. Designated Areas:</strong> The User shall only use the Vehicle in designated areas specified by the Company and shall not take the Vehicle beyond the designated areas or into prohibited areas.</p>
                            <p><strong>3.4. Safety and Responsibility:</strong> The Company shall not be responsible for the safety of the User. The User is solely responsible for their own safety, the scooter, and others. The User is required to wear a helmet and other safety gear as mandated by law while riding the scooter.</p>
                            <p><strong>3.5. Maintenance:</strong> The User agrees to maintain the scooter in good condition throughout the Rental Period. The User shall:</p>
                            <ul>
                                <li>Keep the scooter in a clean and tidy state</li>
                                <li>Report any issues, damages, or malfunctions to the Company promptly</li>
                                <li>Return the scooter at the end of the Rental Period in the same condition as when rented, subject to reasonable wear and tear as determined solely by the Company.</li>
                            </ul>
                            <p>The User acknowledges and agrees that the Company's determination regarding reasonable wear and tear shall be final and binding.</p>
                            <p><strong>3.6. Return of Vehicle:</strong> The User agrees to return the Vehicle to our designated location on time and in the same condition as when rented, subject to reasonable wear and tear as determined solely by the Company.</p>
                        </section>

                        <section id="rental-fees">
                            <h2 className="text-xl font-heading font-extrabold uppercase tracking-widest text-primary mt-8">4. Rental Period, Fees, and Charges:</h2>
                            <p><strong>4.1. Rental Period:</strong> The Rental Period shall commence on the date specified in this Agreement and shall end upon the Scooter's return to the Company at its designated location, subject to the following conditions:</p>
                            <ul>
                                <li>The Scooter is returned in the same condition, allowing for reasonable wear and tear as determined solely by the Company.</li>
                            </ul>
                            <p>However, in the following circumstances, the Rental Period will not be deemed to have ended until full settlement is made:</p>
                            <ul>
                                <li>If the Scooter is returned in a condition exceeding reasonable wear and tear, the User must settle damages as determined by the Company.</li>
                                <li>If the Scooter is not returned, the User must settle losses incurred by the Company, including but not limited to the Scooter's value, as determined by the Company.</li>
                            </ul>
                            <p>Upon full settlement of damages or losses, the Rental Period shall be deemed to have ended.</p>
                            <p><strong>4.2. Rental Fees:</strong> The User agrees to pay the rental fees as specified by the company, which includes the rental charges, taxes, and any additional fees.</p>
                            <p><strong>4.3. Late Return:</strong> Failure to return the Scooter by the scheduled return time will result in the User incurring additional fees. The amount of such fees will be fixed by the Company.</p>
                            <p><strong>4.4. Improper Parking and Traffic Violations:</strong> The User shall park the Scooter and operate it in accordance with applicable laws and regulations. The User shall be responsible for any fines, penalties, or charges resulting from improper parking, traffic violations, or other regulatory infractions.</p>
                            <p><strong>4.5. Damage, Loss, or Theft:</strong> In the event of damage or loss to the Scooter during the Rental Period, the User shall be liable for the full cost of repair or replacement, which may be equal to the full value of the vehicle. The Company reserves the right to charge the User an amount up to the full value of the Scooter in case of damage or loss.</p>
                            <p><strong>4.6. Security Deposit:</strong> A Security Deposit is required at the time of Vehicle rental. The Security Deposit will be refunded in accordance with the following conditions:</p>
                            <p><strong>4.6.1. Conditions for Security Deposit Refund:</strong></p>
                            <ul>
                                <li>50% of the Security Deposit will be refunded if the Vehicle is returned on time and in the same condition as when rented, subject to reasonable wear and tear as determined solely by the Company.</li>
                                <li>All rental fees, taxes, and additional charges are paid in full.</li>
                                <li>No damages or losses are reported.</li>
                            </ul>
                            <p><strong>4.7. Non-Refundable Payments:</strong> All payments made by the User, except for the Security Deposit, are non-refundable, regardless of circumstances. The Security Deposit will be refunded in accordance with the Company's refund procedure as per Clause 4.8, subject to the terms and conditions thereof.</p>
                            <p><strong>4.8. Refund Procedure:</strong></p>
                            <p><strong>4.8.1. Refund Timeline:</strong> After fulfilling the Conditions for Security Deposit Refund (Clause 4.6.1), 50% of the Security Deposit will be refunded within 2-3 working days. The refund will be processed through the same payment method used for the rental.</p>
                            <p><strong>4.8.2. Deduction from Security Deposit:</strong> If the Conditions for Security Deposit Refund (Clause 4.6.1) are not fulfilled, and the Vehicle is damaged, lost, or not returned on time, the Security Deposit will be used to cover the costs of repairs, replacement, losses, theft, late return or late fees.</p>
                            <p><strong>4.8.3. Refund of Remaining Balance:</strong> Any remaining balance of the Security Deposit will be refunded after deducting the costs of repairs, replacement, losses, theft, late return or late fees.</p>
                            <p><strong>4.8.4. Payment for Excess Amounts:</strong> If the Security Deposit is not sufficient to cover the costs of repairs, replacement, losses, theft, late return or late fees, the User will be liable for the remaining amount and agrees to pay it promptly within 7 days from the Company's notification.</p>
                            <p><strong>4.8.5. Penalty for Refusal of Payment:</strong> If the User / bike rider refuses the payment after the due date, a penalty of ₹150/- per day will be added. This is a rider's responsibility.</p>
                        </section>

                        <section id="prohibited-uses">
                            <h2 className="text-xl font-heading font-extrabold uppercase tracking-widest text-primary mt-8">5. Prohibited Uses:</h2>
                            <p>The use of the Vehicle provided by the Company is prohibited under the following conditions: The User shall NOT:</p>
                            <ul>
                                <li><strong>Use the scooter for racing or reckless driving.</strong></li>
                                <li><strong>Drive the scooter off-road.</strong></li>
                                <li><strong>Use the scooter for carrying passengers or goods for hire.</strong></li>
                                <li><strong>Transport hazardous materials.</strong></li>
                                <li><strong>Operate the scooter under the influence of alcohol, drugs, or medicine.</strong></li>
                                <li><strong>Engage in any criminal or illegal activities.</strong></li>
                                <li><strong>Use the scooter in an imprudent, negligent, or abusive manner.</strong></li>
                                <li><strong>Use the scooter for abnormal or unauthorized purposes.</strong></li>
                                <li><strong>Use a mobile phone or any other electronic device while operating the scooter.</strong></li>
                                <li><strong>Transport flammable, poisonous, or other hazardous substances.</strong></li>
                                <li><strong>Carry objects that may cause damage to the vehicle.</strong></li>
                                <li><strong>Use the scooter in any manner deemed unreasonable, inappropriate, or unsafe.</strong></li>
                            </ul>
                            <p>The User acknowledges that the Vehicle will not be used for the above prohibited purposes.</p>
                        </section>

                        <section id="liability">
                            <h2 className="text-xl font-heading font-extrabold uppercase tracking-widest text-primary mt-8">6. Liability:</h2>
                            <p><strong>6.1. User Responsibility:</strong> The Company is not liable for any injuries, damages, losses, death, or reimbursement claims arising from the User's use of the Vehicle. The User is solely responsible for any such incidents.</p>
                            <p><strong>6.2. Reporting Incidents:</strong> In the event of theft, accident, or other incidents involving the Vehicle, the User must:</p>
                            <ul>
                                <li>Immediately report the incident to the Company and the nearest police station.</li>
                                <li>Provide a detailed written complaint based on actual facts.</li>
                                <li>Cooperate fully with the Company to fulfill necessary formalities.</li>
                            </ul>
                            <p><strong>6.3. Notification of Legal Proceedings:</strong> The User agrees to:</p>
                            <ul>
                                <li>Immediately notify the Company of any summons, complaint, document, or notice related to an accident, theft, or other circumstances involving the Vehicle.</li>
                                <li>Deliver such documents to the Company promptly.</li>
                            </ul>
                        </section>

                        <section id="termination">
                            <h2 className="text-xl font-heading font-extrabold uppercase tracking-widest text-primary mt-8">7. Termination:</h2>
                            <p>The Company reserves the right to terminate this Agreement immediately if the User breaches any terms or conditions outlined herein. The User acknowledges and agrees that the User does not have the right to terminate this Agreement.</p>
                        </section>

                        <section id="extension">
                            <h2 className="text-xl font-heading font-extrabold uppercase tracking-widest text-primary mt-8">8. Rental Period Extension:</h2>
                            <p>The User may request an extension of the Rental Period by notifying the Company in writing or through the designated platform, subject to the Company's approval.</p>
                            <p>Any extension of the Rental Period shall be subject to the following terms and conditions:</p>
                            <ul>
                                <li><strong>Approval:</strong> The Company reserves the right to approve or reject requests for extension based on its discretion and availability of the Scooter.</li>
                                <li><strong>Additional Charges:</strong> The User shall pay additional rental charges for the extended period, as determined by the Company.</li>
                                <li><strong>Prior Intimation:</strong> The User must intimate the Company at least 24 hours prior to the end of the original Rental Period to request an extension. Failure to do so will result in late return fees being applicable immediately.</li>
                            </ul>
                            <p>The User shall pay the additional rental charges for the extension duration, as determined by the Company, at the time of requesting the extension. Payment for the extended period shall be made upfront and shall be non-refundable.</p>
                            <p>The terms and conditions of this Agreement, including but not limited to liability, insurance, and maintenance, shall apply to the extended Rental Period.</p>
                        </section>

                        <section id="miscellaneous">
                            <h2 className="text-xl font-heading font-extrabold uppercase tracking-widest text-primary mt-8">9. Miscellaneous:</h2>
                            <p><strong>9.1</strong> This Agreement constitutes the entire understanding between the Parties and supersedes all prior agreements, whether oral or written.</p>
                            <p><strong>9.2</strong> This Agreement shall be governed by and construed in accordance with the laws of India. Any disputes arising out of this Agreement shall be subject to the exclusive jurisdiction of the courts of Bangalore.</p>
                            <p><strong>9.3</strong> If any provision of this Agreement is found to be invalid or unenforceable, the remainder of the Agreement shall remain in full force and effect.</p>
                            <p>By renting a scooter from the Company, the User acknowledges that the User has read, understood, and agreed to be bound by these Terms and Conditions.</p>
                        </section>

                    </main>
                </div>
            </div>
        </div>
    );
};

export default TermsPage;