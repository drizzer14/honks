import {
  act,
  renderHook,
  RenderHookResult
} from '@testing-library/react-hooks';

import useRequest from './index';

describe('useRequest', () => {
  let sut: RenderHookResult<Promise<unknown>, ReturnType<typeof useRequest>>;

  it('Should not be pending by default', () => {
    sut = renderHook(() => useRequest(jest.fn().mockResolvedValue({})));

    expect(sut.result.current.isPending()).toBe(false);
  });

  it('Should send request when sendRequest is called', async () => {
    const request = jest.fn().mockResolvedValue({});
    sut = renderHook(() => useRequest(request));

    const { sendRequest } = sut.result.current;

    await act(() => sendRequest());

    expect(request).toHaveBeenCalled();
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

      sut = renderHook(() => useRequest(() => dataSourceDeffered.promise));
    });

    describe('When data source has been resolved', () => {
      const data = {
        name: 'Darth Vader'
      };

      beforeEach(async () => {
        await act(async () => {
          dataSourceDeffered.resolve(data);

          await sut.result.current.sendRequest();
        });
      });

      it('Should successfully return result', () => {
        const { result } = sut.result.current;

        expect(result).toStrictEqual({ data });
      });

      it('Should call onSuccess with result.data', () => {
        const { onSuccess } = sut.result.current;
        const successResult = {};

        const callback = jest.fn().mockReturnValue(successResult);

        expect(onSuccess(callback)).toBe(successResult);
        expect(callback).toHaveBeenCalledWith(data);
      });

      it('Should not call onFail', () => {
        const { onFail } = sut.result.current;

        const callback = jest.fn();

        expect(onFail(callback)).toBeUndefined();
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

          await sut.result.current.sendRequest();
        });
      });

      it('Should successfully return result', () => {
        const { result } = sut.result.current;

        expect(result).toStrictEqual({ error });
      });

      it('Should call onFail with result.error', () => {
        const { onFail } = sut.result.current;

        const failResult = {};
        const callback = jest.fn().mockReturnValue(failResult);

        expect(onFail(callback)).toBe(failResult);
        expect(callback).toHaveBeenCalledWith(error);
      });

      it('Should not call onSuccess', () => {
        const { onSuccess } = sut.result.current;

        const callback = jest.fn();

        expect(onSuccess(callback)).toBeUndefined();
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
