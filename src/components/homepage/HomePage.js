import PropTypes from 'prop-types';
import React from 'react';
import ReactCSSTransitionGroup from 'react-transition-group/CSSTransitionGroup';
import { ImageHelper } from 'react-preload';
import TransitionGroup from 'react-transition-group/TransitionGroup';
import { TimelineMax, Power2, Power3 } from 'gsap';
import { Link } from 'react-router';

import countries from '../../data/countries';
import Toggle from '../Toggle';
import Meta from '../Meta';
import CountryPicker from './CountryPicker';
import Background from './Background.js';

/**
* -HomePage-
* Home page
* Content is in HomepageContainer below. This is used for transitions
**/
class HomePage extends React.Component {

	constructor(){
		super();

		if (window.innerWidth < 750) {

			this.state = {
				preloadImages: [
					`${window.AWS}/images/bg_japan_small.jpg`,
					`${window.AWS}/images/bg_burma_small.jpg`,
					`${window.AWS}/images/bg_vietnam_small.jpg`,
					`${window.AWS}/images/blossom_2.png`,
					`${window.AWS}/images/blossom_1.png`,
					`${window.AWS}/images/lantern.png`,
					`${window.AWS}/images/balloon.png`,
				],
				countryPickerAnimationComplete: false,
				animationComplete: false,
				allElementsReady: false,
			};

		} else {

			this.state = {
				preloadImages: [
					`${window.AWS}/images/bg_japan.jpg`,
					`${window.AWS}/images/bg_burma.jpg`,
					`${window.AWS}/images/bg_vietnam.jpg`,
					`${window.AWS}/images/blossom_2.png`,
					`${window.AWS}/images/blossom_1.png`,
					`${window.AWS}/images/lantern.png`,
					`${window.AWS}/images/balloon.png`,
				],
				countryPickerAnimationComplete: false,
				animationComplete: false,
				allElementsReady: false,
			};
		}
	}

	// Preload Images
	loadImages = () => {

		return new Promise((resolve, reject) => {

			const preloadImages = this.state.preloadImages;

			ImageHelper
				.loadImages(preloadImages)
				.then(resolve)
				.catch( (error) => console.error(error) );
		});
	}

	componentDidMount() {
		console.log("Home::componentDidMount");
		//this.props.triggerAnalytics();

		this.loadImages().then( () => {

			this.props.hideLoader();

			this.setState({
				allElementsReady: true,
			});
		});
	}

	render() {

		return (
			<span>

				<Meta />

				<TransitionGroup>
					{ this.state.allElementsReady &&
						<HomepageContainer {...this.props} />
					}
				</TransitionGroup>

			</span>
		)
	}
}

/**
* -HomepageContainer-
* HomePage content
**/
class HomepageContainer extends React.Component {

	state = {
		countries: countries,
		currentToggle: 'timeline',
		countryPickerAnimationComplete: false,
		animationComplete: false,
	}

	goToPage = (e, country) => {
		e.preventDefault();

	 	this.props.showLoader().then( () => {

			const countryName = country ? country : this.props.country;

			this.context.router.transitionTo(`/${this.state.currentToggle}/${countryName}/${this.props.month}`);

		});
	}

	// Update state with month selection
	handleMonth = (e) => {
		this.props.setMonth(e.target.value);
	}

	// Update toggle state
	updateToggle = (newToggle) => {
		this.setState({
			currentToggle: newToggle
		});
	}

