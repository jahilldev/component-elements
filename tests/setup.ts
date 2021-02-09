import { configure } from 'enzyme';
import Adapter from 'enzyme-adapter-preact-pure';

/* -----------------------------------
 *
 * Setup
 *
 * -------------------------------- */

configure({ adapter: new Adapter() });
