import React, { useState, useRef, useEffect } from 'react';
import type { Campaign, Language } from '../../../../types';
import { useLocalization } from '../../../../hooks/useLocalization';
import { ChevronDownIcon } from '../../../icons/GenericIcons';
import { TargetIcon } from '../../../icons/MetricsIcons';
import { TagIcon, UserCircleIcon, DollarSignIcon } from '../../../icons/MarketingIcons';
import { CalendarIcon } from '../../../icons/ActionIcons';

interface Step1BasicsProps {
    campaignData: Partial<Campaign>;
    updateData: (data: Partial<Campaign>) => void;
}

const FormField: React.FC<{ label: string; helpText: string; children: React.ReactNode }> = ({ label, helpText, children }) => (
    <div>
        <label className="block text-sm font-bold text-gray-800 dark:text-gray-200">{label}</label>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{helpText}</p>
        {children}
    </div>
);

const Step1Basics: React.FC<Step1BasicsProps> = ({ campaignData, updateData }) => {
    const { t, language, dir } = useLocalization();

    const objectiveOptions = Object.entries(t('digital_marketing.wizard.step1.objectiveOptions', { returnObjects: true }) as Record<string, string>).map(([key, value]) => ({ value: key, label: value }));
    const typeOptions = Object.entries(t('digital_marketing.wizard.step1.typeOptions', { returnObjects: true }) as Record<string, string>).map(([key, value]) => ({ value: key, label: value }));
    const ownerOptions = [{value: 'Fatma Kaya', label: 'Fatma Kaya'}, {value: 'Ali Veli', label: 'Ali Veli'}, {value: 'John Doe', label: 'John Doe'}];

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        if (name === 'name') {
            updateData({ name: { en: value, ar: value, tr: value } });
        } else {
            updateData({ [name]: value });
        }
    };
    
    const handleSelectChange = (name: string, value: string) => {
        if (name === 'objective') updateData({ goal: { ...(campaignData.goal || { type: 'Fundraising', target: 0, current: 0 }), type: value as any }});
        else updateData({ [name]: value });
    }

    const CustomSelect: React.FC<{
        icon: React.ReactNode;
        options: { value: string; label: string }[];
        value: string;
        name: string;
        onChange: (name: string, value: string) => void;
    }> = ({ icon, options, value, name, onChange }) => {
        const [isOpen, setIsOpen] = useState(false);
        const ref = useRef<HTMLDivElement>(null);

        useEffect(() => {
            const handleClickOutside = (event: MouseEvent) => {
                if (ref.current && !ref.current.contains(event.target as Node)) setIsOpen(false);
            };
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }, []);
        
        const selectedLabel = options.find(opt => opt.value === value)?.label || value;

        return (
            <div className="relative" ref={ref}>
                <button type="button" onClick={() => setIsOpen(!isOpen)} className="relative w-full flex items-center p-2.5 text-sm border border-gray-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-left">
                    <span className="text-gray-500 dark:text-gray-400">{icon}</span>
                    <span className="mx-2 flex-1 truncate">{selectedLabel}</span>
                    <ChevronDownIcon />
                </button>
                {isOpen && (
                    <div className={`absolute z-10 mt-1 w-full bg-card dark:bg-dark-card rounded-md shadow-lg ring-1 ring-black ring-opacity-5 py-1 ${dir === 'rtl' ? 'right-0' : 'left-0'}`}>
                        {options.map(option => (
                            <a href="#" key={option.value} onClick={e => { e.preventDefault(); onChange(name, option.value); setIsOpen(false); }}
                               className={`block px-4 py-2 text-sm text-foreground dark:text-dark-foreground hover:bg-gray-100 dark:hover:bg-slate-700 ${value === option.value ? 'font-bold' : ''}`}>
                                {option.label}
                            </a>
                        ))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="space-y-6">
            <div className="text-center">
                <h2 className="text-2xl font-bold">{t('digital_marketing.wizard.step1.title')}</h2>
                <p className="text-gray-500">{t('digital_marketing.wizard.step1.description')}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 max-w-4xl mx-auto">
                <div className="md:col-span-2">
                    <FormField label={t('digital_marketing.wizard.step1.name')} helpText={t('digital_marketing.wizard.step1.nameHelp')}>
                        <input type="text" name="name" value={campaignData.name?.en || ''} onChange={handleChange} className="w-full p-2.5 border rounded-lg bg-gray-50 dark:bg-slate-800 dark:border-slate-700" />
                    </FormField>
                </div>
                 <div className="md:col-span-2">
                    <FormField label={t('digital_marketing.wizard.step1.descriptionField')} helpText={t('digital_marketing.wizard.step1.descriptionHelp')}>
                        <textarea name="description" rows={2} className="w-full p-2.5 border rounded-lg bg-gray-50 dark:bg-slate-800 dark:border-slate-700" />
                    </FormField>
                </div>

                <FormField label={t('digital_marketing.wizard.step1.objective')} helpText={t('digital_marketing.wizard.step1.objectiveHelp')}>
                    <CustomSelect icon={<TargetIcon />} options={objectiveOptions} value={campaignData.goal?.type || 'Fundraising'} name="objective" onChange={handleSelectChange} />
                </FormField>
                
                <FormField label={t('digital_marketing.wizard.step1.type')} helpText={t('digital_marketing.wizard.step1.typeHelp')}>
                    <CustomSelect icon={<TagIcon />} options={typeOptions} value={campaignData.type || 'Fundraising - General'} name="type" onChange={handleSelectChange} />
                </FormField>
                
                 <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-gray-800 dark:text-gray-200">{t('digital_marketing.wizard.step1.timeline')}</label>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{t('digital_marketing.wizard.step1.timelineHelp')}</p>
                    <div className="flex items-center gap-2">
                         <div className="relative flex-1">
                             <span className="absolute inset-y-0 start-0 flex items-center ps-3 text-gray-500"><CalendarIcon /></span>
                             <input type="date" name="startDate" value={campaignData.startDate ? campaignData.startDate.split('T')[0] : ''} onChange={handleChange} className="w-full p-2.5 ps-10 border rounded-lg bg-white dark:bg-slate-800 dark:border-slate-700" />
                         </div>
                        <span className="text-gray-400 font-semibold text-lg">&rarr;</span>
                        <div className="relative flex-1">
                             <span className="absolute inset-y-0 start-0 flex items-center ps-3 text-gray-500"><CalendarIcon /></span>
                            <input type="date" name="endDate" value={campaignData.endDate ? campaignData.endDate.split('T')[0] : ''} onChange={handleChange} className="w-full p-2.5 ps-10 border rounded-lg bg-white dark:bg-slate-800 dark:border-slate-700" />
                        </div>
                    </div>
                </div>

                <FormField label={t('digital_marketing.wizard.step1.owner')} helpText={t('digital_marketing.wizard.step1.ownerHelp')}>
                    <CustomSelect icon={<UserCircleIcon />} options={ownerOptions} value={campaignData.owner || 'Fatma Kaya'} name="owner" onChange={handleSelectChange} />
                </FormField>

                <FormField label={t('digital_marketing.wizard.step1.budget')} helpText={t('digital_marketing.wizard.step1.budgetHelp')}>
                    <div className="relative">
                        <span className="absolute inset-y-0 start-0 flex items-center ps-3 text-gray-500"><DollarSignIcon /></span>
                        <input type="number" name="budget" value={campaignData.budget || ''} onChange={handleChange} placeholder="5000" className="w-full p-2.5 ps-10 border rounded-lg bg-white dark:bg-slate-800 dark:border-slate-700" />
                    </div>
                </FormField>

            </div>
        </div>
    );
};

export default Step1Basics;