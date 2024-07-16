import { Square } from 'lucide-react';

import { Button } from './ui/button';

export function ChatStop({ onClick }: { onClick: () => void }) {
  return (
    <Button
      variant="secondary"
      className="size-9 rounded-full p-0 drop-shadow-lg"
      onClick={onClick}
    >
      <Square className="size-4" />
    </Button>
  );
}
