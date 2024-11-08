import { useCallback, useMemo } from 'react';
import type { Descendant } from 'slate';
import { createEditor, Range, Transforms } from 'slate';
import { withHistory } from 'slate-history';
import { withReact } from 'slate-react';
import * as SlateReact from 'slate-react';

import {
  elementsRenderer,
  PromptEditorCommands,
  withInlines,
} from '@/lib/editor';

const initialValue: Descendant[] = [
  {
    type: 'paragraph',
    children: [
      {
        text: 'In addition to block nodes, you can create inline nodes. Here is a ',
      },
      {
        type: 'var',
        children: [{ text: 'Approved' }],
      },
      {
        text: ' prompt.',
      },
    ],
  },
];

const emptyValue: Descendant[] = [
  {
    type: 'paragraph',
    children: [
      {
        text: ' ',
      },
    ],
  },
];

type PromptEditorProps = {
  onChange: (data: Descendant[]) => void;
};

export function PromptEditor({ onChange }: PromptEditorProps) {
  const editor = useMemo(
    () => withInlines(withHistory(withReact(createEditor()))),
    []
  );
  const onKeyDown = useCallback(
    (ev: React.KeyboardEvent<HTMLDivElement>) => {
      console.log('key event', ev);
      if (ev.key === '{') {
        ev.preventDefault();
        PromptEditorCommands.startVariable(editor);
      } else if (ev.key === '}') {
        if (PromptEditorCommands.isVariableActive(editor)) {
          ev.preventDefault();
          PromptEditorCommands.endVariable(editor);
        }
      } else if (ev.key === 'Backspace') {
        if (PromptEditorCommands.isVariableEmpty(editor)) {
          ev.preventDefault();
          PromptEditorCommands.unwrapVariable(editor);
        }
      } else {
        const { selection } = editor;
        // Default left/right behavior is unit:'character'.
        // This fails to distinguish between two cursor positions, such as
        // <inline>foo<cursor/></inline> vs <inline>foo</inline><cursor/>.
        // Here we modify the behavior to unit:'offset'.
        // This lets the user step into and out of the inline without stepping over characters.
        // You may wish to customize this further to only use unit:'offset' in specific cases.
        if (selection && Range.isCollapsed(selection)) {
          if (ev.key === 'ArrowLeft') {
            ev.preventDefault();
            Transforms.move(editor, { unit: 'offset', reverse: true });
          } else if (ev.key === 'ArrowRight') {
            ev.preventDefault();
            Transforms.move(editor, { unit: 'offset' });
          }
        }
      }
    },
    [editor]
  );

  return (
    <SlateReact.Slate
      editor={editor}
      initialValue={emptyValue}
      onChange={(v) => onChange(v)}
    >
      <SlateReact.Editable
        onKeyDown={onKeyDown}
        renderElement={elementsRenderer}
        className="size-full border-none focus-visible:outline-none"
      />
    </SlateReact.Slate>
  );
}
