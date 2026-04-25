import React, { useState } from 'react';
import { ChevronDown, Edit } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Step5ReviewProps {
    data: any;
    updateData: (data: any) => void;
    goToStep: (step: number) => void;
}

const ReviewSection: React.FC<{ title: string; onEdit: () => void; children: React.ReactNode }> = ({ title, onEdit, children }) => {
    const [isOpen, setIsOpen] = useState(true);
    return (
        <div className="border rounded-lg">
            <button onClick={() => setIsOpen(!isOpen)} className="w-full flex justify-between items-center p-4 bg-gray-50 rounded-t-lg">
                <h3 className="font-bold">{title}</h3>
                <div className="flex items-center gap-4">
                    <span onClick={(e) => { e.stopPropagation(); onEdit(); }} className="flex items-center gap-1 text-sm text-blue-600 hover:underline"><Edit size={14} /> تعديل</span>
                    <ChevronDown className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </div>
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            {children}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const InfoItem: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
    <div className="py-1">
        <p className="text-xs text-gray-500">{label}</p>
        <p className="font-semibold">{value || '-'}</p>
    </div>
);

const Step5Review: React.FC<Step5ReviewProps> = ({ data, updateData, goToStep }) => {
    
    return (
        <div className="space-y-6 max-w-4xl mx-auto">
             <h2 className="text-xl font-bold text-center">مراجعة البيانات قبل الحفظ</h2>
             
            <div className="space-y-4">
                <ReviewSection title="المعلومات الأساسية" onEdit={() => goToStep(1)}>
                    <InfoItem label="اسم المنظمة" value={data.organizationName} />
                    <InfoItem label="نوع المنظمة" value={data.organizationType} />
                    <InfoItem label="الدولة" value={data.country} />
                    <InfoItem label="القطاع الرئيسي" value={data.primarySector} />
                </ReviewSection>

                <ReviewSection title="التفاصيل التنظيمية" onEdit={() => goToStep(2)}>
                    <InfoItem label="رقم الترخيص" value={data.licenseNumber} />
                    <InfoItem label="جهة الإصدار" value={data.issuer} />
                    <InfoItem label="IBAN" value={data.iban} />
                    <InfoItem label="اسم البنك" value={data.bankName} />
                </ReviewSection>

                 <ReviewSection title="معلومات الاتصال" onEdit={() => goToStep(3)}>
                    <InfoItem label="العنوان" value={data.fullAddress} />
                    <InfoItem label="الهاتف الرئيسي" value={data.mainPhone} />
                    <InfoItem label="البريد الإلكتروني" value={data.officialEmail} />
                    <InfoItem label="الموقع الإلكتروني" value={data.website} />
                </ReviewSection>

                <ReviewSection title="المستندات المرفوعة" onEdit={() => goToStep(4)}>
                    <ul className="list-disc list-inside col-span-2">
                        {Object.entries(data.documents).map(([key, file]) => 
                           file ? <li key={key} className="text-green-600">تم رفع {key}</li> : null
                        )}
                    </ul>
                </ReviewSection>
            </div>

             <div className="mt-6 space-y-4">
                 <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">ملاحظات إضافية (اختياري)</label>
                    <textarea value={data.notes} onChange={e => updateData({ notes: e.target.value })} rows={3} className="w-full p-2 border rounded-md"></textarea>
                </div>
                <div className="flex items-center">
                    <input id="confirmation" type="checkbox" checked={data.confirmed} onChange={e => updateData({ confirmed: e.target.checked })} className="w-4 h-4 text-blue-600 rounded" />
                    <label htmlFor="confirmation" className="ml-2 block text-sm text-gray-900">أؤكد أن جميع المعلومات المدخلة صحيحة ودقيقة</label>
                </div>
             </div>
        </div>
    );
};

export default Step5Review;