import type { ControlProps } from '@jsonforms/core';
import { rankWith, schemaTypeIs } from '@jsonforms/core';
import { withJsonFormsControlProps } from '@jsonforms/react';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export const StringControl = withJsonFormsControlProps(
  (props: ControlProps) => {
    const { label, id } = props;
    return (
      <div>
        <Label htmlFor={id}>{label}</Label>
        <Input id={id} />
      </div>
    );
  }
);

export const StringTester = rankWith(3, schemaTypeIs('string'));
