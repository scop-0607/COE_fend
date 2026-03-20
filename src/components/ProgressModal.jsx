import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Zap } from 'lucide-react';
import { useEffect, useState } from 'react';
import CircularProgress from './CircularProgress';

const ProgressModal = ({ isOpen, progress, currentStep, steps, onComplete, onClose }) => {
    const [autoClose, setAutoClose] = useState(false);

    // Auto-close the modal after completion
    useEffect(() => {
        if (progress >= 100 && onComplete) {
            const closeTimer = setTimeout(() => {
                setAutoClose(true);
                if (onClose) onClose();
            }, 2000);
            return () => clearTimeout(closeTimer);
        }
    }, [progress, onComplete, onClose]);

    // Color gradient based on percentage
    const getProgressColor = (percent) => {
        if (percent < 33) return 'from-red-500 to-orange-500';
        if (percent < 66) return 'from-yellow-500 to-orange-500';
        return 'from-green-500 to-emerald-500';
    };

    const getProgressTextColor = (percent) => {
        if (percent < 33) return 'text-red-600';
        if (percent < 66) return 'text-amber-600';
        return 'text-green-600';
    };

    const getStepStatus = (index) => {
        if (index < currentStep) return 'completed';
        if (index === currentStep) return 'active';
        return 'pending';
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2,
            },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
    };

    return (
        <AnimatePresence>
            {isOpen && !autoClose && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden"
                    >
                        {/* Header with gradient background */}
                        <div className={`bg-gradient-to-r ${getProgressColor(progress)} p-8 text-white relative overflow-hidden`}>
                            <div className="absolute inset-0 opacity-10">
                                <div className="absolute top-0 right-0 w-40 h-40 bg-white rounded-full blur-3xl" />
                            </div>
                            <div className="relative z-10">
                                <h2 className="text-3xl font-bold mb-2">Processing Schedule</h2>
                                <p className="text-white/90 font-medium">Generating optimized timetable...</p>
                            </div>
                        </div>

                        {/* Progress Section */}
                        <div className="p-8 lg:p-10 flex flex-col items-center">
                            {/* Circular Progress Display */}
                            <motion.div
                                className="mb-8"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.6 }}
                            >
                                <CircularProgress progress={Math.min(progress, 100)} size={300} steps={steps} />
                            </motion.div>

                            {/* Completion Message */}
                            <AnimatePresence>
                                {progress >= 100 && onComplete && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="mt-6 p-6 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl text-center max-w-md"
                                    >
                                        <p className="text-green-700 font-bold text-lg">✓ Scheduling Complete!</p>
                                        <p className="text-green-600 text-sm font-medium mt-2">All constraints satisfied. Ready for export.</p>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default ProgressModal;
