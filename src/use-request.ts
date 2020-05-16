import { useEffect, useState } from 'react';

const useRequest = <D, E = unknown>(
  requestCallback: (...args: unknown[]) => Promise<D>,
  options: {
    dependencies?: unknown[];
    isRequesting?: boolean;
    isDefaultLoading?: boolean;
  } = {}
): {
  data: D | null;
  error: E | null;
  isLoading: boolean;
  triggerRequest(): void;
} => {
  const {
    dependencies = [],
    isRequesting = true,
    isDefaultLoading = true
  } = options;

  const [isMounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    return () => {
      setMounted(false);
    };
  }, []);

  const [data, setData] = useState<D | null>(null);
  const [error, setError] = useState<E | null>(null);
  const [isLoading, setLoading] = useState(isDefaultLoading);
  const [_, triggerRequest] = useState(false);

  useEffect(() => {
    if (isRequesting && isMounted) {
      (async () => {
        try {
          setError(null);
          setLoading(true);

          const requestData = await requestCallback();

          setData(requestData);
        } catch (error) {
          setError(error);
        } finally {
          setLoading(false);
        }
      })();
    }
  }, [_, isRequesting, isMounted, ...dependencies]);

  return { data, error, isLoading, triggerRequest: () => triggerRequest(!_) };
};

export default useRequest;
