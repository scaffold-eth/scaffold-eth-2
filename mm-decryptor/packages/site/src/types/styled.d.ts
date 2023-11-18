/* eslint-disable import/no-unassigned-import */

import 'styled-components';

/**
 * styled-component default theme extension
 */
declare module 'styled-components' {
  /* eslint-disable @typescript-eslint/consistent-type-definitions */
  export interface DefaultTheme {
    fonts: Record<string, string>;
    fontSizes: Record<string, string>;
    breakpoints: string[];
    mediaQueries: Record<string, string>;
    radii: Record<string, string>;
    shadows: Record<string, string>;
    colors: Record<string, Record<string, string>>;
  }
}
