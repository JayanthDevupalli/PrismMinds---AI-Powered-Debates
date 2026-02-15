"use client";

import { Annotation } from "@/lib/api/annotations";

interface AnnotationHighlightProps {
    text: string;
    annotations: Annotation[];
    messageIndex: number;
    onAnnotationClick: (annotation: Annotation) => void;
}

const COLOR_CLASSES = {
    yellow: "bg-yellow-200 dark:bg-yellow-900/40 hover:bg-yellow-300 dark:hover:bg-yellow-900/60",
    green: "bg-green-200 dark:bg-green-900/40 hover:bg-green-300 dark:hover:bg-green-900/60",
    blue: "bg-blue-200 dark:bg-blue-900/40 hover:bg-blue-300 dark:hover:bg-blue-900/60",
    pink: "bg-pink-200 dark:bg-pink-900/40 hover:bg-pink-300 dark:hover:bg-pink-900/60",
    purple: "bg-purple-200 dark:bg-purple-900/40 hover:bg-purple-300 dark:hover:bg-purple-900/60",
};

export default function AnnotationHighlight({
    text,
    annotations,
    messageIndex,
    onAnnotationClick,
}: AnnotationHighlightProps) {
    // Filter annotations for this specific message
    const messageAnnotations = annotations.filter(
        (ann) => ann.messageIndex === messageIndex
    );

    if (messageAnnotations.length === 0) {
        return <span>{text}</span>;
    }

    // Sort annotations by start offset to handle overlaps
    const sortedAnnotations = [...messageAnnotations].sort(
        (a, b) => a.startOffset - b.startOffset
    );

    // Build segments of text with highlights
    const segments: Array<{
        text: string;
        annotation?: Annotation;
    }> = [];

    let currentPos = 0;

    sortedAnnotations.forEach((annotation) => {
        // Skip if this annotation is fully covered by a previous one
        if (annotation.endOffset <= currentPos) {
            return;
        }
        // Adjust start offset if there's an overlap
        const effectiveStart = Math.max(annotation.startOffset, currentPos);

        // Add non-highlighted text before this annotation (if any gap)
        if (currentPos < effectiveStart) {
            segments.push({
                text: text.slice(currentPos, effectiveStart),
            });
        }

        // Add highlighted text
        segments.push({
            text: text.slice(effectiveStart, annotation.endOffset),
            annotation,
        });

        currentPos = Math.max(currentPos, annotation.endOffset);
    });

    // Add remaining non-highlighted text
    if (currentPos < text.length) {
        segments.push({
            text: text.slice(currentPos),
        });
    }

    return (
        <>
            {segments.map((segment, index) =>
                segment.annotation ? (
                    <span
                        key={index}
                        className={`${COLOR_CLASSES[segment.annotation.color as keyof typeof COLOR_CLASSES]
                            } cursor-pointer rounded px-0.5 transition-all relative group inline-block`}
                        onClick={(e) => {
                            e.stopPropagation();
                            onAnnotationClick(segment.annotation!);
                        }}
                        title={segment.annotation.note}
                    >
                        {segment.text}
                        {/* Tooltip */}
                        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-slate-900 dark:bg-slate-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap max-w-xs truncate shadow-lg z-50">
                            {segment.annotation.note}
                        </span>
                    </span>
                ) : (
                    <span key={index}>{segment.text}</span>
                )
            )}
        </>
    );
}
