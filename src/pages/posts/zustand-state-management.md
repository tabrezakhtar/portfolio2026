---
layout: ../../layouts/MarkdownPostLayout.astro
title: 'State Management with Zustand'
pubDate: 2026-04-10
description: 'Using Zustand for state management in React apps.'
author: 'Tabrez Akhtar'
tags: ["React", "Zustand", "State Management", "JavaScript"]
---

I've used Redux and Context API in the past. They work fine, but honestly they feel like overkill for most things I build. Context API re-rendering issues can be difficult to pin down sometimes. I came across <a href="https://github.com/pmndrs/zustand" target="_blank" rel="noreferrer">Zustand</a> recently and it's much simpler.

It's a tiny state management library that doesn't require providers or reducers.

### Installation

```bash
npm install zustand
```

I was surprised that this is all that's needed to install - no config files!

### Creating a Store

Let's build a simple user authentication store:

```javascript
// stores/userStore.js
import { create } from 'zustand'

const useUserStore = create((set) => ({
  user: null,
  isLoggedIn: false,
  
  login: (userData) => set({ 
    user: userData, 
    isLoggedIn: true 
  }),
  
  logout: () => set({ 
    user: null, 
    isLoggedIn: false 
  })
}))

export default useUserStore
```

### Using the Store

Now use it in any component. No providers needed.

**Navbar component:**

```jsx
// components/Navbar.jsx
import useUserStore from '../stores/userStore'

function Navbar() {
  const { isLoggedIn, login, logout } = useUserStore()
  
  const handleLogin = () => {
    login({ name: 'John Doe', email: 'john@example.com' })
  }
  
  return (
    <nav>
      {isLoggedIn ? (
        <button onClick={logout}>Logout</button>
      ) : (
        <button onClick={handleLogin}>Login</button>
      )}
    </nav>
  )
}
```

**Profile component:**

```jsx
// components/UserProfile.jsx
import useUserStore from '../stores/userStore'

function UserProfile() {
  const { user, isLoggedIn } = useUserStore()
  
  if (!isLoggedIn) return <p>Please log in</p>
  
  return (
    <div className="profile-card">
      <h2>{user.name}</h2>
      <p>{user.email}</p>
    </div>
  )
}
```

That's it. Click login in the navbar, and the profile card updates instantly. Both components share the same state without prop drilling or context wrapping.

### What I Like About It

- No boilerplate - just create a store and use it
- No providers needed - import it anywhere
- Works well with TypeScript
- Tiny bundle size (1KB)

If you've been annoyed by Redux setup or Context API re-renders, Zustand is worth checking out.
