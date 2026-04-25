import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check } from 'lucide-react';

interface EvaluationSuccessModalProps {
    isOpen: boolean;
    onClose: () => void;
    partnerName: string;
}

const EvaluationSuccessModal: React.FC<EvaluationSuccessModalProps> = ({ isOpen, onClose, partnerName }) => {
    if (!isOpen) {
        return null;
    }
    
    return (
        <div 
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 animate-fade-in"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
        >
            <AnimatePresence>
                <motion.div
                    initial={{ opacity: 0, scale: 0.8, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.8, y: 20 }}
                    transition={{ duration: 0.4, type: 'spring' }}
                    className="bg-white rounded-2xl shadow-xl p-8 max-w-sm text-center"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                        <Check className="w-10 h-10 text-green-600" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-800">تم حفظ التقييم بنجاح</h2>
                    <p className="mt-2 text-gray-500">
                        شكراً لك. تم تسجيل تقييمك للشريك <span className="font-bold">{partnerName}</span>.
                    </p>
                    <button 
                        onClick={onClose}
                        className="mt-6 w-full px-6 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                    >
                        إغلاق
                    </button>
                </motion.div>
            </AnimatePresence>
        </div>
    );
};

export default EvaluationSuccessModal;
