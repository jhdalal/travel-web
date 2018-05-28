import PropTypes from 'prop-types';
import React from 'react';
import moment from 'moment';
import Measure from 'react-measure';
import { TimelineMax, Power3 } from 'gsap';

import Meta from '../Meta';
import Social from '../Social';
import EventFooter from './EventFooter';
import EventContent from './EventContent';
import PrevNextEvents from './PrevNextEvents';

const ScrollMagic = window.ScrollMagic;

/**
* -EventSingleContainer-
* Event content
**/
class EventSingleContainer extends React.Component {

	state = {
		inner: {
			width: 0,
			height: 0
		},
		outer: {
			width: 0,
			height: 0
		},
		country: this.props.params.country,
	}

	handleOuterDimensions = (dimensions) => {

		this.setState({'outer': {...dimensions}});
	}

	handleInnerDimensions = (dimensions) => {

		this.setState({'inner': {...dimensions}});
	}

	enterAnimation(cb) {

		const page = this.refs.page;
		const pageInner = this.refs.pageInner;
		const image = this.refs.image;
		const month = this.refs.month;
		const title = '.page-title';
		const details = '.details';

		const tl = new TimelineMax({
			delay: 0.25,
			onComplete: cb
		});
		tl.call(this.props.hideLoader);
		tl.set([page, pageInner], { backgroundColor: '#ffffff' });
		tl.from(image, 1, { height: '100vh', ease: Power3.easeOut }, '=0.8');
		tl.from(title, 1, { opacity: 0, ease: Power3.easeOut }, '-=0.6');
		tl.from(details, 1, { opacity: 0, ease: Power3.easeOut }, '-=0.8');
		tl.from(month, 1.2, { x: '-100%', ease: Power3.easeOut }, '-=1.1');
		tl.staggerFromTo('.share-list li', 0.35, { opacity: 0, delay: 0.25, ease: Power3.easeOut }, { opacity: 1 }, 0.15, '-=0.25');
	}

	componentWillAppear(cb) {

		this.enterAnimation(cb);
	}

	componentWillEnter(cb) {

		this.enterAnimation(cb);
	}

	componentDidMount() {

		// Scene is updated in componentDidUpdate on resize
		this.controller = new ScrollMagic.Controller();
		this.scene = new ScrollMagic.Scene();

		this.scene
			.triggerElement(this.refs.page)
			.triggerHook(0.5)
			.duration( window.outerHeight - document.getElementsByClassName('inner-footer')[0].clientHeight )
			.setPin('.social-wrapper', { pushFollowers: false, spacerClass: 'social-wrapper-spacer' })
			.reverse(true)
			.addTo(this.controller);
	}

	componentDidUpdate(prevProps, prevState) {

		// New dimensions - update scene
		if( prevState.outer.height !== this.state.outer.height ) {

			this.scene
				.offset(this.state.outer.height * 0.4);
		}
	}

	render() {

		// Post data
		const event = this.props.eventSingle[0];

		// Meta data for page
		const meta = {
			title: `IAT When to Travel - ${event.meta.title}`,
			description: event.meta.description,
			image: {
				url: event.thumbnail_url,
			}
		};

		const featuredImageStyle = {
			backgroundImage: `url(${event.image_url})`
		}

		// Date - range or month categories
		let dateMeta;
		const dateStart = event.date_start.date;
		const dateStartName = moment(dateStart).format('MMMM');
		const dateEnd = event.date_end.date;
		const dateEndName = moment(dateEnd).format('MMMM');
		const dateName = dateStartName;
		const month = moment(dateStart).format('MMMM').toLowerCase();

		// Format date meta
		if( dateStart || dateEnd ) {

			dateMeta = (dateEnd && (dateStartName !== dateEndName)) ? dateStartName +' - '+ dateEndName : dateStartName;
		}

		// Store data to pass to Social component for social media share intents:
		const socialContent = {
			text: event.name,
			image: event.image_url
		};

		return (
			<div className="page-event" ref="page">

				<Meta {...meta} />

				<a
					onClick={ () => {
						this.props.showLoader().then( () => {
							this.context.router.transitionTo(`/timeline/${this.props.country}/${this.props.month}/${this.props.params.slug}`);
						});
					}}
					className="header-timeline-btn btn"
				>
					Back to the timeline
				</a>

				<Measure onMeasure={(dimensions) => this.handleOuterDimensions(dimensions)}>
					<div>

						<div className="inner-page-header-background" style={featuredImageStyle} ref="image"></div>

						{ /* Big month */ }
						<h3 className="huge-title" ref="month">{dateName}</h3>

						<div className={`wrapper inner-page-wrapper country-${this.props.params.country}`} ref="pageInner">

							{ /* Social sharing */ }
							<div className="social-wrapper pin-change" ref="social">
								<Social content={socialContent} />
							</div>

							{ /* Page content wrapper */ }
							<div className="content-area">

								<EventContent
									event={event}
									dateMeta={dateMeta}
									handleInnerDimensions={this.handleInnerDimensions}
									inner={this.state.inner}
								/>

								{/* Prev / Next Events */}
								<PrevNextEvents
									country={this.state.country}
									event={event}
									allEvents={this.props.allEvents}
									showLoader={this.props.showLoader}
								/>
							</div>

						</div>

						<EventFooter
							country={this.state.country}
							month={month}
							slug={this.props.params.slug}
							dateName={dateName}
							contactDetails={this.props.contactDetails}
							showLoader={this.props.showLoader}
							dimensions={this.state.outer}
						/>

					</div>
				</Measure>

			</div>
		);
	}
}

EventSingleContainer.contextTypes = {
	router: PropTypes.object
}

export default EventSingleContainer;
