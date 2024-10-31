import type { ChangeEventHandler } from 'react';
import { useCallback, useMemo } from 'react';
import type { Descendant } from 'slate';
import { createEditor, Editor as SlateEditor, Range, Transforms } from 'slate';
import { withHistory } from 'slate-history';
import { withReact } from 'slate-react';
import * as SlateReact from 'slate-react';

import { badgeVariants } from '@/components/ui/badge';
import type { BadgeElement, PromptEditor as Editor } from '@/lib/types';
import { hasAttribute } from '@/lib/types';

const withInlines = (editor: Editor) => {
  const { isInline } = editor;

  editor.isInline = (element) => element.type === 'badge' || isInline(element);

  return editor;
};

const PromptEditorCommands = {
  isBadgeActive: (editor: Editor) => {
    const [match] = Array.from(
      SlateEditor.nodes(editor, {
        match: (n) => hasAttribute(n, 'type') && n.type === 'badge',
      })
    );
    return !!match;
  },
  wrapBadge: (editor: Editor) => {
    console.log('wrapBadge');
    const { selection } = editor;
    const isCollapsed = selection && Range.isCollapsed(selection);
    const badge: BadgeElement = {
      type: 'badge',
      children: isCollapsed ? [{ text: '' }] : [],
    };

    if (isCollapsed) {
      Transforms.insertNodes(editor, badge);
    } else {
      Transforms.wrapNodes(editor, badge, { split: true });
      Transforms.collapse(editor, { edge: 'end' });
    }
  },
  startBadge: (editor: Editor) => {
    if (editor.selection) {
      PromptEditorCommands.wrapBadge(editor);
    }
  },
  endBadge: (editor: Editor) => {
    // Move to the end of current node
    // Transforms.move(editor, { edge: 'end' });
    // Move forward by one unit to get to next node
    // Transforms.move(editor, { unit: 'offset' });
    if (editor.selection) {
      console.log(
        SlateEditor.next(editor),
        SlateEditor.after(editor, editor.selection?.anchor)
      );
    }
  },
};

// Put this at the start and end of an inline component to work around this Chromium bug:
// https://bugs.chromium.org/p/chromium/issues/detail?id=1249405
const InlineChromiumBugfix = () => (
  <span contentEditable={false} style={{ fontSize: 0 }}>
    {String.fromCodePoint(160) /* Non-breaking space */}
  </span>
);

const elementsRenderer = (props: SlateReact.RenderElementProps) => {
  const { attributes, children, element } = props;
  switch (element.type) {
    case 'badge':
      return (
        <span {...attributes} className={badgeVariants({ variant: 'default' })}>
          <InlineChromiumBugfix />
          {children}
          <InlineChromiumBugfix />
        </span>
      );
    default:
      return <p {...attributes}>{children}</p>;
  }
};

const initialValue: Descendant[] = [
  {
    type: 'paragraph',
    children: [
      {
        text: 'In addition to block nodes, you can create inline nodes. Here is a ',
      },
      {
        type: 'badge',
        children: [{ text: 'Approved' }],
      },
      {
        text: ' prompt.',
      },
    ],
  },
];

type PromptEditorProps = {
  onChange: ChangeEventHandler<HTMLDivElement>;
};

export function PromptEditor() {
  const editor = useMemo(
    () => withInlines(withHistory(withReact(createEditor()))),
    []
  );
  const onKeyDown = useCallback(
    (ev: React.KeyboardEvent<HTMLDivElement>) => {
      if (ev.key === '{') {
        ev.preventDefault();
        PromptEditorCommands.startBadge(editor);
      } else if (ev.key === '}') {
        ev.preventDefault();
        PromptEditorCommands.endBadge(editor);
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
      initialValue={initialValue}
      onChange={(v) => console.log(v)}
    >
      <SlateReact.Editable
        onKeyDown={onKeyDown}
        renderElement={elementsRenderer}
      />
    </SlateReact.Slate>
  );
}
