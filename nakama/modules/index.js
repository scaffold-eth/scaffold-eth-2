"use strict";
function createLeaderboard(nk, id) {
    // let id = '4ec4f126-3f9d-11e7-84ef-b7c182b36521';
    var authoritative = false;
    var sort = "descending" /* nkruntime.SortOrder.DESCENDING */;
    var operator = "best" /* nkruntime.Operator.BEST */;
    var reset = '0 0 * * 1';
    var metadata = {
        weatherConditions: 'rain',
    };
    try {
        nk.leaderboardCreate(id, authoritative, sort, operator, reset, metadata);
    }
    catch (error) {
        // Handle error
    }
}
function rpcCreateTournament(ctx, logger, nk, id) {
    createLeaderboard(nk, id);
    logger.info("leaderboard " + id + " created");
    return JSON.stringify({ success: true });
}
function InitModule(ctx, logger, nk, initializer) {
    createLeaderboard(nk, "4ec4f126-3f9d-11e7-84ef-b7c182b36521");
    initializer.registerRpc("healthcheck", rpcHealthcheck);
    initializer.registerRpc("createTournament", rpcCreateTournament);
    logger.info("JavaScript module loaded");
}
function rpcHealthcheck(ctx, logger, nk, payload) {
    logger.info("Healthcheck request received");
    return JSON.stringify({ success: true });
}
