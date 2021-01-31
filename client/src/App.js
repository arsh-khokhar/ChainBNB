import React, {Component} from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  NavLink,
  Redirect,
} from 'react-router-dom';
import {Nav, Navbar} from 'react-bootstrap';
import ChainBNBContract from './contracts/ChainBNB.json';
import getWeb3 from './getWeb3';
import web3 from 'web3';
import RentalPlaces from './RentalPlaces.jsx';
import NewRentalPlace from './NewRentalPlace.jsx';
import RentalPostingsManager from './RentalPostingsManager.jsx';
import Loader from './Loader.jsx';
import Footer from './Footer.jsx';

import './App.css';

class App extends Component {
  constructor (props) {
		super (props);
		this.state = {
		accounts: [],
		rentalPlaceCount: 0,
		rentalPlaces: [],
		loading: true,
		redirect: null,
		};
  	}

  componentDidMount = async () => {
    try {
		// Get network provider and web3 instance.
		const web3 = await getWeb3 ();

		// Use web3 to get the user's accounts.
		const accounts = await web3.eth.getAccounts ();

		// Get the contract instance.
		const networkId = await web3.eth.net.getId ();
		const deployedNetwork = ChainBNBContract.networks[networkId];
		const instance = new web3.eth.Contract (
			ChainBNBContract.abi,
			deployedNetwork && deployedNetwork.address
		);

		// Set web3, accounts, and contract to the state
		this.setState ({web3, accounts, contract: instance});
		this.getrentalPlaces ();
    } catch (error) {
		// Catch any errors for any of the above operations.
		alert (
			'Failed to load web3, accounts, or contract. Check console for details.'
		);
		console.error (error);
		}
  	};

  	getrentalPlaces = async () => {
		this.setState ({rentalPlaces: []});
		const {contract} = this.state;
		const numrentalPlaces = await contract.methods
		.getNumRentalPlaces ()
		.call ();
		for (var i = 1; i <= numrentalPlaces; i++) {
		const rentalPlace = await contract.methods.rentalPlaces (i).call ();
		this.setState ({
			rentalPlaces: [...this.state.rentalPlaces, rentalPlace],
		});
		}
		this.setState ({loading: false});
  	};
  
  	addNewRentalPlace = async (rent, placeAddress, imageIPFShash) => {
		rent *= 1000;
		const {accounts, contract} = this.state;
		this.setState ({loading: true});
		var occupancy = "0".repeat(31);
		contract.methods
		.addRentalPlace (rent, placeAddress, imageIPFShash, occupancy)
		.send ({from: accounts[0]})
		.once ('receipt', receipt => {
			this.setState ({loading: false});
			this.getrentalPlaces ();
			this.setState ({redirect: "/ManagePostings"});
		});
  	};

  	updateRentalPlaceRent = async (rentalPlaceID, newRent) => {
    console.log(rentalPlaceID);
    console.log(newRent);
    newRent *= 1000;
    const {accounts, contract} = this.state;
    this.setState ({loading: true});
    contract.methods.updateRent(rentalPlaceID, newRent).send ({from: accounts[0]})
      .once ('receipt', receipt => {
        this.setState ({loading: false});
        this.getrentalPlaces ();
        this.setState ({redirect: "/ManagePostings"});
      });
  	}

  	putRentalPlaceOnBid = async (rentalPlaceID, startDate, endDate) => {
	  	console.log(rentalPlaceID);
	  	console.log(startDate);
	  	console.log(endDate);
	  	const {accounts, contract} = this.state;
    	this.setState ({loading: true});
    	contract.methods.changeBiddingStatus(rentalPlaceID, true, startDate, endDate).send ({from: accounts[0]})
      	.once ('receipt', receipt => {
        this.setState ({loading: false});
        this.getrentalPlaces ();
        this.setState ({redirect: "/ManagePostings"});
      	});
  	}

  	getmyOccupancy = async (rentalPlaceID) => {
    	const {accounts, contract} = this.state;
    	const myoccupancy = await contract.methods.getRenterOccupancy(rentalPlaceID, accounts[0]).call();
    	return myoccupancy;
  	}

