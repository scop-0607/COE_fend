import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Home, LayoutDashboard, ClipboardCheck, Eye, Download, X, FileCheck, AlertCircle, FileSpreadsheet } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
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
    'MU': 'MECHANICAL and AUTOMATION ENGINEERING',
    'AD': 'ARTIFICIAL INTELLIGENCE AND DATA SCIENCE'
};

const MoreDetails = ({ file }) => {
    const navigate = useNavigate();
    const [previewData, setPreviewData] = useState(null);
    const [isPreviewLoading, setIsPreviewLoading] = useState(false);
    const [activePreviewTitle, setActivePreviewTitle] = useState('');
    const [schemes, setSchemes] = useState([]);
    const [isParsing, setIsParsing] = useState(false);
    const [parseError, setParseError] = useState('');
    const [isPdfDropdownOpen, setIsPdfDropdownOpen] = useState(false);
    useEffect(() => {
        const parseExcel = async () => {
            if (!file) {
                // If no file, default to some example schemes or empty state
                setSchemes(['18', '21']); // Fallback dummy data for visual display if accessed directly
                return;
            }

            setIsParsing(true);
            setParseError('');

            try {
                const buffer = await file.arrayBuffer();
                const workbook = XLSX.read(buffer, { type: 'array' });
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];
                const data = XLSX.utils.sheet_to_json(worksheet);

                // Extract all unique SCHEME_TYPE values
                const uniqueSchemes = new Set();
                data.forEach(row => {
                    if (row.SCHEME_TYPE || row['SCHEME TYPE']) {
                        let scheme = String(row.SCHEME_TYPE || row['SCHEME TYPE']).trim();
                        // Remove 'A' or 'a' from the end, and any existing 'R-' prefix so we don't double up
                        scheme = scheme.replace(/A$/i, '').replace(/^R-/i, '');
                        uniqueSchemes.add(scheme);
                    }
                });

                // Fallback to filename if no schemes found in rows
                if (uniqueSchemes.size === 0 && file.name) {
                    const match = file.name.match(/\[R-(\d+)\]/) || file.name.match(/R-(\d+)/);
                    if (match) {
                        uniqueSchemes.add(match[1]);
                    }
                }

                // Sort in descending order
                const schemeArray = Array.from(uniqueSchemes).sort((a, b) => b.localeCompare(a));
                if (schemeArray.length > 0) {
                    setSchemes(schemeArray);
                } else {
                    setParseError('No SCHEME_TYPE column found and regulation could not be inferred from filename.');
                }
            } catch (err) {
                console.error("Error parsing uploaded file:", err);
                setParseError('Failed to read the dataset file.');
            } finally {
                setIsParsing(false);
            }
        };

        parseExcel();
    }, [file]);

    const getDynamicFiles = (scheme) => [
        {
            title: `COMPLETE SCHEDULE`,
            desc: '',
            icon: <FileSpreadsheet size={32} />,
            color: 'brand',
            path: `/reports/detailed_tt_${scheme}.xlsx`, // Placeholder backend route
            localSource: `detailed_tt_${scheme}.xlsx (Pending Backend)`
        },
        {
            title: `ESSENTIAL TIME TABLE`,
            desc: '',
            icon: <ClipboardCheck size={32} />,
            color: 'brand',
            path: `/reports/essential_tt_${scheme}.xlsx`, // Placeholder backend route
            localSource: `essential_tt_${scheme}.xlsx (Pending Backend)`
        },
    ];

    const handleDownload = (path, title) => {
        if (path === '#') {
            alert(`The report for ${title} is currently unavailable for direct export.`);
            return;
        }
        const link = document.createElement('a');
        link.href = path;
        link.download = path.split('/').pop();
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const getBase64ImageFromURL = (url) => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.setAttribute('crossOrigin', 'anonymous');
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0);
                const dataURL = canvas.toDataURL('image/png');
                resolve(dataURL);
            };
            img.onerror = (error) => reject(error);
            img.src = url;
        });
    };

    const generateSVCEPDF = async (targetScheme) => {
        try {
            if (!file) {
                alert("Please ensure the dataset file is uploaded.");
                return;
            }

            const buffer = await file.arrayBuffer();
            const workbook = XLSX.read(buffer, { type: 'array', cellDates: true });
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            const allData = XLSX.utils.sheet_to_json(worksheet);

            // Helper to format date reliably
            const formatExcelDate = (val) => {
                if (!val) return "";
                if (val instanceof Date) {
                    return val.getFullYear() + "-" + 
                           String(val.getMonth() + 1).padStart(2, '0') + "-" + 
                           String(val.getDate()).padStart(2, '0');
                }
                if (typeof val === 'number') {
                    // Excel base date is 1899-12-30
                    const date = new Date(Math.round((val - 25569) * 864e5));
                    return date.getFullYear() + "-" + 
                           String(date.getMonth() + 1).padStart(2, '0') + "-" + 
                           String(date.getDate()).padStart(2, '0');
                }
                return String(val);
            };

            // Filter data for the target regulation
            const filteredData = allData.filter(row => {
                let rowScheme = "";
                const schemeValue = row.SCHEME_TYPE || row['SCHEME TYPE'];
                if (schemeValue) {
                    rowScheme = String(schemeValue).trim().replace(/A$/i, '').replace(/^R-/i, '');
                } else if (file.name.includes(`[R-${targetScheme}]`) || file.name.includes(`R-${targetScheme}`)) {
                    // Fallback to filename if column is missing
                    rowScheme = targetScheme;
                }
                return rowScheme === targetScheme;
            }).map(row => ({
                ...row,
                DATE: formatExcelDate(row.DATE || row['DATE'])
            }));

            if (filteredData.length === 0) {
                alert(`No data found for Regulation R-${targetScheme}`);
                return;
            }
            // Use the predefined BRANCH_ORDER for expansion if no branches found, 
            // otherwise use all branches in the file plus any missing from ORDER
            const fileBranches = Array.from(new Set(filteredData.map(d => d.BRANCH))).filter(b => b && b !== '-');
            const branchesToUse = fileBranches.length > 0 ? Array.from(new Set([...fileBranches, ...BRANCH_ORDER])) : BRANCH_ORDER;
            
            // Deduplication map: Key = BRANCH + SUBJECT_CODE
            const uniqueEntries = new Map();

            filteredData.forEach(row => {
                const code = row['SUBJECT CODE'] || row['SUBJECT_CODE'] || '';
                if (!code) return; // Skip rows without subject code
                
                if (row.BRANCH === '-') {
                    // Expand to all branches for this semester
                    branchesToUse.forEach(branch => {
                        const key = `${branch}-${code}`;
                        if (!uniqueEntries.has(key)) {
                            uniqueEntries.set(key, { ...row, BRANCH: branch });
                        }
                    });
                } else {
                    const key = `${row.BRANCH}-${code}`;
                    if (!uniqueEntries.has(key)) {
                        uniqueEntries.set(key, row);
                    }
                }
            });

            const expandedData = Array.from(uniqueEntries.values());

            // Enhanced sorting logic:
            // 1. Branch (Custom Order)
            // 2. Semester (Descending - 8 to 1)
            // 3. Date (Ascending)
            const sortedData = expandedData.sort((a, b) => {
                const idxA = BRANCH_ORDER.indexOf(a.BRANCH);
                const idxB = BRANCH_ORDER.indexOf(b.BRANCH);
                const posA = idxA === -1 ? 999 : idxA;
                const posB = idxB === -1 ? 999 : idxB;

                if (posA !== posB) return posA - posB;
                if (b.SEMESTER !== a.SEMESTER) return b.SEMESTER - a.SEMESTER;
                return new Date(a.DATE) - new Date(b.DATE);
            });

            const uniqueBranchesContained = Array.from(new Set(sortedData.map(d => d.BRANCH))).sort((a, b) => {
                const posA = BRANCH_ORDER.indexOf(a) === -1 ? 999 : BRANCH_ORDER.indexOf(a);
                const posB = BRANCH_ORDER.indexOf(b) === -1 ? 999 : BRANCH_ORDER.indexOf(b);
                return posA - posB;
            });

            const doc = new jsPDF('p', 'mm', 'a4');
            const pageWidth = doc.internal.pageSize.getWidth();

            // Load Logo - Do this once
            let logoBase64 = null;
            try {
                logoBase64 = await getBase64ImageFromURL('/SVCE_Logo.png');
            } catch (e) {
                console.error("Logo failed to load", e);
            }

            // Extract Month/Year for filename, but use "MAY 2025" for header as requested
            const dates = sortedData.map(d => new Date(d.DATE)).filter(d => !isNaN(d));
            const latestDate = dates.length > 0 ? new Date(Math.max(...dates)) : new Date();
            const periodStr = "MAY 2025";

            const drawHeader = (doc, pageNum) => {
                if (logoBase64) {
                    doc.addImage(logoBase64, 'PNG', 15, 10, 25, 25);
                }

                // Header Text
                doc.setFontSize(14);
                doc.setFont('helvetica', 'bold');
                doc.text('SRI VENKATESWARA COLLEGE OF ENGINEERING', pageWidth / 2 + 15, 18, { align: 'center' });
                
                doc.setFontSize(11);
                doc.setFont('helvetica', 'normal');
                doc.text('(An Autonomous Institution; Affiliated to Anna University, Chennai)', pageWidth / 2 + 15, 24, { align: 'center' });

                doc.setFontSize(12);
                doc.setFont('helvetica', 'bold');
                doc.text(`Time Table - BE/B. Tech. Degree End Semester Examinations R${targetScheme} - ${periodStr}`, pageWidth / 2 + 15, 32, { align: 'center' });
            };

            uniqueBranchesContained.forEach((branch, bIdx) => {
                const branchData = sortedData.filter(d => d.BRANCH === branch);
                const branchSemesters = Array.from(new Set(branchData.map(d => d.SEMESTER))).sort((a, b) => b - a);

                if (bIdx > 0) {
                    doc.addPage();
                }

                const branchTableBody = [];
                branchSemesters.forEach(sem => {
                    const branchName = BRANCH_NAMES[branch] || `Branch: ${branch}`;
                    // Row for Branch/Semester header
                    branchTableBody.push([
                        { 
                            content: `Branch: ${branchName} - Semester ${sem}`, 
                            colSpan: 4, 
                            styles: { fillColor: [230, 230, 230], fontStyle: 'bold', textColor: [0, 0, 0], halign: 'left' } 
                        }
                    ]);

                    const semData = branchData.filter(d => d.SEMESTER === sem);
                    semData.forEach(row => {
                        branchTableBody.push([
                            row['SUBJECT CODE'] || row['SUBJECT_CODE'] || '',
                            row['SUBJECT NAME'] || row['SUBJECT_NAME'] || '',
                            row['DATE'] || '',
                            row['SESSION'] || ''
                        ]);
                    });
                });

                autoTable(doc, {
                    startY: 45,
                    head: [['SUBJECT CODE', 'SUBJECT NAME', 'DATE', 'SESSION']],
                    body: branchTableBody,
                    theme: 'grid',
                    headStyles: { fillColor: [60, 60, 60], textColor: [255, 255, 255], fontStyle: 'bold', halign: 'center' },
                    columnStyles: {
                        0: { halign: 'center', cellWidth: 35 },
                        1: { halign: 'left' },
                        2: { halign: 'center', cellWidth: 30 },
                        3: { halign: 'center', cellWidth: 20 },
                    },
                    styles: { fontSize: 8, font: 'helvetica', overflow: 'linebreak' },
                    margin: { top: 45 },
                    didDrawPage: (data) => {
                        drawHeader(doc, data.pageNumber);
                    }
                });
            });

            doc.save(`ExamScd-${latestDate.getFullYear()}_R${targetScheme}.pdf`);
        } catch (error) {
            console.error("PDF Generation Error:", error);
            alert("Failed to generate PDF. check console for details.");
        }
    };

    const handlePreview = async (path, title) => {
        if (path === '#') {
            alert(`No preview available for ${title}.`);
            return;
        }

        setIsPreviewLoading(true);
        setActivePreviewTitle(title);
        try {
            const response = await fetch(path);
            const arrayBuffer = await response.arrayBuffer();
            const data = new Uint8Array(arrayBuffer);
            const workbook = XLSX.read(data, { type: 'array' });
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

            // Limit to first 10 rows for preview
            setPreviewData(jsonData.slice(0, 11));
        } catch (error) {
            console.error("Error loading preview:", error);
            alert("Could not load preview. Please ensure the file exists.");
        } finally {
            setIsPreviewLoading(false);
        }
    };

    return (
        <div className="container max-w-6xl mx-auto px-6 py-2">
            <header className="mb-6 relative">
                <div className="flex justify-between items-center mb-8">
                    <button 
                        onClick={() => navigate('/generator-2')}
                        className="p-3 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-brand-600 hover:border-brand-100 shadow-sm transition-all"
                        title="Back to Step 2"
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
                
                <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                    <h1 className="text-5xl lg:text-7xl font-black text-slate-900 tracking-tighter text-center md:text-left">
                        Secondary <span className="text-brand-600">Datasets</span>
                    </h1>
                </div>
            </header>

            {isParsing ? (
                <div className="flex flex-col items-center justify-center py-20 grayscale opacity-50">
                    <div className="w-12 h-12 border-4 border-slate-200 border-t-brand-600 rounded-full animate-spin mb-4" />
                    <p className="font-bold text-slate-500 uppercase tracking-widest text-sm">Analyzing Dataset...</p>
                </div>
            ) : parseError ? (
                <div className="flex flex-col items-center justify-center py-20">
                    <AlertCircle size={48} className="text-rose-400 mb-4" />
                    <p className="font-bold text-slate-700 text-lg">{parseError}</p>
                    <p className="text-slate-500 text-sm mt-2">Please ensure you uploaded a valid dataset with a 'SCHEME_TYPE' column.</p>
                </div>
            ) : (
                <div className="space-y-12 mb-20">
                    {schemes.map((scheme, schemeIdx) => (
                        <div key={schemeIdx}>
                            <div className="flex items-center gap-4 mb-8">
                                <div className="h-10 w-2.5 bg-brand-600 rounded-full shadow-lg shadow-brand-200" />
                                <h2 className="text-3xl font-black text-slate-900 tracking-tight">Regulation (R - {scheme})</h2>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {getDynamicFiles(scheme).map((file, idx) => (
                                    <motion.div
                                        key={`${schemeIdx}-${idx}`}
                                        initial={{ opacity: 0, y: 30 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: (schemeIdx * 0.2) + (idx * 0.15) }}
                                        className="glass-card p-8 flex flex-col items-center relative overflow-hidden bg-white border border-slate-200 group hover:border-brand-300 hover:shadow-2xl hover:shadow-brand-100 transition-all duration-500 card-glow-hover text-center"
                                    >
                                        <div className="flex flex-row items-center justify-center gap-4 mb-6 mt-2">
                                            <div className="p-3 rounded-2xl bg-brand-50 text-brand-600 shadow-sm border border-brand-100 group-hover:scale-110 transition-all duration-500">
                                                {file.icon}
                                            </div>
                                            <h3 className="text-2xl font-bold text-slate-900 tracking-tight group-hover:text-brand-600 transition-colors">{file.title}</h3>
                                        </div>

                                        <div className="px-3 py-1 bg-amber-50 text-amber-600 border border-amber-200 text-xs font-bold rounded-md mb-6 inline-flex items-center gap-2">
                                            <AlertCircle size={14} /> Backend Integration Pending
                                        </div>
                                        
                                        {file.localSource && (
                                            <p className="text-[10px] text-slate-400 mb-12 font-mono truncate w-full flex items-center gap-1.5">
                                                <FileCheck size={10} className="text-brand-500" />
                                                Source: {file.localSource}
                                            </p>
                                        )}
                                        {!file.localSource && <div className="mb-12" />}

                                        <div className="w-full flex gap-4 mt-auto opacity-60 grayscale cursor-not-allowed">
                                            <button
                                                disabled
                                                className="w-14 h-14 flex items-center justify-center bg-slate-50 text-slate-400 rounded-2xl border border-slate-100 shadow-sm"
                                                title="Preview Spreadsheet (Pending)"
                                            >
                                                <Eye size={22} />
                                            </button>
                                            <button
                                                disabled
                                                className="btn-primary flex-grow !h-14 !inline-flex items-center justify-center gap-3 !px-6 !py-3 !text-sm !tracking-widest !rounded-2xl"
                                            >
                                                <Download size={20} />
                                                <span>EXPORT .XLSX</span>
                                            </button>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <AnimatePresence>
                {previewData && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl max-h-[80vh] overflow-hidden flex flex-col border border-slate-200"
                        >
                            <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0">
                                <div>
                                    <h2 className="text-2xl font-bold text-slate-900">{activePreviewTitle}</h2>
                                    <p className="text-sm text-slate-500 mt-1 uppercase font-black tracking-widest">Showing Sample Preview (First 10 Rows)</p>
                                </div>
                                <button
                                    onClick={() => setPreviewData(null)}
                                    className="p-3 hover:bg-slate-100 text-slate-400 hover:text-rose-600 rounded-full transition-all"
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="p-8 overflow-auto">
                                <table className="w-full border-collapse">
                                    <thead>
                                        <tr className="bg-slate-50/80">
                                            {previewData[0]?.map((cell, i) => (
                                                <th key={i} className="text-left px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest border-b border-slate-200">
                                                    {cell || `Col ${i + 1}`}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {previewData.slice(1).map((row, i) => (
                                            <tr key={i} className="hover:bg-brand-50/30 transition-colors">
                                                {row.map((cell, j) => (
                                                    <td key={j} className="px-6 py-4 text-sm text-slate-600 border-b border-slate-100 border-dashed">
                                                        {cell}
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <div className="p-8 border-t border-slate-100 bg-slate-50/50 flex justify-end">
                                <button
                                    onClick={() => setPreviewData(null)}
                                    className="px-8 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg"
                                >
                                    Close Preview
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default MoreDetails;
