// prismmindsclient/lib/api/annotations.ts
import { getAuth } from "firebase/auth";

// const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
const API_URL = "https://prismmindsdb.onrender.com";

export interface Annotation {
    id: string;
    messageIndex: number;
    selectedText: string;
    note: string;
    color: "yellow" | "green" | "blue" | "pink" | "purple";
    startOffset: number;
    endOffset: number;
    createdAt: string;
    updatedAt: string;
}

export interface CreateAnnotationData {
    messageIndex: number;
    selectedText: string;
    note: string;
    color?: "yellow" | "green" | "blue" | "pink" | "purple";
    startOffset?: number;
    endOffset?: number;
}

async function getAuthToken(): Promise<string> {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) throw new Error("User not authenticated");
    return await user.getIdToken();
}

export async function createAnnotation(
    debateId: string,
    data: CreateAnnotationData
): Promise<Annotation> {
    const token = await getAuthToken();
    const response = await fetch(`${API_URL}/api/annotations/${debateId}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create annotation");
    }

    const result = await response.json();
    return result.annotation;
}

export async function getAnnotations(debateId: string): Promise<Annotation[]> {
    const token = await getAuthToken();
    const response = await fetch(`${API_URL}/api/annotations/${debateId}`, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to fetch annotations");
    }

    const result = await response.json();
    return result.annotations;
}

export async function updateAnnotation(
    debateId: string,
    annotationId: string,
    data: { note?: string; color?: string }
): Promise<Annotation> {
    const token = await getAuthToken();
    const response = await fetch(
        `${API_URL}/api/annotations/${debateId}/${annotationId}`,
        {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(data),
        }
    );

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update annotation");
    }

    const result = await response.json();
    return result.annotation;
}

export async function deleteAnnotation(
    debateId: string,
    annotationId: string
): Promise<void> {
    const token = await getAuthToken();
    const response = await fetch(
        `${API_URL}/api/annotations/${debateId}/${annotationId}`,
        {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete annotation");
    }
}
