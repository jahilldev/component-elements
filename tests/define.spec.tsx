import { h, JSX } from 'preact';
import { mount } from 'enzyme';
import { define } from '../src/index';

/* -----------------------------------
 *
 * Promises
 *
 * -------------------------------- */

function flushPromises() {
  return new Promise((resolve) => setImmediate(resolve));
}

/* -----------------------------------
 *
 * IProps
 *
 * -------------------------------- */

interface IProps {
  customTitle?: string;
  value: string;
  children?: any;
}

/* -----------------------------------
 *
 * Component
 *
 * -------------------------------- */

function Message({ customTitle, value, children }: IProps) {
  return (
    <div>
      {customTitle && <h2>{customTitle}</h2>}
      <em>{value}</em>
      {children}
    </div>
  );
}

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

    it('renders component correctly when from props attribute', async () => {
      const props = { value: 'propsValue' };

      define('message-one', () => Message);

      const element = document.createElement('message-one');

      element.setAttribute('props', JSON.stringify(props));

      root.appendChild(element);

      expect(root.innerHTML).toEqual(
        `<message-one><div><em>${props.value}</em></div></message-one>`
      );
    });

    it('renders component correctly when from json script block', async () => {
      const props = { value: 'jsonValue' };
      const json = `<script type="application/json">${JSON.stringify(props)}</script>`;

      define('message-two', () => Message);

      const element = document.createElement('message-two');

      element.innerHTML = json;

      root.appendChild(element);

      expect(root.innerHTML).toEqual(
        `<message-two><div><em>${props.value}</em></div></message-two>`
      );
    });

    it('sets contained HTML as children prop when not server rendered', async () => {
      const props = { value: 'childMarkup' };
      const json = `<script type="application/json">${JSON.stringify(props)}</script>`;
      const html = '<p>Lorem ipsum dolor</p><button>Click here</button>';

      define('message-three', () => Message);

      const element = document.createElement('message-three');

      element.innerHTML = json + html;

      root.appendChild(element);

      expect(root.innerHTML).toEqual(
        `<message-three><div><em>${props.value}</em>${html}</div></message-three>`
      );
    });

    it('does not use contained HTML if server rendered', async () => {
      const props = { value: 'serverRender' };
      const json = `<script type="application/json">${JSON.stringify(props)}</script>`;
      const html = '<p>Server rendered!</p><button>Click here</button>';

      define('message-four', () => Message);

      const element = document.createElement('message-four');

      element.setAttribute('server', '');
      element.innerHTML = json + html;

      root.appendChild(element);

      expect(root.innerHTML).toEqual(
        `<message-four><div><em>${props.value}</em></div></message-four>`
      );
    });

    it('renders component asynchronously when provided', async () => {
      const props = { value: 'asyncValue' };
      const json = `<script type="application/json">${JSON.stringify(props)}</script>`;

      define('message-five', () => Promise.resolve(Message));

      const element = document.createElement('message-five');

      element.innerHTML = json;

      root.appendChild(element);

      await flushPromises();

      expect(root.innerHTML).toEqual(
        `<message-five><div><em>${props.value}</em></div></message-five>`
      );
    });

    it('merges defined attributes in array with component props', () => {
      const customTitle = 'customTitle';
      const props = { value: 'attrProps' };
      const json = `<script type="application/json">${JSON.stringify(props)}</script>`;

      define('message-six', () => Message, ['custom-title']);

      const element = document.createElement('message-six');

      element.setAttribute('custom-title', customTitle);
      element.innerHTML = json;

      root.appendChild(element);

      expect(root.innerHTML).toEqual(
        `<message-six><div><h2>${customTitle}</h2><em>${props.value}</em></div></message-six>`
      );
    });
  });

  describe('when run on the server', () => {
    const { window } = global;

    beforeAll(() => {
      delete global.window;
    });

    afterAll(() => {
      global.window = window;
    });

    it('returns the correct markup', () => {
      const props = { value: 'serverValue' };
      const component = define('message-eight', () => Message);

      const instance = mount(h(component, props));

      expect(instance.find('message-eight').length).toEqual(1);
      expect(instance.find('em').text()).toEqual(props.value);
    });

    it('throws an error when used with a promise', () => {
      expect(() => define('message-nine', () => Promise.resolve(Message))).toThrow();
    });

    it('includes a json script block with props', () => {
      const props = { value: 'serverValue' };
      const component = define('message-ten', () => Message);

      const instance = mount(h(component, props));

      expect(instance.find('script').text()).toEqual(JSON.stringify(props));
    });
  });
});
