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
    Loader2,
    Eye,
    Archive
} from 'lucide-react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import JSZip from 'jszip';

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
    'AE': 'AUTOMOBILE ENGINEERING',
    'MA': 'MECHANICAL ENGINEERING (AUTOMOBILE)',
    'AM': 'MECHANICAL ENGINEERING (AUTOMOBILE)',
    'BT': 'BIO TECHNOLOGY',
    'BY': 'BIO TECHNOLOGY',
    'CH': 'CHEMICAL ENGINEERING',
    'CE': 'CIVIL ENGINEERING',
    'CS': 'COMPUTER SCIENCE AND ENGINEERING',
    'EE': 'ELECTRICAL AND ELECTRONICS ENGINEERING',
    'EC': 'ELECTRONICS AND COMMUNICATION ENGINEERING',
    'IT': 'INFORMATION TECHNOLOGY',
    'MR': 'MARINE ENGINEERING',
    'ME': 'MECHANICAL ENGINEERING',
    'MN': 'MECHANICAL AND AUTOMATION ENGINEERING',
    'MU': 'MECHANICAL AND AUTOMATION ENGINEERING',
    'AD': 'ARTIFICIAL INTELLIGENCE AND DATA SCIENCE',
    'AI': 'ARTIFICIAL INTELLIGENCE AND DATA SCIENCE'
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

const SAMPLE_SUBJECTS = [
    { sNo: 184, code: "ME16303", name: "Engineering Materials and Metallurg", semester: 3, branch: "ME", category: "NON_ANALYTICAL" },
    { sNo: 185, code: "ME16304", name: "Mechanics of Solids", semester: 3, branch: "ME", category: "NON_ANALYTICAL" },
    { sNo: 186, code: "ME18301", name: "Engineering Thermodynamics", semester: 3, branch: "ME", category: "NON_ANALYTICAL" },
    { sNo: 187, code: "ME18302", name: "Manufacturing Processes", semester: 3, branch: "ME", category: "NON_ANALYTICAL" },
    { sNo: 188, code: "ME18303", name: "Material Characterization and Metal", semester: 3, branch: "ME", category: "NON_ANALYTICAL" },
    { sNo: 189, code: "ME18304", name: "Mechanics of Solids", semester: 3, branch: "ME", category: "NON_ANALYTICAL" },
    { sNo: 190, code: "ME22301", name: "Engineering Thermodynamics", semester: 3, branch: "ME", category: "NON_ANALYTICAL" },
    { sNo: 191, code: "ME22302", name: "Mechanics of Materials", semester: 3, branch: "ME", category: "NON_ANALYTICAL" },
    { sNo: 192, code: "ME22303", name: "Machine Tools Operations", semester: 3, branch: "ME", category: "NON_ANALYTICAL" },
    { sNo: 193, code: "MN22301", name: "Introduction to Industrial Automati", semester: 3, branch: "MN", category: "NON_ANALYTICAL" },
    { sNo: 194, code: "MN22302", name: "Theory of Machines", semester: 3, branch: "MN", category: "NON_ANALYTICAL" },
    { sNo: 195, code: "MN22303", name: "Manufacturing Technology", semester: 3, branch: "MN", category: "NON_ANALYTICAL" },
    { sNo: 196, code: "MR22302", name: "Marine Auxiliary Machinery I", semester: 3, branch: "MR", category: "NON_ANALYTICAL" },
    { sNo: 197, code: "MR22303", name: "Seamanship, Elementary Navigation a", semester: 3, branch: "MR", category: "NON_ANALYTICAL" },
    { sNo: 198, code: "GE22451", name: "Environmental Sciences and Sustaina", semester: 4, branch: "-", category: "NON_ANALYTICAL" },
    { sNo: 199, code: "MA16453", name: "Probability and Queuing Theory", semester: 4, branch: "-", category: "ANALYTICAL" },
    { sNo: 200, code: "MA18451", name: "Computational Methods", semester: 4, branch: "-", category: "ANALYTICAL" },
    { sNo: 201, code: "MA18452", name: "Partial Differential Equations and", semester: 4, branch: "-", category: "ANALYTICAL" },
    { sNo: 202, code: "MA18453", name: "Probability and Queuing Theory", semester: 4, branch: "-", category: "ANALYTICAL" },
    { sNo: 203, code: "MA18454", name: "Probability and Random Processes", semester: 4, branch: "-", category: "ANALYTICAL" },
    { sNo: 204, code: "MA18455", name: "Probability and Statistics", semester: 4, branch: "-", category: "ANALYTICAL" },
    { sNo: 205, code: "MA18456", name: "Queuing Theory and Optimization", semester: 4, branch: "-", category: "ANALYTICAL" },
    { sNo: 206, code: "MA22451", name: "Introduction to Biostatistics", semester: 4, branch: "-", category: "ANALYTICAL" },
    { sNo: 207, code: "MA22452", name: "Numerical Methods", semester: 4, branch: "-", category: "ANALYTICAL" },
    { sNo: 208, code: "MA22453", name: "Statistics and Numerical Methods", semester: 4, branch: "-", category: "ANALYTICAL" },
    { sNo: 209, code: "MA22454", name: "PROBABILITY AND QUEUING THEORY", semester: 4, branch: "-", category: "ANALYTICAL" },
    { sNo: 210, code: "MA22455", name: "QUEUING THEORY AND OPTIMIZATION", semester: 4, branch: "-", category: "ANALYTICAL" },
    { sNo: 211, code: "MA22456", name: "MATHEMATICS FOR MACHINE LEARNING", semester: 4, branch: "-", category: "ANALYTICAL" },
    { sNo: 212, code: "AD18401", name: "Intelligent Computer Networks", semester: 4, branch: "AD", category: "NON_ANALYTICAL" },
    { sNo: 213, code: "AD18402", name: "Principles of Artificial Intelligen", semester: 4, branch: "AD", category: "NON_ANALYTICAL" },
    { sNo: 214, code: "AD18403", name: "Applied Machine Learning", semester: 4, branch: "AD", category: "NON_ANALYTICAL" },
    { sNo: 215, code: "AD18404", name: "Object Oriented Software Engineerin", semester: 4, branch: "AD", category: "NON_ANALYTICAL" },
    { sNo: 216, code: "AD22401", name: "WEB DEVELOPMENT AND ANALYTICS", semester: 4, branch: "AD", category: "NON_ANALYTICAL" },
    { sNo: 217, code: "AE22401", name: "Applied Mechanics", semester: 4, branch: "AE", category: "NON_ANALYTICAL" },
    { sNo: 218, code: "AE22402", name: "Automotive Electrical, Electronics", semester: 4, branch: "AE", category: "NON_ANALYTICAL" },
    { sNo: 219, code: "AE22403", name: "Thermal Engineering and Heat Transf", semester: 4, branch: "AE", category: "NON_ANALYTICAL" },
    { sNo: 220, code: "AE22408", name: "Automotive Chassis Components: Theo", semester: 4, branch: "AE", category: "NON_ANALYTICAL" },
    { sNo: 221, code: "AE22409", name: "Mechanics of Solids: Theory and Pra", semester: 4, branch: "AE", category: "NON_ANALYTICAL" },
    { sNo: 222, code: "BT22401", name: "Analytical Techniques and Instrumen", semester: 4, branch: "BT", category: "NON_ANALYTICAL" },
    { sNo: 223, code: "BT22402", name: "Transport Phenomena of Bioprocesses", semester: 4, branch: "BT", category: "NON_ANALYTICAL" },
    { sNo: 224, code: "BT22403", name: "Chemical and Biochemical Thermodyna", semester: 4, branch: "BT", category: "NON_ANALYTICAL" },
    { sNo: 225, code: "BT22404", name: "Genetics and Molecular Biology", semester: 4, branch: "BT", category: "NON_ANALYTICAL" },
    { sNo: 226, code: "CE18401", name: "Strength of Materials II", semester: 4, branch: "CE", category: "NON_ANALYTICAL" }
];

const GeneratorStep2 = ({ file, semesterType, sem1Date, setSem1Date, prioritySchemes, setPrioritySchemes }) => {
    const navigate = useNavigate();
    const [regulations, setRegulations] = useState([]);
    const [selectedReg, setSelectedReg] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [downloadProgress, setDownloadProgress] = useState(null);
    const [activeStep, setActiveStep] = useState(0);
    const [showRegulations, setShowRegulations] = useState(false);
    const [subjectsData, setSubjectsData] = useState(SAMPLE_SUBJECTS);
    const [searchQuery, setSearchQuery] = useState('');
    const [isConfirmed, setIsConfirmed] = useState(false);
    const [engineProgress, setEngineProgress] = useState(null);
    const [engineComplete, setEngineComplete] = useState(false);
    const [expandedRegulation, setExpandedRegulation] = useState(null);
    const [expandedDegree, setExpandedDegree] = useState(null);

    const toggleSubjectCategory = (code) => {
        setSubjectsData(prev => prev.map(sub => 
            sub.code === code 
            ? { ...sub, category: sub.category === 'ANALYTICAL' ? 'NON_ANALYTICAL' : 'ANALYTICAL' }
            : sub
        ));
    };

    const startEngine = async () => {
        setEngineProgress(0);
        const intervals = [
            { temp: 15, delay: 500 },
            { temp: 30, delay: 800 },
            { temp: 50, delay: 700 },
            { temp: 70, delay: 800 },
            { temp: 85, delay: 900 },
            { temp: 99, delay: 1000 },
            { temp: 100, delay: 500 }
        ];
        for (const step of intervals) {
            await new Promise(r => setTimeout(r, step.delay));
            setEngineProgress(step.temp);
        }
        await new Promise(r => setTimeout(r, 600)); // Short pause at 100%
        setEngineComplete(true);
    };

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
        if (percent < 30) return { text: "Initializing Engine...", color: "text-blue-500", bg: "bg-blue-500", border: "border-blue-500" };
        if (percent < 50) return { text: "Extracting Datasets...", color: "text-indigo-500", bg: "bg-indigo-500", border: "border-indigo-500" };
        if (percent < 70) return { text: "Applying Constraints...", color: "text-amber-500", bg: "bg-amber-500", border: "border-amber-500" };
        if (percent < 85) return { text: "Scheduling Algorithm...", color: "text-orange-500", bg: "bg-orange-500", border: "border-orange-500" };
        if (percent < 99) return { text: "Generating Pdfs...", color: "text-rose-500", bg: "bg-rose-500", border: "border-rose-500" };
        if (percent < 100) return { text: "Finalizing Output...", color: "text-emerald-400", bg: "bg-emerald-400", border: "border-emerald-400" };
        return { text: "Pdfs Ready!", color: "text-emerald-500", bg: "bg-emerald-500", border: "border-emerald-500" };
    };

    useEffect(() => {
        if (engineComplete) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }, [engineComplete]);

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
                        const val = String(row.SCHEME_TYPE || row.scheme_type || '').trim();
                        // Remove 'R-' prefix and 'A' suffix, then normalize
                        // R-18, R-18A -> 18; R-22 -> 22; R-16 -> 16
                        let normalized = val.replace(/^R-/i, '').replace(/A$/i, '');
                        // Filter out empty or invalid values
                        if (!normalized || isNaN(parseInt(normalized))) return null;
                        return normalized;
                    }).filter(val => val !== null && val !== ''))];

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

        const simulateProgress = async () => {
            for (let p = 0; p <= 100; p += 2) {
                setDownloadProgress(p);
                await new Promise(resolve => setTimeout(resolve, 60));
            }
        };

        const processData = async () => {
            if (!file) {
                console.error("No Registration Excel File found");
                setDownloadProgress(null);
                alert("Please upload the Registration Excel (Base File) in Step 1 first.");
                return;
            }

            try {
                // Preload Logo image as Base64 safely to prevent PDF stream corruption
                let logoBase64 = null;
                try {
                    const logoResp = await fetch('/SVCE_Logo.png');
                    if (logoResp.ok) {
                        const logoBlob = await logoResp.blob();
                        logoBase64 = await new Promise((resolve) => {
                            const r = new FileReader();
                            r.onload = (e) => resolve(e.target.result);
                            r.readAsDataURL(logoBlob);
                        });
                    }
                } catch(e) {
                    console.log('Logo fetch failed', e);
                }

                // 1. Read Registration Excel File (uploaded in Step 1)
                const reader = new FileReader();
                const result = await new Promise((resolve) => {
                    reader.onload = (e) => resolve(e.target.result);
                    reader.readAsArrayBuffer(file);
                });
                const regWorkbook = XLSX.read(new Uint8Array(result), { type: 'array' });
                const regWorksheet = regWorkbook.Sheets[regWorkbook.SheetNames[0]];
                const regData = XLSX.utils.sheet_to_json(regWorksheet);

                // 2. Fetch and Read essential_tt Excel File (Backend fetched)
                // Use regulation-specific file
                const essentialTtPath = `/essential_tt [R-${targetReg}].xlsx`;
                const encodedPath = encodeURI(essentialTtPath);
                const response = await fetch(encodedPath);
                if (!response.ok) throw new Error(`Failed to fetch essential_tt [R-${targetReg}].xlsx`);
                const arrayBuffer = await response.arrayBuffer();
                const ttWorkbook = XLSX.read(arrayBuffer, { type: 'array' });
                const ttWorksheet = ttWorkbook.Sheets[ttWorkbook.SheetNames[0]];
                const ttData = XLSX.utils.sheet_to_json(ttWorksheet);

                // 3. Map out the `essential_tt` schedule details by Subject Code and Branch
                // For common/OE subjects, BRANCH might be "-" or empty
                const scheduleMap = new Map();
                ttData.forEach(row => {
                    const code = String(row['SUBJECT CODE'] || '').trim().toUpperCase();
                    const branch = String(row['BRANCH'] || row['branch'] || '').trim().toUpperCase();
                    if (code) {
                        if (!scheduleMap.has(code)) {
                            scheduleMap.set(code, []);
                        }
                        scheduleMap.get(code).push({
                            branch: branch,
                            DATE: row['DATE'],
                            SESSION: row['SESSION']
                        });
                    }
                });

                // 4. Filter the Registration Excel based on SCHEME_TYPE and DEGREE_TYPE
                // Also consolidate targetReg for comparison
                const consolidatedTargetReg = (targetReg === '18' || targetReg === '18A' || targetReg === 'R-18' || targetReg === 'R-18A') ? '18' : targetReg.replace('R-', '');
                
                const filteredReg = regData.filter(row => {
                    const reg = String(row.SCHEME_TYPE || row.scheme_type || '');
                    const consolidatedReg = (reg === '18' || reg === '18A' || reg === 'R-18' || reg === 'R-18A') ? '18' : reg.replace('R-', '');
                    if (consolidatedReg !== consolidatedTargetReg) return false;

                    const rowDegree = String(row.DEGREE_TYPE || row.DEGREE || '').toUpperCase().trim();
                    const normalizedDegree = rowDegree.replace(/\./g, '');
                    if (degreeLevel !== 'ALL' && normalizedDegree !== degreeLevel) return false;

                    return true;
                });

                // Check if any data exists for this degree type
                if (filteredReg.length === 0) {
                    setDownloadProgress(null);
                    alert(`No exams scheduled for ${degreeLevel} in Regulation R-${targetReg}.`);
                    return;
                }

                // 5. Build unique combinations of (BRANCH, SEMESTER, SUBJECT CODE, SUBJECT NAME)
                const uniqueSubjectsMap = new Map();
                filteredReg.forEach(row => {
                    const branchCode = String(row.BRANCH || '').trim();
                    const semester = row.SEMESTER;
                    const subjectCode = String(row['SUBJECT CODE'] || '').trim().toUpperCase();
                    const subjectName = String(row['SUBJECT NAME'] || '').trim();

                    if (!branchCode || !subjectCode) return;

                    const key = `${branchCode}_${semester}_${subjectCode}`;
                    if (!uniqueSubjectsMap.has(key)) {
                        uniqueSubjectsMap.set(key, {
                            BRANCH: branchCode,
                            SEMESTER: semester,
                            'SUBJECT CODE': subjectCode,
                            'SUBJECT NAME': subjectName
                        });
                    }
                });

                // 6. Merge with Schedule Map
                // Try to find branch-specific schedule first, then fall back to common/OE subjects
                const scheduledItems = [];
                uniqueSubjectsMap.forEach((item) => {
                    const schedules = scheduleMap.get(item['SUBJECT CODE']) || [];
                    
                    // First try to find a schedule matching the specific branch
                    let schedule = schedules.find(s => s.branch === item.BRANCH);
                    
                    // If not found, try to find a common/OE schedule (branch is "-" or empty)
                    if (!schedule) {
                        schedule = schedules.find(s => s.branch === '-' || s.branch === '');
                    }
                    
                    // Also check if the registration branch itself might match
                    if (!schedule) {
                        const itemBranchUpper = item.BRANCH.toUpperCase();
                        schedule = schedules.find(s => s.branch === itemBranchUpper);
                    }

                    if (schedule) {
                        scheduledItems.push({
                            ...item,
                            DATE: schedule.DATE,
                            SESSION: schedule.SESSION
                        });
                    }
                });

                // 7. Group by Branch and Sort
                let branchGroups = {};
                scheduledItems.forEach(row => {
                    const fullBranchName = BRANCH_MAPPING[row.BRANCH] || row.BRANCH || 'GENERAL CATEGORY';
                    if (!branchGroups[fullBranchName]) branchGroups[fullBranchName] = [];
                    branchGroups[fullBranchName].push(row);
                });

                // Check if any scheduled items exist
                if (scheduledItems.length === 0) {
                    setDownloadProgress(null);
                    alert(`No exams scheduled for ${degreeLevel} in Regulation R-${targetReg}.`);
                    return;
                }

                const sortedBranchKeys = Object.keys(branchGroups).sort((a, b) => {
                    const posA = BRANCH_ORDER.findIndex(bName => bName.toUpperCase() === a.toUpperCase());
                    const posB = BRANCH_ORDER.findIndex(bName => bName.toUpperCase() === b.toUpperCase());
                    return (posA === -1 ? 999 : posA) - (posB === -1 ? 999 : posB);
                });

                const doc = new jsPDF('p', 'mm', 'a4');
                const pageWidth = doc.internal.pageSize.getWidth();

                let dynamicDegreeText = 'BE/B. Tech. Degree';
                if (degreeLevel === 'PG') dynamicDegreeText = 'ME/M. Tech. Degree';
                else if (degreeLevel === 'PHD') dynamicDegreeText = 'Ph.D. Degree';

                // We calculate standard MONTH YEAR (from prompt: "till now I will give (MAY 2025)")
                const monthYear = 'MAY 2025';

                const addHeader = (doc) => {
                    // Include Logo if preloaded securely
                    if (logoBase64) {
                        try {
                            doc.addImage(logoBase64, 'PNG', 10, 12, 25, 25);
                        } catch(e) { console.warn('Logo could not be added cleanly. Continuing without.', e); }
                    }

                    doc.setFontSize(14);
                    doc.setFont('times', 'bold');
                    doc.text('SRI VENKATESWARA COLLEGE OF ENGINEERING', pageWidth / 2 + 8, 20, { align: 'center' });
                    
                    doc.setFontSize(10);
                    doc.setFont('times', 'normal');
                    doc.text('(An Autonomous Institution, Affiliated to Anna University, Chennai)', pageWidth / 2 + 8, 25, { align: 'center' });

                    doc.setFontSize(12);
                    doc.setFont('times', 'bold');
                    doc.text(`Timetable - ${dynamicDegreeText} End Semester Examinations R${targetReg} - ${monthYear}`, pageWidth / 2 + 8, 32, { align: 'center' });
                };

                let isFirstTable = true;
                
                sortedBranchKeys.forEach((branchName, idx) => {
                    if (!isFirstTable) doc.addPage();
                    isFirstTable = false;
                    
                    addHeader(doc);
                    
                    const branchItems = branchGroups[branchName];
                    
                    // Group by Semester descending
                    const semGroups = {};
                    branchItems.forEach(item => {
                        const sem = item.SEMESTER;
                        if (!semGroups[sem]) semGroups[sem] = [];
                        semGroups[sem].push(item);
                    });
                    
                    const sortedSems = Object.keys(semGroups).sort((a, b) => b - a);
                    
                    let currentY = 45;

                    sortedSems.forEach((sem, semIdx) => {
                        // Sort inside sem by Date
                        const semItems = semGroups[sem].sort((a, b) => {
                            const dateA = formatExcelDate(a.DATE) || '';
                            const dateB = formatExcelDate(b.DATE) || '';
                            return dateA.localeCompare(dateB);
                        });

                        const tableBody = semItems.map(row => {
                            let formattedDate = formatExcelDate(row.DATE);
                            // Format strictly to DD-MM-YYYY as requested
                            if (formattedDate && formattedDate.includes('-')) {
                                const parts = formattedDate.split('-');
                                if (parts.length === 3 && parts[0].length === 4) {
                                    formattedDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
                                }
                            }
                            return [
                                row['SUBJECT CODE'],
                                row['SUBJECT NAME'],
                                formattedDate,
                                row.SESSION
                            ];
                        });

                        // Estimate table height (approx 8mm per row + header)
                        const estimatedTableHeight = tableBody.length * 8 + 15;
                        
                        // If table won't fit in remaining space, start new page
                        if (currentY + estimatedTableHeight > 270 && semIdx > 0) {
                            doc.addPage();
                            addHeader(doc);
                            currentY = 45;
                        }

                        doc.setFontSize(11);
                        doc.setFont('times', 'bold');
                        doc.text(`Branch: ${branchName} - Semester ${sem}`, 14, currentY);

                        // Only draw table if there's data
                        if (tableBody.length === 0) {
                            console.log(`No subjects found for Branch: ${branchName}, Semester: ${sem}`);
                            currentY += 10;
                        } else {
                            autoTable(doc, {
                                head: [['SUBJECT CODE', 'SUBJECT NAME', 'DATE', 'SESSION']],
                                body: tableBody,
                                startY: currentY + 4,
                                theme: 'grid',
                                headStyles: { fillColor: [200, 200, 200], textColor: 0, halign: 'center', font: 'times', fontStyle: 'bold' },
                                styles: { font: 'times', fontSize: 10, textColor: 0 },
                                margin: { left: 14, right: 14 }
                            });
                        }

                        currentY = doc.lastAutoTable.finalY + 15;
                    });
                });

                if (isPreview) {
                    window.open(doc.output('bloburl'), '_blank');
                } else {
                    doc.save(`SVCE_TT_${monthYear.replace(' ', '_')}_REG_${targetReg}_${degreeLevel}.pdf`);
                }
                
                setDownloadProgress(null);
            } catch (error) {
                console.error("PDF Generation Error: ", error);
                console.error("Error stack:", error.stack);
                setDownloadProgress(null);
                alert(`Failed to generate PDF: ${error.message || error}`);
            }
        };

        await Promise.all([simulateProgress(), processData()]);
    };

    const downloadAllPDFs = async () => {
        setDownloadProgress(0);
        
        try {
            const zip = new JSZip();
            const monthYear = 'MAY_2025';
            let hasAnyData = false;

            // Iterate through all regulations and degree types
            for (const reg of regulations) {
                const regFolder = zip.folder(`R-${reg}`);
                
                for (const degree of ['UG', 'PG', 'PHD']) {
                    try {
                        // Read registration file
                        const reader = new FileReader();
                        const result = await new Promise((resolve, reject) => {
                            reader.onload = (e) => resolve(e.target.result);
                            reader.onerror = reject;
                            reader.readAsArrayBuffer(file);
                        });
                        
                        const regWorkbook = XLSX.read(new Uint8Array(result), { type: 'array' });
                        const regWorksheet = regWorkbook.Sheets[regWorkbook.SheetNames[0]];
                        const regData = XLSX.utils.sheet_to_json(regWorksheet);

                        // Fetch essential_tt - use regulation-specific file
                        const essentialTtPath = `/essential_tt [R-${reg}].xlsx`;
                        const encodedPath = encodeURI(essentialTtPath);
                        const response = await fetch(encodedPath);
                        if (!response.ok) {
                            console.log(`Skipping R-${reg} - essential_tt file not found`);
                            continue;
                        }
                        const arrayBuffer = await response.arrayBuffer();
                        const ttWorkbook = XLSX.read(arrayBuffer, { type: 'array' });
                        const ttWorksheet = ttWorkbook.Sheets[ttWorkbook.SheetNames[0]];
                        const ttData = XLSX.utils.sheet_to_json(ttWorksheet);

                        // Filter by regulation and degree
                        const consolidatedTargetReg = reg;
                        const filteredReg = regData.filter(row => {
                            const schemeVal = String(row.SCHEME_TYPE || row.scheme_type || '');
                            const consolidatedReg = schemeVal.replace(/^R-/i, '').replace(/A$/i, '');
                            if (consolidatedReg !== consolidatedTargetReg) return false;
                            
                            const rowDegree = String(row.DEGREE_TYPE || row.DEGREE || '').toUpperCase().trim().replace(/\./g, '');
                            return rowDegree === degree;
                        });

                        if (filteredReg.length === 0) continue;

                        hasAnyData = true;

                        // Build schedule map
                        const scheduleMap = new Map();
                        ttData.forEach(row => {
                            const code = String(row['SUBJECT CODE'] || '').trim().toUpperCase();
                            const branch = String(row['BRANCH'] || row['branch'] || '').trim().toUpperCase();
                            if (code) {
                                if (!scheduleMap.has(code)) scheduleMap.set(code, []);
                                scheduleMap.get(code).push({ branch, DATE: row['DATE'], SESSION: row['SESSION'] });
                            }
                        });

                        // Build unique subjects
                        const uniqueSubjectsMap = new Map();
                        filteredReg.forEach(row => {
                            const branchCode = String(row.BRANCH || '').trim();
                            const semester = row.SEMESTER;
                            const subjectCode = String(row['SUBJECT CODE'] || '').trim().toUpperCase();
                            if (!branchCode || !subjectCode) return;
                            
                            const key = `${branchCode}_${semester}_${subjectCode}`;
                            if (!uniqueSubjectsMap.has(key)) {
                                uniqueSubjectsMap.set(key, {
                                    BRANCH: branchCode,
                                    SEMESTER: semester,
                                    'SUBJECT CODE': subjectCode,
                                    'SUBJECT NAME': String(row['SUBJECT NAME'] || '').trim()
                                });
                            }
                        });

                        // Merge with schedule
                        const scheduledItems = [];
                        uniqueSubjectsMap.forEach(item => {
                            const schedules = scheduleMap.get(item['SUBJECT CODE']) || [];
                            let schedule = schedules.find(s => s.branch === item.BRANCH);
                            if (!schedule) schedule = schedules.find(s => s.branch === '-' || s.branch === '');
                            if (!schedule) schedule = schedules.find(s => s.branch === item.BRANCH.toUpperCase());
                            
                            if (schedule) {
                                scheduledItems.push({ ...item, DATE: schedule.DATE, SESSION: schedule.SESSION });
                            }
                        });

                        if (scheduledItems.length === 0) continue;

                        // Generate PDF
                        let dynamicDegreeText = degree === 'PG' ? 'ME/M. Tech. Degree' : degree === 'PHD' ? 'Ph.D. Degree' : 'BE/B. Tech. Degree';
                        const doc = new jsPDF('p', 'mm', 'a4');
                        const pageWidth = doc.internal.pageSize.getWidth();

                        // Add logo
                        let logoBase64 = null;
                        try {
                            const logoResp = await fetch('/SVCE_Logo.png');
                            if (logoResp.ok) {
                                const logoBlob = await logoResp.blob();
                                logoBase64 = await new Promise(resolve => {
                                    const r = new FileReader();
                                    r.onload = e => resolve(e.target.result);
                                    r.readAsDataURL(logoBlob);
                                });
                            }
                        } catch(e) {}

                        const addHeader = (doc) => {
                            if (logoBase64) {
                                try { doc.addImage(logoBase64, 'PNG', 10, 12, 25, 25); } catch(e) {}
                            }
                            doc.setFontSize(14);
                            doc.setFont('times', 'bold');
                            doc.text('SRI VENKATESWARA COLLEGE OF ENGINEERING', pageWidth / 2 + 8, 20, { align: 'center' });
                            doc.setFontSize(10);
                            doc.setFont('times', 'normal');
                            doc.text('(An Autonomous Institution, Affiliated to Anna University, Chennai)', pageWidth / 2 + 8, 25, { align: 'center' });
                            doc.setFontSize(12);
                            doc.setFont('times', 'bold');
                            doc.text(`Timetable - ${dynamicDegreeText} End Semester Examinations R${reg} - MAY 2025`, pageWidth / 2 + 8, 32, { align: 'center' });
                        };

                        // Group by branch
                        let branchGroups = {};
                        scheduledItems.forEach(row => {
                            const fullBranchName = BRANCH_MAPPING[row.BRANCH] || row.BRANCH || 'GENERAL CATEGORY';
                            if (!branchGroups[fullBranchName]) branchGroups[fullBranchName] = [];
                            branchGroups[fullBranchName].push(row);
                        });

                        const sortedBranchKeys = Object.keys(branchGroups).sort((a, b) => {
                            const posA = BRANCH_ORDER.findIndex(bName => bName.toUpperCase() === a.toUpperCase());
                            const posB = BRANCH_ORDER.findIndex(bName => bName.toUpperCase() === b.toUpperCase());
                            return (posA === -1 ? 999 : posA) - (posB === -1 ? 999 : posB);
                        });

                        let isFirstTable = true;
                        sortedBranchKeys.forEach(branchName => {
                            if (!isFirstTable) doc.addPage();
                            isFirstTable = false;
                            addHeader(doc);
                            
                            const branchItems = branchGroups[branchName];
                            const semGroups = {};
                            branchItems.forEach(item => {
                                const sem = item.SEMESTER;
                                if (!semGroups[sem]) semGroups[sem] = [];
                                semGroups[sem].push(item);
                            });
                            
                            const sortedSems = Object.keys(semGroups).sort((a, b) => b - a);
                            let currentY = 45;

                            sortedSems.forEach((sem, semIdx) => {
                                // Sort inside sem by Date
                                const semItems = semGroups[sem].sort((a, b) => {
                                    const dateA = formatExcelDate(a.DATE) || '';
                                    const dateB = formatExcelDate(b.DATE) || '';
                                    return dateA.localeCompare(dateB);
                                });

                                const tableBody = semItems.map(row => {
                                    let formattedDate = formatExcelDate(row.DATE);
                                    if (formattedDate && formattedDate.includes('-')) {
                                        const parts = formattedDate.split('-');
                                        if (parts.length === 3 && parts[0].length === 4) {
                                            formattedDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
                                        }
                                    }
                                    return [row['SUBJECT CODE'], row['SUBJECT NAME'], formattedDate, row.SESSION];
                                });

                                // Estimate table height (approx 8mm per row + header)
                                const estimatedTableHeight = tableBody.length * 8 + 15;
                                
                                // If table won't fit in remaining space, start new page
                                if (currentY + estimatedTableHeight > 270 && semIdx > 0) {
                                    doc.addPage();
                                    addHeader(doc);
                                    currentY = 45;
                                }

                                doc.setFontSize(11);
                                doc.setFont('times', 'bold');
                                doc.text(`Branch: ${branchName} - Semester ${sem}`, 14, currentY);

                                autoTable(doc, {
                                    head: [['SUBJECT CODE', 'SUBJECT NAME', 'DATE', 'SESSION']],
                                    body: tableBody,
                                    startY: currentY + 4,
                                    theme: 'grid',
                                    headStyles: { fillColor: [200, 200, 200], textColor: 0, halign: 'center', font: 'times', fontStyle: 'bold' },
                                    styles: { font: 'times', fontSize: 10, textColor: 0 },
                                    margin: { left: 14, right: 14 }
                                });

                                currentY = doc.lastAutoTable.finalY + 15;
                            });
                        });

                        // Add PDF to zip
                        const pdfBlob = doc.output('blob');
                        regFolder.file(`R-${reg}_${degree}.pdf`, pdfBlob);
                        
                    } catch (error) {
                        console.error(`Error generating PDF for R-${reg} ${degree}:`, error);
                    }
                }
            }

            if (!hasAnyData) {
                setDownloadProgress(null);
                alert('No exam data available to download.');
                return;
            }

            // Generate and download ZIP
            setDownloadProgress(50);
            const content = await zip.generateAsync({ type: 'blob' });
            setDownloadProgress(100);
            
            const link = document.createElement('a');
            link.href = URL.createObjectURL(content);
            link.download = `SVCE_TT_${monthYear}_ALL_REGULATIONS.zip`;
            link.click();
            
            setDownloadProgress(null);
        } catch (error) {
            console.error("ZIP Generation Error:", error);
            setDownloadProgress(null);
            alert("Failed to generate ZIP. Check console for details.");
        }
    };

    if (engineComplete) {
        return (
            <div className="min-h-screen pt-20 pb-20 bg-slate-50/20 selection:bg-emerald-500/10 overflow-hidden relative">
                <button 
                    onClick={() => { setEngineComplete(false); setEngineProgress(null); }}
                    className="absolute top-6 left-6 lg:left-12 p-3 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-brand-600 hover:border-brand-100 shadow-sm transition-all z-10"
                    title="Back"
                >
                    <ArrowLeft size={24} />
                </button>

                <button 
                    onClick={() => navigate('/')}
                    className="absolute top-6 right-6 lg:right-12 p-3 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-brand-600 hover:border-brand-100 shadow-sm transition-all z-10"
                    title="Go Home"
                >
                    <Home size={24} />
                </button>
                {/* DOWNLOAD ZIP - below the Home button, top-right */}
                <button
                    onClick={downloadAllPDFs}
                    disabled={downloadProgress !== null}
                    className="absolute top-20 right-6 lg:right-12 flex items-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-2xl font-black text-[10px] tracking-widest shadow-lg shadow-brand-500/30 transition-all active:scale-95 hover:-translate-y-0.5 z-10 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {downloadProgress !== null ? (
                        <Loader2 size={14} className="animate-spin" />
                    ) : (
                        <Archive size={14} />
                    )}
                    DOWNLOAD ZIP
                </button>

                <div className="max-w-[1400px] w-full mx-auto px-6 md:px-12 flex flex-col items-center justify-start">
                    
                    <div className="flex flex-col items-center gap-6 mb-12">
                        <motion.div 
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ type: "spring", stiffness: 200, damping: 20 }}
                            className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(16,185,129,0.3)] shrink-0"
                        >
                            <CheckCircle2 size={40} />
                        </motion.div>
                        <motion.h1
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.1 }}
                            className="text-4xl lg:text-5xl font-black tracking-tighter uppercase text-center"
                        >
                            <span className="text-emerald-500">FINAL</span> <span className="text-slate-900">RESULTS</span>
                        </motion.h1>
                    </div>

                    {/* SCHEME_TYPE Regulation Cards Tree */}
                    <div className="w-full flex flex-col gap-8 lg:gap-12 relative items-center">
                        {regulations.map((scheme, schemeIdx) => (
                            <div key={scheme} className="flex flex-col md:flex-row items-center md:items-stretch w-full">
                                
                                {/* Parent Regulation Card */}
                                <motion.div 
                                    initial={{ opacity: 0, x: -30 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.2 + (schemeIdx * 0.1) }}
                                    onClick={() => setExpandedRegulation(expandedRegulation === scheme ? null : scheme)}
                                    className={`p-6 md:p-8 rounded-[2rem] flex items-center justify-between cursor-pointer w-full md:w-[460px] group transition-all z-10 shrink-0 relative overflow-visible ${
                                        expandedRegulation === scheme 
                                        ? 'bg-white border-2 border-brand-500 shadow-[0_15px_40px_rgba(79,70,229,0.15)] ring-4 ring-brand-500/10' 
                                        : 'bg-white border-2 border-slate-200 hover:border-brand-300 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-brand-500/10'
                                    }`}
                                >
                                    <div className="flex items-center gap-6 relative z-10">
                                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-sm transition-colors duration-300 ${expandedRegulation === scheme ? 'bg-brand-50 text-brand-600 border border-brand-100' : 'bg-slate-50 border border-slate-100 text-slate-400'}`}>
                                            <FileText size={32} />
                                        </div>
                                        <div>
                                            <h4 className={`font-black text-lg tracking-tight whitespace-nowrap transition-colors duration-300 ${expandedRegulation === scheme ? 'text-brand-900' : 'text-slate-900'}`}>
                                                SEMESTER SCHEDULE (R-{scheme})
                                            </h4>
                                            <p className={`text-[11px] font-bold mt-1 uppercase tracking-[0.2em] whitespace-nowrap transition-colors duration-300 ${expandedRegulation === scheme ? 'text-brand-500' : 'text-slate-400'}`}>
                                                Click to {expandedRegulation === scheme ? 'hide' : 'view'} degrees
                                            </p>
                                        </div>
                                    </div>
                                    <ChevronRight className={`transition-transform duration-300 relative z-10 ${expandedRegulation === scheme ? 'rotate-90 text-brand-500' : 'text-slate-300'}`} size={28} />
                                </motion.div>

                                {/* Child Degree Cards Tree */}
                                <AnimatePresence>
                                    {expandedRegulation === scheme && (
                                        <motion.div 
                                            initial={{ opacity: 0, width: 0 }}
                                            animate={{ opacity: 1, width: 'auto' }}
                                            exit={{ opacity: 0, width: 0 }}
                                            className="flex flex-col md:flex-row items-center md:items-start mt-8 md:mt-0 relative w-full pt-4 md:pt-0 overflow-visible"
                                        >
                                            {/* SVG Tree Connector (Desktop) */}
                                            <div className="hidden md:block relative w-16 lg:w-28 h-[312px] shrink-0 -ml-4 z-0">
                                                <svg className="w-full h-full" viewBox="0 0 100 312" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
                                                    {/* Background paths */}
                                                    <path d="M 0 156 L 40 156 C 60 156, 60 44, 80 44 L 100 44" stroke="#e2e8f0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                    <path d="M 0 156 L 100 156" stroke="#e2e8f0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                    <path d="M 0 156 L 40 156 C 60 156, 60 268, 80 268 L 100 268" stroke="#e2e8f0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

                                                    {/* Animated Paths (Repeat exactly 3 times, sync together) */}
                                                    <motion.path 
                                                        d="M 0 156 L 40 156 C 60 156, 60 44, 80 44 L 100 44" 
                                                        stroke="#f59e0b" 
                                                        strokeWidth="4" 
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        initial={{ pathLength: 0, opacity: 1 }}
                                                        animate={{ pathLength: 1, opacity: [0, 1, 1, 0] }}
                                                        transition={{ duration: 3.5, repeat: 2, ease: "easeInOut", delay: 0 }}
                                                        className="drop-shadow-[0_0_15px_rgba(245,158,11,1)]"
                                                    />
                                                    <motion.path 
                                                        d="M 0 156 L 100 156" 
                                                        stroke="#f59e0b" 
                                                        strokeWidth="4" 
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        initial={{ pathLength: 0, opacity: 1 }}
                                                        animate={{ pathLength: 1, opacity: [0, 1, 1, 0] }}
                                                        transition={{ duration: 3.5, repeat: 2, ease: "easeInOut", delay: 0 }}
                                                        className="drop-shadow-[0_0_15px_rgba(245,158,11,1)]"
                                                    />
                                                    <motion.path 
                                                        d="M 0 156 L 40 156 C 60 156, 60 268, 80 268 L 100 268" 
                                                        stroke="#f59e0b" 
                                                        strokeWidth="4" 
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        initial={{ pathLength: 0, opacity: 1 }}
                                                        animate={{ pathLength: 1, opacity: [0, 1, 1, 0] }}
                                                        transition={{ duration: 3.5, repeat: 2, ease: "easeInOut", delay: 0 }}
                                                        className="drop-shadow-[0_0_15px_rgba(245,158,11,1)]"
                                                    />
                                                </svg>
                                            </div>

                                            {/* Degrees List */}
                                            <div className="flex flex-col justify-between gap-6 h-[312px] w-full">
                                                {['UG', 'PG', 'PHD'].map((degree, idx) => {
                                                    const isDegreeExpanded = expandedDegree === `${scheme}-${degree}`;
                                                    return (
                                                        <div key={degree} className="flex items-center w-full h-[88px] relative z-20 shrink-0 mt-0">
                                                            <motion.div 
                                                                initial={{ x: -20, opacity: 0 }}
                                                                animate={{ x: 0, opacity: 1 }}
                                                                transition={{ delay: idx * 0.15 }}
                                                                className={`p-5 md:p-6 bg-white border-2 hover:border-r-4 rounded-2xl flex items-center gap-5 cursor-pointer min-w-[280px] w-full md:w-auto group/btn transition-all duration-300 relative z-10 ${
                                                                    isDegreeExpanded ? 'border-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.4)] ring-4 ring-emerald-500/20' : 'border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:shadow-[0_0_30px_rgba(245,158,11,0.6)] hover:border-amber-500 hover:scale-[1.02]'
                                                                }`}
                                                                onClick={() => setExpandedDegree(isDegreeExpanded ? null : `${scheme}-${degree}`)}
                                                            >
                                                                <div className={`w-12 h-12 border rounded-xl flex items-center justify-center transition-colors shadow-inner ${isDegreeExpanded ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-500 border-amber-100'}`}>
                                                                    <GraduationCap size={24} />
                                                                </div>
                                                                <div className="flex-1">
                                                                    <h5 className="text-[16px] font-black tracking-wider whitespace-nowrap transition-colors duration-300 ${isDegreeExpanded ? 'text-emerald-900' : 'text-slate-900'}">{degree} SCHEDULE</h5>
                                                                    <p className={`text-[10px] font-bold uppercase tracking-widest mt-1 whitespace-nowrap transition-colors duration-300 ${isDegreeExpanded ? 'text-emerald-500' : 'text-amber-500'}`}>
                                                                        {isDegreeExpanded ? 'Options Revealed' : 'Click to View Actions'}
                                                                    </p>
                                                                </div>
                                                                <ChevronRight size={22} className={`transition-transform duration-300 ${isDegreeExpanded ? 'rotate-90 text-emerald-500' : 'text-amber-400 group-hover/btn:text-amber-600'}`} />
                                                            </motion.div>

                                                            {/* The Action Branch connected to this specific Degree */}
                                                            <AnimatePresence>
                                                                {isDegreeExpanded && (
                                                                    <motion.div 
                                                                        initial={{ opacity: 0, width: 0 }}
                                                                        animate={{ opacity: 1, width: 'auto' }}
                                                                        exit={{ opacity: 0, width: 0 }}
                                                                        className="absolute left-full top-1/2 -translate-y-1/2 flex items-center shrink-0 z-0"
                                                                    >
                                                                        {/* SVG Connector Degree -> Actions (Desktop) */}
                                                                        <div className="hidden md:block relative w-16 lg:w-28 h-[180px] shrink-0 -ml-4 z-0">
                                                                            <svg className="w-full h-full" viewBox="0 0 100 180" fill="none" preserveAspectRatio="none">
                                                                                <path d="M 0 90 L 40 90 C 60 90, 60 25, 80 25 L 100 25" stroke="#e2e8f0" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                                                                                <path d="M 0 90 L 40 90 C 60 90, 60 155, 80 155 L 100 155" stroke="#e2e8f0" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                                                                                
                                                                                <motion.path 
                                                                                    d="M 0 90 L 40 90 C 60 90, 60 25, 80 25 L 100 25" 
                                                                                    stroke="#10b981" 
                                                                                    strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"
                                                                                    initial={{ pathLength: 0, opacity: 1 }}
                                                                                    animate={{ pathLength: 1, opacity: [0, 1, 1, 0] }}
                                                                                    transition={{ duration: 3.5, repeat: 2, ease: "easeInOut", delay: 0 }}
                                                                                    className="drop-shadow-[0_0_12px_rgba(16,185,129,0.9)]"
                                                                                />
                                                                                <motion.path 
                                                                                    d="M 0 90 L 40 90 C 60 90, 60 155, 80 155 L 100 155" 
                                                                                    stroke="#10b981" 
                                                                                    strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"
                                                                                    initial={{ pathLength: 0, opacity: 1 }}
                                                                                    animate={{ pathLength: 1, opacity: [0, 1, 1, 0] }}
                                                                                    transition={{ duration: 3.5, repeat: 2, ease: "easeInOut", delay: 0 }}
                                                                                    className="drop-shadow-[0_0_12px_rgba(16,185,129,0.9)]"
                                                                                />
                                                                            </svg>
                                                                        </div>

                                                                        {/* Action Cards (Desktop) */}
                                                                        <div className="hidden md:flex flex-col justify-between h-[180px] py-[10px] shrink-0 w-[180px] relative z-10 pl-2 md:pl-0">
                                                                            {/* PREVIEW */}
                                                                            <motion.div 
                                                                                initial={{ x: -20, opacity: 0 }}
                                                                                animate={{ x: 0, opacity: 1 }}
                                                                                transition={{ delay: 0.1 }}
                                                                                onClick={(e) => { e.stopPropagation(); generatePDF(scheme, degree, true); }}
                                                                                className="h-[74px] bg-white border-dashed border-[3px] border-blue-400/80 hover:border-blue-500 shadow-[0_0_25px_rgba(59,130,246,0.3)] hover:shadow-[0_0_40px_rgba(59,130,246,0.6)] rounded-2xl flex items-center px-4 gap-4 cursor-pointer group/action transition-all"
                                                                            >
                                                                                <div className="w-10 h-10 rounded-[10px] bg-blue-50/50 text-blue-500 flex items-center justify-center group-hover/action:bg-blue-500 group-hover/action:text-white transition-colors border border-blue-100 shadow-sm shrink-0">
                                                                                    <Eye size={20} />
                                                                                </div>
                                                                                <span className="text-[13px] font-black tracking-widest text-slate-700 group-hover/action:text-blue-600">PREVIEW</span>
                                                                            </motion.div>
                                                                            
                                                                            {/* DOWNLOAD */}
                                                                            <motion.div 
                                                                                initial={{ x: -20, opacity: 0 }}
                                                                                animate={{ x: 0, opacity: 1 }}
                                                                                transition={{ delay: 0.2 }}
                                                                                onClick={(e) => { e.stopPropagation(); generatePDF(scheme, degree); }}
                                                                                className="h-[74px] bg-white border-dashed border-[3px] border-emerald-400/80 hover:border-emerald-500 shadow-[0_0_25px_rgba(16,185,129,0.3)] hover:shadow-[0_0_40px_rgba(16,185,129,0.6)] rounded-2xl flex items-center px-4 gap-4 cursor-pointer group/action transition-all"
                                                                            >
                                                                                <div className="w-10 h-10 rounded-[10px] bg-emerald-50/50 text-emerald-500 flex items-center justify-center group-hover/action:bg-emerald-500 group-hover/action:text-white transition-colors border border-emerald-100 shadow-sm shrink-0">
                                                                                    <Download size={20} />
                                                                                </div>
                                                                                <span className="text-[13px] font-black tracking-widest text-slate-700 group-hover/action:text-emerald-600">DOWNLOAD</span>
                                                                            </motion.div>
                                                                        </div>
                                                                    </motion.div>
                                                                )}
                                                            </AnimatePresence>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ))}
                    </div>

                    <div className="w-full flex justify-center mt-20">
                        <motion.button
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            onClick={() => navigate('/details')}
                            className="btn-primary group !px-24 !py-6 !rounded-[2.5rem] text-xl flex items-center gap-4 shadow-2xl shadow-brand-500/20 hover:-translate-y-1 transition-all font-black tracking-widest relative z-20"
                        >
                            MORE DETAILS <ChevronRight size={28} strokeWidth={3} className="group-hover:translate-x-2 transition-transform" />
                        </motion.button>
                    </div>
                </div>
            </div>
        );
    }

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
        <div className="container max-w-6xl mx-auto px-6 py-2 lg:py-4 relative">
            <header className="mb-6 mt-4">
                <button 
                    onClick={() => navigate('/generator-1')}
                    className="absolute top-2 -left-2 lg:-left-12 p-3 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-brand-600 hover:border-brand-100 shadow-sm transition-all z-10"
                    title="Back to Step 1"
                >
                    <ArrowLeft size={24} />
                </button>
                <button 
                    onClick={() => navigate('/')}
                    className="absolute top-2 -right-2 lg:-right-12 p-3 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-brand-600 hover:border-brand-100 shadow-sm transition-all z-10"
                    title="Go Home"
                >
                    <Home size={24} />
                </button>
                <div className="text-center flex flex-col items-center">
                    <h1 className="text-4xl lg:text-6xl font-black tracking-tighter text-slate-900 mb-2">
                        Refine <span className="text-brand-600">Schedule</span>
                    </h1>
                    <p className="text-slate-500 font-bold tracking-widest uppercase text-xs mb-8">Step 2: Priorities & Details</p>

                    {/* Side-by-Side Flex Container */}
                    <div className="flex flex-col md:flex-row items-center md:items-start justify-center gap-6 lg:gap-8 mt-12 w-full max-w-5xl mx-auto px-4">
                        
                        {/* LEFT: Sem 1 Start Date Wrapper (if ODD) */}
                        <div className={`flex-1 w-full ${semesterType !== 'ODD' ? 'hidden' : ''}`}>
                            {semesterType === 'ODD' && (
                                <motion.div 
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="p-6 border-l-4 border-brand-600 rounded-2xl bg-white shadow-xl shadow-brand-500/5 flex flex-col xl:flex-row items-center justify-between gap-6 w-full"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 flex-shrink-0 bg-brand-50 text-brand-600 rounded-xl flex items-center justify-center">
                                            <Calendar size={24} />
                                        </div>
                                        <div className="text-left">
                                            <h3 className="font-black text-slate-900 text-sm uppercase tracking-widest whitespace-nowrap">Sem 1 Start</h3>
                                            <p className="text-slate-400 text-[10px] font-bold tracking-wider">FIRST YEAR</p>
                                        </div>
                                    </div>
                                    <input 
                                        type="date"
                                        value={sem1Date}
                                        onChange={(e) => setSem1Date(e.target.value)}
                                        className="input-field !py-2 !px-4 h-11 border-2 border-brand-100 focus:border-brand-500 font-bold text-sm w-full xl:w-auto"
                                    />
                                </motion.div>
                            )}
                        </div>

                        {/* RIGHT: Priority Semester Side-by-Side View */}
                        <div className="flex-1 w-full flex flex-col xl:flex-row gap-6 items-start relative justify-start">
                            <motion.button 
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                onClick={() => setShowRegulations(!showRegulations)}
                                className={`p-6 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-2xl shadow-xl shadow-emerald-500/20 flex items-center justify-between gap-6 w-full xl:w-auto min-w-[320px] cursor-pointer hover:from-emerald-400 hover:to-emerald-500 hover:shadow-2xl hover:shadow-emerald-500/30 transition-all select-none group active:scale-[0.98] ${showRegulations ? 'flex-shrink-0' : ''}`}
                            >
                                <div className="flex items-center gap-4 w-full">
                                    <div className="w-12 h-12 bg-white/20 rounded-xl text-white flex items-center justify-center group-hover:bg-white/30 transition-colors flex-shrink-0">
                                        <ListFilter size={24} />
                                    </div>
                                    <div className="text-left flex flex-col pr-4 flex-1">
                                        <span className="font-black text-white text-sm uppercase tracking-widest leading-tight drop-shadow-sm mb-1">Priority Config</span>
                                        <span className="text-emerald-100 text-[10px] font-bold uppercase tracking-widest drop-shadow-sm">{prioritySchemes.length} SELECTIONS</span>
                                    </div>
                                    <div className={`w-8 h-8 flex items-center justify-center bg-white/10 rounded-full text-white transition-all duration-300 flex-shrink-0 ${showRegulations ? 'rotate-90 bg-white/20' : 'group-hover:bg-white/20'}`}>
                                        <ChevronRight size={20} />
                                    </div>
                                </div>
                            </motion.button>

                            {/* Side Panel Options List (YES/NO only) */}
                            <AnimatePresence>
                                {showRegulations && (
                                    <motion.div
                                        initial={{ opacity: 0, x: -10, width: 0 }}
                                        animate={{ opacity: 1, x: 0, width: '100%' }}
                                        exit={{ opacity: 0, x: -10, width: 0 }}
                                        className="overflow-hidden flex-1 min-w-[280px]"
                                    >
                                        <div className="bg-white border border-slate-100 shadow-xl p-3 max-h-[280px] overflow-y-auto overflow-x-hidden rounded-xl w-full">
                                            <div className="space-y-2">
                                                {regulations.map((scheme, index) => {
                                                    const isPriority = prioritySchemes.includes(scheme);
                                                    return (
                                                        <div
                                                            key={scheme}
                                                            className={`p-3 rounded-xl border flex items-center gap-3 justify-between transition-all ${
                                                                isPriority 
                                                                ? 'bg-emerald-50/20 border-emerald-200' 
                                                                : 'bg-rose-50/20 border-rose-200'
                                                            }`}
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-7 h-7 flex-shrink-0 bg-white shadow-sm border border-slate-100 rounded-lg flex items-center justify-center text-xs font-black text-slate-400">
                                                                    {index + 1}
                                                                </div>
                                                                <span className="font-bold text-slate-900 text-sm whitespace-nowrap">Reg- {scheme}</span>
                                                            </div>
                                                            <button 
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handlePriorityToggle(scheme);
                                                                }}
                                                                className={`px-4 py-1.5 rounded-lg font-black text-[10px] tracking-widest transition-all whitespace-nowrap ${
                                                                    isPriority 
                                                                    ? 'bg-emerald-500 text-white shadow-md shadow-emerald-200/50 hover:bg-emerald-600' 
                                                                    : 'bg-rose-500 text-white shadow-md shadow-rose-200/50 hover:bg-rose-600'
                                                                }`}
                                                            >
                                                                {isPriority ? 'YES' : 'NO'}
                                                            </button>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* Subject Classification Table */}
                    <div className="mt-16 w-full max-w-[1400px] mx-auto px-4 lg:px-0 relative mb-20 z-10">
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
                            <h2 className="text-2xl font-black text-slate-900 uppercase">Subject Classification Table</h2>
                            <div className="flex gap-4">
                                <input
                                    type="text"
                                    placeholder="Search by Code or Name..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="px-4 py-2 text-sm border-2 border-slate-200 rounded-xl focus:border-brand-500 focus:outline-none w-64 uppercase"
                                />
                                <div className="flex items-center gap-4 bg-white px-4 py-2 border border-slate-100 shadow-sm rounded-xl">
                                    <span className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-black text-slate-500">
                                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span> ANALYTICAL
                                    </span>
                                    <span className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-black text-slate-500">
                                        <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]"></span> NON_ANALYTICAL
                                    </span>
                                </div>
                            </div>
                        </div>
                        
                        <div className="bg-white rounded-[2rem] shadow-xl shadow-brand-500/5 border-2 border-brand-200 overflow-hidden">
                            <div className="overflow-x-auto max-h-[500px] overflow-y-auto w-full">
                                <table className="w-full text-sm text-left">
                                    <thead className="text-[10px] tracking-widest text-slate-400 uppercase bg-slate-50/80 sticky top-0 z-10 font-black border-b border-slate-100 backdrop-blur-sm">
                                        <tr>
                                            <th className="px-6 py-5 whitespace-nowrap">S.No.</th>
                                            <th className="px-6 py-5 whitespace-nowrap">Subject Code</th>
                                            <th className="px-6 py-5 whitespace-nowrap min-w-[280px]">Subject Name</th>
                                            <th className="px-6 py-5 whitespace-nowrap text-center">Semester</th>
                                            <th className="px-6 py-5 whitespace-nowrap text-center">Branch</th>
                                            <th className="px-6 py-5 whitespace-nowrap text-center">Category (tap to toggle)</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50 font-bold text-slate-700">
                                        {subjectsData.filter(sub => 
                                            sub.code.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                            sub.name.toLowerCase().includes(searchQuery.toLowerCase())
                                        ).map((sub) => (
                                            <tr key={sub.code} className="hover:bg-brand-50/30 transition-colors group">
                                                <td className="px-6 py-4 text-slate-400">{sub.sNo}</td>
                                                <td className="px-6 py-4 font-black text-slate-900">{sub.code}</td>
                                                <td className="px-6 py-4 truncate max-w-[280px]" title={sub.name}>{sub.name}</td>
                                                <td className="px-6 py-4 text-center">{sub.semester}</td>
                                                <td className="px-6 py-4 text-center">{sub.branch}</td>
                                                <td className="px-6 py-4 text-center">
                                                    <button
                                                        onClick={() => toggleSubjectCategory(sub.code)}
                                                        title="Click to toggle category"
                                                        className={`inline-flex items-center px-4 py-1.5 rounded-xl text-[10px] font-black tracking-widest transition-all cursor-pointer active:scale-95 hover:opacity-80 ${
                                                            sub.category === 'ANALYTICAL' 
                                                            ? 'bg-emerald-50 text-emerald-600 border border-emerald-200/50 shadow-[0_4px_10px_rgba(16,185,129,0.1)] hover:bg-emerald-100' 
                                                            : 'bg-rose-50 text-rose-600 border border-rose-200/50 shadow-[0_4px_10px_rgba(244,63,94,0.1)] hover:bg-rose-100'
                                                        }`}
                                                    >
                                                        {sub.category === 'ANALYTICAL' ? '[A] ANALYTICAL' : '[N] NON_ANALYTICAL'}
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-center mt-8">
                        <button
                            onClick={() => setIsConfirmed(true)}
                            disabled={isConfirmed}
                            className={`px-12 py-4 rounded-2xl font-black text-sm tracking-widest transition-all ${
                                isConfirmed 
                                ? 'bg-emerald-500 text-white shadow-[0_0_25px_rgba(16,185,129,0.5)] cursor-not-allowed' 
                                : 'bg-amber-400 text-amber-900 shadow-[0_0_25px_rgba(251,191,36,0.5)] hover:bg-amber-500 hover:-translate-y-1'
                            }`}
                        >
                            {isConfirmed ? 'CONFIRMED' : 'CONFIRM CLASSIFICATION'}
                        </button>
                    </div>
                </div>
            </header>

            <footer className="flex flex-col items-center gap-8 mt-12 mb-20 relative z-10">
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
                    onClick={startEngine}
                    disabled={!isConfirmed || engineProgress !== null}
                    className={`group !px-16 !py-6 !rounded-[2rem] text-lg lg:text-xl flex items-center gap-4 transition-all font-black uppercase tracking-widest ${
                        (!isConfirmed || engineProgress !== null) 
                        ? 'bg-slate-200 text-slate-400 cursor-not-allowed hidden' 
                        : 'bg-brand-600 hover:bg-brand-700 text-white shadow-2xl shadow-brand-500/30 hover:-translate-y-1'
                    }`}
                >
                    START SCHEDULER ENGINE <ChevronRight size={28} strokeWidth={3} className="group-hover:translate-x-2 transition-transform" />
                </button>
            </footer>

            <AnimatePresence>
                {engineProgress !== null && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="w-full max-w-xl bg-white rounded-[3rem] p-10 md:p-14 shadow-2xl relative overflow-hidden"
                        >
                            {/* Decorative Background Elements */}
                            <div className={`absolute top-0 left-0 w-full h-full opacity-[0.03] transition-colors duration-500 pointer-events-none ${getProgressStatus(engineProgress).bg}`} />
                            
                            <div className="flex flex-col items-center justify-center text-center relative z-10">
                                <div className="relative mb-10 flex flex-col items-center justify-center">
                                    {/* Spinner Circle with Percentage inside */}
                                    <div className={`w-40 h-40 md:w-48 md:h-48 rounded-full flex items-center justify-center bg-slate-50 border-8 ${getProgressStatus(engineProgress).border} shadow-[inset_0_4px_20px_rgba(0,0,0,0.02)] relative overflow-hidden`}>
                                        <Loader2 className={`absolute animate-spin w-full h-full opacity-10 ${getProgressStatus(engineProgress).color}`} />
                                        <span className={`text-5xl md:text-6xl font-black tracking-tighter relative z-10 ${getProgressStatus(engineProgress).color}`}>
                                            {engineProgress}%
                                        </span>
                                    </div>
                                </div>

                                <h3 className="text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-[0.3em] mb-4 mt-4">
                                    SVCE Scheduler Engine
                                </h3>
                                
                                <h2 className={`text-3xl md:text-4xl font-black tracking-tight transition-colors duration-500 ${getProgressStatus(engineProgress).color}`}>
                                    {getProgressStatus(engineProgress).text}
                                </h2>

                                {/* Progress Bar */}
                                <div className="w-full h-3 md:h-4 bg-slate-100 rounded-full mt-12 overflow-hidden shadow-inner p-1">
                                    <motion.div 
                                        initial={{ width: 0 }}
                                        animate={{ width: `${engineProgress}%` }}
                                        className={`h-full rounded-full transition-all duration-300 ${getProgressStatus(engineProgress).bg}`}
                                    />
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default GeneratorStep2;
