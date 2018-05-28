import PropTypes from 'prop-types';
import React from 'react';
import { TweenMax, Power0, Power2, Power3 } from 'gsap';
import paperjs from 'paper';
import ReactCSSTransitionGroup from 'react-transition-group/CSSTransitionGroup';
import _ from 'lodash';

import months from '../data/months';
import countries from '../data/countries';

const Draggable = window.Draggable;

/**
* -MonthList-
* Timeline & Weather page - month list
**/
class MonthList extends React.Component {

	componentDidMount() {

		this.props.reportReady('monthlist');
	}

	render() {

		return (
			<ReactCSSTransitionGroup
				component="div"
				className="month-list-transition"
				ref="monthListWrapper"
				transitionName="monthListAnim"
				transitionAppear={true}
				transitionAppearTimeout={750}
				transitionEnterTimeout={750}
				transitionLeaveTimeout={750}
			>
				{ this.props.isReady &&
					<MonthListContainer {...this.props} />
				}
			</ReactCSSTransitionGroup>
		)
	}
}

class MonthListContainer extends React.Component {

	state = {
		hasInteracted: false,
		isDragging: false,
		dragCursor: false,
		pointerCursor: false,
		smoothing: {
			type: 'continuous',
		},
		pathColor: '#ffffff',
		indicatorPosition: {
			x: 0,
			y: 0,
		},
		monthSnap: []
	}

	// Set monthlist/indicator position if arriving on month
	initialPosition = () => {

		const { monthListWrapper } = this.refs;
		const monthPosition = this.mainPath.segments[this.currentMonthIndex].point.x;
		const vpw = window.innerWidth;
		const scrollPosition = monthPosition - (vpw / 2);

		monthListWrapper.scrollLeft = scrollPosition;
	}

	setDragging = (type) => {

		switch ( type ) {

			case 'drag-start' :
				this.setState({
					isDragging: true,
				});
			break;

			case 'drag-end' :
				this.setState({
					isDragging: false,
				});
			break;

			case 'dragging' :
				this.setState({
					dragCursor: true,
				});
			break;

			case 'not-dragging' :
				this.setState({
					dragCursor: false,
				});
			break;

			case 'moved' :
				this.setState({
					hasInteracted: true,
				}, this.props.setInteracted(true));
			break;

			default :
				this.setState({
					isDragging: false,
					dragCursor: false,
				});
		}
	}

	moveMonthPoint = ( i, position, type ) => {

		let duration = 1;
		let easing = Power2.easeOut;

		// Types
		if (type) {

			switch (type) {

				case 'instant':
					duration = 0;
					easing = Power0.easeNone;
				break;

				default:
					duration = 1;
					easing = Power2.easeOut;
			}
		}

		// Kill current tweens
		const currentTweens = TweenMax.getTweensOf([
			this.pointsList[i].monthPoint.position,
			this.mainPath.segments[i].point
		]);
		currentTweens.forEach( tween => tween.kill() );

		TweenMax.to(
			[
				this.pointsList[i].monthPoint.position,
				this.mainPath.segments[i].point
			],
			duration,
			{
				y: position,
				ease: easing,
				onUpdate: () => {
					this.mainPath.smooth(this.state.smoothing);
				}
			},
		);
	}

	// Finds closest two points to indicator
	getClosestPoints = (arr, target) => {

		function findClosestIndex(target, arr) {
			var curr = arr[0];
			var diff = Math.abs (target - curr);
			for (var val = 0; val < arr.length; val++) {
				var newdiff = Math.abs (target - arr[val]);
				if (newdiff < diff) {
					diff = newdiff;
					curr = arr[val];
				}
			}
			return _.indexOf(arr, curr);
		}

		const closestIndex = findClosestIndex(target, arr);
		const result = [ _.indexOf(arr, arr[closestIndex]) ];

		if (_.isNumber(arr[closestIndex - 1]) && _.isNumber(arr[closestIndex + 1])) {
			if (Math.abs(target - arr[closestIndex - 1]) < Math.abs(target - arr[closestIndex + 1])) {
				result.push(_.indexOf(arr, arr[closestIndex - 1]));
			} else {
				result.push(_.indexOf(arr, arr[closestIndex + 1]));
			}
		}

		return result;
	}

