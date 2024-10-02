function InitModule(ctx: nkruntime.Context, logger: nkruntime.Logger, nk:nkruntime.Nakama, initializer: nkruntime.Initializer) {
    initializer.registerRpc("healthcheck", rpcHealthcheck);
    logger.info("JavaScript module loaded");
}