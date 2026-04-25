


import React from 'react';
import { motion } from 'framer-motion';
import { useLocalization } from '../../hooks/useLocalization';
import type { EducationalFile, EducationalFileType } from '../../types';
import { formatDate } from '../../lib/utils';
import { MoreHorizontal, Eye, Download, Trash2 } from 'lucide-react';
// FIX: Added ZipIcon to imports and consolidated icon imports.
import { PdfIcon, PptIcon, ImageIcon, VideoIcon, FileIcon as GenericFileIcon, WordIcon, ZipIcon } from '../../icons/FiletypeIcons';

// File type to icon mapping
// FIX: Added 'docx', 'ppt' and 'zip' to the fileTypeToIcon map to support more file types.
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

interface FileCardProps {
    file: EducationalFile;
    onPreview: (file: EducationalFile) => void;
    onDelete: (id: string) => void;
}

const FileCard: React.FC<FileCardProps> = ({ file, onPreview, onDelete }) => {
    const { t, language } = useLocalization();
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
                    <button onClick={() => onPreview(file)} className="flex-1 flex items-center justify-center gap-1 py-1 text-xs border rounded-md hover:bg-gray-100 dark:border-slate-600 dark:hover:bg-slate-700"><Eye size={14}/> {t('educational_materials.preview')}</button>
                    <a href={file.url} download={file.name} className="flex-1 flex items-center justify-center gap-1 py-1 text-xs border rounded-md hover:bg-gray-100 dark:border-slate-600 dark:hover:bg-slate-700"><Download size={14}/> {t('educational_materials.download')}</a>
                    <button onClick={() => onDelete(file.id)} className="p-1.5 border rounded-md hover:bg-red-100 dark:hover:bg-red-900/50 text-red-500 dark:text-red-400"><Trash2 size={14}/></button>
                </div>
            </div>
        </motion.div>
    );
};

export default FileCard;
