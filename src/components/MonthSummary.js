import PropTypes from 'prop-types';
import React from 'react';
import { TimelineMax, Power4, Power3 } from 'gsap';
import TransitionGroup from 'react-transition-group/TransitionGroup';
import Measure from 'react-measure';
import _ from 'lodash';
import { Link } from 'react-router';

import { getPosts, wait } from '../helpers';

/**
* -MonthSummary-
* Month Summary
* Content is in HomepageContainer below. This is used for transitions
**/
class MonthSummary extends React.Component {

	state = {
		overviewItems: {},
		currentMonth: this.props.month,
		showSummary: false,
		currentOverview: {},
	}

	enterAnimation(cb) {

		const animation_bg = '.month-summary-animation';
		const element_bg = '.month-summary-background';
		const content = '.month-summary-content';
		const CTAButton = '.month-summary-cta-button';

		const tl = new TimelineMax({
			onComplete: cb
		});
		tl.set(animation_bg, { transformOrigin: '0% 100%' });
		tl.set(element_bg, { opacity: 0 });
		tl.fromTo(animation_bg, 0.55, { scaleX: 0.05, scaleY: 0, ease: Power4.easeOut }, { scaleY: 1 });
		tl.to(animation_bg, 0.4, { scaleX: 1, ease: Power3.easeIn });
		tl.set(animation_bg, { transformOrigin:' 100% 0%' });
		tl.set(element_bg, { opacity: 1 });
		tl.to(animation_bg, 0.4, { scaleX: 0, ease: Power3.easeOut });
		tl.fromTo([content, CTAButton], 0.5, { autoAlpha: 0, ease: Power3.easeOut }, { autoAlpha: 1 }, '-=0.4');
		tl.set([content, CTAButton], { clearProps: 'all' });
	}

	getOverview = () => {

		const country = this.props.country;

		// Filter overview items array down to the one for this month
		const monthRegex = this.props.month.toLowerCase().replace(/\b[a-z](?=[a-z]{2})/g, (letter) => { return letter.toUpperCase() } );

		const filtered = this.state.overviewItems[country] && this.state.overviewItems[country].filter(overview => overview.month === monthRegex)[0];
		_.pull(filtered, undefined);

		// Set it as the current month
		this.setState({
			currentOverview: filtered,
			showSummary: true,
		}, () => {
			this.props.reportReady('monthsummary');
		});
	};

	runQuery = (country) => {

		return new Promise((resolve, reject) => {

			// Check state (cache) or query
			if( this.state.overviewItems[country] ) {
				resolve();
			} else {

				// Query
				const query = `overview/all/${country}`;

				// Load events
				getPosts(query)
				.then( response => {

					// Split into countries as can be multiple (vietnam, cambodia, laos)
					const overviews = _.groupBy(response.data, 'nation');

					Object.keys(overviews).forEach( (key, i) => {

						this.setState({
							overviewItems: {
								...this.state.overviewItems,
								[country]: response.data, // stored to aid caching
								[key.toLowerCase()]: overviews[key],
							}
						}, () => {

							if( i === Object.keys(overviews).length - 1 ) {
								resolve();
							}
						});
				 	});

				}).catch( error => {
					this.context.router.transitionTo(`/error`);
				});
			}
		});
	}

	getNewCountry = (instant) => {

		this.props.reportUnReady('monthsummary');

		const country = this.props.country;

		this.setState({
			showSummary: false
		});

		// Wait for data and anitmation
		const delay = instant ? 0 : 550;
		Promise
			.all([wait(delay), this.runQuery(country)])
			.then(this.getOverview);
	}

	componentDidMount () {
		console.log("CurrentMonth::componentDidMount")
		this.getNewCountry(true);
	}

