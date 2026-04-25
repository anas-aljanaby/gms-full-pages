import React, { useState } from 'react';
import { useLocalization } from '../../hooks/useLocalization';
import { MOCK_PARTNERS } from '../../data/partnersData';
import type { Partner } from '../../types';
import EvaluationSideNav from './partners/evaluation/EvaluationSideNav';
import PartnerEvaluationForm from './partners/evaluation/PartnerEvaluationForm';
import EvaluationSuccessModal from './partners/evaluation/EvaluationSuccessModal';

const PartnerEvaluationsPage: React.FC = () => {
    const { t } = useLocalization();
    const [partners] = useState<Partner[]>(MOCK_PARTNERS);
    const [selectedPartner, setSelectedPartner] = useState<Partner>(partners[0]);
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

    const handleSaveEvaluation = () => {
        // Here you would typically send data to a server
        console.log("Evaluation saved for:", selectedPartner.name);
        setIsSuccessModalOpen(true);
    };

    return (
        <>
            <div dir="rtl" className="bg-gray-50 p-6 space-y-6 animate-fade-in">
                <div>
                    <nav className="text-sm mb-2">
                        <a href="#" className="text-gray-500 hover:underline">الرئيسية</a> &gt; 
                        <a href="#" className="text-gray-500 hover:underline"> الشركاء</a> &gt; 
                        <span className="font-semibold text-gray-700"> التقييمات</span>
                    </nav>
                    <h1 className="text-2xl font-bold text-gray-800">إدارة تقييمات الشركاء</h1>
                </div>

                <div className="flex flex-col lg:flex-row gap-6">
                    <aside className="w-full lg:w-1/3 xl:w-1/4">
                        <EvaluationSideNav 
                            partners={partners}
                            selectedPartner={selectedPartner}
                            onSelectPartner={setSelectedPartner}
                        />
                    </aside>
                    <main className="flex-1">
                        <PartnerEvaluationForm 
                            key={selectedPartner.id} // Re-mount form on partner change
                            partner={selectedPartner}
                            onSave={handleSaveEvaluation}
                            onCancel={() => console.log("Cancelled")}
                        />
                    </main>
                </div>
            </div>
            <EvaluationSuccessModal 
                isOpen={isSuccessModalOpen}
                onClose={() => setIsSuccessModalOpen(false)}
                partnerName={selectedPartner.name}
            />
        </>
    );
};

export default PartnerEvaluationsPage;
