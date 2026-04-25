import React, { useState, useMemo } from 'react';
import { useLocalization } from '../../../hooks/useLocalization';
import { formatNumber } from '../../../lib/utils';
import { Users, User, DollarSign, Handshake, Search, PlusCircle, Edit, Trash2 } from 'lucide-react';

// --- TYPES ---
type StakeholderRole = 'Mentor' | 'Investor' | 'Corporate Partner' | 'University Partner' | 'Expert';

interface IncubationStakeholder {
  id: string;
  name: string;
  role: StakeholderRole;
  relatedProgram: string;
  contact: string;
  notes: string;
  avatar: string;
}

// --- MOCK DATA ---
const MOCK_STAKEHOLDERS: IncubationStakeholder[] = [
    { id: 'mentor-1', name: 'Layla Ahmed', role: 'Mentor', relatedProgram: 'EduGrowth, AgriConnect', contact: 'layla.mentor@example.com', notes: 'Marketing specialist, great with pitch decks.', avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=200&auto=format&fit=crop' },
    { id: 'mentor-2', name: 'Omar Hassan', role: 'Mentor', relatedProgram: 'FinHealth', contact: 'omar.mentor@example.com', notes: 'Finance expert, helps with financial modeling.', avatar: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?q=80&w=200&auto=format&fit=crop' },
    { id: 'inv-1', name: 'Al-Khair Fund', role: 'Investor', relatedProgram: 'AgriConnect, EduGrowth', contact: 'contact@alkhair.vc', notes: 'VC Firm interested in EdTech and AgriTech.', avatar: 'https://picsum.photos/seed/alkhair/100/100' },
    { id: 'inv-2', name: 'Future Angels', role: 'Investor', relatedProgram: 'AgriConnect, Artisan Hub', contact: 'pitch@futureangels.net', notes: 'Angel Network with a focus on social impact.', avatar: 'https://picsum.photos/seed/futureangels/100/100' },
    { id: 'partner-1', name: 'Tech University', role: 'University Partner', relatedProgram: 'Cohort 2025-A', contact: 'partnership@techu.edu', notes: 'Provides technical workshops and access to labs.', avatar: 'https://picsum.photos/seed/techu/100/100' },
    { id: 'partner-2', name: 'Innovate Corp', role: 'Corporate Partner', relatedProgram: 'Demo Day Sponsor', contact: 'social@innovate.com', notes: 'Sponsors the annual demo day event and provides corporate mentorship.', avatar: 'https://picsum.photos/seed/innovatecorp/100/100' },
    { id: 'expert-1', name: 'Dr. Kenan Yilmaz', role: 'Expert', relatedProgram: 'AgriTech Startups', contact: 'kenan.y@university.edu.tr', notes: 'Consultant for AgriConnect on sustainable farming.', avatar: 'https://images.unsplash.com/photo-1520409364224-63400afe26e5?q=80&w=200&auto=format&fit=crop' },
];

// --- SUB-COMPONENTS ---
const KpiCard: React.FC<{ title: string; value: number; icon: React.ReactNode }> = ({ title, value, icon }) => {
    const { language } = useLocalization();
    return (
        <div className="bg-card dark:bg-dark-card/50 p-4 rounded-xl shadow-soft border dark:border-slate-700/50 flex items-center gap-4">
            <div className="p-3 bg-primary-light dark:bg-primary/20 text-primary dark:text-secondary rounded-lg">{icon}</div>
            <div>
                <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400">{title}</h4>
                <p className="text-3xl font-bold text-foreground dark:text-dark-foreground">{formatNumber(value, language)}</p>
            </div>
        </div>
    );
};

const RoleBadge: React.FC<{ role: StakeholderRole }> = ({ role }) => {
    const { t } = useLocalization();
    const roleKey = role.replace(/ /g, '');
    const styles: Record<StakeholderRole, string> = {
        'Mentor': 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300',
        'Investor': 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300',
        'Corporate Partner': 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300',
        'University Partner': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-300',
        'Expert': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300',
    };
    return (
        <span className={`px-2 py-1 text-xs font-semibold rounded-full whitespace-nowrap ${styles[role]}`}>
            {t(`incubation_stakeholders.roles.${roleKey}`)}
        </span>
    );
};

// --- MAIN COMPONENT ---
const IncubationStakeholdersPage: React.FC = () => {
  const { t, language, dir } = useLocalization();
  const [stakeholders] = useState<IncubationStakeholder[]>(MOCK_STAKEHOLDERS);
  const [searchTerm, setSearchTerm] = useState('');

  const stats = useMemo(() => ({
      total: stakeholders.length,
      mentors: stakeholders.filter(s => s.role === 'Mentor').length,
      investors: stakeholders.filter(s => s.role === 'Investor').length,
      partners: stakeholders.filter(s => s.role.includes('Partner')).length,
  }), [stakeholders]);

  const filteredStakeholders = useMemo(() => {
    return stakeholders.filter(s => 
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.role.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [stakeholders, searchTerm]);

  return (
    <div className="space-y-6 animate-fade-in" dir={dir}>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <h1 className="text-3xl font-bold text-foreground dark:text-dark-foreground">{t('incubation_stakeholders.title')}</h1>
             <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-dark rounded-lg">
                <PlusCircle size={18} /> {t('incubation_stakeholders.add_stakeholder')}
            </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <KpiCard title={t('incubation_stakeholders.kpi_total')} value={stats.total} icon={<Users />} />
            <KpiCard title={t('incubation_stakeholders.kpi_mentors')} value={stats.mentors} icon={<User />} />
            <KpiCard title={t('incubation_stakeholders.kpi_investors')} value={stats.investors} icon={<DollarSign />} />
            <KpiCard title={t('incubation_stakeholders.kpi_partners')} value={stats.partners} icon={<Handshake />} />
        </div>

        <div className="bg-card dark:bg-dark-card rounded-xl shadow-soft overflow-hidden border dark:border-slate-700/50">
            <div className="p-4 border-b dark:border-slate-700">
                 <div className="relative max-w-sm">
                    <Search className="w-4 h-4 absolute top-1/2 left-3 -translate-y-1/2 text-gray-400 rtl:left-auto rtl:right-3" />
                    <input 
                        type="text" 
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        placeholder={t('incubation_stakeholders.search_placeholder')}
                        className="w-full py-2 pl-10 pr-4 rtl:pr-10 rtl:pl-4 border rounded-lg bg-gray-50 dark:bg-slate-800 dark:border-slate-600"
                    />
                </div>
            </div>
            <div className="overflow-x-auto" data-view-id="incubation_stakeholders.table">
                <table className="w-full text-sm text-start">
                    <thead className="text-xs text-gray-500 dark:text-gray-400 uppercase bg-gray-50 dark:bg-dark-card/50">
                        <tr>
                            <th className="p-4">{t('incubation_stakeholders.table.name')}</th>
                            <th className="p-4">{t('incubation_stakeholders.table.role')}</th>
                            <th className="p-4">{t('incubation_stakeholders.table.relatedProgram')}</th>
                            <th className="p-4">{t('incubation_stakeholders.table.contact')}</th>
                            <th className="p-4">{t('incubation_stakeholders.table.notes')}</th>
                            <th className="p-4">{t('incubation_stakeholders.table.actions')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredStakeholders.map(s => (
                            <tr key={s.id} className="border-t dark:border-slate-700">
                                <td className="p-4">
                                    <div className="flex items-center gap-3">
                                        <img src={s.avatar} alt={s.name} className="w-10 h-10 rounded-full" />
                                        <span className="font-bold text-foreground dark:text-dark-foreground">{s.name}</span>
                                    </div>
                                </td>
                                <td className="p-4"><RoleBadge role={s.role} /></td>
                                <td className="p-4 text-foreground dark:text-dark-foreground">{s.relatedProgram}</td>
                                <td className="p-4"><a href={`mailto:${s.contact}`} className="text-primary hover:underline">{s.contact}</a></td>
                                <td className="p-4 text-gray-600 dark:text-gray-400 max-w-xs truncate">{s.notes}</td>
                                <td className="p-4">
                                    <div className="flex gap-2">
                                        <button className="p-2 hover:bg-gray-100 rounded-full"><Edit size={16}/></button>
                                        <button className="p-2 hover:bg-red-100 text-red-500 rounded-full"><Trash2 size={16}/></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
  );
};

export default IncubationStakeholdersPage;