	componentDidUpdate(prevProps, prevState) {

		// On month change, filter the currently-fetched data for the new month's overview
		if(this.props.month !== prevState.currentMonth){

			this.props.reportUnReady('monthsummary');

			this.setState({
				currentMonth: this.props.month,
				showSummary: false,
			});

			// Wait for animation to finish
			wait(550).then(this.getOverview);
		}

		// On country change, query the database for the new country's overview
		if(this.props.country !== prevProps.country){

			this.getNewCountry();
		}

		// Visibility
		if (this.props.visible !== prevProps.visible) {

			if( this.props.visible === true ){

				this.setState({
					showSummary: true
				});

			} else {

				this.setState({
					showSummary: false
				});
			}
		}
	}

	render() {

		return (
			<TransitionGroup component="div">
				{ this.state.showSummary && this.props.isReady &&
					<MonthSummaryContainer
						enterAnimation={this.enterAnimation}
						{...this.props}
						{...this.state}
					/>
				}
			</TransitionGroup>
		)
	}
}

/**
* -MonthSummaryContainer-
* MonthSummary content wrapper
**/
class MonthSummaryContainer extends React.Component {

	state = {
		outer: {
			height: 0,
		},
		inner: {},
		showCTA: false,
	}

	toggleCTA = (e) => {
		e.preventDefault();

		this.setState({
			showCTA: !this.state.showCTA,
		});
	}

	updateScreenSize = () => {

		this.setState({
			vpw: window.innerWidth
		});
	}

	componentWillMount() {

		this.updateScreenSize();
	}

	componentDidMount() {

		window.addEventListener('resize', this.updateScreenSize);
	}

	componentWillUnmount() {

		window.removeEventListener('resize', this.updateScreenSize);
	}

	componentWillAppear(cb) {

		this.props.enterAnimation(cb);
  }

	componentWillEnter(cb) {

		this.props.enterAnimation(cb);
  }

	render() {

		// Tabs
		let showTabs;
		switch(this.props.country) {
			case 'vietnam' :
			case 'cambodia' :
			case 'laos' :
				showTabs = true;
				break;
			default :
				showTabs = false;
		}

		return (
			<div className={`month-summary ${this.props.country} showCTA-${this.state.showCTA}`} style={{height: `${parseFloat(this.state.outer.height)}px`}}>

				<div className="month-summary-animation"></div>
				<div className="month-summary-background"></div>

				{/* <Measure onMeasure={(dimensions) => this.setState({ outer:  {...dimensions}}) }>
					<div
						className="month-summary-content"
						onWheel={ (e) => { if( this.state.inner.height > (this.state.outer.height - 80)) { e.stopPropagation(); } } }
					>
						<Measure onMeasure={(dimensions) => this.setState({ inner:  {...dimensions}}) }>
							<div>
								<div className="month-summary-contentCopy">

									{ showTabs &&
										<ul className="tab-list">
											<li
												onClick={ () => this.props.changeTabCountry('vietnam') }
												className={`tab isSelected-${this.props.country === 'vietnam'}`}
											>
												<Link to={`/${this.props.page}/vietnam/${this.props.month}`} onClick={ e => e.preventDefault() }>
													Vietnam
												</Link>
											</li>
											<li
												onClick={ () => this.props.changeTabCountry('cambodia') }
												className={`tab isSelected-${this.props.country === 'cambodia'}`}
											>
												<Link to={`/${this.props.page}/cambodia/${this.props.month}`} onClick={ e => e.preventDefault() }>
													Cambodia
												</Link>
											</li>
											<li
												onClick={ () => this.props.changeTabCountry('laos') }
												className={`tab isSelected-${this.props.country === 'laos'}`}
											>
												<Link to={`/${this.props.page}/laos/${this.props.month}`} onClick={ e => e.preventDefault() }>
													Laos
												</Link>
											</li>
										</ul>
									}

									<MonthSummaryContent overview={this.props.currentOverview} toggleCTA={this.toggleCTA} props={this.props} />

									{ ! this.state.showCTA && (this.state.vpw < 1200) &&
										<CTAButton country={this.props.country} toggleCTA={this.toggleCTA} />
									}

								</div>

								<CTAContent overview={this.props.currentOverview} country={this.props.country} toggleCTA={this.toggleCTA} />

							</div>
						</Measure>

					</div>
				</Measure>

				{ ! this.state.showCTA && (this.state.vpw >= 1200) &&
					<CTAButton country={this.props.country} toggleCTA={this.toggleCTA} />
				} */}

			</div>
		)
	}
}

