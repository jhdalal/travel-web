import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import _ from 'lodash';
import { Link } from 'react-router';

/**
* -PrevNextEvents-
* Prev and next events
**/
class PrevNextEvents extends React.Component {

	state = {
		prevEvent: null,
		nextEvent: null,
	}

	getNextPrevEvents = () => {

		// Create array which ignores year (and converted to moment)
		const events_without_year = this.props.allEvents.map( event => {
			return {
				...event,
				date_start: moment(event.date_start.date).year(1970),
				date_end: moment(event.date_end.date).year(1970),
			}
		});

		// Sort by start date
		const sorted = _.sortBy(events_without_year, [(event) => moment(event.date_start).valueOf()]);

		// Indexes
		const currentIndex = _.findIndex(sorted, (event) => event.id === this.props.event.id);

		const nextIndex = (currentIndex >= sorted.length) ? 0 : currentIndex + 1;

		const prevIndex = (currentIndex <= 0) ? sorted.length - 1 : currentIndex - 1;

		const nextEvent = sorted[nextIndex];

		const prevEvent = sorted[prevIndex];

		this.setState({
			nextEvent,
			prevEvent,
		});
	}

	// Route to 'event/'
	goToSingle = (e, slug) => {
		e.preventDefault();

		this.props.showLoader().then( () => {
			this.context.router.transitionTo(`/event/${this.props.country}/${slug}`);
		});
	};

	componentWillMount = () => {

		this.getNextPrevEvents();
	}

	componentDidUpdate(prevProps) {

		// New event
		if ( prevProps.event.id !== this.props.event.id ) {
			this.getNextPrevEvents();
		}
	}

	render() {

		const { prevEvent, nextEvent } = this.state;

		return (
			<ul className="prev-next-events">
				{ prevEvent &&
					<Event
						event={prevEvent}
						country={this.props.country}
						type="prev"
						goToSingle={this.goToSingle}
					/>
				}

				{ nextEvent &&
					<Event
						event={nextEvent}
						country={this.props.country}
						type="next"
						goToSingle={this.goToSingle}
					/>
				}
			</ul>
		);
	}
}

const Event = ({
	event,
	country,
	type,
	goToSingle,
}) => {

	const slug = event.slug;
	const icon = (type === 'next') ? '#right_arrow' : '#left_arrow';

	return (
		<li className={`${type}-event`}>
			<Link onClick={ e => goToSingle(e, slug) } to={`/event/${country}/${slug}`}>

				<div className="prev-next-events-direction">
					<div className="btn-sml">
						<svg><use xlinkHref={icon}/></svg>
					</div>
					<div className="text">{type}</div>
				</div>

				<h4 className="prev-next-events-title">
					{event.name}
				</h4>

				<div className="prev-next-events-image">
					<img src={event.thumbnail_url} alt={event.name} />
				</div>

			</Link>
		</li>
	)
}

PrevNextEvents.contextTypes = {
	router: PropTypes.object
}

PrevNextEvents.propTypes = {
	country: PropTypes.string.isRequired,
	event: PropTypes.object.isRequired,
	allEvents: PropTypes.array.isRequired,
	showLoader: PropTypes.func.isRequired,
}

export default PrevNextEvents;
