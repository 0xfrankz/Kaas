import { SlideUpTransition } from '@/components/animation/SlideUpTransition';
import { TitleBar } from '@/components/TitleBar';
import TwoRows from '@/layouts/TwoRows';

export default function DebugPage() {
  return (
    <SlideUpTransition motionKey="debug">
      <TwoRows className="max-h-screen">
        <TwoRows.Top>
          <TitleBar title="Debug" />
        </TwoRows.Top>
        <TwoRows.Bottom className="flex overflow-hidden" />
      </TwoRows>
    </SlideUpTransition>
  );
}
