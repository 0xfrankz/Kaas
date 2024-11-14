import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { extractVariables } from '@/lib/prompts';

import { InputWithMenu } from './InputWithMenu';
import { Label } from './ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';

export function PromptVariables({ prompt }: { prompt?: string }) {
  const [variables, setVariables] = useState<Set<string>>(new Set());
  const { t } = useTranslation('page-prompts');

  useEffect(() => {
    if (prompt) {
      setVariables(new Set(extractVariables(prompt)));
    }
  }, [prompt]);

  return variables.size > 0 ? (
    <div className="grid w-full grid-cols-5 items-center gap-1">
      <span className="col-span-5 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
        {t('page-prompts:section:variables')}:
      </span>
      {Array.from(variables)
        .sort()
        .map((v) => (
          <>
            <Label className="text-right text-sm font-normal">{v}</Label>
            <Select defaultValue="string">
              <SelectTrigger>
                <SelectValue placeholder="Select a type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="string">string</SelectItem>
                <SelectItem value="number">number</SelectItem>
              </SelectContent>
            </Select>
            <InputWithMenu className="col-span-3" />
          </>
        ))}
    </div>
  ) : null;
}
