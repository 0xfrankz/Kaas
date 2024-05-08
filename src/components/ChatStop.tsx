import { emit } from '@tauri-apps/api/event';
import { Square } from 'lucide-react';

import { Button } from './ui/button';

export function ChatStop() {
  const onClick = async () => {
    await emit('stop-bot');
  };
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
