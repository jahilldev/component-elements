import { h } from 'preact';
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
  value: string;
  children?: any;
}

/* -----------------------------------
 *
 * Component
 *
 * -------------------------------- */

function Message({ value, children }: IProps) {
  return (
    <div>
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

      define('message-attribute', () => Message);

      const element = document.createElement('message-attribute');

      element.setAttribute('props', JSON.stringify(props));

      root.appendChild(element);

      expect(root.innerHTML).toEqual(
        `<message-attribute><div><em>${props.value}</em></div></message-attribute>`
      );
    });

    it('renders component correctly when from json script block', async () => {
      const props = { value: 'jsonValue' };

      define('message-script', () => Message);

      const element = document.createElement('message-script');

      element.innerHTML = `<script type="application/json">${JSON.stringify(
        props
      )}</script>`;

      root.appendChild(element);

      expect(root.innerHTML).toEqual(
        `<message-script><div><em>${props.value}</em></div></message-script>`
      );
    });

    it('sets contained HTML as children prop when not server rendered', async () => {
      const props = { value: 'childMarkup' };
      const json = `<script type="application/json">${JSON.stringify(props)}</script>`;
      const html = '<p>Lorem ipsum dolor</p><button>Click here</button>';

      define('message-html', () => Message);

      const element = document.createElement('message-html');

      element.innerHTML = json + html;

      root.appendChild(element);

      expect(root.innerHTML).toEqual(
        `<message-html><div><em>${props.value}</em>${html}</div></message-html>`
      );
    });

    it('does not use contained HTML if server rendered', async () => {
      const props = { value: 'serverRender' };
      const json = `<script type="application/json">${JSON.stringify(props)}</script>`;
      const html = '<p>Server rendered!</p><button>Click here</button>';

      define('message-server', () => Message);

      const element = document.createElement('message-server');

      element.setAttribute('server', '');
      element.innerHTML = json + html;

      root.appendChild(element);

      expect(root.innerHTML).toEqual(
        `<message-server><div><em>${props.value}</em></div></message-server>`
      );
    });

    it('renders component asynchronously when provided', async () => {
      const props = { value: 'asyncValue' };

      define('message-async', () => Promise.resolve(Message));

      const element = document.createElement('message-async');

      element.innerHTML = `<script type="application/json">${JSON.stringify(
        props
      )}</script>`;

      root.appendChild(element);

      await flushPromises();

      expect(root.innerHTML).toEqual(
        `<message-async><div><em>${props.value}</em></div></message-async>`
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
      const props = { value: 'asyncValue' };

      const component = define('message-server', () => Message);
      const instance = mount(h(component, props));

      expect(instance.find('message-server').length).toEqual(1);
      expect(instance.find('em').text()).toEqual(props.value);
    });
  });
});
