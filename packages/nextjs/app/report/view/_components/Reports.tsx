'use client';

import { ReportCard } from '~~/app/_components';
import { metadata } from '~~/app/_metadata/metadata.ts'
import { IReport } from '~~/app/_types/index.ts';

type Props = {
    tab: number;
    setReport: (report: IReport) => void;
}

export const Reports = ({ tab, setReport }: Props) => {

    return (
        <div className="grid grid-cols-4 md:grid-cols-3 xs:gird-cols-2 gap-10 mb-20 mr-20 mt-20 ml-20 grid-rows-2">
            {
                tab === 1 && metadata.reports.map((report, index) => (
                    <ReportCard {...report} setReport={setReport} />
                ))
            }
            {
                tab === 2 && metadata.reports.filter(report => report.ignReporter === "foo-player").map((report, index) => (
                    <ReportCard {...report} setReport={setReport}/>
                ))
            }
            {
                tab === 3 && metadata.reports.filter(report => report.ignOffender === "foo-player").map((report, index) => (
                    <ReportCard {...report} setReport={setReport}/>
                ))
            }
        </div>
    )
}