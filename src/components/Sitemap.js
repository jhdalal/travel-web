import React from 'react';
import download from 'downloadjs';

import { getPosts } from '../helpers'

import countries from '../data/countries';
import months from '../data/months';

const pages = ['timeline', 'weather'];

/**
* -Sitemap-
* Generates a sitemap
**/
class Sitemap extends React.Component {

	state = {
		ready: false,
		events: {},
		XML: null,
	}

	constructXML = () => {

const XML =
`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
	<url>
		<loc>${window.CANONICAL}</loc>
	</url>${ /* Country specific pages for each month (timelines and weather) */
		pages.map( (page) => {
			return Object.keys(countries).map( (country, i) => {
				return Object.keys(months).map( (month, j) => {
					return (`
	<url>
		<loc>${window.CANONICAL}/${page}/${country}/${month}</loc>
	</url>`
					);
				}).join('');
			}).join('')
		}).join('')
	}
	${ /* Event pages */
		Object.keys(countries).map( (country, i) => {
			return this.state.events[country].map( (event, j) => {
				return (`
	<url>
		<loc>${window.CANONICAL}/event/${country}/${event.slug}</loc>
	</url>`
				)
			}).join('');
		}).join('')
	}
</urlset>`;

		this.setState({
			XML
		})
	}

	runQuery = (country) => {

		return new Promise((resolve, reject) => {

			// Query for Laravel
			const query = `event/all/${country}`;

			// Load events
			getPosts(query)
			.then( response => {

				this.setState({
					events: {
						...this.state.events,
						[country]: response.data
					},
				}, resolve);

			}).catch( error => {
				console.error(error);
				reject();
			});
		});
	}

	downloadSitemap = (e) => {
		e && e.preventDefault();

		download(this.state.XML, 'sitemap.xml', 'text/xml');
	}

	componentDidMount() {

		// Get events for each country so that we have slug
		Promise.all( Object.keys(countries).map( country => this.runQuery(country) ) )
		.then(values => {

			this.setState({
				ready: true,
			});

			this.constructXML();
		});
	}

	render() {

		return (
			<div className="page-sitemap">

				<h1 className="page-title">Sitemap</h1>

				{ ! this.state.ready &&
					<pre>loading...</pre>
				}

				{ this.state.ready &&
					<span>

						<p><a className="btn download-btn" onClick={this.downloadSitemap}>Download sitemap.xml</a></p>

						<h2 className="sub-title">Preview</h2>

						<pre>
							{this.state.XML}
						</pre>
					</span>
				}
			</div>
		)
	}
}

export default Sitemap;
