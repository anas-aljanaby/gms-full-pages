import React, { useState } from 'react';
import { useLocalization } from '../../hooks/useLocalization';
import type { Language } from '../../types';
import { PlusCircle } from 'lucide-react';

// Local translations to avoid modifying global i1n files
const localTranslations: Record<Language, Record<string, string>> = {
    ar: {
        title: '➕ إضافة معرفة جديدة',
        titleLabel: 'عنوان المعرفة',
        categoryLabel: 'التصنيف',
        contentLabel: 'المحتوى',
        contentPlaceholder: 'شارك معرفتك وخبرتك هنا...',
        tagsLabel: 'الكلمات المفتاحية (مفصولة بفواصل)',
        tagsPlaceholder: 'مثال: تطوع، إدارة، تدريب',
        publishButton: 'نشر المعرفة',
        draftButton: 'حفظ كمسودة',
        finance: 'المالية والمحاسبة',
        hr: 'الموارد البشرية',
        volunteer: 'إدارة التطوع',
        projects: 'إدارة المشاريع',
        fundraising: 'تطوير الأعمال',
        other: 'أخرى',
    },
    en: {
        title: '➕ Add New Knowledge',
        titleLabel: 'Knowledge Title',
        categoryLabel: 'Category',
        contentLabel: 'Content',
        contentPlaceholder: 'Share your knowledge and expertise here...',
        tagsLabel: 'Tags (comma-separated)',
        tagsPlaceholder: 'e.g., volunteering, management, training',
        publishButton: 'Publish Knowledge',
        draftButton: 'Save as Draft',
        finance: 'Finance & Accounting',
        hr: 'Human Resources',
        volunteer: 'Volunteer Management',
        projects: 'Project Management',
        fundraising: 'Fundraising',
        other: 'Other',
    },
    tr: {
        title: '➕ Yeni Bilgi Ekle',
        titleLabel: 'Bilgi Başlığı',
        categoryLabel: 'Kategori',
        contentLabel: 'İçerik',
        contentPlaceholder: 'Bilgi ve uzmanlığınızı burada paylaşın...',
        tagsLabel: 'Etiketler (virgülle ayrılmış)',
        tagsPlaceholder: 'örn. gönüllülük, yönetim, eğitim',
        publishButton: 'Bilgiyi Yayınla',
        draftButton: 'Taslak olarak Kaydet',
        finance: 'Finans ve Muhasebe',
        hr: 'İnsan Kaynakları',
        volunteer: 'Gönüllü Yönetimi',
        projects: 'Proje Yönetimi',
        fundraising: 'Bağış Toplama',
        other: 'Diğer',
    },
};


const AddKnowledgePage: React.FC = () => {
    const { language, dir } = useLocalization();
    const t = (key: string) => localTranslations[language]?.[key] || localTranslations.en[key];

    const [title, setTitle] = useState('');
    const [category, setCategory] = useState('volunteer');
    const [content, setContent] = useState('');
    const [tags, setTags] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log({ title, category, content, tags });
        // In a real app, this would dispatch an action to save the data
    };

    return (
        <div className="max-w-4xl mx-auto animate-fade-in" dir={dir}>
            <h1 className="text-3xl font-bold mb-6 text-foreground dark:text-dark-foreground">{t('title')}</h1>
            <form onSubmit={handleSubmit} className="bg-card dark:bg-dark-card p-6 rounded-2xl shadow-soft border dark:border-slate-700/50 space-y-6">
                <div>
                    <label htmlFor="knowledge-title" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">{t('titleLabel')}</label>
                    <input
                        id="knowledge-title"
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                        className="w-full p-2 border rounded-md bg-gray-50 dark:bg-slate-800 dark:border-slate-600 focus:ring-primary focus:border-primary"
                    />
                </div>

                <div>
                    <label htmlFor="knowledge-category" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">{t('categoryLabel')}</label>
                    <select
                        id="knowledge-category"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full p-2 border rounded-md bg-gray-50 dark:bg-slate-800 dark:border-slate-600 focus:ring-primary focus:border-primary"
                    >
                        <option value="finance">{t('finance')}</option>
                        <option value="hr">{t('hr')}</option>
                        <option value="volunteer">{t('volunteer')}</option>
                        <option value="projects">{t('projects')}</option>
                        <option value="fundraising">{t('fundraising')}</option>
                        <option value="other">{t('other')}</option>
                    </select>
                </div>

                <div>
                    <label htmlFor="knowledge-content" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">{t('contentLabel')}</label>
                    <textarea
                        id="knowledge-content"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        rows={10}
                        required
                        placeholder={t('contentPlaceholder')}
                        className="w-full p-2 border rounded-md bg-gray-50 dark:bg-slate-800 dark:border-slate-600 focus:ring-primary focus:border-primary"
                    />
                </div>

                <div>
                    <label htmlFor="knowledge-tags" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">{t('tagsLabel')}</label>
                    <input
                        id="knowledge-tags"
                        type="text"
                        value={tags}
                        onChange={(e) => setTags(e.target.value)}
                        placeholder={t('tagsPlaceholder')}
                        className="w-full p-2 border rounded-md bg-gray-50 dark:bg-slate-800 dark:border-slate-600 focus:ring-primary focus:border-primary"
                    />
                </div>

                <div className="flex justify-end gap-4 pt-4 border-t dark:border-slate-700">
                    <button type="button" className="px-6 py-2 text-sm font-semibold border rounded-lg hover:bg-gray-100 dark:border-slate-600 dark:hover:bg-slate-700">
                        {t('draftButton')}
                    </button>
                    <button type="submit" className="px-6 py-2 text-sm font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 flex items-center gap-2">
                        <PlusCircle size={18} /> {t('publishButton')}
                    </button>
                </div>
            </form>
        </div>
    );
};
export default AddKnowledgePage;
