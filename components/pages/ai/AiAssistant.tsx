
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, Type, FunctionDeclaration, FunctionCallPart } from "@google/genai";
import { useLocalization } from '../../../hooks/useLocalization';
import { useToast } from '../../../hooks/useToast';
import { SparklesIcon } from '../../icons/GenericIcons';
import { MicrophoneIcon } from '../../icons/AiIcons';
import { SIDEBAR_MODULES } from '../../../constants';
import type { IndividualDonor, InstitutionalDonor, Beneficiary, Role, LeadershipData, Project, HrData, GamificationData, GrcData, KnowledgeData } from '../../../types';
import { MOCK_KNOWLEDGE_DATA } from '../../../data/knowledgeData';

// --- TYPES & INTERFACES ---
interface FileData { name: string; size: number; }
interface Message {
    id: number;
    sender: 'user' | 'ai' | 'system';
    text?: string;
    suggestions?: string[];
    file?: FileData;
    timestamp: string;
    functionCall?: FunctionCallPart;
}
interface SpeechRecognition extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  onstart: () => void;
  onend: () => void;
  onerror: (event: any) => void;
  onresult: (event: any) => void;
}
declare global {
    interface Window {
        SpeechRecognition: { new(): SpeechRecognition; };
        webkitSpeechRecognition: { new(): SpeechRecognition; };
    }
}

interface AiAssistantProps {
    donors: IndividualDonor[];
    beneficiaries: Beneficiary[];
    role: Role;
    leadershipData: LeadershipData;
    projects: Project[];
    setActiveModule: (module: string) => void;
    institutionalDonors: InstitutionalDonor[];
    hrData: HrData;
    gamificationData: GamificationData;
    grcData: GrcData;
    knowledgeData: KnowledgeData;
}

