import React, { useState } from 'react';
import { useLocalization } from '../../hooks/useLocalization';
import { ShariaComplianceIcon } from '../icons/ModuleIcons';
import Tabs from '../common/Tabs';
import BoardMembersView from './sharia_board/BoardMembersView';
import MeetingsView from './sharia_board/MeetingsView';
import BoardPortalView from './sharia_board/BoardPortalView';

const ShariaBoardManagementPage: React.FC = () => {
    const { t } = useLocalization();
    const [activeTab, setActiveTab] = useState('portal');

    const tabs = [
        { id: 'portal', label: t('sharia.board.tabs.portal') },
        { id: 'meetings', label: t('sharia.board.tabs.meetings') },
        { id: 'members', label: t('sharia.board.tabs.members') },
    ];

    const renderContent = () => {
        switch(activeTab) {
            case 'members':
                return <BoardMembersView />;
            case 'meetings':
                return <MeetingsView />;
            case 'portal':
                return <BoardPortalView />;
            default:
                 return <div className="p-8 text-center bg-card dark:bg-dark-card rounded-lg">{t('placeholder.underConstruction')}</div>;
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <h1 className="text-3xl font-bold text-foreground dark:text-dark-foreground flex items-center gap-3">
                <ShariaComplianceIcon /> {t('sharia.board.title')}
            </h1>
            
            <Tabs tabs={tabs} activeTab={activeTab} onTabClick={setActiveTab} />
            
            <div className="mt-6">
                {renderContent()}
            </div>
        </div>
    );
};

export default ShariaBoardManagementPage;