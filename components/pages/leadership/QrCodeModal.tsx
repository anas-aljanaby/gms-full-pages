import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import html2canvas from 'html2canvas';
import { useLocalization } from '../../../hooks/useLocalization';
import { useToast } from '../../../hooks/useToast';
import { XIcon } from '../../icons/GenericIcons';
import { DownloadIcon, CopyIcon, PrinterIcon } from '../../icons/UtilityIcons';

interface QrCodeModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    qrValue: string;
    code: string;
    color: 'green' | 'blue';
}

const QrCodeModal: React.FC<QrCodeModalProps> = ({ isOpen, onClose, title, qrValue, code, color }) => {
    const { t } = useLocalization();
    const toast = useToast();
    const qrCardRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleBodyClass = () => {
            if (isOpen) {
                document.body.classList.add('modal-open');
            } else {
                document.body.classList.remove('modal-open');
            }
        };
        handleBodyClass();
        return () => document.body.classList.remove('modal-open');
    }, [isOpen]);

    const handleDownload = () => {
        if (qrCardRef.current) {
            html2canvas(qrCardRef.current, {
                backgroundColor: null, // transparent background
                useCORS: true,
            }).then(canvas => {
                const link = document.createElement('a');
                link.download = `${title.replace(/\s+/g, '-')}-qr.png`;
                link.href = canvas.toDataURL('image/png');
                link.click();
            });
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(code).then(() => {
            toast.showSuccess(`Code ${code} copied to clipboard.`, { title: t('common.copied') });
        });
    };

    const handlePrint = () => {
        window.print();
    };

    const theme = {
        green: {
            qr: '#10B981',
            bg: 'bg-green-400/20',
            border: 'border-green-500/30'
        },
        blue: {
            qr: '#3B82F6',
            bg: 'bg-blue-400/20',
            border: 'border-blue-500/30'
        }
    };
    const currentTheme = theme[color];

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm modal-overlay"
                        onClick={onClose}
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={{ duration: 0.3, ease: 'easeOut' }}
                        className="relative bg-transparent w-full max-w-sm mx-auto printable-modal-content"
                    >
                        <div ref={qrCardRef} className={`bg-white/50 dark:bg-black/30 backdrop-blur-xl rounded-3xl p-6 shadow-soft border ${currentTheme.border}`}>
                            <div className="flex justify-between items-center mb-4 hide-on-print">
                                <h2 className="text-xl font-bold">{title}</h2>
                                <button onClick={onClose} className="p-1 rounded-full hover:bg-black/10 dark:hover:bg-white/10"><XIcon /></button>
                            </div>

                            <div className="bg-white rounded-2xl p-4 shadow-inner">
                                <QRCodeSVG
                                    value={qrValue}
                                    size={256}
                                    bgColor={"#ffffff"}
                                    fgColor={currentTheme.qr}
                                    level={"H"}
                                    includeMargin={true}
                                    className="w-full h-auto"
                                />
                            </div>
                            
                            <div className="text-center mt-4">
                                <p className="text-sm text-gray-500 dark:text-gray-400">Unique Code</p>
                                <p className="font-mono text-2xl font-bold tracking-widest">{code}</p>
                            </div>
                        </div>

                        <div className="mt-4 grid grid-cols-3 gap-3 hide-on-print">
                            <button onClick={handleDownload} className="flex items-center justify-center gap-2 p-3 bg-white/50 dark:bg-black/30 rounded-xl hover:bg-white/80 dark:hover:bg-black/50 transition-colors">
                                <DownloadIcon className="w-5 h-5"/>
                                <span className="text-sm font-semibold">Download</span>
                            </button>
                            <button onClick={handleCopy} className="flex items-center justify-center gap-2 p-3 bg-white/50 dark:bg-black/30 rounded-xl hover:bg-white/80 dark:hover:bg-black/50 transition-colors">
                                <CopyIcon className="w-5 h-5"/>
                                <span className="text-sm font-semibold">Copy</span>
                            </button>
                             <button onClick={handlePrint} className="flex items-center justify-center gap-2 p-3 bg-white/50 dark:bg-black/30 rounded-xl hover:bg-white/80 dark:hover:bg-black/50 transition-colors">
                                <PrinterIcon className="w-5 h-5"/>
                                <span className="text-sm font-semibold">Print</span>
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default QrCodeModal;
