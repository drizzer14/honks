import { useState, useEffect, useCallback, useMemo } from 'react';

export interface Success<D> {
  readonly data: D;
}

export interface Fail<E> {
  readonly error: E;
}

export type Result<D, E> = Success<D> | Fail<E> | undefined;

const useRequest = <D, E>(
  request: () => Promise<D>,
  options: {
    dependencies?: unknown[];
    isRequesting?: boolean;
    isDefaultLoading?: boolean;
  } = {}
): {
  result: Result<D, E>;

  isSuccess(_result: Result<D, E>): _result is Success<D>;
  onSuccess<R>(callback: (data: D) => R): R | null;

  isFail(_result: Result<D, E>): _result is Fail<E>;
  onFail<R>(callback: (error: E) => R): R | null;

  isPending(_result: Result<D, E>): _result is undefined;
  onPending<R>(callback: () => R): R | null;

  triggerRequest(): void;
} => {
  const {
    dependencies = [],
    isRequesting = true,
    isDefaultLoading = true
  } = useMemo(() => options, [JSON.stringify(options)]);

  const [hasMounted, setMounted] = useState(false);

  const [_, triggerRequest] = useState(false);

  const [isLoading, setLoading] = useState(isDefaultLoading);
  const [result, setResult] = useState<Result<D, E>>();

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
  }, [_, isRequesting, hasMounted, ...dependencies]);

  const isSuccess = useCallback(
    (_result: Result<D, E>): _result is Success<D> => {
      return !isLoading && _result !== undefined && 'data' in _result;
    },
    [isLoading]
  );

  const onSuccess = useCallback(
    <R>(callback: (data: D) => R): R | null => {
      if (isSuccess(result)) {
        return callback(result.data);
      }

      return null;
    },
    [isSuccess(result), JSON.stringify(result)]
  );

  const isFail = useCallback(
    (_result: Result<D, E>): _result is Fail<E> => {
      return !isLoading && _result !== undefined && 'error' in _result;
    },
    [isLoading]
  );

  const onFail = useCallback(
    <R>(callback: (error: E) => R): R | null => {
      if (isFail(result)) {
        return callback(result.error);
      }

      return null;
    },
    [isFail(result), JSON.stringify(result)]
  );

  const isPending = useCallback(
    (_result: Result<D, E>): _result is undefined => {
      return isLoading && _result === undefined;
    },
    [isLoading]
  );

  const onPending = useCallback(
    <R>(callback: () => R): R | null => {
      if (isPending(result)) {
        return callback();
      }

      return null;
    },
    [isLoading, isPending(result)]
  );

  return {
    result,

    isSuccess,
    onSuccess,

    isFail,
    onFail,

    isPending,
    onPending,

    triggerRequest: () => triggerRequest(!_)
  };
};

export default useRequest;
