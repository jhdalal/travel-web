import PropTypes from 'prop-types';
import React from 'react';
import _ from 'lodash';
import { TweenMax, TimelineMax, Power3, Power4 } from 'gsap';
import Measure from 'react-measure';
import { Link } from 'react-router';

/**
* -EventItem-
* Timeline page - event item
**/
class EventItem extends React.Component {

	state = {
		onScreen: false,
		shown: false,
		hover: false,
	}

	enterAnimation() {

		const { animation, image, title, location } = this.refs;

		const staggerTargets = location ? [title, image, location] : [title, image];

		const tl = new TimelineMax({
			delay: 0.45,
		});
		tl.set('.timeline-event-items-wrapper', { clearProps: 'all' });
		tl.set(animation, { transformOrigin: '0% 100%' });
		tl.fromTo(animation, 0.55, { scaleX: 0.05, scaleY: 0, ease: Power4.easeOut }, { scaleY: 1 });
		tl.to(animation, 0.4, { scaleX: 1, ease: Power3.easeIn });
		tl.set(animation, { transformOrigin:' 100% 0%' });
		tl.to(animation, 0.4, { scaleX: 0, ease: Power3.easeOut });
		tl.staggerFromTo(staggerTargets, 0.5, { autoAlpha: 0, ease: Power3.easeOut }, { autoAlpha: 1 }, 0.15, '-=0.4');
	}

	handlePosition = ( type = 'scroll' ) => {

		const left = this.refs.element.getBoundingClientRect().left;
		const triggerOffest = this.props.windowWidth * 0.95;

		if( left < triggerOffest ) {

			// Stagger show on initial load, delay for inital, not for tab change
			let delay;
			switch( type ) {
				case 'initial':
					delay = (this.props.index * 200) + 750;
					break;
				case 'tabbed':
					delay = (this.props.index * 200);
					break;
				default:
					delay = 0;
			}

			setTimeout( () => {
				if (this.refs.element) {

					this.setState({ shown: true });
				}
			}, delay);
		}
	}

	handleDimensions = (dimensions) => {

		this.setState({
			...this.state,
			dimensions
		});
	}

	handleMouseMove = (e) => {

		const { browser } = this.props;

		if( browser === 'Edge' || browser === 'IE' ) {
			return;
		} else {

			const amp = 0.25;

			const cx = this.state.dimensions.width / 2;
			const cy = this.state.dimensions.height / 2;
			const dx = e.nativeEvent.offsetX - cx;
			const dy = e.nativeEvent.offsetY - cy;

			const tiltx = (dy / cy);
			const tilty = - (dx / cx);
			const radius = Math.sqrt(Math.pow(tiltx,2) + Math.pow(tilty,2));
			const degree = (radius * 20);

			TweenMax.set(this.refs.element_wrapper, { transform:'rotate3d(' + tiltx*amp + ', ' + tilty*amp + ', 0, ' + degree*amp + 'deg)' });
		}
	}

	handleMouseLeave = (e) => {

		TweenMax.to(this.refs.element_wrapper, 0.8, { transform: 'rotate3d(0, 0, 0, 0deg)', ease: Power3.easeOut });
	}

	componentDidMount() {

		this.handlePosition();
	}

	componentDidUpdate(prevProps, prevState) {

		// Update position on draggable update
		if( prevProps.timelineProgress !== this.props.timelineProgress ){

			this.handlePosition();
		}

		if( prevState.shown !== this.state.shown ) {

			this.enterAnimation();
		}
	}

	render() {

		// Post data
		const country = this.props.country;
		const event = this.props.event_single;
		const image = event.thumbnail_url;
		const alt = event.name;
		const slug = event.meta.slug;
		const location = event.locations.length === 1 ? event.locations[0].name : event.nation;

		return (
			<Measure onMeasure={ this.handleDimensions }>
				<li
					className={`timeline-event-item`}
					onClick={ e => this.props.goToSingle(e, slug) }
					onMouseEnter={ () => { this.setState({ hover: true }) } }
					onMouseLeave={ () => { this.setState({ hover: false }) } }
					ref="element"
				>
					<Link
						to={`/event/${country}/${slug}`}
						onClick={ e => e.preventDefault() }
						className="timeline-event-item-wrapper"
						onMouseMove={this.handleMouseMove}
						onMouseLeave={ this.handleMouseLeave }
					>
						<div ref="element_wrapper">
							<div className="timeline-event-item-animation-wrapper">
								<img src={ image } alt={ alt } className="event-item-image" ref="image" />
								<div className="timeline-event-item-animation" ref="animation"></div>
							</div>

							<div className="event-item-title-container" ref="title">

								<h2 className="event-item-title">{ event.name }</h2>

								<div className={`btn-sml ${this.state.hover ? 'hover' : null}`}>
									<svg><use xlinkHref="#right_arrow" /></svg>
								</div>

							</div>

							{ location &&
								<h3 className="event-item-location" ref="location">
									<svg className="icon"><use xlinkHref="#pin" /></svg>
									{ location }
								</h3>
							}
						</div>
					</Link>
				</li>
			</Measure>
		)
	}
}

EventItem.propTypes = {
	index: PropTypes.number.isRequired,
	event_single: PropTypes.object.isRequired,
	goToSingle: PropTypes.func.isRequired,
	timelineProgress: PropTypes.number.isRequired,
	windowWidth: PropTypes.number.isRequired,
	browser: PropTypes.string,
	country: PropTypes.string,
}

export default EventItem;
