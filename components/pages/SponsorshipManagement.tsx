
import React, { useState, useMemo } from 'react';
import { useLocalization } from '../../hooks/useLocalization';
import { useSponsorshipData } from '../../hooks/useSponsorshipData';
import type { Student, SponsorshipStatus } from '../../types';

import SponsorshipStats from './sponsorship/SponsorshipStats';
import SponsorshipFilters from './sponsorship/SponsorshipFilters';
import StudentCard from './sponsorship/StudentCard';
// Modal imports would go here
// import AddStudentModal from './sponsorship/modals/AddStudentModal';
// import StartSponsorshipModal from './sponsorship/modals/StartSponsorshipModal';
import StudentDetailsModal from './beneficiaries/StudentDetailsModal';


const SponsorshipManagement: React.FC = () => {
    const { t } = useLocalization();
    const { students, dispatch } = useSponsorshipData();
    
    const [filters, setFilters] = useState({
        search: '',
        status: 'all' as SponsorshipStatus | 'all',
        country: 'all',
    });

    // Modal states would be managed here
    // const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    // const [isSponsorModalOpen, setIsSponsorModalOpen] = useState<Student | null>(null);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState<Student | null>(null);

    const filteredStudents = useMemo(() => {
        return students.filter(student => {
            const searchLower = filters.search.toLowerCase();
            const matchesSearch = student.personalInfo.name.en.toLowerCase().includes(searchLower) ||
                                  student.personalInfo.name.native.toLowerCase().includes(searchLower);
            const matchesStatus = filters.status === 'all' || student.status === filters.status;
            const matchesCountry = filters.country === 'all' || student.personalInfo.country === filters.country;
            return matchesSearch && matchesStatus && matchesCountry;
        });
    }, [students, filters]);

    return (
        <>
            <div className="space-y-6 animate-fade-in">
                <h1 className="text-3xl font-bold text-foreground dark:text-dark-foreground">
                    {t('sponsorship.title')}
                </h1>
                
                <SponsorshipStats students={students} />
                
                <SponsorshipFilters
                    students={students}
                    onFilterChange={setFilters}
                    onAddStudent={() => { /* setIsAddModalOpen(true) */ }}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredStudents.map(student => (
                        <StudentCard
                            key={student.id}
                            student={student}
                            onSponsorClick={() => { /* setIsSponsorModalOpen(student) */ }}
                            onManageClick={() => setIsDetailsModalOpen(student)}
                        />
                    ))}
                </div>
            </div>

            {/* Modals would be rendered here */}
            {/* {isAddModalOpen && <AddStudentModal onClose={() => setIsAddModalOpen(false)} />} */}
            {/* {isSponsorModalOpen && <StartSponsorshipModal student={isSponsorModalOpen} onClose={() => setIsSponsorModalOpen(null)} />} */}
            {isDetailsModalOpen && <StudentDetailsModal student={isDetailsModalOpen} onClose={() => setIsDetailsModalOpen(null)} />}
        </>
    );
};

export default SponsorshipManagement;
