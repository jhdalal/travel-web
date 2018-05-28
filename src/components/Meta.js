import PropTypes from 'prop-types';
import React from 'react';
import { Helmet } from 'react-helmet';
import _ from 'lodash';

/**
* -Meta-
* Uses Helmet to control meta and og: data
**/
class Meta extends React.Component {

	render() {

		// Sort out canonical URL for prerender based sharing (production)
		const canonical = _.replace(this.props.canonical, 'iatwtt', 'insideasiatours');

		window.prerenderReady = true;

		// If a screenshot, we don't have the full url, if from backend we do, so check
		const image = _.includes(this.props.image.url, window.ROOT) ? this.props.image.url : `${window.AWS}/images/${this.props.image.url}`;

		return (
			<Helmet>
				<title>{this.props.title}</title>
				<meta name="description" content={this.props.description} />
				<link rel="canonical" href={canonical} />
				<meta charSet={this.props.charset} />
				<meta property="og:type" content="website" />
				<meta property="og:locale" content={this.props.lang} />
				<meta property="og:url" content={canonical} />
				<meta property="og:title" content={this.props.title} />
				<meta property="og:description" content={this.props.description} />
				<meta property="og:image" content={image} />
			</Helmet>
		)
	}
}

Meta.propTypes = {
	title: PropTypes.string,
	description: PropTypes.string,
	canonical: PropTypes.string,
	charset: PropTypes.string,
	lang: PropTypes.string,
	image: PropTypes.object,
}

Meta.defaultProps = {
	title: 'A When to Travel Guide for Japan, Burma, Vietnam, Cambodia & Laos',
	description: 'The Inside Asia Tours When to Travel Guide lets you discover all the best events & things to do, including local weather, for Japan, Burma, Vietnam, Cambodia & Laos.',
	canonical: `${window.location}`,
	charset: 'utf-8',
	lang: 'en_GB',
	image: {
		url: `og_homepage.jpg`,
		width: 500,
		height: 263,
	}
}

export default Meta;
