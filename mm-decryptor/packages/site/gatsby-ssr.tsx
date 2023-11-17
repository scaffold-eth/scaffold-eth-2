import type { GatsbySSR } from 'gatsby';
import { StrictMode } from 'react';

import { App } from './src/App';
import { Root } from './src/Root';

export const wrapRootElement: GatsbySSR['wrapRootElement'] = ({ element }) => (
  <StrictMode>
    <Root>{element}</Root>
  </StrictMode>
);

export const wrapPageElement: GatsbySSR['wrapPageElement'] = ({ element }) => (
  <App>{element}</App>
);
