import React from 'react';
import FileUpload from '../../../common/FileUpload';
import { File } from 'lucide-react';

interface Step4DocumentsProps {
    data: any;
    updateData: (data: any) => void;
}

const DocumentUpload: React.FC<{ label: string; required?: boolean; file: File | null; onFileDrop: (files: File[]) => void }> = ({ label, required, file, onFileDrop }) => (
    <div className="p-4 border rounded-lg flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
            <h4 className="font-semibold">{label} {required && <span className="text-red-500">*</span>}</h4>
            <span className={`text-xs px-2 py-0.5 rounded-full ${required ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'}`}>
                {required ? 'مطلوب' : 'اختياري'}
            </span>
        </div>
        <div className="w-full sm:w-64">
             <FileUpload
                onFileDrop={onFileDrop}
                file={file}
                acceptedFileTypes={{'application/pdf': [], 'image/jpeg': [], 'image/png': []}}
                maxSize={5 * 1024 * 1024}
            />
        </div>
    </div>
);


const Step4Documents: React.FC<Step4DocumentsProps> = ({ data, updateData }) => {
    
    const handleFileDrop = (docType: string) => (files: File[]) => {
        updateData({
            documents: {
                ...data.documents,
                [docType]: files[0] || null,
            }
        });
    };

    const documentFields = [
        { id: 'license', label: 'رخصة العمل', required: true },
        { id: 'registration', label: 'شهادة التسجيل', required: true },
        { id: 'commercialRecord', label: 'السجل التجاري', required: false },
        { id: 'taxCertificate', label: 'شهادة الضرائب', required: false },
        { id: 'orgStructure', label: 'الهيكل التنظيمي', required: false },
        { id: 'annualReport', label: 'التقرير السنوي الأخير', required: false },
    ];
    
    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <h2 className="text-xl font-bold text-center">رفع المستندات المطلوبة</h2>
            <div className="p-4 bg-blue-50 text-blue-800 rounded-lg text-sm">
                الرجاء رفع المستندات التالية. الملفات المطلوبة مميزة بـ <span className="font-bold text-red-500">*</span>
            </div>
            
            <div className="space-y-4">
                {documentFields.map(field => (
                    <DocumentUpload 
                        key={field.id}
                        label={field.label}
                        required={field.required}
                        file={data.documents[field.id]}
                        onFileDrop={handleFileDrop(field.id)}
                    />
                ))}
            </div>
        </div>
    );
};

export default Step4Documents;