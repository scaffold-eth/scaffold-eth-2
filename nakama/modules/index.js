"use strict";
var LEADERBOARD_ID = "radar";
function createLeaderboard(nk, id) {
    // let id = '4ec4f126-3f9d-11e7-84ef-b7c182b36521';
    var authoritative = false;
    var sort = "descending" /* nkruntime.SortOrder.DESCENDING */;
    var operator = "best" /* nkruntime.Operator.BEST */;
    var reset = '*/1 * * * *'; // Every minute
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
var leaderboardReset = function (ctx, logger, nk, leaderboard, reset) {
    if (leaderboard.id != LEADERBOARD_ID) {
        return;
    }
    // Get top 3
    var result = nk.leaderboardRecordsList(leaderboard.id, [], 3, undefined, reset);
    var walletUpdates = [];
    if (result && result.records) {
        result.records.forEach(function (r) {
            var reward = 100;
            walletUpdates.push({
                userId: r.ownerId,
                changeset: { coins: reward },
                metadata: {}
            });
        });
    }
    nk.walletsUpdate(walletUpdates, true);
};
function InitModule(ctx, logger, nk, initializer) {
    createLeaderboard(nk, LEADERBOARD_ID);
    initializer.registerRpc("healthcheck", rpcHealthcheck);
    initializer.registerRpc("createTournament", rpcCreateTournament);
    initializer.registerLeaderboardReset(leaderboardReset);
    logger.info("JavaScript module loaded");
}
function rpcHealthcheck(ctx, logger, nk, payload) {
    logger.info("Healthcheck request received");
    return JSON.stringify({ success: true });
}
