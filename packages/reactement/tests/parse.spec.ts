import React, { createElement } from 'react';
import { mount } from 'enzyme';
import { parseChildren } from '../src/parse';

/* -----------------------------------
 *
 * Variables
 *
 * -------------------------------- */

const testHeading = 'testHeading';
const testWhitespace = '    ';
const testHtml = `<h1>${testHeading}</h1><br /><section><h2 title="Main Title">Hello</h2></section>`;
const testScript = `<script>alert('danger')</script>`;
const testData = { testHeading };

/* -----------------------------------
 *
 * Parse
 *
 * -------------------------------- */

describe('parse', () => {
  describe('parseHtml()', () => {
    it('should correctly handle misformed html', () => {
      const testText = 'testText';
      const result = parseChildren.call({ innerHTML: `<h1>${testText}` });
      const instance = mount(createElement(result, {}) as any);

      expect(instance.html()).toEqual(`<h1>${testText}</h1>`);
    });

    it('handles text values witin custom element', () => {
      const result = parseChildren.call({ innerHTML: testHeading });
      const instance = mount(createElement(result, {}) as any);

      expect(instance.text()).toEqual(testHeading);
    });

    it('handles whitespace within custom element', () => {
      const result = parseChildren.call({ innerHTML: testWhitespace });
      const instance = mount(createElement(result, {}) as any);

      expect(instance.text()).toEqual('');
      expect(instance.html()).toEqual('');
    });

    it('removes script blocks for security', () => {
      const result = parseChildren.call({ innerHTML: testScript });
      const instance = mount(createElement(result, {}) as any);

      expect(instance.text()).toEqual('');
    });

    it('correctly converts an HTML string into a VDom tree', () => {
      const result = parseChildren.call({ innerHTML: testHtml });
      const instance = mount(createElement(result, {}) as any);

      expect(instance.find('h1').text()).toEqual(testHeading);
    });

    it('should remove <* slot="{key}"> and apply to props', () => {
      const slots = {};
      const slotKey = 'slotKey';
      const slotValue = 'slotValue';

      const slotHtml = `<em slot="${slotKey}">${slotValue}</em>`;
      const headingHtml = `<h1>${testHeading}</h1>`;
      const testHtml = `<section>${headingHtml}${slotHtml}</section>`;

      const result = parseChildren.call({ innerHTML: testHtml, __slots: slots });
      const instance = mount(createElement(result, {}) as any);

      expect(instance.html()).toEqual(`<section>${headingHtml}</section>`);
      expect(slots).toEqual({ [slotKey]: slotValue });
    });
  });
});
