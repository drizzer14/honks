import { readdirSync } from 'fs';
import { resolve } from 'path';

import * as Index from 'index';

describe('index', () => {
  it('Should contain exports', () => {
    expect(Index).toBeDefined();
    expect(Index).toStrictEqual(expect.any(Object));
  });

  it('Should export all hooks', () => {
    const hooksCount = readdirSync(resolve(__dirname, '../src')).length - 1;

    expect(Object.values(Index).length).toEqual(hooksCount);
  });
});
