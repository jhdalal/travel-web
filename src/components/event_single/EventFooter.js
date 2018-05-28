import React from 'react';
import PropTypes from 'prop-types';

import ZendeskChat from '../ZendeskChat';

const ScrollMagic = window.ScrollMagic;

/**
* -EventFooter-
* Event footer
**/
class EventFooter extends React.Component {

	state = {
		showChat: false,
	}

	backToTimeline = () => {

		const { country, month, slug } = this.props;

		this.props.showLoader().then( () => {
			this.context.router.transitionTo(`/timeline/${country}/${month}/${slug}`);
		});
	}

	componentDidMount() {

		// Scene is updated in componentDidUpdate on resize
		this.controller = new ScrollMagic.Controller();
		this.scene = new ScrollMagic.Scene();

	  this.scene
      .triggerElement('.social-wrapper')
      .triggerHook(0)
      .setClassToggle('.inner-footer', 'pinned')
      .addTo(this.controller)
			.on('enter', () => {

				this.setState({
					showChat: true,
				});
			})
			.on('leave', () => {

				this.setState({
					showChat: false,
				});
			});
	}

	componentWillUnmount() {

		this.scene.destroy();
	}

	render() {

		// Client's social media page URLS:
		let url, facebookUrl, twitterUrl, pinterestUrl;
		switch(this.props.country) {
			case 'burma':
				url = 'https://www.insideburmatours.com/';
				facebookUrl = 'https://www.facebook.com/InsideAsiaTours';
				twitterUrl = 'https://twitter.com/InsideAsiaTours';
				pinterestUrl = 'https://www.pinterest.co.uk/InsideAsiaTours';
				break;
			case 'laos':
			case 'cambodia':
			case 'vietnam':
				url = 'https://www.insidevietnamtours.com/';
				facebookUrl = 'https://www.facebook.com/InsideAsiaTours';
				twitterUrl = 'https://twitter.com/InsideAsiaTours';
				pinterestUrl = 'https://www.pinterest.co.uk/InsideAsiaTours';
				break;
			default:
				url = 'https://www.insidejapantours.com/';
				facebookUrl = 'https://www.facebook.com/InsideJapanTours';
				twitterUrl = 'https://twitter.com/InsideJapan';
				pinterestUrl = 'https://www.pinterest.co.uk/insidejapan';
		}

		return (
			<span>

				<TimelineBanner
					dateName={this.props.dateName}
					backToTimeline={this.backToTimeline}
				/>

				<footer className={`inner-footer country-${this.props.country}`} ref="inner_footer">

					<div className="country-link"><a href={url} target="_blank"><svg className="icon"><use xlinkHref={`#inside_${this.props.country}_logo`} /></svg></a></div>

					<ul className="footer-social">
						<li><a className="facebook" href={facebookUrl} target="_blank"><svg><use xlinkHref="#facebook" /></svg></a></li>
						<li><a className="twitter" href={twitterUrl} target="_blank"><svg><use xlinkHref="#twitter" /></svg></a></li>
						<li><a className="pinterest" href={pinterestUrl} target="_blank"><svg><use xlinkHref="#pinterest" /></svg></a></li>
					</ul>

					<a className="email-link" href={`mailto:${this.props.contactDetails.email_address}`}>
						<svg><use xlinkHref="#envelope" /></svg>
						<span>{this.props.contactDetails.email_address}</span>
					</a>

					<a className="phone-link" href={`tel:${this.props.contactDetails.phone_number}`}>
						<svg><use xlinkHref="#speech_bubble" /></svg>
						<span>{this.props.contactDetails.phone_number}</span>
					</a>

					<div className="chat">Want to find out more?</div>

					<ZendeskChat
						country={this.props.country}
						show={this.state.showChat}
						dimensions={this.props.dimensions}
					/>

				</footer>

			</span>
		);
	}
}

const TimelineBanner = ({
	dateName,
	backToTimeline,
}) => {
	return (
		<div className="timeline-banner">

			<div className="wrapper">

				<h4 className="sub-title">Discover more in {dateName}</h4>
				<div className="btn-container">
					<a
						onClick={backToTimeline}
						className="btn"
					>
						Back to the timeline
					</a>
				</div>

			</div>

		</div>
	)
}

EventFooter.contextTypes = {
	router: PropTypes.object
}

export default EventFooter;
