import type { BaseText, Descendant } from 'slate';
import { Editor as SlateEditor, Range, Transforms } from 'slate';
import type * as SlateReact from 'slate-react';

import type {
  ParagraphElement,
  PromptEditor as Editor,
  VarElement,
} from '@/lib/types';
import { hasAttribute } from '@/lib/types';

export const withInlines = (editor: Editor) => {
  const { isInline } = editor;

  editor.isInline = (element) => element.type === 'var' || isInline(element);

  return editor;
};

export const PromptEditorCommands = {
  isVariableActive: (editor: Editor) => {
    const [match] = Array.from(
      SlateEditor.nodes(editor, {
        match: (n) => hasAttribute(n, 'type') && n.type === 'var',
      })
    );
    return !!match;
  },
  isVariableEmpty: (editor: Editor) => {
    if (!PromptEditorCommands.isVariableActive(editor) || !editor.selection) {
      return false;
    }
    const [variableTextNode] = SlateEditor.leaf(
      editor,
      editor.selection.anchor
    );
    return !variableTextNode.text.length;
  },
  unwrapVariable: (editor: Editor) => {
    if (!PromptEditorCommands.isVariableActive(editor) || !editor.selection) {
      return;
    }
    Transforms.unwrapNodes(editor, {
      match: (n) => hasAttribute(n, 'type') && n.type === 'var',
    });
  },
  wrapVariable: (editor: Editor) => {
    const { selection } = editor;
    const isCollapsed = selection && Range.isCollapsed(selection);
    const variable: VarElement = {
      type: 'var',
      children: isCollapsed ? [{ text: '' }] : [],
    };

    if (isCollapsed) {
      Transforms.insertNodes(editor, variable);
    } else {
      Transforms.wrapNodes(editor, variable, { split: true });
      Transforms.collapse(editor, { edge: 'end' });
    }
  },
  startVariable: (editor: Editor) => {
    if (PromptEditorCommands.isVariableActive(editor) || !editor.selection) {
      return;
    }

    PromptEditorCommands.wrapVariable(editor);
  },
  endVariable: (editor: Editor) => {
    if (!PromptEditorCommands.isVariableActive(editor) || !editor.selection) {
      return;
    }

    // Get the current variable node entry
    const [match] = Array.from(
      SlateEditor.nodes(editor, {
        match: (n) => hasAttribute(n, 'type') && n.type === 'var',
      })
    );
    const varElPath = match[1];

    // Move to the next text node
    const nextTextPoint = SlateEditor.after(editor, varElPath);
    if (nextTextPoint) {
      const path = nextTextPoint;
      Transforms.select(editor, path);
      Transforms.collapse(editor, { edge: 'start' });
    }
  },
};

// Put this at the start and end of an inline component to work around this Chromium bug:
// https://bugs.chromium.org/p/chromium/issues/detail?id=1249405
export const InlineChromiumBugfix = () => (
  <span contentEditable={false} style={{ fontSize: 0 }}>
    {String.fromCodePoint(160) /* Non-breaking space */}
  </span>
);

export const elementsRenderer = (props: SlateReact.RenderElementProps) => {
  const { attributes, children, element } = props;
  switch (element.type) {
    case 'var':
      return (
        <span
          {...attributes}
          className="rounded-md bg-accent px-1 text-accent-foreground"
        >
          <InlineChromiumBugfix />
          {children}
          <InlineChromiumBugfix />
        </span>
      );
    default:
      return <p {...attributes}>{children}</p>;
  }
};

const isText = (v: Descendant): v is BaseText => hasAttribute(v, 'text');
const isVar = (v: Descendant): v is VarElement =>
  hasAttribute(v, 'type') && v.type === 'var';
const isParagraph = (v: Descendant): v is ParagraphElement =>
  hasAttribute(v, 'type') && v.type === 'paragraph';

const serializeNode = (v: Descendant): string => {
  if (isText(v)) {
    return v.text;
  }
  if (isVar(v)) {
    return `{${v.children.map(serializeNode).join('')}}`;
  }
  if (isParagraph(v)) {
    return `${v.children.map(serializeNode).join('')}\n`;
  }
  return '';
};

export function serialize(slateValue?: Descendant[]): string {
  if (!slateValue) {
    return '';
  }
  const serialized = slateValue.map(serializeNode).join('');
  return serialized;
}