// --- ICONS (local to component) ---
const SendIcon: React.FC<{className?: string}> = ({className}) => (<svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>);
const PaperclipIcon: React.FC<{className?: string}> = ({className}) => (<svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"></path></svg>);


// --- MARKDOWN RENDERER ---
const MarkdownRenderer: React.FC<{ content: string }> = ({ content }) => {
    const parts = content.split(/(\n\|.*\|)/g).filter(Boolean);

    return (
        <div>
            {parts.map((part, index) => {
                if (part.trim().startsWith('\n|') && part.includes('|')) {
                    const lines = part.trim().split('\n');
                    const headers = lines[0].split('|').map(h => h.trim()).filter(Boolean);
                    const rows = lines.slice(2).map(line => line.split('|').map(cell => cell.trim()).filter(Boolean));

                    if (headers.length === 0 || rows.length === 0) return <p key={index} className="text-sm" dangerouslySetInnerHTML={{ __html: part.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br />') }} />;

                    return (
                         <div key={index} className="overflow-x-auto my-2 bg-white/50 dark:bg-slate-800/50 rounded-lg">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-gray-500 dark:text-gray-400 uppercase">
                                    <tr>{headers.map((h, i) => <th key={i} scope="col" className="px-4 py-2">{h}</th>)}</tr>
                                </thead>
                                <tbody>
                                    {rows.map((row, i) => (
                                        <tr key={i} className="border-t dark:border-slate-700">
                                            {row.map((cell, j) => <td key={j} className="px-4 py-2 whitespace-nowrap">{cell}</td>)}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    );
                }
                return <p key={index} className="text-sm" dangerouslySetInnerHTML={{ __html: part.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br />') }} />;
            })}
        </div>
    );
};


// --- MAIN COMPONENT ---
const AiAssistant: React.FC<AiAssistantProps> = (props) => {
    const { donors, beneficiaries, role, leadershipData, projects, setActiveModule, institutionalDonors, hrData, gamificationData, grcData, knowledgeData } = props;
    const { t, language } = useLocalization();
    const toast = useToast();

    const getInitialMessage = (): Message => ({
        id: Date.now(),
        sender: 'ai',
        text: t('ai_automation.ai_assistant.initialGreeting'),
        suggestions: Object.values(t('ai_automation.ai_assistant.initialSuggestions', { returnObjects: true }) || {}),
        timestamp: new Date().toISOString(),
    });

    const [messages, setMessages] = useState<Message[]>([getInitialMessage()]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [micError, setMicError] = useState<string | null>(null);
    const recognitionRef = useRef<SpeechRecognition | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [executedFunctionCalls, setExecutedFunctionCalls] = useState<Set<number>>(new Set());


    const scrollToBottom = () => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); };
    useEffect(scrollToBottom, [messages, isTyping]);
    
    useEffect(() => {
        const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognitionAPI) {
            setMicError(t('ai_automation.ai_assistant.micNotSupported'));
            return;
        }
        
        const recognition = new SpeechRecognitionAPI();
        recognition.continuous = false;
        recognition.interimResults = true;
        
        recognition.onstart = () => setIsListening(true);
        recognition.onend = () => setIsListening(false);
        recognition.onerror = (event) => {
            if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
                setMicError(t('ai_automation.ai_assistant.micPermissionDenied'));
            }
            setIsListening(false);
        };
        recognition.onresult = (event) => {
            const transcript = Array.from(event.results)
                .map(result => result[0])
                .map(result => result.transcript)
                .join('');
            setInput(transcript);
        };
        
        recognitionRef.current = recognition;
    }, [t]);

    const handleListen = () => {
        if (!recognitionRef.current) return;
        if (isListening) {
            recognitionRef.current.stop();
            return;
        }
        setMicError(null);
        const langCode = { en: 'en-US', ar: 'ar-SA', tr: 'tr-TR' }[language];
        recognitionRef.current.lang = langCode;
        try {
            recognitionRef.current.start();
        } catch (e) {
            console.error("Speech recognition start error:", e);
        }
    };

    const addMessage = (message: Omit<Message, 'id' | 'timestamp'>) => {
        setMessages(prev => [...prev, { ...message, id: Date.now(), timestamp: new Date().toISOString() }]);
    };

    const processUserMessage = async (text: string, file?: File): Promise<Omit<Message, 'id' | 'timestamp'>> => {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

        const knowledgeContext = knowledgeData.articles.map(article => ({
            id: article.id,
            title: article.title[language] || article.title.en,
            content: (article.content[language] || article.content.en).substring(0, 200) + '...'
        }));
        
        const donorContext = donors.map(d => ({ name: d.fullName[language] || d.fullName.en, country: d.country, totalDonated: d.totalDonations, lastContact: d.lastDonationDate, category: d.donorCategory }));
        const institutionalDonorContext = institutionalDonors.map(d => ({ name: d.organizationName[language] || d.organizationName.en, type: d.type, country: d.country, totalGrants: d.totalGrantsAwarded, focus: d.focusAreas }));
        const beneficiaryContext = beneficiaries.map(b => ({ name: b.name, country: b.country, type: b.type, beneficiaryType: b.beneficiaryType }));
        const hrContext = hrData.volunteers.map(v => ({ name: v.full_name, type: v.volunteer_type, status: v.status, skills: hrData.skills.filter(s => s.volunteer_id === v.volunteer_id).map(s => s.skill_name) }));
        
        const leadershipContext = {
            units: leadershipData.units.map(unit => ({
                name: unit.name[language] || unit.name.en,
                team_members: unit.team.map(m => m.name),
                stages: unit.stages.map(stage => ({
                    name: stage.title[language] || stage.title.en,
                    events: stage.events.map(event => ({
                        title: event.title[language] || event.title.en,
                        type: event.type,
                        date: event.date.split('T')[0],
                        status: event.status,
                        facilitator: event.facilitator.name,
                        location: event.location || 'N/A',
                        startTime: event.startTime || 'N/A',
                        endTime: event.endTime || 'N/A',
                    }))
                }))
            })),
            student_projects: leadershipData.studentProjects.map(p => ({
                id: p.id,
                title: p.title[language] || p.title.en,
                student: p.student.name,
                category: p.category,
                status: p.status,
                progress: p.progress,
                mentor: p.mentor,
                description: p.description[language] || p.description.en,
            })),
            quranicTimeline: {
                firstSemester: leadershipData.quranicTimeline.firstSemester.map(station => ({ ...station, content: station.content[language] || station.content.en, notes: station.notes[language] || station.notes.en, dateRange: station.dateRange[language] || station.dateRange.en })),
                secondSemester: leadershipData.quranicTimeline.secondSemester.map(station => ({ ...station, content: station.content[language] || station.content.en, notes: station.notes[language] || station.notes.en, dateRange: station.dateRange[language] || station.dateRange.en })),
                summerBreak: leadershipData.quranicTimeline.summerBreak.map(station => ({ ...station, content: station.content[language] || station.content.en, notes: station.notes[language] || station.notes.en, dateRange: station.dateRange[language] || station.dateRange.en })),
            }
        };

        const projectContext = projects.map(p => ({ id: p.id, name: p.name[language] || p.name.en, type: p.type, stage: p.stage, country: p.location.country, progress: p.progress, budget: p.budget, spent: p.spent }));
        const grcContext = { policies: grcData.policies.map(p => p.title[language]), risks: grcData.risks.map(r => r.risk) };

        const navigateToModuleDeclaration: FunctionDeclaration = {
          name: 'navigate_to_module',
          description: 'Navigates the user to a specific module within the ERP system. Use this to fulfill action-oriented requests like "create a campaign" or "show me the projects list".',
          parameters: {
            type: Type.OBJECT,
            properties: {
              module_name: {
                type: Type.STRING,
                description: 'The key of the module to navigate to.',
                enum: SIDEBAR_MODULES.map(m => m.key),
              },
            },
            required: ['module_name'],
          },
        };

        const systemInstruction = `You are a helpful and professional AI assistant integrated into a non-profit ERP system called 'MSSG Assistant'.
Your primary function is to answer questions by querying and processing the structured data provided to you in each prompt.
The current user has the role of: **${role}**.
The current UI language is **${language}**. Your response must be in this language.

**Answering Process:**
1.  **Knowledge Base First:** Before using any other data, review the "Knowledge Base Search Results" below. If the user's question can be answered using this information, prioritize it.
2.  **Cite Your Source:** If you use information from a knowledge base article, you MUST cite it at the end of your response in a new line, like this: "📚 From Knowledge Library: [Article Title]".
3.  **Use ERP Data:** If the knowledge base is not relevant, answer based on the provided JSON data for Donors, Beneficiaries, etc.

**Knowledge Base Search Results:**
Here are some articles from the institutional knowledge base that might be relevant to the user's question:
\`\`\`json
${JSON.stringify(knowledgeContext, null, 2)}
\`\`\`

**Function Calling:**
You have access to a tool called \`navigate_to_module\`. When a user asks to perform an action (e.g., "create a campaign for dormant donors", "show me settings", "send a message to a donor"), you should use this tool to navigate them to the correct module.
- For "create an email campaign for dormant donors", you should call \`navigate_to_module({ module_name: 'smart_message_campaign' })\`.
- For "take me to the projects page", you should call \`navigate_to_module({ module_name: 'projects' })\`.
You should also provide a text response explaining what you are about to do.

**Permissions Rules:**
- **Admin:** Full access to all data.
- **Manager:** Can view and get summaries of Donors, Beneficiaries, and Financials.
- **Staff:** Can view Donors and Beneficiaries data. Cannot access any financial summaries or total donation amounts.
- **Volunteer:** Can only ask for general help and 'how-to' guides. Cannot view any specific donor, beneficiary, or financial data.
If a user asks for information they don't have permission for, you MUST politely decline, stating their role as the reason. For example: "I'm sorry, but as a ${role}, you do not have permission to access financial information."

**Your Capabilities:**
You have access to data from the entire ERP system. You can:
1.  **Answer Questions:** Answer questions based on the provided JSON data about Individual Donors, Institutional Donors, Beneficiaries, Leadership Qualification (including units, stages, event details like title/date/type/status/facilitator/location, full student project details including descriptions, and full Quranic timeline plans for each semester), Projects (including progress, budget), HR (volunteers & staff skills), GRC (risks & policies), Gamification (badges & points), and more.
2.  **Generate Summaries:** Create text summaries and tables. For tables, you MUST use GitHub-flavored Markdown.
3.  **Handle Files:** If a file is uploaded, analyze it. For an invoice, extract key details and suggest creating a payment.`;
        
        const userPrompt = `Based *only* on the data provided below, answer the user's request.

---
**Individual Donors Data:**
\`\`\`json
${JSON.stringify(donorContext, null, 2)}
\`\`\`
---
**Institutional Donors Data:**
\`\`\`json
${JSON.stringify(institutionalDonorContext, null, 2)}
\`\`\`
---
**Beneficiaries Data:**
\`\`\`json
${JSON.stringify(beneficiaryContext, null, 2)}
\`\`\`
---
**HR (Volunteers & Staff) Data:**
\`\`\`json
${JSON.stringify(hrContext, null, 2)}
\`\`\`
---
**Leadership Qualification Module Data:**
\`\`\`json
${JSON.stringify(leadershipContext, null, 2)}
\`\`\`
---
**Projects Data:**
\`\`\`json
${JSON.stringify(projectContext, null, 2)}
\`\`\`
---
**GRC (Governance, Risk, Compliance) Data:**
\`\`\`json
${JSON.stringify(grcContext, null, 2)}
\`\`\`
---

**User Request:**
${file ? `The user uploaded a file named '${file.name}'. Please analyze it.` : `"${text}"`}
`;
        
        try {
            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: userPrompt,
                config: { 
                    systemInstruction,
                    tools: [{ functionDeclarations: [navigateToModuleDeclaration] }],
                },
            });
            
            return {
                sender: 'ai',
                text: response.text,
                functionCall: response.functionCalls?.[0],
            };

        } catch (error) {
            console.error("Gemini API Error:", error);
            return { sender: 'ai', text: "Sorry, I encountered an error while processing your request. Please try again." };
        }
    };
    
    const handleExecuteFunction = (messageId: number, name: string, args: any) => {
        if (executedFunctionCalls.has(messageId)) return;

        if (name === 'navigate_to_module') {
            setActiveModule(args.module_name);
            toast.showInfo(`Navigating to ${args.module_name}...`);
            addMessage({ sender: 'system', text: `Action executed: Navigated to ${args.module_name}.` });
        }

        setExecutedFunctionCalls(prev => new Set(prev).add(messageId));
    };


    const handleSend = async (messageText?: string, file?: File) => {
        const textToSend = messageText || input;
        if (!textToSend.trim() && !file) return;
        addMessage({ sender: 'user', text: textToSend, file: file ? {name: file.name, size: file.size} : undefined });
        setInput('');
        setIsTyping(true);
        const aiResponse = await processUserMessage(textToSend, file);
        addMessage(aiResponse);
        setIsTyping(false);
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => { const file = event.target.files?.[0]; if (file) { handleSend(t('ai_automation.ai_assistant.uploadedFile', {fileName: file.name}), file); event.target.value = ''; } };
    const handleNewConversation = () => { setMessages([getInitialMessage()]); setExecutedFunctionCalls(new Set()); }

    // --- RENDER SUB-COMPONENTS ---
    const MessageBubble: React.FC<{msg: Message}> = ({msg}) => (<div className={`flex items-end gap-3 max-w-full ${msg.sender === 'user' ? 'justify-end' : ''}`}>{msg.sender === 'ai' && (<div className="w-8 h-8 flex-shrink-0 bg-primary-light dark:bg-primary/20 rounded-full flex items-center justify-center"><SparklesIcon className="w-5 h-5 text-primary dark:text-secondary" /></div>)}<div className={`max-w-md lg:max-w-lg p-3 rounded-2xl ${msg.sender === 'ai' ? 'bg-gray-100 dark:bg-slate-700/50 rounded-es-none' : msg.sender === 'user' ? 'bg-primary text-white rounded-ee-none' : 'w-full text-center bg-transparent'}`}>{msg.sender === 'system' ? (<p className="text-xs italic text-gray-500 dark:text-gray-400">{msg.text}</p>) : (<>{msg.file && <p className="text-sm italic mb-2">📄 {t('ai_automation.ai_assistant.uploadedFile', {fileName: msg.file.name})}</p>}{msg.text && <MarkdownRenderer content={msg.text} />}{msg.functionCall && (
    <div className="mt-3 p-3 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
        <p className="text-sm font-bold text-blue-800 dark:text-blue-300">Action Suggested:</p>
        <p className="font-mono text-xs my-2 p-2 bg-white/50 dark:bg-black/20 rounded">
            {msg.functionCall.name}(
            <span className="text-blue-600 dark:text-blue-400">{JSON.stringify(msg.functionCall.args)}</span>
            )
        </p>
        <button
            onClick={() => handleExecuteFunction(msg.id, msg.functionCall.name, msg.functionCall.args)}
            disabled={executedFunctionCalls.has(msg.id)}
            className="mt-2 w-full px-3 py-1.5 text-sm font-semibold text-white bg-blue-600 rounded-md disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
            {executedFunctionCalls.has(msg.id) ? 'Executed' : 'Execute'}
        </button>
    </div>
)}{msg.suggestions && msg.suggestions.length > 0 && (<div className="mt-3 flex flex-wrap gap-2">{msg.suggestions?.map((s, i) => (<button key={i} onClick={() => handleSend(s)} className="text-xs px-3 py-1.5 bg-white/80 dark:bg-slate-800/80 rounded-full border border-gray-300 dark:border-slate-600 hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors">{s}</button>))
    }</div>)}<p className="text-right text-xs text-gray-400 dark:text-gray-500 mt-2">{new Date(msg.timestamp).toLocaleTimeString(language, {hour: '2-digit', minute:'2-digit'})}</p></>)}</div></div>);

    return (
        <div className="bg-card dark:bg-dark-card rounded-2xl shadow-soft border border-gray-200 dark:border-slate-700/50 h-[calc(100vh-16rem)] flex flex-col">
            <div className="flex-shrink-0 p-3 border-b dark:border-slate-700 flex justify-between items-center"><div className="flex items-center gap-2"><div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div><p className="text-sm font-semibold">{t('ai_automation.ai_assistant.title')}</p></div><button onClick={handleNewConversation} className="text-xs px-2 py-1 border dark:border-slate-600 rounded-md hover:bg-gray-100 dark:hover:bg-slate-700">{t('ai_automation.ai_assistant.newConversation')}</button></div>
            <div className="flex-grow p-4 overflow-y-auto"><div className="space-y-6">{messages.map(msg => <MessageBubble key={msg.id} msg={msg} />)}{isTyping && (<div className="flex items-end gap-3"><div className="w-8 h-8 flex-shrink-0 bg-primary-light dark:bg-primary/20 rounded-full flex items-center justify-center"><SparklesIcon className="w-5 h-5 text-primary dark:text-secondary" /></div><div className="p-3 rounded-2xl bg-gray-100 dark:bg-slate-700/50 rounded-bl-none"><div className="flex items-center gap-1.5"><span className="h-2 w-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span><span className="h-2 w-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span><span className="h-2 w-2 bg-gray-400 rounded-full animate-bounce"></span></div></div></div>)}{micError && <div className="text-center text-xs text-red-500 p-2">{micError}</div>}<div ref={messagesEndRef} /></div></div>
            <div className="p-4 border-t dark:border-slate-700">
                <div className="relative">
                     <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                     <div className="absolute inset-y-0 start-0 flex items-center">
                        <button onClick={() => fileInputRef.current?.click()} className="flex items-center justify-center w-12 text-gray-500 hover:text-primary" title="Attach file"><PaperclipIcon className="w-5 h-5" /></button>
                        <button onClick={handleListen} disabled={!!micError} className={`flex items-center justify-center w-12 text-gray-500 hover:text-primary disabled:text-gray-300 disabled:cursor-not-allowed ${isListening ? 'text-red-500 animate-pulse' : ''}`} title={t('ai_automation.ai_assistant.micTooltip')}><MicrophoneIcon className="w-5 h-5" /></button>
                     </div>
                    <input type="text" value={input} onChange={e => setInput(e.target.value)} onKeyPress={e => e.key === 'Enter' && !isTyping && handleSend()} placeholder={isListening ? t('ai_automation.ai_assistant.listening') : t('ai_automation.ai_assistant.inputPlaceholder')} className="w-full p-3 ps-24 pe-12 text-sm border rounded-lg bg-gray-50 dark:bg-slate-800 dark:border-slate-600 focus:ring-primary focus:border-primary" disabled={isTyping} />
                    <button onClick={() => handleSend()} disabled={isTyping || (!input.trim() && !fileInputRef.current?.files?.length)} className="absolute inset-y-0 end-0 flex items-center justify-center w-12 text-primary dark:text-secondary hover:bg-primary-light dark:hover:bg-primary/20 rounded-e-lg disabled:opacity-50"><SendIcon className="w-5 h-5" /></button>
                </div>
            </div>
        </div>
    );
};

export default AiAssistant;
