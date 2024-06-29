'use client';

import { ReportCard } from '~~/app/_components';
import { metadata } from '~~/app/_metadata/metadata.ts'
import { IReport } from '~~/app/_types/index.ts';


export const Proposals = () => {

    return (
        <div className="grid grid-cols-4 md:grid-cols-3 xs:gird-cols-2 gap-10 mb-20 mr-20 mt-20 ml-20 grid-rows-2">
            {
                metadata.reports.filter((report) => report.isProposal).map((report, index) => (
                    <ReportCard {...report} isProposal={true}/>
                ))
            }
        </div>
    )
}