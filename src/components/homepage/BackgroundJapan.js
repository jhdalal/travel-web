import PropTypes from 'prop-types';
import React from 'react';

class BackgroundJapan extends React.Component {

	render() {

		return (
			<div className={`bg-effect japan-effect country-${this.props.country}`}>
				<span className="blossom"></span>
				<span className="blossom"></span>
				<span className="blossom"></span>
				<span className="blossom"></span>
				<span className="blossom"></span>
				<span className="blossom"></span>
				<span className="blossom"></span>
				<span className="blossom"></span>
				<span className="blossom"></span>
				<span className="blossom"></span>
				<span className="blossom"></span>
				<span className="blossom"></span>
				<span className="blossom"></span>
				<span className="blossom"></span>
				<span className="blossom"></span>
			</div>
		)
	}
}

BackgroundJapan.propTypes = {
	country: PropTypes.string.isRequired
}

export default BackgroundJapan;
