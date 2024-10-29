import type {
  HorizontalLayout,
  JsonSchema,
  JsonSchema7,
  VerticalLayout,
} from '@jsonforms/core';

import type { PromptVariable } from '../types';

export function buildVariablesSchema(variables: PromptVariable[]): JsonSchema {
  const properties: {
    [property: string]: JsonSchema7;
  } = {};
  variables.forEach((v) => {
    properties[v.label] = { type: 'string' };
  });
  return {
    type: 'object',
    properties,
  };
}

export function buildVariablesUiSchema(
  variables: PromptVariable[],
  horizontal: boolean = false
): VerticalLayout | HorizontalLayout {
  return {
    type: horizontal ? 'HorizontalLayout' : 'VerticalLayout',
    elements: variables.map((v) => ({
      type: 'Control',
      scope: `#/properties/${v.label}`,
    })),
  };
}
