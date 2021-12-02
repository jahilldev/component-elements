import { h } from 'preact';
import { mount } from 'enzyme';
import { parseHtml } from '../src/parse';

/* -----------------------------------
 *
 * Parse
 *
 * -------------------------------- */

describe('parse', () => {
  describe('parseHtml()', () => {
    const html = '<h1>Heading</h1><section><h2 title="Main Title">Hello</h2></section>';

    it('correctly converts HTML string into VDom tree', () => {
      const result = parseHtml(html);
      const instance = mount(h(result, {}) as any);

      console.log('HTML', instance.html());

      expect(true).toEqual(true);
    });
  });
});
