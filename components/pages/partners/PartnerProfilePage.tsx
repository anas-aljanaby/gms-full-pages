import React, { useState } from 'react';
import type { Partner } from '../../../types';
import { useLocalization } from '../../../hooks/useLocalization';
import { ArrowLeft } from 'lucide-react';
import Tabs from '../../common/Tabs';
import ProjectsTab from './ProjectsTab';
import EvaluationsTab from './EvaluationsTab';
import DocumentsTab from './DocumentsTab';
import ContactTab from './ContactTab';

interface PartnerProfilePageProps {
    partner: Partner;
    onBack: () => void;
}

const PartnerProfilePage: React.FC<PartnerProfilePageProps> = ({ partner, onBack }) => {
    const { t } = useLocalization();
    const [activeTab, setActiveTab] = useState('contact');

    const tabs = [
        { id: 'projects', label: 'المشاريع' },
        { id: 'evaluations', label: 'التقييمات' },
        { id: 'documents', label: 'المستندات' },
        { id: 'contact', label: 'معلومات التواصل' },
    ];

    const renderTabContent = () => {
        switch (activeTab) {
            case 'projects':
                return <ProjectsTab />;
            case 'evaluations':
                return <EvaluationsTab partnerRating={partner.rating} />;
            case 'documents':
                return <DocumentsTab />;
            case 'contact':
                return <ContactTab partner={partner} />;
            default:
                return null;
        }
    };

    return (
        <div dir="rtl" className="bg-gray-50 p-6 space-y-6 animate-fade-in">
            <button onClick={onBack} className="flex items-center gap-2 text-sm font-semibold text-blue-600 hover:underline">
                <ArrowLeft size={16} className="rotate-180"/> العودة إلى القائمة
            </button>
            
            <div className="bg-white rounded-xl shadow p-6">
              {/* Header */}
              <div className="flex items-center gap-6">
                  <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-600 text-4xl">
                      {partner.logo}
                  </div>
                  <div>
                      <h1 className="text-3xl font-bold">{partner.name}</h1>
                      <p className="text-gray-500">{partner.country} | {partner.sector}</p>
                  </div>
              </div>

              <div className="mt-6">
                  <Tabs tabs={tabs} activeTab={activeTab} onTabClick={setActiveTab} />
              </div>

              <div className="mt-6">
                  {renderTabContent()}
              </div>
            </div>
        </div>
    );
};

export default PartnerProfilePage;