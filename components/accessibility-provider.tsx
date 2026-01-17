'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import Cookies from 'js-cookie';

interface AccessibilitySettings {
    fontSize: 'small' | 'medium' | 'large';
    highContrast: boolean;
    reduceMotion: boolean;
}

interface AccessibilityContextType {
    settings: AccessibilitySettings;
    updateSettings: (settings: Partial<AccessibilitySettings>) => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

const defaultSettings: AccessibilitySettings = {
    fontSize: 'medium',
    highContrast: false,
    reduceMotion: false,
};

export function AccessibilityProvider({ children }: { children: React.ReactNode }) {
    const [settings, setSettings] = useState<AccessibilitySettings>(defaultSettings);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        // Load from cookies
        const fontSize = Cookies.get('fontSize') as 'small' | 'medium' | 'large' | undefined;
        const highContrast = Cookies.get('highContrast') === 'true';
        const reduceMotion = Cookies.get('reduceMotion') === 'true';

        setSettings({
            fontSize: fontSize || 'medium',
            highContrast,
            reduceMotion,
        });
    }, []);

    useEffect(() => {
        if (!mounted) return;

        const root = window.document.documentElement;

        // Apply font size
        root.classList.remove('text-sm', 'text-base', 'text-lg');
        if (settings.fontSize === 'small') root.classList.add('text-sm');
        else if (settings.fontSize === 'large') root.classList.add('text-lg');
        else root.classList.add('text-base');

        // Apply high contrast
        if (settings.highContrast) {
            root.classList.add('high-contrast');
        } else {
            root.classList.remove('high-contrast');
        }

        // Apply reduce motion
        if (settings.reduceMotion) {
            root.classList.add('reduce-motion');
        } else {
            root.classList.remove('reduce-motion');
        }
    }, [settings, mounted]);

    const updateSettings = (newSettings: Partial<AccessibilitySettings>) => {
        const updated = { ...settings, ...newSettings };
        setSettings(updated);

        // Save to cookies
        if (newSettings.fontSize) {
            Cookies.set('fontSize', newSettings.fontSize, { expires: 365 });
        }
        if (newSettings.highContrast !== undefined) {
            Cookies.set('highContrast', String(newSettings.highContrast), { expires: 365 });
        }
        if (newSettings.reduceMotion !== undefined) {
            Cookies.set('reduceMotion', String(newSettings.reduceMotion), { expires: 365 });
        }
    };

    return (
        <AccessibilityContext.Provider value={{ settings, updateSettings }}>
            {children}
        </AccessibilityContext.Provider>
    );
}

export function useAccessibility() {
    const context = useContext(AccessibilityContext);
    if (context === undefined) {
        throw new Error('useAccessibility must be used within an AccessibilityProvider');
    }
    return context;
}
