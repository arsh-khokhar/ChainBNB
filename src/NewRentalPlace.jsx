import React, {Component} from 'react';
import {Button} from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './NewRentalPlace.css';
const IPFS = require('ipfs-api');
const ipfs = new IPFS({host: 'ipfs.infura.io', port: 5001, protocol: 'https'});

class NewRentalPlace extends Component {
  constructor(props) {
    super(props);
    this.state = {
      imageBuffer: null,
      imageIPFShash: null,
    };
    this.previewAndProcessImage = this.previewAndProcessImage.bind(this);
  }

  previewAndProcessImage(event) {
    event.preventDefault();
    const imageFile = event.target.files[0];
    const reader = new window.FileReader();
    reader.readAsArrayBuffer(imageFile);
    reader.onloadend = () => {
      this.setState({imageBuffer: Buffer(reader.result)});
      console.log('Buffer', this.state.imageBuffer);
      document.getElementById('imagePreview').hidden = false;
      document.getElementById('imagePreview').src =
        'data:image/jpg;base64,' + this.state.imageBuffer.toString('base64');
    };
  }

  render() {
    return (
      <div className="newRentalPlaceContainer" id="content">
        <h2>Add new Rental property</h2>
        <br />
        <form
          onSubmit={(event) => {
            event.preventDefault();
            ipfs.files.add(this.state.imageBuffer, (error, result) => {
              if (error) {
                console.log(error);
                return;
              }
              this.setState({imageIPFShash: result[0].hash});
              console.log('Ipfs hash', this.state.imageIPFShash);
              const placeAddress = this.newPlaceAddress.value;
              const baseRent = this.newPlaceBaseRent.value;
              const imageHash = this.state.imageIPFShash;
              this.props.addNewRentalPlace(baseRent, placeAddress, imageHash);
            });
          }}
        >
          <input
            placeholder="Address"
            id="newPlaceAddress"
            required={true}
            type="text"
            ref={(input) => {
              this.newPlaceAddress = input;
            }}
          />
          &nbsp; &nbsp;
          <input
            placeholder="Rent"
            id="newPlaceRent"
            required={true}
            type="number"
            step="0.001"
            min="0.001"
            ref={(input) => {
              this.newPlaceBaseRent = input;
            }}
          />
          <label id="etherLabel">Ether</label>
          <br />
          <br />
          <label id="imagePreviewLabel">
            <h5 id="imagePreviewHeader">Upload a picture of your posting</h5>
            <img id="imagePreview" alt="preview" height="350" hidden={true} />
            <br />
            <input
              id="newPlaceImage"
              required={true}
              type="file"
              onChange={this.previewAndProcessImage}
            />
          </label>
          <br />
          <br />
          <Button variant="primary" type="submit" size="lg">
            Add rental place
          </Button>{' '}
        </form>
      </div>
    );
  }
}

export default NewRentalPlace;
