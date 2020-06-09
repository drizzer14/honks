import { renderHook, RenderHookResult } from '@testing-library/react-hooks';

import useMount from './use-mount';

describe('useMount', () => {
  let sut: RenderHookResult<never, ReturnType<typeof useMount>>;

  beforeEach(() => {
    sut = renderHook(() => useMount());
  });

  it('Should return true when mounted', () => {
    expect(sut.result.current()).toBe(true);
  });

  it('Should return false when unmounted', () => {
    sut.unmount();

    expect(sut.result.current()).toBe(false);
  });
});
