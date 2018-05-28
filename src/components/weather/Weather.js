import PropTypes from 'prop-types';
import React from 'react';
import { ImageHelper } from 'react-preload';

import Map from '../googlemaps/';
import Meta from '../Meta';
import MonthList from '../MonthList';
import { getPosts } from '../../helpers'
import countries from '../../data/countries';
import MonthSummary from '../MonthSummary';
import { getCountryName, capitalise, toFahrenheit } from '../../helpers';

/**
* -Weather-
* Weather page
* Content is in WeatherContainer below. This is used for transitions
**/
class Weather extends React.Component {

	state = {
		weatherDataReady: false,
		allWeather: {},
		currentWeather: [],
		currentMonth: this.props.params.month,
		country: this.props.params.country,
		map: {
			bounds: countries[this.props.params.country].weatherMap.bounds,
			initialLocation: countries[this.props.params.country].weatherMap.initialLocation,
			zoom: countries[this.props.params.country].weatherMap.zoom,
		},
		summaryVisible: true,
		overlayVisible: false,
		activeMarker: {},
		activeGoogleMarker: {},
		elementsToBeReady: [
		  "monthlist",
		  "monthsummary",
		  "map",
			"images"
		],
		elementsReady: [],
		allElementsReady: false,
		allElementsReady_initial: false,
		preloadImages: [
			`${window.AWS}/images/fog_bg.png`,
			`${window.AWS}/images/fog.gif`,
			`${window.AWS}/images/rain_bg.png`,
			`${window.AWS}/images/rain.gif`,
			`${window.AWS}/images/light-rain.gif`,
			`${window.AWS}/images/heavy-rain.gif`,
			`${window.AWS}/images/hot-rainy.gif`,
			`${window.AWS}/images/snow_bg.png`,
			`${window.AWS}/images/snow.gif`,
			`${window.AWS}/images/cool_bg.png`,
			`${window.AWS}/images/warm_bg.png`,
			`${window.AWS}/images/hot_bg.png`,
			`${window.AWS}/images/sun-cloud-cool.gif`,
			`${window.AWS}/images/sun-cloud-hot.gif`,
			`${window.AWS}/images/sun-cloud-warm.gif`,
			`${window.AWS}/images/sun-cool.gif`,
			`${window.AWS}/images/sun-hot.gif`,
			`${window.AWS}/images/sun-warm.gif`,
			`${window.AWS}/images/cool-rain-cloud-sun.gif`,
			`${window.AWS}/images/hot-rain-cloud-sun.gif`,
			`${window.AWS}/images/warm-rain-cloud-sun.gif`,
		]
	}

	goToPage = (e) => {
		e.preventDefault();

	 	this.props.showLoader().then( () => {

			this.context.router.transitionTo(`/${this.state.currentToggle}/${this.props.country}/${this.props.month}`);
		});
	}

