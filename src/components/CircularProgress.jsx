import { motion } from 'framer-motion';

const CircularProgress = ({ progress, size = 280, steps = [] }) => {
    // Color based on progress
    const getProgressColor = (percent) => {
        if (percent < 33) return '#ef4444'; // red-500
        if (percent < 66) return '#eab308'; // yellow-500
        return '#22c55e'; // green-500
    };

    const getProgressGradientId = (percent) => {
        if (percent < 33) return 'gradient-red';
        if (percent < 66) return 'gradient-yellow';
        return 'gradient-green';
    };

    // Get current step based on progress
    const getCurrentStep = () => {
        if (steps.length === 0) return 'Processing...';
        const stepIndex = Math.floor((progress / 100) * steps.length);
        return steps[Math.min(stepIndex, steps.length - 1)];
    };

    const circumference = 2 * Math.PI * (size / 2 - 20);
    const strokeDashoffset = circumference - (progress / 100) * circumference;
    const radius = size / 2 - 20;

    return (
        <div className="flex flex-col items-center justify-center gap-8">
            {/* Circle Container */}
            <div className="flex items-center justify-center" style={{ width: size, height: size }}>
                <svg width={size} height={size} className="transform -rotate-90">
                    <defs>
                        {/* Red gradient */}
                        <linearGradient id="gradient-red" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#ef4444" />
                            <stop offset="100%" stopColor="#f97316" />
                        </linearGradient>

                        {/* Yellow gradient */}
                        <linearGradient id="gradient-yellow" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#eab308" />
                            <stop offset="100%" stopColor="#f97316" />
                        </linearGradient>

                        {/* Green gradient */}
                        <linearGradient id="gradient-green" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#22c55e" />
                            <stop offset="100%" stopColor="#10b981" />
                        </linearGradient>
                    </defs>

                    {/* Background circle */}
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        fill="none"
                        stroke="#e2e8f0"
                        strokeWidth="8"
                    />

                    {/* Progress circle */}
                    <motion.circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        fill="none"
                        stroke={`url(#${getProgressGradientId(progress)})`}
                        strokeWidth="8"
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        initial={{ strokeDashoffset: circumference }}
                        animate={{ strokeDashoffset }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                        style={{
                            filter: `drop-shadow(0 0 12px ${getProgressColor(progress)}88)`,
                        }}
                    />

                    {/* Glow effect for active progress */}
                    {progress < 100 && (
                        <motion.circle
                            cx={size / 2}
                            cy={size / 2}
                            r={radius}
                            fill="none"
                            stroke={getProgressColor(progress)}
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeDasharray={circumference}
                            animate={{ strokeDashoffset, opacity: [0.3, 0.6, 0.3] }}
                            transition={{
                                strokeDashoffset: { duration: 0.8, ease: 'easeOut' },
                                opacity: { duration: 1.5, repeat: Infinity },
                            }}
                            style={{
                                filter: `drop-shadow(0 0 6px ${getProgressColor(progress)}aa)`,
                            }}
                        />
                    )}
                </svg>

                {/* Center text - Percentage */}
                <motion.div
                    className="absolute flex flex-col items-center justify-center"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    <motion.div
                        animate={{ scale: [1, 1.05, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="text-center"
                    >
                        <div className="text-7xl font-black" style={{ color: getProgressColor(progress) }}>
                            {Math.round(progress)}
                        </div>
                        <div className="text-2xl font-bold mt-1" style={{ color: getProgressColor(progress) }}>%</div>
                    </motion.div>
                </motion.div>
            </div>

            {/* Text below circle */}
            <motion.div
                className="text-center"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
            >
                <motion.p
                    key={getCurrentStep()}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="text-3xl font-bold px-6"
                    style={{ color: getProgressColor(progress) }}
                >
                    {getCurrentStep() === 'Complete!' ? '✓ Complete!' : getCurrentStep()}
                </motion.p>
            </motion.div>
        </div>
    );
};

export default CircularProgress;
