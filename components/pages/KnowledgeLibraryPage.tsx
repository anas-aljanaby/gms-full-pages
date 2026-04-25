
import React, { useState, useMemo } from 'react';
import { useLocalization } from '../../hooks/useLocalization';
import { useKnowledgeData } from '../../hooks/useKnowledgeData';
import type { KnowledgeArticle, KnowledgeUserPoints, Language } from '../../types';
import { formatDate, formatNumber } from '../../lib/utils';
import { KnowledgeIcon } from '../icons/ModuleIcons';
import { Search, PlusCircle, Award } from 'lucide-react';
import Spinner from '../common/Spinner';
import AddKnowledgeModal from './knowledge_library/AddKnowledgeModal';

// Local translations to avoid modifying global i18n files
const localTranslations: Record<Language, Record<string, string>> = {
    ar: {
        title: 'مكتبة المعرفة المؤسسية',
        description: 'مركز مركزي لتبادل المقالات وأفضل الممارسات والمعرفة المؤسسية.',
        searchPlaceholder: 'ابحث في المقالات...',
        allCategories: 'كل الفئات',
        newArticle: 'مقال جديد',
        author: 'الكاتب',
        date: 'التاريخ',
        views: 'المشاهدات',
        readMore: 'اقرأ المزيد',
        topContributors: 'أبرز المساهمين',
        contributions: 'مساهمات',
        points: 'نقطة',
    },
    en: {
        title: 'Institutional Knowledge Library',
        description: 'A central hub for sharing articles, best practices, and institutional knowledge.',
        searchPlaceholder: 'Search articles...',
        allCategories: 'All Categories',
        newArticle: 'New Article',
        author: 'Author',
        date: 'Date',
        views: 'Views',
        readMore: 'Read More',
        topContributors: 'Top Contributors',
        contributions: 'Contributions',
        points: 'Points',
    },
    tr: {
        title: 'Kurumsal Bilgi Kütüphanesi',
        description: 'Makaleleri, en iyi uygulamaları ve kurumsal bilgileri paylaşmak için merkezi bir merkez.',
        searchPlaceholder: 'Makalelerde ara...',
        allCategories: 'Tüm Kategoriler',
        newArticle: 'Yeni Makale',
        author: 'Yazar',
        date: 'Tarih',
        views: 'Görüntüleme',
        readMore: 'Devamını Oku',
        topContributors: 'En Çok Katkıda Bulunanlar',
        contributions: 'Katkılar',
        points: 'Puan',
    },
};


const ArticleCard: React.FC<{ article: KnowledgeArticle }> = ({ article }) => {
    const { language } = useLocalization();
    const t = (key: string) => localTranslations[language]?.[key] || localTranslations.en[key];

    return (
        <div className="bg-card dark:bg-dark-card p-6 rounded-2xl shadow-soft border dark:border-slate-700/50 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
            <span className="text-xs font-semibold px-3 py-1 bg-primary-light dark:bg-primary/20 text-primary-dark dark:text-secondary-light rounded-full">
                {article.category[language] || article.category.en}
            </span>
            <h3 className="font-bold text-xl mt-3 text-foreground dark:text-dark-foreground">{article.title[language] || article.title.en}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 h-12 overflow-hidden">
                {article.content[language] || article.content.en}
            </p>
            <div className="mt-4 pt-4 border-t dark:border-slate-700 flex justify-between items-center text-xs text-gray-500">
                <div>
                    <p><strong>{t('author')}:</strong> {article.author_name}</p>
                    <p><strong>{t('date')}:</strong> {formatDate(article.created_date, language)}</p>
                </div>
                <div className="text-right">
                    <p><strong>{t('views')}:</strong> {formatNumber(article.views, language)}</p>
                </div>
            </div>
        </div>
    );
};

const TopContributors: React.FC<{ contributors: KnowledgeUserPoints[] }> = ({ contributors }) => {
    const { language } = useLocalization();
    const t = (key: string) => localTranslations[language]?.[key] || localTranslations.en[key];
    
    const sortedContributors = [...contributors].sort((a, b) => b.total_points - a.total_points);

    return (
        <div className="bg-card dark:bg-dark-card p-6 rounded-2xl shadow-soft border dark:border-slate-700/50">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Award className="text-yellow-500"/> {t('topContributors')}</h3>
            <ul className="space-y-4">
                {sortedContributors.map((user, index) => (
                    <li key={user.user_id} className="flex items-center gap-4">
                        <span className="font-bold text-lg w-6">{index + 1}.</span>
                        <img src={user.avatar} alt={user.user_name} className="w-10 h-10 rounded-full" />
                        <div className="flex-grow">
                            <p className="font-semibold">{user.user_name}</p>
                            <p className="text-xs text-gray-500">{user.contributions} {t('contributions')}</p>
                        </div>
                        <div className="font-bold text-primary dark:text-secondary">{formatNumber(user.total_points, language)} <span className="text-xs">{t('points')}</span></div>
                    </li>
                ))}
            </ul>
        </div>
    );
};


