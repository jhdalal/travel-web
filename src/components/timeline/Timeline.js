import PropTypes from 'prop-types';
import React from 'react';
import { ImageHelper } from 'react-preload';
import _ from 'lodash';
import { TweenMax, Power3 } from 'gsap';

import Meta from '../Meta';
import MonthList from '../MonthList';
import EventList from './EventList';
import CurrentMonth from './CurrentMonth';
import MonthNav from './MonthNav';

import { getCountryName, capitalise } from '../../helpers';

/**
* -Timeline-
* Timeline page
**/
class Timeline extends React.Component {

	state = {
		country: this.props.params.country,
		currentMonth: this.props.params.month,
		progress: 0,
		elementsToBeReady: [
			"monthsummary",
			"monthlist",
			"currentmonth",
			"eventlist",
			"images",
		],
		elementsReady: [],
		allElementsReady: false,
		allElementsReady_initial: false,
		isExitAnimating: false,
		eventsCount: 0
	};

	monthLeaveAnimation = () => {

		return new Promise((resolve, reject) => {

			this.setState({
				isExitAnimating: true,
			});

			TweenMax.staggerTo(['.month-summary', '.timeline-event-items-wrapper', '.month-title'], 0.65, {
				x: -250,
				opacity: 0,
				ease: Power3.easeOut,
				onComplete: () => {

					resolve();

					// Wait for loader to cover
					setTimeout( () => {

						this.setState({
							isExitAnimating: false,
						});
					}, 500);
				},
			}, 0.1);
		});
	}

	reportReady = ( element ) => {

		if( this.state.elementsReady.indexOf(element) === -1 ){

			this.setState({
				elementsReady: this.state.elementsReady.concat(element)
			}, () => {

				if( this.state.elementsToBeReady.length === this.state.elementsReady.length ) {

					this.props.hideLoader();

					this.setState({
						allElementsReady: true,
						allElementsReady_initial: true,
					});
				}
			});
    }
	}

	reportUnReady = ( element ) => {

		const index = this.state.elementsReady.indexOf(element);
		if (index >= 0) {
		  this.state.elementsReady.splice( index, 1 );
		}

		this.setState({
			allElementsReady: false
		});
	}

	// Route to 'event/' with progress as a param
	goToSingle = (e, slug) => {
		e.preventDefault();

		this.props.showLoader().then( () => {

			const { country, month } = this.props.params;

			// Replacing means we come back the right event on history change
			this.context.router.replaceWith(`/timeline/${country}/${month}/${slug}`);

			this.context.router.transitionTo(`/event/${this.props.params.country}/${slug}`);
		});
	};

	goToMonth = (e, key) => {
		e && e.preventDefault();

		if( this.state.currentMonth !== key ) {

			this.monthLeaveAnimation().then( () => {
				this.context.router.transitionTo(`/timeline/${this.props.params.country}/${key}`);
			});
		}
	};

	goToWeather = (e) => {
		e.preventDefault();

		this.props.showLoader().then( () => {

			this.context.router.transitionTo(`/weather/${this.state.country}/${this.state.currentMonth}`);
		});
	}

	// Progress of timeline comes from children
	handleProgress = (progress) => {

		this.setState({
			progress: parseFloat(progress),
		});
	};

	loadBGImage = () => {

		this.reportUnReady('images');

		const loadImages = () => {

			// Preload Images
			ImageHelper
				.loadImages(this.state.preloadImages)
				.then( () => {

					this.reportReady('images');

		    }).catch( (error) => console.error(error) );
		}

		if (window.innerWidth < 750) {

			this.setState({
				preloadImages: [
					`${window.AWS}/images/bg_${this.props.params.country}_small.jpg`,
				]
			}, () => {

				loadImages();
			});

		} else {

			this.setState({
				preloadImages: [
					`${window.AWS}/images/bg_${this.props.params.country}.jpg`,
				]
			}, () => {

				loadImages();
			});
		}
	}

	// Called from MonthSummary tabs
	changeTabCountry = (country) => {

		if (this.props.params.country !== country) {

			this.props.showLoader().then( () => {

				this.context.router.transitionTo(`/${this.props.page}/${country}/${this.props.month}`);
			});
		}
	}

	// A function to count events so we can pass the number to CurrentMonth
	countEvents = (int) => {
		this.setState({
			eventsCount: int
		});
	}

	componentWillMount() {

		this.loadBGImage();

		// Report to Master
		this.props.setPage('timeline');
		this.props.setCountry(this.props.params.country);
		this.props.setMonth(this.props.params.month);
	}

	// Report update to Master
	componentDidUpdate(prevProps, prevState) {

		// New country
		if( prevProps.params.country !== this.props.params.country) {

			this.loadBGImage();

			this.props.setCountry(this.props.params.country);

			this.setState({
				country: this.props.params.country,
			});
		}

		// New month
		if( prevProps.params.month !== this.props.params.month) {

			this.props.showLoader().then( () => {

				this.props.setMonth(this.props.params.month);

				this.setState({
					currentMonth: this.props.params.month
				});
			});
		}
	}

	componentDidMount() {
		console.log("Timeline::componentDidMount")
		//this.props.triggerAnalytics();
	}

	render() {

		const metaMonth = capitalise(this.state.currentMonth);
		const metaCountry = getCountryName(this.state.country);

		const meta = {
			title: `Discover the best events and things to do in ${metaCountry} in ${metaMonth}`,
			description: `The When to Travel Guide by Inside Asia Tours is an interactive guide to discover the best events and things to do in ${metaCountry} throughout ${metaMonth}.`,
			image: {
				url: `og_${metaCountry.toLowerCase()}.jpg`,
				width: 500,
				height: 263,
			}
		};

		return (
			<div className={`page-timeline country-${this.props.params.country}`}>

				<Meta {...meta} />

				<CurrentMonth
					country={this.state.country}
					month={this.state.currentMonth}
					progress={this.state.progress}
					reportReady={this.reportReady}
					reportUnReady={this.reportUnReady}
					isReady={this.state.allElementsReady}
					eventsCount={this.state.eventsCount}
				/>

				<EventList
					month={this.state.currentMonth}
					country={this.props.params.country}
					goToSingle={this.goToSingle}
					goToMonth={this.goToMonth}
					goToWeather={this.goToWeather}
					onProgress={this.handleProgress}
					reportReady={this.reportReady}
					reportUnReady={this.reportUnReady}
					isReady={this.state.allElementsReady}
					timelineProgress={this.state.progress}
					changeTabCountry={this.changeTabCountry}
					slug={this.props.params.slug}
					countEvents={this.countEvents}
				/>

				<MonthList
					country={this.props.params.country}
					currentMonth={this.state.currentMonth}
					goToMonth={this.goToMonth}
					reportReady={this.reportReady}
					isReady={this.state.allElementsReady_initial}
					shouldAnimate={!this.state.isExitAnimating}
					setInteracted={this.props.setInteracted}
					monthListInteracted={this.props.monthListInteracted}
				/>

				{/* <MonthNav
					month={this.state.currentMonth}
					country={this.state.country}
					goToMonth={this.goToMonth}
					progress={this.state.progress}
					updateProgress={this.handleProgress}
				/> */}

			</div>
		)
	}
}

Timeline.contextTypes = {
	router: PropTypes.object
}

Timeline.propTypes = {
	showLoader: PropTypes.func.isRequired,
	hideLoader: PropTypes.func.isRequired,
	setCountry: PropTypes.func.isRequired,
	setPage: PropTypes.func.isRequired,
	setMonth: PropTypes.func.isRequired,
}

export default Timeline;
