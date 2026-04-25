





import React, { useState, useMemo, useCallback } from 'react';
import { useDropzone, FileRejection } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocalization } from '../../hooks/useLocalization';
import { useToast } from '../../hooks/useToast';
import type { EducationalFile, FileCategory, EducationalFileType } from '../../types';
import { MOCK_EDUCATIONAL_FILES } from '../../data/educationalMaterialsData';
import { EducationalMaterialsIcon } from '../icons/ModuleIcons';
import { SearchIcon, XIcon } from '../icons/GenericIcons';
import { UploadCloud, MoreHorizontal, Eye, Download, Trash2 } from 'lucide-react';
// FIX: Added ZipIcon to imports and consolidated icon imports.
import { PdfIcon, PptIcon, ImageIcon, VideoIcon, FileIcon as GenericFileIcon, WordIcon, ZipIcon } from '../icons/FiletypeIcons';
import { formatDate } from '../../lib/utils';

// File type to icon mapping
// FIX: Added 'ppt' to handle older PowerPoint formats
const fileTypeToIcon: Record<EducationalFileType, React.FC<{ className?: string }>> = {
    pdf: PdfIcon,
    ppt: PptIcon,
    pptx: PptIcon,
    mp4: VideoIcon,
    jpg: ImageIcon,
    png: ImageIcon,
    generic: GenericFileIcon,
    docx: WordIcon,
    zip: ZipIcon,
};

