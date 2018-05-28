import React from 'react';
import { Helmet } from 'react-helmet';

class NotFound extends React.Component {

	componentWillMount() {
		this.props.setPage('error');
	}

	componentDidMount() {
		this.props.triggerAnalytics();
		this.props.hideLoader();
	}

	render() {

		const meta = {
			title: 'ERROR',
			description: 'Error page description'
		};

		return (
			<div className="page-not-found">

				<Helmet>
					<title>{meta.title}</title>
					<meta name="description" content={meta.description} />
					<meta property="og:title" content={meta.title} />
					<meta property="og:description" content={meta.description} />
				</Helmet>

				<div className="error-content">
					<span className="page-title error-title">Uh Oh!</span>
					<h1 className="sub-title error-title">Something went wrong</h1>
					<p>Sorry about that. Please <a href="/">return to the homepage</a> and try again.</p>
				</div>

			</div>
		)
	}
}

export default NotFound;
