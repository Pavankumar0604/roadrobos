import React, { useState } from 'react';
import { type JobOpening } from '../types';
import Card from './Card';
import { XIcon, UploadIcon, CheckCircleIcon } from './icons/Icons';

interface ApplicationFormModalProps {
  job: JobOpening;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (applicationData: {
    job: JobOpening;
    applicantName: string;
    applicantEmail: string;
    applicantPhone: string;
    resumeFileName: string;
    resumeFileContent: string;
  }) => void;
}

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};


const ApplicationFormModal: React.FC<ApplicationFormModalProps> = ({ job, isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    applicantName: '',
    applicantEmail: '',
    applicantPhone: '',
  });
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.applicantName.trim()) newErrors.applicantName = 'Full name is required.';
    if (!formData.applicantEmail || !/\S+@\S+\.\S+/.test(formData.applicantEmail)) newErrors.applicantEmail = 'A valid email is required.';
    if (!formData.applicantPhone || !/^\d{10}$/.test(formData.applicantPhone)) newErrors.applicantPhone = 'A 10-digit phone number is required.';
    if (!resumeFile) newErrors.resume = 'Please upload your resume.';
    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0 && resumeFile) {
      setIsSubmitting(true);
      try {
        const resumeFileContent = await fileToBase64(resumeFile);
        onSubmit({
          job,
          ...formData,
          resumeFileName: resumeFile.name,
          resumeFileContent,
        });
        // The parent component will close the modal
      } catch (error) {
        console.error("Error converting file:", error);
        setErrors({ form: "There was an error processing your resume. Please try again." });
      } finally {
        setIsSubmitting(false);
      }
    }
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setResumeFile(e.target.files[0]);
    }
  };
  
  const inputClasses = (hasError: boolean) =>
    `mt-1 block w-full p-3 bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-input-focus ${hasError ? 'border-error' : 'border-input'}`;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg flex flex-col">
        <form onSubmit={handleSubmit} noValidate>
          <div className="p-6 border-b flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold">Apply for {job.title}</h2>
              <p className="text-sm text-gray-500">{job.location} | {job.type}</p>
            </div>
            <button type="button" onClick={onClose}><XIcon className="w-6 h-6"/></button>
          </div>
          <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
            {errors.form && <p className="text-red-500 text-sm">{errors.form}</p>}
            <div>
              <label htmlFor="applicantName">Full Name</label>
              <input type="text" name="applicantName" id="applicantName" value={formData.applicantName} onChange={handleChange} className={inputClasses(!!errors.applicantName)} required />
              {errors.applicantName && <p className="text-error text-xs mt-1">{errors.applicantName}</p>}
            </div>
            <div>
              <label htmlFor="applicantEmail">Email Address</label>
              <input type="email" name="applicantEmail" id="applicantEmail" value={formData.applicantEmail} onChange={handleChange} className={inputClasses(!!errors.applicantEmail)} required />
              {errors.applicantEmail && <p className="text-error text-xs mt-1">{errors.applicantEmail}</p>}
            </div>
            <div>
              <label htmlFor="applicantPhone">Phone Number</label>
              <input type="tel" name="applicantPhone" id="applicantPhone" value={formData.applicantPhone} onChange={handleChange} className={inputClasses(!!errors.applicantPhone)} required />
              {errors.applicantPhone && <p className="text-error text-xs mt-1">{errors.applicantPhone}</p>}
            </div>
            <div>
              <label>Resume</label>
              <div className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 ${errors.resume ? 'border-red-500' : 'border-gray-300'} border-dashed rounded-md`}>
                <div className="space-y-1 text-center">
                  {resumeFile ? (
                    <CheckCircleIcon className="mx-auto h-12 w-12 text-secondary" />
                  ) : (
                    <UploadIcon className="mx-auto h-12 w-12 text-gray-400"/>
                  )}
                  <div className="flex text-sm text-gray-600">
                    <label htmlFor="resume-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-primary hover:text-secondary focus-within:outline-none">
                      <span>{resumeFile ? resumeFile.name : 'Upload your resume'}</span>
                      <input id="resume-upload" name="resume-upload" type="file" className="sr-only" onChange={handleFileChange} accept=".pdf,.doc,.docx" />
                    </label>
                  </div>
                  <p className="text-xs text-gray-500">PDF, DOC, DOCX up to 5MB</p>
                </div>
              </div>
              {errors.resume && <p className="text-error text-xs mt-1">{errors.resume}</p>}
            </div>
          </div>
          <div className="p-4 bg-gray-50 flex justify-end gap-4">
            <button type="button" onClick={onClose} className="border border-gray-300 font-semibold py-2 px-4 rounded-lg">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="bg-secondary text-white font-semibold py-2 px-4 rounded-lg disabled:opacity-50">
              {isSubmitting ? 'Submitting...' : 'Submit Application'}
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default ApplicationFormModal;
