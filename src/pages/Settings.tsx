import { Suspense, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import { SlideUpTransition } from '@/components/animation/SlideUpTransition';
import { TitleBar } from '@/components/TitleBar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import TwoRows from '@/layouts/TwoRows';

function SettingLanguage() {
  const { t, i18n } = useTranslation(['generic', 'page-settings']);
  const languageRef = useRef<string>(i18n.language);

  const onLanguageChange = () => {
    i18n.changeLanguage(languageRef.current);
  };

  return (
    <div className="mt-1 bg-white px-4 py-6">
      <Label htmlFor="language">{t('page-settings:label:language')}</Label>
      <Select
        defaultValue={languageRef.current}
        onValueChange={(v) => {
          languageRef.current = v;
        }}
      >
        <div className="mt-2 flex justify-between">
          <SelectTrigger className="w-52" id="language">
            <SelectValue placeholder={t('page-settings:select:language')} />
          </SelectTrigger>
          <Button
            onClick={() => {
              onLanguageChange();
            }}
          >
            {t('generic:button:save')}
          </Button>
        </div>
        <SelectContent>
          <SelectItem value="en">English</SelectItem>
          <SelectItem value="zh-Hans">Simplified Chinese</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}

function SettingDarkmode() {
  const { t } = useTranslation(['generic', 'page-settings']);

  return (
    <div className="mt-1 bg-white px-4 py-6">
      <Label htmlFor="darkmode">{t('page-settings:label:darkmode')}</Label>
      <Select defaultValue="system">
        <div className="mt-2 flex justify-between">
          <SelectTrigger className="w-52" id="darkmode">
            <SelectValue />
          </SelectTrigger>
          <Button>{t('generic:button:save')}</Button>
        </div>
        <SelectContent>
          <SelectItem value="on">{t('page-settings:select:on')}</SelectItem>
          <SelectItem value="off">{t('page-settings:select:off')}</SelectItem>
          <SelectItem value="system">
            {t('page-settings:select:system')}
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}

function SettingName() {
  const { t } = useTranslation(['generic', 'page-settings']);

  return (
    <div className="mt-1 bg-white px-4 py-6">
      <Label htmlFor="name">{t('page-settings:label:name')}</Label>
      <div className="mt-2 flex justify-between">
        <Input className="w-52" id="name" placeholder="ME" />
        <Button>{t('generic:button:save')}</Button>
      </div>
      <span className="mt-2 text-xs text-slate-400">
        {t('page-settings:label:name-desc')}
      </span>
    </div>
  );
}

function SettingContextLength() {
  const { t } = useTranslation(['generic', 'page-settings']);

  return (
    <div className="mt-1 bg-white px-4 py-6">
      <Label htmlFor="context-length">
        {t('page-settings:label:context-length')}
      </Label>
      <div className="mt-2 flex justify-between">
        <Input className="w-52" id="context-length" placeholder="10" />
        <Button>{t('generic:button:save')}</Button>
      </div>
      <span className="mt-2 text-xs text-slate-400">
        {t('page-settings:label:context-length-desc')}
      </span>
    </div>
  );
}

function SettingMaxTokens() {
  const { t } = useTranslation(['generic', 'page-settings']);

  return (
    <div className="mt-1 bg-white px-4 py-6">
      <Label htmlFor="max-tokens">{t('page-settings:label:max-tokens')}</Label>
      <div className="mt-2 flex justify-between">
        <Input className="w-52" id="max-tokens" placeholder="256" />
        <Button>{t('generic:button:save')}</Button>
      </div>
      <span className="mt-2 text-xs text-slate-400">
        {t('page-settings:label:max-tokens-desc')}
      </span>
    </div>
  );
}

function SettingGroupDisplay() {
  const { t } = useTranslation(['generic', 'page-settings']);

  return (
    <div className="flex flex-col">
      <span className="mb-1 text-sm font-semibold">
        {t('page-settings:label:display')}
      </span>
      <SettingLanguage />
      <SettingDarkmode />
    </div>
  );
}

function SettingGroupProfile() {
  const { t } = useTranslation(['generic', 'page-settings']);

  return (
    <div className="mt-6 flex flex-col">
      <span className="mb-1 text-sm font-semibold">
        {t('page-settings:label:profile')}
      </span>
      <SettingName />
    </div>
  );
}

function SettingGroupModels() {
  const { t } = useTranslation(['generic', 'page-settings']);

  return (
    <div className="mt-6 flex flex-col">
      <span className="mb-1 text-sm font-semibold">
        {t('page-settings:label:models')}
      </span>
      <SettingContextLength />
      <SettingMaxTokens />
    </div>
  );
}

function PageTitle() {
  const { t } = useTranslation(['page-settings']);
  return <TitleBar title={t('page-settings:title')} />;
}

export default function SettingsPage() {
  return (
    <SlideUpTransition motionKey="settings">
      <TwoRows className="max-h-screen">
        <TwoRows.Top>
          <Suspense fallback={null}>
            <PageTitle />
          </Suspense>
        </TwoRows.Top>
        <TwoRows.Bottom className="flex size-full justify-center overflow-hidden bg-slate-100">
          <ScrollArea className="w-full grow">
            <div className="mx-auto flex w-[480px] flex-col justify-center py-12">
              <Suspense fallback={null}>
                <SettingGroupDisplay />
                <SettingGroupProfile />
                <SettingGroupModels />
              </Suspense>
            </div>
          </ScrollArea>
        </TwoRows.Bottom>
      </TwoRows>
    </SlideUpTransition>
  );
}