	handleDrag = (e) => {

		const paper = this.paper;

		const draggedTo = e.x;

		// store x points and find the closest two
		const xPoints = this.pointsList.map( point => (point.monthPoint && point.monthPoint.position.x) || point.point.x );

		const closestIndex = this.getClosestPoints(xPoints, draggedTo);

		// Don't do anything if goes off the end
		if ( closestIndex.length === 2 ) {

			const closest = {
				point: this.pointsList[closestIndex[0]],
				x: xPoints[closestIndex[0]],
				index: closestIndex[0],
			};

			const nextClosest = {
				point: this.pointsList[closestIndex[1]],
				x: xPoints[closestIndex[1]],
				index: closestIndex[1],
			};

			// Determine how close for 'amplitude'
			closest.amplitude = Math.abs( ( nextClosest.x - draggedTo ) / ( closest.x - nextClosest.x ) );
			nextClosest.amplitude = 1 - closest.amplitude;
			const pathDifference = this.pathCenter - this.pathTop;

			// Move two points cloest in wave (make sure they are month points)
			if ( closest.point.monthPoint ) {
				this.moveMonthPoint( closest.index, this.pathCenter - (pathDifference * closest.amplitude), 'instant' );
				this.pointsList[closest.index].monthLabel.fillColor = this.countryColor;
			}
			if ( nextClosest.point.monthPoint ) {
				this.moveMonthPoint( nextClosest.index, this.pathCenter - (pathDifference * nextClosest.amplitude), 'instant' );
				this.pointsList[nextClosest.index].monthLabel.fillColor = this.state.pathColor;
			}

			// Enure 'missed' points are reset to bottom (on fast flick)
			this.pointsList.forEach( (point, i) => {
				if ( point.monthPoint && (i !== closest.index ) && (i !== nextClosest.index)  ) {
					this.moveMonthPoint( i, this.pathCenter, 'instant' );
					this.pointsList[i].monthLabel.fillColor = this.state.pathColor;
				}
			});

			// Keep indicator on path
			const draggedToPoint = new paper.Point(e.x, e.y);
			var nearestPathPoint = this.mainPath.getNearestPoint(draggedToPoint);
			this.setState({
				indicatorPosition: {
					x: this.state.indicatorPosition.x,
					y: nearestPathPoint.y,
				},
			});
		}
	}

	handleDragEnd = (e) => {

		const draggedTo = e.x;

		// store x points and find the closest two
		const xPoints = this.pointsList.map( point => (point.monthPoint && point.monthPoint.position.x) || point.point.x );

		const closestIndex = this.getClosestPoints(xPoints, draggedTo);

		const newMonthIndex = closestIndex[0];

		const newMonthName = _.find(this.state.months, month => month.id === newMonthIndex).name.toLowerCase();

		this.initializePath.monthChange(this.state.months[newMonthName].id, true);
		this.currentMonthIndex = this.state.months[newMonthName].id;
		this.props.goToMonth(null, newMonthName);
	}

	handleMonthChange = (name) => {

		if( this.initializePath.monthChange ) {

			this.initializePath.monthChange(months[name].id);
		}

		this.currentMonthIndex = months[name].id;
	}

	handleCountryChange = (country) => {

		this.countryColor = countries[this.props.country].color;

		if( this.initializePath.monthChange ) {
			this.countryChange(this.props.currentMonth);
		}
	}

	countryChange = () => {

		// Text color - in
		const labelIn = { value: this.pointsList[this.currentMonthIndex].monthLabel.fillColor._canvasStyle };
		TweenMax.to(labelIn, 1,
			{
				colorProps:{value: this.countryColor},
				ease: Power3.easeOut,
				onUpdate: () => {

					// Set color
					this.pointsList[this.currentMonthIndex].monthLabel.fillColor = labelIn.value;
				}
			}
		);
	}

	animateLabel = (direction = 'in', newMonthIndex, instant) => {

		const duration = instant ? 0.01 : 1;

		// Text color
		const currentColor = this.pointsList[newMonthIndex].monthLabel.fillColor.toCSS(true);
		const labelColor = { value: (direction === 'in') ? this.state.pathColor : this.countryColor };
		const colorTo = (direction === 'in') ? this.countryColor : this.state.pathColor;

		if ( currentColor !== colorTo ) {

			TweenMax.to(labelColor, duration,
				{
					colorProps: {value: colorTo},
					ease: Power3.easeOut,
					onUpdate: () => {

						// Set color
						this.pointsList[newMonthIndex].monthLabel.fillColor = labelColor.value;
					}
				}
			);
		}
	}

