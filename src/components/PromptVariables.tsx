import { useEffect, useState } from 'react';

import { extractVariables } from '@/lib/prompts';

import { Badge } from './ui/badge';

export function PromptVariables({ prompt }: { prompt?: string }) {
  const [variables, setVariables] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (prompt) {
      setVariables(new Set(extractVariables(prompt)));
    }
  }, [prompt]);

  return variables.size > 0 ? (
    <div className="col-span-3 col-start-2 flex flex-wrap items-center gap-1">
      <span className="text-xs text-muted-foreground">Variables:</span>
      {Array.from(variables)
        .sort()
        .map((v) => (
          <Badge key={v} className="text-xs font-normal" variant="outline">
            {v}
          </Badge>
        ))}
    </div>
  ) : null;
}
