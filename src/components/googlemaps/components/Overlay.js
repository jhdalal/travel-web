import PropTypes from 'prop-types';
import React from 'react';
import ReactDOM from 'react-dom';
import _ from 'lodash';
import { TimelineMax, TweenMax, Power2, Power3 } from 'gsap';
import { areEqualShallow } from '../../../helpers';

/**
* -Overlay-
* Overlay componenet (custom infowindow)
**/
export default class Overlay extends React.Component {

	// Updates position of map and overlay on show and on zoom or marker change
	setPosition = (bool) => {

		const { map } = this.props;

		if(! _.isEmpty(this.props.googlemarker) ) {

			const overlayProjection = this.infoOverlay.getProjection();

			// Position plus anchor (offset) - center on mobile, to marker on desktop
			let tl;
			if ( window.innerWidth > 999 ) {

				const marker_position = this.props.googlemarker.getPosition();
				const marker_anchor = this.props.googlemarker.anchorPoint;

				tl = overlayProjection.fromLatLngToDivPixel(marker_position);
				tl.x += marker_anchor.x;
				tl.y -= marker_anchor.y;

			} else {

				const map_position = map.getCenter();

				tl = overlayProjection.fromLatLngToDivPixel(map_position);

			}

			// If called with "true", animate overlay position and don't move map
			if (bool) {

				// Overlay
				TweenMax.to(this.overlayContainer, 0.2, { left: tl.x + 'px', top: tl.y + 'px', ease: Power3.eastOut });

			// If not zoom (new marker), set (don't animate) overlay position and move map
			} else {

				// Overlay
				this.overlayContainer.style.left = tl.x + 'px';
				this.overlayContainer.style.top = tl.y + 'px';

				// Map position - pan to center of overlay on desktop
				if ( window.innerWidth > 999 ) {

					tl.x += (this.overlayContainer.offsetWidth + 20)/2;
					tl.y += (this.overlayContainer.offsetHeight === 0) ? 240 : this.overlayContainer.offsetHeight/2;
					const ne = overlayProjection.fromDivPixelToLatLng(tl);

					map.panTo(ne);
				}
			}
		}
	}

	// Show in correct position and content
	showOverlay = () => {

		this.setPosition(true);

		// Content
		const { children } = this.props;
		ReactDOM.render(React.Children.only(children), this.overlayContainer);

		// Show
		return new Promise((resolve, reject) => {

			TweenMax.killChildTweensOf(this.overlayContainer);

			const overlayIn = new TimelineMax({
			 	onComplete: () => {
					resolve(this);
				}
		 	});
			overlayIn.set(this.overlayContainer, { autoAlpha: 1 });
			overlayIn.set('.map-overlay-colorbg-1', { autoAlpha: 1.5 });
			overlayIn.fromTo('.map-overlay-colorbg-1', 0.5, { scaleX: 0 }, { scaleX: 1, ease: Power2.easeInOut });
			overlayIn.fromTo('.map-overlay-colorbg-2', 0.5, { scaleX: 0 }, { scaleX: 1, ease: Power2.easeInOut }, '-=0.05');
			overlayIn.fromTo('.map-overlay-arrow', 0.5, { autoAlpha: 0, x: '100%' }, { autoAlpha: 1, x: '0%', ease: Power2.easeInOut }, '-=0.1');
			overlayIn.to('.map-overlay-colorbg-1', 0.3, { autoAlpha: 0 }, '-=0.5');
			overlayIn.fromTo('.map-overlay-shadow', 0.2, { autoAlpha: 0 }, { autoAlpha: 1 }, '-=0.3');
			overlayIn.staggerFromTo('.map-overlay-section', 0.35, { autoAlpha: 0 }, { autoAlpha: 1, ease: Power2.easeInOut }, 0.15);
			overlayIn.fromTo(['.map-overlay-close', '.map-overlay-timeline-link'], 0.35, { autoAlpha: 0 }, { autoAlpha: 1, ease: Power2.easeInOut }, '-=0.15');
		});
	}

	hideOverlay = () => {

		// Resolve if already, or when, hidden
		return new Promise((resolve, reject) => {

			const isHidden = ( this.overlayContainer.style.opacity === '0' ) ? true : false;

			if( isHidden ) {

				resolve(this);

			} else {

				TweenMax.killChildTweensOf(this.overlayContainer);

				const overlayOut = new TimelineMax({
					onComplete: () => {
						resolve(this);
						overlayOut.set(this.overlayContainer, { autoAlpha: 0 });
					}
			 	});
				overlayOut.to(['.map-overlay-section', '.map-overlay-close', '.map-overlay-timeline-link'], 0.35, { autoAlpha: 0, ease: Power2.easeInOut });
				overlayOut.to('.map-overlay-shadow', 0.25, { autoAlpha: 0 }, { autoAlpha: 1 });
				overlayOut.to('.map-overlay-arrow', 0.5, { autoAlpha: 0, x: '100%', ease: Power2.easeInOut });
				overlayOut.set('.map-overlay-colorbg-1', { autoAlpha: 1.5 });
				overlayOut.fromTo('.map-overlay-colorbg-2', 0.5, { scaleX: 1 }, { scaleX: 0, ease: Power2.easeInOut }, '-=0.1');
				overlayOut.fromTo('.map-overlay-colorbg-1', 0.5, { scaleX: 1 }, { scaleX: 0, ease: Power2.easeInOut });
				overlayOut.timeScale(1.75);
			}
		});
	}

	updateMarker = () => {

		this.hideOverlay()
			.then( () => {
				this.showOverlay();
			});
	}

	// Create overlay and add to map
	addInfoOverlay = () => {

		const { map, google } = this.props;

		this.infoOverlay = new google.maps.OverlayView();

		this.infoOverlay.setMap(map);

		this.infoOverlay.onAdd = () => {

			const div = document.createElement('div');
			div.classList.add('map-overlay');
			this.overlayContainer = div;

			TweenMax.set(this.overlayContainer, { autoAlpha: 0 });
		};

		this.infoOverlay.draw = () => {
			const panes = this.infoOverlay.getPanes();
  			panes.floatPane.appendChild(this.overlayContainer);
		};

		// Watch for zoom change to update position again each time map is zoomed
		map.addListener('zoom_changed', () => {
			google.maps.event.addListenerOnce(map, 'idle', () => this.setPosition(true));
		});

		// Hide info window on map pan
		map.addListener('dragend', () => {
			this.hideOverlay(); // NB: this makes the marker unclickable until you click another
			// this.updateMarker();
		});
 	}

	componentDidMount() {

		this.addInfoOverlay();
	}

	componentDidUpdate(prevProps, prevState) {

		// Update marker content or position
		const newMarker = areEqualShallow(prevProps.marker, this.props.marker) ? false : true;

		// Visibility
		if (this.props.visible !== prevProps.visible) {

			if( this.props.visible === true ){

				this.showOverlay();

			} else {

				this.hideOverlay();
			}

		} else if ( newMarker ) {

			this.updateMarker();
		}
	}

	render() {
		return null;
	}
}

Overlay.propTypes = {
	map: PropTypes.object.isRequired,
	googlemarker: PropTypes.object,
	marker: PropTypes.object,
	google: PropTypes.object.isRequired,
	visible: PropTypes.bool,
}

Overlay.defaultProps = {
	visible: true,
	content: '',
}
