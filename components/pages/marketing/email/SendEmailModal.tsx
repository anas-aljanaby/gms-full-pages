
import React, { useState } from 'react';
import { useLocalization } from '../../../../hooks/useLocalization';
import { XIcon } from '../../../icons/GenericIcons';

interface SendEmailModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSend: (data: { to: string; subject: string; body: string }) => void;
}

const SendEmailModal: React.FC<SendEmailModalProps> = ({ isOpen, onClose, onSend }) => {
    const { t } = useLocalization();
    const [to, setTo] = useState('');
    const [subject, setSubject] = useState('');
    const [body, setBody] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!to.trim() || !subject.trim()) {
            alert("Recipient and subject are required.");
            return;
        }
        onSend({ to, subject, body });
        // Reset form
        setTo('');
        setSubject('');
        setBody('');
    };

    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 animate-fade-in"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
        >
            <div 
                className="bg-card dark:bg-dark-card rounded-2xl shadow-xl w-full max-w-2xl m-4 flex flex-col max-h-[90vh]"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between p-4 border-b dark:border-slate-700">
                    <h2 className="text-xl font-bold text-foreground dark:text-dark-foreground">
                        {t('digital_marketing.email.createEmail')}
                    </h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-slate-700" aria-label="Close modal">
                        <XIcon />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="flex-grow flex flex-col">
                    <div className="p-6 space-y-4 overflow-y-auto">
                        <div>
                            <label htmlFor="email-to" className="block text-sm font-medium">To</label>
                            <input 
                                type="text" 
                                id="email-to"
                                value={to}
                                onChange={e => setTo(e.target.value)}
                                placeholder="Segment or email address"
                                className="mt-1 w-full p-2 border rounded-md bg-gray-50 dark:bg-slate-800 dark:border-slate-700"
                            />
                        </div>
                        <div>
                            <label htmlFor="email-subject" className="block text-sm font-medium">Subject</label>
                            <input 
                                type="text" 
                                id="email-subject"
                                value={subject}
                                onChange={e => setSubject(e.target.value)}
                                className="mt-1 w-full p-2 border rounded-md bg-gray-50 dark:bg-slate-800 dark:border-slate-700"
                            />
                        </div>
                        <div>
                             <label htmlFor="email-body" className="block text-sm font-medium">Body</label>
                             <textarea 
                                id="email-body"
                                value={body}
                                onChange={e => setBody(e.target.value)}
                                rows={10}
                                className="mt-1 w-full p-2 border rounded-md bg-gray-50 dark:bg-slate-800 dark:border-slate-700"
                            />
                        </div>
                    </div>
                    <div className="px-6 py-4 bg-gray-50 dark:bg-dark-card/50 rounded-b-2xl flex justify-end gap-3 flex-shrink-0">
                        <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-slate-700 text-sm font-semibold">{t('common.cancel')}</button>
                        <button type="submit" className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary-dark">Send Email</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SendEmailModal;
