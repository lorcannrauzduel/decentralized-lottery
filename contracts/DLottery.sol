// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@chainlink/contracts/src/v0.8/vrf/VRFConsumerBaseV2.sol";

contract DLottery is VRFConsumerBaseV2 {
    uint256 public winnerIndex;
    VRFCoordinatorV2Interface COORDINATOR;
    uint64 subscriptionId;
    address vrfCoordinator = 0x8103B0A8A00be2DDC778e6e7eaa21791Cd364625;
    bytes32 keyHash =
        0x474e34a077df58807dbe9c96d3c009b23b3c6d0cce433e59bbf5b34f823bc56c;
    uint32 callbackGasLimit = 40000;
    uint16 requestConfirmations = 3;
    uint32 numWords = 1;
    address public owner;
    address[] public participants;
    mapping(address => bool) isParticipant;
    uint public endTime;
    address public winner;
    bool public isStarted;
    uint constant public TICKET_PRICE = 0.001 ether;

    enum State {
        NOT_STARTED,
        STARTED,
        ENDED
    }
    State public currentState;
    event RequestedRandomness(uint256 requestId);
    event SelectedWinner(address winner);

    constructor(uint64 _subscriptionId) VRFConsumerBaseV2(vrfCoordinator) {
        COORDINATOR = VRFCoordinatorV2Interface(vrfCoordinator);
        owner = msg.sender;
        subscriptionId = _subscriptionId;
        endTime = block.timestamp + 2 days;
        currentState = State.NOT_STARTED;
    }

    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }

    function buyTicket(address newParticipant) public payable {
        require(!isParticipant[newParticipant], "Already participant");
        require(block.timestamp < endTime, "Lotery is finished");
        require(msg.value == TICKET_PRICE, "Invalid price");
        isParticipant[newParticipant] = true;
        participants.push(newParticipant);
    }

    function roll( ) public onlyOwner returns (uint256 requestId) {
        require(block.timestamp > endTime, "Lotery is not finished");
        require(participants.length > 0, "No participants");
        require(currentState == State.NOT_STARTED, "Lotery is started");
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

    function fulfillRandomWords(
        uint256 requestId,
        uint256[] memory randomWords
    ) internal override {
        uint max = participants.length - 1;
        winnerIndex = randomWords[0] %  (max - 0 + 1) + 0;
        winner = participants[winnerIndex];
        currentState = State.ENDED;
        emit SelectedWinner(winner);
    }

    function claim() public {
        require(msg.sender == winner, "You are not winner");
        (bool sent, ) = address(winner).call{value: address(this).balance}("");
        require(sent, "Transfer failed");
    }

    function getParticipants() public view returns (uint) {
        return participants.length;
    }
}
