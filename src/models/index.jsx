import { Record, List } from 'immutable';
import _ from 'lodash';
import { white } from '../color';

const VALUE_BLOCK = 'VALUE_BLOCK';
const FUNCTION_BLOCK = 'FUNCTION_BLOCK';
const PROPERTY_BLOCK = 'PROPERTY_BLOCK';
const OPERATOR_BLCOK = 'OPERATOR_BLCOK';
const CREATABLE_TYPES = { VALUE_BLOCK, FUNCTION_BLOCK, PROPERTY_BLOCK, OPERATOR_BLCOK };
const CREATABLE_TYPE_KEYS = _.keys(CREATABLE_TYPES);

export class Block extends Record({ id: 0, value: '', x: 0, y: 0, deletable: true, editable: true, type: '', color: white, changeable: true, rightPins: List(), leftPins: List() }) {

	/**
	 * @param {number} dx
	 * @param {number} dy
	 */
	dmove(dx, dy) {
		const { x, y } = this;

		return this.merge({ x: x + dx, y: y + dy });
	}
}

export class Pin extends Record({ id: 0, color: white }) { }

export class BlockCreator extends Record({ x: 0, y: 0, visible: false, value: '', selected: CREATABLE_TYPE_KEYS[0], rightPins: List(), leftPins: List() }) {

	/**
	 * @param {number} x 
	 * @param {number} y 
	 */
	toggle(x, y) {
		const { visible } = this;

		return !visible ? this.merge({ x, y, visible: true, value: '', selected: CREATABLE_TYPE_KEYS[0] }) : this.set('visible', false);
	}

	static get CREATABLE_TYPES() {
		return CREATABLE_TYPES;
	}

	static get CREATABLE_TYPE_KEYS() {
		return CREATABLE_TYPE_KEYS;
	}

	static get VIEW_BLOCK() {
		return 'VIEW_BLOCK';
	}
}
