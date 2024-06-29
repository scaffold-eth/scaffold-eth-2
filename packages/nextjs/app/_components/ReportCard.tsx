import { Dispatch, SetStateAction } from "react";
import { IReport } from "~~/app/_types"

type CardProps = Partial<{
    setReport: (report: IReport) => void;
    isProposal: boolean;
}> & IReport


export const ReportCard = (props: CardProps) => {
    const { gameName, hateSpeech, ignOffender, ignReporter } = props
    const { setReport = console.log, isProposal = false, ...rest } = props
    return (
        <div onClick={() => setReport(rest)} className="card bg-primary text-primary-content w-96">
            <div className="card-body">
                <div className="card-title flex flex-col">
                    <h2 className="flex flex-row justify-between w-full">
                        <span>{gameName}</span>
                        <span className="badge badge-success">Classfied</span>
                    </h2>
                    <div className="divider w-full"></div>
                </div>
                <div className="flex flex-row justify-between">
                    <div className="flex flex-col">
                        <h3>Reporter</h3>
                        <span>{ignReporter}</span>
                    </div>
                    <div className="flex flex-col">
                        <h3>Offender</h3>
                        <span>{ignOffender}</span>
                    </div>
                </div>
                <p>{hateSpeech}</p>
                {
                    isProposal && (
                        <div className="card-actions flex flex-row justify-around">
                            <button className="btn">I agree!</button>
                            <button className="btn">I disagree!</button>
                        </div>
                    )
                }
            </div>
        </div>
    )
}