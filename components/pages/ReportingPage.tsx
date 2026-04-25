
import React, { useState, useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { useLocalization } from '../../hooks/useLocalization';
import { MOCK_PROJECTS } from '../../data/projectData';
import type { Project } from '../../types';
import { formatCurrency, formatNumber } from '../../lib/utils';
import { useTheme } from '../../hooks/useTheme';
import { ReportsIcon } from '../icons/ModuleIcons';
import ProgressRing from '../common/ProgressRing';

const SummaryCard: React.FC<{ title: string; children: React.ReactNode; className?: string }> = ({ title, children, className }) => (
    <div className={`bg-card dark:bg-dark-card rounded-2xl shadow-soft p-6 border border-gray-200 dark:border-slate-700/50 ${className || ''}`}>
        <h3 className="text-lg font-bold mb-4 text-center">{title}</h3>
        {children}
    </div>
);


const ReportingPage: React.FC = () => {
    const { t, language } = useLocalization();
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    const [selectedProjectId, setSelectedProjectId] = useState('all');

    const summaryData = useMemo(() => {
        const projectsToSummarize = selectedProjectId === 'all'
            ? MOCK_PROJECTS
            : MOCK_PROJECTS.filter(p => p.id === selectedProjectId);

        if (projectsToSummarize.length === 0) {
            return { totalBudget: 0, totalSpent: 0, tasks: { completed: 0, inProgress: 0, pending: 0 }, risks: { open: 0, inProgress: 0, total: 0 }, avgProgress: 0, budgetByType: [] };
        }

        const totalBudget = projectsToSummarize.reduce((sum, p) => sum + p.budget, 0);
        const totalSpent = projectsToSummarize.reduce((sum, p) => sum + p.spent, 0);

        const tasks = { completed: 0, inProgress: 0, pending: 0 };
        projectsToSummarize.forEach(p => {
            p.schedule.forEach(task => {
                if (task.progress === 100) tasks.completed++;
                else if (task.progress > 0) tasks.inProgress++;
                else tasks.pending++;
            });
        });
        
        const risks = { open: 0, inProgress: 0, total: 0 };
         projectsToSummarize.forEach(p => {
            p.riskManagement.riskRegister.forEach(risk => {
                if (risk.status === 'open') risks.open++;
                if (risk.status === 'in-progress') risks.inProgress++;
            });
         });
        risks.total = projectsToSummarize.reduce((sum, p) => sum + p.riskManagement.riskRegister.length, 0);
        
        const avgProgress = projectsToSummarize.reduce((sum, p) => sum + p.progress, 0) / projectsToSummarize.length;

        const budgetByType = MOCK_PROJECTS.reduce((acc, p) => {
            const typeName = t(`projects.types.${p.type}`);
            if (!acc[typeName]) {
                acc[typeName] = { budget: 0, spent: 0 };
            }
            acc[typeName].budget += p.budget;
            acc[typeName].spent += p.spent;
            return acc;
        }, {} as Record<string, { budget: number, spent: number }>);
        const budgetByTypeChartData = Object.entries(budgetByType).map(([name, values]) => ({ name, ...values }));

        return { totalBudget, totalSpent, tasks, risks, avgProgress, budgetByType: budgetByTypeChartData };

    }, [selectedProjectId, t]);

    const handleProjectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedProjectId(e.target.value);
    };

    const financialData = [{ name: t('projects.reporting.modal.budget.spent'), value: summaryData.totalSpent }, { name: t('projects.reporting.modal.budget.remaining'), value: summaryData.totalBudget - summaryData.totalSpent }];
    const taskData = [{ name: t('projects.reporting.modal.tasks.completed'), value: summaryData.tasks.completed }, { name: t('projects.reporting.modal.tasks.inProgress'), value: summaryData.tasks.inProgress }, { name: t('projects.reporting.modal.tasks.pending'), value: summaryData.tasks.pending }];
    
    const COLORS_FINANCIAL = ['#ef4444', '#22c55e'];
    const COLORS_TASKS = ['#22C55E', '#F59E0B', '#6B7280'];

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <h1 className="text-3xl font-bold text-foreground dark:text-dark-foreground flex items-center gap-3">
                    <ReportsIcon /> {t('sidebar.reports')}
                </h1>
                <select 
                    id="projectFilter" 
                    onChange={handleProjectChange}
                    className="p-2 border rounded-md bg-card dark:bg-dark-card dark:border-slate-600 min-w-[250px]"
                >
                    <option value="all">-- {t('projects.reporting.allProjects')} --</option>
                    {MOCK_PROJECTS.map(proj => (
                        <option key={proj.id} value={proj.id}>{proj.name[language]}</option>
                    ))}
                </select>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <SummaryCard title={t('projects.reporting.modal.budget.financialSummary')}>
                    <div className="h-48 w-full flex items-center justify-center">
                        <ResponsiveContainer>
                            <PieChart>
                                <Pie data={financialData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={60} label>
                                    {financialData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS_FINANCIAL[index % COLORS_FINANCIAL.length]} />)}
                                </Pie>
                                <Tooltip formatter={(value: unknown, name) => {
                                    const numericValue = Number(value);
                                    if (isNaN(numericValue)) {
                                        return [String(value), name as string];
                                    }
                                    return [formatCurrency(numericValue, language), name as string];
                                }}/>
                                <Legend iconSize={10} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </SummaryCard>
                <SummaryCard title={t('projects.reporting.modal.tasks.taskSummary')}>
                    <div className="h-48 w-full flex items-center justify-center">
                        <ResponsiveContainer>
                            <PieChart>
                                <Pie data={taskData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={60} label>
                                    {taskData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS_TASKS[index % COLORS_TASKS.length]} />)}
                                </Pie>
                                <Tooltip formatter={(value: unknown) => {
                                    const numericValue = Number(value);
                                    if (isNaN(numericValue)) {
                                        return String(value);
                                    }
                                    return formatNumber(numericValue, language);
                                }} />
                                <Legend iconSize={10} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </SummaryCard>
                <SummaryCard title={t('projects.monitoring.overallCompletion')}>
                    <div className="h-48 w-full flex items-center justify-center">
                        <ProgressRing percentage={summaryData.avgProgress} color="hsl(210, 40%, 50%)" label="Avg." size={120} />
                    </div>
                </SummaryCard>
                <SummaryCard title={t('projects.monitoring.activeRisks')}>
                    <div className="text-center flex flex-col justify-center h-48">
                        <p className="text-6xl font-bold text-red-500">{summaryData.risks.open + summaryData.risks.inProgress}</p>
                        <p className="text-sm text-gray-500">out of {formatNumber(summaryData.risks.total, language)} total risks</p>
                    </div>
                </SummaryCard>
            </div>
            <SummaryCard title="Budget vs. Spent by Project Type">
                 <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={summaryData.budgetByType} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#444" : "#ddd"} />
                            <XAxis dataKey="name" tick={{ fill: isDark ? "#fff" : "#333", fontSize: 12 }} />
                            <YAxis tickFormatter={(val) => formatCurrency(val, language)} tick={{ fill: isDark ? "#fff" : "#333" }} />
                            <Tooltip formatter={(value: unknown) => {
                                const numericValue = Number(value);
                                if (isNaN(numericValue)) {
                                    return String(value);
                                }
                                return formatCurrency(numericValue, language);
                            }} />
                            <Legend />
                            <Bar dataKey="budget" name="Total Budget" fill="#8884d8" />
                            <Bar dataKey="spent" name="Total Spent" fill="#82ca9d" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </SummaryCard>
        </div>
    );
};

export default ReportingPage;