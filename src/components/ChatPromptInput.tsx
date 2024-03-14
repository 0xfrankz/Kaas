import { PaperPlaneIcon } from '@radix-ui/react-icons';

import { Button } from './ui/button';
import { Textarea } from './ui/textarea';

const HEIGHT_LIMIT = 20 * 20;

export function ChatPromptInput() {
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
    ta.style.height = 'inherit';
    // ta.style.overflowY = 'hidden'; // set overflowY hidden to get scrollHeight without scrollBar
    const { scrollHeight } = ta;
    console.log(`scrollHeight = ${scrollHeight}`);
    if (scrollHeight > HEIGHT_LIMIT) {
      // Enable scroll when height limitation is reached
      ta.style.height = `${HEIGHT_LIMIT}px`;
      ta.style.overflowY = 'scroll';
    } else {
      // Set height to scrollHeight
      ta.style.height = `${scrollHeight}px`;
    }
  };

  return (
    <div className="mb-4 flex min-h-16 w-auto items-center border-b-2 border-slate-500 text-sm">
      <div className="grow">
        <Textarea
          // ref={ref}
          placeholder="How can I help?"
          className="resize-none overflow-y-hidden border-0 px-0"
          rows={1}
          onChange={onChange}
          // style={{ height: `${lines * 20}px` }}
          // value={prompt}
          // onChange={(e) => setPrompt(e.target.value)}
        />
      </div>
      <Button>
        <PaperPlaneIcon />
      </Button>
    </div>
  );
}
