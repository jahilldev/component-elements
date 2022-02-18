# component-elements

Sometimes it's useful to let the DOM render our components when needed. Custom Elements are great at this. They provide various methods that can inform you when an element is "connected" or "disconnected" from the DOM.

These packages provide the ability to use an HTML custom element as the root for your components. In addition, it allows the use of async code resolution if your custom element isn't immediately used, which is a great strategy for reducing code weight.

It's also a great way for you to integrate your components into other server side frameworks that might render your HTML.

# Getting Started

Depending on your component library, visit the relevant package below and follow setup instructions:

- Preact: [preactement](https://github.com/jahilldev/component-elements/tree/main/packages/preactement#readme)
- VueJS: [vuelement](https://github.com/jahilldev/component-elements/tree/main/packages/vuelement#readme)

# Acknowledgement

This function takes _heavy_ inspiration from the excellent [preact-custom-element](https://github.com/preactjs/preact-custom-element). That library served as a starting point for this package, and all of the Preact guys deserve a massive dose of gratitude. I had slightly different needs, so decided to build this as part solution, part learning excersize.
