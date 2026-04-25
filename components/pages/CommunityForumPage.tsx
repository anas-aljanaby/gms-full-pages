import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocalization } from '../../hooks/useLocalization';
import { useToast } from '../../hooks/useToast';
import { MOCK_FORUM_CATEGORIES, MOCK_FORUM_POSTS } from '../../data/forumData';
import type { ForumPost, ForumCategory } from '../../types';
import { ForumIcon } from '../icons/ModuleIcons';
import { Search, PlusCircle, MessageSquare } from 'lucide-react';
import { formatDate, formatNumber } from '../../lib/utils';
import CreatePostModal from './forum/CreatePostModal';
import PostDetailView from './forum/PostDetailView';

const CommunityForumPage: React.FC = () => {
    const { t, language, dir } = useLocalization();
    const toast = useToast();

    const [posts, setPosts] = useState<ForumPost[]>(MOCK_FORUM_POSTS);
    const [categories] = useState<ForumCategory[]>(MOCK_FORUM_CATEGORIES);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [selectedPost, setSelectedPost] = useState<ForumPost | null>(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    const filteredPosts = useMemo(() => {
        return posts.filter(post => {
            const matchesCategory = selectedCategory === 'all' || post.categoryId === selectedCategory;
            const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                  post.content.toLowerCase().includes(searchTerm.toLowerCase());
            return matchesCategory && matchesSearch;
        }).sort((a, b) => new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime());
    }, [posts, selectedCategory, searchTerm]);

    const handleAddPost = (postData: Omit<ForumPost, 'id' | 'authorId' | 'authorName' | 'authorAvatar' | 'createdAt' | 'lastActivity' | 'replies'>) => {
        const newPost: ForumPost = {
            ...postData,
            id: `post-${Date.now()}`,
            authorId: 'user-current',
            authorName: 'Current User', // Replace with actual user data
            authorAvatar: 'https://picsum.photos/id/1005/100/100',
            createdAt: new Date().toISOString(),
            lastActivity: new Date().toISOString(),
            replies: [],
        };
        setPosts(prev => [newPost, ...prev]);
        toast.showSuccess('Post created successfully!');
    };
    
    const handleAddReply = (postId: string, replyContent: string) => {
        setPosts(prevPosts => {
            const newPosts = prevPosts.map(post => {
                if (post.id === postId) {
                    const newReply = {
                        id: `reply-${Date.now()}`,
                        authorId: 'user-current',
                        authorName: 'Current User',
                        authorAvatar: 'https://picsum.photos/id/1005/100/100',
                        content: replyContent,
                        createdAt: new Date().toISOString(),
                    };
                    return {
                        ...post,
                        replies: [...post.replies, newReply],
                        lastActivity: new Date().toISOString(),
                    };
                }
                return post;
            });
            // Update the selected post state as well to re-render the detail view
            setSelectedPost(newPosts.find(p => p.id === postId) || null);
            return newPosts;
        });
        toast.showSuccess('Reply posted!');
    };

    if (selectedPost) {
        return (
            <PostDetailView
                post={selectedPost}
                onBack={() => setSelectedPost(null)}
                onAddReply={handleAddReply}
                categories={categories}
            />
        );
    }

    return (
        <>
            <CreatePostModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onAddPost={handleAddPost}
                categories={categories}
            />
            <div className="space-y-6 animate-fade-in" dir={dir}>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <h1 className="text-3xl font-bold text-foreground dark:text-dark-foreground flex items-center gap-3">
                        <ForumIcon /> {t('sidebar.community_forum')}
                    </h1>
                    <button onClick={() => setIsCreateModalOpen(true)} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-dark rounded-lg">
                        <PlusCircle size={18} /> {t('forum.create_post')}
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
                    {/* Categories Sidebar */}
                    <aside className="lg:col-span-1 space-y-4 lg:sticky top-24">
                        <div className="bg-card dark:bg-dark-card rounded-xl shadow-soft border dark:border-slate-700/50 p-4">
                            <div className="relative mb-4">
                                <Search className="w-4 h-4 absolute top-1/2 left-3 -translate-y-1/2 text-gray-400 rtl:left-auto rtl:right-3" />
                                <input
                                    type="text"
                                    placeholder={t('forum.search_posts')}
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                    className="w-full py-2 pl-10 pr-4 rtl:pr-10 rtl:pl-4 border rounded-lg bg-gray-50 dark:bg-slate-800 dark:border-slate-600"
                                />
                            </div>
                            <h3 className="font-bold mb-2">{t('forum.categories')}</h3>
                            <ul className="space-y-1">
                                <li>
                                    <button onClick={() => setSelectedCategory('all')} className={`w-full text-start p-2 rounded-md font-semibold text-sm ${selectedCategory === 'all' ? 'bg-primary-light text-primary-dark' : 'hover:bg-gray-100 dark:hover:bg-slate-700'}`}>
                                        {t('forum.all_posts')}
                                    </button>
                                </li>
                                {categories.map(cat => (
                                    <li key={cat.id}>
                                        <button onClick={() => setSelectedCategory(cat.id)} className={`w-full text-start p-2 rounded-md font-semibold text-sm ${selectedCategory === cat.id ? 'bg-primary-light text-primary-dark' : 'hover:bg-gray-100 dark:hover:bg-slate-700'}`}>
                                            {cat.name[language]}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </aside>

                    {/* Posts List */}
                    <main className="lg:col-span-3 space-y-4">
                        {filteredPosts.map(post => (
                            <motion.div
                                key={post.id}
                                layout
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.3 }}
                            >
                                <button onClick={() => setSelectedPost(post)} className="w-full text-start bg-card dark:bg-dark-card p-4 rounded-xl shadow-soft border dark:border-slate-700/50 hover:shadow-lg hover:-translate-y-0.5 transition-all">
                                    <div className="flex items-start gap-4">
                                        <img src={post.authorAvatar} alt={post.authorName} className="w-10 h-10 rounded-full" />
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h2 className="font-bold text-lg">{post.title}</h2>
                                                    <p className="text-xs text-gray-500">{t('forum.posted_by')} {post.authorName} &bull; {formatDate(post.createdAt, language)}</p>
                                                </div>
                                                <span className="text-xs font-semibold px-2 py-1 bg-gray-100 dark:bg-slate-700 rounded-full">{categories.find(c => c.id === post.categoryId)?.name[language]}</span>
                                            </div>
                                            <p className="text-sm mt-2 text-gray-600 dark:text-gray-400 line-clamp-2">{post.content}</p>
                                            <div className="flex items-center gap-4 text-xs text-gray-500 mt-3">
                                                <div className="flex items-center gap-1"><MessageSquare size={14} /> {post.replies.length} {t('forum.replies')}</div>
                                                <span>{t('forum.last_activity')}: {formatDate(post.lastActivity, language)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </button>
                            </motion.div>
                        ))}
                         {filteredPosts.length === 0 && (
                            <div className="text-center py-16 text-gray-500">
                                <p>{t('forum.no_posts_found')}</p>
                            </div>
                        )}
                    </main>
                </div>
            </div>
        </>
    );
};

export default CommunityForumPage;