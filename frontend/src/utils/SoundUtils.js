/**
 * Sound & Notification Utilities
 * Uses Web Audio API for zero-asset, reliable sound synthesis.
 * Uses browser Notification API for desktop notifications.
 */

export const getPreference = (key, defaultValue = true) => {
    try {
        const val = localStorage.getItem(key);
        if (val === null) return defaultValue;
        return val === "true";
    } catch {
        return defaultValue;
    }
};

export const setPreference = (key, value) => {
    try {
        localStorage.setItem(key, value ? "true" : "false");
    } catch (e) {
        console.error("Failed to save preference", e);
    }
};

let lastNotificationSoundTime = 0;

/**
 * Play a gentle, modern two-tone notification sound (frequencies ~587Hz -> 880Hz)
 */
export const playNotificationSound = () => {
    if (!getPreference("chatSounds", true)) return;

    const now = Date.now();
    if (now - lastNotificationSoundTime < 300) return; // Prevent overlapping sound spam
    lastNotificationSoundTime = now;

    try {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (!AudioContextClass) return;
        const ctx = new AudioContextClass();

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.1); // A5

        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start();
        osc.stop(ctx.currentTime + 0.3);
    } catch (e) {
        console.warn("Unable to play notification tone:", e);
    }
};

/**
 * Play a subtle click/pop sound when a message is successfully sent
 */
export const playSendSound = () => {
    if (!getPreference("chatSounds", true)) return;

    try {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (!AudioContextClass) return;
        const ctx = new AudioContextClass();

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(659.25, ctx.currentTime + 0.08);

        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start();
        osc.stop(ctx.currentTime + 0.15);
    } catch (e) {
        console.warn("Unable to play send tone:", e);
    }
};

/**
 * Request desktop notification permissions from the browser
 */
export const requestDesktopNotificationPermission = async () => {
    if (!("Notification" in window)) {
        return "unsupported";
    }

    try {
        const permission = await Notification.requestPermission();
        return permission;
    } catch (e) {
        console.error("Error requesting notification permission:", e);
        return "denied";
    }
};

/**
 * Show a desktop notification if enabled and permitted
 */
export const showDesktopNotification = (title, options = {}) => {
    if (!getPreference("desktopNotifications", true)) return;
    if (!("Notification" in window)) return;
    if (Notification.permission !== "granted") return;

    try {
        const notif = new Notification(title, {
            icon: "/chat.png",
            badge: "/chat.png",
            ...options
        });

        notif.onclick = () => {
            window.focus();
            notif.close();
        };

        // Auto close after 5 seconds
        setTimeout(() => {
            try { notif.close(); } catch { /* ignore */ }
        }, 5000);
    } catch (e) {
        console.warn("Failed to display desktop notification:", e);
    }
};
