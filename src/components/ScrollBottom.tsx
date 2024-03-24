import { useScrollToAnchor } from '@/lib/hooks';

import { Button } from './ui/button';

export function ScrollBottom({
  scrollContainerRef,
}: {
  scrollContainerRef: React.RefObject<HTMLDivElement>;
}) {
  const { scrollToAnchor, Anchor } = useScrollToAnchor(scrollContainerRef);
  return (
    <>
      <Anchor className="h-6 bg-red-100" />
      <Button onClick={scrollToAnchor} className="absolute left-10 top-20">
        Scroll to bottom
      </Button>
    </>
  );
}
