//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

interface IVoting {
    // Errors
    error Voting__CommitmentAlreadyAdded(uint256 commitment);
    error Voting__NullifierHashAlreadyUsed(bytes32 nullifierHash);
    error Voting__InvalidProof();
    error Voting__NotAllowedToVote();
    error Voting__EmptyTree();
    error Voting__InvalidRoot();

    // Events
    event VoterAdded(address indexed voter);
    event NewLeaf(uint256 index, uint256 value);
    event VoteCast(
        bytes32 indexed nullifierHash,
        address indexed voter,
        bool vote,
        uint256 timestamp,
        uint256 totalYes,
        uint256 totalNo
    );

    // Functions
    function addVoters(address[] calldata voters, bool[] calldata statuses) external;
    function register(uint256 _commitment) external;
    function vote(bytes memory _proof, bytes32 _nullifierHash, bytes32 _root, bytes32 _vote, bytes32 _depth) external;
    function getVotingData()
        external
        view
        returns (
            string memory question,
            address contractOwner,
            uint256 yesVotes,
            uint256 noVotes,
            uint256 size,
            uint256 depth,
            uint256 root
        );
    function getVoterData(address _voter) external view returns (bool voter, bool registered);
}
