import {
  act,
  renderHook,
  RenderHookResult
} from '@testing-library/react-hooks';

import useRequest, { UseRequestOptions } from 'use-request';

import _fetch from 'node-fetch';

jest.mock('node-fetch');

const fetch = (_fetch as unknown) as jest.Mock;

const error = {
  statusCode: 404,
  message: 'Not found'
};

const hookCall = (options?: UseRequestOptions) => {
  return renderHook(
    (_options) =>
      useRequest<{ name: string }, typeof error>(
        async () => await fetch(),
        // @ts-ignore
        _options
      ),
    { initialProps: options }
  );
};

const afterMount = async (options?: UseRequestOptions) => {
  const hook = hookCall(options);

  await hook.waitForNextUpdate();

  return hook;
};

let hook: RenderHookResult<{}, ReturnType<typeof useRequest>>;

describe('useRequest', () => {
  it('Should be defined', () => {
    expect(useRequest).toBeDefined();
    expect(useRequest).toEqual(expect.any(Function));
  });

  describe('Initial state', () => {
    beforeEach(() => {
      hook = hookCall({
        isRequesting: false
      });
    });

    it('Should be pending by default', () => {
      const { isPending } = hook.result.current;

      expect(isPending()).toBeTruthy();
    });

    it('Should return helpers', async () => {
      const { result: _result, ...helpers } = hook.result.current;

      expect(helpers).toBeTruthy();

      expect(helpers).toEqual(expect.any(Object));

      Object.keys(helpers).forEach((key) => {
        expect(helpers[key as keyof typeof helpers]).toEqual(
          expect.any(Function)
        );
      });
    });
  });

  describe('Making a request', () => {
    it('Should not be pending after the request was done', async () => {
      hook = await afterMount();

      const { isPending, isSuccess, isFail, result } = hook.result.current;

      expect(isPending()).toEqual(false);
      expect(isSuccess(result) || isFail(result)).toEqual(true);
    });

    describe('Request state', () => {
      describe('Success', () => {
        const data = {
          name: ''
        };

        beforeEach(async () => {
          fetch.mockImplementation(async () => {
            return data;
          });

          hook = await afterMount();
        });

        it('Should return true on isSuccess', () => {
          const { isSuccess, result } = hook.result.current;

          expect(isSuccess(result)).toEqual(true);
        });

        it('Should call onSuccess with result.data', () => {
          const { onSuccess, onFail, onPending } = hook.result.current;

          expect(
            onSuccess((data) => {
              return data;
            })
          ).toHaveProperty('name');

          expect(
            onFail((error) => {
              return error;
            })
          ).toEqual(undefined);

          expect(
            onPending(() => {
              return 'Pending';
            })
          ).toEqual(undefined);
        });
      });

      describe('Fail', () => {
        const fail = new Error(`${error}`);

        beforeEach(async () => {
          fetch.mockImplementation(async () => {
            throw fail;
          });

          hook = await afterMount();
        });

        it('Should return true on isFail', () => {
          const { isFail, result } = hook.result.current;

          expect(isFail(result)).toEqual(true);
        });

        it('Should call onFail with error', () => {
          const { onFail, onSuccess, onPending } = hook.result.current;

          expect(
            onFail((error) => {
              return error;
            })
          ).toEqual(fail);

          expect(
            onSuccess((data) => {
              return data;
            })
          ).toEqual(undefined);

          expect(
            onPending(() => {
              return 'Pending';
            })
          ).toEqual(undefined);
        });
      });

      describe('Pending', () => {
        beforeEach(async () => {
          hook = await hookCall({
            isRequesting: false
          });
        });

        it('Should return true on isPending', () => {
          const { isPending } = hook.result.current;

          expect(isPending()).toEqual(true);
        });

        it('Should return in onPending', async () => {
          const { onPending } = hook.result.current;

          expect(onPending(() => 'pending')).toEqual('pending');
        });
      });
    });
  });

  describe('Triggering a request', () => {
    it('Should send another request when triggerRequest is called', async () => {
      hook = await afterMount();

      const { waitForNextUpdate } = hook;
      const { triggerRequest } = hook.result.current;

      act(() => triggerRequest());

      await waitForNextUpdate();

      expect(fetch).toHaveBeenCalledTimes(2);
    });

    it('Should not send another request when !isRequesting', async () => {
      hook = await afterMount();

      const { rerender } = hook;

      rerender({ isRequesting: false });

      expect(fetch).toHaveBeenCalledTimes(1);
    });

    it('Should not request when unmounted', async () => {
      hook = await afterMount({ dependencies: [1] });

      const { unmount, rerender } = hook;

      unmount();

      rerender({ dependencies: [2] });

      expect(fetch).toHaveBeenCalledTimes(1);
    });

    it('Should request when dependencies change', async () => {
      hook = await afterMount({ dependencies: [1] });

      const { rerender, waitForNextUpdate } = hook;

      rerender({ dependencies: [2] });

      await waitForNextUpdate();

      expect(fetch).toHaveBeenCalledTimes(2);
    });

    it('Should request when !isDefaultLoading', async () => {
      hook = await afterMount({
        isDefaultLoading: false
      });

      const { isPending } = hook.result.current;

      expect(isPending()).toEqual(false);
    });
  });
});
