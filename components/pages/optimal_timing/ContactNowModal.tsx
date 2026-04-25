import React, { useState } from 'react';
import type { IndividualDonor } from '../../../types';
import { useLocalization } from '../../../hooks/useLocalization';
import { useToast } from '../../../hooks/useToast';
import { XIcon } from '../../icons/GenericIcons';
import { channelIcons } from '../../icons/ChannelIcons';

interface ContactNowModalProps {
    donor: IndividualDonor;
    onClose: () => void;
}

const ContactNowModal: React.FC<ContactNowModalProps> = ({ donor, onClose }) => {
    const { t } = useLocalization();
    const toast = useToast();
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');

    React.useEffect(() => {
        const { subject: suggestedSubject, message: suggestedMessage } = getMessageTemplate(donor.donorCategory);
        setSubject(suggestedSubject);
        setMessage(suggestedMessage);
    }, [donor]);

    const getMessageTemplate = (category?: string) => {
        switch (category) {
            case 'Hero Donor':
                return { subject: `An exclusive update for you, ${donor.fullName.en}`, message: `Dear ${donor.fullName.en},\n\nAs one of our most valued supporters, we wanted to share a personal update on...` };
            case 'Recurring Donor':
                return { subject: `Your latest impact`, message: `Hi ${donor.fullName.en},\n\nThanks to your consistent support, we've been able to...` };
            case 'Dormant Donor':
                return { subject: `We've missed you, ${donor.fullName.en}`, message: `Hi ${donor.fullName.en},\n\nIt's been a while, and we wanted to reconnect and show you the incredible difference your past support made...` };
            default:
                return { subject: `An update from our team`, message: `Dear ${donor.fullName.en},\n\nWe wanted to share some recent news...` };
        }
    };

    const handleSend = () => {
        // In a real app, this would trigger an API call
        console.log("Sending message...", { donorId: donor.id, subject, message });
        toast.showSuccess(`Your message to ${donor.fullName.en} has been logged.`, { title: 'Message Sent!'});
        onClose();
    };
    
    const ChannelIcon = donor.preferred_contact_channel ? channelIcons[donor.preferred_contact_channel] : channelIcons.email;

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 animate-fade-in" onClick={onClose}>
            <div className="bg-card dark:bg-dark-card rounded-2xl shadow-xl w-full max-w-2xl m-4 flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between p-4 border-b dark:border-slate-700">
                    <h2 className="text-xl font-bold">{t('optimalContactTiming.actions.contactNow')}</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-slate-700"><XIcon /></button>
                </div>
                <div className="p-6 space-y-4 overflow-y-auto">
                    <div className="flex justify-between items-center">
                        <p><strong>To:</strong> {donor.fullName.en}</p>
                        <div className="flex items-center gap-2 text-sm">
                            <strong>Channel:</strong>
                            <span className="flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-slate-700 rounded-md">
                                <ChannelIcon className="w-4 h-4" />
                                {donor.preferred_contact_channel || 'email'}
                            </span>
                        </div>
                    </div>
                     <div>
                        <label className="block text-sm font-medium">Subject</label>
                        <input type="text" value={subject} onChange={e => setSubject(e.target.value)} className="w-full p-2 mt-1 border rounded-md bg-gray-50 dark:bg-slate-800 dark:border-slate-600"/>
                    </div>
                     <div>
                        <label className="block text-sm font-medium">Message</label>
                        <textarea value={message} onChange={e => setMessage(e.target.value)} rows={10} className="w-full p-2 mt-1 border rounded-md bg-gray-50 dark:bg-slate-800 dark:border-slate-600"/>
                    </div>
                </div>
                <div className="px-6 py-4 bg-gray-50 dark:bg-dark-card/50 rounded-b-2xl flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-slate-700 text-sm font-semibold">{t('common.cancel')}</button>
                    <button onClick={handleSend} className="px-4 py-2 rounded-lg bg-secondary text-white text-sm font-semibold hover:bg-secondary-dark">{t('optimalContactTiming.actions.sendMessage')}</button>
                </div>
            </div>
        </div>
    );
};

export default ContactNowModal;