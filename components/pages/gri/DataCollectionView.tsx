
import React, { useState, useMemo } from 'react';
import { useLocalization } from '../../../hooks/useLocalization';
import DisclosureList from './DisclosureList';
import { universalStandards, topicStandards, GriStandard } from '../../../data/griData';
import { ArrowLeft } from 'lucide-react';

interface DataCollectionViewProps {
    onBack: () => void;
}

const translations = {
    ar: {
        title: "جمع بيانات GRI",
        backToDashboard: "العودة إلى لوحة القيادة",
        universal: "المعايير العالمية",
        topic: "المعايير حسب الموضوع",
        sector: "المعايير القطاعية",
        Economic: "اقتصادية",
        Environmental: "بيئية",
        Social: "اجتماعية"
    },
    en: {
        title: "GRI Data Collection",
        backToDashboard: "Back to Dashboard",
        universal: "Universal Standards",
        topic: "Topic-Specific Standards",
        sector: "Sector Standards",
        Economic: "Economic",
        Environmental: "Environmental",
        Social: "Social"
    },
    tr: {
        title: "GRI Veri Toplama",
        backToDashboard: "Kontrol Paneline Geri Dön",
        universal: "Evrensel Standartlar",
        topic: "Konuya Özel Standartlar",
        sector: "Sektör Standartları",
        Economic: "Ekonomik",
        Environmental: "Çevresel",
        Social: "Sosyal"
    }
};

const DataCollectionView: React.FC<DataCollectionViewProps> = ({ onBack }) => {
    const { language } = useLocalization();
    const t = (key: string) => {
        const lang = language as keyof typeof translations;
        const keys = key.split('.');
        let result: any = translations[lang];
        for (const k of keys) {
            result = result?.[k];
            if (result === undefined) return key;
        }
        return result || key;
    };
    
    const [activeTab, setActiveTab] = useState('universal');
    
    const tabs = [
        { id: 'universal', label: t('universal') },
        { id: 'topic', label: t('topic') },
        { id: 'sector', label: t('sector') },
    ];

    const groupedUniversalStandards = useMemo(() => {
        return universalStandards.reduce((acc, standard) => {
            const group = standard.standard;
            if (!acc[group]) acc[group] = [];
            acc[group].push(standard);
            return acc;
        }, {} as Record<string, GriStandard[]>);
    }, []);

    const groupedTopicStandards = useMemo(() => {
        return topicStandards.reduce((acc, standard) => {
            const category = t(standard.category!);
            if (!acc[category]) acc[category] = [];
            acc[category].push(standard);
            return acc;
        }, {} as Record<string, GriStandard[]>);
    }, [t]);

    const renderContent = () => {
        switch(activeTab) {
            case 'universal':
                return <DisclosureList groupedStandards={groupedUniversalStandards} />;
            case 'topic':
                return <DisclosureList groupedStandards={groupedTopicStandards} />;
            case 'sector':
                return <div className="text-center p-8 text-gray-500 bg-card dark:bg-dark-card rounded-lg">Sector-specific standards are currently under development.</div>;
            default:
                return null;
        }
    };
    
     const getTabClass = (tabId: string) => {
        return activeTab === tabId
          ? 'border-primary text-primary dark:border-secondary dark:text-secondary'
          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:hover:text-gray-300';
    };

    return (
        <div className="space-y-6 animate-fade-in" dir="rtl">
             <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-foreground dark:text-dark-foreground">
                    {t('title')}
                </h1>
                <button onClick={onBack} className="flex items-center gap-2 text-sm font-semibold text-primary hover:underline">
                    <ArrowLeft className="w-4 h-4 rtl:rotate-180" /> {t('backToDashboard')}
                </button>
            </div>
            
            <div className="border-b border-gray-200 dark:border-slate-700">
                <nav className="-mb-px flex space-x-4 rtl:space-x-reverse" aria-label="Tabs">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`whitespace-nowrap py-3 px-4 border-b-2 font-semibold text-sm transition-colors rounded-t-lg ${getTabClass(tab.id)}`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </nav>
            </div>
            
            <div className="mt-6">
                {renderContent()}
            </div>
        </div>
    );
};

export default DataCollectionView;
