import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';

import WizardStepper from './wizard/WizardStepper';
import Step1Basics from './wizard/Step1Basics';
import Step2Organizational from './wizard/Step2Organizational';
import Step3Contact from './wizard/Step3Contact';
import Step4Documents from './wizard/Step4Documents';
import Step5Review from './wizard/Step5Review';
import SuccessModal from './wizard/SuccessModal';

interface AddPartnerPageProps {
  onBack: () => void;
}

const AddPartnerPage: React.FC<AddPartnerPageProps> = ({ onBack }) => {
    const [currentStep, setCurrentStep] = useState(1);
    const [isSuccess, setIsSuccess] = useState(false);
    const [formData, setFormData] = useState<any>({
        // Initial empty state for all form fields
        // Step 1
        logo: null,
        organizationName: '',
        organizationNameEn: '',
        organizationType: 'منظمة غير ربحية محلية',
        country: 'SA',
        city: '',
        establishmentYear: '',
        organizationSize: '',
        primarySector: 'التعليم',
        subSectors: [],
        scope: 'محلي',
        description: '',
        // Step 2
        licenseNumber: '',
        issuer: '',
        issueDate: '',
        expiryDate: '',
        taxNumber: '',
        iban: '',
        bankName: '',
        bankAddress: '',
        languages: ['العربية'],
        specializations: [],
        certificates: [],
        // Step 3
        fullAddress: '',
        postalCode: '',
        poBox: '',
        mainPhone: '',
        extraPhone: '',
        fax: '',
        officialEmail: '',
        extraEmail: '',
        website: '',
        linkedin: '',
        twitter: '',
        facebook: '',
        instagram: '',
        contactPersons: [{ id: 1, fullName: '', position: '', phone: '', email: '', whatsapp: false, preferredContact: '' }],
        // Step 4
        documents: {},
        // Step 5
        notes: '',
        confirmed: false,
    });

    const updateFormData = (data: any) => {
        setFormData((prev: any) => ({ ...prev, ...data }));
    };

    const handleNext = () => setCurrentStep(prev => Math.min(prev + 1, 5));
    const handleBack = () => setCurrentStep(prev => Math.max(prev - 1, 1));
    const goToStep = (step: number) => setCurrentStep(step);

    const handleSubmit = () => {
        console.log("Form Submitted:", formData);
        setIsSuccess(true);
    };

    const renderStep = () => {
        switch (currentStep) {
            case 1: return <Step1Basics data={formData} updateData={updateFormData} />;
            case 2: return <Step2Organizational data={formData} updateData={updateFormData} />;
            case 3: return <Step3Contact data={formData} updateData={updateFormData} />;
            case 4: return <Step4Documents data={formData} updateData={updateFormData} />;
            case 5: return <Step5Review data={formData} updateData={updateFormData} goToStep={goToStep} />;
            default: return null;
        }
    };
    
    const pageVariants = {
      initial: { opacity: 0, x: 20 },
      in: { opacity: 1, x: 0 },
      out: { opacity: 0, x: -20 },
    };

    if (isSuccess) {
        return <SuccessModal onBackToList={onBack} />;
    }

    return (
        <div dir="rtl" className="bg-gray-50 p-6 space-y-6">
            <div>
                <nav className="text-sm mb-2">
                    <a href="#" onClick={onBack} className="text-gray-500 hover:underline">الرئيسية</a> &gt; 
                    <a href="#" onClick={onBack} className="text-gray-500 hover:underline"> الشركاء</a> &gt; 
                    <span className="font-semibold text-gray-700"> إضافة شريك جديد</span>
                </nav>
                <h1 className="text-2xl font-bold text-gray-800">إضافة شريك منفذ جديد</h1>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
                <WizardStepper currentStep={currentStep} />

                <div className="mt-8">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentStep}
                            variants={pageVariants}
                            initial="initial"
                            animate="in"
                            exit="out"
                            transition={{ duration: 0.3 }}
                        >
                            {renderStep()}
                        </motion.div>
                    </AnimatePresence>
                </div>

                <div className="mt-8 pt-6 border-t flex justify-between items-center">
                    <div>
                        {currentStep === 1 && <button onClick={onBack} className="px-6 py-2 text-sm font-semibold border rounded-lg hover:bg-gray-100">إلغاء</button>}
                        {currentStep > 1 && <button onClick={handleBack} className="px-6 py-2 text-sm font-semibold border rounded-lg hover:bg-gray-100">السابق</button>}
                    </div>
                    <div className="flex items-center gap-4">
                        {(currentStep > 1 && currentStep < 5) && <button className="px-6 py-2 text-sm font-semibold text-gray-700 border rounded-lg hover:bg-gray-100">حفظ كمسودة</button>}
                        {currentStep < 5 && <button onClick={handleNext} className="px-6 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700">التالي</button>}
                        {currentStep === 5 && <button onClick={handleSubmit} disabled={!formData.confirmed} className="px-8 py-3 text-base font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed">إرسال الطلب</button>}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddPartnerPage;