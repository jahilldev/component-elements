import { h } from 'preact';
import { mount } from 'enzyme';
import { parseJson } from '../src/parse';

/* -----------------------------------
 *
 * Variables
 *
 * -------------------------------- */

const testHeading = 'testHeading';
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
});
