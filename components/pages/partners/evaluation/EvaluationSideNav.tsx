import React, { useState, useMemo } from 'react';
import { Search, Star } from 'lucide-react';
import type { Partner } from '../../../../types';

interface EvaluationSideNavProps {
    partners: Partner[];
    selectedPartner: Partner;
    onSelectPartner: (partner: Partner) => void;
}

const EvaluationSideNav: React.FC<EvaluationSideNavProps> = ({ partners, selectedPartner, onSelectPartner }) => {
    const [searchTerm, setSearchTerm] = useState('');

    const sortedPartners = useMemo(() => 
        [...partners].sort((a, b) => a.name.localeCompare(b.name)), 
    [partners]);

    const filteredPartners = useMemo(() => 
        sortedPartners.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase())),
    [sortedPartners, searchTerm]);

    return (
        <div className="bg-white rounded-xl shadow-md h-full flex flex-col">
            <div className="p-4 border-b">
                <h3 className="font-bold mb-2">الشركاء</h3>
                <div className="relative">
                    <Search className="w-4 h-4 absolute top-1/2 right-3 -translate-y-1/2 text-gray-400" />
                    <input 
                        type="text"
                        placeholder="ابحث عن شريك..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full p-2 pr-10 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                </div>
            </div>
            <div className="flex-1 overflow-y-auto">
                <ul className="p-2 space-y-1">
                    {filteredPartners.map(partner => (
                        <li key={partner.id}>
                            <button 
                                onClick={() => onSelectPartner(partner)}
                                className={`w-full flex items-center gap-3 p-3 rounded-lg text-right transition-colors ${selectedPartner.id === partner.id ? 'bg-blue-100 text-blue-800' : 'hover:bg-gray-100'}`}
                            >
                                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-600 flex-shrink-0">
                                    {partner.logo}
                                </div>
                                <div className="flex-1">
                                    <p className="font-semibold">{partner.name}</p>
                                    <div className="flex items-center gap-1 text-xs text-gray-500">
                                        <Star size={12} className="text-yellow-400 fill-yellow-400" />
                                        <span>{partner.rating.toFixed(1)}</span>
                                    </div>
                                </div>
                            </button>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default EvaluationSideNav;
