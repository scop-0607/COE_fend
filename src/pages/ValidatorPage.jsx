import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
    ArrowLeft, 
    Home,
    Upload, 
    ShieldCheck, 
    FileCheck, 
    FileText,
    AlertCircle,
    CheckCircle2,
    ChevronRight
} from 'lucide-react';

const ValidatorPage = () => {
    const navigate = useNavigate();
    const [regFile, setRegFile] = useState(null);
    const [outputFile, setOutputFile] = useState(null);
    const [isValidating, setIsValidating] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');

    const handleFileUpload = (e, type) => {
        const file = e.target.files[0];
        if (file && (file.name.endsWith('.xlsx') || file.name.endsWith('.xls'))) {
            if (type === 'REGISTRATION') setRegFile(file);
            else setOutputFile(file);
            setError('');
        } else {
            setError('Please upload a valid Excel (.xlsx) file.');
        }
    };

    const handleValidate = async () => {
        if (!regFile || !outputFile) {
            setError('Please upload both Registration and Output Excel files.');
            return;
        }

        setIsValidating(true);
        setError('');
        setResult(null);

        // Simulate validation logic
        setTimeout(() => {
            setIsValidating(false);
            
            // Randomly simulate success or violation (for prototype purposes)
            // Real application will call backend and handle the actual response.
            const hasViolations = Math.random() > 0.8; 

            if (hasViolations) {
                setResult({
                    status: 'VIOLATION',
                    message: 'Constraints Violated!',
                    details: [
                        'Date Conflict: Multiple exams on 2026-04-12 for EE Branch',
                        'Sequence Error: 5th Semester exam scheduled after 6th Semester'
                    ]
                });
            } else {
                setResult({
                    status: 'SUCCESS',
                    message: 'All constraints passed successfully. Redirecting to Final Results...',
                    details: [
                        'Total Subjects Matched: 142',
                        'Date Conflicts Found: 0',
                        'Regulation Consistency: Valid',
                        'Branch Sequence: Correct'
                    ]
                });
                
                // Navigate to generator step 2 output
                setTimeout(() => {
                    navigate('/generator-2', { 
                        state: { 
                            validationSuccess: true, 
                            outputFile: outputFile.name 
                        } 
                    });
                }, 2000);
            }
        }, 2000);
    };

    return (
        <div className="container max-w-6xl mx-auto px-6 py-2 min-h-screen relative">
            <header className="mb-6">
                <button 
                    onClick={() => navigate('/')}
                    className="absolute top-6 left-6 lg:left-12 p-3 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-brand-600 hover:border-brand-100 hover:shadow-[0_0_20px_rgba(14,140,233,0.2)] shadow-sm transition-all z-20"
                    title="Back to Home"
                >
                    <ArrowLeft size={24} />
                </button>
                <button 
                    onClick={() => navigate('/')}
                    className="absolute top-6 right-6 lg:right-12 p-3 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-brand-600 hover:border-brand-100 hover:shadow-[0_0_20px_rgba(14,140,233,0.2)] shadow-sm transition-all z-20"
                    title="Go Home"
                >
                    <Home size={24} />
                </button>
                
                <div className="text-center pt-16">
                    <h1 className="text-5xl lg:text-7xl font-black tracking-tighter text-slate-900 mb-4 uppercase">
                        Timetable <span className="text-brand-600">Validator</span>
                    </h1>
                    <p className="text-slate-500 font-bold tracking-widest uppercase text-sm">Integrity & Consistency Check</p>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                {/* Registration File Card */}
                <motion.div
                    whileHover={{ y: -8 }}
                    className="glass-card p-8 lg:p-10 transition-all duration-500 bg-white border-2 border-slate-100 rounded-[2.5rem] group hover:border-brand-400 hover:bg-brand-50/30 hover:shadow-[0_0_40px_rgba(14,140,233,0.25)] relative overflow-hidden"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-brand-500/0 via-brand-500/0 to-brand-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                    <div className="flex items-center gap-5 mb-8">
                        <div className="w-14 h-14 flex items-center justify-center bg-brand-50 rounded-2xl text-brand-600 shadow-lg">
                            <ShieldCheck size={28} />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900 uppercase">Registration File</h2>
                    </div>

                    <div className="relative">
                        <input
                            type="file"
                            id="reg-upload"
                            className="hidden"
                            onChange={(e) => handleFileUpload(e, 'REGISTRATION')}
                        />
                        <label
                            htmlFor="reg-upload"
                            className={`flex flex-col items-center justify-center border-2 border-dashed rounded-3xl p-10 transition-all cursor-pointer min-h-[200px] ${
                                regFile ? 'border-brand-500 bg-brand-50/30' : 'border-slate-300 hover:border-brand-400 hover:bg-slate-50'
                            }`}
                        >
                            {regFile ? (
                                <div className="text-center">
                                    <div className="w-12 h-12 bg-brand-600 text-white rounded-full flex items-center justify-center mx-auto mb-4">
                                        <FileCheck size={24} />
                                    </div>
                                    <p className="font-bold text-slate-900">{regFile.name}</p>
                                </div>
                            ) : (
                                <div className="text-center">
                                    <Upload size={32} className="mx-auto mb-4 text-slate-300" />
                                    <p className="font-bold text-slate-500 uppercase text-xs tracking-widest">Upload Registration Record</p>
                                </div>
                            )}
                        </label>
                    </div>
                </motion.div>

                {/* Output Excel Card */}
                <motion.div
                    whileHover={{ y: -8 }}
                    className="glass-card p-8 lg:p-10 transition-all duration-500 bg-white border-2 border-slate-100 rounded-[2.5rem] group hover:border-emerald-400 hover:bg-emerald-50/30 hover:shadow-[0_0_40px_rgba(16,185,129,0.25)] relative overflow-hidden"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/0 via-emerald-500/0 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                    <div className="flex items-center gap-5 mb-8">
                        <div className="w-14 h-14 flex items-center justify-center bg-brand-50 rounded-2xl text-brand-600 shadow-lg">
                            <FileText size={28} />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900 uppercase">Output Excel</h2>
                    </div>

                    <div className="relative">
                        <input
                            type="file"
                            id="output-upload"
                            className="hidden"
                            onChange={(e) => handleFileUpload(e, 'OUTPUT')}
                        />
                        <label
                            htmlFor="output-upload"
                            className={`flex flex-col items-center justify-center border-2 border-dashed rounded-3xl p-10 transition-all cursor-pointer min-h-[200px] ${
                                outputFile ? 'border-brand-500 bg-brand-50/30' : 'border-slate-300 hover:border-brand-400 hover:bg-slate-50'
                            }`}
                        >
                            {outputFile ? (
                                <div className="text-center">
                                    <div className="w-12 h-12 bg-brand-600 text-white rounded-full flex items-center justify-center mx-auto mb-4">
                                        <FileCheck size={24} />
                                    </div>
                                    <p className="font-bold text-slate-900">{outputFile.name}</p>
                                </div>
                            ) : (
                                <div className="text-center">
                                    <Upload size={32} className="mx-auto mb-4 text-slate-300" />
                                    <p className="font-bold text-slate-500 uppercase text-xs tracking-widest">Upload Generated Schedule</p>
                                </div>
                            )}
                        </label>
                    </div>
                </motion.div>
            </div>

            <div className="flex flex-col items-center gap-12 mt-16">
                {error && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="px-6 py-4 bg-rose-50 text-rose-600 rounded-2xl border border-rose-100 font-bold flex items-center gap-3 shadow-lg shadow-rose-200/20"
                    >
                        <AlertCircle size={22} />
                        {error}
                    </motion.div>
                )}

                <button
                    onClick={handleValidate}
                    disabled={isValidating}
                    className="btn-primary group !px-20 !py-6 !rounded-[2rem] text-2xl flex items-center gap-4"
                >
                    {isValidating ? (
                        <div className="flex items-center gap-4">
                            <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                            VALIDATING...
                        </div>
                    ) : (
                        <>
                            VALIDATE SCHEDULE <ChevronRight size={28} strokeWidth={3} className="group-hover:translate-x-1 transition-transform" />
                        </>
                    )}
                </button>

                {result && (
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="w-full max-w-2xl glass-card p-10 bg-emerald-50/50 border-2 border-emerald-100 rounded-[3rem] text-center"
                    >
                        <div className="w-16 h-16 bg-emerald-600 text-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-emerald-100">
                            <CheckCircle2 size={32} />
                        </div>
                        <h3 className="text-3xl font-black text-slate-900 mb-2 uppercase tracking-tight">Validation Complete</h3>
                        <p className="text-emerald-700 font-bold mb-8">{result.message}</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                            {result.details.map((detail, i) => (
                                <div key={i} className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-emerald-100/50">
                                    <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                                    <span className="font-bold text-slate-600 text-sm tracking-wide">{detail}</span>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default ValidatorPage;