	enterAnimation(cb) {

		const tl = new TimelineMax({
			delay: 0.5,
			onComplete: () => {

				this.setState({
					animationComplete: true
				});

				cb();
			}
		});
		tl.staggerFromTo(['.country-picker', '.home-intro'], 1, { opacity: 0, ease: Power3.easeOut }, { opacity: 1 }, 0.2 );
		tl.addLabel( 'countryPickerStart', '-=0.6' );
		tl.fromTo(['.country-picker-item-2'], 0.65, { scale: 0.35, ease: Power3.easeOut }, { scale: 1 }, 'countryPickerStart');
		tl.fromTo(['.country-picker-item-2 .title-item-1', '.country-picker-item-2 .title-item-2'], 0.35, { opacity: 0, scale: 0.25, ease: Power2.easeOut }, { opacity: 1, scale: 1 }, 'countryPickerStart+=0.2');
		tl.fromTo('.country-picker-item-1', 0.65, { x: '50%', scale: 0.35, ease: Power3.easeOut }, { x: '0%', scale: 0.5, opacity: 0.2 }, 'countryPickerStart');
		tl.fromTo('.country-picker-item-3', 0.65, { x: '-50%', scale: 0.35, ease: Power3.easeOut }, { x: '0%', scale: 0.5, opacity: 0.2 }, 'countryPickerStart');
		tl.addCallback( () => {

			setTimeout( () => {

				tl.set('.country-picker-item', { clearProps: 'all' });

				this.setState({
					countryPickerAnimationComplete: true
				});
			}, 150);
		});
		tl.fromTo(['.home-bg-wrapper', '.bg-component-wrapper'], 1, { opacity: 0, ease: Power3.easeOut }, { opacity: 1 }, 'countryPickerStart');
		tl.fromTo('.homepage-controls', 0.8, { scale: 0.2, y: '100rem', opacity: 0, ease: Power3.easeOut }, { scale: 1, y: 0, opacity: 1 }, 'countryPickerStart');
	}

	componentWillAppear(cb) {

		this.enterAnimation(cb);
  }

	componentWillEnter(cb) {

		this.enterAnimation(cb);
  }

	componentWillMount() {
		this.props.setPage('homepage');
		this.props.setMonth('january');
		this.props.setCountry('japan');
	}

  render() {

    return (
			<div className="page-home">

				<ReactCSSTransitionGroup
					component="div"
					className="home-bg-wrapper"
					transitionName="bg"
					transitionEnterTimeout={1000}
					transitionLeaveTimeout={1000}
				>
					<div key={this.props.country} className={`home-bg-${this.props.country}`}></div>
				</ReactCSSTransitionGroup>

				{/* Background components render markup and contain JavaScript for canvas effects */}
				<Background country={this.props.country} />

				<div className="home-content-wrapper">

					{/* Intro */}
					<section className="home-intro user-content">
						<h1 className="sub-title">When to Travel</h1>
						<p>To help you decide the best time of year to travel to <a href={`/${this.state.currentToggle}/japan/${this.props.month}`} onClick={e => this.goToPage(e, 'japan')} className="japan-link">Japan</a>, <a href={`/${this.state.currentToggle}/vietnam/${this.props.month}`} onClick={e => this.goToPage(e, 'vietnam')} className="vietnam-link">Vietnam, Cambodia &amp; Laos,</a> or <a href={`/${this.state.currentToggle}/burma/${this.props.month}`} onClick={e => this.goToPage(e, 'burma')} className="burma-link">Burma</a>, we have put together a comprehensive weather and event guide. Please choose your preference below to begin!</p>
						<p><strong>I would like to visit...</strong></p>
					</section>

					{/* Country picker */}
					<CountryPicker
						countries={this.state.countries}
						setCountry={this.props.setCountry}
						animationComplete={this.state.countryPickerAnimationComplete}
					/>

					{/* Navigation */}
					<div className="homepage-controls">

						<span>Show me</span>

						<Toggle
							canNavigate={false}
							updateToggle={this.updateToggle}
							page={this.props.page}
							country={this.props.country}
							month={this.props.month}
						/>

						<span>in</span>

						<select value={this.props.month} onChange={this.handleMonth} name="month-select" id="month-select" className="month-select">
							<option value="january">January</option>
							<option value="february">February</option>
							<option value="march">March</option>
							<option value="april">April</option>
							<option value="may">May</option>
							<option value="june">June</option>
							<option value="july">July</option>
							<option value="august">August</option>
							<option value="september">September</option>
							<option value="october">October</option>
							<option value="november">November</option>
							<option value="december">December</option>
						</select>

						<Link onClick={ (e) => this.goToPage(e) } className="btn-sml homepage-submit" to={`/${this.state.currentToggle}/${this.props.country}/${this.props.month}`}>
							<span className="text">Show Me</span><svg><use xlinkHref="#down_arrow_white" /></svg>
						</Link>

					</div>

				</div>

			</div>
		)
    }
}

HomepageContainer.contextTypes = {
	router: PropTypes.object
}

HomePage.propTypes = {
	showLoader: PropTypes.func.isRequired,
	hideLoader: PropTypes.func.isRequired,
	setCountry: PropTypes.func.isRequired,
	setPage: PropTypes.func.isRequired,
	setMonth: PropTypes.func.isRequired,
}

export default HomePage;
