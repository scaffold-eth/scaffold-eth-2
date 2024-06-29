export type IReport = {
    hateSpeech: string,
    ignReporter: string,
    ignOffender: string,
    walletAddress: string,
    gameName: string,
    status: string,
    protectedCharacteristics : Record<string,number> | null
}