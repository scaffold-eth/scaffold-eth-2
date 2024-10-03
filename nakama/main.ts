function createLeaderboard(nk: nkruntime.Nakama, id: string) {
    // let id = '4ec4f126-3f9d-11e7-84ef-b7c182b36521';
    let authoritative = false;
    let sort = nkruntime.SortOrder.DESCENDING;
    let operator = nkruntime.Operator.BEST;
    let reset = '0 0 * * 1';
    let metadata = {
      weatherConditions: 'rain',
    };
    try {
        nk.leaderboardCreate(id, authoritative, sort, operator, reset, metadata);
    } catch(error) {
        // Handle error
    }
}

function rpcCreateTournament(ctx: nkruntime.Context, logger: nkruntime.Logger, nk: nkruntime.Nakama, id: string): string {
    createLeaderboard(nk, id);    

    logger.info("leaderboard " + id + " created");
    return JSON.stringify({ success: true });

}

function InitModule(ctx: nkruntime.Context, logger: nkruntime.Logger, nk:nkruntime.Nakama, initializer: nkruntime.Initializer) {
    createLeaderboard(nk, "4ec4f126-3f9d-11e7-84ef-b7c182b36521");

    initializer.registerRpc("healthcheck", rpcHealthcheck);
    initializer.registerRpc("createTournament", rpcCreateTournament);

    logger.info("JavaScript module loaded");
}