// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "hardhat/console.sol";

contract AcccountabilityProtocol {
  address public vcAdmin;
  IERC20 public immutable tokenToRaise;

  //   project struct
  struct Project {
    uint id;
    string name;
    string description;
    uint amountToRaise;
    uint amountRaised;
    uint minInvestment;
    uint maxInvestment;
    address payable payee;
    uint startDateTime;
    uint endDateTime;
    bool completed;
    address createdBy;
    uint investorCount;
  }

  //   project struct array
  Project[] public projects;

  enum MilestoneStatus {
    NotStarted,
    InProgress,
    onHold,
    Completed,
    Cancelled,
    Claimed
  }

  enum QuorumType {
    FixedValue,
    Percentage,
    AdminOverride
  }

  //   milestone struct
  struct Milestone {
    string name;
    string description;
    uint amountToUnlock;
    uint unlockDateTime;
    MilestoneStatus status;
    string proofURI;
    uint votes;
    uint quorumThreshold;
    QuorumType quorumType;
    address createdBy;
  }

  //   mapping project id to milestones
  mapping(uint => Milestone[]) public milestones;

  //   mapping project id to investor investment
  mapping(uint => mapping(address => uint)) public investments;

  //   mapping project id to milestone id to investor votes
  mapping(uint => mapping(uint => mapping(address => bool))) public milestoneVotes;

  //   events
  event ProjectCreated(
    uint indexed id,
    string name,
    string description,
    uint amountToRaise,
    uint minInvestment,
    uint maxInvestment,
    address indexed payee,
    uint startDateTime,
    uint endDateTime,
    address indexed createdBy
  );

  event MilestoneCreated(
    uint indexed projectId,
    string name,
    string description,
    uint amountToUnlock,
    uint unlockDateTime,
    address indexed createdBy
  );

  event MilestoneStatusUpdated(
    uint indexed projectId,
    uint indexed milestoneId,
    MilestoneStatus status,
    address indexed updatedBy
  );

  event MilestoneProofSubmitted(
    uint indexed projectId,
    uint indexed milestoneId,
    string proof,
    address indexed submittedBy
  );

  event MilestoneUnlockClaimed(
    uint indexed projectId,
    uint indexed milestoneId,
    uint amountClaimed,
    address indexed claimedBy
  );

  event Deposited(uint indexed projectId, uint amount, address indexed depositor);

  constructor(address _vcAdmin, address _tokenToRaise) {
    vcAdmin = _vcAdmin;
    tokenToRaise = IERC20(_tokenToRaise);
  }

  modifier onlyAdmin() {
    require(msg.sender == vcAdmin, "Only admin can call this function.");
    _;
  }

  modifier onlyPayee(uint _projectId) {
    require(msg.sender == projects[_projectId].payee, "Only payee can call this function.");
    _;
  }

  modifier onlyAdminOrPayee(uint _projectId) {
    require(
      msg.sender == projects[_projectId].payee || msg.sender == vcAdmin,
      "Only admin or payee can call this function."
    );
    _;
  }

  function createNewProject(
    string memory _name,
    string memory _description,
    uint _amountToRaise,
    uint _minInvestment,
    uint _maxInvestment,
    address _payee,
    uint _startDateTime,
    uint _endDateTime
  ) external onlyAdmin {
    require(_amountToRaise > 0, "Amount to raise must be greater than 0.");
    require(_startDateTime < _endDateTime, "Start date must be before end date.");
    require(_payee != address(0), "Payee address cannot be 0.");
    require(_startDateTime > block.timestamp, "Start date must be in the future.");
    require(_endDateTime > block.timestamp, "End date must be in the future.");
    require(bytes(_name).length > 0, "Project name cannot be empty.");
    require(_minInvestment > 0, "Minimum investment must be greater than 0.");
    require(_maxInvestment > 0, "Maximum investment must be greater than 0.");

    Project memory newProject = Project(
      projects.length,
      _name,
      _description,
      _amountToRaise,
      0,
      _minInvestment,
      _maxInvestment,
      payable(_payee),
      _startDateTime,
      _endDateTime,
      false,
      msg.sender,
      0
    );
    projects.push(newProject);
    emit ProjectCreated(
      newProject.id,
      newProject.name,
      newProject.description,
      newProject.amountToRaise,
      newProject.minInvestment,
      newProject.maxInvestment,
      newProject.payee,
      newProject.startDateTime,
      newProject.endDateTime,
      newProject.createdBy
    );
  }

  function addMilestone(
    uint _projectId,
    string memory _name,
    string memory _description,
    uint _amountToUnlock,
    uint _unlockDateTime,
    uint _quorumThreshold,
    QuorumType _quorumType
  ) external onlyAdminOrPayee(_projectId) {
    require(_amountToUnlock > 0, "Amount to unlock must be greater than 0.");
    require(_unlockDateTime > block.timestamp, "Unlock date must be in the future.");
    require(bytes(_name).length > 0, "Milestone name cannot be empty.");

    Milestone memory newMilestone = Milestone(
      _name,
      _description,
      _amountToUnlock,
      _unlockDateTime,
      MilestoneStatus.NotStarted,
      "",
      0,
      _quorumThreshold,
      _quorumType,
      msg.sender
    );
    milestones[_projectId].push(newMilestone);
    emit MilestoneCreated(
      _projectId,
      newMilestone.name,
      newMilestone.description,
      newMilestone.amountToUnlock,
      newMilestone.unlockDateTime,
      msg.sender
    );
  }

  function deposit(uint _projectId, uint _amount) external {
    require(_amount > 0, "Amount must be greater than 0.");
    require(msg.sender != address(0), "Sender address cannot be 0.");
    require(_amount <= IERC20(tokenToRaise).balanceOf(msg.sender), "Insufficient balance.");
    require(projects.length > 0, "No project to invest in.");
    require(
      projects[_projectId].amountRaised + _amount <= projects[_projectId].amountToRaise,
      "Amount to raise exceeded."
    );
    require(_amount <= IERC20(tokenToRaise).allowance(msg.sender, address(this)), "Insufficient allowance.");

    Project storage project = projects[_projectId];
    project.amountRaised += _amount;
    if (investments[_projectId][msg.sender] == 0) {
      project.investorCount += 1;
    }
    investments[_projectId][msg.sender] += _amount;
    tokenToRaise.transferFrom(msg.sender, address(this), _amount);
    emit Deposited(project.id, _amount, msg.sender);
  }

  function updatePayee(uint _projectId, address _payee) external onlyAdmin {
    require(_payee != address(0), "Payee address cannot be 0.");
    require(_projectId < projects.length, "Project does not exist.");
    require(projects[_projectId].createdBy == msg.sender, "Only project creator can update payee.");
    projects[_projectId].payee = payable(_payee);
  }

  function updateMilestoneStatus(
    uint _projectId,
    uint _milestoneId,
    MilestoneStatus _status
  ) external onlyAdminOrPayee(_projectId) {
    require(_projectId < projects.length, "Project does not exist.");
    require(_milestoneId < milestones[_projectId].length, "Milestone does not exist.");
    milestones[_projectId][_milestoneId].status = _status;
    emit MilestoneStatusUpdated(_projectId, _milestoneId, _status, msg.sender);
  }

  function claimMilestoneUnlock(uint _projectId, uint _milestoneId) external onlyPayee(_projectId) {
    require(_projectId < projects.length, "Project does not exist.");
    require(_milestoneId < milestones[_projectId].length, "Milestone does not exist.");
    require(
      milestones[_projectId][_milestoneId].status == MilestoneStatus.Completed,
      "Milestone status is not completed."
    );
    require(
      milestones[_projectId][_milestoneId].status != MilestoneStatus.Claimed,
      "Milestone has already been claimed."
    );

    uint amountToUnlock = milestones[_projectId][_milestoneId].amountToUnlock;
    require(projects[_projectId].amountRaised >= amountToUnlock, "Amount to unlock is greater than amount raised.");

    projects[_projectId].amountRaised -= amountToUnlock;
    milestones[_projectId][_milestoneId].status = MilestoneStatus.Claimed;
    tokenToRaise.transfer(projects[_projectId].payee, amountToUnlock);
    emit MilestoneUnlockClaimed(_projectId, _milestoneId, amountToUnlock, msg.sender);
  }

  function submitMilestoneProof(
    uint _projectId,
    uint _milestoneId,
    string memory _proofURI
  ) external onlyPayee(_projectId) {
    require(_projectId < projects.length, "Project does not exist.");
    require(_milestoneId < milestones[_projectId].length, "Milestone does not exist.");
    require(
      milestones[_projectId][_milestoneId].status == MilestoneStatus.InProgress,
      "Milestone status is not in progress."
    );
    require(bytes(_proofURI).length > 0, "Milestone proof URI cannot be empty.");

    milestones[_projectId][_milestoneId].proofURI = _proofURI;
    emit MilestoneProofSubmitted(_projectId, _milestoneId, _proofURI, msg.sender);
  }

  function voteOnMilestone(uint _projectId, uint _milestoneId) external {
    require(_projectId < projects.length, "Project does not exist.");
    require(_milestoneId < milestones[_projectId].length, "Milestone does not exist.");
    require(
      milestones[_projectId][_milestoneId].status == MilestoneStatus.InProgress,
      "Milestone status is not in progress."
    );
    require(
      milestones[_projectId][_milestoneId].quorumType == QuorumType.FixedValue ||
        milestones[_projectId][_milestoneId].quorumType == QuorumType.Percentage,
      "Milestone quorum type is not votes."
    );
    if (milestoneVotes[_projectId][_milestoneId][msg.sender] == false) {
      milestoneVotes[_projectId][_milestoneId][msg.sender] = true;
      milestones[_projectId][_milestoneId].votes += 1;
    }

    if (milestones[_projectId][_milestoneId].quorumType == QuorumType.FixedValue) {
      if (milestones[_projectId][_milestoneId].votes >= milestones[_projectId][_milestoneId].quorumThreshold) {
        milestones[_projectId][_milestoneId].status = MilestoneStatus.Completed;
      }
    }

    if (milestones[_projectId][_milestoneId].quorumType == QuorumType.Percentage) {
      uint quorumAcheived = (100 * milestones[_projectId][_milestoneId].votes) / projects[_projectId].investorCount;
      if (quorumAcheived >= milestones[_projectId][_milestoneId].quorumThreshold) {
        milestones[_projectId][_milestoneId].status = MilestoneStatus.Completed;
      }
    }
  }
}
