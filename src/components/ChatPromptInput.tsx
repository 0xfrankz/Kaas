import { PaperPlaneIcon } from '@radix-ui/react-icons';

import { Button } from './ui/button';
import { Textarea } from './ui/textarea';

const HEIGHT_LIMIT = 20 * 20;

export function ChatPromptInput() {
  // const [showScrollbar, setShowScrollbar] = useState(false);
  // const [lines, setLines] = useState(1);
  // const ref = useRef<HTMLTextAreaElement>(null);

  // useEffect(() => {
  //   if (ref.current) {
  //     const taScrollHeight = ref.current.scrollHeight;
  //     console.log(`taScrollHeight = ${taScrollHeight}`);
  //     const currentLines = Math.ceil(taScrollHeight / LINE_HEIGHT);
  //     if (currentLines !== lines) {
  //       setLines(currentLines);
  //     }
  //   }
  // }, [prompt]);

  const onChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const ta = e.target as HTMLTextAreaElement;
    // set overflowY to hidden and height to fit-content
    // so we can get a correct scrollHeight
    ta.style.overflowY = 'hidden';
    ta.style.height = 'fit-content';
    const { scrollHeight } = ta;
    if (scrollHeight > HEIGHT_LIMIT) {
      // Enable scroll when height limitation is reached
      ta.style.overflowY = 'scroll';
      ta.style.height = `${HEIGHT_LIMIT}px`;
    } else {
      // set overflowY back to hidden when height limitation is not reached
      ta.style.overflowY = 'hidden';
      // Set height to scrollHeight
      ta.style.height = `${scrollHeight}px`;
    }
  };

  return (
    <div className="mb-4 flex min-h-16 w-auto items-end border-b-2 border-slate-500 text-sm">
      <div className="mb-5 grow">
        <Textarea
          placeholder="How can I help?"
          className="resize-none overflow-y-scroll border-0 px-2"
          rows={1}
          onChange={onChange}
        />
      </div>
      <Button className="mb-5">
        <PaperPlaneIcon />
      </Button>
    </div>
  );
}
