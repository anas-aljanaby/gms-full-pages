import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

interface SuccessModalProps {
    onBackToList: () => void;
}

const SuccessModal: React.FC<SuccessModalProps> = ({ onBackToList }) => {
    return (
        <div dir="rtl" className="bg-gray-50 p-6 flex items-center justify-center min-h-[calc(100vh-10rem)]">
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, type: 'spring' }}
                className="bg-white rounded-2xl shadow-xl p-8 max-w-lg text-center"
            >
                <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
                    <Check className="w-12 h-12 text-green-600" />
                </div>
                <h1 className="text-2xl font-bold text-gray-800">تم إضافة الشريك بنجاح!</h1>
                <p className="mt-2 text-gray-500">تم إرسال طلب إضافة الشريك للمراجعة.</p>

                <div className="mt-6 bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                    <div className="flex justify-between">
                        <span className="text-gray-500">رقم الطلب:</span>
                        <span className="font-mono font-semibold">#12345</span>
                    </div>
                     <div className="flex justify-between">
                        <span className="text-gray-500">الحالة:</span>
                        <span className="font-semibold text-yellow-600">قيد المراجعة</span>
                    </div>
                </div>
                
                <p className="mt-4 text-xs text-gray-400">سيتم إشعارك عبر البريد الإلكتروني عند اكتمال المراجعة.</p>

                <div className="mt-8 flex flex-col sm:flex-row gap-4">
                    <button onClick={onBackToList} className="flex-1 px-6 py-3 text-sm font-semibold border rounded-lg hover:bg-gray-100">
                        العودة لقائمة الشركاء
                    </button>
                    <button className="flex-1 px-6 py-3 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700">
                        عرض ملف الشريك
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default SuccessModal;