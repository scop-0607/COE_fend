import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';
import HomePage from './pages/HomePage';
import Dashboard from './pages/Dashboard';
import GeneratorStep2 from './pages/GeneratorStep2';
import MoreDetails from './pages/MoreDetails';
import ValidatorPage from './pages/ValidatorPage';

function App() {
    // Persistent state using localStorage
    const [startDate, setStartDate] = useState(() => localStorage.getItem('startDate') || '');
    const [file, setFile] = useState(null); // File objects cannot be easily serialized to localStorage
    const [semesterType, setSemesterType] = useState(() => localStorage.getItem('semesterType') || 'ODD');
    const [excludedDays, setExcludedDays] = useState(() => {
        const saved = localStorage.getItem('excludedDays');
        return saved ? JSON.parse(saved) : [];
    });
    const [isExclusionConfirmed, setIsExclusionConfirmed] = useState(() => localStorage.getItem('isExclusionConfirmed') === 'true');
    
    // Step 2 State
    const [sem1Date, setSem1Date] = useState(() => localStorage.getItem('sem1Date') || '');
    const [prioritySchemes, setPrioritySchemes] = useState(() => {
        const saved = localStorage.getItem('prioritySchemes');
        return saved ? JSON.parse(saved) : [];
    });

    // Save state changes to localStorage
    useEffect(() => {
        localStorage.setItem('startDate', startDate);
        localStorage.setItem('semesterType', semesterType);
        localStorage.setItem('excludedDays', JSON.stringify(excludedDays));
        localStorage.setItem('isExclusionConfirmed', isExclusionConfirmed);
        localStorage.setItem('sem1Date', sem1Date);
        localStorage.setItem('prioritySchemes', JSON.stringify(prioritySchemes));
    }, [startDate, semesterType, excludedDays, isExclusionConfirmed, sem1Date, prioritySchemes]);

    return (
        <Router>
            <div className="min-h-screen bg-white text-slate-800 selection:bg-brand-500/10">
                {/* Global Background Elements */}
                <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10 bg-white">
                    <div className="absolute top-[10%] left-[10%] w-[40%] h-[40%] bg-brand-50/50 blur-[120px] rounded-full" />
                    <div className="absolute bottom-[20%] right-[10%] w-[40%] h-[40%] bg-brand-50/30 blur-[120px] rounded-full" />
                </div>

                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route
                        path="/generator-1"
                        element={
                            <Dashboard
                                startDate={startDate} setStartDate={setStartDate}
                                file={file} setFile={setFile}
                                semesterType={semesterType} setSemesterType={setSemesterType}
                                excludedDays={excludedDays} setExcludedDays={setExcludedDays}
                                isExclusionConfirmed={isExclusionConfirmed} setIsExclusionConfirmed={setIsExclusionConfirmed}
                            />
                        }
                    />
                    <Route 
                        path="/generator-2" 
                        element={
                            <GeneratorStep2 
                                file={file}
                                semesterType={semesterType}
                                sem1Date={sem1Date} setSem1Date={setSem1Date}
                                prioritySchemes={prioritySchemes} setPrioritySchemes={setPrioritySchemes}
                            />
                        } 
                    />
                    <Route path="/validator" element={<ValidatorPage />} />
                    <Route path="/details" element={<MoreDetails file={file} />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;
