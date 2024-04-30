export function extractVariables(promptLiteral: string): string[] {
  // alpha-numbericals plus underscore, max 20 chars
  const regex = /{([a-zA-Z0-9_]{0,20})}/g;
  const matches = promptLiteral.match(regex);
  if (!matches) return [];
  return matches.map((match) => match.replace(/[{}]/g, ''));
}

export function interpolate(
  promptLiteral: string,
  context: Record<string, string>
): string {
  const variables = extractVariables(promptLiteral);
  const rawFragments = promptLiteral.split(/{[a-zA-Z0-9_]{0,20}}/);
  const values = variables.map((variable) => context[variable]);
  return String.raw({ raw: rawFragments }, ...values);
}
