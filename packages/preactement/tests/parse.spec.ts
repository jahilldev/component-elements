import { h } from 'preact';
import { mount } from 'enzyme';
import { parseHtml } from '../src/parse';

/* -----------------------------------
 *
 * Variables
 *
 * -------------------------------- */

const testHeading = 'testHeading';
const testHtml = `<h1>${testHeading}</h1><br /><section><h2 title="Main Title">Hello</h2></section>`;
const testScript = `<script>alert('danger')</script>`;

/* -----------------------------------
 *
 * Parse
 *
 * -------------------------------- */

describe('parse', () => {
  describe('parseHtml()', () => {
    it('should correctly handle misformed html', () => {
      const testText = 'testText';
      const result = parseHtml.call({ innerHTML: `<h1>${testText}` });
      const instance = mount(h(result, {}) as any);

      expect(instance.html()).toEqual(`<h1>${testText}</h1>`);
    });

    it('handles text values witin custom element', () => {
      const result = parseHtml.call({ innerHTML: testHeading });
      const instance = mount(h(result, {}) as any);

      expect(instance.text()).toEqual(testHeading);
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

    describe('slots', () => {
      const testKey = 'testSlot';

      it('should remove <* slot="{key}"> and apply to props', () => {
        const slots = {};
        const slotValue = 'slotValue';
  
        const slotHtml = `<em slot="${testKey}">${slotValue}</em>`;
        const headingHtml = `<h1>${testHeading}</h1>`;
        const testHtml = `<section>${headingHtml}${slotHtml}</section>`;
  
        const result = parseHtml.call({ innerHTML: testHtml, __slots: slots });
        const instance = mount(h(result, {}) as any);
  
        expect(instance.html()).toEqual(`<section>${headingHtml}</section>`);
        expect(slots).toEqual({ [testKey]: slotValue });
      });
    });
  });
});
