import { h } from 'preact';
import { mount } from 'enzyme';
import { parseHtml } from '../src/parse';

/* -----------------------------------
 *
 * Variables
 *
 * -------------------------------- */

const testHeading = 'testHeading';
const testWhitespace = '    ';
const testHtml = `<h1>${testHeading}</h1><section><h2 title="Main Title">Hello</h2></section>`;
const testScript = `<script>alert('danger')</script>`;

/* -----------------------------------
 *
 * Parse
 *
 * -------------------------------- */

describe('parse', () => {
  describe('parseHtml()', () => {
    it('handles text values witin custom element', () => {
      const result = parseHtml.call({ innerHTML: testHeading });
      const instance = mount(h(result, {}) as any);

      expect(instance.text()).toEqual(testHeading);
    });

    it('handles whitespace within custom element', () => {
      const result = parseHtml.call({ innerHTML: testWhitespace });
      const instance = mount(h(result, {}) as any);

      expect(instance.text()).toEqual(testWhitespace);
    });

    it('removes script blocks for security', () => {
      const result = parseHtml.call({ innerHTML: testScript });
      const instance = mount(h(result, {}) as any);

      expect(instance.text()).toEqual('');
    });

    it('correctly converts an HTML string into a VDom tree', () => {
      const result = parseHtml.call({ innerHTML: testHtml });
      const instance = mount(h(result, {}) as any);

      expect(instance.find('h1').text()).toEqual(testHeading);
    });
  });
});
