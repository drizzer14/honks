import {
  act,
  renderHook,
  RenderHookResult
} from '@testing-library/react-hooks';

import useAsync from './use-async';

describe('useAsync', () => {
  let sut: RenderHookResult<Promise<unknown>, ReturnType<typeof useAsync>>;

  it('Should not be pending by default', () => {
    sut = renderHook(() => useAsync(jest.fn().mockResolvedValue({})));

    expect(sut.result.current.isPending()).toBe(false);
  });

  it('Should send request when call is called', async () => {
    const request = jest.fn().mockResolvedValue({});
    sut = renderHook(() => useAsync(request));

    const { call } = sut.result.current;
    const { waitForNextUpdate } = sut;

    await act(async () => {
      call();

      await waitForNextUpdate();
    });

    expect(request).toHaveBeenCalled();
  });

  it('Should not make a request when unmounted', () => {
    const request = jest.fn().mockResolvedValue({});
    sut = renderHook(() => useAsync(request));

    sut.unmount();
    sut.result.current.call();

    expect(request).not.toHaveBeenCalled();
  });

  describe('Making a request', () => {
    let dataSourceDeffered: {
      promise: Promise<unknown>;
      resolve: (data: any) => void;
      reject: (error: any) => void;
    };

    beforeEach(() => {
      dataSourceDeffered = (() => {
        let resolve: any;
        let reject: any;

        const promise = new Promise((_resolve, _reject) => {
          resolve = _resolve;
          reject = _reject;
        });

        return {
          promise,
          resolve,
          reject
        };
      })();

      sut = renderHook(() => useAsync(() => dataSourceDeffered.promise));
    });

    describe('When data source has been resolved', () => {
      const data = {
        name: 'Darth Vader'
      };

      beforeEach(async () => {
        await act(async () => {
          dataSourceDeffered.resolve(data);

          sut.result.current.call();

          await sut.waitForNextUpdate();
        });
      });

      it('Should successfully return result', () => {
        const { result } = sut.result.current;

        expect(result).toStrictEqual({ data });
      });

      it('Should call onResolve with result.data', () => {
        const { onResolve } = sut.result.current;
        const successResult = {};

        const callback = jest.fn().mockReturnValue(successResult);

        expect(onResolve(callback)).toBe(successResult);
        expect(callback).toHaveBeenCalledWith(data);
      });

      it('Should not call onReject', () => {
        const { onReject } = sut.result.current;

        const callback = jest.fn();

        expect(onReject(callback)).toBeUndefined();
        expect(callback).not.toHaveBeenCalled();
      });

      it('Should not call onPending', () => {
        const { onPending } = sut.result.current;

        const callback = jest.fn();

        expect(onPending(callback)).toBeUndefined();
        expect(callback).not.toHaveBeenCalled();
      });
    });

    describe('When data source has been rejected', () => {
      const error = {
        statusCode: 404,
        message: 'Not found'
      };

      beforeEach(async () => {
        await act(async () => {
          dataSourceDeffered.reject(error);

          await sut.result.current.call();
        });
      });

      it('Should successfully return result', () => {
        const { result } = sut.result.current;

        expect(result).toStrictEqual({ error });
      });

      it('Should call onReject with result.error', () => {
        const { onReject } = sut.result.current;

        const failResult = {};
        const callback = jest.fn().mockReturnValue(failResult);

        expect(onReject(callback)).toBe(failResult);
        expect(callback).toHaveBeenCalledWith(error);
      });

      it('Should not call onResolve', () => {
        const { onResolve } = sut.result.current;

        const callback = jest.fn();

        expect(onResolve(callback)).toBeUndefined();
        expect(callback).not.toHaveBeenCalled();
      });

      it('Should not call onPending', () => {
        const { onPending } = sut.result.current;

        const callback = jest.fn();

        expect(onPending(callback)).toBeUndefined();
        expect(callback).not.toHaveBeenCalled();
      });
    });
  });
});
