import PropTypes from 'prop-types';
import React from 'react';

/**
* -Country-
* Individual Country for Country Picker
**/
class CountryItem extends React.Component {

	render() {

		const {details} = this.props;

		return (
			<li className={`country-picker-item country-${details.class} country-picker-item-${details.countryPicker.order} ${this.props.activeItem === details.countryPicker.order && 'active'}`} ref="countryItem" data-itemorder={details.countryPicker.order}>
				<div className={`country-picker-item-content`}>

					<div className="title-item title-item-1"></div>
					<div className="title-item title-item-2"></div>
					<h2 className="page-title">
						{details.name}
					</h2>
					{details.name === 'Vietnam' &&
						<span className="page-title cambodia-laos">Cambodia &amp; Laos</span>
					}

					{details.name === 'Burma' &&
						<div className="flare-wrapper"></div>
					}

				</div>
			</li>
		)
	}
}

CountryItem.propTypes = {
	details: PropTypes.object.isRequired,
}

export default CountryItem;
