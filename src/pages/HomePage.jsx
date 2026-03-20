import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Calendar, ShieldCheck } from 'lucide-react';

const HomePage = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden bg-white">
            {/* Top Left Logo */}
            <div className="absolute top-8 left-8">
                <img 
                    src="/SVCE_Full.png" 
                    alt="SVCE Logo" 
                    className="h-14 lg:h-16 w-auto object-contain"
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 px-4">
                    <motion.button
                        whileHover={{ scale: 1.05, y: -5 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => navigate('/generator-1')}
                        className="glass-card p-10 flex flex-col items-center gap-6 rounded-[2.5rem] border-2 border-transparent hover:border-brand-200 hover:shadow-2xl hover:shadow-brand-100 transition-all duration-500 bg-white group relative overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-brand-500/0 via-brand-500/0 to-brand-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
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
                        className="glass-card p-10 flex flex-col items-center gap-6 rounded-[2.5rem] border-2 border-transparent hover:border-brand-200 hover:shadow-2xl hover:shadow-brand-100 transition-all duration-500 bg-white group relative overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-brand-500/0 via-brand-500/0 to-brand-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
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

            <footer className="absolute bottom-8 text-slate-400 font-bold tracking-widest text-[10px] uppercase">
                Office of the Controller of Examinations
            </footer>
        </div>
    );
};

export default HomePage;
