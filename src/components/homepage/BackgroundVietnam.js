import PropTypes from 'prop-types';
import React from 'react';

class BackgroundVietnam extends React.Component {

	render() {

		return (
			<div className={`bg-effect vietnam-effect country-${this.props.country}`}></div>
		)
	}
}

BackgroundVietnam.propTypes = {
	country: PropTypes.string.isRequired
}

export default BackgroundVietnam;
