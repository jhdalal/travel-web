import PropTypes from 'prop-types';
import React from 'react';
import { toFahrenheit } from '../../../helpers';

/**
* -OverlayContent-
* Overlay content
**/
export default class OverlayContent extends React.Component {

	render() {

		const single = this.props.marker;

		return (
			<div className="map-overlay-container">
				<div className="map-overlay-shadow"></div>
				<div className="map-overlay-arrow"></div>
				<div className="map-overlay-colorbg-1"></div>
				<div className="map-overlay-colorbg-2"></div>

				<a className="map-overlay-close" onClick={this.props.closeOverlay}><svg className="icon"><use xlinkHref="#close" /></svg></a>

				<div className="map-overlay-content">

					{/* Heading */}
					<div className="map-overlay-section">
						<h3 className="heading">
							<span className="name">{single.location.name}</span>
							<span className="weather">{single.name}</span>
							<span className="temperature">{single.temperature}&deg;C / {toFahrenheit(single.temperature)}&deg;F</span>
						</h3>
					</div>

					{/* Good for */}
					{ single.good_for &&
						<div className="map-overlay-section">
							<h3 className="heading">What it's good for:</h3>
							<span className="user-content" dangerouslySetInnerHTML={ {__html: single.good_for} } />
						</div>
					}

					{/* Bad for */}
					{ single.bad_for &&
						<div className="map-overlay-section">
							<h3 className="heading">What it's not good for:</h3>
							<span className="user-content" dangerouslySetInnerHTML={ {__html: single.bad_for} } />
						</div>
					}

				</div>

				<a className="map-overlay-timeline-link caps-link" onClick={this.props.goToTimeline}>View {single.month} Events</a>

			</div>
		)
	}
}

OverlayContent.propTypes = {
	marker: PropTypes.object,
	closeOverlay: PropTypes.func,
	goToTimeline: PropTypes.func,
}
