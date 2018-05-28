import React from 'react';
import PropTypes from 'prop-types';
import { ImageHelper } from 'react-preload';
import TransitionGroup from 'react-transition-group/TransitionGroup';
import { Helmet } from 'react-helmet';

import { getPosts } from '../../helpers'

import EventSingleContainer from './EventSingleContainer';
import Meta from '../Meta';

/**
* -EventSingle-
* Event page
**/
class EventSingle extends React.Component {

	state = {
		allElementsReady: false,
		eventSingle: null,
		contactDetails: null,
	}

	socialContent = {};

	// Preload Images
	loadImages = () => {

		return new Promise((resolve, reject) => {

			const preloadImages = [
				this.state.eventSingle[0].image_url,
				`${window.AWS}/images/location_icon-burma.png`,
				`${window.AWS}/images/location_icon-japan.png`,
				`${window.AWS}/images/location_icon-vietnam.png`,
			];

			ImageHelper
				.loadImages(preloadImages)
				.then(resolve)
				.catch( (error) => console.error(error) );
		});
	}

	fetchContactDetails = () => {

		return new Promise((resolve, reject) => {

			// Get event data
			const query = `nation/${this.props.country}/-`;

			getPosts(query)
			.then( response => {

				this.setState({
					contactDetails: response.data[0],
				}, resolve);

			}).catch( error => {
				console.error(error);
			});
		});
	}

	fetchAllEvents = () => {

		return new Promise((resolve, reject) => {

			const country = this.props.params.country === 'vietnam' ? 'vietnam_cambodia_laos' : this.props.params.country;

			// Query for Laravel
			const query = `event/all/${country}`;

			// Load events
			getPosts(query)
			.then( response => {

				const event_items = [...response.data];

				this.setState({
					allEvents: event_items
				}, resolve);

			}).catch( error => {
				console.error(error);
			});
		});
	}

	fetchEvent = () => {

		return new Promise((resolve, reject) => {

			// Get event data
			const eventQuery = `event/slug/${this.props.params.slug}`;

			getPosts(eventQuery)
			.then( response => {

				// Format response into object required
				response.data.forEach( single => {

					let icon = single.nation.toLowerCase();

					// Markers
					const markers = [];

					// // Create marker for each location
					single.locations.forEach( (location) => {

						const marker = {
							location: {
								lat: parseFloat(location.lat),
								lng: parseFloat(location.lng),
							},
							title: location.name,
							icon: icon
						}

						markers.push(marker);
					});

					delete single.locations;

					single.markers = markers;
				});

				this.setState({
					eventSingle: response.data
				}, resolve);

			}).catch( error => {
				console.error(error);
				this.context.router.transitionTo(`/error`);
			});
		});
	}

	getNewEvent = () => {

		this.setState({
			allElementsReady: false,
		});

		Promise
		.all([ this.fetchEvent(), this.fetchAllEvents(), this.fetchContactDetails() ])
		.then( () => this.loadImages() )
		.then( () => {

			this.setState({
				allElementsReady: true,
			});
		});

		// Report to Master
		this.props.setPage('event');
		this.props.setCountry(this.props.params.country);
	}

	componentWillMount() {
		console.log("EVENTSINGLE:: 1");
		this.getNewEvent();
	}

	componentDidUpdate(prevProps) {

		// New event
		if ( prevProps.pathname !== this.props.pathname ) {
			this.getNewEvent();
		}
	}

	componentDidMount() {
		this.props.triggerAnalytics();
	}

	render() {

		return (
			<span>

				<Helmet
				  script={[{
				    type: 'text/javascript',
			    	innerHTML: `
							window.$zopim||(function(d,s){var z=$zopim=function(c){z._.push(c)},$=z.s= d.createElement(s),e=d.getElementsByTagName(s)[0];z.set=function(o){z.set. _.push(o)};z._=[];z.set._=[];$.async=!0;$.setAttribute("charset","utf-8"); $.src="https://v2.zopim.com/?4h4N7tGClxcDjDZ9T3vL1Dsjl3tmspY2";z.t=+new Date;$. type="text/javascript";e.parentNode.insertBefore($,e)})(document,"script");
							var $zopim = window.$zopim;
							$zopim(function () {
								$zopim.livechat.hideAll();
							});
						`
				  }]} />

				{ this.state.eventSingle &&
					<MetaContainer
						event={this.state.eventSingle[0]}
					/>
				}

				<TransitionGroup>
					{ this.state.allElementsReady &&
						<EventSingleContainer
							{...this.props}
							{...this.state}
						/>
					}
				</TransitionGroup>

			</span>
		)
	}
}

const MetaContainer = ({
	event
}) => {

	const meta = {
		title: `IAT When to Travel - ${event.meta.title}`,
		description: event.meta.description,
		image: {
			url: event.thumbnail_url,
		}
	};

	return(
		<Meta {...meta} />
	)
}

EventSingle.contextTypes = {
	router: PropTypes.object
}

EventSingle.propTypes = {
	showLoader: PropTypes.func.isRequired,
	hideLoader: PropTypes.func.isRequired,
	setCountry: PropTypes.func.isRequired,
	setPage: PropTypes.func.isRequired,
	setMonth: PropTypes.func.isRequired,
}

export default EventSingle;
