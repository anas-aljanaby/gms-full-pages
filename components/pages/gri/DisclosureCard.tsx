import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { GriStandard } from '../../../data/griData';
import { ChevronDown, FileUp } from 'lucide-react';

interface DisclosureCardProps {
    standard: GriStandard;
    isExpanded: boolean;
    onToggle: () => void;
}

const DisclosureCard: React.FC<DisclosureCardProps> = ({ standard, isExpanded, onToggle }) => {
    const [status, setStatus] = useState('لم يبدأ');

    return (
        <div className="bg-gray-50 dark:bg-slate-800/50 rounded-lg overflow-hidden">
            <button
                onClick={onToggle}
                className="w-full flex items-center justify-between p-3 text-left hover:bg-gray-100 dark:hover:bg-slate-700/50 transition-colors"
                aria-expanded={isExpanded}
            >
                <div className="flex items-center gap-4">
                    <span className="font-mono text-sm text-gray-500">{standard.standard}-{standard.disclosureNumber}</span>
                    <span className="font-semibold">{standard.title}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span>{status}</span>
                    <motion.div animate={{ rotate: isExpanded ? 180 : 0 }}>
                        <ChevronDown size={16} />
                    </motion.div>
                </div>
            </button>
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        className="overflow-hidden"
                    >
                        <div className="p-4 border-t dark:border-slate-700 space-y-4">
                            <div>
                                <label className="block text-sm font-semibold mb-1">الرد السردي</label>
                                <textarea 
                                    rows={5} 
                                    className="w-full p-2 border rounded-md bg-white dark:bg-slate-800 dark:border-slate-600"
                                    placeholder={standard.description}
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold mb-1">الأدلة الداعمة</label>
                                     <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-slate-600 border-dashed rounded-md">
                                        <div className="space-y-1 text-center">
                                            <FileUp className="mx-auto h-12 w-12 text-gray-400" />
                                            <div className="flex text-sm text-gray-600 dark:text-gray-400">
                                                <label htmlFor="file-upload" className="relative cursor-pointer bg-white dark:bg-slate-800 rounded-md font-medium text-primary hover:text-primary-dark">
                                                    <span>ارفع ملفًا</span>
                                                    <input id="file-upload" name="file-upload" type="file" className="sr-only" />
                                                </label>
                                                <p className="pl-1">أو اسحبه وأفلته هنا</p>
                                            </div>
                                            <p className="text-xs text-gray-500">PDF, DOCX, XLSX up to 10MB</p>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold mb-1">الحالة</label>
                                    <select 
                                        value={status} 
                                        onChange={(e) => setStatus(e.target.value)}
                                        className="w-full p-2 border rounded-md bg-white dark:bg-slate-800 dark:border-slate-600"
                                    >
                                        <option>لم يبدأ</option>
                                        <option>قيد التنفيذ</option>
                                        <option>مكتمل</option>
                                    </select>
                                </div>
                            </div>
                            <div className="flex justify-end">
                                <button className="px-4 py-2 bg-primary text-white font-semibold rounded-lg text-sm">
                                    حفظ التقدم
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default DisclosureCard;
