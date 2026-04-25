import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useLocalization } from '../../../hooks/useLocalization';
import type { ForumPost, ForumCategory } from '../../../types';
import { ArrowLeft, MessageSquare } from 'lucide-react';
import { formatDate } from '../../../lib/utils';

interface PostDetailViewProps {
    post: ForumPost;
    onBack: () => void;
    onAddReply: (postId: string, content: string) => void;
    categories: ForumCategory[];
}

const PostDetailView: React.FC<PostDetailViewProps> = ({ post, onBack, onAddReply, categories }) => {
    const { t, language, dir } = useLocalization();
    const [newReply, setNewReply] = useState('');

    const handleSubmitReply = (e: React.FormEvent) => {
        e.preventDefault();
        if (newReply.trim()) {
            onAddReply(post.id, newReply);
            setNewReply('');
        }
    };

    const categoryName = categories.find(c => c.id === post.categoryId)?.name[language];

    return (
        <div className="space-y-6 animate-fade-in" dir={dir}>
            <div>
                <button onClick={onBack} className="flex items-center gap-2 text-sm font-semibold text-primary hover:underline">
                    <ArrowLeft className="w-4 h-4 rtl:rotate-180" /> {t('forum.back_to_forum')}
                </button>
            </div>

            {/* Post Content */}
            <div className="bg-card dark:bg-dark-card p-6 rounded-2xl shadow-soft border dark:border-slate-700/50">
                <div className="flex justify-between items-start">
                    <h1 className="text-3xl font-bold">{post.title}</h1>
                    {categoryName && (
                         <span className="text-sm font-semibold px-3 py-1 bg-gray-100 dark:bg-slate-700 rounded-full">{categoryName}</span>
                    )}
                </div>
                <div className="flex items-center gap-3 mt-4">
                    <img src={post.authorAvatar} alt={post.authorName} className="w-12 h-12 rounded-full" />
                    <div>
                        <p className="font-bold">{post.authorName}</p>
                        <p className="text-sm text-gray-500">{formatDate(post.createdAt, language)}</p>
                    </div>
                </div>
                <div className="mt-6 prose dark:prose-invert max-w-none">
                    <p>{post.content}</p>
                </div>
            </div>

            {/* Replies Section */}
            <div className="bg-card dark:bg-dark-card p-6 rounded-2xl shadow-soft border dark:border-slate-700/50">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <MessageSquare /> {post.replies.length} {t('forum.replies')}
                </h2>
                <div className="space-y-4">
                    {post.replies.map((reply, index) => (
                        <motion.div 
                            key={reply.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-slate-800/50 rounded-lg"
                        >
                            <img src={reply.authorAvatar} alt={reply.authorName} className="w-10 h-10 rounded-full" />
                            <div className="flex-1">
                                <div className="flex items-center gap-2">
                                    <p className="font-bold">{reply.authorName}</p>
                                    <p className="text-xs text-gray-500">&bull; {formatDate(reply.createdAt, language)}</p>
                                </div>
                                <p className="text-sm mt-1">{reply.content}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
                
                {/* Add Reply Form */}
                <form onSubmit={handleSubmitReply} className="mt-6 pt-6 border-t dark:border-slate-700">
                     <h3 className="font-bold mb-2">{t('forum.add_reply')}</h3>
                     <textarea
                        value={newReply}
                        onChange={e => setNewReply(e.target.value)}
                        rows={4}
                        placeholder={t('forum.write_reply_placeholder')}
                        className="w-full p-2 border rounded-md bg-white dark:bg-slate-800 dark:border-slate-600"
                    />
                    <div className="flex justify-end mt-2">
                         <button type="submit" className="px-4 py-2 bg-primary text-white font-semibold rounded-lg text-sm">
                            {t('forum.post_reply')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PostDetailView;