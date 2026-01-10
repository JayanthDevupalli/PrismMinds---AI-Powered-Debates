import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getFriendlyErrorMessage(error: any): string {
  if (!error) return "An unknown error occurred"

  const code = error.code || ""
  const message = error.message || ""

  switch (code) {
    case "auth/wrong-password":
      return "Incorrect password. Please verify your current password."
    case "auth/user-not-found":
      return "User account not found."
    case "auth/too-many-requests":
      return "Too many failed attempts. Please try again later."
    case "auth/email-already-in-use":
      return "This email is already in use by another account."
    case "auth/requires-recent-login":
      return "For security, please log out and log back in to continue."
    case "auth/weak-password":
      return "Password is too weak. Please use a stronger password."
    case "auth/network-request-failed":
      return "Network error. Please check your internet connection."
    case "permission-denied":
      return "You do not have permission to perform this action."
    default:
      // Fallback: Clean up "Firebase: Error (auth/foo)." format if present
      if (message.includes("Firebase:")) {
        return message.replace("Firebase:", "").replace(/\(auth\/.*\)\.?/, "").trim()
      }
      return message || "An unexpected error occurred."
  }
}