// Main Component
const EducationalMaterials: React.FC = () => {
    const { t, language } = useLocalization();
    const { showSuccess, showError } = useToast();
    const [files, setFiles] = useState<EducationalFile[]>(MOCK_EDUCATIONAL_FILES);
    const [activeCategory, setActiveCategory] = useState<FileCategory | 'all'>('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [previewFile, setPreviewFile] = useState<EducationalFile | null>(null);

    // Categories
    const categories: (FileCategory | 'all')[] = ['all', 'presentations', 'documents', 'videos', 'other'];

    // File handling
    const onDrop = useCallback((acceptedFiles: File[], fileRejections: FileRejection[]) => {
        fileRejections.forEach(rejection => {
            rejection.errors.forEach(error => {
                showError(error.message, { title: 'Upload Failed' });
            });
        });

        if (acceptedFiles.length > 0) {
            const newFiles: EducationalFile[] = acceptedFiles.map(file => {
                const ext = file.name.split('.').pop()?.toLowerCase() || 'generic';
                // FIX: Added 'zip' to the type map.
                const typeMap: Record<string, EducationalFileType> = { 'pdf': 'pdf', 'ppt': 'ppt', 'pptx': 'pptx', 'mp4': 'mp4', 'jpg': 'jpg', 'jpeg': 'jpg', 'png': 'png', 'doc': 'docx', 'docx': 'docx', 'zip': 'zip' };
                const fileType: EducationalFileType = typeMap[ext] || 'generic';

                let category: FileCategory = 'documents';
                if (file.type.startsWith('video')) category = 'videos';
                else if (file.type.startsWith('image')) category = 'other';
                else if (file.type.includes('presentation') || file.type.includes('powerpoint')) category = 'presentations';

                return {
                    id: `file-${Date.now()}-${Math.random()}`,
                    name: file.name,
                    type: fileType,
                    category: category,
                    size: file.size,
                    url: URL.createObjectURL(file), // Create a temporary URL for preview
                    uploadDate: new Date().toISOString(),
                };
            });
            setFiles(prev => [...newFiles, ...prev]);
            showSuccess(`${newFiles.length} file(s) uploaded successfully!`);
        }
    }, [showSuccess, showError]);

    const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
        onDrop,
        noClick: true,
        noKeyboard: true,
        maxSize: 50 * 1024 * 1024, // 50MB
    });
    
    const handleDelete = (id: string) => {
        if (window.confirm("Are you sure you want to delete this file?")) {
            setFiles(files.filter(f => f.id !== id));
            showSuccess("File deleted successfully.");
        }
    };

    // Filtering logic
    const filteredFiles = useMemo(() => {
        return files.filter(file => {
            const matchesCategory = activeCategory === 'all' || file.category === activeCategory;
            const matchesSearch = file.name.toLowerCase().includes(searchTerm.toLowerCase());
            return matchesCategory && matchesSearch;
        });
    }, [files, activeCategory, searchTerm]);

    // Sub-components
    const FileCard: React.FC<{ file: EducationalFile }> = ({ file }) => {
        const Icon = fileTypeToIcon[file.type] || GenericFileIcon;
        return (
            <motion.div
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-card dark:bg-dark-card rounded-lg shadow-soft border dark:border-slate-700/50 p-4 flex flex-col justify-between"
            >
                <div>
                    <div className="flex items-center justify-between">
                        <Icon className="w-10 h-10" />
                    </div>
                    <h4 className="font-bold mt-3 truncate">{file.name}</h4>
                    <p className="text-xs text-gray-500">{t(`educational_materials.categories.${file.category}`)}</p>
                </div>
                <div className="mt-4 pt-2 border-t dark:border-slate-700">
                    <div className="flex justify-between items-center text-xs text-gray-500">
                        <span>{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                        <span>{formatDate(file.uploadDate, language)}</span>
                    </div>
                    <div className="flex gap-2 mt-2">
                        <button onClick={() => setPreviewFile(file)} className="flex-1 flex items-center justify-center gap-1 py-1 text-xs border rounded-md hover:bg-gray-100 dark:border-slate-600 dark:hover:bg-slate-700"><Eye size={14}/> {t('educational_materials.preview')}</button>
                        <a href={file.url} download={file.name} className="flex-1 flex items-center justify-center gap-1 py-1 text-xs border rounded-md hover:bg-gray-100 dark:border-slate-600 dark:hover:bg-slate-700"><Download size={14}/> {t('educational_materials.download')}</a>
                        <button onClick={() => handleDelete(file.id)} className="p-1.5 border rounded-md hover:bg-red-100 dark:hover:bg-red-900/50 text-red-500 dark:text-red-400"><Trash2 size={14}/></button>
                    </div>
                </div>
            </motion.div>
        );
    };

    const FilePreviewModal: React.FC<{ file: EducationalFile; onClose: () => void }> = ({ file, onClose }) => {
        return (
            <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 animate-fade-in" onClick={onClose}>
                <div className="bg-card dark:bg-dark-card rounded-2xl shadow-xl w-full max-w-4xl m-4 flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
                    <div className="flex items-center justify-between p-4 border-b dark:border-slate-700">
                        <h3 className="font-bold text-lg">{file.name}</h3>
                        <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-slate-700"><XIcon /></button>
                    </div>
                    <div className="p-6 flex-grow overflow-auto flex items-center justify-center bg-gray-100 dark:bg-dark-background/50">
                        {file.type === 'jpg' || file.type === 'png' ? <img src={file.url} alt={file.name} className="max-w-full max-h-full rounded-lg" /> :
                         file.type === 'mp4' ? <video src={file.url} controls className="w-full rounded-lg" /> :
                         file.type === 'pdf' ? <iframe src={file.url} className="w-full h-full border-0" title={file.name}/> :
                         <div className="text-center text-gray-500"><GenericFileIcon className="w-24 h-24 mx-auto"/> <p className="mt-4">{t('educational_materials.noPreview')}</p></div>
                        }
                    </div>
                </div>
            </div>
        )
    };

    return (
        <>
            <AnimatePresence>
                {previewFile && <FilePreviewModal file={previewFile} onClose={() => setPreviewFile(null)} />}
            </AnimatePresence>
            <div className="space-y-6 animate-fade-in">
                <h1 className="text-3xl font-bold text-foreground dark:text-dark-foreground flex items-center gap-3">
                    <EducationalMaterialsIcon /> {t('sidebar.educational_materials')}
                </h1>
                
                {/* Upload Area */}
                <div {...getRootProps({ className: `p-8 border-2 border-dashed rounded-xl text-center cursor-pointer transition-colors ${isDragActive ? 'border-primary bg-primary-light/50' : 'border-gray-300 dark:border-slate-600 hover:border-primary'}` })}>
                    <input {...getInputProps()} />
                    <UploadCloud className="w-12 h-12 mx-auto text-gray-400" />
                    <p className="mt-2 font-semibold text-gray-600 dark:text-gray-300">{t('educational_materials.uploadPrompt')}</p>
                    <p className="text-xs text-gray-500">{t('educational_materials.uploadHint')}</p>
                    <button onClick={open} className="mt-4 px-4 py-2 text-sm font-semibold bg-primary text-white rounded-lg">{t('educational_materials.selectFiles')}</button>
                </div>

                {/* Filters */}
                <div className="flex flex-col md:flex-row justify-between gap-4">
                     <div className="flex flex-wrap items-center gap-2">
                        {categories.map(cat => (
                            <button key={cat} onClick={() => setActiveCategory(cat)} className={`px-4 py-1.5 text-sm font-semibold rounded-full transition-colors ${activeCategory === cat ? 'bg-primary text-white' : 'bg-card dark:bg-dark-card border dark:border-slate-600'}`}>
                                {t(`educational_materials.categories.${cat}`)}
                            </button>
                        ))}
                    </div>
                     <div className="relative">
                        <SearchIcon className="w-5 h-5 absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
                        <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder={t('educational_materials.searchPlaceholder')} className="w-full md:w-64 p-2 pl-10 text-sm border rounded-full bg-card dark:bg-dark-card dark:border-slate-600"/>
                    </div>
                </div>
                
                {/* Files Grid */}
                <AnimatePresence>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                        {filteredFiles.map(file => <FileCard key={file.id} file={file} />)}
                    </div>
                </AnimatePresence>
                {/* FIX: Removed undefined 'isLoading' variable from condition. */}
                {filteredFiles.length === 0 && (
                    <div className="text-center py-16 text-gray-500">
                        <p>{t('educational_materials.noFilesFound')}</p>
                    </div>
                )}
            </div>
        </>
    );
};

export default EducationalMaterials;
