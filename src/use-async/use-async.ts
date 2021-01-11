import { useState, useCallback } from 'react';
import useMount from '../use-mount';

interface Resolution<D> {
  readonly data: D;
}

interface Rejection<E> {
  readonly error: E;
}

type Pending = undefined;

type Result<D, E> = Resolution<D> | Rejection<E> | Pending;

interface UseAsync<D, E> {
  result: Result<D, E>;
  call(): void;

  isResolved(_result: Result<D, E>): _result is Resolution<D>;
  onResolve<R, F>(
    resolutionCallback: (data: D) => R,
    fallbackValue?: F
  ): R | F | undefined;

  isRejected(_result: Result<D, E>): _result is Rejection<E>;
  onReject<R, F>(
    rejectionCallback: (error: E) => R,
    fallbackValue?: F
  ): R | F | undefined;

  isPending(): boolean;
  onPending<R, F>(
    pendingCallback: () => R,
    fallbackValue?: F
  ): R | F | undefined;
}

/**
 * Provides an interface for handling an AJAX request in a React component.
 * Returns `result` which represents either an object with `data` or `error`,
 * of is `undefined`, while the request is still pending.
 *
 * @param {() => Promise<D>} callback An async callback that makes a request
 *
 * @returns `on-` callbacks and `is-` flags provide a declarative way to work with needed `result`
 * state, and a `sendRequest` function that makes a request when called.
 */
function useAsync<D, E = Error>(callback: () => Promise<D>): UseAsync<D, E> {
  const hasMounted = useMount();

  const [hasRequested, setRequested] = useState(false);

  const [result, setResult] = useState<Result<D, E>>(undefined);

  const call: UseAsync<D, E>['call'] = useCallback(() => {
    if (hasMounted()) {
      setRequested(true);

      setResult(undefined);

      callback()
        .then((data) => {
          return setResult({ data });
        })
        .catch((error) => {
          setResult({ error });
        });
    }
  }, [hasMounted(), callback]);

  const isResolved = useCallback(
    (requestResult: Result<D, E>): requestResult is Resolution<D> => {
      return requestResult !== undefined && 'data' in requestResult;
    },
    []
  );

  const onResolve: UseAsync<D, E>['onResolve'] = useCallback(
    (resolutionCallback, fallbackValue) => {
      return isResolved(result)
        ? resolutionCallback(result.data)
        : fallbackValue;
    },
    [isResolved(result), result]
  );

  const isRejected = useCallback(
    (requestResult: Result<D, E>): requestResult is Rejection<E> => {
      return requestResult !== undefined && 'error' in requestResult;
    },
    []
  );

  const onReject: UseAsync<D, E>['onReject'] = useCallback(
    (rejectionCallback, fallbackValue) => {
      return isRejected(result)
        ? rejectionCallback(result.error)
        : fallbackValue;
    },
    [isRejected(result), result]
  );

  const isPending = useCallback(() => {
    return !isRejected(result) && !isResolved(result) && hasRequested;
  }, [isRejected(result), isResolved(result), result, hasRequested]);

  const onPending: UseAsync<D, E>['onPending'] = useCallback(
    (pendingCallback, fallbackValue) => {
      return isPending() ? pendingCallback() : fallbackValue;
    },
    [isPending()]
  );

  return {
    result,
    call,

    isResolved,
    onResolve,

    isRejected,
    onReject,

    isPending,
    onPending
  };
}

export default useAsync;
