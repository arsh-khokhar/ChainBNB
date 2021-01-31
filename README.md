# ChainBNB
ChainBNB is a peer-to-peer distributed property renting application based on the ethereum blockchain and the IPFS distributed file system.

# Features
* Secure login using the ethereum accounts
* Putting a property available for rental
* Renting a property for multiple dates
* Enabling bidding on the rental place
* Bidding on the rental places
* Updating managing rental properties (Accepting bids, updating rents etc.

## Local setup instructions

In order to test the app locally without spending actual ether, you would need to install [Ganache](https://www.trufflesuite.com/ganache) and the metamask extension for your browser. After setting up your local accounts and test network in metamask, navigate to the the main directory, and run the command **truffle migrate --reset**. This will deploy the contracts. Once the contracts are deployed, go to the client directory and run the command **npm run start** to start the application. The rental properties and information loaded in the app will be specific to the account currently selected. You can switch between multiple accounts via metamask to try out the features.

> **_NOTE:_**  I am not actively keeping up with the project dependencies, and since technologies like web3 and React frequent updates, you might run into some deprecated things. If you find any fatal dependency issues, feel free to create an issue and I will take a look.
