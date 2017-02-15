const React = require('react');
const Immutable = require('immutable');
const Radium = require('radium');
const _ = require('lodash');
const {black, lblack, red, blue} = require('../color.jsx');
const {Record, List} = Immutable;
const {Component} = React;

class PinModel extends Record({ type: 0, connected: false, index: 0 }) {
	static get RADIUS() {
		return 8;
	}

	static get S_RADIUS() {
		return 4;
	}
}

class Pin extends Component {
	constructor(props) {
		super(props);

		this.state = { isMouseHover: false };
	}

	render() {
		const {state: {isMouseHover}} = this;
		const {props: {model, cx, cy}} = this;
		const {RADIUS: r, S_RADIUS: sr} = PinModel;
		const width = r * 2;

		return (
			<svg
				onMouseDown={this.onMouseDown.bind(this)}
				onMouseUp={this.onMouseUp.bind(this)}
				onMouseEnter={this.onMouseEnter.bind(this)}
				onMouseLeave={this.onMouseLeave.bind(this)}
				style={{
					display: 'block',
					width,
					height: width,
					position: 'absolute',
					left: cx - r,
					top: cy - r,
					cursor: 'pointer'
				}}>
				<circle strokeWidth={1} stroke='white' cx={r} cy={r} r={sr} fill={model.get('type') ? 'none' : 'white'} />
				{isMouseHover || model.get('connected') ? <circle strokeWidth={1} stroke='white' cx={r} cy={r} r={r - 1} fill='none' /> : null}
			</svg>
		);
	}

	onMouseDown() {
		const {props: {model, onConnectStart}} = this;

		onConnectStart(model);
	}

	onMouseUp() {
		const {props: {model, onConnectEnd}} = this;

		onConnectEnd(model);
	}

	onMouseEnter() {
		this.setState({ isMouseHover: true });
	}

	onMouseLeave() {
		this.setState({ isMouseHover: false });
	}
}

class BlockModel extends Record({
	id: '',
	x: 0,
	y: 0,
	value: '',
	inputPinsMinlength: 0,
	outputPinsMinlength: 0,
	inputPins: List(),
	outputPins: List(),
	editablepin: true,
	editablevalue: true,
	color: 'white'
}) {

	/**
	 * @param {Object} o
	 */
	constructor(o) {
		const {BLOCK_LIST: list} = BlockModel;
		const id = `block${Date.now()}`;
		const {name} = o;

		super(_.assign({ id }, o, list[name]));
	}

	/**
	 * @param {number} dx
	 * @param {number} dy
	 */
	dmove(dx, dy) {
		const {x, y} = this;

		return this.merge({ x: x + dx, y: y + dy });
	}

	/**
	 * @param {PinModel} pin
	 * @returns {number[]}
	 */
	absoluteCentralPositionOf(pin) {
		const {centralPositionOf} = BlockModel;
		const [dx, dy] = centralPositionOf(pin);
		const {x, y} = this;

		return [x + dx, y + dy];
	}

	static get BLOCK_LIST() {
		return {
			value: {
				editablepin: false,
				outputPins: List([new PinModel({ type: 0 })]),
				color: 'rgb(156, 220, 254)'
			},
			view: {
				value: '',
				editablepin: false,
				editablevalue: false,
				inputPins: List([new PinModel({ type: 1 })]),
				color: 'rgb(197, 134, 192)'
			}
		};
	}

	static get WIDTH() {
		return 180;
	}

	/**
	 * @param {PinModel} pin
	 */
	static centralPositionOf(pin) {
		const {WIDTH: w} = BlockModel;
		const {RADIUS: r} = PinModel;
		const d = r * 2;
		const type = pin.get('type');
		const index = pin.get('index');

		if (type === 0) {
			return [w + r, d * index + r - 1];
		} else if (type === 1) {
			return [-r - 1, d * index + r - 1];
		}

		return [0, 0];
	}
}

class Button extends Component {
	render() {
		const {props: {value, backgroundColor}} = this;

		return (
			<a href='#' onClick={this.onClick.bind(this)} style={{
				padding: '1px 8px',
				backgroundColor,
				marginRight: 1
			}}>
				{value}
			</a>
		);
	}

	onClick() {
		const {props: {onClick}} = this;

		onClick();
	}
}

