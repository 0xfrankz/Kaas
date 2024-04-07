import { useTheme } from 'next-themes';
import { Suspense, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

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
import {
  SETTING_DISPLAY_LANGUAGE,
  SETTING_DISPLAY_THEME,
  SETTING_MODELS_CONTENT_LENGTH,
  SETTING_MODELS_MAX_TOKENS,
  SETTING_PROFILE_NAME,
} from '@/lib/constants';
import { useUpsertSettingMutation } from '@/lib/hooks';
import log from '@/lib/log';
import { useAppStateStore } from '@/lib/store';

function useUpsertSetting(
  successMsg: string,
  failureMsg: string,
  onSuccess: () => void = () => {}
) {
  const upsertSettingMutation = useUpsertSettingMutation({
    onSuccess: () => {
      // callback
      onSuccess();
      // toast
      toast.success(successMsg);
      // update settings
    },
    onError: async (error, variables) => {
      const errMsg = `Upserting settings failed: key = ${variables.key}, value = ${variables.value}, ${error.message}`;
      await log.error(errMsg);
      toast.error(failureMsg);
    },
  });

  return upsertSettingMutation.mutate;
}

function SettingLanguage() {
  const { t, i18n } = useTranslation(['generic', 'page-settings']);
  const languageRef = useRef<string>(i18n.language);
  const [languageSetting, updateSetting] = useAppStateStore((state) => [
    state.settings[SETTING_DISPLAY_LANGUAGE],
    state.updateSetting,
  ]);
  const languageLabel = t('page-settings:label:language');
  const updater = useUpsertSetting(
    t('page-settings:message:change-setting-success', {
      setting: languageLabel,
    }),
    t('page-settings:message:change-setting-failure', {
      setting: languageLabel,
    }),
    () => {
      // apply new language
      i18n.changeLanguage(languageRef.current);
      // update settings
      updateSetting({
        key: SETTING_DISPLAY_LANGUAGE,
        value: languageRef.current,
      });
    }
  );

  console.log('SettingLanguage', 'languageSetting', languageSetting);

  const onSaveClick = () => {
    updater({
      key: SETTING_DISPLAY_LANGUAGE,
      value: languageRef.current,
    });
  };

  return (
    <div className="mt-1 bg-white px-4 py-6">
      <Label htmlFor="language">{languageLabel}</Label>
      <Select
        defaultValue={languageSetting}
        onValueChange={(v) => {
          languageRef.current = v;
        }}
      >
        <div className="mt-2 flex justify-between">
          <SelectTrigger className="w-52" id="language">
            <SelectValue />
          </SelectTrigger>
          <Button
            onClick={() => {
              onSaveClick();
            }}
          >
            {t('generic:button:save')}
          </Button>
        </div>
        <SelectContent>
          <SelectItem value="en">{t('generic:select:language-en')}</SelectItem>
          <SelectItem value="zh-Hans">
            {t('generic:select:language-zh-Hans')}
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}

function SettingTheme() {
  const { t } = useTranslation(['generic', 'page-settings']);
  const { theme, setTheme } = useTheme();
  const [themeSetting, updateSetting] = useAppStateStore((state) => [
    state.settings[SETTING_DISPLAY_THEME],
    state.updateSetting,
  ]);
  const themeRef = useRef<string>(themeSetting);
  const themeLabel = t('page-settings:label:theme');
  const updater = useUpsertSetting(
    t('page-settings:message:change-setting-success', { setting: themeLabel }),
    t('page-settings:message:change-setting-failure', { setting: themeLabel }),
    () => {
      // apply dark/light mode
      if (themeRef.current !== theme) {
        setTheme(themeRef.current);
      }
      // update settings
      updateSetting({
        key: SETTING_DISPLAY_THEME,
        value: themeRef.current,
      });
    }
  );

  console.log('SettingTheme', 'themeSetting', themeSetting);

  const onSaveClick = () => {
    updater({
      key: SETTING_DISPLAY_THEME,
      value: themeRef.current,
    });
  };

  return (
    <div className="mt-1 bg-white px-4 py-6">
      <Label htmlFor="theme">{themeLabel}</Label>
      <Select
        defaultValue={themeSetting}
        onValueChange={(v) => {
          themeRef.current = v;
        }}
      >
        <div className="mt-2 flex justify-between">
          <SelectTrigger className="w-52" id="theme">
            <SelectValue />
          </SelectTrigger>
          <Button
            onClick={() => {
              onSaveClick();
            }}
          >
            {t('generic:button:save')}
          </Button>
        </div>
        <SelectContent>
          <SelectItem value="dark">
            {t('page-settings:select:dark-theme')}
          </SelectItem>
          <SelectItem value="light">
            {t('page-settings:select:light-theme')}
          </SelectItem>
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
  const { settings } = useAppStateStore();

  console.log('SettingName');

  return (
    <div className="mt-1 bg-white px-4 py-6">
      <Label htmlFor="name">{t('page-settings:label:name')}</Label>
      <div className="mt-2 flex justify-between">
        <Input
          className="w-52"
          id="name"
          placeholder="ME"
          defaultValue={settings[SETTING_PROFILE_NAME]}
        />
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
  const { settings } = useAppStateStore();

  console.log('SettingContextLength');

  return (
    <div className="mt-1 bg-white px-4 py-6">
      <Label htmlFor="context-length">
        {t('page-settings:label:context-length')}
      </Label>
      <div className="mt-2 flex justify-between">
        <Input
          className="w-52"
          id="context-length"
          placeholder="10"
          defaultValue={settings[SETTING_MODELS_CONTENT_LENGTH]}
        />
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
  const { settings } = useAppStateStore();

  console.log('SettingMaxTokens');

  return (
    <div className="mt-1 bg-white px-4 py-6">
      <Label htmlFor="max-tokens">{t('page-settings:label:max-tokens')}</Label>
      <div className="mt-2 flex justify-between">
        <Input
          className="w-52"
          id="max-tokens"
          placeholder="256"
          defaultValue={settings[SETTING_MODELS_MAX_TOKENS]}
        />
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

  console.log('SettingGroupDisplay');

  return (
    <div className="flex flex-col">
      <span className="mb-1 text-sm font-semibold">
        {t('page-settings:label:display')}
      </span>
      <SettingLanguage />
      <SettingTheme />
    </div>
  );
}

function SettingGroupProfile() {
  const { t } = useTranslation(['generic', 'page-settings']);

  console.log('SettingGroupProfile');

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

  console.log('SettingGroupModels');

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
        <TwoRows.Bottom className="flex size-full justify-center overflow-hidden bg-slate-100 dark:bg-black">
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
