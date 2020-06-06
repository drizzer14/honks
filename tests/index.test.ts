import { readdirSync } from 'fs';
import { resolve } from 'path';

import * as Index from '../src/index';

describe('index', () => {
  it('Should contain exports', () => {
    expect(Index).toBeDefined();
    expect(Index).toStrictEqual(expect.any(Object));
  });

  it('Should export all hooks', () => {
    const hooksCount = readdirSync(
      resolve(__dirname, '../src')
    ).filter((hook: string) => /^use-/.test(hook)).length;

    expect(Object.values(Index).length).toEqual(hooksCount);
  });
});
