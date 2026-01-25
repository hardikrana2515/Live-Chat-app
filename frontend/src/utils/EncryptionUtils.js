import CryptoJS from 'crypto-js';

// In a real app, this should be a per-chat key or derived from ECDH.
// For this v1 implementation, we use a shared app secret to demonstrate "Stored Data Encryption".
// This means the server DB stores encrypted data, but the client (with this code) can read it.
// To make it true User-to-User E2EE, we would need to implement Public Key infrastructure.
const SECRET_KEY = "MY_SUPER_SECRET_CHAT_APP_KEY_V1";

export const encryptMessage = (message) => {
    if (!message) return "";
    return CryptoJS.AES.encrypt(message, SECRET_KEY).toString();
};

export const decryptMessage = (ciphertext) => {
    if (!ciphertext) return "";
    try {
        const bytes = CryptoJS.AES.decrypt(ciphertext, SECRET_KEY);
        const originalText = bytes.toString(CryptoJS.enc.Utf8);
        return originalText || ciphertext; // Return original if decrypt fails (legacy messages)
    } catch (e) {
        return ciphertext; // Fallback for plain text messages
    }
};

export const encryptFile = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            try {
                // file.result is DataURL (Base64)
                const wordArray = CryptoJS.lib.WordArray.create(reader.result); // Using WordArray if possible for efficiency, or just string
                // Actually, CryptoJS.AES.encrypt expects a string or WordArray. 
                // Reading as DataURL gives a string. Let's use that for simplicity.
                const encrypted = CryptoJS.AES.encrypt(reader.result, SECRET_KEY).toString();

                // Create a generic file from the encrypted string
                const encryptedBlob = new Blob([encrypted], { type: 'text/plain' });
                const encryptedFile = new File([encryptedBlob], file.name + ".enc", { type: file.type }); // Keep original type in metadata if possible, or just file.type
                resolve(encryptedFile);
            } catch (e) {
                reject(e);
            }
        };
        reader.onerror = (e) => reject(e);
        reader.readAsDataURL(file); // Read as output Base64 string
    });
};

export const decryptFile = async (url) => {
    // Check if it looks like an encrypted file
    if (!url.endsWith('.enc')) {
        return url;
    }

    try {
        const response = await fetch(url);
        const ciphertext = await response.text();

        const bytes = CryptoJS.AES.decrypt(ciphertext, SECRET_KEY);
        try {
            const originalDataUrl = bytes.toString(CryptoJS.enc.Utf8);

            if (!originalDataUrl.startsWith("data:")) {
                return url;
            }

            const res = await fetch(originalDataUrl);
            const blob = await res.blob();
            return URL.createObjectURL(blob);
        } catch (utfError) {
            // If UTF-8 conversion fails, it's likely not our encrypted package
            console.warn("Decryption artifact detected, returning original:", utfError);
            return url;
        }

    } catch (e) {
        console.error("Decryption failed", e);
        return url; // Return original URL if failure
    }
};

