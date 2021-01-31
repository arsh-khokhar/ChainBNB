pragma solidity ^0.5.0;

contract ChainBNB {
    uint numRentalPlaces;
    
    struct Renter {
        address payable currentRenter;
        string myOccupancyStatus;
    }
    
    struct Bidder {
        address bidderAddress;
        uint bid;
    }
    
    struct RentalPlace {
        uint rentalPlaceID;
        address payable placeOwner;
        uint currentRent;
        string imageIPFShash;
        string placeAddress; 
        bool isBiddingActive;
        uint biddingStartDate;
        uint biddingEndDate;
        uint highestBid;
        address highestBidder;
        uint numberOfBids;
        string monthOccupancy;
        mapping (address => Bidder) bidders;
        mapping (address => Renter) renters;
    }
    
    mapping (uint => RentalPlace) public rentalPlaces;

    function addRentalPlace(uint _rent, string memory _placeAddress, string memory _imageIPFShash, string memory _occupancy) public {
        numRentalPlaces++;
        RentalPlace storage newRentalPlace = rentalPlaces[numRentalPlaces];
        newRentalPlace.rentalPlaceID = numRentalPlaces;
        newRentalPlace.placeOwner = msg.sender;
        newRentalPlace.imageIPFShash = _imageIPFShash;
        newRentalPlace.placeAddress = _placeAddress;
        newRentalPlace.monthOccupancy = _occupancy;
        newRentalPlace.isBiddingActive = false;
        newRentalPlace.currentRent = _rent * 1 finney;
        newRentalPlace.numberOfBids = 0;
    }

    function getNumRentalPlaces() public view returns (uint) {
        return numRentalPlaces;
    }

    function rentPlace(uint _rentalPlaceID, uint _startIndex, uint _endIndex) public payable {
        require(rentalPlaces[_rentalPlaceID].placeOwner != msg.sender, "Owner cannot rent their own place!");
        require(msg.value >= rentalPlaces[_rentalPlaceID].currentRent * (_endIndex - _startIndex + 1), "Incorrect amount of rent provided!");
        Renter storage newRenter = rentalPlaces[_rentalPlaceID].renters[msg.sender];
        
        rentalPlaces[_rentalPlaceID].placeOwner.transfer(msg.value);
        
        bytes memory temp = bytes(rentalPlaces[_rentalPlaceID].monthOccupancy);
        for(uint i = _startIndex-1; i < _endIndex; i++) {
            temp[i] = "1";
        }
        rentalPlaces[_rentalPlaceID].monthOccupancy = string(temp);
        
        bytes memory temp2 = bytes(rentalPlaces[_rentalPlaceID].monthOccupancy);
        for(uint j = 0; j < temp2.length; j++) {
            if(temp2[j] != "1")
            {
                temp2[j] = "0";
            }
        }
        for(uint k = _startIndex-1; k < _endIndex; k++) {
            temp2[k] = "1";
        }
        newRenter.myOccupancyStatus = string(temp2);
    }
    
    function getRenterOccupancy(uint _rentalPlaceID, address _renter) public view returns (string memory) {
        return rentalPlaces[_rentalPlaceID].renters[_renter].myOccupancyStatus;
    }
    
    function getBiddersBid(uint _rentalPlaceID, address _bidder) public view returns (uint) {
        return rentalPlaces[_rentalPlaceID].bidders[_bidder].bid;
    }
    
    function updateRent(uint _rentalPlaceID, uint _newRent) public {
        require(rentalPlaces[_rentalPlaceID].placeOwner == msg.sender, "Only the owner can modify rent!");
        rentalPlaces[_rentalPlaceID].currentRent = _newRent * 1 finney;
    }

    function changeBiddingStatus(uint _rentalPlaceID, bool _newBiddingStatus, uint _startDate, uint _endDate) public {
        require(rentalPlaces[_rentalPlaceID].placeOwner == msg.sender, "Only the owner can enable bidding!");
        rentalPlaces[_rentalPlaceID].isBiddingActive = _newBiddingStatus;
        rentalPlaces[_rentalPlaceID].biddingStartDate = _startDate;
        rentalPlaces[_rentalPlaceID].biddingEndDate = _endDate;
        
    }
    
    function registerBid(uint _rentalPlaceID, uint _bid) public {
        require(rentalPlaces[_rentalPlaceID].placeOwner != msg.sender, "Owner cannot bid on their own place!");
        Bidder storage newBidder = rentalPlaces[_rentalPlaceID].bidders[msg.sender];
        newBidder.bid = _bid * 1 finney;

        if(_bid >= rentalPlaces[_rentalPlaceID].highestBid)
        {
            rentalPlaces[_rentalPlaceID].highestBid = _bid;
            rentalPlaces[_rentalPlaceID].highestBidder = msg.sender;
        }
        rentalPlaces[_rentalPlaceID].numberOfBids++;
    }

    function closeBids(uint _rentalPlaceID) public {
        require(rentalPlaces[_rentalPlaceID].placeOwner == msg.sender, "Only owner can close Bids");
        rentalPlaces[_rentalPlaceID].isBiddingActive = false;
    }
}