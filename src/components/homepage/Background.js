import PropTypes from 'prop-types';
import React from 'react';
import BackgroundJapan from './BackgroundJapan.js';
import BackgroundVietnam from './BackgroundVietnam.js';
import BackgroundBurma from './BackgroundBurma.js';

class Background extends React.Component {

	render() {

		return (
			<div className="bg-component-wrapper">
				<BackgroundJapan country={this.props.country} />
				<BackgroundVietnam country={this.props.country} />
				<BackgroundBurma country={this.props.country} />
			</div>
		)
	}
}

Background.propTypes = {
	country: PropTypes.string.isRequired
}

export default Background;
