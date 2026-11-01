---
layout: ../../layouts/MarkdownPostLayout.astro
title: Trying out the React Compiler
pubDate: 2026-03-11
description: How the React Compiler eliminates unnecessary renders and callback dependency issues
author: Tabrez Akhtar
tags: ["React", "Compiler", "Performance", "React 19"]
---

The React Compiler has become one of my favorite improvements in modern
React development.

Like many React developers, now and again I run into a familiar set of performance problems: unnecessary re-renders, duplicate API calls, and child components updating far more often than necessary.  

Almost every time, the root cause was the same: forgetting to wrap a function in `useCallback`, or skipping `useMemo` on a derived value.

These bugs are frustrating because **the UI usually looks correct**.
The problem hides in profiler traces: every render creates fresh
function instances - parents pass new props, children re-render and the
cycle repeats.

Here's a classic example that many of us have written:

```tsx
import { useState, useEffect } from 'react';

type Show = { /* ... */ };

function App() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Show[]>([]);

  const searchShows = (q: string) => {
    if (!q.trim()) {
      setResults([]);
      return;
    }

    fetch(`https://api.tvmaze.com/search/shows?q=${encodeURIComponent(q)}`)
      .then((res) => res.json())
      .then((data) => setResults(data))
      .catch((err) => {
        console.error(err);
        setResults([]);
      });
  };

  useEffect(() => {
    searchShows(query);
  }, [query, searchShows]); // ? searchShows changes on every render!

  return (
    <div className="App">
      <div className="search-box">
        {/* input + results rendering */}
      </div>
    </div>
  );
}
```

The fix seems straightforward: wrap `searchShows` in `useCallback`.  But then you’re stuck carefully managing the dependency array forever.

- Forget a dependency → you get a stale closure and buggy behavior  
- Add something unnecessary → you defeat the memoization or create a new function every render anyway  

It’s surprisingly easy to introduce subtle, hard-to-spot bugs this way.

```tsx
// The manual fix nobody loves writing
const searchShows = useCallback((q: string) => {
  // same body
}, []); // ? what goes here?
```

This is what happens when the above code runs:
<br>
`Before`
<video controls width="600">
  <source src="https://res.cloudinary.com/dx8d5hlk1/video/upload/v1773252187/react-compiler-before_j2jnfi.mp4" type="video/mp4">
  Your browser does not support the video tag.
</video>

With the compiler enabled, the code stops making infinite API calls -
the compiler automatically inserts `useCallback` where needed, so you no longer have to manage memoization by hand.
<br>
`After`
<video controls width="600">
  <source src="https://res.cloudinary.com/dx8d5hlk1/video/upload/v1773252186/react-compiler-after_kqb7es.mp4" type="video/mp4">
  Your browser does not support the video tag.
</video>

<br>

## Getting started (Vite)

If you're using Vite, the setup is still straightforward (React Compiler
is stable and production-ready as of 2026):

1. Make sure you're on React-19 (or at least 18.3 with the new runtime):

```bash
npm install react@latest react-dom@latest
```

2. Install the Babel plugin:

```bash
npm install -D babel-plugin-react-compiler
```

3. (Strongly recommended) Install the ESLint companion plugin.  It
   catches code that violates rules the compiler depends on.

```bash
npm install -D eslint-plugin-react-compiler
```

   Then extend it in your ESLint config, e.g.
   `extends: ["plugin:react-compiler/recommended"]`.

4. Update `vite.config.js` / `vite.config.ts`:

```ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [
          ['babel-plugin-react-compiler'],
          // optional: { target: '18' } or other config if needed
        ],
      },
    }),
  ],
});
```

Once enabled, the compiler automatically:

- Memoizes callbacks and values where safe
- Adds `key` props to lists when needed
- Prevents many unnecessary re-renders
- Works inside conditionals/loops in ways manual `useMemo`/`useCallback`
  often can't


## Why it matters in 2026

- Fewer wasted renders - especially helpful in large or data-heavy UIs
- Much less boilerplate - goodbye to 90% of `useCallback`/`useMemo`
- Fewer subtle bugs from incorrect or missing dependencies
- Gradual adoption — you can enable the compiler on a single component or route, and expand as you gain confidence
- Still 100% opt-in - disable per-file with `/* @react-compiler disable */`
  desired

The compiler doesn't replace every optimization decision, but it removes
most of the tedious, error-prone ones. It lets me focus on features and logic instead of rendering quirks.

If you're curious, you can find more details and examples here:
https://react.dev/learn/react-compiler
