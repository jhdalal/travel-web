import PropTypes from 'prop-types';
import React from 'react';
import { Link } from 'react-router';

import months from '../../data/months';
import { wait } from '../../helpers';

/**
* -MonthNav-
* Timeline page - month nav (next / prev)
**/
class MonthNav extends React.Component {

	state = {
		prevMonth: '',
		nextMonth: '',
	}

	updateMonths = () => {

		const monthArray = Object.keys(months);
		const i = months[this.props.month].id - 1;
		const prev_i = (i === 0) ? monthArray.length-1 : i-1;
		const next_i = (i === monthArray.length-1) ? 0 : i+1;
		const prevMonth = {...months[monthArray[prev_i]], value: monthArray[prev_i]};
    const nextMonth = {...months[monthArray[next_i]], value: monthArray[next_i]};

		this.setState({
			prevMonth,
			nextMonth
		});
	}

	handleClick = (e, dir = 'next') => {

		// Go to month
		const month = (dir === 'next') ? this.state.nextMonth.value : this.state.prevMonth.value;

		this.props.goToMonth(e, month);
	}

	componentDidMount() {

		this.updateMonths();
	}

	componentDidUpdate(prevProps, prevState) {

		// New Month
		if( prevProps.month !== this.props.month ) {

			wait(1000).then(() => {

				this.updateMonths();
			});
		}
	}

	render() {

		return (
			<ul
				className="timeline-month-nav"
			>
				<MonthNavPrev
					handleClick={this.handleClick}
					prevMonth={this.state.prevMonth}
					country={this.props.country}
				/>

				<MonthNavNext
					handleClick={this.handleClick}
					nextMonth={this.state.nextMonth}
					country={this.props.country}
				/>
			</ul>
		)
	}
}

const MonthNavNext = ({
	handleClick,
	nextMonth,
	country,
}) => (
 <li
	 className={`timeline-month-nav-next`}
	 onClick={(e) => handleClick(e, 'next')}
	 title={nextMonth.name}
 >
	 <Link to={`/timeline/${country}/${nextMonth.value}`} onClick={ e => e.preventDefault() } className="text">{nextMonth.shortname}</Link>
 </li>
);

const MonthNavPrev = ({
	handleClick,
	prevMonth,
	country,
}) => (
 <li
	 className={`timeline-month-nav-prev`}
	 onClick={(e) => handleClick(e, 'prev')}
	 title={prevMonth.name}
 >
	 <Link to={`/timeline/${country}/${prevMonth.value}`} onClick={ e => e.preventDefault() } className="text">{prevMonth.shortname}</Link>
 </li>
);

export default MonthNav;

MonthNav.propTypes = {
	goToMonth: PropTypes.func.isRequired,
	month: PropTypes.string.isRequired,
	country: PropTypes.string.isRequired,
	progress: PropTypes.number.isRequired,
	updateProgress: PropTypes.func.isRequired,
}
