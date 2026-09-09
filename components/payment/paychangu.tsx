// components/PaychanguScripts.tsx
'use client';
import Script from 'next/script';
import { useState } from 'react';

export function PaychanguScripts() {
    const [jqueryLoaded, setJqueryLoaded] = useState(false);

    return (
        <>
            <Script
                src="https://code.jquery.com/jquery-3.7.1.min.js"
                strategy="afterInteractive"
                onLoad={() => setJqueryLoaded(true)}
            />
            {jqueryLoaded && (
                <Script src="https://in.paychangu.com/js/popup.js" strategy="afterInteractive" />
            )}
        </>
    );
}