import React, {Component} from 'react';
import {Text, Alert, Button} from 'react-bootstrap';
import {Calendar} from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import web3 from 'web3';
import 'bootstrap/dist/css/bootstrap.min.css';
import './RentalPlaces.css';
import {now} from 'jquery';
const IPFS = require('ipfs-api');
const ipfs = new IPFS({host: 'ipfs.infura.io', port: 5001, protocol: 'https'});
const monthNames = ["January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

class RentalPlaces extends Component {
  constructor(props) {
    super(props);
    this.state = {
      datesSelected: false,
      minDate: new Date(new Date().getFullYear(), new Date().getMonth()+1, 1),
      maxDate: new Date(new Date().getFullYear(), new Date().getMonth()+2, 0),
      myOccupancy: null,
      startDate: new Date(new Date().getFullYear(), new Date().getMonth()+1, 1),
      endDate: null,
      activeRow: 0,
      myLastBid: 0,
      showBidInfo: false,
    };
    this.onStartDateChange = this.onStartDateChange.bind(this);
    this.checkOccupancy = this.checkOccupancy.bind(this);
    this.populateOccupancy = this.populateOccupancy.bind(this);
    this.newBid = {};
  }

  onStartDateChange = (date) => {
    if(date== null || date.length < 2)
    {
      this.setState({datesSelected: false});
      return false;
    }
    if(date.length < 2)
    {
      return;  
    }
    this.setState({startDate: date[0]});
    this.setState({endDate: date[1]});
    this.setState({datesSelected: true});
  };

  checkOccupancy(occupancyString, date, bidingStart, bidingEnd) {
    return occupancyString[date-1] != 0 || (date >= bidingStart && date <= bidingEnd);
  }

  async populateOccupancy(rentalPlaceID) {
    var val = await this.props.getmyOccupancy(rentalPlaceID);
    this.setState({myOccupancy:val});
    var rentingIntervals = []
    var first = -1;
    var last;
    for(var d=0; d < val.length; d++)
    {
      if(val[d] == 1 && first == -1)
      {
        first = d+1;
      }
      if(val[d] == 0 && first >= 0)
      {
        rentingIntervals.push([first, d]);
        first = -1;
      }
    }
    document.getElementById('occupancyDiv' + rentalPlaceID).innerHTML = null;
    if(rentingIntervals.length <= 0)
    {
      document.getElementById('occupancyDiv' + rentalPlaceID).innerHTML = "<br/><label> <strong> You are not renting this place currently.</strong></label>";
      return;
    }
    document.getElementById('occupancyDiv' + rentalPlaceID).innerHTML = "<br/><label> <strong> You are renting this place for the following dates.</strong></label>";
    for(var r=0; r < rentingIntervals.length; r++)
    {
      document.getElementById('occupancyDiv' + rentalPlaceID).innerHTML += "<br/><label><strong>" + rentingIntervals[r][0] + " to " + rentingIntervals[r][1] + " " + monthNames[new Date().getMonth()] + ", " + new Date().getFullYear() + "</strong></label>";
    }
  }

  async getBidInfo(rentalPlaceID) {
    var val = await this.props.getMyTotalBid(rentalPlaceID);
    this.setState({myLastBid:val});
    this.setState({showBidInfo: true});
  }

  handleAvailibilityReq(id)
  {
    for(var r=1; r <= this.props.numRentalPlaces; r++)
    {
      document.getElementById("calendarLabel"+r).hidden = true;
      if(r == id)
      {
        document.getElementById("calendarLabel"+r).hidden = false;
        this.setState({activeRow: r});    
      }      
    }
    this.setState({startDate: new Date(new Date().getFullYear(), new Date().getMonth()+1, 1)});
    this.setState({endDate: null});
  }

  render() {
    return (
      <div className="RentalPlacesContainer" id="content">
        <h2>Available Rental Places</h2>
        <table className="rentalTable">
          <tbody id="rentalPlaceList">
            {this.props.rentalPlaces.map((rentalPlace, key) => {
              return (
                <tr key={key}>
                  <td width="20%">
                    <img
                      src={`https://ipfs.io/ipfs/${rentalPlace.imageIPFShash}`}
                      alt=""
                      width="400"
                    />
                  </td>
                  <td>
                    <div>
                      <label>
                        <strong>Street Address:&nbsp;</strong>
                        {rentalPlace.placeAddress}
                      </label>
                      <br />
                      <label>
                        <strong>Rent per day:&nbsp;</strong>
                        {web3.utils.fromWei(rentalPlace.currentRent)} Ether
                      </label>
                      <br />
                      {rentalPlace.placeOwner == this.props.activeAccount ? (
                        <label>
                          This place is owned by you. Please visit{' '}
                          <i>
                            <b> Your postings </b>
                          </i>{' '}
                          section to manage your posting{' '}
                        </label>
                      ) : (
                        <label>
                          <strong>Owned by:&nbsp;</strong>
                          {rentalPlace.placeOwner}
                          <br />
                          <br />
                          <form
                          id="rentingForm"
                              onSubmit={(event) => {
                              event.preventDefault();
                              const rentalPlaceID = rentalPlace.rentalPlaceID;
                              const rent = rentalPlace.currentRent;
                              if(this.state.startDate == null || this.state.endDate == null)
                              {
                                return false;
                              }
                              this.props.rentRentalPlace(rentalPlaceID, rent, this.state.startDate.getDate(), this.state.endDate.getDate());
                            }}
                          >
                            <Button variant="success" type="submit" hidden={!(this.state.activeRow == rentalPlace.rentalPlaceID && this.state.datesSelected)}>
                              Rent
                            </Button>{' '}
                          </form>
                          <form
                              id="rentingForm"
                              onSubmit={(event) => {
                              event.preventDefault();
                              this.handleAvailibilityReq(rentalPlace.rentalPlaceID);
                            }}
                          >
                            <Button variant="primary" type="submit">
                            View Availability
                            </Button>{' '}
                          </form>
                          <form
                              id="rentingForm"
                              onSubmit={(event) => {
                              event.preventDefault();
                              this.populateOccupancy(rentalPlace.rentalPlaceID);
                            }}
                          >
                            <Button variant="secondary" type="submit">
                              Show my renting status
                            </Button>{' '}
                          </form>
                          <form
                              id="rentingForm"
                              onSubmit={(event) => {
                              event.preventDefault();
                              this.getBidInfo(rentalPlace.rentalPlaceID);
                            }}
                          >
                            <Button variant="secondary" type="submit">
                              Load Bidding info
                            </Button>{' '}
                          </form>
                          <br/>
                          <label id={"occupancyDiv"+rentalPlace.rentalPlaceID}/>
                          {rentalPlace.isBiddingActive && this.state.showBidInfo ? (
                          <div>
                            <label><strong> This place has ongoing bidding for dates {rentalPlace.biddingStartDate + " to "+rentalPlace.biddingEndDate + " " + monthNames[new Date().getMonth()+1] + ", " + new Date().getFullYear()}</strong></label>
                              <br/><label><strong> Total Bids: </strong>{rentalPlace.numberOfBids}</label>
                              {(rentalPlace.numberOfBids > 0 && rentalPlace.highestBidder == this.props.activeAccount) ? 
                              (<div style={{display:"inline"}}><br/><label><strong>You are currently the highest bidder</strong></label></div>) : null}
                              {(rentalPlace.numberOfBids > 0 && rentalPlace.highestBidder != this.props.activeAccount) ? 
                              (<div style={{display:"inline"}}><br/><label><strong>Highest bidder: </strong>{rentalPlace.highestBidder}</label></div>) : null}
                              <br/><label><strong> Highest Bid: </strong>{web3.utils.fromWei(rentalPlace.highestBid)} Ether</label>
                              <br/><label><strong> Current minimum bid: </strong>{(Math.max(parseFloat(web3.utils.fromWei(rentalPlace.currentRent))*(rentalPlace.biddingEndDate - rentalPlace.biddingStartDate+1)+0.001, parseFloat(web3.utils.fromWei(rentalPlace.highestBid))+0.001)).toPrecision(3)} Ether</label>
                              <br/>
                              <form
                                id="rentingForm"
                                onSubmit={(event) => {
                                event.preventDefault();
                                console.log(parseFloat(web3.utils.fromWei(rentalPlace.highestBid)))
                                console.log(rentalPlace.rentalPlaceID)
                                const newBid = this.newBid[rentalPlace.rentalPlaceID].value;
                                console.log(newBid);
                                this.props.bidForPlace(rentalPlace.rentalPlaceID, newBid);
                                }
                                }
                                >
                                <br/>
                                <input
                                    placeholder="Your bid"
                                    id={"newRent"+rentalPlace.rentalPlaceID}
                                    required={true}
                                    type="number"
                                    step="0.001"
                                    min={Math.max(parseFloat(web3.utils.fromWei(rentalPlace.currentRent))*(rentalPlace.biddingEndDate - rentalPlace.biddingStartDate+1)+0.001, parseFloat(web3.utils.fromWei(rentalPlace.highestBid))+0.001).toPrecision(3)}
                                    ref={(input) => {
                                    this.newBid[rentalPlace.rentalPlaceID] = input; 
                                    }}
                                  />
                                <label id="etherLabel">Ether</label>&nbsp;&nbsp;&nbsp;
                                <Button id={"acceptBiddingButton"+rentalPlace.rentalPlaceID} variant="dark" type="submit">
                                  Place Bid
                                </Button>{' '}
                              </form>
                            </div>) : null}
                        </label>)}
                        {!rentalPlace.isBiddingActive && this.state.showBidInfo && rentalPlace.highestBidder == this.props.activeAccount && rentalPlace.monthOccupancy[rentalPlace.biddingStartDate] == 0? (
                        <div><label><strong> Congrats! You are the highest bidder for this place. Confirm your booking below</strong></label>
                        <form
                          id="rentingForm"
                              onSubmit={(event) => {
                              event.preventDefault();
                              const rentalPlaceID = rentalPlace.rentalPlaceID;
                              const rent = rentalPlace.highestBid;
                              this.props.rentRentalPlace(rentalPlaceID, rent, rentalPlace.biddingStartDate, rentalPlace.biddingEndDate);
                            }}
                          >
                          <br />
                            <Button variant="success" type="submit">
                              Confirm your booking
                            </Button>{' '}
                          </form>
                        </div>
                        ):null}
                        {!rentalPlace.isBiddingActive && this.state.showBidInfo && rentalPlace.highestBidder == this.props.activeAccount && rentalPlace.monthOccupancy[rentalPlace.biddingStartDate] != 0 ? (
                        <div><label><strong> You have already won the bid and confirmed your booking </strong></label></div>
                        ):null}
                        {!rentalPlace.isBiddingActive && this.state.showBidInfo && rentalPlace.highestBidder != this.props.activeAccount ? (
                        <div><label><strong> You lost the bid for this place :(</strong></label>
                        </div>
                        ):null}
                      <br />
                    </div>
                  </td>
                  <td>
                  <label id={"calendarLabel"+ rentalPlace.rentalPlaceID.toString()} hidden={true}>
                  <label><strong>Availability</strong></label><br/>
                    <Calendar id={"rentingCalendar"}
                      minDate={this.state.minDate}
                      maxDate={this.state.maxDate}
                      allowPartialRange={true}
                      selectRange={true}
                      tileDisabled = {({activeStartDate, date, view }) => this.checkOccupancy(rentalPlace.monthOccupancy, date.getDate(), rentalPlace.biddingStartDate, rentalPlace.biddingEndDate)}
                      onChange={this.onStartDateChange}
                      value={[this.state.startDate, this.state.endDate]}
                    />
                  </label>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {this.props.numRentalPlaces <= 0 ? (
          <div id="noneLabel">No rental places available. You can add your own in <b>Add new posting</b> section!</div>
        ):null}
      </div>
    );
  }
}

export default RentalPlaces;
