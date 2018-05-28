import PropTypes from 'prop-types';
import React from 'react';
import _ from 'lodash';

import countries_data from '../../../data/countries';

/**
* -GroundOverlay-
* GroundOverlayOverlay componenet (country overlays)
**/
export default class GroundOverlay extends React.Component {

	state = {
	  country: this.props.country,
	}

	hideOverlay = () => {

		this.groundOverlay && this.groundOverlay.setMap(null);
	}

	// Create overlay and add to map
	addOverlay = () => {

		const { map, google } = this.props;

		const country = this.state.country.toLowerCase();

		const vcl = ['vietnam', 'cambodia', 'laos'];

		// Show all on mobile, specific country on desktop
		const countries = ( (window.innerWidth < 1000) && ( _.find(vcl, e => e === country) ) ) ? vcl : [country];

		let paths = countries.map( country => countries_data[country].borderPath.map( path => google.maps.geometry.encoding.decodePath(path) ));
		paths = paths.reduce( (acc, val) => acc.concat(val));

		let fillColor;
		switch ( country ) {
			case 'vietnam':
			case 'cambodia':
			case 'laos':
				fillColor = '#ec7cae';
				break;
			case 'burma':
				fillColor = '#f6a741';
				break;
			case 'japan':
			default:
				fillColor = '#cfcf36';
				break;
		}

		this.groundOverlay = new google.maps.Polygon({
			paths,
			strokeWeight: 0,
			fillColor,
			fillOpacity: .3
		});

		this.groundOverlay.setMap(map);
	}

	componentDidMount() {

		this.addOverlay();

		window.addEventListener('resize', () => {
			this.hideOverlay();
			this.addOverlay();
		});
	}

	componentDidUpdate(prevProps) {

		const newCountry = ! _.isEqual(prevProps.country, this.props.country);
		if ( newCountry ) {

			this.setState({
				country: this.props.country
			}, () => {

				this.hideOverlay();
				this.addOverlay();
			});
		}
	}

	componentWillUnmount() {

		this.hideOverlay()

		window.removeEventListener('resize', () => {
			this.hideOverlay();
			this.addOverlay();
		});
	}

	render() {
		return null;
	}
}

GroundOverlay.propTypes = {
	map: PropTypes.object.isRequired,
	googlemarker: PropTypes.object,
	country: PropTypes.string,
}

GroundOverlay.defaultProps = {
	country: 'japan',
}
