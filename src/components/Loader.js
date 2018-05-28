import React from 'react';
import { TimelineMax, Power3, Power4 } from 'gsap';

class Loader extends React.Component {

	enterAnimation(cb) {

		const animation = this.refs.animation;
		const image = this.refs.image;

		const tl = new TimelineMax({
			onComplete: () => {
				cb();
			}
		});
		tl.set(animation, { transformOrigin: '0% 100%' });
		tl.fromTo(animation, 0.25, { scaleX: 0.05, scaleY: 0, ease: Power4.easeOut }, { scaleY: 1 });
		tl.to(animation, 0.6, { scaleX: 1, ease: Power3.easeIn });
		tl.set(animation, { transformOrigin:' 100% 0%' });
		tl.to(animation, 0.5, { scaleX: 0, ease: Power3.easeOut }, '+=0.1');
		tl.fromTo(image, 0.01, { autoAlpha: 0, ease: Power3.easeOut }, { autoAlpha: 1 }, '-=0.6');
	}

	leaveAnimation(cb) {

		const animation = this.refs.animation;
		const image = this.refs.image;

		const tl = new TimelineMax({
			onComplete: () => {
				cb();
			}
		});
		tl.set(animation, { transformOrigin: '100% 0%', scaleY: 1 });
		tl.fromTo(animation, 0.6, { scaleX: 0, ease: Power3.easeIn }, { scaleX: 1 });
		tl.to(image, 0.01, { autoAlpha: 0, ease: Power3.easeOut });
		tl.set(animation, { transformOrigin: '0% 100%' }, '+=0.1');
		tl.to(animation, 0.6, { scaleX: 0, ease: Power3.easeOut });
	}

	componentWillAppear(cb) {

		this.enterAnimation(cb);
  }

	componentWillEnter(cb) {

		this.enterAnimation(cb);
  }

	componentWillLeave(cb) {

		this.leaveAnimation(cb);
  }

	render() {

		return (
			<div className="loader">
				<div className="background-animation" ref="animation"></div>

				<div className="loader-wrapper" ref="image">

					<div className="central-wrapper">

						<div className="image">

							<svg className="main-group" viewBox="0 0 160.4 66">

								<g className="sun">
									<circle cx="30" cy="56" r="7"/>
									<line x1="30" y1="47" x2="30" y2="43.3"/>
									<line x1="23.4" y1="49.7" x2="20.8" y2="47.1"/>
									<line x1="20.7" y1="56.2" x2="17" y2="56.2"/>
									<line x1="23.4" y1="62.7" x2="20.8" y2="65.4"/>
									<line x1="30" y1="65.4" x2="30" y2="69.2"/>
									<line x1="36.5" y1="62.7" x2="39.1" y2="65.4"/>
									<line x1="39.2" y1="56.2" x2="42.9" y2="56.2"/>
									<line x1="36.5" y1="49.7" x2="39.1" y2="47.1"/>
								</g>

								<polygon className="land-mask" points="160,35 14,54 13,55 13,74 160,74"/>

								<path className="land" d="M13.1,55.1l22.1-10.2c0.3-0.1,0.6-0.1,0.9,0l13.3,4.9c0.3,0.1,0.6,0.1,0.9,0l6.9-3.2c0.2-0.1,0.5-0.1,0.8-0.1
									l6.5,1.7c0.2,0.1,0.4,0,0.6,0l10.4-3.3c0.1,0,0.3-0.1,0.4-0.2l10.3-8.8c0.3-0.3,0.8-0.4,1.2-0.2l2.4,1.6c0.4,0.2,0.9,0.1,1.3-0.2
									l12.4-10.8c0.4-0.4,1-0.4,1.5-0.1l13.8,9.6c0.2,0.2,0.5,0.2,0.8,0.2l12.8-1.8c0.3,0,0.6,0,0.8,0.2l13.8,8.9"/>

								<path className="sun-path" d="M30,61c19.4-59.1,78.9-65.4,99-12.9"/>

							</svg>

							<svg className="sun-fallback" viewBox="0 0 160.4 66">

								<g className="sun">
									<circle cx="30" cy="56" r="7"/>
									<line x1="30" y1="47" x2="30" y2="43.3"/>
									<line x1="23.4" y1="49.7" x2="20.8" y2="47.1"/>
									<line x1="20.7" y1="56.2" x2="17" y2="56.2"/>
									<line x1="23.4" y1="62.7" x2="20.8" y2="65.4"/>
									<line x1="30" y1="65.4" x2="30" y2="69.2"/>
									<line x1="36.5" y1="62.7" x2="39.1" y2="65.4"/>
									<line x1="39.2" y1="56.2" x2="42.9" y2="56.2"/>
									<line x1="36.5" y1="49.7" x2="39.1" y2="47.1"/>
								</g>
							</svg>

							<svg className="cloud-left" viewBox="0 0 40.4 27.2">
								<path d="M29.7,11.3C29.7,11.2,29.7,11.2,29.7,11.3c0-1.8-1.4-3.2-3.1-3.2c-1,0-1.8,0.4-2.4,1.1c-1.1-2.2-3.4-3.8-6-3.8 c-3.4,0-6.3,2.6-6.6,6c-2.1,0.4-3.7,2.2-3.7,4.4c0,2.5,2,4.5,4.5,4.5h17c2.5,0,4.5-2,4.5-4.5C33.7,13.4,31.9,11.5,29.7,11.3z"/>
							</svg>

							<svg className="cloud-right" viewBox="0 0 48.2 27.2">
								<path d="M36,7.6c-1.8,0-3.4,0.7-4.5,1.9c-0.8-4.2-4.4-7.3-8.9-7.3c-3.9,0-7.3,2.5-8.5,6.1c-0.8-0.4-1.8-0.7-2.8-0.7 C7.8,7.6,5,10.5,5,14c0,3.5,2.8,6.3,6.3,6.3H36c3.5,0,6.3-2.8,6.3-6.3C42.3,10.5,39.5,7.6,36,7.6z"/>
							</svg>
						</div>

						<div className="text">loading...</div>
					</div>

				</div>
			</div>
		)
	}
}

export default Loader;
