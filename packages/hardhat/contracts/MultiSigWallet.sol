// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

contract MultiSigWallet {
	event Deposit(address indexed sender, uint256 amount, uint256 balance);
	event SubmitTransaction(
		address indexed owner,
		uint256 indexed txIndex,
		address indexed to,
		uint256 value,
		bytes data
	);
	event ConfirmTransaction(address indexed owner, uint256 indexed txIndex);
	event RevokeConfirmation(address indexed owner, uint256 indexed txIndex);
	event ExecuteTransaction(address indexed owner, uint256 indexed txIndex);

	address[] public owners;
	mapping(address => bool) public isOwner;
	uint256 public numConfirmationsRequired;
	string public greeting = "Multi Sig Wallet!!!";

	struct Transaction {
		address to;
		uint256 value;
		bytes data;
		bool executed;
		uint256 numConfirmations;
	}

	// mapping from tx index => owner => bool
	mapping(uint256 => mapping(address => bool)) public isConfirmed;

	Transaction[] public transactions;

	modifier onlyOwner() {
		require(isOwner[msg.sender], "not owner");
		_;
	}

	modifier txExists(uint256 _txIndex) {
		require(_txIndex < transactions.length, "tx does not exist");
		_;
	}

	modifier notExecuted(uint256 _txIndex) {
		require(!transactions[_txIndex].executed, "tx already executed");
		_;
	}

	modifier notConfirmed(uint256 _txIndex) {
		require(!isConfirmed[_txIndex][msg.sender], "tx already confirmed");
		_;
	}

	constructor(address[] memory _owners, uint256 _numConfirmationsRequired) {
		require(_owners.length > 0, "owners required");
		require(
			_numConfirmationsRequired > 0 &&
				_numConfirmationsRequired <= _owners.length,
			"invalid number of required confirmations"
		);

		for (uint256 i = 0; i < _owners.length; i++) {
			address owner = _owners[i];

			require(owner != address(0), "invalid owner");
			require(!isOwner[owner], "owner not unique");

			isOwner[owner] = true;
			owners.push(owner);
		}

		numConfirmationsRequired = _numConfirmationsRequired;
	}

	receive() external payable {
		emit Deposit(msg.sender, msg.value, address(this).balance);
	}

	function submitTransaction(
		address _to,
		uint256 _value,
		bytes memory _data
	) public onlyOwner {
		uint256 txIndex = transactions.length;

		transactions.push(
			Transaction({
				to: _to,
				value: _value,
				data: _data,
				executed: false,
				numConfirmations: 0
			})
		);

		emit SubmitTransaction(msg.sender, txIndex, _to, _value, _data);
	}

	function confirmTransaction(
		uint256 _txIndex
	)
		public
		onlyOwner
		txExists(_txIndex)
		notExecuted(_txIndex)
		notConfirmed(_txIndex)
	{
		Transaction storage transaction = transactions[_txIndex];
		transaction.numConfirmations += 1;
		isConfirmed[_txIndex][msg.sender] = true;

		emit ConfirmTransaction(msg.sender, _txIndex);
	}

	function executeTransaction(
		uint256 _txIndex
	) public onlyOwner txExists(_txIndex) notExecuted(_txIndex) {
		Transaction storage transaction = transactions[_txIndex];

		require(
			transaction.numConfirmations >= numConfirmationsRequired,
			"cannot execute tx"
		);

		transaction.executed = true;

		(bool success, ) = transaction.to.call{ value: transaction.value }(
			transaction.data
		);
		require(success, "tx failed");

		emit ExecuteTransaction(msg.sender, _txIndex);
	}

	function revokeConfirmation(
		uint256 _txIndex
	) public onlyOwner txExists(_txIndex) notExecuted(_txIndex) {
		Transaction storage transaction = transactions[_txIndex];

		require(isConfirmed[_txIndex][msg.sender], "tx not confirmed");

		transaction.numConfirmations -= 1;
		isConfirmed[_txIndex][msg.sender] = false;

		emit RevokeConfirmation(msg.sender, _txIndex);
	}

	function getOwners() public view returns (address[] memory) {
		return owners;
	}

	function getTransactionCount() public view returns (uint256) {
		return transactions.length;
	}

	function getTransaction(
		uint256 _txIndex
	)
		public
		view
		returns (
			address to,
			uint256 value,
			bytes memory data,
			bool executed,
			uint256 numConfirmations
		)
	{
		Transaction storage transaction = transactions[_txIndex];

		return (
			transaction.to,
			transaction.value,
			transaction.data,
			transaction.executed,
			transaction.numConfirmations
		);
	}
}