	reportReady = ( element ) => {

		if( this.state.elementsReady.indexOf(element) === -1 ){

			this.setState({
				elementsReady: this.state.elementsReady.concat(element)
			}, () => {

				if( this.state.elementsToBeReady.length === this.state.elementsReady.length ) {

					this.props.hideLoader().then( () => {

						this.setState({
							allElementsReady: true,
							allElementsReady_initial: true,
						});
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

	handleMarkerClick = (marker, index) => {

		this.setState({
			activeGoogleMarker: marker,
			activeMarker: this.state.currentWeather[index],
			overlayVisible: true,
		});

		this.hideSummary();
	}

	closeOverlay = () => {

		this.setState({
			overlayVisible: false,
		});

		this.showSummary();
	}

	hideSummary = () => {

		this.setState({
			summaryVisible: false
		});
	}

	showSummary = () => {

		this.setState({
			summaryVisible: true
		});
	}

	// Called from MonthSummary tabs
	changeTabCountry = (country) => {

		if (this.props.params.country !== country) {

			this.props.showLoader().then( () => {

				this.context.router.transitionTo(`/${this.props.page}/${country}/${this.props.month}`);
			});
		}
	}

	getCurrentWeather = () => {

		if ( this.state.weatherDataReady ) {

			const nation = this.props.params.country.toLowerCase();

			// Create new array where the month is equal to current month
			const month_regex = new RegExp(this.state.currentMonth, 'gi');
			const month_filtered = this.state.allWeather.filter(weather => (weather.month.match(month_regex)));
			const filtered = ( window.innerWidth > 999 ) ? month_filtered.filter(weather => weather.nation.toLowerCase() === nation) : month_filtered; // only filter on mobile

			this.setState({
				currentWeather: filtered,
			}, () => {

				this.props.hideLoader();
			});
		}
	}

	goToTimeline = (e) => {
		e.preventDefault();

		this.closeOverlay();

		this.props.showLoader().then( () => {

			this.context.router.transitionTo(`/timeline/${this.state.country}/${this.state.currentMonth}`);
		});
	}

	goToWeather = (e, month) => {
		e && e.preventDefault();

		this.closeOverlay();

		this.context.router.transitionTo(`/weather/${this.props.params.country}/${month}`);
	}

	// Function to run when country changes (and on load)
	updateCountry() {

		const country = this.props.params.country;

		// Query for Laravel
		const query = `weather/all/${country}`;

		// Load weather
		getPosts(query)
			.then( response => {

				const weather_items = [];

				// Format response into object required for map markers
				response.data.forEach( single => {

					// Create marker for each weather location
					single.locations.forEach( (location) => {

						// Add location
						single.location = location;

						// Add title
						single.title = `${location.name} ${single.temperature}\xB0C / ${toFahrenheit(single.temperature)}\xB0F`;

						weather_items.push(single);
					});

					delete single.locations;
				});

				// Set state then get current weather
				this.setState({
					weatherDataReady: true,
					allWeather: weather_items,
					map: {
						bounds: countries[country].weatherMap.bounds,
						initialLocation: countries[country].weatherMap.initialLocation,
						zoom: countries[country].weatherMap.zoom,
					}
				}, this.getCurrentWeather);
			})
			.catch( error => {
				console.error(error);
			});
	}

	componentWillMount() {

		// Preload Images
		ImageHelper
			.loadImages(this.state.preloadImages)
			.then( () => {

				this.reportReady('images');

	    }).catch( (error) => console.error(error) );

		this.updateCountry();

		// Report to Master
		this.props.setPage('weather');
		this.props.setCountry(this.props.params.country);
		this.props.setMonth(this.props.params.month);
	}

	componentDidMount() {
		window.addEventListener('resize', this.getCurrentWeather);
		this.props.triggerAnalytics();
	}

	componentDidUpdate(prevProps, prevState) {

		// New country
		if( prevProps.params.country !== this.props.params.country ) {

			this.updateCountry();

			this.props.setCountry(this.props.params.country);
		}

		// New month
		if( prevProps.params.month !== this.props.params.month) {

			this.setState({
				currentMonth: this.props.params.month
			});

			this.props.showLoader().then( () => {

				this.props.setMonth(this.props.params.month);

				this.getCurrentWeather();
			});
		}
	}

	componentWillUnmount() {
	  window.removeEventListener('resize', this.getCurrentWeather);
	}

	render() {

		const metaMonth = capitalise(this.state.currentMonth);
		const metaCountry = getCountryName(this.state.country);

		const meta = {
			title: `Find out where the best weather is in ${metaCountry} during ${metaMonth}`,
			description: `The When to Travel Guide by Inside Asia Tours lets you discover the best time of year to travel. Find out where the best weather is in ${metaCountry} during ${metaMonth}.`,
			image: {
				url: `og_${metaCountry.toLowerCase()}.jpg`,
				width: 500,
				height: 263,
			}
		};

		return (
			<div className={`page-weather country-${this.props.params.country} overlayVisible-${this.state.overlayVisible}`}>

				<Meta {...meta} />

				<MonthSummary
					month={this.state.currentMonth}
					country={this.props.params.country}
					page={'weather'}
					visible={this.state.summaryVisible}
					reportReady={this.reportReady}
					reportUnReady={this.reportUnReady}
					isReady={this.state.allElementsReady}
					goToTimeline={this.goToTimeline}
					changeTabCountry={this.changeTabCountry}
				/>

				{ this.state.weatherDataReady && // Map
					<Map
						class={"map"}
						markers={this.state.currentWeather}
						fitBounds={true}
						initialLocation={this.state.map.initialLocation}
						zoom={this.state.map.zoom}
						options={{
							disableDefaultUI: true,
						}}
						customControls={true}
						goToTimeline={this.goToTimeline}
						hideSummary={this.hideSummary}
						showSummary={this.showSummary}
						closeOverlay={this.closeOverlay}
						handleMarkerClick={this.handleMarkerClick}
						hasOverlay={true}
						overlayVisible={this.state.overlayVisible}
						activeMarker={this.state.activeMarker}
						activeGoogleMarker={this.state.activeGoogleMarker}
						reportReady={this.reportReady}
						reportUnReady={this.reportUnReady}
						isReady={this.state.allElementsReady}
						country={this.props.country}
					/>
				}

				<MonthList
					country={this.props.params.country}
					currentMonth={this.state.currentMonth}
					goToMonth={this.goToWeather}
					reportReady={this.reportReady}
					isReady={this.state.allElementsReady_initial}
					setInteracted={this.props.setInteracted}
					monthListInteracted={this.props.monthListInteracted}
				/>

			</div>
		)
	}
}

Weather.contextTypes = {
	router: PropTypes.object
}

Weather.propTypes = {
	showLoader: PropTypes.func.isRequired,
	hideLoader: PropTypes.func.isRequired,
	setCountry: PropTypes.func.isRequired,
	setPage: PropTypes.func.isRequired,
	setMonth: PropTypes.func.isRequired,
}

export default Weather;
