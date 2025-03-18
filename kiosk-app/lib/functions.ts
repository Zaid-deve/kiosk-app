"use client";

// Function to generate a random guest ID
export function generateGuestId(): string {
    return 'guest-' + Date.now() + '-' + Math.random().toString(36).slice(2, 9);
}