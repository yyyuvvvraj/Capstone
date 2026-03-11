import React, { createContext, useContext, useEffect, useRef } from 'react';
import { useAuth } from './AuthContext';

const TelemetryContext = createContext();

export const TelemetryProvider = ({ children }) => {
    const { token, sessionId } = useAuth();
    const batchRef = useRef([]);
    const lastKeyTimeRef = useRef(null);
    const idleTimeoutRef = useRef(null);
    const BATCH_INTERVAL = 5000; // Send data every 5 seconds

    // Feature 11: Idle Time Tracking
    const resetIdleTimer = () => {
        if (idleTimeoutRef.current) clearTimeout(idleTimeoutRef.current);
        idleTimeoutRef.current = setTimeout(() => {
            pushEvent('idle', { duration: 60000 }); // Idle for 1 minute
        }, 60000);
    };

    const pushEvent = (type, data) => {
        batchRef.current.push({ type, data, timestamp: new Date().toISOString() });
        resetIdleTimer();
    };

    // Tracking Listeners
    useEffect(() => {
        if (!token || !sessionId) return;

        // Feature 6: Mouse Dynamics
        let lastMouseTime = Date.now();
        let lastMouseX = 0;
        let lastMouseY = 0;

        const handleMouseMove = (e) => {
            const now = Date.now();
            if (now - lastMouseTime > 500) { // throttle
                const distance = Math.sqrt(Math.pow(e.clientX - lastMouseX, 2) + Math.pow(e.clientY - lastMouseY, 2));
                const speed = distance / (now - lastMouseTime);
                pushEvent('mouse_move', { speed, x: e.clientX, y: e.clientY });
                lastMouseTime = now;
                lastMouseX = e.clientX;
                lastMouseY = e.clientY;
            }
        };

        const handleMouseClick = (e) => {
            pushEvent('mouse_click', { x: e.clientX, y: e.clientY });
        };

        // Feature 5: Keystroke Dynamics
        const handleKeyDown = (e) => {
            const now = Date.now();
            let flightTime = null;
            if (lastKeyTimeRef.current) {
                flightTime = now - lastKeyTimeRef.current.upTime;
            }
            lastKeyTimeRef.current = { downTime: now, key: e.key };
            
            // Feature 9: Form corrections (Backspace tracking)
            if (e.key === 'Backspace') {
                pushEvent('form_correction', { key: 'Backspace' });
            }
        };

        const handleKeyUp = (e) => {
            const now = Date.now();
            if (lastKeyTimeRef.current && lastKeyTimeRef.current.key === e.key) {
                const pressTime = now - lastKeyTimeRef.current.downTime;
                lastKeyTimeRef.current.upTime = now;
                pushEvent('keystroke', { key: 'masked', pressTime, flightTime: lastKeyTimeRef.current.flightTime || 0 });
            }
        };

        // Feature 8: Scroll Pattern Tracking
        let scrollTimeout;
        const handleScroll = () => {
            if (scrollTimeout) clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                pushEvent('scroll', { scrollY: window.scrollY });
            }, 1000);
        };

        // Feature 10: Copy/Paste Detection
        const handleCopy = () => pushEvent('clipboard', { action: 'copy' });
        const handlePaste = () => pushEvent('clipboard', { action: 'paste' });

        // Feature 12: Window Focus/Blur (Tab switching)
        const handleVisibilityChange = () => {
            pushEvent('visibility', { state: document.visibilityState });
        };

        // Feature 7: Navigation Event Tracking
        pushEvent('navigation', { path: window.location.pathname });

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('click', handleMouseClick);
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        window.addEventListener('scroll', handleScroll);
        window.addEventListener('copy', handleCopy);
        window.addEventListener('paste', handlePaste);
        document.addEventListener('visibilitychange', handleVisibilityChange);

        resetIdleTimer();

        // Feature 13: Device Fingerprinting
        pushEvent('device_fingerprint', {
            userAgent: navigator.userAgent,
            language: navigator.language,
            screenW: window.screen.width,
            screenH: window.screen.height,
            colorDepth: window.screen.colorDepth
        });

        // Batch Sender
        const interval = setInterval(() => {
            if (batchRef.current.length > 0) {
                const eventsToSend = [...batchRef.current];
                batchRef.current = [];
                
                fetch('http://localhost:5000/api/telemetry/capture', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-session-id': sessionId
                    },
                    body: JSON.stringify({ events: eventsToSend })
                }).catch(err => console.error("Telemetry send failed", err));
            }
        }, BATCH_INTERVAL);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('click', handleMouseClick);
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('copy', handleCopy);
            window.removeEventListener('paste', handlePaste);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            clearInterval(interval);
            if (idleTimeoutRef.current) clearTimeout(idleTimeoutRef.current);
        };
    }, [token, sessionId]);

    return (
        <TelemetryContext.Provider value={{}}>
            {children}
        </TelemetryContext.Provider>
    );
};
