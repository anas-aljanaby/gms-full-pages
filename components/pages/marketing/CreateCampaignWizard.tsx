
import React, { useState } from 'react';
import { useLocalization } from '../../../hooks/useLocalization';
import type { Campaign } from '../../../types';
import { XIcon } from '../../icons/GenericIcons';
import WizardStepper from './wizard/WizardStepper';
import Step1Basics from './wizard/Step1Basics';
import Step2Audience from './wizard/Step2Audience';

interface CreateCampaignWizardProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreateCampaignWizard: React.FC<CreateCampaignWizardProps> = ({ isOpen, onClose }) => {
    const { t } = useLocalization();
    const [currentStep, setCurrentStep] = useState(1);
    const [campaignData, setCampaignData] = useState<Partial<Campaign>>({
        name: { en: '', ar: '', tr: '' },
    });

    const handleNext = () => setCurrentStep(prev => Math.min(prev + 1, 8));
    const handleBack = () => setCurrentStep(prev => Math.max(prev - 1, 1));
    
    const updateCampaignData = (update: Partial<Campaign>) => {
        setCampaignData(prev => ({...prev, ...update}));
    };

    if (!isOpen) return null;

    const renderStepContent = () => {
        switch (currentStep) {
            case 1:
                return <Step1Basics campaignData={campaignData} updateData={updateCampaignData} />;
            case 2:
                return <Step2Audience campaignData={campaignData} updateData={updateCampaignData} />;
            // Add cases for other steps later
            default:
                return <div className="text-center p-8">Step {currentStep} is under construction.</div>;
        }
    };

    return (
        <div 
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 animate-fade-in"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
        >
            <div 
                className="bg-card dark:bg-dark-card rounded-2xl shadow-xl w-full max-w-4xl m-4 flex flex-col max-h-[95vh]"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b dark:border-slate-700 flex-shrink-0">
                    <h2 className="text-xl font-bold text-foreground dark:text-dark-foreground">
                        {t('digital_marketing.wizard.title')}
                    </h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-slate-700" aria-label="Close modal">
                        <XIcon />
                    </button>
                </div>

                {/* Stepper */}
                <div className="p-6 border-b dark:border-slate-700 flex-shrink-0">
                    <WizardStepper currentStep={currentStep} />
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto flex-grow">
                    {renderStepContent()}
                </div>

                {/* Footer/Navigation */}
                <div className="px-6 py-4 bg-gray-50 dark:bg-dark-card/50 rounded-b-2xl flex justify-between items-center flex-shrink-0">
                    <button 
                        onClick={onClose}
                        className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-slate-700 text-sm font-semibold"
                    >
                        {t('common.cancel')}
                    </button>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleBack}
                            disabled={currentStep === 1}
                            className="px-4 py-2 rounded-lg border dark:border-slate-600 text-sm font-semibold disabled:opacity-50"
                        >
                           &larr; {t('digital_marketing.wizard.back')}
                        </button>
                        <button
                            onClick={handleNext}
                            className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary-dark disabled:opacity-50"
                        >
                            {currentStep === 8 ? t('digital_marketing.wizard.finishLaunch') : `${t('digital_marketing.wizard.next')} \u2192`}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateCampaignWizard;