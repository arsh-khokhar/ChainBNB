import React, {Component, useState, setShow} from 'react';
import {Calendar} from 'react-calendar';
import {Modal, Alert, Button} from 'react-bootstrap';
import 'react-calendar/dist/Calendar.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import web3 from 'web3';
import './RentalPostingsManager.css';
const monthNames = ["January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

class RentalPostingsManager extends Component {
  
  constructor(props) {
    super(props);
    this.state = {
		datesSelected: false,
		minDate: new Date(new Date().getFullYear(), new Date().getMonth()+1, 1),
		maxDate: new Date(new Date().getFullYear(), new Date().getMonth()+2, 0),
		startDate: new Date(new Date().getFullYear(), new Date().getMonth()+1, 1),
		endDate: null,
		activeRow: 0,
		showBidInfo: false,
    };
    this.checkOccupancy = this.checkOccupancy.bind(this);
	this.enableBidding = this.enableBidding.bind(this);
	this.newRent = {};
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

  checkOccupancy(occupancyString, date) {
    return occupancyString[date-1] != 0;
  }

  enableBidding(id) {  
	document.getElementById('enableBiddingButton'+id.toString()).hidden = true;  
	document.getElementById('confirmBiddingButton'+id.toString()).hidden = false;
	document.getElementById('disabledCalendar'+id.toString()).hidden = true;
	document.getElementById('biddingCalendar'+id.toString()).hidden = false;
  }

  handleBiddingInfoReq(id)
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
	this.setState({showBidInfo: true});
  }

  render() {

    return (
      <div className="RentalPostingsManagerContainer" id="content">
        <h2>Manage your postings</h2>
        <table className="managerTable">
          <tbody id="rentalPlaceList">
            {this.props.rentalPlaces.map((rentalPlace, key) => {
              if (rentalPlace.placeOwner != this.props.activeAccount) {
                return;
              }
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
                      <br />
						<form
							id="rentingForm"
							onSubmit={(event) => {
							event.preventDefault();
							const newRent = this.newRent[rentalPlace.rentalPlaceID].value;
							this.props.updateRentalPlaceRent(rentalPlace.rentalPlaceID, newRent);
							}
						}
						>
						<input
							placeholder="New Rent"
							id={"newRent"+rentalPlace.rentalPlaceID}
							required={true}
							type="number"
							step="0.001"
							min="0.001"
							ref={(input) => {
							this.newRent[rentalPlace.rentalPlaceID] = input; 
							}}
						/>
						<label id="etherLabel">Ether</label>
						<br />
						<br />
						<Button variant="primary" type="submit">
							Update rent
						</Button>{' '}
						</form>
						{ rentalPlace.isBiddingActive ?
						(<div>
							<br />
							<label><strong> Bidding active for dates {rentalPlace.biddingStartDate + " to "+rentalPlace.biddingEndDate + " " + monthNames[new Date().getMonth()+1] + ", " + new Date().getFullYear()}</strong></label>
							{rentalPlace.numberOfBids > 0 ? (
							<div>
								<br/><label><strong> Total Bids: </strong>{rentalPlace.numberOfBids}</label>
								<br/><label><strong> Highest Bidder: </strong>{rentalPlace.highestBidder}</label>
								<br/><label><strong> Highest Bid: </strong>{web3.utils.fromWei(rentalPlace.highestBid)} Ether</label>
								<form
									id="rentingForm"
									onSubmit={(event) => {
									event.preventDefault();
									this.props.acceptBid(rentalPlace.rentalPlaceID)
									}
									}
									>
									<br/>
									<Button id={"acceptBiddingButton"+rentalPlace.rentalPlaceID} variant="dark" type="submit">
										Accept highest bid
									</Button>{' '}
								</form>
							</div>):
							(<div><label><strong>There are currently no bidders.</strong></label></div>)}
						</div>):null}
						{!rentalPlace.isBiddingActive && rentalPlace.highestBid > 0 ? (<div><br/><label><strong>Bidding limit reached for this month</strong></label></div>):null}
						{!rentalPlace.isBiddingActive && rentalPlace.highestBid == 0? (<div>
						<form
							onSubmit={(event) => {
								event.preventDefault();
								this.enableBidding(rentalPlace.rentalPlaceID);
							}}
						>
						<br />
						<Button id={"enableBiddingButton"+rentalPlace.rentalPlaceID} variant="secondary" type="submit">
							Enable Bidding
						</Button>{' '}
						</form>
						<form
							id="rentingForm"
							onSubmit={(event) => {
							event.preventDefault();
							if(this.state.startDate == null || this.state.endDate == null)
                            {
                                return false;
							}
							this.props.putRentalPlaceOnBid(rentalPlace.rentalPlaceID, this.state.startDate.getDate(), this.state.endDate.getDate());
							}
						}
						>
						<Button id={"confirmBiddingButton"+rentalPlace.rentalPlaceID} variant="success" type="submit" hidden={true}>
							Confirm Bidding Dates
						</Button>{' '}
						</form>
						</div>):null}
						</div>
                  </td>
                  <td>
                  <div id={"disabledCalendar"+rentalPlace.rentalPlaceID} hidden={false} style={{pointerEvents: "none"}}>
                  <label><strong>Current Occupancy Status</strong></label><br/>
                    <Calendar id="calendar"
                      minDate={this.state.minDate}
                      maxDate={this.state.maxDate}
                      tileDisabled = {({activeStartDate, date, view }) => this.checkOccupancy(rentalPlace.monthOccupancy, date.getDate())}
                      defaultActiveStartDate={this.state.startDate}
                    />
                    </div>
					<div id={"biddingCalendar"+rentalPlace.rentalPlaceID} hidden={true}>
                  <label><strong>Select date range to bid</strong></label><br/>
				  <Calendar id={"calendar"}
                      minDate={this.state.minDate}
                      maxDate={this.state.maxDate}
                      allowPartialRange={true}
                      selectRange={true}
                      tileDisabled = {({activeStartDate, date, view }) => this.checkOccupancy(rentalPlace.monthOccupancy, date.getDate())}
                      onChange={this.onStartDateChange}
                      value={[this.state.startDate, this.state.endDate]}
                    />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  }
}

export default RentalPostingsManager;
