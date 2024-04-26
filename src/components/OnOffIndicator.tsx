import { cn } from '@/lib/utils';

export function OnOffIndicator({ on }: { on: boolean }) {
  return (
    <span
      className={cn(
        'ml-2 size-2 rounded-full bg-gradient-to-br',
        on
          ? 'from-green-400 to-green-500 drop-shadow-md'
          : 'from-gray-300 to-gray-400'
      )}
    />
  );
}
