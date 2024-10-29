import { vanillaRenderers } from '@jsonforms/vanilla-renderers';

import { StringControl, StringTester } from './string';

export default [
  ...vanillaRenderers,
  { tester: StringTester, renderer: StringControl },
];
