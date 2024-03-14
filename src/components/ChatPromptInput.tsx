import { PaperPlaneIcon } from '@radix-ui/react-icons';

import { Button } from './ui/button';
import { Textarea } from './ui/textarea';

const LINE_HEIGHT = 20;

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
    console.log(`scrollHeight = ${ta.scrollHeight}`);
    ta.style.height = 'inherit';
    ta.style.height = `${ta.scrollHeight}px`;
    // In case you have a limitation
    // e.target.style.height = `${Math.min(e.target.scrollHeight, limit)}px`;
  };

  return (
    <div className="mb-4 flex min-h-16 w-auto items-center border-b-2 border-slate-500 text-sm">
      <div className="grow">
        <Textarea
          // ref={ref}
          placeholder="How can I help?"
          className="resize-none border-0 px-0"
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
