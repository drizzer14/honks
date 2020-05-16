![](honks-logo.svg)

# Honks

React hooks for your everyday life.

- [useRequest](#userequest)

### `useRequest`

Make an AJAX request easily and without a second thought.

```typescript
import useRequest from 'honks/use-request';

/* ... */

const { data, error, isLoading, triggerRequest } = useRequest(fetch('https://swapi.dev/api/people/1'), {
    isRequesting: haveTitlesRolled,
    isDefaultLoading: false,
    dependencies: [moviesWatched.length]
});

/* ... */

<button onClick={triggerRequest}>Look again!</button>
```
