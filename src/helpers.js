import axios from 'axios';
import sanitizeHtml from 'sanitize-html-react';

/**
* -getCountryName-
* @param {int}{string} country - ID or name of country
* @returns {string} country
* Ensures country is in string format
**/
export function getCountryName(country) {

	country = (country.length === 1 || undefined) ? parseInt(country, 10) : country;

	switch (country) {
		case 1:
		case 'japan':
			return 'Japan';
		case 2:
		case 'burma':
			return 'Burma';
		case 3:
		case 'vietnam':
			return 'Vietnam';
		case 4:
		case 'cambodia':
			return 'Cambodia';
		case 5:
		case 'laos':
			return 'Laos';
		default:
			return 'Unknown';
	}
}

/**
* -getCountryID-
* @param {int}{string} country - ID or name of country
* @returns {string} country
* Ensures country is in int format
**/
export function getCountryID(country) {

	country = (country.length === 1 || undefined) ? parseInt(country, 10) : country.toLowerCase();

	switch (country) {
		case 1:
		case 'japan':
		return 1;
		case 2:
		case 'burma':
		return 2;
		case 3:
		case 'vietnam':
		return 3;
		default:
		return 0;
	}
}

/**
* -sanitize-
* @param {string} html
* @returns {string} html
* sanitizes html and removes empty tags
**/
export function sanitize(html) {

	let sanitized = sanitizeHtml(html, {
		allowedTags: [
			...sanitizeHtml.defaults.allowedTags,
			'img', 'figure', 'iframe', 'figcaption', 'video', 'source',
		],
		allowedAttributes: {
			...sanitizeHtml.defaults.allowedAttributes,
			iframe: [ 'src', 'width', 'height' ],
			video: [ 'controls', 'width', 'height' ],
		  source: [ 'src' ],
			'*': [ 'style' ],
		},
		selfClosing: [
			...sanitizeHtml.defaults.selfClosing,
			'source',
		],
		transformTags: {
	    '*': function(tagName, attribs) {

				// Remove line height
				if( attribs.style ) {
					attribs.style = attribs.style.replace(/line-height:\s\d+.+;/g, '');
				}

        return {
          tagName: tagName,
          attribs: attribs
        };
	    }
	  },
		textFilter: function(text) {

			// // Ellipsis
			text = text.replace(/\.\.\./, '&hellip;');

      return text;
    }
	});

	// Remove empty p tags
	sanitized = sanitized.replace(/<p>\s*<\/p>/g, '');

	return sanitized;
}

/**
* -getPosts-
* @param {string} post_type
* @returns {object} posts
* Gets posts from WP-API for a given post type
**/
export function getPosts(query) {

	return new Promise((resolve, reject) => {

		// localhost
		var query_url = `${window.ROOT}/laravel/public/fetch/${query}`;

		axios.get(query_url)
		.then( response => {

			// Check returned data is object
			if( response ) {

				// Parse any content through sanitizer
				if( Array.isArray(response.data) ) {

					response.data.forEach( data => {

						if( data.content ) {

							data.content = sanitize(data.content);
						}
					});

				} else {

					if( response.data.content ) {

						response.data.content = sanitize(response.data.content);
					}
				}

				resolve(response);

			} else {
				reject('no posts');
			}
		})
		.catch( error => {
			reject(error);
		});
	});
}

/**
* -areEqualShallow-
* @param {object}
* @param {object}
* @returns {bool}
* Checks for object equality
**/
export function areEqualShallow(a, b) {
	for(var key_a in a) {
		if(!(key_a in b) || a[key_a] !== b[key_a]) {
			return false;
		}
	}
	for(var key_b in b) {
		if(!(key_b in a) || a[key_b] !== b[key_b]) {
			return false;
		}
	}
	return true;
}

/**
* -delay-
* @param {int} time
* @returns {promise}
* Checks for object equality
**/
export function wait(t) {
	return new Promise((resolve, reject) => {
		setTimeout(resolve, t)
	});
}

/**
* -capitalise-
* @param {string}
* @returns {string}
* Capitalises whatever you give it
**/
export function capitalise(string) {
	string = string.charAt(0).toUpperCase() + string.slice(1);
	return string;
}

/**
* -toFahrenheit-
* @param {int}
* @returns {int}
* Convert and round Celsius to toFahrenheit
**/
export function toFahrenheit(c) {
	const f = Math.round(c * 9 / 5 + 32);
	return f;
}