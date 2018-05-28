import PropTypes from 'prop-types';
import React from 'react';

/**
* -MapControls-
* Custom Map Controls page
**/
class MapControls extends React.Component {

	handleZoom = (e, direction) => {
		e.preventDefault();

		const current_zoom = this.props.map.getZoom();

		this.props.map.setZoom( direction === 'in' ? current_zoom + 1 : current_zoom - 1 );
	};

	render() {

		return (
			<div className="map-controls">

				{/* Zoom */}
				<ul className="zoom">
					<li>
						<a className="btn-sml" onClick={ e => this.handleZoom(e, 'in') }>
							<svg width="10.25px" height="10.249px" viewBox="0 0 10.25 10.249">
								<path d="M4.125 1v8.249a1 1 0 1 0 2 0V1a1 1 0 0 0-2 0" />
								<path d="M1 6.125h8.25a1 1 0 0 0 0-2H1a1 1 0 1 0 0 2" />
							</svg>
						</a>
					</li>
					<li>
						<a className="btn-sml" onClick={ e => this.handleZoom(e, 'out') }>
							<svg width="10.25px" height="2px" viewBox="0 0 10.25 2">
								<path d="M1 2h8.25a1 1 0 0 0 0-2H1a1 1 0 1 0 0 2"/>
							</svg>
						</a>
					</li>
				</ul>
			</div>
		)
	}
}

MapControls.propTypes = {
	map: PropTypes.object.isRequired,
}

export default MapControls;
