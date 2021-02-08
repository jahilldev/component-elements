import { h } from 'preact';
import { define } from '@/index';

/* -----------------------------------
 *
 * Component
 *
 * -------------------------------- */

function Message({ value, children }) {
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
  let root;

  beforeEach(() => {
    root = document.createElement('div');
    document.body.appendChild(root);
  });

  afterEach(() => {
    document.body.removeChild(root);
  });

  it('renders component correctly when from props attribute', () => {
    const props = { value: 'propsValue' };

    define('message-attribute', Message);

    const element = document.createElement('message-attribute');

    element.setAttribute('props', JSON.stringify(props));

    root.appendChild(element);

    expect(root.innerHTML).toEqual(
      `<message-attribute><div><em>${props.value}</em></div></message-attribute>`
    );
  });

  it('renders component correctly when from json script block', () => {
    const props = { value: 'jsonValue' };

    define('message-script', Message);

    const element = document.createElement('message-script');

    element.innerHTML = `<script type="application/json">${JSON.stringify(props)}</script>`;

    root.appendChild(element);

    expect(root.innerHTML).toEqual(
      `<message-script><div><em>${props.value}</em></div></message-script>`
    );
  });

  it('sets contained HTML as children props when not server rendered', () => {
    const props = { value: 'childMarkup' };
    const json = `<script type="application/json">${JSON.stringify(props)}</script>`;
    const html = '<p>Lorem ipsum dolor</p><button>Click here</button>';

    define('message-html', Message);

    const element = document.createElement('message-html');

    element.innerHTML = json + html;

    root.appendChild(element);

    expect(root.innerHTML).toEqual(
      `<message-html><div><em>${props.value}</em>${html}</div></message-html>`
    );
  });
});
