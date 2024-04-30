import { extractVariables, interpolate } from '../prompts';

test('extract variable from prompt literal', () => {
  const promptLiteral =
    'There are 3 valid variables {variable1}, {variable_2}, {variable_3} and {variable1} again and {this-is-invalid} and {this_is_too_long_to_be_valid} in this prompt';
  const result = ['variable1', 'variable_2', 'variable_3', 'variable1'];
  expect(extractVariables(promptLiteral)).toEqual(result);
});

test('interpolate prompt template with context', () => {
  const promptLiteral = `There are 3 valid variables 
{variable1}, 
{variable_2}, 
{variable_3} 
and {variable1} 
again and {this-is-invalid} and {this_is_too_long_to_be_valid} in this prompt`;
  const context = {
    variable1: 'value1',
    variable_2: 'value2',
    variable_3: 'value3',
  };
  const result =
    'There are 3 valid variables \nvalue1, \nvalue2, \nvalue3 \nand value1 \nagain and {this-is-invalid} and {this_is_too_long_to_be_valid} in this prompt';
  expect(interpolate(promptLiteral, context)).toBe(result);
});
