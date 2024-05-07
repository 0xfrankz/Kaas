import { useFilledPromptContext } from '@/lib/hooks';
import { interpolate } from '@/lib/prompts';

export function PromptPreviewer() {
  const { prompt } = useFilledPromptContext();
  const promptCtx = Object.fromEntries(
    prompt.variables?.map((v) => [v.label, v.value]) ?? []
  );
  const promptStr = interpolate(prompt.prompt, promptCtx);
  return (
    <div className="whitespace-pre-wrap p-4 text-muted-foreground">
      {promptStr}
    </div>
  );
}
