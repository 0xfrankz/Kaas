import { type ClassValue, clsx } from 'clsx';
import { ErrorBoundary } from 'react-error-boundary';
import { twMerge } from 'tailwind-merge';
import { z } from 'zod';

import { Fallback } from '@/components/Fallback';

import { CONTENT_ITEM_TYPE_TEXT, PROVIDER_STYLES } from './constants';
import type {
  AllProviders,
  ContentItemList,
  Message,
  Model,
  ProviderStyles,
} from './types';

export function debounce<T>(
  callback: (args: T) => void,
  wait: number
): (args: T) => void {
  let timeoutId: number;
  return (args) => {
    window.clearTimeout(timeoutId);
    timeoutId = window.setTimeout(() => {
      callback(args);
    }, wait);
  };
}

export function throttle<T>(
  callback: (args: T) => void,
  wait: number
): (args: T) => void {
  let timeoutId: number | null = null;
  return (args) => {
    if (timeoutId !== null) {
      callback(args);
      timeoutId = window.setTimeout(() => {
        timeoutId = null;
      }, wait);
    }
  };
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function parseNumberOrNull(value: unknown): number | null {
  const result = z.coerce.number().safeParse(value);
  if (result.success) {
    return result.data;
  }
  return null;
}

export function errorGuard(component: React.ReactNode) {
  const result = () => {
    return (
      <ErrorBoundary FallbackComponent={Fallback}>{component}</ErrorBoundary>
    );
  };
  return result;
}

export function getProviderStyles(provider: AllProviders): ProviderStyles {
  return PROVIDER_STYLES[provider];
}

export function getMessageTag(message: Message): string {
  return `${message.conversationId}::${message.id}`;
}

export function getModelAlias(model: Model): string {
  let alias = '';
  if (model.alias && model.alias.length > 0) {
    alias = model.alias;
  } else if ('model' in model) {
    alias = `${model.provider} | ${model.model}`;
  } else if ('deploymentId' in model) {
    alias = `${model.provider} | ${model.deploymentId}`;
  } else {
    alias = `${(model as Model).provider} | {${(model as Model).id}`;
  }
  return alias;
}

export function buildTextContent(text: string): ContentItemList {
  return { items: [{ type: CONTENT_ITEM_TYPE_TEXT, data: text }] };
}

export function getTextFromContent(content: ContentItemList): string {
  const item = content.items.find((ci) => ci.type === CONTENT_ITEM_TYPE_TEXT);
  return item?.data ?? '';
}

export function getTextFromMessage(message: Message): string {
  return getTextFromContent(message.content);
}
