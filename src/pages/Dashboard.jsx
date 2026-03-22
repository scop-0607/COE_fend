import { useState } from 'react';
import { ArrowLeft, Calendar, Home, Upload, Play, FileText, Download, Info, CheckCircle2, AlertCircle, ChevronRight, X, Trash2, Plus, CalendarOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

const BRANCH_ORDER = [
    'AE', // Automobile Engineering
    'MN', // Mechanical Engineering (Automobile)
    'BT', // Bio Technology
    'CH', // Chemical Engineering
    'CE', // Civil Engineering
    'CS', // Computer Science and Engineering
    'EE', // Electrical and Electronics Engineering
    'EC', // Electronics and Communication Engineering
    'IT', // Information Technology
    'MR', // Marine Engineering
    'ME', // Mechanical Engineering
    'MU', // Mechanical and Automation Engineering
    'AD', // Artificial Intelligence and Data Science
];

const BRANCH_NAMES = {
    'AE': 'Automobile Engineering',
    'MN': 'Mechanical Engineering (Automobile)',
    'BT': 'Bio Technology',
    'CH': 'Chemical Engineering',
    'CE': 'Civil Engineering',
    'CS': 'Computer Science and Engineering',
    'EE': 'Electrical and Electronics Engineering',
    'EC': 'Electronics and Communication Engineering',
    'IT': 'Information Technology',
    'MR': 'Marine Engineering',
    'ME': 'Mechanical Engineering',
    'MU': 'Mechanical and Automation Engineering',
    'AD': 'Artificial Intelligence and Data Science',
};

const GOVERNMENT_HOLIDAYS = {
    // 2025
    '2025-01-01': 'New Year\'s Day',
    '2025-01-14': 'Pongal',
    '2025-01-15': 'Thiruvalluvar Day',
    '2025-01-16': 'Uzhavar Thirunal',
    '2025-01-26': 'Republic Day',
    '2025-03-31': 'Ramzan (Eid-ul-Fitr)',
    '2025-04-10': 'Mahavir Jayanthi',
    '2025-04-14': 'Tamil New Year / Dr. B.R. Ambedkar Birthday',
    '2025-04-18': 'Good Friday',
    '2025-05-01': 'May Day',
    '2025-06-07': 'Bakrid (Eid-ul-Adha)',
    '2025-07-06': 'Muharram',
    '2025-08-15': 'Independence Day',
    '2025-08-16': 'Krishna Jayanthi',
    '2025-08-27': 'Vinayaka Chathurthi',
    '2025-09-05': 'Milad-un-Nabi',
    '2025-10-01': 'Ayutha Pooja',
    '2025-10-02': 'Gandhi Jayanthi / Vijaya Dasami',
    '2025-10-20': 'Deepavali',
    '2025-12-25': 'Christmas',

    // 2026
    '2026-01-01': 'New Year\'s Day',
    '2026-01-14': 'Pongal',
    '2026-01-15': 'Thiruvalluvar Day',
    '2026-01-16': 'Uzhavar Thirunal',
    '2026-01-26': 'Republic Day',
    '2026-03-20': 'Ramzan (Eid-ul-Fitr)',
    '2026-04-02': 'Mahavir Jayanthi',
    '2026-04-14': 'Tamil New Year / Dr. B.R. Ambedkar Birthday',
    '2026-04-03': 'Good Friday',
    '2026-05-01': 'May Day',
    '2026-05-27': 'Bakrid (Eid-ul-Adha)',
    '2026-06-26': 'Muharram',
    '2026-08-15': 'Independence Day',
    '2026-09-04': 'Krishna Jayanthi',
    '2026-09-14': 'Vinayaka Chathurthi',
    '2026-08-26': 'Milad-un-Nabi',
    '2026-10-02': 'Gandhi Jayanthi',
    '2026-10-19': 'Ayutha Pooja',
    '2026-10-20': 'Vijaya Dasami',
    '2026-11-08': 'Deepavali',
    '2026-12-25': 'Christmas',
};

const PROCESSING_STEPS = [
    'Reading Subject Database',
    'Data Preprocessing & Validation',
    'Parsing Subject Classifications',
    'Analyzing Constraints & Dependencies',
    'Running Scheduling Algorithm',
    'Validating Schedule Integrity',
    'Finalizing Timetable',
];

const Dashboard = ({ startDate, setStartDate, file, setFile, semesterType, setSemesterType, excludedDays, setExcludedDays, isExclusionConfirmed, setIsExclusionConfirmed }) => {
    const navigate = useNavigate();
    const [error, setError] = useState('');

    // Local state for the holiday input form
    const [newHoliday, setNewHoliday] = useState({ date: '', reason: '', session: 'FULL' });

    const getDayName = (dateStr) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { weekday: 'long' });
    };

    const handleAddHoliday = () => {
        if (!newHoliday.date) {
            setError('Please pick a date for the excluded day.');
            return;
        }
        if (!newHoliday.reason) {
            setError('Please provide a reason for the excluded day.');
            return;
        }
        setExcludedDays([...excludedDays, { ...newHoliday, id: Date.now() }]);
        setNewHoliday({ date: '', reason: '', session: 'FULL' });
        setError('');
        setIsExclusionConfirmed(false);
    };

    const handleRemoveHoliday = (id) => {
        setExcludedDays(excludedDays.filter(h => h.id !== id));
        setIsExclusionConfirmed(false);
    };

    const handleFileUpload = (e) => {
        const uploadedFile = e.target.files[0];
        if (uploadedFile && (uploadedFile.name.endsWith('.xlsx') || uploadedFile.name.endsWith('.xls'))) {
            setFile(uploadedFile);
            setError('');
        } else {
            setError('Please upload a valid Excel (.xlsx) file.');
        }
    };

    const handleNext = () => {
        if (!startDate) {
            setError('Please select a start date.');
            return;
        }
        if (!file) {
            setError('Please upload the dataset file.');
            return;
        }
        if (excludedDays.length > 0 && !isExclusionConfirmed) {
            setError('Please confirm the excluded dates before proceeding.');
            return;
        }
        navigate('/generator-2');
    };

    return (
        <div className="container max-w-6xl mx-auto px-6 py-2 lg:py-4 relative min-h-screen">
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
                    <h1 className="text-5xl lg:text-7xl font-black tracking-tighter text-slate-900 mb-4">
                        TimeTable <span className="text-brand-600">Generator</span>
                    </h1>
                    <p className="text-slate-500 font-bold tracking-widest uppercase text-sm">Step 1: Configuration & Dates</p>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                {/* Step 1: Exam Period */}
                <motion.div
                    whileHover={{ y: -8 }}
                    className="glass-card p-8 lg:p-10 transition-all duration-500 bg-white border-2 border-slate-100 rounded-[2.5rem] hover:border-brand-400 hover:bg-brand-50/30 hover:shadow-[0_0_40px_rgba(14,140,233,0.25)] relative overflow-hidden group"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-brand-500/0 via-brand-500/0 to-brand-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                    <div className="flex items-center gap-5 mb-8">
                        <div className="w-14 h-14 flex items-center justify-center bg-brand-50 rounded-2xl text-brand-600 shadow-lg">
                            <Calendar size={28} />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900">Date Ingestion</h2>
                    </div>

                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Start Date</label>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="input-field h-14 border-2 border-brand-500 focus:border-brand-600 transition-all font-bold"
                            />
                        </div>
                        
                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Semester Schedule Type</label>
                            <div className="flex bg-slate-100 p-1.5 rounded-2xl">
                                <button
                                    onClick={() => setSemesterType('ODD')}
                                    className={`flex-1 py-3 px-6 rounded-xl font-black tracking-widest transition-all ${
                                        semesterType === 'ODD' 
                                        ? 'bg-brand-600 text-white shadow-lg shadow-brand-200' 
                                        : 'text-slate-500 hover:text-slate-700'
                                    }`}
                                >
                                    ODD
                                </button>
                                <button
                                    onClick={() => setSemesterType('EVEN')}
                                    className={`flex-1 py-3 px-6 rounded-xl font-black tracking-widest transition-all ${
                                        semesterType === 'EVEN' 
                                        ? 'bg-brand-600 text-white shadow-lg shadow-brand-200' 
                                        : 'text-slate-500 hover:text-slate-700'
                                    }`}
                                >
                                    EVEN
                                </button>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Step 2: Dataset */}
                <motion.div
                    whileHover={{ y: -8 }}
                    className="glass-card p-8 lg:p-10 transition-all duration-500 bg-white border-2 border-slate-100 rounded-[2.5rem] hover:border-emerald-400 hover:bg-emerald-50/30 hover:shadow-[0_0_40px_rgba(16,185,129,0.25)] relative overflow-hidden group"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/0 via-emerald-500/0 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                    <div className="flex items-center gap-5 mb-8">
                        <div className="w-14 h-14 flex items-center justify-center bg-brand-50 rounded-2xl text-brand-600 shadow-lg">
                            <Upload size={28} />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900">Dataset Format</h2>
                    </div>

                    <div className="relative h-full flex flex-col justify-between">
                        <input
                            type="file"
                            accept=".xlsx,.xls"
                            onChange={handleFileUpload}
                            className="hidden"
                            id="excel-upload"
                        />
                        <label
                            htmlFor="excel-upload"
                            className={`flex flex-col items-center justify-center border-2 border-dashed rounded-3xl p-10 transition-all cursor-pointer min-h-[220px] ${
                                file ? 'border-brand-500 bg-brand-50/30' : 'border-slate-300 hover:border-brand-400 hover:bg-slate-50'
                            }`}
                        >
                            {file ? (
                                <div className="flex flex-col items-center">
                                    <div className="w-14 h-14 bg-brand-600 text-white rounded-full flex items-center justify-center mb-4 shadow-lg">
                                        <CheckCircle2 size={28} />
                                    </div>
                                    <h3 className="text-slate-900 font-bold text-lg">{file.name}</h3>
                                    <p className="text-slate-500 text-xs font-black uppercase tracking-widest mt-2">File Uploaded</p>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center">
                                    <div className="w-14 h-14 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mb-4">
                                        <Upload size={28} />
                                    </div>
                                    <p className="text-slate-900 font-bold text-lg">Upload .xlsx file</p>
                                </div>
                            )}
                        </label>
                    </div>
                </motion.div>
            </div>

            {/* Step 3: Excluded Days */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card p-8 lg:p-10 mb-12 transition-all duration-500 bg-white border-2 border-slate-100 rounded-[2.5rem] hover:border-rose-400 hover:bg-rose-50/20 hover:shadow-[0_0_40px_rgba(244,63,94,0.25)] relative overflow-hidden group"
            >
                <div className="absolute inset-0 bg-gradient-to-br from-rose-500/0 via-rose-500/0 to-rose-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                <div className="flex flex-col items-center justify-center gap-4 mb-10 text-center">
                    <div className="w-14 h-14 flex items-center justify-center bg-brand-50 rounded-2xl text-brand-600 shadow-sm">
                        <CalendarOff size={28} />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 leading-none tracking-tight">EXCLUDED DATES</h2>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 mb-10 p-8 bg-slate-50 rounded-[2.5rem] border border-slate-200 border-dashed">
                    <div className="space-y-2">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Date</label>
                        <input
                            type="date"
                            value={newHoliday.date}
                            min={startDate}
                            onChange={(e) => {
                                const selectedDate = e.target.value;
                                const govReason = GOVERNMENT_HOLIDAYS[selectedDate] || '';
                                setNewHoliday({ ...newHoliday, date: selectedDate, reason: govReason });
                            }}
                            className="input-field h-14 bg-white"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Day (Auto)</label>
                        <div className="input-field h-14 bg-slate-100 flex items-center text-slate-500 font-bold cursor-not-allowed">
                            {getDayName(newHoliday.date) || 'Pick a date'}
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Reason</label>
                        <input
                            type="text"
                            placeholder="Reason for exclusion"
                            value={newHoliday.reason}
                            onChange={(e) => setNewHoliday({ ...newHoliday, reason: e.target.value })}
                            className="input-field h-14 bg-white"
                        />
                    </div>
                    <div className="space-y-2 flex flex-col justify-end">
                        <div className="flex gap-4">
                            <select
                                value={newHoliday.session}
                                onChange={(e) => setNewHoliday({ ...newHoliday, session: e.target.value })}
                                className="input-field h-14 bg-white font-bold w-1/2"
                            >
                                <option value="FULL">FULL</option>
                                <option value="FN">FN</option>
                                <option value="AN">AN</option>
                            </select>
                            <button
                                onClick={handleAddHoliday}
                                className="h-14 w-1/2 bg-brand-600 hover:bg-brand-700 text-white rounded-2xl flex items-center justify-center gap-2 font-black shadow-lg shadow-brand-100 transition-all active:scale-95"
                            >
                                <Plus size={20} strokeWidth={4} />
                                ADD
                            </button>
                        </div>
                    </div>
                </div>

                <div className="overflow-hidden rounded-3xl border border-slate-200 mb-8">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50">
                                <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Date</th>
                                <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Day</th>
                                <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Reason</th>
                                <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Session</th>
                                <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest text-center">Edit</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {excludedDays.length > 0 ? excludedDays.map((h) => (
                                <tr key={h.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-8 py-5 font-bold text-slate-900">{h.date}</td>
                                    <td className="px-8 py-5 text-xs font-bold text-brand-600 uppercase tracking-wider">{getDayName(h.date)}</td>
                                    <td className="px-8 py-5 font-semibold text-slate-600">{h.reason}</td>
                                    <td className="px-8 py-5">
                                        <span className="px-3 py-1 bg-brand-50 text-brand-700 rounded-lg text-xs font-black border border-brand-100">
                                            {h.session}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5 text-center">
                                        <button onClick={() => handleRemoveHoliday(h.id)} className="text-rose-500 hover:text-rose-700 font-bold text-xs uppercase tracking-widest">
                                            Remove
                                        </button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="5" className="px-8 py-10 text-center text-slate-400 italic font-medium">No exclusions added</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {excludedDays.length > 0 && (
                    <div className="flex justify-center">
                        <button
                            onClick={() => setIsExclusionConfirmed(true)}
                            className={`px-10 py-4 rounded-2xl font-black tracking-widest transition-all ${
                                isExclusionConfirmed 
                                ? 'bg-emerald-100 text-emerald-700 shadow-inner' 
                                : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-100'
                            }`}
                        >
                            {isExclusionConfirmed ? '✓ EXCLUSIONS CONFIRMED' : 'CONFIRM EXCLUSIONS'}
                        </button>
                    </div>
                )}
            </motion.div>

            <footer className="flex flex-col items-center gap-8 mt-12">
                {error && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="px-6 py-3 bg-rose-50 text-rose-600 rounded-2xl border border-rose-100 font-bold flex items-center gap-2 ring-4 ring-rose-50"
                    >
                        <AlertCircle size={20} />
                        {error}
                    </motion.div>
                )}
                <button
                    onClick={handleNext}
                    className="btn-primary group !px-20 !py-6 !rounded-[2rem] text-2xl flex items-center gap-4"
                >
                    NEXT <ChevronRight size={28} strokeWidth={3} className="group-hover:translate-x-1 transition-transform" />
                </button>
            </footer>
        </div>
    );
};

export default Dashboard;
