// SPDX-License-Identifier: MIT
pragma solidity 0.8.22;

import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@chainlink/contracts/src/v0.8/vrf/VRFConsumerBaseV2.sol";

/// @title DLottery - Decentralized Lottery Contract
/// @author Lorcann Rauzduel
/// @notice Implements a decentralized lottery system using Chainlink's Verifiable Random Function (VRF) for randomness.
/// @dev Inherits from VRFConsumerBaseV2 for integrating Chainlink VRF.
contract DLottery is VRFConsumerBaseV2 {
    VRFCoordinatorV2Interface COORDINATOR;

    // VRF parameters
    uint64 subscriptionId;
    address vrfCoordinator;
    bytes32 keyHash;
    uint32 callbackGasLimit;
    uint16 requestConfirmations;
    uint32 numWords;

    // Lottery parameters
    address public owner;
    uint256 public endTime;
    uint256 public randomIndex;
    uint256 constant public TICKET_PRICE = 0.0001 ether;
    uint256 constant public DURATION_TIME = 1 days;

    // Participant tracking
    address[] public participants;
    mapping(address => bool) isParticipant;

    // Lottery states
    enum State { NOT_STARTED, STARTED, ENDED }
    State public currentState;

    // Events
    event ParticipantAdded(address participant);
    event RequestedRandomness(uint256 requestId);
    event RequestedRandomnessFulfilled(uint256 requestId, address winner);

    // Custom errors
    error InvalidPrice();
    error AlreadyParticipant();
    error NoParticipants();
    error LotteryIsStarted();
    error LotteryIsNotFinished();
    error LotteryIsFinished();
    error YouAreNotWinner();
    error TransferFailed();

    /// @notice Constructs the lottery contract and initializes Chainlink VRF parameters
    /// @param _subscriptionId Chainlink VRF subscription ID used for requesting randomness
    constructor(uint64 _subscriptionId) VRFConsumerBaseV2(vrfCoordinator) {
        subscriptionId = _subscriptionId;
        COORDINATOR = VRFCoordinatorV2Interface(vrfCoordinator);
        owner = msg.sender;
        endTime = block.timestamp + DURATION_TIME;
        currentState = State.NOT_STARTED;
    }
    
    /// @notice Restricts function access to the contract owner
    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }

    /// @notice Initiates the lottery and requests randomness from Chainlink VRF
    /// @return requestId The request ID used for tracking the VRF request
    /// @dev Sets the state to STARTED and emits a RequestedRandomness event
    function start() external onlyOwner returns (uint256 requestId) {
        if(participants.length == 0) revert NoParticipants();
        if(currentState == State.STARTED) revert LotteryIsStarted();
        if(block.timestamp < endTime) revert LotteryIsNotFinished();
        requestId = COORDINATOR.requestRandomWords(
            keyHash,
            subscriptionId,
            requestConfirmations,
            callbackGasLimit,
            numWords
        );
        currentState = State.STARTED;
        emit RequestedRandomness(requestId);
    }

    /// @notice Resets the lottery for a new round
    /// @dev Only callable by the contract owner and resets the participant list
    function restart() external onlyOwner {
        if(currentState != State.ENDED) revert LotteryIsNotFinished();
        if(participants.length == 0) revert NoParticipants();
        currentState = State.NOT_STARTED;
        participants = new address[](0);
        endTime = block.timestamp + DURATION_TIME;
    }

    /// @notice Allows a new participant to buy a ticket for the lottery
    /// @param newParticipant Address of the participant buying the ticket
    /// @dev Emits a ParticipantAdded event upon successful ticket purchase
    function buyTicket(address newParticipant) external payable {
        if(isParticipant[newParticipant]) revert AlreadyParticipant();
        if(msg.value < TICKET_PRICE) revert InvalidPrice();
        if(currentState == State.ENDED) revert LotteryIsFinished();
        isParticipant[newParticipant] = true;
        participants.push(newParticipant);
        emit ParticipantAdded(newParticipant);
    }

    /// @notice Returns the number of participants in the lottery
    /// @return count The number of participants
    function getParticipants() external view returns (uint) {
        return participants.length;
    }

    /// @notice Returns the winner of the lottery if it has ended and there are participants
    /// @return winner The address of the lottery winner
    function getWinner() public view returns (address) {
        if(currentState != State.ENDED) revert LotteryIsNotFinished();
        if(participants.length == 0) revert NoParticipants();
        return participants[randomIndex];
    }

    /// @notice Internal function to handle the fulfillment of randomness requested from Chainlink VRF
    /// @param requestId The request ID associated with the randomness request
    /// @param randomWords Array of random words (numbers) provided by Chainlink VRF
    /// @dev Calculates the winner based on the random number and sets the state to ENDED
    function fulfillRandomWords(
        uint256 requestId,
        uint256[] memory randomWords
    ) internal override {
        randomIndex = randomWords[0] %  ((participants.length - 1) - 0 + 1) + 0;
        currentState = State.ENDED;
        emit RequestedRandomnessFulfilled(requestId, participants[randomIndex]);
    }
}