const MonthSummaryContent = ({
	overview,
	props,
	toggleCTA,
}) => {

	return (
		<span>
			<h2 className="sub-title">{overview.month} in {overview.nation}</h2>

			{ props.isEventItem ? (
        <Link onClick={ (e) => props.goToWeather(e) } to={`/weather/${props.country}/${props.currentMonth}`} className="caps-link">Explore regional weather <svg className="icon"><use xlinkHref="#right_arrow" /></svg></Link>
      ) : (
        <Link onClick={ (e) => props.goToTimeline(e) } to={`/timeline/${props.country}/${props.currentMonth}`} className="caps-link">Explore regional events <svg className="icon"><use xlinkHref="#right_arrow" /></svg></Link>
      )}

			<div className="user-content" dangerouslySetInnerHTML={ {__html: overview.content} }></div>

		</span>
	)
};

const CTAButton = ({
	country,
	toggleCTA,
}) => {

	// concept of nation being vietnam if country is vietnam/cambodia/laos
	let nation;
	switch(country) {
		case 'vietnam' :
		case 'cambodia' :
		case 'laos' :
			nation = 'vietnam';
			break;
		default :
			nation = country;
	}

	return (
		<div className="month-summary-cta-button" onClick={toggleCTA}>
			<a className="btn">Plan your trip with</a>
			<svg className="icon"><use xlinkHref={`#inside_${nation}_logo`} /></svg>
		</div>
	)
};

const CTAContent = ({
	overview,
	country,
	toggleCTA,
}) => {

	// concept of nation being vietnam if country is vietnam/cambodia/laos
	let nation;
	switch(country) {
		case 'vietnam' :
		case 'cambodia' :
		case 'laos' :
			nation = 'vietnam';
			break;
		default :
			nation = country;
	}

	return (
		<div className="month-summary-CTACopy">

			<a href="true" className="close btn-sml" onClick={toggleCTA}><svg><use xlinkHref="#close" /></svg></a>

			<h2 className="title">Plan your trip with <svg className="icon"><use xlinkHref={`#inside_${nation}_logo`} /></svg></h2>

			{ overview.contact_cms &&
				<div className="user-content" dangerouslySetInnerHTML={ {__html: overview.contact_cms} }></div>
			}

			<ul>
				<li>
					<svg className="icon"><use xlinkHref="#phone" /></svg>
					<a href={`tel:${overview.phone_number}`}>{overview.phone_number}</a>
				</li>
				<li>
					<svg className="icon"><use xlinkHref="#mail" /></svg>
					<a href={`mailto:${overview.email_address}`}>{overview.email_address}</a>
				</li>
				<li>
					<svg className="icon"><use xlinkHref="#mouse" /></svg>
					<a href={overview.site_link}>{overview.site_link.replace('https://', '').replace('http://', '').replace('www.', '').replace(/\/$/, '')}</a>
				</li>
				<li>
					<svg className="icon"><use xlinkHref="#brochure" /></svg>
					<a href={overview.brochure_link_target}>{overview.brochure_link_text}</a>
				</li>
			</ul>
		</div>
	)
};

MonthSummary.propTypes = {
	month: PropTypes.string.isRequired,
	country: PropTypes.string.isRequired,
	page: PropTypes.string.isRequired,
	isEventItem: PropTypes.bool,
	visible: PropTypes.bool,
	isReady: PropTypes.bool,
	reportReady: PropTypes.func,
	goToWeather: PropTypes.func,
	goToTimeline: PropTypes.func,
	changeTabCountry: PropTypes.func,
	reportUnReady: PropTypes.func.isRequired,
}

MonthSummary.defaultProps = {
	visible: true
}

MonthSummary.contextTypes = {
	router: PropTypes.object
}

export default MonthSummary;
