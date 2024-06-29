import { IReport } from "~~/app/_types"


export const ReportModal = (props: Partial<IReport> | null) => {
    return (
        <dialog id="my_modal_4" className="modal">
            <div className="modal-box w-11/12 max-w-5xl">
                <h3 className="font-bold text-lg">{props?.gameName}</h3>
                <div className="divider"></div>
                <p className="py-4">{"Reporter : " + props?.ignReporter}</p>
                <p className="py-4">{"Offender : " + props?.ignOffender}</p>
                <p className="py-4">{props?.hateSpeech}</p>
                {
                    Object.keys(props?.protectedCharacteristics || {}).length !== 0 && props?.protectedCharacteristics && (
                        <div className="w-1/3">
                            <table className="table">
                                {/* head */}
                                <thead>
                                    <tr>
                                        <th></th>
                                        <th>Protected Characteristic</th>
                                        <th>Lived Experience Points</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {
                                        Object.keys(props?.protectedCharacteristics || {})?.map((pc, index) => {
                                            return(
                                                <tr key={pc+index}>
                                                    <th>{index+1}</th>
                                                    <td>{pc}</td>
                                                    <td>{props?.protectedCharacteristics && props.protectedCharacteristics[pc]}</td>
                                                </tr>
                                            )
                                        })
                                    }
                                </tbody>
                            </table>
                        </div>
                    )
                }
                <div className="modal-action">
                    {
                        Object.keys(props?.protectedCharacteristics || {}).length === 0 && !props?.protectedCharacteristics && (
                            <button className="btn">Put it up for a Vote!</button>
                        )
                    }
                    <form method="dialog">
                        <button className="btn">Close</button>
                    </form>
                </div>
            </div>
        </dialog>
    )
}