import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
    ArrowLeft, 
    Home, 
    Calendar, 
    FileText, 
    Download, 
    ChevronRight, 
    ListFilter,
    CheckCircle2,
    AlertCircle,
    BookOpen,
    GraduationCap,
    Loader2
} from 'lucide-react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const BRANCH_ORDER = [
    'AUTOMOBILE ENGINEERING',
    'MECHANICAL ENGINEERING (AUTOMOBILE)',
    'BIO TECHNOLOGY',
    'CHEMICAL ENGINEERING',
    'CIVIL ENGINEERING',
    'COMPUTER SCIENCE AND ENGINEERING',
    'ELECTRICAL AND ELECTRONICS ENGINEERING',
    'ELECTRONICS AND COMMUNICATION ENGINEERING',
    'INFORMATION TECHNOLOGY',
    'MARINE ENGINEERING',
    'MECHANICAL ENGINEERING',
    'MECHANICAL AND AUTOMATION ENGINEERING',
    'ARTIFICIAL INTELLIGENCE AND DATA SCIENCE'
];

const BRANCH_MAPPING = {
    'AU': 'AUTOMOBILE ENGINEERING',
    'MA': 'MECHANICAL ENGINEERING (AUTOMOBILE)',
    'BT': 'BIO TECHNOLOGY',
    'CH': 'CHEMICAL ENGINEERING',
    'CE': 'CIVIL ENGINEERING',
    'CS': 'COMPUTER SCIENCE AND ENGINEERING',
    'EE': 'ELECTRICAL AND ELECTRONICS ENGINEERING',
    'EC': 'ELECTRONICS AND COMMUNICATION ENGINEERING',
    'IT': 'INFORMATION TECHNOLOGY',
    'MR': 'MARINE ENGINEERING',
    'ME': 'MECHANICAL ENGINEERING',
    'MU': 'MECHANICAL AND AUTOMATION ENGINEERING',
    'AD': 'ARTIFICIAL INTELLIGENCE AND DATA SCIENCE'
};

const formatExcelDate = (excelDate) => {
    if (!excelDate) return '';
    if (typeof excelDate === 'string' && excelDate.includes('-')) return excelDate;
    // Excel date to JS Date: 25569 is the difference in days between 1900 and 1970
    const date = new Date((excelDate - 25569) * 86400 * 1000);
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
};

