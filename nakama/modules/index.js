"use strict";
function InitModule(ctx, logger, nk, initializer) {
    initializer.registerRpc("healthcheck", rpcHealthcheck);
    logger.info("JavaScript module loaded");
}
function rpcHealthcheck(ctx, logger, nk, payload) {
    logger.info("Healthcheck request received");
    return JSON.stringify({ success: true });
}
