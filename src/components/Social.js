import PropTypes from 'prop-types';
import React from 'react';

class Social extends React.Component {

	render() {

		const url = encodeURI(window.location.href);
		const text = encodeURIComponent(`IAT When to Travel - ${this.props.content.text}`);
		const image = encodeURI(this.props.content.image);

		return (
			<div className="share">

				<h5 className="caps">Share</h5>

				<ul className="share-list">
					<li className="fb">
						<a className="share-link btn-sml" href={`https://www.facebook.com/sharer/sharer.php?u=${url}`}><svg><use xlinkHref="#facebook" /></svg></a>
					</li>
					<li className="tw">
						<a className="share-link btn-sml" href={`https://twitter.com/intent/tweet?url=${url}&text=${text}`}><svg><use xlinkHref="#twitter" /></svg></a>
					</li>
					<li className="pin">
						<a className="share-link btn-sml" href={`https://pinterest.com/pin/create/button/?url=${url}&media=${image}&description=${text}`}><svg><use xlinkHref="#pinterest" /></svg></a>
					</li>
				</ul>

			</div>
		)
	}
}

export default Social;

Social.propTypes = {
	content: PropTypes.object.isRequired
}
