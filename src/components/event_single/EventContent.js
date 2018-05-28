import React from 'react';
import Measure from 'react-measure';

import Map from '../googlemaps/';

/**
* -EventContent-
* Event content
**/
class EventContent extends React.Component {

	updateVideoSize = () => {

		const videos = Array.from(document.querySelectorAll('iframe[src*=youtube], iframe[src*=vimeo]'));

		videos.forEach( (video) => {

			const original_width = parseInt(video.getAttribute('width'), 10);
			const original_height = parseInt(video.getAttribute('height'), 10);

			const new_width = parseInt(this.props.inner.width, 10);
			const new_height = Math.round(new_width * (original_height / original_width));

			video.setAttribute('width', new_width);
			video.setAttribute('height', new_height);
		});
	}

	formatCTA = () => {

		const CTAs = Array.from(document.querySelectorAll('figure.image'));

		CTAs.forEach( (CTA) => {

			// Wrapper
			const wrapperDiv = document.createElement('div');
			wrapperDiv.classList.add('cta-wrapper');

			// Title
			const title = CTA.querySelector('img').getAttribute('alt');

			if( title ) {

				const titleNode = document.createTextNode(title);
				const titleDiv = document.createElement('div');
	 			titleDiv.classList.add('image-title');
				titleDiv.appendChild(titleNode);

				wrapperDiv.appendChild(titleDiv);
			}

			// Caption
			const caption = CTA.querySelector('figcaption');

			if( caption ) {

				wrapperDiv.appendChild(caption);
			}

			CTA.appendChild(wrapperDiv);
		});
	}

	componentDidMount() {

		// Create correct CTA markup
		this.formatCTA();
	}

	componentDidUpdate(prevProps, prevState) {

		// New width - update videos
		if( prevProps.inner.width !== this.props.inner.width ) {

			this.updateVideoSize();
		}
	}

	render() {

		const { event, dateMeta } = this.props;

		const initialLocation = (event.markers.length > 0) ? {lat: event.markers[0].location.lat, lng: event.markers[0].location.lng} : null;

		return (
			<div>

				<h1 className="page-title">{event.name}</h1>

				{ (dateMeta || event.location) &&
					<ul className="details">

						{ dateMeta &&
							<li>
								<svg className="detail-icon"><use xlinkHref="#clock" /></svg>
								<span className="detail-text">{ dateMeta }</span>
							</li>
						}

						{ event.location &&
							<li>
								<svg className="detail-icon"><use xlinkHref="#pin" /></svg>
								<span className="detail-text">{ event.location }</span>
							</li>
						}
					</ul>
				}

				{ event.intro &&
					<div className="user-content intro" dangerouslySetInnerHTML={ {__html: event.intro} }></div>
				}

				{/* Main page content from CMS */}
				<Measure onMeasure={(dimensions) => this.props.handleInnerDimensions(dimensions)}>
					<div className="user-content" dangerouslySetInnerHTML={ {__html: event.content} }></div>
				</Measure>

				{ (event.markers && event.markers.length > 0) &&
					<Map
						initialLocation={initialLocation}
						markers={event.markers}
						customControls={true}
						fitBounds={true}
						options={
							{
								scrollwheel: false,
								gestureHandling: 'cooperative',
								maxZoom: 10
							}
						}
						isReady={true}
						isEvent={true}
					/>
				}

				{ (event.find_out_link || event.brochure_link) &&
					<div className="btn-container">
            { event.find_out_link &&
							<a href={event.find_out_link} className="btn" target="_blank">Find Out More</a>
            }
            { event.brochure_link &&
							<a href={event.brochure_link} target="_blank" className="btn download-btn">Download brochure</a>
            }
					</div>
				}

			</div>
		);
	}
}

export default EventContent;