  rentRentalPlace = async (rentalPlaceID, rent, rentingStart, rentingEnd) => {
    const {accounts, contract} = this.state;
    rent = rent*(rentingEnd-rentingStart+1)
    this.setState ({loading: true});
    contract.methods
      .rentPlace (rentalPlaceID, rentingStart, rentingEnd)
      .send ({from: accounts[0], value: rent.toString ()})
      .once ('receipt', receipt => {
        this.setState ({loading: false});
        this.getrentalPlaces ();
        this.setState ({redirect: "/AvailableRentals"});
      });
  	};

	bidForPlace = async (rentalPlaceID, bidAmt, bidStartDate, bidEndDate) => {
    const {accounts, contract} = this.state;
    this.setState ({loading: true});
    contract.methods
      .registerBid (rentalPlaceID, web3.utils.toWei(bidAmt).toString())
      .send ({from: accounts[0]})
      .once ('receipt', receipt => {
        this.setState ({loading: false});
        this.getrentalPlaces ();
        this.setState ({redirect: "/AvailableRentals"});
      });
  };

  	getMyTotalBid = async (rentalPlaceID) => {
		const {accounts, contract} = this.state;
		const myTotalBid = await contract.methods.getBiddersBid(rentalPlaceID, accounts[0]).call();
		return myTotalBid;
  	}

  	acceptBid = async (rentalPlaceID) => {
		const {accounts, contract} = this.state;
		contract.methods.closeBids(rentalPlaceID).send ({from: accounts[0]})
		.once ('receipt', receipt => {
			this.setState ({loading: false});
			this.getrentalPlaces ();
			this.setState ({redirect: "/ManagePostings"});
		});
  	}

    render() {
      if (this.state.redirect) {
        var redirectTo = this.state.redirect; 
        this.setState({redirect: null})
        return (<Redirect to={redirectTo}/>)
      }
      return (
        <>
          <Router>
            <Navbar
              bg="light"
              expand="lg"
            >
              <Navbar.Brand href="/">
              ChainBNB
              </Navbar.Brand>
              <Navbar.Toggle aria-controls="basic-navbar-nav" />
              <Navbar.Collapse id="basic-navbar-nav">
                <Nav className="ml-auto">
                  <Nav.Link href="/AvailableRentals">
                  All Rental Postings
                  </Nav.Link>
                  <Nav.Link href="/NewPosting">
                  Add new posting
                  </Nav.Link>
                  <Nav.Link href="/ManagePostings">
                  Manage your postings
                  </Nav.Link>
                </Nav>
              </Navbar.Collapse>
            </Navbar>
            <Switch>
              <Route exact path="/" name="/AvailableRentals">
                <Redirect to={"/AvailableRentals"}/>
              </Route>
              <Route exact path="/AvailableRentals" name="/AvailableRentals">
                <RentalPlaces
                  rentalPlaces={this.state.rentalPlaces}
                  numRentalPlaces={this.state.rentalPlaces.length}
                  activeAccount={this.state.accounts[0]}
                  rentRentalPlace={this.rentRentalPlace}
                  getmyOccupancy={this.getmyOccupancy}
				  bidForPlace={this.bidForPlace}
				  getMyTotalBid={this.getMyTotalBid}
                />
              </Route>
              <Route exact path="/NewPosting" name="/NewPosting">
                <NewRentalPlace
                  addNewRentalPlace={this.addNewRentalPlace}
                />
              </Route>
              <Route exact path="/ManagePostings" name="/ManagePostings">
              <RentalPostingsManager
                rentalPlaces={this.state.rentalPlaces}
                activeAccount={this.state.accounts[0]}
                numRentalPlaces={this.state.rentalPlaces.length}
                updateRentalPlaceRent={this.updateRentalPlaceRent}
				putRentalPlaceOnBid={this.putRentalPlaceOnBid}
				acceptBid={this.acceptBid}
              />
              </Route>
            </Switch>
          </Router>
        </>
      );
    }
}

export default App;
