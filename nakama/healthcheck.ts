function rpcHealthcheck(ctx: nkruntime.Context, logger: nkruntime.Logger, nk: nkruntime.Nakama, payload: string): string {
    logger.info("Healthcheck request received");
    return JSON.stringify({ success: true });
}