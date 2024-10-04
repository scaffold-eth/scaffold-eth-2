const LEADERBOARD_ID = "radar";

function createLeaderboard(nk: nkruntime.Nakama, id: string) {
    // let id = '4ec4f126-3f9d-11e7-84ef-b7c182b36521';
    let authoritative = false;
    let sort = nkruntime.SortOrder.DESCENDING;
    let operator = nkruntime.Operator.BEST;
    let reset = '*/1 * * * *'; // Every minute
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

let leaderboardReset: nkruntime.LeaderboardResetFunction = function (ctx: nkruntime.Context, logger: nkruntime.Logger, nk: nkruntime.Nakama, leaderboard: nkruntime.Leaderboard, reset: number) {
    if (leaderboard.id != LEADERBOARD_ID) {    
        return;
    }

    // Get top 3
    let result = nk.leaderboardRecordsList(leaderboard.id, [], 3, undefined, reset);

    let walletUpdates : nkruntime.WalletUpdate[] = [];
  
    if (result && result.records) {
        result.records.forEach(function (r) {
        let reward = 100;
        
        walletUpdates.push({
            userId: r.ownerId,
            changeset: { coins: reward},
            metadata: {}
        })
        });
    }
  
    nk.walletsUpdate(walletUpdates, true);
  }

function InitModule(ctx: nkruntime.Context, logger: nkruntime.Logger, nk:nkruntime.Nakama, initializer: nkruntime.Initializer) {
    createLeaderboard(nk, LEADERBOARD_ID);

    initializer.registerRpc("healthcheck", rpcHealthcheck);
    initializer.registerRpc("createTournament", rpcCreateTournament);
    initializer.registerLeaderboardReset(leaderboardReset);

    logger.info("JavaScript module loaded");
}
