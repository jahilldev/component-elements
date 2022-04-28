import { h } from 'preact';
import { mount } from 'enzyme';
import { parseJson, parseHtml, getPropKey } from '../src/parse';

/* -----------------------------------
 *
 * Variables
 *
 * -------------------------------- */

const testHeading = 'testHeading';
const testData = { testHeading };
const testJson = JSON.stringify(testData);
const testHtml = `<h1>${testHeading}</h1><br /><div><h2 title="Main Title">Hello <em>there</em></h2></div>`;

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

    afterAll(() => errorSpy.mockClear());

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

  describe('parseHtml', () => {
    it('correctly converts a DOM structure to data', () => {
      const result = parseHtml(testHtml);

      console.log(result);

      expect(result).toEqual([null, {}, [
        ['h1', {}, [[null, {}, testHeading]]],
        ['br', {}, []],
        ['div', {}, [
          ['h2', { title: 'Main Title' }, [
            [null, {}, 'Hello'],
            ['em', {}, [[null, {}, 'there']],
          ]]],
        ]]
      ]]);
    });
  });

  describe('getPropKey', () => {
    const testCamel = 'testSlot';
    const testKebab = 'test-slot';
    const testSnake = 'test_slot';
    const testPascal = 'TestSlot';
    const testSentence = 'Test slot';

    it('should normalise casing from kebab to camel', () => {
      const result = getPropKey(testKebab);

      expect(result).toEqual(testCamel);
    });

    it('should normalise casing from snake to camel', () => {
      const result = getPropKey(testSnake);

      expect(result).toEqual(testCamel);
    });

    it('should normalise casing from plascal to camel', () => {
      const result = getPropKey(testPascal);

      expect(result).toEqual(testCamel);
    });

    it('should normalise casing from sentence to camel', () => {
      const result = getPropKey(testSentence);

      expect(result).toEqual(testCamel);
    });
  });
});
