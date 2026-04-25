import React from 'react';

interface Step2OrganizationalProps {
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

const Step2Organizational: React.FC<Step2OrganizationalProps> = ({ data, updateData }) => {
    
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        updateData({ [e.target.name]: e.target.value });
    };

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
             <h2 className="text-xl font-bold text-center">المعلومات القانونية والتنظيمية</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField label="رقم السجل/الترخيص" required>
                    <input type="text" name="licenseNumber" value={data.licenseNumber} onChange={handleInputChange} className="w-full p-2 border rounded-md" />
                </FormField>
                 <FormField label="جهة الإصدار">
                    <input type="text" name="issuer" value={data.issuer} onChange={handleInputChange} className="w-full p-2 border rounded-md" />
                </FormField>
                 <FormField label="تاريخ الإصدار">
                    <input type="date" name="issueDate" value={data.issueDate} onChange={handleInputChange} className="w-full p-2 border rounded-md" />
                </FormField>
                 <FormField label="تاريخ الانتهاء">
                    <input type="date" name="expiryDate" value={data.expiryDate} onChange={handleInputChange} className="w-full p-2 border rounded-md" />
                </FormField>
                <FormField label="الرقم الضريبي">
                    <input type="text" name="taxNumber" value={data.taxNumber} onChange={handleInputChange} className="w-full p-2 border rounded-md" />
                </FormField>
                <FormField label="رقم الحساب البنكي (IBAN)">
                    <input type="text" name="iban" value={data.iban} onChange={handleInputChange} placeholder="SA00 0000 0000 0000 0000 0000" className="w-full p-2 border rounded-md" />
                </FormField>
                <FormField label="اسم البنك">
                    <input type="text" name="bankName" value={data.bankName} onChange={handleInputChange} className="w-full p-2 border rounded-md" />
                </FormField>
                <FormField label="عنوان البنك">
                    <input type="text" name="bankAddress" value={data.bankAddress} onChange={handleInputChange} className="w-full p-2 border rounded-md" />
                </FormField>
            </div>
            {/* Dynamic fields like certificates and specializations would be implemented here */}
        </div>
    );
};

export default Step2Organizational;