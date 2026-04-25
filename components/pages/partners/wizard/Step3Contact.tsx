import React from 'react';
import { Plus, X } from 'lucide-react';

interface Step3ContactProps {
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

const Step3Contact: React.FC<Step3ContactProps> = ({ data, updateData }) => {

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        updateData({ [e.target.name]: e.target.value });
    };

    const handleContactPersonChange = (index: number, e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const newContacts = [...data.contactPersons];
        newContacts[index][e.target.name] = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value;
        updateData({ contactPersons: newContacts });
    };

    const addContactPerson = () => {
        if (data.contactPersons.length < 3) {
            updateData({ contactPersons: [...data.contactPersons, { id: Date.now(), fullName: '', position: '', phone: '', email: '', whatsapp: false, preferredContact: '' }] });
        }
    };
    
    const removeContactPerson = (index: number) => {
        if (data.contactPersons.length > 1) {
            const newContacts = data.contactPersons.filter((_: any, i: number) => i !== index);
            updateData({ contactPersons: newContacts });
        }
    };


    return (
        <div className="space-y-8 max-w-4xl mx-auto">
            <h2 className="text-xl font-bold text-center">بيانات الاتصال والتواصل</h2>
            
            <Section title="العنوان">
                <FormField label="العنوان الكامل" required>
                    <textarea name="fullAddress" value={data.fullAddress} onChange={handleInputChange} rows={3} className="w-full p-2 border rounded-md" />
                </FormField>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField label="الرمز البريدي"><input type="text" name="postalCode" value={data.postalCode} onChange={handleInputChange} className="w-full p-2 border rounded-md" /></FormField>
                    <FormField label="صندوق البريد"><input type="text" name="poBox" value={data.poBox} onChange={handleInputChange} className="w-full p-2 border rounded-md" /></FormField>
                </div>
            </Section>

            <Section title="الاتصال">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField label="الهاتف الرئيسي" required><input type="tel" name="mainPhone" value={data.mainPhone} onChange={handleInputChange} placeholder="+966 XX XXX XXXX" className="w-full p-2 border rounded-md" /></FormField>
                    <FormField label="هاتف إضافي"><input type="tel" name="extraPhone" value={data.extraPhone} onChange={handleInputChange} className="w-full p-2 border rounded-md" /></FormField>
                    <FormField label="البريد الإلكتروني الرسمي" required><input type="email" name="officialEmail" value={data.officialEmail} onChange={handleInputChange} className="w-full p-2 border rounded-md" /></FormField>
                    <FormField label="الموقع الإلكتروني"><input type="url" name="website" value={data.website} onChange={handleInputChange} placeholder="https://example.com" className="w-full p-2 border rounded-md" /></FormField>
                </div>
            </Section>

            <Section title="الأشخاص المسؤولون">
                <div className="space-y-4">
                {data.contactPersons.map((contact: any, index: number) => (
                    <div key={contact.id} className="p-4 border rounded-lg relative">
                        {data.contactPersons.length > 1 && (
                            <button type="button" onClick={() => removeContactPerson(index)} className="absolute top-2 left-2 text-red-500 hover:bg-red-100 p-1 rounded-full"><X size={16} /></button>
                        )}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <FormField label="الاسم الكامل" required><input type="text" name="fullName" value={contact.fullName} onChange={e => handleContactPersonChange(index, e)} className="w-full p-2 border rounded-md"/></FormField>
                             <FormField label="المنصب" required><input type="text" name="position" value={contact.position} onChange={e => handleContactPersonChange(index, e)} className="w-full p-2 border rounded-md"/></FormField>
                             <FormField label="رقم الهاتف المباشر"><input type="tel" name="phone" value={contact.phone} onChange={e => handleContactPersonChange(index, e)} className="w-full p-2 border rounded-md"/></FormField>
                             <FormField label="البريد الإلكتروني" required><input type="email" name="email" value={contact.email} onChange={e => handleContactPersonChange(index, e)} className="w-full p-2 border rounded-md"/></FormField>
                        </div>
                    </div>
                ))}
                </div>
                 {data.contactPersons.length < 3 && (
                    <button type="button" onClick={addContactPerson} className="mt-4 flex items-center gap-2 text-sm font-semibold text-blue-600"><Plus size={16} /> إضافة شخص آخر</button>
                 )}
            </Section>

        </div>
    );
};

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="p-4 border rounded-lg">
        <h3 className="font-bold mb-4">{title}</h3>
        <div className="space-y-4">{children}</div>
    </div>
);


export default Step3Contact;