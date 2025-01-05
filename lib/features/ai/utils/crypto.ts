/**
 * Crypto Utilities
 * 
 * Provides cryptographic functions for:
 * - Content hashing
 * - SHA-256 implementation
 * - Binary to hex conversion
 * 
 * Features:
 * - Async hash generation
 * - Web Crypto API usage
 * - Consistent hash formatting
 */

export async function createHash(content: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(content);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
} 