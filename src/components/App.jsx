import React, { Component } from 'react';
import { Provider } from 'react-redux';
import Chain from '../containers/Chain';
import { createStore } from 'redux';
import state from '../reducers';
import { enableBatching } from 'redux-batched-actions';
import { HashRouter, Route, NavLink, Redirect } from 'react-router-dom';
import HTMLRenderer from '../containers/HTMLRenderer';
import HTMLEditor from '../containers/HTMLEditor';
import { BlockCreator } from '../models';
import actions from '../actions';
import Balloons from '../containers/Balloons';
import socket from '../socket';
import autobind from 'autobind-decorator';
import _ from 'lodash';
import Arrow from 'react-icons/lib/ti/location-arrow';
import styles from './App.scss';

const store = createStore(enableBatching(state));
store.dispatch(actions.addBlock({ x: 100, y: 100, type: BlockCreator.VIEW_BLOCK }));

const redirectRender = () => <Redirect to='/chain' />;

class App extends Component {
	constructor() {
		super();

		this.state = { mouse: {} };
		socket.on('mouse', this.onMouseBySocket);
	}

	componentDidMount() {
		const { height } = document.querySelector('footer').getBoundingClientRect();
		document.body.style.paddingBottom = `${height}px`;
		document.addEventListener('mousemove', this.onMouseMoveDocument);
	}

	render() {
		const { state: { model } } = this;
		const { id } = socket;

		return (
			<Provider store={store}>
				<HashRouter>
					<div styleName='wrap'>
						<div styleName='base'>
							<HTMLRenderer />
							<Route exact path='/' render={redirectRender} />
							<Route path='/chain' component={Chain} />
							<Route path='/editor' component={HTMLEditor} />
						</div>
						<footer>
							<NavLink to='/chain' className={styles.link} activeClassName={styles.active}>
								<span>Chain</span>
							</NavLink>
							<NavLink to='/editor' className={styles.link} activeClassName={styles.active}>
								<span>Editor</span>
							</NavLink>
							<NavLink to='/view' className={styles.link} activeClassName={styles.active}>
								<span>View</span>
							</NavLink>
						</footer>
						<Balloons />
						{_.map(_.toPairs(model), ([k, { x, y }]) => {
							if (k === id) { return null; }
							return <Arrow key={k} size={20} style={{
								display: 'block',
								position: 'absolute',
								left: x - 17,
								top: y - 10,
								color: 'rgb(0, 122, 204)'
							}} />;
						})}
					</div>
				</HashRouter>
			</Provider>
		);
	}

	/**
	 * @param {MouseEvent} e 
	 */
	@autobind
	onMouseMoveDocument(e) {
		const { pageX, pageY } = e;
		socket.emit('mouse', { x: pageX, y: pageY });
	}

	@autobind
	onMouseBySocket(args) {
		this.setState({ model: args });
	}
}

export default App;