import { useState, useEffect, useCallback } from 'react';

interface Success<D> {
  readonly data: D;
}

interface Fail<E> {
  readonly error: E;
}

type Result<D, E> = Success<D> | Fail<E> | undefined;

export interface UseRequestOptions {
  dependencies?: unknown[];
  isRequesting?: boolean;
  isDefaultLoading?: boolean;
}

const useRequest = <D, E = Error>(
  request: () => Promise<D>,
  options: UseRequestOptions = {}
): {
  result: Result<D, E>;

  isSuccess(_result: Result<D, E>): _result is Success<D>;
  onSuccess<R>(callback: (data: D) => R): R | void;

  isFail(_result: Result<D, E>): _result is Fail<E>;
  onFail<R>(callback: (error: E) => R): R | void;

  isPending(): boolean;
  onPending<R>(callback: () => R): R | void;

  triggerRequest(): void;
} => {
  const {
    dependencies = [],
    isRequesting = true,
    isDefaultLoading = true
  } = options;

  const [hasMounted, setMounted] = useState(false);
  const [requestTrigger, setRequestTrigger] = useState(false);
  const [isLoading, setLoading] = useState(isDefaultLoading);

  const [result, setResult] = useState<Result<D, E>>(undefined);

  useEffect(() => {
    setMounted(true);

    return () => setMounted(false);
  }, []);

  useEffect(() => {
    if (isRequesting && hasMounted) {
      (async () => {
        try {
          setLoading(true);
          setResult(undefined);

          const data = await request();

          setResult({ data });
        } catch (error) {
          setResult({ error });
        } finally {
          setLoading(false);
        }
      })();
    }
  }, [requestTrigger, isRequesting, hasMounted, ...dependencies]);

  const isSuccess = useCallback((_result: Result<D, E>): _result is Success<
    D
  > => {
    // eslint-disable-next-line no-prototype-builtins
    return (_result || {}).hasOwnProperty('data');
  }, []);

  const onSuccess = useCallback(
    // eslint-disable-next-line consistent-return
    <R>(callback: (data: D) => R): R | void => {
      if (isSuccess(result)) {
        return callback(result.data);
      }
    },
    [isSuccess(result), result]
  );

  const isFail = useCallback((_result: Result<D, E>): _result is Fail<E> => {
    // eslint-disable-next-line no-prototype-builtins
    return (_result || {}).hasOwnProperty('error');
  }, []);

  const onFail = useCallback(
    // eslint-disable-next-line consistent-return
    <R>(callback: (error: E) => R): R | void => {
      if (isFail(result)) {
        return callback(result.error);
      }
    },
    [isFail(result), result]
  );

  const isPending = useCallback(() => {
    return isLoading;
  }, [isLoading]);

  const onPending = useCallback(
    // eslint-disable-next-line consistent-return
    <R>(callback: () => R): R | void => {
      if (isPending()) {
        return callback();
      }
    },
    [isLoading]
  );

  const triggerRequest = useCallback(() => setRequestTrigger(!requestTrigger), [
    requestTrigger
  ]);

  return {
    result,

    isSuccess,
    onSuccess,

    isFail,
    onFail,

    isPending,
    onPending,

    triggerRequest
  };
};

export default useRequest;
