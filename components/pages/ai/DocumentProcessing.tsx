
import React, { useState, useMemo } from 'react';
import AiCard from './AiCard';
import { DocRoutingIcon } from '../../icons/AiIcons';
import { UploadIcon } from '../../icons/ActionIcons';
import { useLocalization } from '../../../hooks/useLocalization';
import type { Language } from '../../../types';

// Local translations to avoid affecting global settings
const localTranslations = {
    en: {
        uploadTitle: "Upload & Process Documents",
        uploadPrompt: "Choose a file",
        uploadDragDrop: "or drag and drop it here",
        uploadHint: "PDF, DOCX, JPG (max 5MB)",
        processedTitle: "Processed Documents",
        fileName: "Filename",
        status: "Status",
        detectedType: "Detected Type",
        dateUploaded: "Date Uploaded",
        actions: "Actions",
        statusComplete: "Complete",
        statusProcessing: "Processing",
        typeInvoice: "Invoice",
        typeContract: "Contract",
        typeAnalyzing: "Analyzing...",
        viewData: "View Data"
    },
    ar: {
        uploadTitle: "رفع ومعالجة المستندات",
        uploadPrompt: "اختر ملفًا",
        uploadDragDrop: "أو قم بسحبه وإفلاته هنا",
        uploadHint: "PDF, DOCX, JPG (بحد أقصى 5 ميجابايت)",
        processedTitle: "المستندات التي تمت معالجتها",
        fileName: "اسم الملف",
        status: "الحالة",
        detectedType: "النوع المكتشف",
        dateUploaded: "تاريخ الرفع",
        actions: "إجراءات",
        statusComplete: "مكتمل",
        statusProcessing: "قيد المعالجة",
        typeInvoice: "فاتورة",
        typeContract: "عقد",
        typeAnalyzing: "جاري التحليل...",
        viewData: "عرض البيانات"
    },
    tr: {
        uploadTitle: "Belgeleri Yükle ve İşle",
        uploadPrompt: "Bir dosya seçin",
        uploadDragDrop: "veya buraya sürükleyip bırakın",
        uploadHint: "PDF, DOCX, JPG (en fazla 5MB)",
        processedTitle: "İşlenmiş Belgeler",
        fileName: "Dosya Adı",
        status: "Durum",
        detectedType: "Algılanan Tür",
        dateUploaded: "Yükleme Tarihi",
        actions: "Eylemler",
        statusComplete: "Tamamlandı",
        statusProcessing: "İşleniyor",
        typeInvoice: "Fatura",
        typeContract: "Sözleşme",
        typeAnalyzing: "Analiz ediliyor...",
        viewData: "Verileri Görüntüle"
    }
};

const DocumentProcessing: React.FC = () => {
    const { language } = useLocalization();

    // Local translation function
    const t = (key: keyof typeof localTranslations.en) => {
        return localTranslations[language]?.[key] || localTranslations.en[key];
    };
    
    const documentsData = useMemo(() => [
        { name: 'invoice_q4_2023.pdf', status: t('statusComplete'), type: t('typeInvoice'), date: '2024-07-20' },
        { name: 'grant_agreement_unicef.docx', status: t('statusComplete'), type: t('typeContract'), date: '2024-07-19' },
        { name: 'new_vendor_form.pdf', status: t('statusProcessing'), type: t('typeAnalyzing'), date: '2024-07-21' },
    ], [language]); // Re-compute when language changes

    const [documents, setDocuments] = useState(documentsData);
    
    // Update state if language changes
    React.useEffect(() => {
        setDocuments(documentsData);
    }, [documentsData]);


    return (
        <div className="space-y-6">
            <AiCard title={t('uploadTitle')} icon={<DocRoutingIcon />}>
                <div className="border-2 border-dashed border-gray-300 dark:border-slate-600 rounded-lg p-10 text-center cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-800/50">
                    <UploadIcon className="mx-auto w-10 h-10 text-gray-400" />
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                        <span className="font-semibold text-primary dark:text-secondary-light">{t('uploadPrompt')}</span> {t('uploadDragDrop')}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{t('uploadHint')}</p>
                </div>
            </AiCard>

            <AiCard title={t('processedTitle')} icon={<DocRoutingIcon />}>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-gray-500 dark:text-gray-400 uppercase">
                            <tr>
                                <th className="p-2">{t('fileName')}</th>
                                <th className="p-2">{t('status')}</th>
                                <th className="p-2">{t('detectedType')}</th>
                                <th className="p-2">{t('dateUploaded')}</th>
                                <th className="p-2 text-right">{t('actions')}</th>
                            </tr>
                        </thead>
                        <tbody className="text-foreground dark:text-dark-foreground">
                            {documents.map((doc, index) => (
                                <tr key={index} className="border-t dark:border-slate-700">
                                    <td className="p-2 font-medium">{doc.name}</td>
                                    <td className="p-2">{doc.status}</td>
                                    <td className="p-2">{doc.type}</td>
                                    <td className="p-2">{doc.date}</td>
                                    <td className="p-2 text-right">
                                        <button className="text-primary dark:text-secondary-light hover:underline text-xs font-semibold">{t('viewData')}</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </AiCard>
        </div>
    );
};

export default DocumentProcessing;