	initializePath = () => {

		const paper = this.paper;
		const view = paper.view;
		const points = 13; // (12 months plus start/end, zero indexed)
		this.pointsList = [];

		// Get Point for given index
		const getPoint = (i) => {

			let x = this.viewWidth / points * i;
			const point = new paper.Point(x, this.viewCenter.y);

			return point;
		}

		// Calculate dimensions
		const getDimensions = () => {

			this.pathCenter = view.center.y;
			this.pathTop = view.bounds.top + 20;
			this.pathBottom = this.pathCenter + 5;
			this.viewHeight = view.size.height;
			this.viewCenter = view.center;
			this.viewWidth = view.size.width;
		}
		getDimensions();

		// Main path
		this.mainPath = new paper.Path({
			strokeColor: this.state.pathColor,
			strokeWidth: 1,
			opacity: 0.65,
		});

		// Move indicator on click of month
		const monthClick = (e) => {

			if(! this.state.isDragging) {

				this.setState({
					hasInteracted: true,
				}, this.props.setInteracted(true));

				const i = e.target.dataMonthID;

				this.initializePath.monthChange(i);
				this.props.goToMonth(e, e.target.dataMonthName);
			}
		}

		// Hover in on mouse over month
		const monthEnter = (e) => {

			const i = e.target.dataMonthID;

			if ( ! this.state.isDragging && ( i !== this.currentMonthIndex ) && this.props.shouldAnimate ) {

				this.setState({
					pointerCursor: true,
				});

				// Hovered Point
				this.moveMonthPoint(i, this.pathTop + (this.viewHeight * 0.15), 'hoverIn');

				// Side Points
				if ( i+1 !== this.currentMonthIndex && this.pointsList[i+1].monthPoint ) {
					this.moveMonthPoint(i+1, this.pathBottom, 'hoverIn');
				}
				if ( i-1 !== this.currentMonthIndex && this.pointsList[i-1].monthPoint ) {
					this.moveMonthPoint(i-1, this.pathBottom, 'hoverIn');
				}
			}
		}

		// Hover out on mouse leave month
		const monthLeave = (e) => {

			if ( ! this.state.isDragging && this.props.shouldAnimate ) {

				this.setState({
					pointerCursor: false,
				});

				const i = e.target.dataMonthID;

				// Hovered Point
				if ( i !== this.currentMonthIndex) {
					this.moveMonthPoint(i, this.pathCenter, 'hoverOut');
				}

				// Side Points
				if ( i+1 !== this.currentMonthIndex && this.pointsList[i+1].monthPoint ) {
					this.moveMonthPoint(i+1, this.pathCenter, 'hoverOut');
				}
				if ( i-1 !== this.currentMonthIndex && this.pointsList[i-1].monthPoint ) {
					this.moveMonthPoint(i-1, this.pathCenter, 'hoverOut');
				}
			}
		}

		// Add path and month points
		for (let i = 0; i <= points; i++) {

			// Path point
			const point = getPoint(i);
			this.mainPath.add(point);

			let monthPoint, monthLabel, clickTarget;

			// Add month points
			if( i !== 0 && i !== points ) {

				const months = Object.keys(this.state.months);

				// Rectangle
				monthPoint = new paper.Path.Circle({
					radius: 3,
					fillColor: this.state.pathColor,
					name: 'monthPoint',
				});

				// Text
				monthLabel = new paper.PointText({
					fillColor: this.state.pathColor,
					fontFamily: 'URWGeometric-Regular',
					fontWeight: 700,
					justification: 'center',
					name: 'monthLabel',
				});

				// Target faux element for click target
				clickTarget = new paper.Path.Rectangle({
					dataMonthID: i,
					dataMonthName: months[i-1],
					size: {
						width: 1,
						height: 1
					},
					fillColor: 'red',
					name: 'clickTarget',
					opacity: 0,
					onClick: monthClick,
					onMouseEnter: monthEnter,
					onMouseLeave: monthLeave,
				});
			}

			// Store to update
			this.pointsList.push({
				point: point,
				monthPoint: monthPoint,
				monthLabel: monthLabel,
				clickTarget: clickTarget,
			});
		}

		// Change month animation - `instant` is used on page load
		const indicatorOffset = { value: 0 };
		this.initializePath.monthChange = (newMonthIndex, instant) => {

			const oldMonthIndex = this.currentMonthIndex;
			let duration = instant ? 0.01 : 1;
			const moveType = instant ? 'instant' : 'monthChange';

			// Wave & text
			if ( newMonthIndex === oldMonthIndex ) {

				this.moveMonthPoint(newMonthIndex, this.pathTop, moveType);
				this.animateLabel('in', newMonthIndex, instant);

			} else {

				this.moveMonthPoint(oldMonthIndex, this.pathCenter, moveType);
				this.moveMonthPoint(newMonthIndex, this.pathTop, moveType);

				this.animateLabel('out', oldMonthIndex, instant);
				this.animateLabel('in', newMonthIndex, instant);
			}

			// Indicator offset animation
			const newOffset = this.mainPath.getOffsetOf(this.mainPath.segments[newMonthIndex].point);
			const indicatorOffsetTween = TweenMax.to(indicatorOffset, duration,
				{
					value: newOffset,
					ease: Power2.easeOut,
					onUpdate: () => {

						// Update tween value during animation, as the position changes as the path moves
						indicatorOffsetTween.updateTo({ value: newOffset });

						// Set position
						this.setState({
							indicatorPosition: this.mainPath.getPointAt(indicatorOffset.value),
						});
					}
				}
			);

			// Move indicator to middle of screen
			const { monthListWrapper } = this.refs;
			const vpw = window.innerWidth;
			const scrollPosition = newOffset - (vpw / 2);
			duration = ( newMonthIndex === oldMonthIndex ) ? 0.01 : 1;
			TweenMax.to(monthListWrapper, 1,
				{
					scrollLeft: scrollPosition,
					ease: Power2.easeOut,
				}
			);
		}

		// Resize
		view.onResize = () => {

			getDimensions();

			// Reset
			this.mainPath.removeSegments();

			// Path points positions
			for (let i = 0; i <= points; i++) {

				const point = getPoint(i);
				this.mainPath.add(point);

				if( this.pointsList[i].monthPoint ) {

					var clickTarget_scaleX = (this.viewWidth / 13)/this.pointsList[i].clickTarget.bounds.width;
    			var clickTarget_scaleY = this.viewHeight/this.pointsList[i].clickTarget.bounds.height;
					this.pointsList[i].clickTarget.scale(clickTarget_scaleX, clickTarget_scaleY);

					this.pointsList[i].clickTarget.position = point;
					this.pointsList[i].clickTarget.position.y += 5;
					this.pointsList[i].monthPoint.position = point;
					this.pointsList[i].monthLabel.position = point;
					this.pointsList[i].monthLabel.content = (this.viewHeight < 100) ? _.find(this.state.months, month => month.id === i).shortname : _.find(this.state.months, month => month.id === i).name;
					this.pointsList[i].monthLabel.fontSize = (this.viewHeight < 100) ? 14 : 17;
					this.pointsList[i].monthLabel.position.y += (this.viewHeight < 100) ? 22 : 35;
				}
			}

			// Month snap (draggable)
			let monthSnap = this.pointsList.map( point => point.monthPoint && point.monthPoint.position.x );
			monthSnap = _.without(monthSnap, undefined);
			this.setState({
				monthSnap,
			});

			// Keep indicator in position
			this.initializePath.monthChange(this.currentMonthIndex, true);

			// Smooth path
			this.mainPath.smooth(this.state.smoothing);
		}

		// Trigger resize
		view.emit('resize');

		// Fix half pixel blur
		view.translate(0.5,0.5);
	}

