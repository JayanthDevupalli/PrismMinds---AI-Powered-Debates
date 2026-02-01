"use client";

import { useState, useEffect } from "react";
import {
    Annotation,
    CreateAnnotationData,
    createAnnotation,
    getAnnotations,
    updateAnnotation,
    deleteAnnotation,
} from "@/lib/api/annotations";

export function useAnnotations(debateId: string | null) {
    const [annotations, setAnnotations] = useState<Annotation[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Fetch annotations when debateId changes
    useEffect(() => {
        if (!debateId) {
            setAnnotations([]);
            return;
        }

        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                const data = await getAnnotations(debateId);
                setAnnotations(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : "Failed to fetch annotations");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [debateId]);

    const addAnnotation = async (data: CreateAnnotationData) => {
        if (!debateId) throw new Error("No debate selected");

        try {
            const newAnnotation = await createAnnotation(debateId, data);
            setAnnotations((prev) => [...prev, newAnnotation]);
            return newAnnotation;
        } catch (err) {
            throw err;
        }
    };

    const editAnnotation = async (
        annotationId: string,
        data: { note?: string; color?: string }
    ) => {
        if (!debateId) throw new Error("No debate selected");

        try {
            const updatedAnnotation = await updateAnnotation(debateId, annotationId, data);
            setAnnotations((prev) =>
                prev.map((ann) => (ann.id === annotationId ? updatedAnnotation : ann))
            );
            return updatedAnnotation;
        } catch (err) {
            throw err;
        }
    };

    const removeAnnotation = async (annotationId: string) => {
        if (!debateId) throw new Error("No debate selected");

        try {
            await deleteAnnotation(debateId, annotationId);
            setAnnotations((prev) => prev.filter((ann) => ann.id !== annotationId));
        } catch (err) {
            throw err;
        }
    };

    return {
        annotations,
        loading,
        error,
        addAnnotation,
        editAnnotation,
        removeAnnotation,
    };
}
