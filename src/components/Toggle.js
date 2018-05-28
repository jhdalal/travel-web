import PropTypes from 'prop-types';
import React from 'react';
import { Link } from 'react-router';

class Toggle extends React.Component {

	state = {
		currentToggle: (this.props.page === 'homepage') ? 'timeline' : null,
	}

	// Toggle only on homepage, link elsewhere
	handleToggle = (e) => {

		if( this.props.page === 'homepage' ) {
			e.preventDefault();

			const newState = (this.state.currentToggle === 'timeline') ? 'weather' : 'timeline';

			this.setState({
				currentToggle: newState
			});

			this.props.updateToggle(newState);
		}
	}

	componentDidUpdate(prevProps) {

		if( this.props.page !== prevProps.page ) {

			const newState = (this.props.page === 'homepage') ? 'timeline' : this.props.page;

			this.setState({
				currentToggle: newState
			});
		}
	}

	render() {
		return (
			<div className={`toggle-wrapper toggled-${this.state.currentToggle}`}>
				<Link className="timeline-toggle" to={`/timeline/${this.props.country}/${this.props.month}`} onClick={this.handleToggle}>Events</Link>
				<Link className="weather-toggle" to={`/weather/${this.props.country}/${this.props.month}`} onClick={this.handleToggle}>Weather</Link>
			</div>
		)
	}
}

Toggle.propTypes = {
	month: PropTypes.string,
	country: PropTypes.string,
	page: PropTypes.string,
}

Toggle.contextTypes = {
	router: PropTypes.object
}

export default Toggle;
