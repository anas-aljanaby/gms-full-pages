
import React, { useState, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { GoogleGenAI, Type } from "@google/genai";
import { useLocalization } from '../../../hooks/useLocalization';
import { useToast } from '../../../hooks/useToast';
import type { IncubationData, Startup, Investor } from '../../../types';
import { Rocket, Mic, Trophy, Users, Bot, Star, LineChart } from 'lucide-react';
import Spinner from '../../common/Spinner';

interface IncubationDemoDayPageProps {
    incubationData: IncubationData;
}

const pitchSchedule = [
    { time: "10:00 AM", startupId: "su-1" },
    { time: "10:20 AM", startupId: "su-2" },
    { time: "10:40 AM", startupId: "su-3" },
    { time: "11:00 AM", startupId: "su-4" },
    { time: "11:20 AM", startupId: "su-5" },
];

type Score = { team: number; market: number; innovation: number; presentation: number };
type InvestmentInterest = 'No Interest' | 'Follow-up' | 'Invest';
type FullScore = {
    investorId: string;
    investorName: string;
    startupId: string;
    startupName: string;
    scores: Score;
    interest: InvestmentInterest;
    feedback: string;
};

const SliderInput: React.FC<{ label: string; value: number; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; }> = ({ label, value, onChange }) => (
    <div>
        <label className="block text-sm font-medium">{label}</label>
        <div className="flex items-center gap-2">
            <input type="range" min="1" max="10" value={value} onChange={onChange} className="w-full" />
            <span className="font-bold w-8 text-center">{value}</span>
        </div>
    </div>
);


const IncubationDemoDayPage: React.FC<IncubationDemoDayPageProps> = ({ incubationData }) => {
    const { t, language, dir } = useLocalization();
    const toast = useToast();
    const { startups, investors } = incubationData;

    const [currentPitchIndex, setCurrentPitchIndex] = useState(0);
    const [scores, setScores] = useState<Score>({ team: 5, market: 5, innovation: 5, presentation: 5 });
    const [interest, setInterest] = useState<InvestmentInterest>('Follow-up');
    const [feedback, setFeedback] = useState('');
    const [allScores, setAllScores] = useState<FullScore[]>([]);
    const [isEventOver, setIsEventOver] = useState(false);
    const [aiSummary, setAiSummary] = useState<any | null>(null);
    const [isLoadingAiSummary, setIsLoadingAiSummary] = useState(false);
    const [selectedInvestor, setSelectedInvestor] = useState<Investor>(investors[0]);

    const handleScoreChange = (field: keyof Score) => (e: React.ChangeEvent<HTMLInputElement>) => {
        setScores(prev => ({ ...prev, [field]: Number(e.target.value) }));
    };

    const handleScoreSubmit = () => {
        const currentStartup = pitchSchedule[currentPitchIndex];
        const startupName = startups.find(s => s.id === currentStartup.startupId)?.name || 'Unknown Startup';
        const newScore: FullScore = {
            investorId: selectedInvestor.id,
            investorName: selectedInvestor.name,
            startupId: currentStartup.startupId,
            startupName: startupName,
            scores,
            interest,
            feedback
        };
        setAllScores(prev => [...prev, newScore]);
        toast.showSuccess(`Score submitted for ${startupName}!`);

        setScores({ team: 5, market: 5, innovation: 5, presentation: 5 });
        setInterest('Follow-up');
        setFeedback('');

        if (currentPitchIndex < pitchSchedule.length - 1) {
            setCurrentPitchIndex(prev => prev + 1);
        } else {
            setIsEventOver(true);
        }
    };
    
    const handleGenerateReport = async () => {
        setIsLoadingAiSummary(true);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            const systemInstruction = `You are a Venture Capital analyst summarizing a startup demo day. Based on the provided scores and feedback, generate a JSON object. The JSON must contain:
1. \`top_startups\`: An array of the top 3 startups, each with \`name\`, \`average_score\`, and a \`summary\` of why they stood out.
2. \`investment_interest\`: A summary of overall investor sentiment.
3. \`key_feedback_themes\`: An array of common feedback points given to multiple startups.
Your response must be in ${language}.`;
            
            const prompt = `Scores and Feedback data: ${JSON.stringify(allScores)}`;
            
            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: prompt,
                config: { systemInstruction, responseMimeType: "application/json", responseSchema: { type: Type.OBJECT, properties: { top_startups: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, average_score: { type: Type.NUMBER }, summary: { type: Type.STRING }}}}, investment_interest: { type: Type.STRING }, key_feedback_themes: { type: Type.ARRAY, items: { type: Type.STRING }}} } }
            });
            
            const result = JSON.parse(response.text.trim());
            setAiSummary(result);
            
        } catch (e) {
            console.error("AI Report Error:", e);
            toast.showError("Failed to generate AI report.");
        } finally {
            setIsLoadingAiSummary(false);
        }
    };
    
    const currentStartup = startups.find(s => s.id === pitchSchedule[currentPitchIndex]?.startupId);

    return (
        <div data-view-id="incubation_demoday.stage" className="space-y-6" dir={dir}>
            <h1 className="text-3xl font-bold">{t('incubation.demoDay')}</h1>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-card dark:bg-dark-card p-4 rounded-xl shadow-soft border">
                        <h3 className="font-bold flex items-center gap-2 mb-2"><Users /> Invited Investors</h3>
                        <select value={selectedInvestor.id} onChange={e => setSelectedInvestor(investors.find(i => i.id === e.target.value)!)} className="w-full p-2 mb-2 border rounded-md">
                            {investors.map(inv => <option key={inv.id} value={inv.id}>{inv.name} ({inv.type})</option>)}
                        </select>
                    </div>
                    <div className="bg-card dark:bg-dark-card p-4 rounded-xl shadow-soft border">
                        <h3 className="font-bold flex items-center gap-2 mb-2"><Rocket /> Pitching Startups</h3>
                        <ul className="space-y-2">{pitchSchedule.map(p => {
                            const s = startups.find(su => su.id === p.startupId);
                            return <li key={p.startupId} className="flex items-center gap-2 text-sm p-2 bg-gray-50 rounded-md"><span>{s?.logo}</span> {s?.name}</li>
                        })}</ul>
                    </div>
                </div>

                {/* Right Column */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-card dark:bg-dark-card p-4 rounded-xl shadow-soft border">
                        <h3 className="font-bold flex items-center gap-2 mb-2"><Mic /> Pitch Schedule</h3>
                        <div className="space-y-2">{pitchSchedule.map((p, index) => (
                             <div key={p.time} className={`p-3 rounded-lg transition-colors ${index === currentPitchIndex && !isEventOver ? 'bg-primary-light' : ''}`}>
                                <span className="font-bold">{p.time}</span> - {startups.find(s => s.id === p.startupId)?.name}
                            </div>
                        ))}</div>
                    </div>

                    {!isEventOver && currentStartup && (
                         <div className="bg-card dark:bg-dark-card p-6 rounded-xl shadow-soft border">
                            <h3 className="font-bold text-xl mb-4">Live Scoring: {currentStartup.name}</h3>
                            <div className="space-y-4">
                                <SliderInput label="Team & Vision" value={scores.team} onChange={handleScoreChange('team')} />
                                <SliderInput label="Market & Business Model" value={scores.market} onChange={handleScoreChange('market')} />
                                <SliderInput label="Innovation & Scalability" value={scores.innovation} onChange={handleScoreChange('innovation')} />
                                <SliderInput label="Presentation Clarity" value={scores.presentation} onChange={handleScoreChange('presentation')} />
                            </div>
                            <div className="mt-6">
                                <h4 className="font-semibold mb-2">Investment Interest</h4>
                                <div className="flex gap-2">
                                    {(['No Interest', 'Follow-up', 'Invest'] as InvestmentInterest[]).map(opt => (
                                        <button key={opt} onClick={() => setInterest(opt)} className={`flex-1 py-2 text-sm font-semibold rounded-md ${interest === opt ? 'bg-primary text-white' : 'bg-gray-200'}`}>{opt}</button>
                                    ))}
                                </div>
                            </div>
                            <div className="mt-6">
                                <h4 className="font-semibold mb-2">Feedback / Notes</h4>
                                <textarea value={feedback} onChange={e => setFeedback(e.target.value)} rows={4} className="w-full p-2 border rounded-md" />
                            </div>
                             <button onClick={handleScoreSubmit} className="mt-4 w-full py-3 bg-secondary text-white font-bold rounded-lg hover:bg-secondary-dark">Submit Score & Next</button>
                        </div>
                    )}
                    
                    {isEventOver && (
                        <div className="bg-card dark:bg-dark-card p-6 rounded-xl shadow-soft border text-center">
                            <h3 className="font-bold text-xl mb-4">Demo Day Concluded!</h3>
                            <button onClick={handleGenerateReport} disabled={isLoadingAiSummary} className="px-6 py-3 bg-primary text-white font-semibold rounded-lg flex items-center gap-2 mx-auto disabled:bg-gray-400">
                                {isLoadingAiSummary ? <Spinner/> : <Bot/>} Generate AI Summary Report
                            </button>
                            {aiSummary && (
                                <div className="mt-6 text-start space-y-4">
                                    <div><h4 className="font-bold flex items-center gap-2"><Trophy/> Top 3 Startups</h4>{aiSummary.top_startups.map((s: any, i: number) => <div key={i} className="p-2 bg-gray-50 rounded-md mt-1">{i+1}. {s.name} (Avg Score: {s.average_score.toFixed(1)}) - {s.summary}</div>)}</div>
                                    <div><h4 className="font-bold flex items-center gap-2"><LineChart/> Investment Interest</h4><p className="text-sm p-2 bg-gray-50 rounded-md mt-1">{aiSummary.investment_interest}</p></div>
                                    <div><h4 className="font-bold flex items-center gap-2"><Star/> Key Feedback Themes</h4><ul className="list-disc list-inside text-sm p-2 bg-gray-50 rounded-md mt-1">{aiSummary.key_feedback_themes.map((theme: string, i: number) => <li key={i}>{theme}</li>)}</ul></div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default IncubationDemoDayPage;
