import { RefObject, useCallback, useEffect, useRef, useState } from 'react';
import { timeout } from '../utils';

/**
 * Makes soft transitions between `auto` and a certain value of a CSS property possible
 *
 * @param {(element: R) => number} getValue A getter function that must return current value of a property to be transitioned
 * @param {boolean} handle A boolean switch that toggles transition state
 * @param {number} transitionSpeed Optional transition speed, defaults to 300
 *
 * @returns {[React.RefObject<R>, string]} A tuple of `ref` to be placed on a HTML element and a computed property value
 */
function useAutoTransition<R extends HTMLElement = HTMLElement>(
  getValue: (element: R) => number,
  [handle, transitionSpeed = 300]: [boolean, number?]
): [RefObject<R>, string] {
  const [preservedValue, setPreservedValue] = useState<number | null>(0);
  const [actualValue, setActualValue] = useState<number | null>(0);

  const ref = useRef<R>(null);

  const enter = useCallback(() => {
    if (actualValue === 0) {
      setActualValue(preservedValue);
    }
  }, [actualValue, preservedValue]);

  const entered = useCallback(async () => {
    if (actualValue !== null && actualValue > 0) {
      await timeout(() => setActualValue(null), transitionSpeed);
    }
  }, [actualValue, transitionSpeed]);

  useEffect(() => {
    if (handle) {
      enter();

      (async () => {
        await entered();
      })();
    }
  }, [handle, actualValue, enter, entered]);

  const exit = useCallback(() => {
    if (actualValue === null) {
      setActualValue(preservedValue);
    }
  }, [actualValue, preservedValue]);

  const exited = useCallback(async () => {
    if (actualValue !== null && actualValue > 0) {
      await timeout(() => setActualValue(0), (preservedValue as number) / 4);
    }
  }, [actualValue, preservedValue]);

  useEffect(() => {
    if (!handle) {
      exit();

      (async () => {
        await exited();
      })();
    }
  }, [handle, actualValue, exit, exited]);

  useEffect(() => {
    if (actualValue === 0) {
      const newPreservedValue = getValue(ref.current as R);

      if (typeof newPreservedValue !== 'number') {
        throw new TypeError(
          'Value received from ref should be of type `number`.'
        );
      }

      setPreservedValue(newPreservedValue);
    }
  }, [actualValue, getValue]);

  return [
    ref,
    ((value: null | number): string => {
      if (value === null) {
        return 'auto';
      }

      if (value !== 0) {
        return `${value}px`;
      }

      return `${value}`;
    })(actualValue)
  ];
}

export default useAutoTransition;