const Textarea = Radium(class Textarea extends Component {
	render() {
		const {props: {value, editable}} = this;

		return (
			<textarea readOnly={!editable} value={value} onChange={this.onChange.bind(this)} style={{
				display: 'block',
				border: 'none',
				outline: 'none',
				backgroundColor: lblack,
				width: '100%',
				boxSizing: 'border-box',
			}} />
		);
	}

	/**
	 * @param {Event} e
	 */
	onChange(e) {
		const {props: {onChange}} = this;

		onChange(e);
	}
});

class Block extends Component {
	constructor(props) {
		super(props);

		this.px = 0;
		this.py = 0;
		this.mouseMover = null;
		this.mouseUpper = null;
	}

	render() {
		const {RADIUS: radius} = PinModel;
		const diameter = radius * 2;
		const {WIDTH: width, centralPositionOf} = BlockModel;
		const {props: {model, onChange, remove, onConnectPinStart, onConnectPinEnd}} = this;
		const pins = _.map([
			[model.get('inputPins')],
			[model.get('outputPins')]
		], ([pins, dx]) => pins.map((a, i) => {
			const [cx, cy] = centralPositionOf(a);
			return <Pin model={a} cx={cx} cy={cy} onConnectStart={onConnectPinStart} onConnectEnd={onConnectPinEnd} />;
		}));

		return (
			<div data-movable={true} onMouseDown={this.onMouseDown.bind(this)} style={{
				position: 'absolute',
				left: model.get('x'),
				top: model.get('y'),
				width,
				border: `1px solid ${lblack}`,
				boxSizing: 'border-box',
				backgroundColor: black,
				boxShadow: '0 2px 2px 0 rgba(0, 0, 0, 0.14), 0 1px 5px 0 rgba(0, 0, 0, 0.12), 0 3px 1px -2px rgba(0, 0, 0, 0.2)'
			}}>
				<div data-movable={true}>
					<Button value='×' backgroundColor={red} onClick={remove} />
					{model.get('editablepin') ? [
						<Button value='-' backgroundColor={lblack} onClick={this.removeOutputPin.bind(this)} />,
						<Button value='+' backgroundColor={lblack} onClick={this.addOutputPin.bind(this)} />
					] : null}
				</div>
				<div data-movable={true} style={{
					padding: '10px 5px 5px'
				}}>
					<div style={{
						borderLeft: `5px solid ${model.get('color')}`
					}}>
						<Textarea value={model.get('value')} onChange={this.onChangeTextarea.bind(this)} editable={model.get('editablevalue')} />
					</div>
				</div>
				{pins}
			</div>
		);
	}

	removeOutputPin() {
		const {props: {model, update}} = this;

		const {size} = model.get('outputPins');
		const min = model.get('outputPinsMinlength');

		update(min < size ? model.updateIn(['outputPins'], (pins) => pins.pop()) : model, true);
	}

	addOutputPin() {
		const {props: {model, update}} = this;

		update(model.updateIn(['outputPins'], (pins) => {
			const {size: index} = pins;

			return pins.push(new PinModel({ type: 0, index }));
		}));
	}

	/**
	 * @param {Event} e
	 */
	onChangeTextarea(e) {
		const {props: {model, update}} = this;
		const {currentTarget: {value}} = e;

		update(model.set('value', value));
	}

	/**
	 * @param {MouseEvent} e
	 */
	onMouseDown(e) {
		const {target: {dataset: {movable}}, clientX, clientY} = e;

		if (!Boolean(movable)) { return; }
		const mouseMover = this.onMouseMove.bind(this);
		const mouseUpper = this.onMouseUp.bind(this);

		document.body.classList.add('cursor-move');
		document.addEventListener('mousemove', mouseMover);
		document.addEventListener('mouseup', mouseUpper);
		this.px = clientX;
		this.py = clientY;
		this.mouseMover = mouseMover;
		this.mouseUpper = mouseUpper;
	}

	/**
	 * @param {MouseEvent} e
	 */
	onMouseMove(e) {
		const {props: {model, update}, px, py} = this;
		const {clientX, clientY} = e;
		const dx = clientX - px;
		const dy = clientY - py;

		update(model.dmove(dx, dy));
		this.px = clientX;
		this.py = clientY;
	}

	/**
	 * @param {MouseEvent} e
	 */
	onMouseUp(e) {
		const {mouseMover, mouseUpper} = this;

		document.body.classList.remove('cursor-move');
		document.removeEventListener('mousemove', mouseMover);
		document.removeEventListener('mouseup', mouseUpper);
		this.mouseMover = null;
		this.mouseUpper = null;
	}
}

module.exports = { Block, BlockModel, Pin, PinModel };