// import { mount } from '@vue/test-utils';
import Message from './message.vue';
import { define } from '../src/define';

/* -----------------------------------
 *
 * Define
 *
 * -------------------------------- */

describe('define()', () => {
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
  });
});
