import PropTypes from 'prop-types';
import React from 'react';
import ReactDOM from 'react-dom';
import { TweenMax, Power3 } from 'gsap';
import { ImageHelper } from 'react-preload';
import moment from 'moment';
import Measure from 'react-measure';
import _ from 'lodash';
import EventItem from './EventItem';
import { getPosts, wait } from '../../helpers'
import MonthSummary from '../MonthSummary';
import UAParser from 'ua-parser-js';

const Draggable = window.Draggable;

/**
* -EventList-
* Timeline page - event list
**/
class EventList extends React.Component {

	state = {
		currentMonth: this.props.month,
		country: this.props.country,
		allEvents: {},
		currentEvents: {},
		nextEvents: {},
		elementWidth: 1,
		windowWidth: window.innerWidth,
		dragCursor: false,
		initialPositionSet: false,
		showDragInstruction: false,
	};

	// Preload Images
	loadImages = () => {

		return new Promise((resolve, reject) => {

			const preloadImages = Object
				.keys(this.state.nextEvents)
				.map(key => this.state.nextEvents[key].thumbnail_url);

			ImageHelper
				.loadImages(preloadImages)
				.then(resolve)
				.catch( (error) => reject(error) );
		});
	}

	getCurrentEvents = (instant = false) => {

		this.props.reportUnReady('eventlist');

		const allEvents = this.state.allEvents;

		//* Single month events of the current month (start in this month)

		// Get events that run in just month
		const singleMonthEvents = allEvents.filter( event => moment(event.date_start.date).format('MMMM').toLowerCase() === this.props.month );

		// Create array which ignores year for sorting
		const singleMonthEventsWithoutYear = singleMonthEvents.map( event => {
			return {
				...event,
				date_start_sort: moment(event.date_start.date).year(1970),
			}
		});

		// Sort by start date
		const singleMonthEventsSorted  = _.sortBy(singleMonthEventsWithoutYear, [(event) => moment(event.date_start_sort).valueOf()]);

		//* Multi month events that run in current month

		// Get events that run in this month (but don't start in this month as in singleMonthEvents)
		const multiMonthEvents = allEvents.filter( event => {

			// Don't include events that start in this month as handled by singleMonthEvents
			if( moment(event.date_start.date).format('MMMM').toLowerCase() === this.props.month ) {
				return false;
			}

			// Find months that event runs in current month
			const eventMonths = [];
			const dateStart = moment(event.date_start.date);
			const dateEnd = moment(event.date_end.date);
			const currentMonth = moment(`1970-${this.state.currentMonth}-01`, 'YYYY-MMMM-DD').format('MM');

			while (dateEnd > dateStart || dateStart.format('M') === dateEnd.format('M')) {
				eventMonths.push(dateStart.format('MM'));
				dateStart.add(1,'month');
			}

			return _.find(eventMonths, month => month === currentMonth);
		});

		// Create array which ignores year for sorting
		const multiMonthEventsWithoutYear = multiMonthEvents.map( event => {
			return {
				...event,
				date_start_sort: moment(event.date_start.date).year(1970),
			}
		});

		// Sort by start date
		const multiMonthEventsSorted  = _.sortBy(multiMonthEventsWithoutYear, [(event) => moment(event.date_start_sort).valueOf()]);

		// Single month events, then multi month events
		const sorted = [ ...singleMonthEventsSorted, ...multiMonthEventsSorted ]

		this.setState({
			nextEvents: sorted,
		}, () => {

			// Wait for animation to finish before updating items
			const delay = instant ? 0 : 550;
			Promise
			.all([wait(delay), this.loadImages()])
			.then( () => {

				this.setState({
					currentEvents: sorted
				}, () => {

					this.initialPosition();
					this.props.countEvents(this.state.currentEvents.length); // report total number of events back to parent component for sharing with sibling CurrentMonth component
					this.props.reportReady('eventlist');
				});
			})
			.catch( error => {

				console.error(error);
				this.props.reportReady('eventlist');
			});
		});
	};

	newMonth = () => {

		const timeline = this.refs.timelineeventlist;

		TweenMax.to(timeline, 0.25, {
			opacity: 0,
			ease: Power3.easeOut,

			// Wait for animation to change data
			onComplete: () => {
				this.setState({
					currentMonth: this.props.month,
				}, () => {

					this.getCurrentEvents();

					this.setState({
						initialPositionSet: false,
					});
				});
			}
		});

		// Wait for loader to mask
		wait(900).then( () => {
			TweenMax.set(timeline, { opacity: 1 });
		});
	}

