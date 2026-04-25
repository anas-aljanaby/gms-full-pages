
import React, { useState, useEffect } from 'react';
import AiCard from './AiCard';
import { SmartSearchIcon } from '../../icons/AiIcons';
import { SearchIcon } from '../../icons/GenericIcons';
import Spinner from '../../common/Spinner';
import { MOCK_DONORS } from '../../../data/mockData';
import KanbanCard from '../donors/KanbanCard';
import { useLocalization } from '../../../hooks/useLocalization';

const SmartSearch = () => {
    const { t } = useLocalization();
    const [query, setQuery] = useState('');
    const [debouncedQuery, setDebouncedQuery] = useState('');
    const [results, setResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedQuery(query);
        }, 500); // 500ms debounce delay

        return () => {
            clearTimeout(handler);
        };
    }, [query]);

    useEffect(() => {
        if (debouncedQuery.trim()) {
            handleSearch(debouncedQuery);
        } else {
            setResults([]);
            setHasSearched(false);
        }
    }, [debouncedQuery]);

    const handleSearch = (currentQuery: string) => {
        setLoading(true);
        setHasSearched(true);
        
        // Simulate API call to a semantic search backend
        setTimeout(() => {
            const queryLower = currentQuery.toLowerCase();
            const filteredResults = MOCK_DONORS.filter(d => 
                d.name.toLowerCase().includes(queryLower) ||
                d.country.toLowerCase().includes(queryLower) ||
                d.email.toLowerCase().includes(queryLower)
            );
            setResults(filteredResults);
            setLoading(false);
        }, 1000);
    };

    const renderResults = () => {
        if (loading) {
            return <Spinner text={t('ai_automation.smart_search.loading')} className="py-16" />;
        }

        if (!hasSearched) {
            return null; // Don't show anything before the first search
        }

        if (results.length > 0) {
            return (
                <AiCard title={t('ai_automation.smart_search.resultsTitle', { count: String(results.length) })} icon={<SmartSearchIcon className="w-6 h-6" />}>
                     <p className="text-sm text-gray-500 mb-4">{t('ai_automation.smart_search.showingResultsFor', { query: debouncedQuery })}</p>
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                         {results.map(donor => (
                             <KanbanCard key={donor.id} donor={donor} dispatch={() => {}} />
                         ))}
                     </div>
                </AiCard>
            );
        }

        return (
            <div className="text-center p-16 bg-card dark:bg-dark-card rounded-2xl shadow-soft">
                <p className="text-xl font-semibold mb-2">{t('ai_automation.smart_search.noResultsFound')}</p>
                <p className="text-gray-500">{t('ai_automation.smart_search.tryDifferentQuery')}</p>
            </div>
        );
    }


    return (
        <div className="space-y-6">
            <AiCard title={t('ai_automation.smart_search.title')} icon={<SmartSearchIcon className="w-6 h-6" />}>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                        <SearchIcon />
                    </div>
                    <input
                        type="text"
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        placeholder={t('ai_automation.smart_search.searchPlaceholder')}
                        className="w-full p-4 pl-12 text-lg border-2 rounded-full bg-gray-50 dark:bg-slate-800 dark:border-slate-600 focus:ring-primary focus:border-primary"
                    />
                </div>
            </AiCard>
            
            {renderResults()}
        </div>
    );
};

export default SmartSearch;
