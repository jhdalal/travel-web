import React from 'react';
// import { Switch, Route } from 'react-router';
// import { BrowserRouter } from 'react-router-dom';
import { BrowserRouter, Match, Miss } from 'react-router';
import TransitionGroup from 'react-transition-group/TransitionGroup';
import UAParser from 'ua-parser-js';
//import ReactGA from 'react-ga';
//import ReactPixel from 'react-facebook-pixel';
//import TagManager from 'react-gtm-module';

import Loader from '../components/Loader';
import Header from '../components/Header';
import Timeline from '../components/timeline/Timeline';
import EventSingle from '../components/event_single/EventSingle';
//import Weather from '../components/weather/Weather';
import HomePage from '../components/homepage/HomePage';
import Sitemap from '../components/Sitemap';
import NotFound from '../components/NotFound';

class Master extends React.Component {

	state = {
		country: 'japan',
		page: 'homepage',
		month: 'january',
		loaderShown: false,
		monthListInteracted: false,
	}

	setCountry = (country) => {
		this.setState({country});
	}

	setPage = (page) => {
		this.setState({page});
	}

	setMonth = (month) => {
		this.setState({month});
	}

	showLoader = () => {

		return new Promise((resolve, reject) => {

			this.setState({
				loaderShown: true,
			});

			// Report that loader is fully shown
			setTimeout(resolve, 1250);
		});
	}

	hideLoader = () => {

		return new Promise((resolve, reject) => {

			this.setState({
				loaderShown: false,
			});

			// Report that loader is fully hidden
			setTimeout(resolve, 250);
		});
	}

	triggerAnalytics = () => {

		// // Google Analytics
		// ReactGA.set({ page: window.location.pathname + window.location.search });
		// ReactGA.pageview(window.location.pathname + window.location.search);

		// // Facebook Pixel
		// ReactPixel.pageView();

		// // Google Tag Manager
		// const tagManagerArgs = {
		// 	dataLayer: {
		// 		page: window.location.pathname
		// 	}
		// }
		// TagManager.dataLayer(tagManagerArgs);
	}

	setInteracted = (bool) => {
		this.setState({
			monthListInteracted: bool
		});
	}

	componentDidMount() {

		const parser = new UAParser();

		const browser = parser.getBrowser().name.toLowerCase();

		this.setState({
			browser,
		});

		// Google Analytics initialisation
		//ReactGA.initialize('UA-64874026-1');

        // Facebook Pixel initialisation
		//ReactPixel.init('149633918891670');

		// Google Tag Manager initialisation
		//TagManager.initialize({gtmId: 'GTM-K3FG73'});

		//this.triggerAnalytics();
	}

	render() {

		const homepageComponent = (props) =>{
			return (
				<HomePage
					showLoader={this.showLoader}
					hideLoader={this.hideLoader}
					setCountry={this.setCountry}
					setPage={this.setPage}
					setMonth={this.setMonth}
					triggerAnalytics={this.triggerAnalytics}
					{...props}
					{...this.state}
				/>
			)
		}

		return (
			<BrowserRouter basename="/when-to-travel">
				<div
					id="main"
					className={`country-${this.state.country} page-${this.state.page} month-${this.state.month} browser-${this.state.browser}`}
				>
					<Match pattern="*"
						render={ (props) =>
							<Header
								showLoader={this.showLoader}
								hideLoader={this.hideLoader}
								setCountry={this.setCountry}
								setPage={this.setPage}
								setMonth={this.setMonth}
								{...props}
								{...this.state}
							/>
						}
					/>

					{/* Additional match exactly for prerender.io to be able to see the homepage */}
					<Match exactly pattern="/"
						render={ homepageComponent }
					/>
					<Match exactly pattern="/index.htm"
						render={ homepageComponent }
					/>

					<Match pattern="/timeline/:country/:month/:slug?"
						render={ (props) =>
							<Timeline
								showLoader={this.showLoader}
								hideLoader={this.hideLoader}
								setCountry={this.setCountry}
								setPage={this.setPage}
								setMonth={this.setMonth}
								triggerAnalytics={this.triggerAnalytics}
								setInteracted={this.setInteracted}
								monthListInteracted={this.state.monthListInteracted}
								{...props}
								{...this.state}
							/>
						}
					/>

					{/* <Match pattern="/weather/:country/:month"
						render={ (props) =>
							<Weather
								showLoader={this.showLoader}
								hideLoader={this.hideLoader}
								setCountry={this.setCountry}
								setPage={this.setPage}
								setMonth={this.setMonth}
								triggerAnalytics={this.triggerAnalytics}
								setInteracted={this.setInteracted}
								monthListInteracted={this.state.monthListInteracted}
								{...props}
								{...this.state}
							/>
						}
					/> */}

					<Match pattern="/event/:country/:slug"
						render={ (props) =>
							<EventSingle
								showLoader={this.showLoader}
								hideLoader={this.hideLoader}
								setCountry={this.setCountry}
								setPage={this.setPage}
								setMonth={this.setMonth}
								contactDetails={this.state.contactDetails}
								triggerAnalytics={this.triggerAnalytics}
								{...props}
								{...this.state}
							/>
						}
					/>

					<Match exactly pattern="/sitemap"
						render={ (props) =>
							<Sitemap
								{...props}
							/>
						}
					/>

					<Miss
						render={ (props) =>
							<NotFound
								showLoader={this.showLoader}
								hideLoader={this.hideLoader}
								setPage={this.setPage}
								triggerAnalytics={this.triggerAnalytics}
							/>
						}
					/>

					<TransitionGroup>
						{ this.state.loaderShown &&
							<Loader loaderShown={this.showLoader} />
						}
					</TransitionGroup>

				</div>
			</BrowserRouter>
		)
	}
}

export default Master;
