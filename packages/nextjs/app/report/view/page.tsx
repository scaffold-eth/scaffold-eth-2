'use client';

import { useState } from 'react';
import { Reports } from './_components';
import { ReportModal } from './_components/ReportModal.tsx';
import { IReport } from '~~/app/_types/index.ts';


const MyReports = () => {

    const [tab, setTab] = useState(2)
    const [report, setReport] = useState<IReport | null>(null)

    const handleReportClick = (report : IReport) => {
        setReport(report);
        {/* @ts-ignore */}
        document?.getElementById('my_modal_4')?.showModal()
    }

    return (
        <div>
            <div role="tablist" className="tabs tabs-boxed w-96 mt-10">
                <div role="tab" onClick={() => setTab(1)} className={`tab ${tab==1 ? "tab-active" : ""}`}>All Reports</div>
                <div role="tab" onClick={() => setTab(2)} className={`tab ${tab==2 ? "tab-active" : ""}`}>My Reports</div>
                <div role="tab" onClick={() => setTab(3)} className={`tab ${tab==3 ? "tab-active" : ""}`}>My Offenses</div>
            </div>
            <Reports tab={tab} setReport={handleReportClick}/>
            
            {/* <button className="btn" onClick={()=>document?.getElementById('my_modal_4')?.showModal()}>open modal</button> */}
            <ReportModal {...report}/>
        </div>
    )
}

export default MyReports;