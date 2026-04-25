import React from 'react';
import { motion } from 'framer-motion';
import { Star, ThumbsUp, Plus } from 'lucide-react';

const mockReviews = [
    { reviewer: "أحمد محمد - مدير المشروع", date: "15 ديسمبر 2023", project: "برنامج محو الأمية", rating: 5.0, comment: "أداء ممتاز في تنفيذ المشروع. الشريك أظهر احترافية عالية والتزام بالجدول الزمني. التواصل كان فعال وشفاف طوال فترة المشروع.", helpful: 12 },
    { reviewer: "فاطمة علي - مديرة البرامج", date: "20 نوفمبر 2023", project: "حملة تطعيم الأطفال", rating: 4.0, comment: "تنفيذ جيد بشكل عام. بعض التأخيرات البسيطة لكن تم معالجتها بسرعة.", helpful: 8 },
    { reviewer: "خالد سعيد", date: "5 نوفمبر 2023", project: "تدريب مهني للشباب", rating: 5.0, comment: "شريك موثوق وملتزم. نتطلع لمشاريع مستقبلية.", helpful: 15 },
    { reviewer: "مجهول", date: "18 أكتوبر 2023", project: "بناء مركز صحي", rating: 4.0, comment: "كان التسليم النهائي جيدًا.", helpful: 4 },
    { reviewer: "علي حسن", date: "30 سبتمبر 2023", project: "توزيع مستلزمات مدرسية", rating: 5.0, comment: "فريق متعاون جداً.", helpful: 9 },
];
const ratingBreakdown = { '5': 8, '4': 5, '3': 2, '2': 0, '1': 0 };
const totalReviews = 15;
const performanceIndicators = [
    { label: "جودة التنفيذ", rating: 4.5, progress: 90 },
    { label: "الالتزام بالمواعيد", rating: 4.0, progress: 80 },
    { label: "الشفافية", rating: 4.8, progress: 96 },
    { label: "التواصل", rating: 4.2, progress: 84 },
    { label: "رضا المستفيدين", rating: 4.3, progress: 86 },
];

const StarRating: React.FC<{ rating: number; size?: number, showValue?: boolean }> = ({ rating, size = 16, showValue = false }) => (
    <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
            <Star key={i} size={size} className={`${i < Math.round(rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
        ))}
        {showValue && <span className="font-bold text-sm ml-1">({rating.toFixed(1)})</span>}
    </div>
);

const ReviewCard: React.FC<{ review: typeof mockReviews[0] }> = ({ review }) => (
    <div className="bg-gray-50 dark:bg-slate-700/50 p-4 rounded-lg">
        <div className="flex justify-between items-start">
            <div>
                <h4 className="font-bold">{review.reviewer}</h4>
                <p className="text-xs text-gray-500">{review.date} | المشروع: {review.project}</p>
            </div>
            <StarRating rating={review.rating} />
        </div>
        <p className="text-sm mt-2 text-gray-700 dark:text-gray-300">"{review.comment}"</p>
        <div className="mt-3 text-xs text-gray-500 flex items-center gap-1">
            <ThumbsUp size={14} />
            <span>{review.helpful} شخص وجد هذا مفيداً</span>
        </div>
    </div>
);

const PerformanceIndicator: React.FC<{ indicator: typeof performanceIndicators[0] }> = ({ indicator }) => {
    const barColor = indicator.progress > 85 ? 'bg-green-500' : indicator.progress > 70 ? 'bg-yellow-500' : 'bg-red-500';
    return (
        <div>
            <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-semibold">{indicator.label}</span>
                <StarRating rating={indicator.rating} showValue />
            </div>
            <div className="w-full bg-gray-200 dark:bg-slate-600 rounded-full h-2">
                <div className={`${barColor} h-2 rounded-full`} style={{ width: `${indicator.progress}%` }}></div>
            </div>
        </div>
    );
};


const EvaluationsTab: React.FC<{ partnerRating: number }> = ({ partnerRating }) => {
    return (
        <div className="space-y-8">
            {/* Top Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 bg-gray-50 dark:bg-slate-700/50 p-6 rounded-xl flex flex-col items-center justify-center text-center">
                    <p className="text-7xl font-bold text-blue-600">{partnerRating.toFixed(1)}</p>
                    <StarRating rating={partnerRating} size={24} />
                    <p className="text-sm text-gray-500 mt-2">بناءً على {totalReviews} تقييم</p>
                    <button className="mt-4 flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700">
                        <Plus size={16} /> إضافة تقييم
                    </button>
                </div>
                <div className="lg:col-span-2 bg-gray-50 dark:bg-slate-700/50 p-6 rounded-xl">
                    <h3 className="font-bold mb-4">تفصيل التقييمات</h3>
                    <div className="space-y-3">
                        {Object.entries(ratingBreakdown).reverse().map(([stars, count]) => {
                            const percentage = (count / totalReviews) * 100;
                            return (
                                <div key={stars} className="flex items-center gap-4 text-sm">
                                    <span className="w-16 text-gray-500">{stars} نجوم</span>
                                    <div className="flex-grow bg-gray-200 dark:bg-slate-600 rounded-full h-4">
                                        <div className="bg-yellow-400 h-4 rounded-full" style={{ width: `${percentage}%` }}></div>
                                    </div>
                                    <span className="w-24 text-right">{count} تقييمات ({percentage.toFixed(0)}%)</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Performance Indicators */}
             <div className="bg-gray-50 dark:bg-slate-700/50 p-6 rounded-xl">
                 <h3 className="font-bold mb-4">مؤشرات الأداء الرئيسية</h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-6">
                    {performanceIndicators.map(ind => <PerformanceIndicator key={ind.label} indicator={ind} />)}
                </div>
            </div>

            {/* Individual Reviews */}
            <div>
                 <h3 className="text-xl font-bold mb-4">التقييمات الفردية</h3>
                 <div className="space-y-4">
                    {mockReviews.map((review, i) => <ReviewCard key={i} review={review} />)}
                </div>
                 <div className="text-center mt-6">
                    <button className="px-6 py-2 border border-gray-300 dark:border-slate-600 font-semibold rounded-lg hover:bg-gray-100">
                        عرض جميع التقييمات
                    </button>
                </div>
            </div>

        </div>
    );
};

export default EvaluationsTab;