	newCountry = () => {

		this.setState({
			country: this.props.country,
		}, this.runQuery);
	}

	// update initial position if coming from event page
	initialPosition = () => {

		// Make sure not at the start
		if ( this.state.elementWidth && ! this.state.initialPositionSet ) {

			this.setState({
				initialPositionSet: true,
			});

			const slug = this.props.slug;
			const events = this.state.currentEvents;
			const draggable = this.draggable[0];
			const timeline = this.refs.timelineeventlist;
			const totalMovement = this.state.elementWidth - this.state.windowWidth;
			let progress = 0;
			let position = 0;

			// Calculate position of event, if there is a slug, else 0
			const event = _.find(events, event => event.slug === slug);

			if ( event ) {

				const index = _.indexOf(events, event);
				const eventItem = this.refs[`eventItem_${index}`];
				const eventBounds = ReactDOM.findDOMNode(eventItem).getBoundingClientRect()
				position = eventBounds.left - ( this.state.windowWidth / 2 ) + ( eventBounds.width / 2 );

				progress = position / totalMovement;
			}

			TweenMax.set(timeline, {
				x: `-${position}px`,
				force3D: true,
			});

			draggable.update();

			// Update Progress (parent)
			this.props.onProgress(progress);
		}
	}

	handleResize = () => {

		this.setState({
			windowWidth: window.innerWidth,
		});
	};

	handleDimensions = (dimensions, type) => {

		const summaryWidth = (type === 'summary') ? dimensions.width : this.state.summaryWidth;
		const eventsWidth = (type === 'events') ? dimensions.width : this.state.eventsWidth;

		// Measurements are more complex than seemingly needed due to IE11 width calculations
		this.setState({
			summaryWidth,
			eventsWidth,
			elementWidth: summaryWidth + eventsWidth,
		}, () => {

			if ( summaryWidth && eventsWidth && this.props.isReady ) {
				this.initialPosition();
			}
		});
	};

	handleWheel = (e) => {

		if (this.state.currentEvents.length > 1) {

			e.preventDefault();

			// Progress timeline by max of 50 pixels with each scroll
			let delta = ((e.deltaY + e.deltaX) > 50) ? 50 : (e.deltaY + e.deltaX);

			// Move timeline keeping within bounds
			const timeline = this.refs.timelineeventlist;
			TweenMax.set(timeline, {
				x: () => {

					const currentX = timeline._gsTransform.x;
					const totalMovement = this.state.elementWidth - this.state.windowWidth;

					// Reached max left
					if (currentX - delta >= 0) {

						return 0;

					// Reached max right
					} else if ((currentX - delta)*-1 >= totalMovement) {

						return totalMovement * -1;

					// Move by delta
					} else {

						return `-=${delta}`;
					}
				}
			});

			// Update draggable
			const draggable = this.draggable[0];
			draggable.update();

			// Update progress
			const progress = this.props.timelineProgress;
			const totalMovement = this.state.elementWidth - this.state.windowWidth;
			let newProgress = progress + (delta/totalMovement);
			newProgress = (newProgress <= 0) ? 0 : newProgress;
			newProgress = (newProgress >= 1) ? 1 : newProgress;

			this.props.onProgress(newProgress);

		}

	};

	runQuery = (instant = false) => {

		const country = this.state.country;

		// Query for Laravel
		const query = `event/all/${country}`;

		// Load events
		getPosts(query)
		.then( response => {

			const event_items = [];
			event_items.push(...response.data);

			this.setState({
				allEvents: event_items
			}, () => {
				this.getCurrentEvents(instant)
			});

		}).catch( error => {
			console.error(error);
			this.context.router.transitionTo(`/error`);
		});
	}

