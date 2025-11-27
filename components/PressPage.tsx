import React from 'react';
import { DocumentDownloadIcon, MailIcon, PhoneIcon } from './icons/Icons';
import { type PressRelease, type Bike } from '../types';
import { bikes, pressReleases } from '../constants';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface PressPageProps {
    contactEmail: string;
    contactPhone: string;
}

const PressPage: React.FC<PressPageProps> = ({ contactEmail, contactPhone }) => {
    
    const handleDownloadKit = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        
        const doc = new jsPDF();
        const pageHeight = doc.internal.pageSize.height;
        let y = 20;

        // --- Header ---
        doc.setFontSize(22);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(8, 76, 62); // Primary color
        doc.text("RoAd RoBo's Press Kit", doc.internal.pageSize.getWidth() / 2, y, { align: 'center' });
        y += 10;
        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(15, 23, 42); // text-body color
        doc.text("Information for Media Professionals", doc.internal.pageSize.getWidth() / 2, y, { align: 'center' });
        y += 15;

        const addSection = (title: string, body: string | string[]) => {
            if (y > pageHeight - 40) { // check for page break
                doc.addPage();
                y = 20;
            }
            doc.setFontSize(16);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(8, 76, 62);
            doc.text(title, 14, y);
            y += 8;

            doc.setFontSize(11);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(71, 85, 105); // text-muted-color
            
            const textToRender = Array.isArray(body) ? body.join('\n') : body;
            const splitBody = doc.splitTextToSize(textToRender, 180);
            doc.text(splitBody, 14, y);
            y += splitBody.length * 5 + 5;
        }
        
        // --- About Us ---
        addSection("About RoAd RoBo's", "RoAd RoBo’s, operated by SebChris Mobility Pvt Ltd, is revolutionizing urban mobility in India. Our clean-energy electric scooter rental platform is designed for the last-mile logistics sector, empowering the delivery ecosystem with sustainable and reliable solutions. We are committed to driving a greener future by making electric mobility accessible, efficient, and affordable.");

        // --- Fact Sheet Table ---
        if (y > pageHeight - 60) {
            doc.addPage();
            y = 20;
        }
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(8, 76, 62);
        doc.text("Company Fact Sheet", 14, y);
        y += 10;
        autoTable(doc, {
            startY: y,
            head: [['Fact', 'Details']],
            body: [
                ['Founded', '2024'],
                ['Headquarters', 'Bengaluru, India'],
                ['Mission', 'To empower the delivery ecosystem with sustainable, reliable electric mobility solutions.'],
                ['Services', 'B2B Electric Scooter Rentals'],
                ['Key Markets', 'Bengaluru, Chennai, Hyderabad'],
                ['Website', 'www.roadrobos.com (Simulated)'],
            ],
            theme: 'striped',
            headStyles: { fillColor: [8, 76, 62] },
        });
        y = (doc as any).lastAutoTable.finalY + 15;

        // --- Leadership ---
        addSection("Leadership", [
            "Mr. Santhosh Kumar (John Sam), Director: With extensive experience in logistics and technology, Mr. Kumar provides the strategic vision for RoAd RoBo’s, focusing on sustainable growth and technological innovation.",
            "Mrs. Theresa, Director: Mrs. Theresa oversees operations and partner relations, ensuring a seamless experience for our clients and driving the company's commitment to social responsibility."
        ]);
        
        // --- Recent News ---
        if (y > pageHeight - 70) {
            doc.addPage();
            y = 20;
        }
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(8, 76, 62);
        doc.text("Recent News", 14, y);
        y += 10;
        autoTable(doc, {
            startY: y,
            head: [['Date', 'Title']],
            body: pressReleases.map(pr => [
                new Date(pr.date).toLocaleDateString('en-CA'),
                pr.title
            ]),
            theme: 'striped',
            headStyles: { fillColor: [8, 76, 62] },
        });
        y = (doc as any).lastAutoTable.finalY + 15;

        // --- Media Contact ---
        addSection("Media Contact", "For all media inquiries, interviews, or other press-related matters, please contact our communications team.");
        
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(71, 85, 105);
        doc.text(`Email: ${contactEmail}`, 14, y);
        y += 6;
        doc.text(`Phone: ${contactPhone}`, 14, y);

        doc.save('RoAd_RoBos_Press_Kit.pdf');
    };

    return (
        <div className="bg-white">
            {/* Hero */}
            <section className="bg-primary text-white text-center py-20">
                <div className="container mx-auto px-4">
                    <h1 className="text-3xl md:text-4xl font-heading font-extrabold uppercase tracking-widest">Press & Media</h1>
                    <p className="mt-4 text-lg text-gray-200 max-w-3xl mx-auto">Information and resources for journalists, bloggers, and media professionals covering RoAd RoBo’s.</p>
                </div>
            </section>

            <main className="py-16 md:py-20">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
                    {/* About Section */}
                    <section className="text-center">
                        <h2 className="text-2xl md:text-3xl font-heading font-extrabold uppercase tracking-widest text-primary">About RoAd RoBo’s</h2>
                        <p className="mt-4 text-lg text-gray-700 max-w-4xl mx-auto">
                            RoAd RoBo’s, operated by SebChris Mobility Pvt Ltd, is revolutionizing urban mobility in India. Our clean-energy electric scooter rental platform is designed for the last-mile logistics sector, empowering the delivery ecosystem with sustainable and reliable solutions. We are committed to driving a greener future by making electric mobility accessible, efficient, and affordable.
                        </p>
                    </section>

                    {/* Press Kit */}
                    <section className="mt-20">
                        <div className="bg-accent rounded-xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
                            <div className="text-center md:text-left">
                                <h3 className="text-xl font-heading font-extrabold uppercase tracking-widest text-primary">Download Our Press Kit</h3>
                                <p className="mt-2 text-gray-600">Includes official logos, brand guidelines, leadership bios & headshots, and a company fact sheet.</p>
                            </div>
                            <button onClick={handleDownloadKit} className="bg-secondary text-white font-bold py-3 px-8 rounded-lg hover:bg-opacity-90 transition-all flex items-center gap-2 text-lg">
                                <DocumentDownloadIcon className="w-6 h-6" />
                                Download Kit (.zip)
                            </button>
                        </div>
                    </section>
                    
                    {/* Recent Releases */}
                    <section className="mt-20">
                        <h2 className="text-2xl md:text-3xl font-heading font-extrabold uppercase tracking-widest text-primary text-center mb-12">Recent Press Releases</h2>
                        <div className="space-y-6">
                            {pressReleases.map(release => (
                                <div key={release.id} className="bg-white p-6 rounded-lg border border-gray-200/80 shadow-sm hover:shadow-md transition-shadow">
                                    <p className="text-sm text-gray-500">{new Date(release.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                                    <h3 className="text-xl font-bold text-primary mt-1">{release.title}</h3>
                                    <p className="text-gray-600 mt-2">{release.summary}</p>
                                    <a href={release.link} target="_blank" rel="noopener noreferrer" className="text-secondary font-semibold mt-4 inline-block hover:underline">Read More &rarr;</a>
                                </div>
                            ))}
                        </div>
                    </section>
                    
                     {/* Image Gallery */}
                    <section className="mt-20">
                         <h2 className="text-2xl md:text-3xl font-heading font-extrabold uppercase tracking-widest text-primary text-center mb-12">Image Gallery</h2>
                         <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {bikes.slice(0, 6).map(bike => (
                                <div key={bike.id} className="group relative rounded-lg overflow-hidden">
                                    <img src={bike.images[0]} alt={bike.name} className="w-full h-48 object-cover transform group-hover:scale-105 transition-transform duration-300"/>
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                                        <p className="text-white font-semibold">{bike.name}</p>
                                    </div>
                                </div>
                            ))}
                         </div>
                         <div className="text-center mt-8">
                             <button className="border border-primary text-primary font-semibold py-2 px-6 rounded-lg hover:bg-primary/5 transition">View More Images</button>
                         </div>
                    </section>

                    {/* Media Contact */}
                    <section className="mt-20">
                        <div className="bg-primary text-white rounded-xl p-8 md:p-12 text-center">
                            <h2 className="text-2xl font-heading font-extrabold uppercase tracking-widest">Media Contact</h2>
                            <p className="mt-3 text-gray-200">For all media inquiries, interviews, or other press-related matters, please contact our communications team.</p>
                            <div className="mt-6 flex flex-col sm:flex-row justify-center items-center gap-6">
                                <a href={`mailto:${contactEmail}`} className="inline-flex items-center gap-2 hover:text-secondary transition-colors">
                                    <MailIcon className="w-5 h-5"/> {contactEmail}
                                </a>
                                 <a href={`tel:${contactPhone}`} className="inline-flex items-center gap-2 hover:text-secondary transition-colors">
                                    <PhoneIcon className="w-5 h-5"/> {contactPhone}
                                </a>
                            </div>
                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
};

export default PressPage;