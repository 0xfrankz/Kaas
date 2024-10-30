import { useMemo } from 'react';
import { createEditor } from 'slate';
import { withHistory } from 'slate-history';
import { withReact } from 'slate-react';

import type { PromptEditor as Editor } from '@/lib/types';

const withInlines = (editor: Editor) => {
  const { isInline, isElementReadOnly, isSelectable } = editor;

  editor.isInline = (element) =>
    ['badge'].includes(element.type) || isInline(element);

  editor.isElementReadOnly = (element) =>
    element.type === 'badge' || isElementReadOnly(element);

  editor.isSelectable = (element) =>
    element.type !== 'badge' && isSelectable(element);

  return editor;
};

export function PromptEditor() {
  const editor = useMemo(
    () => withInlines(withHistory(withReact(createEditor()))),
    []
  );
  return <div>PromptEditor</div>;
}
