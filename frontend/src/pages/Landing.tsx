import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const Landing = () => {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [emailInput, setEmailInput] = useState('');

  useEffect(() => {
    // Smooth scroll for anchor links
    const handleAnchorClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest('a[href^="#"]');
      if (anchor) {
        const href = anchor.getAttribute('href');
        if (href && href.startsWith('#') && href.length > 1) {
          e.preventDefault();
          const targetEl = document.querySelector(href);
          if (targetEl) {
            targetEl.scrollIntoView({ behavior: 'smooth' });
            setIsMobileMenuOpen(false);
          }
        }
      }
    };

    document.addEventListener('click', handleAnchorClick);
    return () => document.removeEventListener('click', handleAnchorClick);
  }, []);

  const handleConnectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // There is no sign-up: the demo opens straight into the active role.
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#020617] text-[#d4e4fa] font-sans selection:bg-blue-500/30 selection:text-blue-200 overflow-x-hidden relative">
      
      {/* Prominent Fixed Top-Left Brand Logo Badge */}
      <div 
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="fixed top-5 left-6 md:left-10 z-50 flex items-center gap-3.5 bg-slate-950/90 backdrop-blur-2xl border border-white/20 p-2.5 px-4 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.8)] cursor-pointer hover:border-purple-500/50 hover:scale-105 transition-all duration-300 group"
      >
        <div className="p-1 bg-white rounded-xl shadow-md border border-white/40 flex items-center justify-center shrink-0">
          <img 
            alt="LaunchNest Logo" 
            className="h-10 w-10 md:h-12 md:w-12 object-contain rounded-lg" 
            src="/launchnest-logo.jpg" 
          />
        </div>
        <div className="flex flex-col">
          <span className="text-lg md:text-xl font-extrabold font-sans tracking-tight text-white leading-none">
            Launch<span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">Nest</span>
          </span>
          <span className="text-[9px] md:text-[10px] font-mono font-bold text-purple-300 tracking-[0.16em] uppercase mt-1">
            Where Startups Take Flight
          </span>
        </div>
      </div>

      {/* Ambient background glow effects */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden" aria-hidden="true">
        <div className="absolute top-[-10%] left-[15%] w-[600px] h-[600px] rounded-full bg-blue-600/10 blur-[140px]" />
        <div className="absolute top-[30%] right-[10%] w-[500px] h-[500px] rounded-full bg-purple-600/10 blur-[160px]" />
        <div className="absolute bottom-[10%] left-[20%] w-[700px] h-[700px] rounded-full bg-indigo-600/08 blur-[180px]" />
      </div>

      {/* Desktop Floating Pill TopNavBar */}
      <nav className="fixed top-6 left-1/2 -translate-x-1/2 w-fit rounded-full border border-white/10 px-6 py-2 bg-slate-900/70 backdrop-blur-xl shadow-[0_4px_24px_rgba(0,0,0,0.4)] items-center gap-8 z-50 transition-transform hidden md:flex">
        <a className="flex items-center gap-3 mr-2 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <img 
            alt="LaunchNest Logo" 
            className="h-8 w-auto object-contain rounded-lg border border-white/20 bg-white p-0.5 shadow-sm" 
            src="/launchnest-logo.jpg"
          />
          <span className="text-xl tracking-tight text-white font-bold font-sans">
            Launch<span className="text-purple-400">Nest</span>
          </span>
        </a>
        <div className="flex items-center gap-8 text-[12px] font-mono font-semibold uppercase tracking-wider text-slate-400">
          <a className="text-slate-200 hover:text-blue-400 transition-colors" href="#ecosystem">Ecosystem</a>
          <a className="hover:text-slate-200 transition-colors" href="#incubation">Incubation</a>
          <a className="hover:text-slate-200 transition-colors" href="#ventures">Ventures</a>
          <a className="hover:text-slate-200 transition-colors" href="#network">Network</a>
        </div>
        <div className="flex items-center gap-3 ml-2">
          <button 
            onClick={() => navigate('/login')}
            className="px-4 py-1.5 rounded-full text-xs font-mono font-semibold text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            Enter Demo
          </button>
          <button 
            onClick={() => navigate('/login')} 
            className="btn-primary px-5 py-2 rounded-full font-mono text-[11px] font-bold uppercase tracking-wider"
          >
            Launch Portal
          </button>
        </div>
      </nav>

      {/* Mobile Nav */}
      <nav className="md:hidden fixed top-0 left-0 w-full p-4 flex justify-between items-center glass-panel z-50 border-t-0 border-l-0 border-r-0 rounded-none bg-slate-950/80 backdrop-blur-lg">
        <a className="flex items-center gap-2.5 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <img 
            alt="LaunchNest Logo" 
            className="h-7 w-auto object-contain rounded-md border border-white/20 bg-white p-0.5" 
            src="/launchnest-logo.jpg"
          />
          <span className="text-xl tracking-tight text-white font-bold font-sans">
            Launch<span className="text-purple-400">Nest</span>
          </span>
        </a>
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
          className="text-white p-2 rounded-md hover:bg-white/5"
          aria-label="Toggle Menu"
        >
          <span className="material-symbols-outlined">{isMobileMenuOpen ? 'close' : 'menu'}</span>
        </button>
      </nav>

      {/* Mobile Nav Dropdown */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-[64px] left-0 w-full bg-slate-950/95 border-b border-white/10 z-40 md:hidden flex flex-col p-6 space-y-4 backdrop-blur-2xl"
          >
            <a href="#ecosystem" className="text-base font-mono text-slate-300 hover:text-white" onClick={() => setIsMobileMenuOpen(false)}>Ecosystem</a>
            <a href="#incubation" className="text-base font-mono text-slate-300 hover:text-white" onClick={() => setIsMobileMenuOpen(false)}>Incubation</a>
            <a href="#ventures" className="text-base font-mono text-slate-300 hover:text-white" onClick={() => setIsMobileMenuOpen(false)}>Ventures</a>
            <a href="#network" className="text-base font-mono text-slate-300 hover:text-white" onClick={() => setIsMobileMenuOpen(false)}>Network</a>
            <hr className="border-white/10 my-2" />
            <button onClick={() => { navigate('/login'); setIsMobileMenuOpen(false); }} className="btn-secondary w-full py-3 rounded-xl font-mono text-sm">Sign In</button>
            <button onClick={() => { navigate('/login'); setIsMobileMenuOpen(false); }} className="btn-primary w-full py-3 rounded-xl font-mono text-sm uppercase font-bold tracking-wider">Launch Portal</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Container */}
      <main className="pt-32 md:pt-44 pb-24 px-6 md:px-16 max-w-[1240px] mx-auto space-y-32">
        
        {/* 1. Hero Section (3D Integrated) */}
        <section className="relative min-h-[65vh] flex flex-col md:flex-row items-center justify-between gap-12 text-center md:text-left">
          {/* Text Content */}
          <div className="flex-1 z-10 space-y-6">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-300 font-mono text-[11px] uppercase tracking-wider mb-2"
            >
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
              System v2.4 Online
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-4xl sm:text-5xl md:text-6xl text-white font-extrabold leading-[1.15] tracking-tight"
            >
              Architecting the <br />
              <span className="text-gradient">Future Ecosystem</span>
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-slate-300 text-lg max-w-lg mb-8 mx-auto md:mx-0 leading-relaxed font-normal"
            >
              A cyber-industrial terminal for technical innovators and creative professionals. Connect, incubate, and scale within a hyper-structured digital environment.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start"
            >
              <button 
                onClick={() => navigate('/login')}
                className="btn-primary px-8 py-3.5 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold tracking-wide"
              >
                Initialize Project <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
              <button 
                onClick={() => navigate('/login')}
                className="btn-secondary px-8 py-3.5 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold tracking-wide"
              >
                <span className="material-symbols-outlined text-sm">terminal</span> Terminal Access
              </button>
            </motion.div>
          </div>

          {/* 3D Composition Area */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="flex-1 relative w-full aspect-square max-w-md mx-auto z-0"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/20 to-purple-600/20 rounded-full filter blur-[90px] opacity-60" />
            
            {/* Simulated 3D Elements using Images/CSS */}
            <img 
              alt="3D Abstract Geometry" 
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] max-w-none mix-blend-screen opacity-85 float-anim" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuB71Ee1GG-J_MjRsEbHXkEcct7GIdk_U4nHHkWOvO8mKaBXoeVl5wAuhfxkICXFWCm99bLY7jsjUaEAfgz8mQt5pz-9tMjePTb-hz2tXOn5ZlgjEhVzZ8yUjt7aKupXyphDEzU1GKLjZuTnt_xI1g9RAhPbxDLEb7j0oCl-Shg0F_tSKW8mM76ilZAgZsQ-nKLassTIJKBvcva9OF7UZVn9QyxXhI5QS37eOa6TTHXassaQ6joHm5Q6" 
              style={{ filter: 'hue-rotate(220deg) saturate(1.5)' }}
            />
            
          </motion.div>
        </section>

        {/* Protocol Integration Banner */}
        <section className="border-y border-white/10 py-12 bg-slate-950/40 backdrop-blur-sm">
          <p className="text-center font-mono text-xs md:text-sm text-slate-300 mb-8 uppercase tracking-[0.25em] font-semibold">
            Integrated with leading protocols
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 md:gap-6 max-w-5xl mx-auto px-4">
            
            {/* React */}
            <div className="glass-panel p-5 rounded-2xl flex flex-col items-center justify-center gap-3 border border-white/10 hover:border-blue-400/50 hover:bg-white/10 transition-all duration-300 transform hover:-translate-y-1 shadow-lg group">
              <img 
                alt="React" 
                className="h-12 md:h-14 w-auto object-contain transition-transform group-hover:scale-110 drop-shadow-[0_0_12px_rgba(97,218,251,0.4)]" 
                src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg" 
              />
              <span className="font-mono text-xs font-bold text-slate-300 group-hover:text-blue-300">React</span>
            </div>

            {/* Next.js */}
            <div className="glass-panel p-5 rounded-2xl flex flex-col items-center justify-center gap-3 border border-white/10 hover:border-slate-300/50 hover:bg-white/10 transition-all duration-300 transform hover:-translate-y-1 shadow-lg group">
              <img 
                alt="Next.js" 
                className="h-12 md:h-14 w-auto object-contain transition-transform group-hover:scale-110 invert drop-shadow-[0_0_12px_rgba(255,255,255,0.4)]" 
                src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nextjs/nextjs-original.svg" 
              />
              <span className="font-mono text-xs font-bold text-slate-300 group-hover:text-white">Next.js</span>
            </div>

            {/* GraphQL */}
            <div className="glass-panel p-5 rounded-2xl flex flex-col items-center justify-center gap-3 border border-white/10 hover:border-pink-400/50 hover:bg-white/10 transition-all duration-300 transform hover:-translate-y-1 shadow-lg group">
              <img 
                alt="GraphQL" 
                className="h-12 md:h-14 w-auto object-contain transition-transform group-hover:scale-110 drop-shadow-[0_0_12px_rgba(225,0,152,0.4)]" 
                src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/graphql/graphql-plain.svg" 
              />
              <span className="font-mono text-xs font-bold text-slate-300 group-hover:text-pink-300">GraphQL</span>
            </div>

            {/* TypeScript */}
            <div className="glass-panel p-5 rounded-2xl flex flex-col items-center justify-center gap-3 border border-white/10 hover:border-blue-500/50 hover:bg-white/10 transition-all duration-300 transform hover:-translate-y-1 shadow-lg group">
              <img 
                alt="TypeScript" 
                className="h-12 md:h-14 w-auto object-contain transition-transform group-hover:scale-110 drop-shadow-[0_0_12px_rgba(49,120,198,0.4)]" 
                src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg" 
              />
              <span className="font-mono text-xs font-bold text-slate-300 group-hover:text-blue-400">TypeScript</span>
            </div>

            {/* PostgreSQL */}
            <div className="glass-panel p-5 rounded-2xl flex flex-col items-center justify-center gap-3 border border-white/10 hover:border-indigo-400/50 hover:bg-white/10 transition-all duration-300 transform hover:-translate-y-1 shadow-lg group">
              <img 
                alt="PostgreSQL" 
                className="h-12 md:h-14 w-auto object-contain transition-transform group-hover:scale-110 drop-shadow-[0_0_12px_rgba(51,103,145,0.4)]" 
                src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg" 
              />
              <span className="font-mono text-xs font-bold text-slate-300 group-hover:text-indigo-300">PostgreSQL</span>
            </div>

            {/* Prisma */}
            <div className="glass-panel p-5 rounded-2xl flex flex-col items-center justify-center gap-3 border border-white/10 hover:border-teal-400/50 hover:bg-white/10 transition-all duration-300 transform hover:-translate-y-1 shadow-lg group">
              <img 
                alt="Prisma" 
                className="h-12 md:h-14 w-auto object-contain transition-transform group-hover:scale-110 invert drop-shadow-[0_0_12px_rgba(45,212,191,0.4)]" 
                src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/prisma/prisma-original.svg" 
              />
              <span className="font-mono text-xs font-bold text-slate-300 group-hover:text-teal-300">Prisma</span>
            </div>

          </div>
        </section>

        {/* 2. System Architecture Bento Grid */}
        <section id="ecosystem" className="space-y-10 relative pt-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-4">
            <div>
              <h2 className="text-3xl md:text-4xl text-white font-bold tracking-tight">System Architecture</h2>
              <p className="text-slate-400 mt-2 max-w-lg font-normal">Real-time metrics and structural components of the SIIMS network.</p>
            </div>
            <button 
              onClick={() => navigate('/login')}
              className="text-blue-400 text-sm font-mono font-semibold hover:text-blue-300 transition-colors flex items-center gap-1 group"
            >
              View Full Logs <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">arrow_right_alt</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Large Feature Cell (8 cols) */}
            <div className="glass-panel rounded-3xl p-8 md:p-10 col-span-1 md:col-span-8 relative overflow-hidden bento-hover group min-h-[320px]">
              <div className="absolute right-0 top-0 w-1/2 h-full bg-gradient-to-l from-blue-600/15 to-transparent pointer-events-none" />
              <div className="absolute -right-10 -bottom-10 opacity-15 group-hover:opacity-30 group-hover:scale-110 transition-all duration-700 pointer-events-none">
                <span className="material-symbols-outlined text-[240px] text-blue-400">language</span>
              </div>
              
              <div className="relative z-10 h-full flex flex-col justify-between">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20 mb-8 shadow-inner shadow-blue-500/20">
                  <span className="material-symbols-outlined text-blue-400 text-2xl">hub</span>
                </div>
                <div>
                  <h3 className="font-mono text-xs text-blue-400 mb-3 uppercase tracking-widest font-bold">Global Network</h3>
                  <div className="text-4xl md:text-5xl text-white mb-3 font-bold tracking-tight font-mono">
                    24,081 <span className="text-2xl text-slate-400 font-normal">nodes</span>
                  </div>
                  <p className="text-slate-300 max-w-md leading-relaxed text-sm font-normal">
                    Active nodes securely connected and transmitting across the primary ecosystem grid, facilitating decentralized computation.
                  </p>
                </div>
              </div>
            </div>

            {/* Small Stat Cell (4 cols) */}
            <div className="glass-panel rounded-3xl p-8 col-span-1 md:col-span-4 flex flex-col justify-between bento-hover min-h-[320px]">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 mb-6">
                <span className="material-symbols-outlined text-emerald-400 text-2xl">speed</span>
              </div>
              <div>
                <h3 className="font-mono text-xs text-slate-400 mb-2 uppercase tracking-widest font-bold">Network Uptime</h3>
                <div className="text-4xl text-white font-bold tracking-tight font-mono flex items-center gap-3">
                  99.99% 
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
                  </span>
                </div>
                <p className="text-slate-400 text-xs mt-3">Verified high-availability SLA active.</p>
              </div>
            </div>

            {/* Medium Cell (6 cols) */}
            <div className="glass-panel rounded-3xl p-8 col-span-1 md:col-span-6 bento-hover relative overflow-hidden group min-h-[260px]">
              <div className="relative z-10 flex flex-col h-full justify-between">
                <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20 mb-6">
                  <span className="material-symbols-outlined text-purple-400 text-2xl">account_balance</span>
                </div>
                <div>
                  <h3 className="font-mono text-xs text-slate-400 mb-2 uppercase tracking-widest font-bold">Capital Deployed</h3>
                  <div className="text-4xl text-white font-bold tracking-tight font-mono mb-2">$4.2B</div>
                  <p className="text-sm text-slate-400">Total value locked and deployed across incubation phases.</p>
                </div>
              </div>
            </div>

            {/* Medium Cell (6 cols) */}
            <div className="glass-panel rounded-3xl p-8 col-span-1 md:col-span-6 bento-hover bg-gradient-to-br from-slate-900 to-slate-950 min-h-[260px]">
              <div className="flex flex-col h-full justify-between">
                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 mb-6">
                  <span className="material-symbols-outlined text-white text-2xl">code_blocks</span>
                </div>
                <div>
                  <h3 className="font-mono text-xs text-slate-400 mb-2 uppercase tracking-widest font-bold">Protocol Layers</h3>
                  <div className="space-y-4 mt-4">
                    <div>
                      <div className="flex items-center justify-between text-xs font-mono mb-1.5">
                        <span className="text-slate-300">Core Infrastructure</span>
                        <span className="text-emerald-400">v3.1.0</span>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                        <div className="bg-blue-500 h-1.5 rounded-full w-[100%]" />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between text-xs font-mono mb-1.5">
                        <span className="text-slate-300">Consensus Engine</span>
                        <span className="text-amber-400">Syncing (85%)</span>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                        <div className="bg-purple-500 h-1.5 rounded-full w-[85%]" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3. Incubation & Feature Highlights */}
        <section id="incubation" className="pt-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="text-3xl md:text-4xl text-white font-bold tracking-tight">Hyper-Structured Incubation</h2>
            <p className="text-slate-400 text-base">Comprehensive workflows designed for founders, mentors, investors, and incubation managers.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="glass-panel p-8 rounded-3xl bento-hover space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-blue-400 text-2xl">rocket</span>
              </div>
              <h3 className="text-xl font-bold text-white">Startup Lifecycle Tracking</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Track milestones, seed funding, and pitch decks with real-time analytics and transparent progress dashboards.
              </p>
            </div>

            <div className="glass-panel p-8 rounded-3xl bento-hover space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-purple-400 text-2xl">workspace_premium</span>
              </div>
              <h3 className="text-xl font-bold text-white">Mentor Intelligence</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Connect founders with domain experts using intelligent matching based on industry, stage, and technical domain.
              </p>
            </div>

            <div className="glass-panel p-8 rounded-3xl bento-hover space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-emerald-400 text-2xl">shield</span>
              </div>
              <h3 className="text-xl font-bold text-white">Secure Data Rooms</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Enterprise-grade security with HTTP-only cookies, audit logs, and encrypted cap tables for investor readiness.
              </p>
            </div>
          </div>
        </section>

        {/* 4. CTA / Warp Tunnel */}
        <section id="ventures" className="relative overflow-hidden rounded-[2.5rem] p-10 md:p-20 text-center mt-20 border border-white/10 bg-[#051424] shadow-2xl">
          {/* Complex Glow Background */}
          <div className="absolute inset-0 z-0 opacity-40 pointer-events-none">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-2xl h-1/2 bg-blue-600/20 blur-[100px] rounded-full" />
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-xl h-1/2 bg-purple-600/20 blur-[100px] rounded-full" />
          </div>
          
          <div className="relative z-10 max-w-2xl mx-auto">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/5 border border-white/10 mb-8 backdrop-blur-md shadow-xl">
              <span className="material-symbols-outlined text-3xl text-white">rocket_launch</span>
            </div>
            <h2 className="text-4xl md:text-5xl text-white mb-6 font-bold tracking-tight">Ready to Deploy?</h2>
            <p className="text-lg text-slate-300 max-w-xl mx-auto mb-10 leading-relaxed">
              Join the terminal and accelerate your trajectory. The next phase of your journey starts here, secured by advanced protocol standards.
            </p>
            
            <form onSubmit={handleConnectSubmit} className="max-w-md mx-auto flex flex-col md:flex-row gap-3">
              <input 
                className="flex-1 terminal-input text-white px-5 py-4 font-mono text-sm placeholder:text-slate-500" 
                placeholder="Enter secure comm channel (Email)" 
                type="email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                required
              />
              <button 
                className="btn-primary px-8 py-4 rounded-xl font-mono text-xs font-bold uppercase tracking-widest whitespace-nowrap shadow-lg" 
                type="submit"
              >
                CONNECT
              </button>
            </form>
          </div>
        </section>

      </main>

      {/* Refined Cyber Footer */}
      <footer id="network" className="w-full relative overflow-hidden pt-20 pb-10 bg-[#020813] border-t border-white/10 mt-20">
        <div className="max-w-[1240px] mx-auto px-6 md:px-16 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-1 md:col-span-1 space-y-4">
              <a className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                <img 
                  alt="LaunchNest Logo" 
                  className="h-12 w-auto object-contain rounded-xl border border-white/20 bg-white p-1 shadow-md" 
                  src="/launchnest-logo.jpg"
                />
              </a>
              <p className="text-xs font-mono font-bold text-purple-400 uppercase tracking-widest pt-1">
                Where Startups Take Flight.
              </p>
              <p className="text-sm text-slate-400 leading-relaxed">
                Architecting the future ecosystem for technical innovators and creative professionals.
              </p>
              <div className="flex gap-4 pt-2">
                <a className="text-slate-400 hover:text-white transition-colors" href="#" aria-label="Global Network"><span className="material-symbols-outlined text-[20px]">public</span></a>
                <a className="text-slate-400 hover:text-white transition-colors" href="#" aria-label="Code Protocol"><span className="material-symbols-outlined text-[20px]">code</span></a>
              </div>
            </div>

            <div>
              <h4 className="font-mono text-xs text-white mb-4 font-bold uppercase tracking-widest">Platform</h4>
              <ul className="space-y-3 text-sm text-slate-400">
                <li><a className="hover:text-blue-400 transition-colors" href="#ecosystem">Ecosystem</a></li>
                <li><button onClick={() => navigate('/login')} className="hover:text-blue-400 transition-colors">Terminal</button></li>
                <li><button onClick={() => navigate('/login')} className="hover:text-blue-400 transition-colors">Documentation</button></li>
                <li><a className="hover:text-blue-400 transition-colors" href="#ecosystem">System Status</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-mono text-xs text-white mb-4 font-bold uppercase tracking-widest">Initiatives</h4>
              <ul className="space-y-3 text-sm text-slate-400">
                <li><a className="hover:text-blue-400 transition-colors" href="#incubation">Incubation</a></li>
                <li><a className="hover:text-blue-400 transition-colors" href="#ventures">Ventures</a></li>
                <li><a className="hover:text-blue-400 transition-colors" href="#network">Network</a></li>
                <li><button onClick={() => navigate('/login')} className="hover:text-blue-400 transition-colors">Grants</button></li>
              </ul>
            </div>

            <div>
              <h4 className="font-mono text-xs text-white mb-4 font-bold uppercase tracking-widest">Legal</h4>
              <ul className="space-y-3 text-sm text-slate-400">
                <li><a className="hover:text-blue-400 transition-colors" href="#">Privacy Policy</a></li>
                <li><a className="hover:text-blue-400 transition-colors" href="#">Terms of Service</a></li>
                <li><a className="hover:text-blue-400 transition-colors" href="#">Protocol Rules</a></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-mono text-slate-400">
            <p>© 2026 LaunchNest Foundation. All rights reserved.</p>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
              All systems operational
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default Landing;
