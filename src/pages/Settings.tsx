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
  SETTING_DISPLAY_DARKMODE,
  SETTING_DISPLAY_LANGUAGE,
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
  const languageSetting = useAppStateStore(
    (state) => state.settings[SETTING_DISPLAY_LANGUAGE]
  );
  const updater = useUpsertSetting(
    t('page-settings:message:change-language-success'),
    t('page-settings:message:change-language-failure'),
    () => {
      // apply new language
      i18n.changeLanguage(languageRef.current);
      // update settings
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
      <Label htmlFor="language">{t('page-settings:label:language')}</Label>
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
          <SelectItem value="en">English</SelectItem>
          <SelectItem value="zh-Hans">Simplified Chinese</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}

function SettingDarkmode() {
  const { t } = useTranslation(['generic', 'page-settings']);
  const darkmodeSetting = useAppStateStore(
    (state) => state.settings[SETTING_DISPLAY_DARKMODE]
  );
  const darkmodeRef = useRef<string>(darkmodeSetting);
  const updater = useUpsertSetting(
    t('page-settings:message:change-language-success'),
    t('page-settings:message:change-language-failure'),
    () => {
      // apply dark/light mode
      // update settings
    }
  );

  console.log('SettingDarkmode');

  const onSaveClick = () => {
    updater({
      key: SETTING_DISPLAY_DARKMODE,
      value: darkmodeRef.current,
    });
  };

  return (
    <div className="mt-1 bg-white px-4 py-6">
      <Label htmlFor="darkmode">{t('page-settings:label:darkmode')}</Label>
      <Select
        defaultValue={darkmodeSetting}
        onValueChange={(v) => {
          darkmodeRef.current = v;
        }}
      >
        <div className="mt-2 flex justify-between">
          <SelectTrigger className="w-52" id="darkmode">
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
      <SettingDarkmode />
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
