import { useCallback, useEffect, useRef } from 'react';

/**
 * Depicts a mounting state of a component
 *
 * @returns {() => boolean} A function that returns current mounting state
 */
function useMount(): () => boolean {
  let { current: hasMounted } = useRef(false);

  useEffect(() => {
    hasMounted = true;

    return () => {
      hasMounted = false;
    };
  }, []);

  return useCallback(() => hasMounted, []);
}

export default useMount;