	componentWillMount() {

		this.paper = new paperjs.PaperScope();

		// Load months (from imported js file)
		this.setState({
			months: months,
			allowMouseMove: true,
			paperReady: false
		});
	}

	componentDidMount() {

		const canvas = this.refs.monthListCanvas;

		this.paper.setup(canvas);
		this.setState({
			paperReady: true
		}, () => {
			this.initializePath();
			this.initialPosition();
		});

		this.handleMonthChange(this.props.currentMonth);
		this.handleCountryChange(this.props.country);
	}

	componentDidUpdate(prevProps) {

		// Update month
		if( ! _.isEqual(prevProps.currentMonth,this.props.currentMonth) ) {
			this.handleMonthChange(this.props.currentMonth);
		}

		// Update country
		if( prevProps.country !== this.props.country ) {
			this.handleCountryChange(this.props.country);
		}
	}

	componentWillUnmount() {

		// Clear event handlers
		const points = 13; // (12 months plus start/end, zero indexed)

		for (let i = 0; i <= points; i++) {

			if( this.pointsList[i].monthPoint ) {
				this.pointsList[i].clickTarget.onMouseEnter = null;
				this.pointsList[i].clickTarget.onMouseLeave = null;
			}
		}
	}

	render() {

		return (
			<div className={`month-list-wrapper hasInteracted-${this.state.hasInteracted}`} ref="monthListWrapper">

				{ !this.props.monthListInteracted &&
					<DragInstruction />
				}

				<div className='month-list'>
					<Indicator
						indicatorPosition={this.state.indicatorPosition}
						monthSnap={this.state.monthSnap}
						handleDrag={this.handleDrag}
						handleDragEnd={this.handleDragEnd}
						setDragging={this.setDragging}
						dragCursor={this.state.dragCursor}
						viewWidth={this.viewWidth}
						viewHeight={this.viewHeight}
					/>

					<canvas id="month-list-canvas" className={`${(this.state.pointerCursor ? 'pointer' : 'not-pointer')} ${(this.state.dragCursor ? 'dragging' : 'not-dragging')} `} ref="monthListCanvas" data-paper-resize="true"></canvas>

				</div>
			</div>
		)
	}
}

