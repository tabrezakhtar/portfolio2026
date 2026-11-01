---
layout: ../../layouts/MarkdownPostLayout.astro
title: 'Spring cleaning my React project'
pubDate: 2025-03-05
description: 'Simplifying Without Sass or Redux.'
author: 'Tabrez Akhtar'
tags: ["React", "Redux", "BeerCSS"]
---
I wrote this Tennis score keeper app about 5 years ago in React and Redux and decided to give it a refresh.
<img src="https://res.cloudinary.com/dx8d5hlk1/image/upload/f_auto/v1775227131/whatsthescore_qfnlcq.png" alt="Old version of whatsthescore app" width="200">

There were a few issues with my existing project:

- I used create-react-app for the front end tooling and it is now [deprecated.](https://react.dev/blog/2025/02/14/sunsetting-create-react-app) 
- Node-sass is deprecated and the project gives an error when starting.
- The API for Redux had changed.

My goal for the refresh was to remove the dependency for Sass and Redux.  I don't mind using them but don't think they are necessary for this project.
<br /><br />
## Create-react-app alternative

The recommended alternative is [Vite](https://vite.dev) so I installed it and created a new project.
<img src="/assets/img/blog/new-vite.png" alt="Installing a new Vite project" width="600">

## Migrating old code

Rather than upgrading the existing project, in this case it was simpler to just copy code across  to the new project. Next, Sass and all CSS styles were removed. Then, all Redux reducers (and their calls) were commented out. Also I updated React Router.  This enabled the project to run without errors.
<img src="/assets/img/blog/whatsthescore-nostyle.png" alt="Screenshot of app with styles removed" width="250">

Instead of Redux, I wanted to just use the Context API which is built into React.  Theres a nice guide [here](https://react.dev/learn/scaling-up-with-reducer-and-context#step-3-use-context-anywhere-in-the-tree) on how to use it to manage state.

I converted `MenuReducer` first as its the smallest reducer.

*This is what looked like before with Redux:*
```javascript
// menuReducer.js
export const initialState = {
  selected: false
}

export default function menuReducer(state = initialState, action) {
  switch (action.type) {
    case 'TOGGLE_MENU':
      return { 
        ...state,
        selected: action.payload
      }
    default:
      return state
  }
}
```
*This is afterwards with the Context API:*
```javascript
//menuContext.js
import { createContext, useContext, useState } from "react";
import PropTypes from "prop-types";

export const initialState = {
  selected: false
}

const MenuContext = createContext(null);

const MenuProvider = ({ children }) => {
  const [menu, setMenu] = useState(initialState);

  const toggleMenu = () => {
    setMenu((menu) => ({ ...menu, selected: !menu.selected }));
  };

  const value = { menu, toggleMenu };

  return <MenuContext.Provider value={value}>{children}</MenuContext.Provider>;
};

MenuProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export { MenuProvider, MenuContext };
```

The state is saved in the Provider, then the individual functions that handle the state are exported.  This maintains the same pattern as before, except instead of dispatching actions, the exported function can be invoked from any component that utilizes the context.

There is a little more code here than before, but I'm ok with this as the goal was to remove Redux.

Once I got this reducer converted, the pattern was just replicated to the other reducers.
<br /><br />
## BeerCSS
<img src="/assets/img/blog/beercss.png" alt="BeerCSS" width="250">

After the app was working again, I thought about what to do about the UI.  I knew that I wanted a Material style look but using the [MUI](https://mui.com) framework is overkill for a small project like this.

I found [BeerCSS](https://www.beercss.com/) which is a tiny library for styling apps.  It can even be installed simply by using a CDN:

```html
<link href="https://cdn.jsdelivr.net/npm/beercss@3.9.7/dist/cdn/beer.min.css" rel="stylesheet">
<script type="module" src="https://cdn.jsdelivr.net/npm/beercss@3.9.7/dist/cdn/beer.min.js"></script>
```

<img src="/assets/img/blog/beercsskb.png" alt="Screenshot of beer css size" width="700">
The library is only 18.8kb!

After some fiddling with the markup, this is what the final result looks like🎉

[link](https://whatsthescore.netlify.app/)
<img src="https://res.cloudinary.com/dx8d5hlk1/image/upload/f_auto/v1775227131/whatsthescore2025_nuo4h8.png" alt="Screenshot of new project" width="200">