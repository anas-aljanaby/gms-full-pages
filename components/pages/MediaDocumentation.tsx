import React, { useState, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import PhotoAlbum from 'react-photo-album';
import Lightbox from 'yet-another-react-lightbox';
import Captions from "yet-another-react-lightbox/plugins/captions";
import Thumbnails from "yet-another-react-lightbox/plugins/thumbnails";
import Video from "yet-another-react-lightbox/plugins/video";

import { useLocalization } from '../../hooks/useLocalization';
import { useToast } from '../../hooks/useToast';
import { MOCK_PHOTOS } from '../../data/mediaData';
import { MOCK_VIDEOS } from '../../data/mediaData';
import type { Photo, Video as VideoType, MediaItem } from '../../types';

import { MediaIcon } from '../icons/ModuleIcons';
import { SparklesIcon, ChevronDownIcon } from '../icons/GenericIcons';
import { Download, Share2, Code } from 'lucide-react';
import Tabs from '../common/Tabs';

type ActiveTab = 'photos' | 'videos' | 'summary';

interface MediaDocumentationProps {
    initialEventFilter?: string | null;
}

const MediaDocumentation: React.FC<MediaDocumentationProps> = ({ initialEventFilter }) => {
    const { t } = useLocalization();
    const toast = useToast();
    const [activeTab, setActiveTab] = useState<ActiveTab>('photos');
    const [selectedEvent, setSelectedEvent] = useState<string>(initialEventFilter || 'all');
    
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [lightboxIndex, setLightboxIndex] = useState(0);

    const allMedia: MediaItem[] = useMemo(() => [...MOCK_PHOTOS, ...MOCK_VIDEOS], []);
    const uniqueEvents = useMemo(() => ['all', ...Array.from(new Set(allMedia.map(item => item.event)))], [allMedia]);

    const filteredMedia = useMemo(() => {
        let media: MediaItem[] = [];
        if (activeTab === 'photos') media = MOCK_PHOTOS;
        if (activeTab === 'videos') media = MOCK_VIDEOS;
        
        if (selectedEvent === 'all') return media;
        return media.filter(item => item.event === selectedEvent);
    }, [activeTab, selectedEvent]);
    
    const lightboxSlides = useMemo(() => {
        if (activeTab === 'photos') {
            return (filteredMedia as Photo[]).map(photo => ({
                src: photo.src,
                title: photo.title,
                description: photo.event,
            }));
        }
        if (activeTab === 'videos') {
            return (filteredMedia as VideoType[]).map(video => ({
                type: 'video' as const,
                sources: [{ src: video.src, type: 'video/mp4' }],
                poster: video.poster,
                title: video.title,
                description: video.event,
            }));
        }
        return [];
    }, [filteredMedia, activeTab]);

    const openLightbox = useCallback((index: number) => {
        setLightboxIndex(index);
        setLightboxOpen(true);
    }, []);

    // --- SUB-COMPONENTS ---

    const PhotoGallery = () => {
        const photosForAlbum = useMemo(() => (filteredMedia as Photo[]).map((p, index) => ({
            src: p.src,
            width: p.width,
            height: p.height,
            title: p.title,
            customIndex: index,
        })), [filteredMedia]);
        
        const renderPhoto = useCallback(({ photo, wrapperStyle, imageProps }: any) => {
            return (
                <motion.div
                    key={photo.src}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: (photo.customIndex || 0) * 0.05 }}
                    style={wrapperStyle}
                    className="group relative overflow-hidden rounded-lg"
                    onClick={() => openLightbox(photo.customIndex)}
                >
                    <img {...imageProps} loading="lazy" className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <p className="absolute bottom-2 left-2 right-2 text-white text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity truncate">
                        {photo.title}
                    </p>
                </motion.div>
            );
        }, [openLightbox]);

        return photosForAlbum.length > 0 ? <PhotoAlbum photos={photosForAlbum} layout="rows" renderPhoto={renderPhoto} /> : <div className="text-center p-8 text-gray-500">No photos found for this event.</div>;
    };


    const VideoGallery = () => (
        <>
        {(filteredMedia as VideoType[]).length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {(filteredMedia as VideoType[]).map((video, index) => (
                <motion.div
                    key={video.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="group relative aspect-video rounded-lg overflow-hidden shadow-md cursor-pointer"
                    onClick={() => openLightbox(index)}
                >
                    <img src={video.poster} alt={video.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-black/50" />
                    <div className="absolute inset-0 flex flex-col justify-between p-4 text-white">
                        <div className="flex justify-end">
                            <span className="px-2 py-0.5 bg-black/50 text-xs font-semibold rounded">{video.duration}</span>
                        </div>
                        <h4 className="font-bold">{video.title}</h4>
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="w-16 h-16 bg-white/30 rounded-full flex items-center justify-center backdrop-blur-sm">
                            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20"><path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" /></svg>
                        </div>
                    </div>
                </motion.div>
            ))}
        </div>
        ) : (
            <div className="text-center p-8 text-gray-500">No videos found for this event.</div>
        )}
        </>
    );
    
    const MediaSummary = () => {
        const totalPhotos = MOCK_PHOTOS.length;
        const totalVideos = MOCK_VIDEOS.length;
        const totalVideoDurationSeconds = MOCK_VIDEOS.reduce((sum, v) => {
            const parts = v.duration.split(':');
            return sum + parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
        }, 0);
        const totalVideoDurationMinutes = totalVideoDurationSeconds / 60;

        return (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-card dark:bg-dark-card p-6 rounded-2xl shadow-soft border dark:border-slate-700/50 space-y-4">
                     <h3 className="font-bold text-lg">Statistics</h3>
                     <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-gray-100 dark:bg-slate-800/50 rounded-lg text-center">
                            <p className="text-3xl font-bold">{totalPhotos}</p>
                            <p className="text-sm text-gray-500">Total Photos</p>
                        </div>
                        <div className="p-4 bg-gray-100 dark:bg-slate-800/50 rounded-lg text-center">
                            <p className="text-3xl font-bold">{totalVideos}</p>
                            <p className="text-sm text-gray-500">Total Videos</p>
                        </div>
                         <div className="p-4 bg-gray-100 dark:bg-slate-800/50 rounded-lg text-center col-span-2">
                            <p className="text-3xl font-bold">{totalVideoDurationMinutes.toFixed(1)}</p>
                            <p className="text-sm text-gray-500">Total Video Minutes</p>
                        </div>
                     </div>
                </div>
                 <div className="bg-card dark:bg-dark-card p-6 rounded-2xl shadow-soft border dark:border-slate-700/50 space-y-4">
                     <h3 className="font-bold text-lg flex items-center gap-2"><SparklesIcon className="w-5 h-5 text-primary"/> AI-Generated Summary</h3>
                     <div className="space-y-3">
                         <h4 className="font-semibold">Event Highlights (Annual Gala 2024)</h4>
                         <p className="text-sm text-gray-600 dark:text-gray-400">The Annual Gala 2024 was a resounding success, raising over $250,000 for our education programs. Key moments included an inspiring speech by our director and a moving testimonial from a scholarship recipient.</p>
                         <h4 className="font-semibold">Social Media Captions</h4>
                         <div className="p-3 bg-gray-100 dark:bg-slate-800/50 rounded-md text-sm italic">
                            "Feeling inspired after an incredible night at our #AnnualGala2024! ✨ Together, we're changing lives through education. Thank you to all our supporters! #NonProfit #EducationForAll"
                         </div>
                         <div className="flex gap-2">
                             <button onClick={() => toast.showSuccess('Captions copied to clipboard.', {title: 'Copied!'})} className="px-3 py-1 text-xs font-semibold border rounded-md">Copy Captions</button>
                             <button onClick={() => toast.showInfo('PDF report generation is under development.', {title: 'Coming Soon'})} className="px-3 py-1 text-xs font-semibold border rounded-md">Download PDF Report</button>
                         </div>
                     </div>
                </div>
            </div>
        );
    };

    // --- RENDER ---
    
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-foreground dark:text-dark-foreground flex items-center gap-3">
                <MediaIcon /> {t('sidebar.media_documentation')}
            </h1>
            
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 p-4 bg-card dark:bg-dark-card rounded-xl shadow-soft border dark:border-slate-700/50">
                <Tabs 
                    tabs={[
                        { id: 'photos', label: 'Photos' },
                        { id: 'videos', label: 'Videos' },
                        { id: 'summary', label: 'Summary' },
                    ]}
                    activeTab={activeTab}
                    onTabClick={(id) => setActiveTab(id as ActiveTab)}
                />
                 <div className="flex items-center gap-3">
                    <select 
                        value={selectedEvent} 
                        onChange={e => setSelectedEvent(e.target.value)}
                        className="p-2 text-sm border rounded-lg bg-gray-50 dark:bg-slate-800 dark:border-slate-700"
                    >
                        {uniqueEvents.map(event => (
                            <option key={event} value={event}>{event === 'all' ? 'All Events' : event}</option>
                        ))}
                    </select>
                    <button onClick={() => toast.showInfo('Bulk download is under development.', {title:'Coming Soon'})} className="p-2 bg-primary text-white rounded-lg flex items-center gap-2 text-sm font-semibold">
                        <Download className="w-4 h-4"/> Download All
                    </button>
                 </div>
            </div>

            <div className="animate-fade-in">
                {activeTab === 'photos' && <PhotoGallery />}
                {activeTab === 'videos' && <VideoGallery />}
                {activeTab === 'summary' && <MediaSummary />}
            </div>
            
            <Lightbox
                open={lightboxOpen}
                close={() => setLightboxOpen(false)}
                slides={lightboxSlides}
                index={lightboxIndex}
                plugins={[Captions, Thumbnails, Video]}
                captions={{ showToggle: true }}
                thumbnails={{ showToggle: true }}
            />
        </div>
    );
};

export default MediaDocumentation;