class Indicator extends React.Component {

	updateSize = () => {

		this.draggable[0].kill();
		this.initDraggable();
	}

	initDraggable = () => {

		const indicator = this.refs.indicator;

		const that = this;

		// Autoscroll size
		let autoScrollSize;
		const screenWidth = this.props.viewWidth / 2;
		if ( screenWidth >= 1200 ) {
			autoScrollSize = 250;
		} else if ( screenWidth >= 500 ) {
			autoScrollSize = 100;
		} else {
			autoScrollSize = 50;
		}

		this.draggable = Draggable.create(indicator, {
			bounds: '.month-list',
			type: 'left',
			lockAxis: true,
			throwProps: true,
			throwResistance: 9999,
			snap: this.props.monthSnap,
			cursor: null,
			autoScroll: 1.35,
			autoScrollMarginRight: autoScrollSize,
			autoScrollMarginLeft: autoScrollSize,
			autoScrollMarginTop: 0,
			autoScrollMarginBottom: 0,
			onPress: () => {
				this.props.setDragging('drag-start');
				this.props.setDragging('dragging');
			},
			onRelease: () => {
				this.props.setDragging('not-dragging');
			},
			onDrag: function(){
				that.props.setDragging('moved');
				that.props.handleDrag(this);
			},
			onThrowUpdate: function(){
				that.props.handleDrag(this);
			},
			onThrowComplete: function(){
				that.props.handleDragEnd(this);
				that.props.setDragging('drag-end');
			},
		});
	}

	componentDidMount() {

		this.initDraggable();
	}

	componentDidUpdate(prevProps) {

		if ( prevProps.monthSnap !== this.props.monthSnap ) {
			if ( this.draggable && this.draggable.length > 0 ) {
				this.draggable[0].vars.snap = this.props.monthSnap;
			}
		}

		if ( prevProps.viewWidth !== this.props.viewWidth ) {
			this.updateSize();
		}
	}

	render() {
		return (
			<div id="month-list-indicator" ref="indicator" className={`${(this.props.dragCursor ? 'dragging' : 'not-dragging')}`}  style={{left: this.props.indicatorPosition.x, top: this.props.indicatorPosition.y}}>
				<div className="inner-circle"></div>
				<div className="outer-circle"></div>
				<div className="point"></div>
			</div>
		)
	}
}

const DragInstruction = () => {
	return (
		<div className="drag-instruction">drag to <svg className="icon"><use xlinkHref="#drag" /></svg> view more</div>
	)
};


MonthList.propTypes = {
	country: PropTypes.string.isRequired,
	currentMonth: PropTypes.string.isRequired,
	goToMonth: PropTypes.func.isRequired,
	reportReady: PropTypes.func,
	isReady: PropTypes.bool,
	shouldAnimate: PropTypes.bool,
}

export default MonthList;
