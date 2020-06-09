import { useState, useCallback } from 'react';
import useMount from '../use-mount';

interface Success<D> {
  readonly data: D;
}

interface Fail<E> {
  readonly error: E;
}

type Result<D, E> = Success<D> | Fail<E> | undefined;

/**
 * Provides an interface for handling an AJAX request in a React component.
 * Returns `result` which represents either an object with `data` or `error`,
 * of is `undefined`, while the request is still pending.
 *
 * @param {() => Promise<D>} requestCallback An async callback that makes a request
 *
 * @returns `on-` callbacks and `is-` flags provide a declarative way to work with needed `result`
 * state, and a `sendRequest` function that makes a request when called.
 */
const useRequest = <D, E = Error>(
  requestCallback: () => Promise<D>
): {
  result: Result<D, E>;

  isSuccess(_result: Result<D, E>): _result is Success<D>;
  onSuccess<R>(callback: (data: D) => R): R | void;

  isFail(_result: Result<D, E>): _result is Fail<E>;
  onFail<R>(callback: (error: E) => R): R | void;

  isPending(): boolean;
  onPending<R>(callback: () => R): R | void;

  sendRequest(): Promise<void>;
} => {
  const hasMounted = useMount();

  const [hasRequested, setRequested] = useState(false);

  const [result, setResult] = useState<Result<D, E>>(undefined);

  const sendRequest = useCallback(async () => {
    if (hasMounted()) {
      setRequested(true);

      try {
        setResult(undefined);

        const data = await requestCallback();

        setResult({ data });
      } catch (error) {
        setResult({ error });
      }
    }
  }, [hasMounted(), requestCallback]);

  const isSuccess = useCallback(
    (requestResult: Result<D, E>): requestResult is Success<D> => {
      // eslint-disable-next-line no-prototype-builtins
      return (requestResult || {}).hasOwnProperty('data');
    },
    []
  );

  const onSuccess = useCallback(
    <R>(callback: (data: D) => R): R | void => {
      return isSuccess(result) ? callback(result.data) : undefined;
    },
    [isSuccess(result), result]
  );

  const isFail = useCallback(
    (requestResult: Result<D, E>): requestResult is Fail<E> => {
      // eslint-disable-next-line no-prototype-builtins
      return (requestResult || {}).hasOwnProperty('error');
    },
    []
  );

  const onFail = useCallback(
    <R>(callback: (error: E) => R): R | void => {
      return isFail(result) ? callback(result.error) : undefined;
    },
    [isFail(result), result]
  );

  const isPending = useCallback(() => {
    return !isFail(result) && !isSuccess(result) && hasRequested;
  }, [isFail(result), isSuccess(result), result, hasRequested]);

  const onPending = useCallback(
    <R>(callback: () => R): R | void => {
      return isPending() ? callback() : undefined;
    },
    [isPending()]
  );

  return {
    result,
    sendRequest,

    isSuccess,
    onSuccess,

    isFail,
    onFail,

    isPending,
    onPending
  };
};

export default useRequest;
