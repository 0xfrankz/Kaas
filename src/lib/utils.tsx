import { type ClassValue, clsx } from 'clsx';
import { ErrorBoundary } from 'react-error-boundary';
import { twMerge } from 'tailwind-merge';
import { z } from 'zod';

import { Fallback } from '@/components/Fallback';

import { CONTENT_ITEM_TYPE_TEXT, PROVIDER_STYLES } from './constants';
import type {
  AllProviders,
  ContentItem,
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

export function buildTextContent(text: string): ContentItem[] {
  return [{ type: CONTENT_ITEM_TYPE_TEXT, data: text }];
}

export function getTextFromContent(contentItems: ContentItem[]): string {
  const item = contentItems.find((ci) => ci.type === CONTENT_ITEM_TYPE_TEXT);
  if (item) {
    return item.data;
  }
  return '';
}

export function getTextFromMessage(message: Message): string {
  return getTextFromContent(message.content);
}

export function getFileExt(fileName: string): string {
  const regex = /\.([^./\\]+)$/;
  const matches = fileName.match(regex);
  return matches ? matches[1] : '';
}

export const preprocessLaTeX = (content: string) => {
  // Replace block-level LaTeX delimiters \[ \] with $$ $$
  const blockProcessedContent = content.replace(
    /\\\[([\s\S]*?)\\\]/g,
    (_, equation) => `$$${equation}$$`
  );
  // Replace inline LaTeX delimiters \( \) with $ $
  const inlineProcessedContent = blockProcessedContent.replace(
    /\\\((.*?)\\\)/g,
    (_, equation) => `$${equation}$`
  );
  return inlineProcessedContent;
};

export function getOSName() {
  const userAgent = window.navigator.userAgent.toLowerCase();

  if (userAgent.includes('win')) return 'Windows';
  if (userAgent.includes('mac')) return 'macOS';
  if (userAgent.includes('linux')) return 'Linux';
  if (userAgent.includes('android')) return 'Android';
  if (userAgent.includes('ios')) return 'iOS';

  return 'Unknown';
}

export function isMacOS() {
  return getOSName() === 'macOS';
}
