import PropTypes from 'prop-types';
import React from 'react';

class BackgroundBurma extends React.Component {

	render() {

		return (
			<div className={`bg-effect burma-effect country-${this.props.country}`}>
				<span className="mist"></span>
				<span className="mist"></span>
				<span className="mist"></span>
				<span className="mist"></span>
				<span className="mist"></span>
				<span className="mist"></span>
				<span className="mist"></span>
				<span className="mist"></span>
				<span className="mist"></span>
				<span className="mist"></span>
				<span className="mist"></span>
				<span className="mist"></span>
				<span className="mist"></span>
				<span className="mist"></span>
				<span className="mist"></span>
			</div>
		)
	}
}

BackgroundBurma.propTypes = {
	country: PropTypes.string.isRequired
}

export default BackgroundBurma;
