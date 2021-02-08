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
    define('custom-message', Message);

    const element = document.createElement('custom-message');

    root.appendChild(element);

    expect(root.innerHTML).toEqual('<custom-message><em></em></custom-message>');
  });
});
