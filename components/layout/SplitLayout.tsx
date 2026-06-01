import React from 'react';
import Image from 'next/image';
import { AnimatedTitleWord } from '../ui/AnimatedTitleWord';
import { Antigravity } from '../ui/Antigravity';
import { TerminalPrompt } from '../ui/TerminalPrompt';

interface SplitLayoutProps {
  children: React.ReactNode;
}

export function SplitLayout({ children }: SplitLayoutProps) {
  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-background text-white">
      {/* Left Branding Panel */}
      <div className="relative w-full lg:w-[45%] flex flex-col p-8 lg:p-16 lg:fixed lg:h-screen lg:left-0 lg:top-0 border-r border-border/50 overflow-hidden group">
        {/* Animated Antigravity Dot Matrix Background */}
        <div className="absolute inset-0 pointer-events-none opacity-60">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,rgba(0,168,68,0.15),transparent_60%)]" />
          <Antigravity particleColor="#00a844" particleSize={3} />
        </div>

        {/* Top Logo */}
        <div className="flex items-center gap-3 z-10 px-4 py-3">
          <Image
            src="/dcLogo.webp"
            alt="Dev Community Logo"
            width={40}
            height={40}
            className="object-contain"
          />
          <div className="font-black text-xl tracking-wider font-mono text-white">DEV COMMUNITY-KGEC</div>
        </div>

        {/* Center Content Wrapper */}
        <div className="flex flex-col flex-1 justify-center mt-12 lg:mt-0">
          {/* Main Title */}
          <div className="mb-8 z-10 max-w-2xl pr-4">
            <h1 className="text-4xl lg:text-5xl xl:text-6xl font-black leading-[1.1] tracking-tight">
              We&apos;re looking for<br />
              <AnimatedTitleWord /><br />
              to shape what&apos;s next
            </h1>
          </div>

          {/* Bottom Branding / Slogan */}
          <div className="z-10 flex flex-col gap-3">
            <h2 className="text-2xl lg:text-3xl font-bold tracking-tight select-none">
              We build. <span className="text-text-secondary/70">We break.</span> <span className="text-accent">We ship.</span>
            </h2>
            <TerminalPrompt />
          </div>
        </div>
      </div>

      {/* Right Content Area */}
      <div className="w-full lg:w-[55%] lg:ml-[45%] flex flex-col min-h-screen">
        {/* Main Form Content Container */}
        <div className="flex-1 px-8 pt-12 lg:pt-16 pb-16 max-w-3xl w-full mx-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
