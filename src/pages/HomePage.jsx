import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Calendar, ShieldCheck, ArrowLeft, Home } from 'lucide-react';

const HomePage = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden bg-white">
            {/* Top Left Logo */}
            <div className="absolute top-8 left-8 lg:top-12 lg:left-16 z-20">
                <img 
                    src="/SVCE_Full.png" 
                    alt="SVCE Logo" 
                    className="h-12 lg:h-16 w-auto object-contain drop-shadow-md"
                />
            </div>

            {/* Background Decorative Elements */}
            <div className="absolute top-1/4 -left-20 w-96 h-96 bg-brand-50 rounded-full blur-3xl opacity-60 animate-pulse" />
            <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-brand-50 rounded-full blur-3xl opacity-60" />

            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center z-10 max-w-4xl"
            >
                <motion.h1 
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    className="text-6xl lg:text-8xl font-black text-slate-900 mb-16 tracking-tighter"
                >
                    SVCE EXAM <span className="text-brand-600">SCHEDULER</span>
                </motion.h1>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 px-4 relative">
                    
                    {/* Animated Connection Pipes (Top and Bottom) */}
                    <div className="absolute inset-x-[-5%] inset-y-[-20%] z-0 hidden md:flex items-center justify-center pointer-events-none">
                        <svg className="w-full h-full" viewBox="0 0 1000 600" preserveAspectRatio="none" fill="none">
                            <defs>
                                <linearGradient id="beam-grad-top" x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" stopColor="rgba(14, 140, 233, 0)" />
                                    <stop offset="50%" stopColor="rgba(14, 140, 233, 1)" />
                                    <stop offset="100%" stopColor="rgba(16, 185, 129, 1)" />
                                </linearGradient>
                                <linearGradient id="beam-grad-bot" x1="100%" y1="0%" x2="0%" y2="0%">
                                    <stop offset="0%" stopColor="rgba(16, 185, 129, 0)" />
                                    <stop offset="50%" stopColor="rgba(16, 185, 129, 1)" />
                                    <stop offset="100%" stopColor="rgba(14, 140, 233, 1)" />
                                </linearGradient>
                                <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                                    <feGaussianBlur stdDeviation="10" result="blur" />
                                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                                </filter>
                                <marker id="arrow-top" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto">
                                    <path d="M 0 0 L 8 4 L 0 8 Z" fill="rgba(16, 185, 129, 1)" />
                                </marker>
                                <marker id="arrow-bot" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto">
                                    <path d="M 0 0 L 8 4 L 0 8 Z" fill="rgba(14, 140, 233, 1)" />
                                </marker>
                            </defs>
                            
                            {/* Background Tracks — symmetric top and bottom */}
                            <path d="M 250 300 L 250 80 Q 250 20 290 20 L 710 20 Q 750 20 750 80 L 750 300" className="stroke-slate-200/50" strokeWidth="3" strokeDasharray="8 8" />
                            <path d="M 750 300 L 750 520 Q 750 580 710 580 L 290 580 Q 250 580 250 520 L 250 300" className="stroke-slate-200/50" strokeWidth="3" strokeDasharray="8 8" />
                            
                            {/* Animated Beam Top */}
                            <motion.path 
                                d="M 250 300 L 250 80 Q 250 20 290 20 L 710 20 Q 750 20 750 80 L 750 300"
                                stroke="url(#beam-grad-top)" strokeWidth="6" strokeLinecap="round"
                                strokeDasharray="500 1400" 
                                animate={{ strokeDashoffset: [1900, 0] }}
                                transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                                filter="url(#glow)"
                                markerEnd="url(#arrow-top)"
                            />
                            
                            {/* Animated Beam Bottom */}
                            <motion.path 
                                d="M 750 300 L 750 520 Q 750 580 710 580 L 290 580 Q 250 580 250 520 L 250 300"
                                stroke="url(#beam-grad-bot)" strokeWidth="6" strokeLinecap="round"
                                strokeDasharray="500 1400" 
                                animate={{ strokeDashoffset: [1900, 0] }}
                                transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                                filter="url(#glow)"
                                markerEnd="url(#arrow-bot)"
                            />
                        </svg>
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.05, y: -5 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => navigate('/generator-1')}
                        className="glass-card p-10 flex flex-col items-center gap-6 rounded-[2.5rem] bg-white/80 backdrop-blur-xl border-2 border-white/50 hover:border-brand-400 hover:bg-white hover:shadow-[0_0_40px_rgba(14,140,233,0.3)] transition-all duration-500 group relative overflow-hidden z-10"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-brand-500/0 via-brand-500/0 to-brand-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                        <div className="w-20 h-20 rounded-2xl bg-brand-600 text-white flex items-center justify-center shadow-lg shadow-brand-200 group-hover:rotate-6 transition-transform">
                            <Calendar size={40} />
                        </div>
                        <div className="flex flex-col gap-2">
                            <h2 className="text-2xl font-black text-slate-900">TIMETABLE GENERATOR</h2>
                            <p className="text-slate-500 font-medium">Create and manage end semester examination schedules</p>
                        </div>
                    </motion.button>

                    <motion.button
                        whileHover={{ scale: 1.05, y: -5 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => navigate('/validator')}
                        className="glass-card p-10 flex flex-col items-center gap-6 rounded-[2.5rem] bg-white/80 backdrop-blur-xl border-2 border-white/50 hover:border-emerald-400 hover:bg-white hover:shadow-[0_0_40px_rgba(16,185,129,0.3)] transition-all duration-500 group relative overflow-hidden z-10"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/0 via-emerald-500/0 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                        <div className="w-20 h-20 rounded-2xl bg-brand-600 text-white flex items-center justify-center shadow-lg shadow-brand-200 group-hover:-rotate-6 transition-transform">
                            <ShieldCheck size={40} />
                        </div>
                        <div className="flex flex-col gap-2">
                            <h2 className="text-2xl font-black text-slate-900">TIMETABLE VALIDATOR</h2>
                            <p className="text-slate-500 font-medium">Verify registration files and validate exam timings</p>
                        </div>
                    </motion.button>
                </div>
            </motion.div>

        </div>
    );
};

export default HomePage;
