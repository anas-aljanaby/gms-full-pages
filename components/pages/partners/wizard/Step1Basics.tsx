import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud } from 'lucide-react';
import FileUpload from '../../../common/FileUpload';

interface Step1BasicsProps {
    data: any;
    updateData: (data: any) => void;
}

const FormField: React.FC<{ label: string; required?: boolean; children: React.ReactNode }> = ({ label, required, children }) => (
    <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        {children}
    </div>
);

const Step1Basics: React.FC<Step1BasicsProps> = ({ data, updateData }) => {
    const [charCount, setCharCount] = useState(data.description?.length || 0);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        if (name === 'description') {
            setCharCount(value.length);
        }
        updateData({ [name]: value });
    };

    const handleFileDrop = useCallback((acceptedFiles: File[]) => {
        if (acceptedFiles[0]) {
            updateData({ logo: acceptedFiles[0] });
        }
    }, [updateData]);
    
    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <h2 className="text-xl font-bold text-center">البيانات الأساسية للشريك</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                <div className="md:col-span-1">
                    <FormField label="شعار المنظمة" required>
                        <FileUpload 
                            onFileDrop={handleFileDrop}
                            file={data.logo}
                            acceptedFileTypes={{'image/jpeg': [], 'image/png': []}}
                            maxSize={2 * 1024 * 1024}
                            isCircle
                        />
                    </FormField>
                </div>
                <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="sm:col-span-2">
                        <FormField label="اسم المنظمة" required>
                            <input type="text" name="organizationName" value={data.organizationName} onChange={handleInputChange} placeholder="اسم الشريك المنفذ" className="w-full p-2 border rounded-md" />
                        </FormField>
                    </div>
                    <div className="sm:col-span-2">
                        <FormField label="الاسم بالإنجليزية">
                            <input type="text" name="organizationNameEn" value={data.organizationNameEn} onChange={handleInputChange} placeholder="Organization Name" className="w-full p-2 border rounded-md" />
                        </FormField>
                    </div>
                     <FormField label="نوع المنظمة" required>
                        <select name="organizationType" value={data.organizationType} onChange={handleInputChange} className="w-full p-2 border rounded-md bg-white">
                            <option>منظمة غير ربحية محلية</option>
                            <option>منظمة غير ربحية دولية</option>
                            <option>مؤسسة حكومية</option>
                            <option>شركة خاصة</option>
                            <option>جمعية خيرية</option>
                            <option>أخرى</option>
                        </select>
                    </FormField>
                    <FormField label="القطاع الرئيسي" required>
                         <select name="primarySector" value={data.primarySector} onChange={handleInputChange} className="w-full p-2 border rounded-md bg-white">
                            <option>التعليم</option><option>الصحة</option><option>الإغاثة</option><option>التنمية</option><option>البيئة</option><option>حقوق الإنسان</option><option>آخر</option>
                        </select>
                    </FormField>
                     <FormField label="الدولة" required>
                        <select name="country" value={data.country} onChange={handleInputChange} className="w-full p-2 border rounded-md bg-white">
                            <option value="SA">🇸🇦 السعودية</option>
                            <option value="TR">🇹🇷 تركيا</option>
                            <option value="EG">🇪🇬 مصر</option>
                            <option value="JO">🇯🇴 الأردن</option>
                            <option value="AE">🇦🇪 الإمارات</option>
                        </select>
                    </FormField>
                     <FormField label="المدينة" required>
                        <input type="text" name="city" value={data.city} onChange={handleInputChange} className="w-full p-2 border rounded-md" />
                    </FormField>
                    <FormField label="سنة التأسيس" required>
                        <input type="number" name="establishmentYear" value={data.establishmentYear} onChange={handleInputChange} min="1950" max={new Date().getFullYear()} className="w-full p-2 border rounded-md" />
                    </FormField>
                     <FormField label="حجم المنظمة">
                        <select name="organizationSize" value={data.organizationSize} onChange={handleInputChange} className="w-full p-2 border rounded-md bg-white">
                            <option>1-10 موظفين</option><option>11-50 موظف</option><option>51-100 موظف</option><option>101-500 موظف</option><option>أكثر من 500 موظف</option>
                        </select>
                    </FormField>
                </div>
            </div>
             <div className="relative">
                <FormField label="وصف مختصر" required>
                    <textarea name="description" value={data.description} onChange={handleInputChange} rows={4} placeholder="نبذة عن المنظمة وأنشطتها..." maxLength={500} className="w-full p-2 border rounded-md"></textarea>
                </FormField>
                <span className="absolute bottom-2 left-2 text-xs text-gray-400">{charCount}/500</span>
            </div>
        </div>
    );
};

export default Step1Basics;