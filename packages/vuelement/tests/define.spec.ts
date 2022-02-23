// import { mount } from '@vue/test-utils';
import Message from './message.vue';
import { define } from '../src/define';

/* -----------------------------------
 *
 * Promises
 *
 * -------------------------------- */

function flushPromises() {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

/* -----------------------------------
 *
 * Define
 *
 * -------------------------------- */

describe('define()', () => {
  const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

  describe('when run in the browser', () => {
    let root;

    beforeEach(() => {
      root = document.createElement('div');
      document.body.appendChild(root);
    });

    afterEach(() => {
      document.body.removeChild(root);
    });

    it('validates tag name value with prefix if needed', () => {
      const props = { value: 'propsValue' };

      define('message', () => Message);

      const element = document.createElement('component-message');

      element.setAttribute('props', JSON.stringify(props));

      root.appendChild(element);

      expect(root.innerHTML).toContain(`<em>${props.value}</em>`);
    });

    it('renders component correctly when from props attribute', async () => {
      const props = { value: 'propsValue' };

      define('message-one', () => Message);

      const element = document.createElement('message-one');

      element.setAttribute('props', JSON.stringify(props));

      root.appendChild(element);

      expect(root.innerHTML).toContain(`<em>${props.value}</em>`);
    });

    it('renders component correctly when from json script block', async () => {
      const props = { value: 'jsonValue' };
      const json = `<script type="application/json">${JSON.stringify(props)}</script>`;

      define('message-two', () => Message);

      const element = document.createElement('message-two');

      element.innerHTML = json;

      root.appendChild(element);

      expect(root.innerHTML).toContain(`<em>${props.value}</em>`);
    });

    it('renders component asynchronously when provided', async () => {
      const props = { value: 'asyncValue' };
      const json = `<script type="application/json">${JSON.stringify(props)}</script>`;

      define('message-five', () => Promise.resolve(Message));

      const element = document.createElement('message-five');

      element.innerHTML = json;

      root.appendChild(element);

      await flushPromises();

      expect(root.innerHTML).toContain(`<em>${props.value}</em>`);
    });

    it('tries to infer the component if not explicitly returned', async () => {
      const props = { value: 'inferValue' };
      const json = `<script type="application/json">${JSON.stringify(props)}</script>`;

      define('message-six', () => Promise.resolve({ MessageSix: Message }));

      const element = document.createElement('message-six');

      element.innerHTML = json;

      root.appendChild(element);

      await flushPromises();

      expect(root.innerHTML).toContain(`<em>${props.value}</em>`);
    });

    it('merges defined attributes in array with component props', () => {
      const customTitle = 'customTitle';
      const props = { value: 'attrProps' };
      const json = `<script type="application/json">${JSON.stringify(props)}</script>`;

      define('message-seven', () => Message, { attributes: ['custom-title'] });

      const element = document.createElement('message-seven');

      element.setAttribute('custom-title', customTitle);
      element.innerHTML = json;

      root.appendChild(element);

      expect(root.innerHTML).toContain(`<h2>${customTitle}</h2><em>${props.value}</em>`);
    });

    it('errors if component cannot be found in function', async () => {
      define('message-eight', () => Promise.resolve({ Message }));

      const element = document.createElement('message-eight');

      root.appendChild(element);

      await flushPromises();

      expect(errorSpy).toBeCalled();
      expect(element.innerHTML).toEqual('');
    });

    it('updates component props when attributes are changed', () => {
      const customTitle = 'customTitle';
      const updatedProp = 'updated!';
      const props = { value: 'attrUpdate' };

      define('message-nine', () => Message, { attributes: ['custom-title'] });

      const element = document.createElement('message-nine');

      element.setAttribute('custom-title', customTitle);
      element.setAttribute('props', JSON.stringify(props));

      root.appendChild(element);

      expect(root.innerHTML).toContain(`<h2>${customTitle}</h2><em>${props.value}</em>`);

      element.setAttribute('custom-title', '');
      element.setAttribute('props', JSON.stringify({ ...props, value: updatedProp }));

      expect(root.innerHTML).toContain(`<em>${updatedProp}</em>`);
    });
  });
});
