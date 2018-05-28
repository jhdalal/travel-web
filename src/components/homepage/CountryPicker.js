import PropTypes from 'prop-types';
import React from 'react';
import { TweenMax, Power3 } from 'gsap';
import CountryItem from './CountryItem';
import Measure from 'react-measure';
import _ from 'lodash';
import '../../polyfills/closest.js';

const Draggable = window.Draggable;

class CountryPicker extends React.Component {

	restPoints = [null, null, null];

	componentWillMount() {

		// Only show display countries (not Laos/Cambodia)
		const countries = _.filter(this.props.countries, country => country.display === true );

		const order = Object.keys(countries).sort((a, b) => countries[a].countryPicker.order < countries[b].countryPicker.order ? -1 : 1);

		// Load countries
		this.setState({
			countries: countries,
			activeItem: 2, // Japan,
			order,
			dragCursor: false
		});
	}

	// On resize we recalculate gridWidth and set new rest points for the CountryPicker
	handleResize = (dimensions) => {

		this.gridWidth = Math.floor((window.innerWidth / 2));

		// For each country, create a rest point
		const countryCount = this.state.order.length;
		this.state.order.forEach((country, i) => {
			const leftRest = ((i * this.gridWidth) % (countryCount * this.gridWidth)) - this.gridWidth;
			if (i < countryCount) {
				this.restPoints[i] = leftRest * -0.99;
			}
		});

		// Update draggable if exists
		if ( this.draggable ) {
			this.draggable[0].vars.snap = this.restPoints;
		}
	}

	setupDraggable = () => {

		const countryPicker = this.refs.countryPicker;
		const arrayIndex = this.arrayIndex;
		const makeActive = this.makeActive;
		const restPoints = this.restPoints;

		function getNewCountry() {

			const newActiveIndex = arrayIndex(restPoints, this.endX) + 1;

			let newCountry;
			switch (newActiveIndex) {
				case 1:
					newCountry = "vietnam";
					break;
				case 2:
					newCountry = "japan";
					break;
				case 3:
					newCountry = "burma";
					break;
				default:
					newCountry = "japan";
			}

			makeActive(newActiveIndex, newCountry);
		}

		// Draggable allows us to click and drag the country picker, "snapping" at a rest point for each country
		this.draggable = Draggable.create(countryPicker, {
			bounds: '.page-home',
			type: 'x',
			lockAxis: true,
			throwProps: true,
			snap: restPoints,
			// On click, scroll directly to the clicked country
			onClick: function(e) {

				const targetItem = e.target.parentNode.closest('.country-picker-item');

				if (targetItem) {

					// Update the active item
					const order = parseInt(targetItem.dataset.itemorder, 10);
					const newCountry = targetItem.querySelector('.page-title').innerHTML.toLowerCase();
					makeActive(order, newCountry);

					// Scroll CountryPicker to the new active item
					const closest = restPoints[order - 1];
					TweenMax.to(countryPicker, 0.75, { x: closest, ease: Power3.easeOut });
				}

			},
			// Manage active item after drag
			onDragEnd:getNewCountry,
			onPress: () => {

				this.setState({
					dragCursor: true
				});
			},
			onRelease: () => {

				this.setState({
					dragCursor: false
				});
			},
		});
	}

	componentDidMount() {

		this.setupDraggable()
	}

	/* Helper function to update state with a new item ID because
	Draggable hijacks "this", stopping us from running this.setState()
	from inside it */
	makeActive = (order, newCountry) => {
		this.setState({activeItem: order});
		// Pass the new country string back to Homepage
		this.props.setCountry(newCountry);
	}

	arrayIndex(arr, num){
		for ( var i=0;i<arr.length;i++) { if ( arr[ i ] === num ) { return i; } } // return i
		return -1; // return -1 if it is not present
	}

	render() {
		return(
			<Measure onMeasure={(dimensions) => this.handleResize(dimensions)}>
				<ul className={`country-picker ${ this.props.animationComplete ? "animation-complete" : "animation-not-complete" } ${(this.state.dragCursor ? 'dragging' : 'not-dragging')}`} ref="countryPicker">
					{
						this.state.order.map(key => <CountryItem
							key={key}
							className="country-picker-country"
							details={this.state.countries[key]}
							activeItem={this.state.activeItem}
							countries={this.state.countries}
						/>)
					}
				</ul>
			</Measure>
		)
	}
}

CountryPicker.propTypes = {
	countries: PropTypes.object.isRequired,
	setCountry: PropTypes.func.isRequired
}

export default CountryPicker;
