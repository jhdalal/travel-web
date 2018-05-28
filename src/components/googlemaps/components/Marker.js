import PropTypes from 'prop-types';
import React from 'react';
import _ from 'lodash';
import { TweenMax, Elastic } from 'gsap';
import { areEqualShallow } from '../../../helpers';

/**
* -Marker-
* Marker componenet
**/
export default class Marker extends React.Component {

	animateMarker = () => {

		const elements_fg = _.values(document.querySelectorAll(`.marker-layer img[src*="#marker-fg-${this.props.index}"]`));
		const elements_bg = _.values(document.querySelectorAll(`.marker-layer img[src*="#marker-bg-${this.props.index}"]`));
		const elements = [...elements_fg, ...elements_bg];
		const elements_all = elements.map( (element) => element.parentElement );

		// Stagger
		const delay = 0.3*this.props.index + 0.1;

		this.marker_fg.setOpacity(1);
		this.marker_bg.setOpacity(1);
		TweenMax.fromTo([elements_all], 1.5, {scale: 0.5, opacity: 0}, {scale: 1, opacity: 1, delay: delay, ease: Elastic.easeOut.config(1.75, 0.3)} );
	}

	setMarker = () => {

		const { google } = this.props;

		// Start hidden
		if( !this.props.isEvent ) this.marker_fg.setOpacity(0);
		this.marker_bg.setOpacity(0);

		// Set Position
		const position = {
			lat: parseFloat(this.props.location.lat),
			lng: parseFloat(this.props.location.lng),
		}

		this.marker_bg.setPosition(position);
		this.marker_fg.setPosition(position);

		// Set Icon
		let icon_bg_url, icon_fg_url, size;

		// use just the foreground icon if this marker is for an event
		if( this.props.isEvent ) {

			icon_fg_url = `${window.AWS}/images/location_icon-${this.props.icon}.png`;

			size = new google.maps.Size(55, 55);

		} else {

			let background = this.props.icon + '_bg.png';
			const foreground = this.props.icon;

			// cool, warm, hot, rain
			if ( _.includes(foreground, 'cool') ) {
				background = 'cool_bg.png';
			} else if ( _.includes(foreground, 'warm') ) {
				background = 'warm_bg.png';
			} else if ( _.includes(foreground, 'hot') ) {
				background = 'hot_bg.png';
			} else if ( _.includes(foreground, 'rain') ) {
				background = 'rain_bg.png';
			}

	    icon_bg_url = `${window.AWS}/images/${background}#marker-bg-${this.props.index}`;
	    icon_fg_url = `${window.AWS}/images/${foreground}.gif#marker-fg-${this.props.index}`;

			size = new google.maps.Size(70, 70);
		}

		const icon_bg = {
			url: icon_bg_url,
			size: size,
			scaledSize: size,
		};

		const icon_fg = {
			url: icon_fg_url,
			size: size,
			scaledSize: size,
		};

		// Set Title
		const title = this.props.title ? this.props.title : null;
		this.marker_fg.setTitle(title);

		// Animate marker
		if( !this.props.isEvent ) this.marker_bg.setIcon(icon_bg);
		this.marker_fg.setIcon(icon_fg);

		if( !this.props.isEvent ) setTimeout( () => { this.animateMarker()} , 1000 );
	}

	addMarker = () => {

		const { map, google } = this.props;

		// Background
		const bg_options = {
			map: map,
			optimized: false,
			zIndex: 1,
		};

		// Foreground
		const fg_options = {
			map: map,
			optimized: false,
			anchorPoint: new google.maps.Point(35, 70),
			zIndex: 2,
		};

		this.marker_bg = new google.maps.Marker(bg_options);
		this.marker_fg = new google.maps.Marker(fg_options);

		if( this.props.onClick ) {
			this.marker_fg.addListener( 'click', _.debounce( () => this.props.onClick(this.marker_fg, this.props.index), 200 ) );
		}

		// Wrap in div with class for css
		const markerlayer = new google.maps.OverlayView();
		markerlayer.draw = function () {
			this.getPanes().markerLayer.classList.add('marker-layer');
		};
		markerlayer.setMap(map);

		// Set marker to map
		this.setMarker();
	}

	componentWillUnmount() {

		if (this.marker_fg) {
			this.marker_fg.setMap(null);
		}
		if (this.marker_bg) {
			this.marker_bg.setMap(null);
		}
	}

	componentDidMount() {

		this.addMarker();
	}

	shouldComponentUpdate(nextProps, nextState) {

		// Only update if title, icon or location changes
		const newTitle = nextProps.title !== this.props.title ? true : false;
		const newIcon = nextProps.icon !== this.props.icon ? true : false;
		const newLocation = areEqualShallow(nextProps.location, this.props.location) ? false : true;

		return (newTitle | newIcon | newLocation) ? true : false;
	}

	componentDidUpdate(prevProps) {

		this.setMarker();
	}

	render() {
		return null;
	}
}

Marker.propTypes = {
	index: PropTypes.number.isRequired,
	location: PropTypes.object.isRequired,
	title: PropTypes.string,
	icon: PropTypes.string,
	map: PropTypes.object.isRequired,
	google: PropTypes.object.isRequired,
	onClick: PropTypes.func,
	isEvent: PropTypes.bool,
}
