import { readText, writeText } from '@tauri-apps/api/clipboard';
import { ClipboardPaste, Copy, Scissors } from 'lucide-react';
import React, {
  forwardRef,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuShortcut,
  ContextMenuTrigger,
} from './ui/context-menu';

export function withTextMenu<T extends HTMLInputElement | HTMLTextAreaElement>(
  InputComponent: React.ComponentType<
    React.InputHTMLAttributes<T> & React.RefAttributes<T>
  >
) {
  return forwardRef<T, React.ComponentPropsWithoutRef<typeof InputComponent>>(
    (props, ref) => {
      const icRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);
      const [textSelected, setTextSelected] = useState(false);

      const getSelection = () => {
        if (icRef.current) {
          const start = icRef.current.selectionStart;
          const end = icRef.current.selectionEnd;
          if (start !== null && end !== null && start !== end) {
            return icRef.current.value.substring(start, end);
          }
        }
        return '';
      };

      const copy = useCallback(async () => {
        const selectedText = getSelection();
        if (selectedText) {
          await writeText(selectedText);
        }
      }, []);

      const cut = useCallback(async () => {
        const selectedText = getSelection();
        if (selectedText && icRef.current) {
          await writeText(selectedText);
          const start = icRef.current.selectionStart;
          const end = icRef.current.selectionEnd;
          if (start !== null && end !== null) {
            const currentValue = icRef.current.value;
            const newValue =
              currentValue.substring(0, start) + currentValue.substring(end);
            icRef.current.value = newValue;
            icRef.current.setSelectionRange(start, start);
            // Trigger any necessary events or state updates
            const event = new Event('input', { bubbles: true });
            icRef.current.dispatchEvent(event);
          }
        }
      }, []);

      const paste = useCallback(async () => {
        if (icRef.current) {
          const clipboardText = await readText();
          const textLength = clipboardText ? clipboardText.length : 0;
          const start = icRef.current.selectionStart;
          const end = icRef.current.selectionEnd;
          if (start !== null && end !== null) {
            const currentValue = icRef.current.value;
            const newValue =
              currentValue.substring(0, start) +
              clipboardText +
              currentValue.substring(end);
            icRef.current.value = newValue;
            icRef.current.setSelectionRange(
              start + textLength,
              start + textLength
            );
            // Trigger any necessary events or state updates
            const event = new Event('input', { bubbles: true });
            icRef.current.dispatchEvent(event);
          }
        }
      }, []);

      useEffect(() => {
        if (icRef.current) {
          icRef.current.onselectionchange = () => {
            setTextSelected(getSelection().length !== 0);
          };
        }
      }, []);

      return (
        <ContextMenu>
          <ContextMenuTrigger asChild>
            <InputComponent
              {...props}
              ref={(el) => {
                if (ref) {
                  if (typeof ref === 'function') {
                    ref(el);
                  } else {
                    ref.current = el;
                  }
                }
                icRef.current = el;
              }}
            />
          </ContextMenuTrigger>
          <ContextMenuContent>
            <ContextMenuItem
              className="gap-2"
              disabled={!textSelected}
              onClick={copy}
            >
              <ClipboardPaste className="size-[14px]" /> Copy
              <ContextMenuShortcut>⌘[</ContextMenuShortcut>
            </ContextMenuItem>
            <ContextMenuItem className="gap-2" onClick={paste}>
              <Copy className="size-[14px]" /> Paste
              <ContextMenuShortcut>⌘[</ContextMenuShortcut>
            </ContextMenuItem>
            <ContextMenuItem className="gap-2" onClick={cut}>
              <Scissors className="size-[14px]" /> Cut
              <ContextMenuShortcut>⌘[</ContextMenuShortcut>
            </ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
      );
    }
  );
}