const GeneratorStep2 = ({ file, semesterType, sem1Date, setSem1Date, prioritySchemes, setPrioritySchemes }) => {
    const navigate = useNavigate();
    const [regulations, setRegulations] = useState([]);
    const [selectedReg, setSelectedReg] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [downloadProgress, setDownloadProgress] = useState(null);
    const [activeStep, setActiveStep] = useState(0);

    const PROCESSING_STEPS = [
        "Connecting to Dataset Source...",
        "Parsing Regulation Structures...",
        "Extracting Subject Constraints...",
        "Validating Date Ingestion...",
        "Optimizing Branch Sequence...",
        "Formatting PDF Layout...",
        "Finalizing Document Generation"
    ];

    const getProgressStatus = (percent) => {
        if (percent <= 25) return { text: "Initializing Dataset Connection...", color: "text-rose-500", bg: "bg-rose-500" };
        if (percent <= 50) return { text: "Parsing Subject Records...", color: "text-amber-500", bg: "bg-amber-500" };
        if (percent <= 75) return { text: "Optimizing Schedular Algorithm...", color: "text-blue-500", bg: "bg-blue-500" };
        return { text: "Finalizing PDF Structure...", color: "text-emerald-500", bg: "bg-emerald-500" };
    };

    useEffect(() => {
        if (!file) {
            setError('No dataset found. Please go back and upload the Excel file.');
            setIsLoading(false);
            return;
        }

        const parseRegulations = async () => {
            try {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const data = new Uint8Array(e.target.result);
                    const workbook = XLSX.read(data, { type: 'array' });
                    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
                    const jsonData = XLSX.utils.sheet_to_json(worksheet);

                    const schemes = [...new Set(jsonData.map(row => {
                        const val = String(row.SCHEME_TYPE || row.scheme_type || '');
                        if (val === '18' || val === '18A') return '18';
                        return val;
                    }).filter(val => val && val !== '18A'))];

                    setRegulations(schemes);
                    if (prioritySchemes.length === 0) {
                        setPrioritySchemes(schemes);
                    }
                    setIsLoading(false);
                };
                reader.readAsArrayBuffer(file);
            } catch (err) {
                console.error('Error parsing file:', err);
                setError('Failed to parse regulation data.');
                setIsLoading(false);
            }
        };

        parseRegulations();
    }, [file]);

    const handlePriorityToggle = (scheme) => {
        if (prioritySchemes.includes(scheme)) {
            setPrioritySchemes(prioritySchemes.filter(s => s !== scheme));
        } else {
            setPrioritySchemes([...prioritySchemes, scheme]);
        }
    };

    const handleMovePriority = (index, direction) => {
        const newOrder = [...prioritySchemes];
        const targetIndex = index + direction;
        if (targetIndex >= 0 && targetIndex < newOrder.length) {
            [newOrder[index], newOrder[targetIndex]] = [newOrder[targetIndex], newOrder[index]];
            setPrioritySchemes(newOrder);
        }
    };

    const generatePDF = async (targetReg, degreeLevel = 'ALL', isPreview = false) => {
        setDownloadProgress(0);
        
        // Special Case: R-22 ALL download from local path
        if (targetReg === '22' && degreeLevel === 'ALL' && !isPreview) {
            const simulate = async () => {
                for (let p = 0; p <= 100; p += 5) {
                    setDownloadProgress(p);
                    await new Promise(r => setTimeout(r, 100));
                }
                // Attempt to trigger the download from the requested local path
                const link = document.createElement('a');
                link.href = 'file:///C:/Users/sanja/Downloads/ExamScd-2025_R22.pdf';
                link.download = 'ExamScd-2025_R22.pdf';
                link.click();
                setDownloadProgress(null);
            };
            simulate();
            return;
        }

        const simulateProgress = async () => {
            for (let p = 0; p <= 100; p += 2) {
                setDownloadProgress(p);
                await new Promise(resolve => setTimeout(resolve, 60));
            }
        };

        const processData = async () => {
            let dataToProcess;
            
            // Special Case: R-22 UG local file
            if (targetReg === '22' && degreeLevel === 'UG') {
                try {
                    const response = await fetch('/docs/essential_tt [R-22] (4).xlsx');
                    const arrayBuffer = await response.arrayBuffer();
                    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
                    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
                    dataToProcess = XLSX.utils.sheet_to_json(worksheet);
                } catch (err) {
                    console.error("Local file fetch failed:", err);
                    // Fallback to uploaded file if fetch fails
                    const reader = new FileReader();
                    const result = await new Promise((resolve) => {
                        reader.onload = (e) => resolve(e.target.result);
                        reader.readAsArrayBuffer(file);
                    });
                    const workbook = XLSX.read(new Uint8Array(result), { type: 'array' });
                    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
                    dataToProcess = XLSX.utils.sheet_to_json(worksheet);
                }
            } else {
                if (!file) return;
                const reader = new FileReader();
                const result = await new Promise((resolve) => {
                    reader.onload = (e) => resolve(e.target.result);
                    reader.readAsArrayBuffer(file);
                });
                const workbook = XLSX.read(new Uint8Array(result), { type: 'array' });
                const worksheet = workbook.Sheets[workbook.SheetNames[0]];
                dataToProcess = XLSX.utils.sheet_to_json(worksheet);
            }

            // Filter and Format Data
            let filteredData = dataToProcess.filter(row => {
                const reg = String(row.SCHEME_TYPE || row.scheme_type || '');
                const consolidatedReg = (reg === '18' || reg === '18A') ? '18' : reg;
                
                if (consolidatedReg !== targetReg) return false;

                if (degreeLevel !== 'ALL') {
                    const rowDegree = String(row.DEGREE || '').toUpperCase();
                    if (rowDegree && rowDegree !== degreeLevel) return false;
                }

                return true;
            });

            // Sort data by Branch (Strict Order) -> Semester (Desc) -> Date (Asc)
            filteredData.sort((a, b) => {
                const branchA = (BRANCH_MAPPING[a.BRANCH] || a.BRANCH || '').toUpperCase();
                const branchB = (BRANCH_MAPPING[b.BRANCH] || b.BRANCH || '').toUpperCase();
                
                const posA = BRANCH_ORDER.findIndex(bName => bName.toUpperCase() === branchA);
                const posB = BRANCH_ORDER.findIndex(bName => bName.toUpperCase() === branchB);

                if (posA !== posB) return (posA === -1 ? 999 : posA) - (posB === -1 ? 999 : posB);
                if (b.SEMESTER !== a.SEMESTER) return b.SEMESTER - a.SEMESTER;
                return (a.DATE || 0) - (b.DATE || 0);
            });

            const doc = new jsPDF('p', 'mm', 'a4');
            const pageWidth = doc.internal.pageSize.getWidth();

            const addHeader = (doc, targetReg, degreeLevel) => {
                doc.setFontSize(14);
                doc.setFont('times', 'bold');
                doc.text('SRI VENKATESWARA COLLEGE OF ENGINEERING', pageWidth / 2, 15, { align: 'center' });
                
                doc.setFontSize(10);
                doc.setFont('times', 'normal');
                doc.text('(An Autonomous Institution, Affiliated to Anna University, Chennai)', pageWidth / 2, 20, { align: 'center' });
                doc.text('Pennalur, Sriperumbudur Tk - 602 117', pageWidth / 2, 24, { align: 'center' });

                doc.setFontSize(12);
                doc.setFont('times', 'bold');
                doc.text('OFFICE OF THE CONTROLLER OF EXAMINATIONS', pageWidth / 2, 32, { align: 'center' });
                
                doc.setFontSize(11);
                doc.text(`SUMMATIVE EXAMINATIONS TIME TABLE - MAY 2025`, pageWidth / 2, 38, { align: 'center' });
                doc.text(`REGULATION - ${targetReg} (${degreeLevel})`, pageWidth / 2, 44, { align: 'center' });
            };

            let currentBranch = '';
            let branchGroups = {};

            // Group by branch for page breaks
            filteredData.forEach(row => {
                const branchName = BRANCH_MAPPING[row.BRANCH] || row.BRANCH || 'GENERAL';
                if (!branchGroups[branchName]) branchGroups[branchName] = [];
                branchGroups[branchName].push([
                    row['SUBJECT CODE'] || '',
                    row['SUBJECT NAME'] || '',
                    formatExcelDate(row.DATE),
                    row.SESSION || ''
                ]);
            });

            const sortedBranchKeys = Object.keys(branchGroups).sort((a, b) => {
                const posA = BRANCH_ORDER.findIndex(bName => bName.toUpperCase() === a.toUpperCase());
                const posB = BRANCH_ORDER.findIndex(bName => bName.toUpperCase() === b.toUpperCase());
                return (posA === -1 ? 999 : posA) - (posB === -1 ? 999 : posB);
            });

            sortedBranchKeys.forEach((branchName, idx) => {
                if (idx > 0) doc.addPage();
                
                addHeader(doc, targetReg, degreeLevel);
                
                doc.setFontSize(12);
                doc.setFont('times', 'bold');
                doc.text(branchName, 14, 52);

                autoTable(doc, {
                    head: [['Subject Code', 'Subject Name', 'Date', 'Session']],
                    body: branchGroups[branchName],
                    startY: 56,
                    theme: 'grid',
                    headStyles: { fillColor: [41, 128, 185], textColor: 255, halign: 'center' },
                    styles: { font: 'times', fontSize: 10 },
                    margin: { top: 56 }
                });
            });

            if (isPreview) {
                window.open(doc.output('bloburl'), '_blank');
            } else {
                doc.save(`SVCE_TT_MAY_2025_REG_${targetReg}_${degreeLevel}.pdf`);
            }
            
            setDownloadProgress(null);
        };

        await Promise.all([simulateProgress(), processData()]);
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
                    <p className="font-bold text-slate-500 animate-pulse">Analyzing Dataset...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container max-w-6xl mx-auto px-6 py-2 lg:py-4">
            <header className="mb-6 relative">
                <div className="flex justify-between items-center mb-8">
                    <button 
                        onClick={() => navigate('/generator-1')}
                        className="p-3 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-brand-600 hover:border-brand-100 shadow-sm transition-all"
                        title="Back to Step 1"
                    >
                        <ArrowLeft size={24} />
                    </button>
                    <button 
                        onClick={() => navigate('/')}
                        className="p-3 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-brand-600 hover:border-brand-100 shadow-sm transition-all"
                        title="Go Home"
                    >
                        <Home size={24} />
                    </button>
                </div>
                <div className="text-center flex flex-col items-center">
                    <h1 className="text-4xl lg:text-6xl font-black tracking-tighter text-slate-900 mb-2">
                        Refine <span className="text-brand-600">Schedule</span>
                    </h1>
                    <p className="text-slate-500 font-bold tracking-widest uppercase text-xs mb-8">Step 2: Priorities & Details</p>

                    {semesterType === 'ODD' && (
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="p-6 border-l-4 border-brand-600 rounded-2xl bg-white shadow-xl shadow-brand-500/5 min-w-[320px] flex items-center gap-6"
                        >
                            <div className="flex items-center gap-3">
                                <Calendar className="text-brand-600" size={20} />
                                <h3 className="font-black text-slate-900 text-xs uppercase tracking-widest">Sem 1 Start</h3>
                            </div>
                            <input 
                                type="date"
                                value={sem1Date}
                                onChange={(e) => setSem1Date(e.target.value)}
                                className="input-field !py-2 !px-4 h-11 border-2 border-brand-100 focus:border-brand-500 font-bold text-sm"
                            />
                        </motion.div>
                    )}
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
                {/* Priority Regulations Column */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="flex items-center gap-3 mb-2 px-2">
                        <ListFilter className="text-brand-600" size={24} />
                        <h2 className="text-2xl font-black text-slate-900 uppercase">Priority Regulations</h2>
                    </div>
                    
                    <div className="space-y-3">
                        {regulations.map((scheme, index) => {
                            const isPriority = prioritySchemes.includes(scheme);
                            return (
                                <motion.div
                                    layout
                                    key={scheme}
                                    className="glass-card p-4 rounded-2xl bg-white border border-slate-100 flex items-center justify-between group hover:shadow-lg transition-all card-glow-hover"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-xs font-black text-slate-400">
                                            {index + 1}
                                        </div>
                                        <span className="font-bold text-slate-900 text-lg">Reg- {scheme}</span>
                                    </div>
                                    <button 
                                        onClick={() => handlePriorityToggle(scheme)}
                                        className={`px-4 py-2 rounded-xl font-black text-[10px] tracking-widest transition-all ${
                                            isPriority 
                                            ? 'bg-brand-600 text-white shadow-lg shadow-brand-200' 
                                            : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                                        }`}
                                    >
                                        {isPriority ? 'YES' : 'NO'}
                                    </button>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>

                {/* Semester Schedule Section */}
                <div className="lg:col-span-2">
                    <div className="glass-card p-8 lg:p-10 rounded-[2.5rem] bg-white border border-slate-100 card-glow h-full">
                        <div className="flex flex-col items-center justify-center mb-10 text-center">
                            <div className="w-14 h-14 flex items-center justify-center bg-brand-50 rounded-2xl text-brand-600 shadow-sm mb-4">
                                <BookOpen size={28} />
                            </div>
                            <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Semester Schedule</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {regulations.map(scheme => (
                                <div key={scheme} className="p-6 rounded-3xl border-2 border-dotted border-brand-600 bg-slate-50/50 hover:bg-white transition-all duration-500 group card-glow-hover">
                                    <div className="flex items-center justify-between mb-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-brand-600 text-white rounded-xl flex items-center justify-center font-black">
                                                {scheme}
                                            </div>
                                            <h3 className="font-black text-slate-900 uppercase">Regulation {scheme}</h3>
                                        </div>
                                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button className="p-2 bg-slate-100 hover:bg-brand-50 text-slate-400 hover:text-brand-600 rounded-lg transition-all">
                                                <FileText size={18} />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3 mb-6">
                                        <button 
                                            onClick={() => setSelectedReg(selectedReg === scheme ? null : scheme)}
                                            disabled={downloadProgress !== null}
                                            className={`col-span-2 py-3 px-4 rounded-2xl font-black text-sm tracking-widest transition-all flex items-center justify-center gap-2 ${
                                                selectedReg === scheme 
                                                ? 'bg-rose-500 text-white shadow-lg' 
                                                : 'bg-brand-600 text-white hover:bg-brand-700 shadow-lg shadow-brand-100'
                                            } ${downloadProgress !== null ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        >
                                            {selectedReg === scheme ? 'CANCEL SELECTION' : 'SELECT FOR GENERATION'}
                                        </button>
                                    </div>

                                    <AnimatePresence>
                                        {selectedReg === scheme && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                exit={{ opacity: 0, height: 0 }}
                                                className="overflow-hidden"
                                            >
                                                <div className="pt-4 grid grid-cols-2 gap-3 border-t border-slate-200">
                                                    <button 
                                                        onClick={() => generatePDF(scheme, 'UG')}
                                                        className="py-3 px-4 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-2xl text-xs font-black tracking-widest flex items-center justify-center gap-2 transition-all"
                                                    >
                                                        <GraduationCap size={16} /> UG
                                                    </button>
                                                    <button 
                                                        onClick={() => generatePDF(scheme, 'PG')}
                                                        className="py-3 px-4 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-2xl text-xs font-black tracking-widest flex items-center justify-center gap-2 transition-all"
                                                    >
                                                        <GraduationCap size={16} /> PG
                                                    </button>
                                                    <button 
                                                        onClick={() => generatePDF(scheme, 'PHD')}
                                                        className="py-3 px-4 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-2xl text-xs font-black tracking-widest flex items-center justify-center gap-2 transition-all"
                                                    >
                                                        <GraduationCap size={16} /> PHD
                                                    </button>
                                                    <button 
                                                        onClick={() => generatePDF(scheme, 'ALL')}
                                                        className="py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-2xl text-xs font-black tracking-widest flex items-center justify-center gap-2 transition-all"
                                                    >
                                                        <Download size={16} /> ALL
                                                    </button>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <footer className="flex flex-col items-center gap-8 mt-12">
                {error && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="px-6 py-3 bg-rose-50 text-rose-600 rounded-2xl border border-rose-100 font-bold flex items-center gap-2 shadow-sm"
                    >
                        <AlertCircle size={20} />
                        {error}
                    </motion.div>
                )}
                <button
                    onClick={() => navigate('/details')}
                    className="btn-primary group !px-20 !py-6 !rounded-[2rem] text-xl flex items-center gap-4"
                >
                    MORE DETAILS <ChevronRight size={24} strokeWidth={3} className="group-hover:translate-x-1 transition-transform" />
                </button>
            </footer>

            <AnimatePresence>
                {downloadProgress !== null && (
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 50 }}
                        className="fixed bottom-8 right-8 z-[100] w-80 bg-white rounded-3xl p-6 shadow-2xl border border-slate-100 overflow-hidden"
                    >
                        {/* Status bar atop the card */}
                        <div className="absolute top-0 left-0 w-full h-1.5 bg-slate-100">
                            <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${downloadProgress}%` }}
                                className={`h-full transition-all duration-300 ${getProgressStatus(downloadProgress).bg}`}
                            />
                        </div>

                        <div className="flex items-center gap-4 mb-4">
                            <div className={`p-2 rounded-xl bg-slate-50 ${getProgressStatus(downloadProgress).color}`}>
                                <Loader2 className="animate-spin" size={20} />
                            </div>
                            <div className="flex-1">
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Processing</h4>
                                <p className={`text-xs font-bold truncate ${getProgressStatus(downloadProgress).color}`}>
                                    {getProgressStatus(downloadProgress).text}
                                </p>
                            </div>
                            <span className="text-xl font-black text-slate-200">{downloadProgress}%</span>
                        </div>
                        
                        <div className="flex items-center justify-between gap-3 bg-slate-50/50 p-3 rounded-2xl border border-dotted border-slate-200 text-center">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest w-full">SVCE COE SYSTEM</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default GeneratorStep2;
