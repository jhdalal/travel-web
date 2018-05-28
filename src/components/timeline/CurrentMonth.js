import PropTypes from 'prop-types';
import React from 'react';
import { TimelineMax, TweenMax, Power0, Power3 } from 'gsap'
import { ImageHelper } from 'react-preload';
import TransitionGroup from 'react-transition-group/TransitionGroup';
import { wait } from '../../helpers';
import months from '../../data/months';

/**
* -CurrentMonth-
* Timeline page - month list
**/
class CurrentMonth extends React.Component {

	state = {
		monthname: months[this.props.month].name,
		preloadImages: [
			`${window.AWS}/images/bg_${this.props.country}.jpg`,
		]
	}

	updateMonth() {

		this.setState({
			monthname: months[this.props.month].name,
			preloadImages: [
				`${window.AWS}/images/bg_${this.props.country}.jpg`,
			],
		}, () => {

			// Preload Images
			ImageHelper
			.loadImages(this.state.preloadImages)
			.then( () => {

				this.props.reportReady('currentmonth');

			}).catch( (error) => console.error(error) );
		});
	}

	componentDidMount() {

		this.updateMonth();
	}

	componentDidUpdate(prevProps, prevState) {

		// New month
		if( prevProps.month !== this.props.month ) {

			this.props.reportUnReady('currentmonth');

			wait(900).then( () => {
				this.updateMonth();
			});
		}

		// New country
		if( prevProps.country !== this.props.country ) {

			this.props.reportUnReady('currentmonth');

			wait(900).then( () => {
				this.updateMonth();
			});
		}
	}

	render() {

		return (
			<TransitionGroup>
				{ this.props.isReady &&
					<CurrentMonthContainer
						{...this.props}
						{...this.state}
					/>
				}
			</TransitionGroup>
		)
	}
}

class CurrentMonthContainer extends React.Component {

	leaveAnimation(cb) {

		const monthtitle = this.refs.monthtitle;

		const tl = new TimelineMax({
			onComplete: cb
		});
		tl.to(monthtitle, 1, { x: '-=400', opacity: 0, ease: Power3.easeOut, clearProps: 'all' });
	}

	enterAnimation(cb, type = 'load') {

		const monthtitle = this.refs.monthtitle;
		const delay = ( type === 'load' ) ? 0.25 : 0.75;

		this.enterAnimationTween = new TimelineMax({
			delay: delay,
			onComplete: cb
		});
		this.enterAnimationTween.from(monthtitle, 1, { x: '+=25%', opacity: 0, force3D: true });
	}

	componentWillAppear(cb) {

		this.enterAnimation(cb);
  }

	componentWillEnter(cb) {

		this.enterAnimation(cb);
  }

	componentWillLeave(cb) {

		this.leaveAnimation(cb);
  }

	componentDidMount() {

		const monthtitle = this.refs.monthtitle;
		this.tween = TweenMax.to(monthtitle, 1, { x: '-100%', force3D: true, ease: Power0.easeNone, paused: true });

		// Move month across page if more than 1 event
		if (this.props.eventsCount > 1) {
			this.tween.progress(this.props.progress);
		}
	}

	componentDidUpdate(prevProps, prevState) {

		// Keep progress up to date
		if ((prevProps.progress !== this.props.progress) && this.props.eventsCount > 1) {
			this.tween.progress(this.props.progress);
		}
	}

	render() {

		return (
			<div className="timeline-month-bg">
				<div className="background" style={{backgroundImage: `url(${this.props.preloadImages[0]})`}}></div>

				<h1 className="month-title" ref="monthtitle">
					<div className="month-title-text">{this.props.monthname}</div>
				</h1>
			</div>
		)
	}
}

export default CurrentMonth;

CurrentMonth.propTypes = {
	country: PropTypes.string,
	month: PropTypes.string.isRequired,
	progress: PropTypes.number.isRequired,
	reportReady: PropTypes.func.isRequired,
	reportUnReady: PropTypes.func.isRequired,
	isReady: PropTypes.bool,
	eventsCount: PropTypes.number
}
