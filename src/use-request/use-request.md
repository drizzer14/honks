### `useRequest`

Provides an interface for handling an AJAX request in a React component.
Returns a `result` which represents either an object with `data` or `error`,
of is `undefined`, while the request is still pending.

`on-` callbacks and `is-` flags provide a handy way to work with needed `result`
state.

`triggerRequest` is function to make a new request when needed.

```typescript
import useRequest from 'honks/use-request';

const Person = ({ haveTitlesRolled, enemy }) => {
  const {
    result,
    onPending,
    onSuccess,
    onError,
    isPending,
    isSuccess,
    isError,
    triggerRequest
  } = useRequest(
    async () => {
      const data = fetch('https://swapi.dev/api/people/1');
      return await data.json();
    },
    {
      isRequesting: haveTitlesRolled, // Should make a request?
      isDefaultLoading: false, // Should start loading right away?
      dependencies: [enemy] // Request when these change
    }
  );

  const name = isSuccess(result) ? result.data.name : 'Unknown';
  const errorMessage = isError(result) ? result.error.message : 'No error';
  const renderLoader = () => {
    if (isPending()) {
      return <Loader />;
    }
  };

  return (
    <div>
      {onPending(() => {
        return <p>Loading...</p>;
      })}

      {onSuccess((data) => {
        return <p>{data.name}</p>;
      })}

      {onError((error) => {
        return <p>{error.message}</p>;
      })}

      <button type="button" onClick={triggerRequest}>
        Reload
      </button>
    </div>
  );
};
```
