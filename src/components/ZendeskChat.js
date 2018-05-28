import React from 'react';
import PropTypes from 'prop-types';


class ZendeskChat extends React.Component {

	setUpWidget = () => {

		const offset = ( this.props.dimensions.width < 1200 ) ? 25 : 100;

		const $zopim = window.$zopim;
		$zopim(function() {
			$zopim.livechat.window.setOffsetHorizontal(offset);
			$zopim.livechat.button.setOffsetHorizontal(offset);
	  });

		this.updateWidgetColor();
	}

	updateWidgetColor = () => {

		let color;
		switch(this.props.country) {
			case 'japan' : {
				color = '#cfcf36';
				break;
			}
			case 'burma' : {
				color = '#f6a741';
				break;
			}
			case 'vietnam' : {
				color = '#ec7cae';
				break;
			}
			default : {
				color = '#ee3124';
			}
		}

		const $zopim = window.$zopim;
		$zopim(function () {
			$zopim.livechat.theme.setColors({primary: color});
	    $zopim.livechat.theme.reload();
		});
	}

	showWidget = () => {

		// Wait for animation
		this.timeout = setTimeout( () => {

			const $zopim = window.$zopim;
			$zopim(function () {
				$zopim.livechat.window.show();
				$zopim.livechat.button.show();
			});

		}, 250);
	}

	hideWidget = () => {

		this.timeout && clearTimeout(this.timeout);

		const $zopim = window.$zopim;
		$zopim(function () {
			$zopim.livechat.hideAll();
		});
	}

	checkShow = () => {

		if ( this.props.show ) {

			this.showWidget();

		} else {

			this.hideWidget();
		}
	}

	componentDidMount() {

		this.setUpWidget();
		this.checkShow();
	}

	componentDidUpdate(prevProps) {

		if( prevProps.show !== this.props.show ) {
			this.checkShow();
		}

		if( prevProps.country !== this.props.country ) {
			this.updateWidgetColor();
		}

		if( this.props.dimensions && prevProps.dimensions.width !== this.props.dimensions.width ) {
			this.setUpWidget();
		}
	}

	componentWillUnmount() {

		this.hideWidget();
	}

	render() {
		return null;
	}
}

ZendeskChat.contextTypes = {
	country: PropTypes.string,
	show: PropTypes.bool,
	dimensions: PropTypes.object,
}

export default ZendeskChat;
