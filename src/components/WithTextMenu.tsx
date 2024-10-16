import { readText } from '@tauri-apps/plugin-clipboard-manager';
import {
  ClipboardPaste,
  Copy,
  Redo,
  Scissors,
  TextSelect,
  Undo,
} from 'lucide-react';
import React, { forwardRef, useCallback, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { isMacOS } from '@/lib/utils';

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
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
      const { t } = useTranslation('generic');
      const icRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);
      const [commandState, setCommandState] = useState<{
        undo: boolean;
        redo: boolean;
        copy: boolean;
        cut: boolean;
        selectAll: boolean;
      }>({
        undo: false,
        redo: false,
        copy: false,
        cut: false,
        selectAll: false,
      });

      const isCommandEnabled = (cmd: string) => {
        return document.queryCommandEnabled(cmd);
      };

      const runCommand = (cmd: string) => {
        document.execCommand(cmd);
      };

      const onOpenChange = useCallback((open: boolean) => {
        if (open) {
          setCommandState({
            undo: isCommandEnabled('undo'),
            redo: isCommandEnabled('redo'),
            copy: isCommandEnabled('copy'),
            cut: isCommandEnabled('cut'),
            selectAll: isCommandEnabled('selectAll'),
          });
        }
      }, []);

      const paste = useCallback(async () => {
        if (icRef.current) {
          const clipboardText = await readText();
          if (clipboardText) {
            document.execCommand('insertText', false, clipboardText);
          }
        }
      }, []);

      return (
        <ContextMenu onOpenChange={onOpenChange}>
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
          <ContextMenuContent className="w-48">
            <ContextMenuItem
              className="gap-2"
              disabled={!commandState.undo}
              onClick={() => runCommand('undo')}
            >
              <Undo className="size-[14px]" /> {t('action.undo')}
              <ContextMenuShortcut>
                {isMacOS() ? '⌘+Z' : 'Ctrl+Z'}
              </ContextMenuShortcut>
            </ContextMenuItem>
            <ContextMenuItem
              className="gap-2"
              disabled={!commandState.redo}
              onClick={() => runCommand('redo')}
            >
              <Redo className="size-[14px]" /> {t('action.redo')}
              <ContextMenuShortcut>
                {isMacOS() ? '⌘+Y' : 'Ctrl+Y'}
              </ContextMenuShortcut>
            </ContextMenuItem>
            <ContextMenuSeparator />
            <ContextMenuItem
              className="gap-2"
              disabled={!commandState.copy}
              onClick={() => runCommand('copy')}
            >
              <ClipboardPaste className="size-[14px]" /> {t('action.copy')}
              <ContextMenuShortcut>
                {isMacOS() ? '⌘+C' : 'Ctrl+C'}
              </ContextMenuShortcut>
            </ContextMenuItem>
            <ContextMenuItem className="gap-2" onClick={paste}>
              <Copy className="size-[14px]" /> {t('action.paste')}
              <ContextMenuShortcut>
                {isMacOS() ? '⌘+V' : 'Ctrl+V'}
              </ContextMenuShortcut>
            </ContextMenuItem>
            <ContextMenuItem
              className="gap-2"
              disabled={!commandState.cut}
              onClick={() => runCommand('cut')}
            >
              <Scissors className="size-[14px]" /> {t('action.cut')}
              <ContextMenuShortcut>
                {isMacOS() ? '⌘+X' : 'Ctrl+X'}
              </ContextMenuShortcut>
            </ContextMenuItem>
            <ContextMenuItem
              className="gap-2"
              disabled={!commandState.selectAll}
              onClick={() => runCommand('selectAll')}
            >
              <TextSelect className="size-[14px]" /> {t('action.select-all')}
              <ContextMenuShortcut>
                {isMacOS() ? '⌘+A' : 'Ctrl+A'}
              </ContextMenuShortcut>
            </ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
      );
    }
  );
}
