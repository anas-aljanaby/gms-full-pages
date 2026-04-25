
import React, { useState } from 'react';
import { useLocalization } from '../../../hooks/useLocalization';
import type { KnowledgeArticle, Language } from '../../../types';
import { XIcon } from '../../icons/GenericIcons';

interface AddKnowledgeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAdd: (articleData: Omit<KnowledgeArticle, 'id' | 'author_id' | 'author_name' | 'created_date' | 'views'>) => void;
}

const localTranslations: Record<Language, Record<string, string>> = {
    ar: {
        modalTitle: 'إضافة معرفة جديدة',
        titleLabel: 'عنوان المعرفة:',
        categoryLabel: 'التصنيف:',
        contentLabel: 'المحتوى:',
        contentPlaceholder: 'شارك معرفتك وخبرتك هنا...',
        tagsLabel: 'الكلمات المفتاحية (مفصولة بفواصل):',
        tagsPlaceholder: 'مثال: تطوع، إدارة، تدريب',
        publishButton: 'نشر المعرفة',
        draftButton: 'حفظ كمسودة',
        cancelButton: 'إلغاء',
        finance: 'المالية والمحاسبة',
        hr: 'الموارد البشرية',
        volunteer: 'إدارة التطوع',
        projects: 'إدارة المشاريع',
        fundraising: 'تطوير الأعمال',
        other: 'أخرى',
    },
    en: {
        modalTitle: 'Add New Knowledge',
        titleLabel: 'Knowledge Title:',
        categoryLabel: 'Category:',
        contentLabel: 'Content:',
        contentPlaceholder: 'Share your knowledge and expertise here...',
        tagsLabel: 'Tags (comma-separated):',
        tagsPlaceholder: 'e.g., volunteering, management, training',
        publishButton: 'Publish Knowledge',
        draftButton: 'Save as Draft',
        cancelButton: 'Cancel',
        finance: 'Finance & Accounting',
        hr: 'Human Resources',
        volunteer: 'Volunteer Management',
        projects: 'Project Management',
        fundraising: 'Fundraising',
        other: 'Other',
    },
    tr: {
        modalTitle: 'Yeni Bilgi Ekle',
        titleLabel: 'Bilgi Başlığı:',
        categoryLabel: 'Kategori:',
        contentLabel: 'İçerik:',
        contentPlaceholder: 'Bilgi ve uzmanlığınızı burada paylaşın...',
        tagsLabel: 'Etiketler (virgülle ayrılmış):',
        tagsPlaceholder: 'örn. gönüllülük, yönetim, eğitim',
        publishButton: 'Bilgiyi Yayınla',
        draftButton: 'Taslak olarak Kaydet',
        cancelButton: 'İptal',
        finance: 'Finans ve Muhasebe',
        hr: 'İnsan Kaynakları',
        volunteer: 'Gönüllü Yönetimi',
        projects: 'Proje Yönetimi',
        fundraising: 'Bağış Toplama',
        other: 'Diğer',
    },
};

const AddKnowledgeModal: React.FC<AddKnowledgeModalProps> = ({ isOpen, onClose, onAdd }) => {
    const { language, dir } = useLocalization();
    const t = (key: string) => localTranslations[language]?.[key] || localTranslations.en[key];

    const [title, setTitle] = useState('');
    const [category, setCategory] = useState('volunteer');
    const [content, setContent] = useState('');
    const [tags, setTags] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !content.trim()) {
            alert('Title and content are required.');
            return;
        }
        onAdd({
            title: { en: title, ar: title, tr: title }, // Simple mapping for now
            category: { en: category, ar: t(category), tr: category },
            content: { en: content, ar: content, tr: content },
            tags: tags.split(',').map(tag => tag.trim()).filter(Boolean),
        });
        // Reset form
        setTitle('');
        setCategory('volunteer');
        setContent('');
        setTags('');
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
                className="bg-card dark:bg-dark-card rounded-2xl shadow-xl w-full max-w-3xl m-4 flex flex-col max-h-[90vh]"
                onClick={(e) => e.stopPropagation()}
                dir={dir}
            >
                <div className="flex items-center justify-between p-4 border-b dark:border-slate-700">
                    <h2 className="text-xl font-bold text-foreground dark:text-dark-foreground">
                        {t('modalTitle')}
                    </h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-slate-700" aria-label="Close modal">
                        <XIcon />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="flex-grow contents">
                    <div className="p-6 space-y-4 overflow-y-auto">
                        <div>
                            <label className="block text-sm font-medium">{t('titleLabel')}</label>
                            <input type="text" value={title} onChange={e => setTitle(e.target.value)} required className="w-full p-2 mt-1 border rounded-md bg-gray-50 dark:bg-slate-800 dark:border-slate-700"/>
                        </div>
                         <div>
                            <label className="block text-sm font-medium">{t('categoryLabel')}</label>
                            <select value={category} onChange={e => setCategory(e.target.value)} className="w-full p-2 mt-1 border rounded-md bg-gray-50 dark:bg-slate-800 dark:border-slate-700">
                                <option value="finance">{t('finance')}</option>
                                <option value="hr">{t('hr')}</option>
                                <option value="volunteer">{t('volunteer')}</option>
                                <option value="projects">{t('projects')}</option>
                                <option value="fundraising">{t('fundraising')}</option>
                                <option value="other">{t('other')}</option>
                            </select>
                        </div>
                        <div>
                             <label className="block text-sm font-medium">{t('contentLabel')}</label>
                             <textarea 
                                value={content}
                                onChange={e => setContent(e.target.value)}
                                rows={10}
                                placeholder={t('contentPlaceholder')}
                                className="w-full p-2 mt-1 border rounded-md bg-gray-50 dark:bg-slate-800 dark:border-slate-700"
                            />
                        </div>
                         <div>
                            <label className="block text-sm font-medium">{t('tagsLabel')}</label>
                            <input type="text" value={tags} onChange={e => setTags(e.target.value)} placeholder={t('tagsPlaceholder')} className="w-full p-2 mt-1 border rounded-md bg-gray-50 dark:bg-slate-800 dark:border-slate-700"/>
                        </div>
                    </div>
                    <div className="px-6 py-4 bg-gray-50 dark:bg-dark-card/50 rounded-b-2xl flex justify-end gap-3 flex-shrink-0">
                        <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-slate-700 text-sm font-semibold">{t('cancelButton')}</button>
                        <button type="button" onClick={() => alert('Save as draft functionality coming soon!')} className="px-4 py-2 rounded-lg bg-yellow-500 text-white text-sm font-semibold hover:bg-yellow-600">{t('draftButton')}</button>
                        <button type="submit" className="px-4 py-2 rounded-lg bg-green-500 text-white text-sm font-semibold hover:bg-green-600">{t('publishButton')}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddKnowledgeModal;
