import PropTypes from 'prop-types';
import React from 'react';
import ReactCSSTransitionGroup from 'react-transition-group/CSSTransitionGroup';
import Toggle from './Toggle';
import { Link } from 'react-router';

class Header extends React.Component {

	state = {
		showLogo: true,
		showNav: false,
		showToggle: false,
		showBackToTimeline: false,
	};

	goToPage = (e, page) => {
		e.preventDefault();

		switch(page) {
			case 'homepage':

				if( this.props.page !== 'homepage' ) {
					this.props.showLoader().then( () => {
						this.context.router.transitionTo(`/`);
					});
				}

			break;

			case 'vietnam':
			case 'japan':
			case 'burma':

				if (this.props.page === 'timeline') {

					if (this.props.country !== page) {

						this.props.showLoader().then( () => {

							this.context.router.transitionTo(`/${(this.state.showToggle === false) ? 'timeline' : this.state.showToggle}/${page}/${this.props.month}`);
						});
					}
				} else {
					this.props.showLoader().then( () => {

						this.context.router.transitionTo(`/${(this.state.showToggle === false) ? 'timeline' : this.state.showToggle}/${page}/${this.props.month}`);
					});
				}

			break;

			default:
				this.context.router.transitionTo(`/`);
		}
	}

	checkPageState() {

		// Homepage
		if( this.props.page === 'homepage' ) {

			this.setState({
				showLogo: true,
				showNav: false,
				showToggle: false,
			});
		}

		// Weather and Timeline
		else if( this.props.page === "timeline" || this.props.page ===  "weather" ) {

			this.setState({
				showLogo: true,
				showNav: true,
				showToggle: this.props.page,
			});
		}

		// Event Single - uses prevLocation to populate header's "back to timeline" link href and set month
		else if( this.props.page === "event" ) {

			this.setState({
				showLogo: true,
				showNav: true,
				showToggle: false,
			});
		}

		// Error page
		else if( this.props.page === "error" ) {

			this.setState({
				showLogo: true,
				showNav: false,
				showToggle: false,
			});
		}

		// concept of nation being vietnam if country is vietnam/cambodia/laos
		let nation;
		switch(this.props.country) {
			case 'vietnam' :
			case 'cambodia' :
			case 'laos' :
				nation = 'vietnam';
				break;
			default :
				nation = this.props.country;
		}
		this.setState({
			nation
		});
	}

	componentDidUpdate(prevProps) {

		if(this.props !== prevProps) {

			this.checkPageState();
		}
	}

	componentDidMount() {

		this.checkPageState();
	}

	render() {

		return (
			<header className="top">

				<ReactCSSTransitionGroup
					component="div"
					className="header-wrapper"
					transitionName="headerAnim"
					transitionAppear={true}
					transitionAppearTimeout={750}
					transitionEnterTimeout={750}
					transitionLeaveTimeout={750}
				>
					{ /* Logo */ }
					<Link
						className="logo"
						onClick={ (e) => this.goToPage(e, 'homepage') }
						to={'/'}
					>
						<svg><use xlinkHref="#iat_logo" /></svg>
						<h1 className="srt">Inside Asia Tours</h1>
					</Link>

					{/* Site nav */}
					{ this.state.showNav &&
						<nav className="site-nav">
							<ul className="nav-list">
								<li>
									<Link
										className={`caps country-vietnam ${this.state.nation === 'vietnam' ? "active" : null}`}
										onClick={ (e) => this.goToPage(e, 'vietnam') }
										to={`/timeline/vietnam/${this.props.month}`}
									>
										Vietnam, Cambodia &amp; Laos
									</Link>
								</li>
								<li>
									<Link
										className={`caps country-japan ${this.state.nation === 'japan' ? "active" : null}`}
										onClick={ (e) => this.goToPage(e, 'japan') }
										to={`/timeline/japan/${this.props.month}`}
									>
										Japan
									</Link>
								</li>
								<li>
									<Link
										className={`caps country-burma ${this.state.nation === 'burma' ? "active" : null}`}
										onClick={ (e) => this.goToPage(e, 'burma') }
										to={`/timeline/burma/${this.props.month}`}
									>
										Burma
									</Link>
								</li>
							</ul>
						</nav>
					}

					<div className="header-right">

						{ /* Events/weather toggle */ }
							{ this.state.showToggle &&
								<Toggle
									month={this.props.month}
									country={this.props.country}
								/>
						}
					</div>


				</ReactCSSTransitionGroup>

			</header>
		)
	}
}

export default Header;

Header.contextTypes = {
	router: PropTypes.object
}

Header.propTypes = {
	showLoader: PropTypes.func.isRequired,
	hideLoader: PropTypes.func.isRequired,
	setCountry: PropTypes.func.isRequired,
	setPage: PropTypes.func.isRequired,
	setMonth: PropTypes.func.isRequired

}
