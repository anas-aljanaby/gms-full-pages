import React, { useState } from 'react';
import { useLocalization } from '../../../hooks/useLocalization';
import type { ForumPost, ForumCategory, Language } from '../../../types';
import { XIcon } from '../../icons/GenericIcons';

interface CreatePostModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAddPost: (postData: Omit<ForumPost, 'id' | 'authorId' | 'authorName' | 'authorAvatar' | 'createdAt' | 'lastActivity' | 'replies'>) => void;
    categories: ForumCategory[];
}

const CreatePostModal: React.FC<CreatePostModalProps> = ({ isOpen, onClose, onAddPost, categories }) => {
    const { t, language, dir } = useLocalization();
    
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [categoryId, setCategoryId] = useState(categories[0]?.id || '');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !content.trim() || !categoryId) {
            alert("All fields are required.");
            return;
        }
        onAddPost({ title, content, categoryId });
        // Reset form and close
        setTitle('');
        setContent('');
        setCategoryId(categories[0]?.id || '');
        onClose();
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
                dir={dir}
            >
                <div className="flex items-center justify-between p-4 border-b dark:border-slate-700">
                    <h2 className="text-xl font-bold text-foreground dark:text-dark-foreground">
                        {t('forum.create_post')}
                    </h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-slate-700" aria-label="Close modal">
                        <XIcon />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="flex-grow contents">
                    <div className="p-6 space-y-4 overflow-y-auto">
                        <div>
                            <label className="block text-sm font-medium">{t('forum.post_title')}</label>
                            <input type="text" value={title} onChange={e => setTitle(e.target.value)} required className="w-full p-2 mt-1 border rounded-md bg-gray-50 dark:bg-slate-800 dark:border-slate-700"/>
                        </div>
                        <div>
                            <label className="block text-sm font-medium">{t('forum.category')}</label>
                            <select value={categoryId} onChange={e => setCategoryId(e.target.value)} required className="w-full p-2 mt-1 border rounded-md bg-gray-50 dark:bg-slate-800 dark:border-slate-700">
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.name[language]}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                             <label className="block text-sm font-medium">{t('forum.content')}</label>
                             <textarea 
                                value={content}
                                onChange={e => setContent(e.target.value)}
                                rows={10}
                                required
                                placeholder={t('forum.content_placeholder')}
                                className="w-full p-2 mt-1 border rounded-md bg-gray-50 dark:bg-slate-800 dark:border-slate-700"
                            />
                        </div>
                    </div>
                    <div className="px-6 py-4 bg-gray-50 dark:bg-dark-card/50 rounded-b-2xl flex justify-end gap-3 flex-shrink-0">
                        <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-slate-700 text-sm font-semibold">{t('common.cancel')}</button>
                        <button type="submit" className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary-dark">{t('forum.publish_post')}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreatePostModal;