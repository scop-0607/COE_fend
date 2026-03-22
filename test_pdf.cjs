const fs = require('fs');
const XLSX = require('xlsx');
const jsPDF = require('jspdf').jsPDF;
const autoTable = require('jspdf-autotable').default;

const formatExcelDate = (excelDate) => {
    if (!excelDate) return '';
    if (typeof excelDate === 'string' && excelDate.includes('-')) return excelDate;
    const date = new Date((excelDate - 25569) * 86400 * 1000);
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
};

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

async function run() {
    console.log("Reading data...");
    const regWb = XLSX.readFile('docs/Base File for MAY 2025 240425 (2).xlsx');
    const regData = XLSX.utils.sheet_to_json(regWb.Sheets[regWb.SheetNames[0]]);

    const ttWb = XLSX.readFile('public/essential_tt.xlsx');
    const ttData = XLSX.utils.sheet_to_json(ttWb.Sheets[ttWb.SheetNames[0]]);

    const scheduleMap = new Map();
    ttData.forEach(row => {
        const code = String(row['SUBJECT CODE'] || '').trim().toUpperCase();
        if (code) {
            scheduleMap.set(code, { DATE: row['DATE'], SESSION: row['SESSION'] });
        }
    });

    const targetReg = '22';
    const degreeLevel = 'PG';

    const filteredReg = regData.filter(row => {
        const reg = String(row.SCHEME_TYPE || row.scheme_type || '');
        const consolidatedReg = (reg === '18' || reg === '18A' || reg === 'R-18' || reg === 'R-18A') ? '18' : reg.replace('R-', '');
        if (consolidatedReg !== targetReg) return false;

        const rowDegree = String(row.DEGREE_TYPE || row.DEGREE || '').toUpperCase().trim();
        if (degreeLevel !== 'ALL' && rowDegree !== degreeLevel) return false;

        return true;
    });

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

    const scheduledItems = [];
    uniqueSubjectsMap.forEach((item) => {
        const schedule = scheduleMap.get(item['SUBJECT CODE']);
        if (schedule) {
            scheduledItems.push({
                ...item,
                DATE: schedule.DATE,
                SESSION: schedule.SESSION
            });
        }
    });

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

    console.log(`Found ${sortedBranchKeys.length} branches. Generating PDF...`);

    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const monthYear = 'MAY 2025';
    let dynamicDegreeText = 'BE/B. Tech. Degree';

    const addHeader = (doc) => {
        doc.setFontSize(14);
        doc.setFont('times', 'bold');
        doc.text('SRI VENKATESWARA COLLEGE OF ENGINEERING', pageWidth / 2, 20, { align: 'center' });
        doc.setFontSize(12);
        doc.text(`Time Table - ${dynamicDegreeText} End Semester Examinations R${targetReg} - ${monthYear}`, pageWidth / 2, 32, { align: 'center' });
    };

    let isFirstTable = true;
    
    sortedBranchKeys.forEach((branchName, idx) => {
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
            doc.setFontSize(11);
            doc.setFont('times', 'bold');
            doc.text(`Branch: ${branchName} - Semester ${sem}`, 14, currentY);

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
                return [
                    row['SUBJECT CODE'],
                    row['SUBJECT NAME'],
                    formattedDate,
                    row.SESSION
                ];
            });

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
            
            if (currentY > 260 && semIdx < sortedSems.length - 1) {
                doc.addPage();
                addHeader(doc);
                currentY = 45;
            }
        });
    });

    console.log(`Generated ${doc.getNumberOfPages()} pages.`);
    fs.writeFileSync('output_test.pdf', doc.output());
    console.log("Saved.");
}

run().catch(console.error);
