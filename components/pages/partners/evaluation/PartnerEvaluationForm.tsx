import React, { useState } from 'react';
import type { Partner } from '../../../../types';
import { Calendar } from 'lucide-react';
import StarRatingInput from '../../../common/StarRatingInput';
import SliderInput from '../../../common/SliderInput';

interface PartnerEvaluationFormProps {
    partner: Partner;
    onSave: () => void;
    onCancel: () => void;
}

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="p-4 border rounded-lg bg-gray-50/50">
        <h3 className="font-bold mb-4">{title}</h3>
        <div className="space-y-6">{children}</div>
    </div>
);

const PartnerEvaluationForm: React.FC<PartnerEvaluationFormProps> = ({ partner, onSave, onCancel }) => {
    const [evaluation, setEvaluation] = useState({
        timeline: 85,
        quality: 90,
        communication: 75,
        transparency: 95,
        flexibility: 80,
        budget: 92,
        resources: 88,
        overall: 4,
        strengths: '',
        weaknesses: '',
        recommendations: ''
    });

    const handleSliderChange = (field: keyof typeof evaluation) => (e: React.ChangeEvent<HTMLInputElement>) => {
        setEvaluation(prev => ({ ...prev, [field]: Number(e.target.value) }));
    };

    const handleTextChange = (field: keyof typeof evaluation) => (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setEvaluation(prev => ({ ...prev, [field]: e.target.value }));
    };

    return (
        <div className="bg-white rounded-xl shadow-md p-6 space-y-6">
            <div className="flex justify-between items-start">
                <div>
                    <h2 className="text-xl font-bold">تقييم الشريك: {partner.name}</h2>
                    <p className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                        <Calendar size={14} /> آخر تقييم: 15 ديسمبر 2023
                    </p>
                </div>
                <button className="px-4 py-2 text-sm font-semibold border rounded-lg hover:bg-gray-100">
                    تقييم جديد
                </button>
            </div>
            
            <Section title="الالتزام">
                <SliderInput label="الالتزام بالجدول الزمني" value={evaluation.timeline} onChange={handleSliderChange('timeline')} />
                <SliderInput label="جودة المخرجات" value={evaluation.quality} onChange={handleSliderChange('quality')} />
            </Section>
            
            <Section title="التعاون">
                <SliderInput label="جودة التواصل" value={evaluation.communication} onChange={handleSliderChange('communication')} />
                <SliderInput label="الشفافية" value={evaluation.transparency} onChange={handleSliderChange('transparency')} />
                <SliderInput label="المرونة والاستجابة" value={evaluation.flexibility} onChange={handleSliderChange('flexibility')} />
            </Section>

            <Section title="الكفاءة">
                <SliderInput label="إدارة الميزانية" value={evaluation.budget} onChange={handleSliderChange('budget')} />
                <SliderInput label="استخدام الموارد" value={evaluation.resources} onChange={handleSliderChange('resources')} />
            </Section>

            <Section title="التقييم العام والملاحظات">
                 <div className="flex flex-col items-center">
                    <label className="text-sm font-semibold mb-2">التقييم العام</label>
                    <StarRatingInput rating={evaluation.overall} setRating={(r) => setEvaluation(p => ({...p, overall: r}))} />
                </div>
                 <textarea value={evaluation.strengths} onChange={handleTextChange('strengths')} rows={3} placeholder="نقاط القوة..." className="w-full p-2 border rounded-md"></textarea>
                 <textarea value={evaluation.weaknesses} onChange={handleTextChange('weaknesses')} rows={3} placeholder="نقاط الضعف..." className="w-full p-2 border rounded-md"></textarea>
                 <textarea value={evaluation.recommendations} onChange={handleTextChange('recommendations')} rows={3} placeholder="توصيات..." className="w-full p-2 border rounded-md"></textarea>
            </Section>

            <div className="flex justify-end gap-4 mt-6">
                <button onClick={onCancel} className="px-6 py-2 text-sm font-semibold border rounded-lg hover:bg-gray-100">إلغاء</button>
                <button onClick={onSave} className="px-6 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700">حفظ التقييم</button>
            </div>
        </div>
    );
};

export default PartnerEvaluationForm;
