import { h } from 'preact';
import { mount } from 'enzyme';
import { parseJson, parseHtml } from '../src/parse';

/* -----------------------------------
 *
 * Variables
 *
 * -------------------------------- */

const testHeading = 'testHeading';
const testWhitespace = '    ';
const testHtml = `<h1>${testHeading}</h1><section><h2 title="Main Title">Hello</h2></section>`;
const testScript = `<script>alert('danger')</script>`;
const testData = { testHeading };
const testJson = JSON.stringify(testData);

/* -----------------------------------
 *
 * Parse
 *
 * -------------------------------- */

describe('parse', () => {
  describe('parseJson()', () => {
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    const properties = {
      tagName: 'tag-name',
      __options: {},
    };

    it('should correctly parse json', () => {
      const result = parseJson.call(properties, testJson);

      expect(result).toEqual(testData);
    });

    it('should handle invalid json', () => {
      const result = parseJson.call(properties, '{test:}');

      expect(result).toEqual({});
      expect(errorSpy).toHaveBeenCalled();
    });

    it('should run "formatProps" if defined via options', () => {
      const formatProps = (props: any) => ({ ...props, format: true });
      const testProps = { ...properties, __options: { ...properties.__options, formatProps } };
      const result = parseJson.call(testProps, testJson);

      expect(result.hasOwnProperty('format')).toBe(true);
      expect(result.format).toEqual(true);
    });
  });

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
