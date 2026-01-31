"use client";

import { motion, AnimatePresence } from "framer-motion";
import { StickyNote, Trash2, Edit3, X, Filter } from "lucide-react";
import { Annotation } from "@/lib/api/annotations";
import { useState } from "react";

interface AnnotationSidebarProps {
    annotations: Annotation[];
    isOpen: boolean;
    onClose: () => void;
    onAnnotationClick: (annotation: Annotation) => void;
    onEdit: (annotation: Annotation) => void;
    onDelete: (annotationId: string) => void;
}

const COLOR_CLASSES = {
    yellow: "bg-yellow-100 dark:bg-yellow-900/30 border-yellow-400",
    green: "bg-green-100 dark:bg-green-900/30 border-green-400",
    blue: "bg-blue-100 dark:bg-blue-900/30 border-blue-400",
    pink: "bg-pink-100 dark:bg-pink-900/30 border-pink-400",
    purple: "bg-purple-100 dark:bg-purple-900/30 border-purple-400",
};

export default function AnnotationSidebar({
    annotations,
    isOpen,
    onClose,
    onAnnotationClick,
    onEdit,
    onDelete,
}: AnnotationSidebarProps) {
    const [filterColor, setFilterColor] = useState<string | null>(null);

    const filteredAnnotations = filterColor
        ? annotations.filter((ann) => ann.color === filterColor)
        : annotations;

    if (!isOpen) return null;

    return (
        <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: "100%", opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="h-full bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-700 flex flex-col overflow-hidden"
        >
            {/* Header */}
            <div className="px-4 py-3 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-slate-800 dark:to-slate-800 border-b border-slate-200 dark:border-slate-700 flex-shrink-0">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center">
                            <StickyNote className="w-4 h-4 text-white" />
                        </div>
                        <h3 className="text-base font-bold text-slate-900 dark:text-white">
                            Annotations
                        </h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                    >
                        <X className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                    </button>
                </div>

                {/* Filter */}
                <div className="flex items-center gap-2">
                    <Filter className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                    <div className="flex gap-1 flex-wrap overflow-x-auto">
                        <button
                            onClick={() => setFilterColor(null)}
                            className={`px-2 py-0.5 rounded-full text-[10px] font-medium transition-all whitespace-nowrap ${filterColor === null
                                    ? "bg-orange-500 text-white"
                                    : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-300"
                                }`}
                        >
                            All ({annotations.length})
                        </button>
                        {["yellow", "green", "blue", "pink", "purple"].map((color) => {
                            const count = annotations.filter((a) => a.color === color).length;
                            if (count === 0) return null;
                            return (
                                <button
                                    key={color}
                                    onClick={() => setFilterColor(color)}
                                    className={`px-2 py-0.5 rounded-full text-[10px] font-medium transition-all whitespace-nowrap ${filterColor === color
                                            ? COLOR_CLASSES[color as keyof typeof COLOR_CLASSES]
                                            : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-300"
                                        }`}
                                >
                                    {color} ({count})
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Annotations List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {filteredAnnotations.length === 0 ? (
                    <div className="text-center py-8">
                        <StickyNote className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            {filterColor
                                ? `No ${filterColor} annotations`
                                : "No annotations yet"}
                        </p>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
                            Select text to add notes
                        </p>
                    </div>
                ) : (
                    filteredAnnotations.map((annotation, index) => (
                        <motion.div
                            key={annotation.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.03 }}
                            className={`p-2.5 rounded-lg border ${COLOR_CLASSES[annotation.color as keyof typeof COLOR_CLASSES]
                                } cursor-pointer hover:shadow-sm transition-all group`}
                            onClick={() => onAnnotationClick(annotation)}
                        >
                            <div className="flex items-start justify-between gap-2 mb-1.5">
                                <p className="text-[10px] font-medium text-slate-600 dark:text-slate-400 italic line-clamp-1 flex-1">
                                    "{annotation.selectedText}"
                                </p>
                                <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onEdit(annotation);
                                        }}
                                        className="p-1 rounded hover:bg-white/50 dark:hover:bg-slate-800/50 transition-colors"
                                        title="Edit"
                                    >
                                        <Edit3 className="w-3 h-3 text-slate-600 dark:text-slate-400" />
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (confirm("Delete this annotation?")) {
                                                onDelete(annotation.id);
                                            }
                                        }}
                                        className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                                        title="Delete"
                                    >
                                        <Trash2 className="w-3 h-3 text-red-600" />
                                    </button>
                                </div>
                            </div>
                            <p className="text-xs text-slate-800 dark:text-slate-200 mb-1.5 line-clamp-2">
                                {annotation.note}
                            </p>
                            <p className="text-[9px] text-slate-400 dark:text-slate-500">
                                {new Date(annotation.createdAt).toLocaleDateString()} at{" "}
                                {new Date(annotation.createdAt).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                })}
                            </p>
                        </motion.div>
                    ))
                )}
            </div>
        </motion.div>
    );
}
