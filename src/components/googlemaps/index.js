import PropTypes from 'prop-types';
import React from 'react';
import GoogleMapsLoader from 'google-maps';

import _ from 'lodash';
import { areEqualShallow } from '../../helpers';

import Marker from './components/Marker';
import Overlay from './components/Overlay';
import OverlayContent from './components/OverlayContent';
import GroundOverlay from './components/GroundOverlay';
import MapControls from './components/MapControls';

GoogleMapsLoader.KEY = 'AIzaSyBQfKHe6ibz_4D18UlK3jpRObLoDhrVNSU';
GoogleMapsLoader.LIBRARIES = ['geometry', 'places'];

/**
* -Map-
* Map componenet
**/
export default class Map extends React.Component {

	state = {
		mapReady: false,
		google: {},
		map: {},
		currentLocation: {
			lat: parseFloat(this.props.initialLocation.lat),
			lng: parseFloat(this.props.initialLocation.lng)
		},
	};

	fitBounds = () => {

		const {google} = this.state;
		let bounds = new google.maps.LatLngBounds();

		// Fit bounds to initial bounds if object
		if(typeof this.props.fitBounds === 'object'){

			bounds.extend({
				lat: parseFloat(this.props.fitBounds.ne.lat),
				lng: parseFloat(this.props.fitBounds.ne.lng),
			});
			bounds.extend({
				lat: parseFloat(this.props.fitBounds.sw.lat),
				lng: parseFloat(this.props.fitBounds.sw.lng),
			});

			this.state.map.fitBounds(bounds);
		}

		// Fit all markers if fit bounds is true
		if(typeof this.props.fitBounds === 'boolean' && this.props.fitBounds === true){

			this.props.markers.forEach( marker => {

				bounds.extend({
					lat: parseFloat(marker.location.lat),
					lng: parseFloat(marker.location.lng),
				});
			});

			this.state.map.fitBounds(bounds);
		}

		// Maximum zoom on bounds
		google.maps.event.addListenerOnce(this.state.map, 'bounds_changed', function() {
			if (this.getZoom() > 6){
				this.setZoom(6);
			}
		});
	}

	loadMap = () => {

		return new Promise((resolve, reject) => {

			GoogleMapsLoader.load( google => {

				const map_id = this.refs.map;

				let map_options = {
					center: {
						lat: this.state.currentLocation.lat,
						lng: this.state.currentLocation.lng
					},
					backgroundColor: 'hsla(0, 0%, 0%, 0)',
					zoom: parseInt(this.props.zoom, 10),
					mapTypeId: 'hybrid'
				};

				// Remove all controls if custom controls set to true
				map_options.disableDefaultUI = this.props.customControls ? map_options.disableDefaultUI = true : false;

				// Merge options if passed
				map_options = {...map_options, ...this.props.options};

				this.setState({
					mapReady: true,
					google,
					map: new google.maps.Map(map_id, map_options),
				}, () => {

					this.props.reportReady && this.props.reportReady('map');
				});

				resolve(google);
			});
		});
	};

	componentDidMount() {

		this.loadMap().then(() => this.fitBounds());
	}

	componentDidUpdate(prevProps, prevState) {

		// Fit Bounds if changed and fitting to markers
		if( this.props.fitBounds && this.state.mapReady ){
			if(typeof this.props.fitBounds === 'boolean' && (this.props.markers !== prevProps.markers)){
				this.fitBounds();
			}
		}

		// New location (country)
		const newLocation = areEqualShallow(prevProps.initialLocation, this.props.initialLocation) ? false : true;
		if( newLocation) {

			this.state.map.panTo(this.props.initialLocation);

			if (this.state.map.getZoom() > 6){
        		this.state.map.setZoom(6);
      		}
		}
	}

	render() {

		return (
			<div ref="map" className={this.props.class}>
				Loading...

				{/* Markers */}
				{ this.state.mapReady && this.props.markers && this.props.markers.length > 0 && this.props.isReady &&

					// Each marker contains information and multiple locations
					Object.keys(this.props.markers).map( (key) => {

						const marker = this.props.markers[key];

						const new_location = {
							lat: marker.location.lat,
							lng: marker.location.lng
						};

						return <Marker
							key={key}
							index={parseInt(key, 10)}
							location={new_location}
							title={marker.title}
							icon={marker.icon}
							map={this.state.map}
							google={this.state.google}
							onClick={this.props.handleMarkerClick}
							isEvent={this.props.isEvent}
						/>;
					})
				}

				{/* Overlay (Custom InfoWindow) */}
				{ this.state.mapReady && this.props.hasOverlay && this.props.isReady &&

					<Overlay
						map={this.state.map}
						google={this.state.google}
						marker={this.props.activeMarker}
						googlemarker={this.props.activeGoogleMarker}
						visible={this.props.overlayVisible}
					>
						<OverlayContent
							marker={this.props.activeMarker}
							googlemarker={this.props.activeGoogleMarker}
							closeOverlay={this.props.closeOverlay}
							goToTimeline={this.props.goToTimeline}
						/>
					</Overlay>
				}

				{/* Ground Overlay (country SVG's) */}
				{ this.state.mapReady && this.props.isReady && !this.props.isEvent &&

					<GroundOverlay
						map={this.state.map}
						google={this.state.google}
						country={this.props.country}
					/>
				}

				{/* Custom Controls */}
				{ this.state.mapReady && this.props.customControls &&
					<MapControls
						map={this.state.map}
					/>
				}

			</div>
		)
	}
}

Map.propTypes = {
	class: PropTypes.string,
	markers: PropTypes.array,
	initialLocation: PropTypes.object,
	zoom: PropTypes.number,
	fitBounds: PropTypes.oneOfType([
		PropTypes.bool,
		PropTypes.object,
	]),
	customControls: PropTypes.bool,
	goToTimeline: PropTypes.func,
	hideSummary: PropTypes.func,
	showSummary: PropTypes.func,
	closeOverlay: PropTypes.func,
	handleMarkerClick: PropTypes.func,
	hasOverlay: PropTypes.bool,
	overlayVisible: PropTypes.bool,
	activeMarker: PropTypes.object,
	activeGoogleMarker: PropTypes.object,
	options: PropTypes.object,
	reportReady: PropTypes.func,
	isReady: PropTypes.bool,
	isEvent: PropTypes.bool,
	country: PropTypes.string,
}

Map.defaultProps = {
	class: 'map',
	initialLocation: {
		lat: 51.454549,
		lng: -2.587919
	},
	zoom: 10,
	fitBounds: false,
	customControls: false,
	hasOverlay: false,
	overlayVisible: false,
	isReady: false,
	isEvent: false,
}
