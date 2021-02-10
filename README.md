# preactement

Sometimes, it's useful to let the DOM render our components when needed. Custom Elements are great at this. They provide various methods that can inform you when an element is "connected" or "disconnected" from the DOM.

This package provides the ability to use an HTML custom element as the root for your components. It's intended to provide an easy way for you to integrate Preact into other server side frameworks that might render your HTML. The exported function can also be used for hydration from SSR in Node.

# Getting Started

Install with Yarn:

```bash
$ yarn add preactement
```

Install with NPM:

```bash
$ npm i preactement
```

# Using define()

`preactement` exports one function, `define()`. This allows us to register a custom element via a provided key, and provide the component we'd like to render within.

For example:

```tsx
import { define } from 'preactement';
import { HeroBanner } from './heroBanner';

/*[...]*/

define('hero-banner', () => HeroBanner);
```

This registers `<hero-banner>` as a custom element. When that element exists on the page, `preactement` will render our component. If the custom element isn't present immediately, e.g it's created dynamically at some point in the future, we can provide a async function:

```tsx
define('hero-banner', () => import('./heroBanner').then(({ HeroBanner }) => HeroBanner));
```

This allows us to reduce the overall code in our bundle, and load the required component on demand when needed.

# Use Cases

The following are a few situations where `preactement` might come in handy. I'm sure there are others, but these were useful to me.

## Integration with other frameworks

If you're using something other than Node to render your HTML pages, you might want an easy method of integrating Preact into your project. Preact is a great fit for controlling the more interactive elements on your site given it's small size. With `preactement` you can do the following:

Say we have a Preact component, `LoginForm`, first we'll render a custom element on our page:

```html
<login-form></login-form>
```

Now that we have a container, we need to include the Preact component in our code. In your "entry" file, or the source that produces the JS file to run on your page, we "define" a custom element using our Preact component:

```typescript
import { define } from 'preactement';
import { LoginForm } from './loginForm';

/*[...]*/

define('login-form', () => LoginForm);
```

When this runs, whenever the custom element is present in the DOM, `preactement` will render our component within.

# Acknowledgement

This function takes _heavy_ inspiration from the excellent [preact-custom-element](https://github.com/preactjs/preact-custom-element). That library served as a starting point for this package, and all of the Preact guys deserve a massive dose of gratitude. I had slightly different needs, so decided to build this as part solution, part learning excersize.
