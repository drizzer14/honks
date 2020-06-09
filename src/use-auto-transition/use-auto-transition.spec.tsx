import React, { FC, useState } from 'react';
import {
  render,
  cleanup,
  screen,
  fireEvent,
  waitFor,
  act
} from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import useAutoTransition from './use-auto-transition';

jest.useFakeTimers();

describe('useAutoTransition', () => {
  const property = 'height';
  const childrenValue = 54;
  const transitionSpeed = 228;

  const Dropdown: FC<{ getValue: () => number }> = ({ getValue }) => {
    const [isOpen, setOpen] = useState(false);

    const [ref, autoProperty] = useAutoTransition<HTMLDivElement>(getValue, [
      isOpen,
      transitionSpeed
    ]);

    return (
      <div>
        <button data-testid="dropdown-toggler" onClick={() => setOpen(!isOpen)}>
          <p>Dropdown</p>
        </button>

        <div
          data-testid="dropdown-children"
          style={{ [property]: autoProperty }}
        >
          <div ref={ref} style={{ [property]: childrenValue }}>
            <p>Children</p>
          </div>
        </div>
      </div>
    );
  };

  let children: HTMLElement;
  let toggler: HTMLElement;

  describe('Toggling the Dropdown', () => {
    beforeEach(() => {
      render(<Dropdown getValue={() => childrenValue} />);

      children = screen.getByTestId('dropdown-children');
      toggler = screen.getByTestId('dropdown-toggler');
    });

    afterEach(() => {
      cleanup();
    });

    it('Should return value 0 by default', () => {
      expect(children).toHaveStyle(`${property}: 0px`);
    });

    describe('Toggle state', () => {
      beforeEach(() => {
        fireEvent.click(toggler);
      });

      afterEach(() => {
        act(() => {
          jest.clearAllTimers();
        });
      });

      describe('Entering', () => {
        describe('Enter', () => {
          it('Should assign new numeric value', async () => {
            await waitFor(() => {
              expect(children).toHaveStyle(`${property}: ${childrenValue}px`);
            });
          });
        });

        describe('Entered', () => {
          it('Should assign value `auto` in the end', async () => {
            act(() => {
              jest.advanceTimersByTime(transitionSpeed);
            });

            await waitFor(() => {
              expect(children).toHaveStyle(`${property}: auto`);
            });
          });
        });
      });

      describe('Exiting', () => {
        beforeEach(() => {
          fireEvent.click(toggler);
        });

        describe('Exit', () => {
          it('Should assign preserved numeric value', async () => {
            await waitFor(() => {
              expect(children).toHaveStyle(`${property}: ${childrenValue}px`);
            });
          });
        });

        describe('Exited', () => {
          it('Should assign value 0 in the end', async () => {
            act(() => {
              jest.advanceTimersByTime(childrenValue / 4);
            });

            await waitFor(() => {
              expect(children).toHaveStyle(`${property}: 0`);
            });
          });
        });
      });
    });
  });

  describe('Getting a value from a ref', () => {
    beforeEach(() => {
      jest.spyOn(console, 'error');
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      (console.error as jest.Mock).mockImplementation(() => {});
    });

    afterEach(() => {
      (console.error as jest.Mock).mockRestore();
    });

    it('Should throw if incorrect value is returned', () => {
      // @ts-expect-error
      expect(() => render(<Dropdown getValue={() => '54'} />)).toThrow(
        expect.any(TypeError)
      );
    });
  });
});
