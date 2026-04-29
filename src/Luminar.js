import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { Studio } from "./Studio";
import { SubscriptionProvider } from './context/SubscriptionContext';

export function Luminar() {
    // Detect if running in Capacitor/mobile
    const isMobile = window.location.pathname === '/' && !window.location.pathname.includes('/Luminar');
    const basename = isMobile ? '/' : '/Luminar';

    return (
        <Router basename={basename}>
            <SubscriptionProvider>
                <div className="luminar">
                    <Studio />
                </div>
            </SubscriptionProvider>
        </Router>
    );
}