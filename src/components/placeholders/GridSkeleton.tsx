import { Skeleton } from '../ui/skeleton';

export function GridSkeleton() {
  console.log('GridSkeleton render');
  return (
    <div className="grid size-full grid-cols-3 gap-[26px]">
      <Skeleton className="h-52" />
    </div>
  );
}
