import React from 'react';
import { Check } from 'lucide-react';

interface WizardStepperProps {
  currentStep: number;
}

const WizardStepper: React.FC<WizardStepperProps> = ({ currentStep }) => {
    const steps = [
        "المعلومات الأساسية",
        "التفاصيل التنظيمية",
        "معلومات الاتصال",
        "المستندات",
        "المراجعة والتأكيد"
    ];

    return (
        <nav aria-label="Progress">
            <ol role="list" className="flex items-center">
                {steps.map((stepName, stepIdx) => {
                    const stepNumber = stepIdx + 1;
                    const isCompleted = currentStep > stepNumber;
                    const isCurrent = currentStep === stepNumber;
                    
                    return (
                        <li key={stepName} className={`relative ${stepIdx !== steps.length - 1 ? 'flex-1' : ''}`}>
                            {stepIdx < steps.length - 1 ? (
                                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-0.5 bg-gray-200" aria-hidden="true">
                                    <div className={`h-full bg-blue-600 transition-all duration-500 ${isCompleted || isCurrent ? 'w-full' : 'w-0'}`} />
                                </div>
                            ) : null}
                            
                            <div className="relative flex flex-col items-center text-center">
                                <div className={`relative flex h-8 w-8 items-center justify-center rounded-full transition-colors duration-300 ${isCompleted ? 'bg-blue-600' : isCurrent ? 'border-2 border-blue-600 bg-white' : 'border-2 border-gray-300 bg-white'}`}>
                                    {isCompleted ? (
                                        <Check className="h-5 w-5 text-white" />
                                    ) : isCurrent ? (
                                        <span className="h-2.5 w-2.5 rounded-full bg-blue-600" />
                                    ) : (
                                        <span className="h-2.5 w-2.5 rounded-full bg-gray-300" />
                                    )}
                                </div>
                                <p className={`mt-2 text-xs font-semibold ${isCurrent ? 'text-blue-600' : 'text-gray-500'}`}>{stepName}</p>
                            </div>
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
};

export default WizardStepper;