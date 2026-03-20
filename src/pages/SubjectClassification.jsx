import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, GripVertical, Save, Info, Sparkles, Filter, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SubjectClassification = ({ analytical, setAnalytical, nonAnalytical, setNonAnalytical, setIsCompleted }) => {
    const navigate = useNavigate();

    const moveSubject = (id, from) => {
        // Invalidate the current schedule when classification changes
        setIsCompleted(false);

        if (from === 'analytical') {
            const subject = analytical.find(s => s.id === id);
            setAnalytical(analytical.filter(s => s.id !== id));
            setNonAnalytical([subject, ...nonAnalytical]);
        } else {
            const subject = nonAnalytical.find(s => s.id === id);
            setNonAnalytical(nonAnalytical.filter(s => s.id !== id));
            setAnalytical([subject, ...analytical]);
        }
    };

    const handleSave = () => {
        // Force scheduler reset to ensure it picks up new classification
        setIsCompleted(false);
        navigate('/');
    };

    return (
        <div className="container max-w-6xl mx-auto px-6 py-12 lg:py-20">
            <motion.button
                whileHover={{ x: -5 }}
                onClick={() => navigate('/')}
                className="flex items-center gap-2 text-slate-500 hover:text-brand-600 mb-10 transition-colors font-bold uppercase tracking-wider text-xs"
            >
                <ArrowLeft size={16} />
                Back to Administration
            </motion.button>

            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12 border-l-4 border-brand-600 pl-8">
                <div>
                    <h1 className="text-4xl lg:text-5xl font-bold text-slate-900 font-display mb-3">
                        Subject <span className="text-brand-600">Classifier</span>
                    </h1>
                    <p className="text-slate-500 text-lg max-w-xl font-medium">
                        Balance the scheduling complexity by categorizing subjects based on preparation requirements.
                    </p>
                </div>

                <div className="flex gap-4">
                    <button className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-2xl text-slate-600 hover:text-brand-600 hover:border-brand-200 transition-all font-bold shadow-sm active:scale-95">
                        <Filter size={18} />
                        Apply Template
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                {/* Analytical Column */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between px-6 py-4 bg-brand-50 rounded-2xl border border-brand-100">
                        <h2 className="text-xl font-bold text-brand-900 flex items-center gap-3 uppercase tracking-tight">
                            Analytical Modules
                        </h2>
                        <div className="px-3 py-1 bg-brand-600 text-white rounded-lg text-xs font-black">
                            {analytical.length}
                        </div>
                    </div>

                    <div className="glass-card bg-slate-50/50 p-6 min-h-[500px] border-slate-200 shadow-inner">
                        <div className="space-y-4">
                            <AnimatePresence mode='popLayout'>
                                {analytical.map((subject) => (
                                    <motion.div
                                        layout
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        key={subject.id}
                                        className="group bg-white p-5 rounded-2xl flex items-center justify-between border border-slate-200 hover:border-brand-400 hover:shadow-xl hover:shadow-brand-100 transition-all duration-300 active:scale-[0.98] shadow-sm cursor-default"
                                    >
                                        <div className="flex items-center gap-5">
                                            <div className="text-slate-300 group-hover:text-brand-400 transition-colors">
                                                <GripVertical size={22} />
                                            </div>
                                            <div>
                                                <span className="text-slate-900 font-bold block mb-0.5">{subject.name}</span>
                                                <span className="text-[10px] font-black text-brand-500 uppercase tracking-[0.2em]">High Complexity</span>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => moveSubject(subject.id, 'analytical')}
                                            className="p-3 bg-slate-50 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-xl transition-all border border-slate-100 shadow-sm"
                                        >
                                            <ArrowLeft size={18} className="rotate-180" />
                                        </button>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>

                {/* Non-Analytical Column */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between px-6 py-4 bg-slate-50 rounded-2xl border border-slate-200">
                        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-3 uppercase tracking-tight">
                            Standard Modules
                        </h2>
                        <div className="px-3 py-1 bg-slate-800 text-white rounded-lg text-xs font-black">
                            {nonAnalytical.length}
                        </div>
                    </div>

                    <div className="glass-card bg-slate-50/50 p-6 min-h-[500px] border-slate-200 shadow-inner">
                        <div className="space-y-4">
                            <AnimatePresence mode='popLayout'>
                                {nonAnalytical.map((subject) => (
                                    <motion.div
                                        layout
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        key={subject.id}
                                        className="group bg-white p-5 rounded-2xl flex items-center justify-between border border-slate-200 hover:border-brand-400 hover:shadow-xl hover:shadow-brand-100 transition-all duration-300 active:scale-[0.98] shadow-sm cursor-default"
                                    >
                                        <div className="flex items-center gap-5">
                                            <div className="text-slate-300 group-hover:text-brand-400 transition-colors">
                                                <GripVertical size={22} />
                                            </div>
                                            <div>
                                                <span className="text-slate-900 font-bold block mb-0.5">{subject.name}</span>
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Regular Theory</span>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => moveSubject(subject.id, 'nonAnalytical')}
                                            className="p-3 bg-slate-50 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-xl transition-all border border-slate-100 shadow-sm"
                                        >
                                            <ArrowLeft size={18} />
                                        </button>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-16 flex flex-col items-center gap-6">
                <p className="text-slate-400 text-sm font-medium flex items-center gap-2">
                    <Info size={16} />
                    Saving will re-enable the Start Schedule button on the dashboard.
                </p>
                <button
                    onClick={handleSave}
                    className="btn-primary flex items-center gap-3 px-16 shadow-brand-100"
                >
                    <Save size={22} />
                    SAVE & REDESIGN SCHEDULE
                </button>
            </div>
        </div>
    );
};

export default SubjectClassification;
