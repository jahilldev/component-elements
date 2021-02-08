import { h } from 'preact';
import { define } from '@/index';

/* -----------------------------------
 *
 * Component
 *
 * -------------------------------- */

function Message({ value }) {
  return <em>{value}</em>;
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

  it('renders component when defined', () => {
    const props = { value: 'testValue ' };

    define('custom-message', Message);

    const element = document.createElement('custom-message');

    element.innerHTML = `<script type="application/json">${JSON.stringify(props)}</script>`;

    root.appendChild(element);

    expect(root.innerHTML).toEqual(
      `<custom-message><em>${props.value}</em></custom-message>`
    );
  });
});
