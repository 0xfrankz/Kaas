import { StopIcon } from '@radix-ui/react-icons';
import { emit } from '@tauri-apps/api/event';

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
      <StopIcon className="size-4" />
    </Button>
  );
}
