import { getAsyncComponent, getElementTag, getElementAttributes } from '../src/element';

/* -----------------------------------
 *
 * Variables
 *
 * -------------------------------- */

const testComponent = () => void 0;
const testObjectKey = 'TagName';
const testValidTag = 'tag-name';
const testInvalidTag = 'tag';
const testAttributeKey = 'testTitle';
const testProps = { [testAttributeKey]: 'testTitle' };
const testAttribute = { name: testAttributeKey, value: 'testTitle' };

/* -----------------------------------
 *
 * Element
 *
 * -------------------------------- */

describe('element', () => {
  afterAll(() => jest.clearAllMocks());

  describe('getAsyncComponent()', () => {
    it('resolves a Promise that returns a component function', async () => {
      const result = await getAsyncComponent(Promise.resolve(testComponent), testValidTag);

      expect(result).toEqual(testComponent);
    });

    it('resolves a Promise that returns an object with component', async () => {
      const result = await getAsyncComponent(
        Promise.resolve({ [testObjectKey]: testComponent }),
        testValidTag
      );

      expect(result).toEqual(testComponent);
    });

    it('returns undefined if object does not contain matching component', async () => {
      const result = await getAsyncComponent(
        Promise.resolve({ WrongKey: testComponent }),
        testValidTag
      );

      expect(result).toEqual(void 0);
    });
  });

  describe('getElementTag()', () => {
    it('accepts a non valid custom element tag and modifies', () => {
      const result = getElementTag(testInvalidTag);

      expect(result).toEqual(`component-${testInvalidTag}`);
    });

    it('accepts a valid custom element tag and returns', () => {
      const result = getElementTag(testValidTag);

      expect(result).toEqual(testValidTag);
    });
  });

  describe('getElementAttributes()', () => {
    const element = {
      __options: { attributes: [testAttributeKey] },
      attributes: [testAttribute],
      hasAttributes: () => true,
    };

    it('converts defined attributes into props object', () => {
      const result = getElementAttributes.call(element);

      expect(result).toEqual(testProps);
    });

    it('ignores attributes that are not defined via attributes option', () => {
      const result = getElementAttributes.call({ ...element, __options: [] });

      expect(result).toEqual({});
    });

    it('skips conversion if element has no attributes', () => {
      const result = getElementAttributes.call({ ...element, hasAttributes: () => false });

      expect(result).toEqual({});
    });
  });
});