	setupDraggable = () => {

		// Draggable hijacks "this", so we store it as "that" for use within Draggable. Sorry ¯\_(ツ)_/¯
		const that = this;
		const timeline = this.refs.timelineeventlist;

		// Make timelinelist draggable - primarily for touchscreen
		this.draggable = Draggable.create(timeline, {
			bounds: '.timeline-event-list-wrapper',
			type: 'x',
			throwProps: true,
			onThrowUpdate: function() { updateDraggableProgress(this) },
			dragClickables: true,
			onPress: () => {

				this.setState({
					dragCursor: true
				});
			},
			onDrag: function() {

				updateDraggableProgress(this);

				that.setState({
					showDragInstruction: false
				});
			},
			onRelease: () => {

				this.setState({
					dragCursor: false
				});
			},
		});

		// Gets 0-1 progress of timeline and updates parent
		function updateDraggableProgress(e) {

		  let newProgress = e.x / e.minX;
			newProgress = newProgress < 0 ? 0 : newProgress;
			newProgress = newProgress > 1 ? 1 : newProgress;

			// Update Progress (parent)
			that.props.onProgress(newProgress);
		}
	}

	componentWillMount() {

		this.runQuery(true);
	}

	componentDidMount() {

		this.setupDraggable();

		window.addEventListener('resize', this.handleResize);

		const parser = new UAParser();

		const browser = parser.getBrowser().name;

		this.setState({
			browser
		});
	}

	componentDidUpdate(prevProps, prevState) {

		// On month change, filter the currently-fetched data for the new month's events
		if (this.props.month !== prevProps.month) {

			this.newMonth();
		}

		// On country change, query the database for the new country's events
		if (this.props.country !== prevProps.country) {

			this.newCountry();
		}

		// Show drag instruction on page load, then hide
		if (this.props.isReady && this.props.isReady !== prevProps.isReady ) {

			wait(1250)
			.then( () => {

				this.setState({
					showDragInstruction: true
				});

				wait(3500)
				.then( () => {

					this.setState({
						showDragInstruction: false
					});
				});
			});
		}
	}

	componentWillUnmount() {
		window.removeEventListener('resize', this.handleResize);
	}

	render() {

		// Show correct events for country
		const valid_events = this.state.currentEvents;

		// Render each event
		return (
			<div className={`timeline-event-list-wrapper show-drag-instruction-${this.state.showDragInstruction}`}>

				<DragInstruction />

				<ul
					className={`timeline-event-list ${(this.state.dragCursor ? 'dragging' : 'not-dragging')}`}
					ref="timelineeventlist"
					onWheel={this.handleWheel}
					style={{width: `${parseFloat(this.state.elementWidth)}px`}}
				>
					<Measure onMeasure={(dimensions) => this.handleDimensions(dimensions, 'summary')}>
						<MonthSummary
							month={this.state.currentMonth}
							country={this.props.country}
							page={'timeline'}
							isEventItem={true}
							reportReady={this.props.reportReady}
							reportUnReady={this.props.reportUnReady}
							isReady={this.props.isReady}
							goToWeather={this.props.goToWeather}
							changeTabCountry={this.props.changeTabCountry}
						/>
					</Measure>

					<div
						className="timeline-event-items-wrapper"
					>
						{/* <Measure onMeasure={(dimensions) => this.handleDimensions(dimensions, 'events')}>
							<span>
								{ this.props.isReady &&

									Object
									.keys(valid_events)
									.map((event, key) => {

										const event_single = valid_events[key];

										return (
											<EventItem
												key={event_single.slug+key}
												ref={`eventItem_${key}`}
												index={parseInt(key, 10)}
												event_single={event_single}
												goToSingle={this.props.goToSingle}
												timelineProgress={this.props.timelineProgress}
												windowWidth={this.state.windowWidth}
												browser={this.state.browser}
												country={this.state.country}
											/>
										)
									})
								}
							</span>
						</Measure> */}
					</div>
				</ul>
			</div>
		)
	}
}

const DragInstruction = () => {
	return (
		<div className="drag-instruction">
			<svg className="icon"><use xlinkHref="#drag" /></svg>
			<div className="text">drag to explore timeline</div>
		</div>
	)
};

EventList.propTypes = {
	country: PropTypes.string.isRequired,
	month: PropTypes.string.isRequired,
	goToSingle: PropTypes.func.isRequired,
	onProgress: PropTypes.func.isRequired,
	reportReady: PropTypes.func.isRequired,
	reportUnReady: PropTypes.func.isRequired,
	goToWeather: PropTypes.func.isRequired,
	isReady: PropTypes.bool.isRequired,
	timelineProgress: PropTypes.number.isRequired,
	changeTabCountry: PropTypes.func,
	slug: PropTypes.string,
	countEvents: PropTypes.func,
}

EventList.defaultProps = {
	timelineProgress: 0,
}

EventList.contextTypes = {
	router: PropTypes.object
}

export default EventList;
