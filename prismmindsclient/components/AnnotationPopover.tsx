"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check } from "lucide-react";

interface AnnotationPopoverProps {
    selectedText: string;
    position: { x: number; y: number };
    onSave: (note: string, color: string) => void;
    onCancel: () => void;
    initialNote?: string;
    initialColor?: string;
}

const COLORS = [
    { name: "yellow", bg: "bg-yellow-200", border: "border-yellow-400", hover: "hover:bg-yellow-300" },
    { name: "green", bg: "bg-green-200", border: "border-green-400", hover: "hover:bg-green-300" },
    { name: "blue", bg: "bg-blue-200", border: "border-blue-400", hover: "hover:bg-blue-300" },
    { name: "pink", bg: "bg-pink-200", border: "border-pink-400", hover: "hover:bg-pink-300" },
    { name: "purple", bg: "bg-purple-200", border: "border-purple-400", hover: "hover:bg-purple-300" },
];

export default function AnnotationPopover({
    selectedText,
    position,
    onSave,
    onCancel,
    initialNote = "",
    initialColor = "yellow",
}: AnnotationPopoverProps) {
    const [note, setNote] = useState(initialNote);
    const [color, setColor] = useState(initialColor);

    const handleSave = () => {
        if (note.trim()) {
            onSave(note.trim(), color);
        }
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 10 }}
                transition={{ duration: 0.2 }}
                className="fixed z-[9999] w-[90vw] sm:w-96 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden"
                style={{
                    left: `${Math.min(position.x, window.innerWidth - 400)}px`,
                    top: `${Math.min(position.y + 10, window.innerHeight - 400)}px`,
                }}
            >
                {/* Header */}
                <div className="px-4 py-3 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-slate-800 dark:to-slate-800 border-b border-slate-200 dark:border-slate-700">
                    <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
                                Add Annotation
                            </h3>
                            <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 italic">
                                "{selectedText}"
                            </p>
                        </div>
                        <button
                            onClick={onCancel}
                            className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex-shrink-0"
                        >
                            <X className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                        </button>
                    </div>
                </div>

                {/* Body */}
                <div className="p-4 space-y-4">
                    {/* Note Input */}
                    <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                            Your Note
                        </label>
                        <textarea
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            placeholder="Add your thoughts, insights, or questions..."
                            className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all resize-none"
                            rows={3}
                            autoFocus
                        />
                    </div>

                    {/* Color Picker */}
                    <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                            Highlight Color
                        </label>
                        <div className="flex gap-2 flex-wrap">
                            {COLORS.map((c) => (
                                <button
                                    key={c.name}
                                    onClick={() => setColor(c.name)}
                                    className={`w-10 h-10 rounded-lg border-2 ${c.bg} ${color === c.name ? c.border : "border-transparent"
                                        } ${c.hover} transition-all flex items-center justify-center`}
                                    title={c.name}
                                >
                                    {color === c.name && (
                                        <Check className="w-5 h-5 text-slate-700" />
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700 flex gap-2 justify-end">
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={!note.trim()}
                        className="px-4 py-2 rounded-lg text-sm font-medium bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:from-orange-600 hover:to-amber-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                    >
                        Save Note
                    </button>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
