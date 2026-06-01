"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, ShieldCheck } from 'lucide-react';

export default function SubmittedPage() {
    const router = useRouter();

    useEffect(() => {
        const submitted = window.localStorage.getItem('dc-hiring-form-submitted');

        if (submitted !== 'true') {
            router.replace('/');
        }
    }, [router]);

    return (
        <main className="min-h-screen bg-background text-foreground flex items-center justify-center px-6 py-12">
            <div className="max-w-xl w-full border border-border bg-surface/80 backdrop-blur rounded-3xl p-8 md:p-10 shadow-2xl shadow-black/40">
                <div className="flex items-center gap-3 text-accent mb-6">
                    <CheckCircle2 size={28} />
                    <span className="font-semibold uppercase tracking-[0.2em] text-xs">Submitted</span>
                </div>

                <h1 className="text-3xl md:text-4xl font-black text-white mb-4">Your application has been submitted.</h1>
                <p className="text-text-secondary text-base md:text-lg leading-7 mb-8">
                    We have received your form and you cannot submit it again from this browser session.
                    Keep an eye on your email for the next steps.
                </p>

                <div className="flex items-start gap-3 rounded-2xl border border-accent/30 bg-accent/10 p-4 text-sm text-white/90 mb-8">
                    <ShieldCheck size={18} className="mt-0.5 text-accent shrink-0" />
                    <span>The form is locked after submission, and going back will not reopen it.</span>
                </div>

            </div>
        </main>
    );
}