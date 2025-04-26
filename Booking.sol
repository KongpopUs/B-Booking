// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract TicketBooking {
    uint public constant ticketPrice = 0.005 ether;
    uint public constant totalSeats = 100;

    address public owner;

    mapping(string => address) public seatOwners;
    mapping(address => string[]) public userSeats;

    event SeatBooked(address indexed user, string seatId);
    event AllReservationsCleared();

    constructor() {
        owner = msg.sender;
    }

    function bookSeat(string memory seatId) public payable {
        require(msg.value == ticketPrice, "Incorrect price");
        require(seatOwners[seatId] == address(0), "Seat already booked");

        seatOwners[seatId] = msg.sender;
        userSeats[msg.sender].push(seatId);

        emit SeatBooked(msg.sender, seatId);
    }

    function getMySeats() public view returns (string[] memory) {
        return userSeats[msg.sender];
    }

    function getSeatOwner(string memory seatId) public view returns (address) {
        return seatOwners[seatId];
    }

    function clearAllReservations() public {

        for (uint i = 65; i < 75; i++) {
            for (uint j = 1; j <= 10; j++) {
                string memory seatId = string(abi.encodePacked(
                    bytes1(uint8(i)),
                    j < 10 ? string(abi.encodePacked("0", uint2str(j))) : uint2str(j)
                ));
                address currentOwner = seatOwners[seatId];
                if (currentOwner != address(0)) {
                    // Remove seat from userSeats
                    for (uint k = 0; k < userSeats[currentOwner].length; k++) {
                        if (keccak256(abi.encodePacked(userSeats[currentOwner][k])) == keccak256(abi.encodePacked(seatId))) {
                            userSeats[currentOwner][k] = userSeats[currentOwner][userSeats[currentOwner].length - 1];
                            userSeats[currentOwner].pop();
                            break;
                        }
                    }
                    seatOwners[seatId] = address(0);
                }
            }
        }

        emit AllReservationsCleared();
    }

    function uint2str(uint v) internal pure returns (string memory str) {
        if (v == 0) return "0";
        uint maxlength = 100;
        bytes memory reversed = new bytes(maxlength);
        uint i = 0;
        while (v != 0) {
            reversed[i++] = bytes1(uint8(48 + v % 10));
            v /= 10;
        }
        bytes memory s = new bytes(i);
        for (uint j = 0; j < i; j++) {
            s[j] = reversed[i - j - 1];
        }
        str = string(s);
    }
}