const KnowledgeLibraryPage: React.FC = () => {
    const { language, dir } = useLocalization();
    const { knowledgeData, isLoading, setKnowledgeData } = useKnowledgeData();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    
    const t = (key: string) => localTranslations[language]?.[key] || localTranslations.en[key];

    const handleAddArticle = (articleData: Omit<KnowledgeArticle, 'id' | 'author_id' | 'author_name' | 'created_date' | 'views'>) => {
        const newArticle: KnowledgeArticle = {
            ...articleData,
            id: `kl-${Date.now()}`,
            author_id: 'user-current', // Placeholder for current user
            author_name: 'Current User',
            created_date: new Date().toISOString(),
            views: 0,
        };
        setKnowledgeData(prevData => ({
            ...prevData,
            articles: [newArticle, ...prevData.articles]
        }));
        setIsAddModalOpen(false);
    };

    const categories = useMemo(() => {
        const allCats = knowledgeData.articles.map(a => a.category[language] || a.category.en);
        return ['all', ...Array.from(new Set(allCats))];
    }, [knowledgeData.articles, language]);

    const filteredArticles = useMemo(() => {
        return knowledgeData.articles.filter(article => {
            const title = article.title[language] || article.title.en;
            const content = article.content[language] || article.content.en;
            const category = article.category[language] || article.category.en;
            
            const matchesCategory = selectedCategory === 'all' || category === selectedCategory;
            const matchesSearch = title.toLowerCase().includes(searchTerm.toLowerCase()) || content.toLowerCase().includes(searchTerm.toLowerCase());
            
            return matchesCategory && matchesSearch;
        }).sort((a, b) => new Date(b.created_date).getTime() - new Date(a.created_date).getTime());
    }, [knowledgeData.articles, searchTerm, selectedCategory, language]);

    if (isLoading) {
        return <div className="flex h-full w-full items-center justify-center"><Spinner text="Loading Knowledge Library..."/></div>;
    }

    return (
        <>
            <AddKnowledgeModal 
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onAdd={handleAddArticle}
            />
            <div className="space-y-6 animate-fade-in" dir={dir}>
                <div className="text-center">
                     <div className="inline-block p-4 bg-primary-light dark:bg-primary/20 rounded-full mb-4">
                        <KnowledgeIcon className="w-12 h-12 text-primary dark:text-secondary" />
                    </div>
                    <h1 className="text-4xl font-bold text-foreground dark:text-dark-foreground">{t('title')}</h1>
                    <p className="mt-2 max-w-2xl mx-auto text-gray-500 dark:text-gray-400">{t('description')}</p>
                </div>
                
                {/* Controls */}
                <div className="p-4 bg-card dark:bg-dark-card rounded-xl shadow-soft border dark:border-slate-700/50">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-grow">
                            <Search className="w-5 h-5 absolute top-1/2 left-3 -translate-y-1/2 text-gray-400 rtl:left-auto rtl:right-3" />
                            <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder={t('searchPlaceholder')} className="w-full py-2 pl-10 pr-4 rtl:pr-10 rtl:pl-4 border rounded-lg bg-gray-50 dark:bg-slate-800 dark:border-slate-600"/>
                        </div>
                        <select value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)} className="p-2 border rounded-lg bg-gray-50 dark:bg-slate-800 dark:border-slate-600">
                            {categories.map(cat => <option key={cat} value={cat}>{cat === 'all' ? t('allCategories') : cat}</option>)}
                        </select>
                        <button onClick={() => setIsAddModalOpen(true)} className="px-4 py-2 bg-secondary text-white rounded-lg flex items-center justify-center gap-2 font-semibold">
                            <PlusCircle size={18}/> {t('newArticle')}
                        </button>
                    </div>
                </div>

                {/* Main Content */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        {filteredArticles.map(article => <ArticleCard key={article.id} article={article} />)}
                    </div>
                    <div className="lg:col-span-1">
                        <TopContributors contributors={knowledgeData.points} />
                    </div>
                </div>
            </div>
        </>
    );
};

export default KnowledgeLibraryPage;
