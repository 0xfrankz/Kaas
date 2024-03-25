import { useScrollToBottom } from '@/lib/hooks';

export function ScrollBottom({
  scrollContainerRef,
}: {
  scrollContainerRef: React.RefObject<HTMLDivElement>;
}) {
  const { scrollToBottom, Anchor } = useScrollToBottom(scrollContainerRef);
  return <Anchor />;
}
