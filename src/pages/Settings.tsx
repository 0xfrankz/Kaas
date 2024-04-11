import { zodResolver } from '@hookform/resolvers/zod';
import { useTheme } from 'next-themes';
import { Suspense, useEffect, useRef } from 'react';
import type { SubmitHandler } from 'react-hook-form';
import { useForm, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { useShallow } from 'zustand/react/shallow';

import { SlideUpTransition } from '@/components/animation/SlideUpTransition';
import { TitleBar } from '@/components/TitleBar';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
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
import { Switch } from '@/components/ui/switch';
import TwoRows from '@/layouts/TwoRows';
import {
  SETTING_DISPLAY_LANGUAGE,
  SETTING_DISPLAY_THEME,
  SETTING_MODELS_CONTENT_LENGTH,
  SETTING_MODELS_MAX_TOKENS,
  SETTING_NETWORK_PROXY,
  SETTING_PROFILE_NAME,
} from '@/lib/constants';
import { useUpsertSettingMutation } from '@/lib/hooks';
import log from '@/lib/log';
import { proxySchema } from '@/lib/schemas';
import { useAppStateStore } from '@/lib/store';
import type { ProxySetting } from '@/lib/types';

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

  const onSaveClick = () => {
    updater({
      key: SETTING_DISPLAY_LANGUAGE,
      value: languageRef.current,
    });
  };

  return (
    <div className="mt-1 flex flex-col gap-2 bg-white px-4 py-6">
      <Label htmlFor="language">{languageLabel}</Label>
      <Select
        defaultValue={languageSetting}
        onValueChange={(v) => {
          languageRef.current = v;
        }}
      >
        <div className="flex justify-between">
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

  const onSaveClick = () => {
    updater({
      key: SETTING_DISPLAY_THEME,
      value: themeRef.current,
    });
  };

  return (
    <div className="mt-1 flex flex-col gap-2 bg-white px-4 py-6">
      <Label htmlFor="theme">{themeLabel}</Label>
      <Select
        defaultValue={themeSetting}
        onValueChange={(v) => {
          themeRef.current = v;
        }}
      >
        <div className="flex justify-between">
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

  return (
    <div className="mt-1 flex flex-col gap-2 bg-white px-4 py-6">
      <Label htmlFor="name">{t('page-settings:label:name')}</Label>
      <div className="flex justify-between">
        <Input
          className="w-52"
          id="name"
          placeholder="ME"
          defaultValue={settings[SETTING_PROFILE_NAME]}
        />
        <Button>{t('generic:button:save')}</Button>
      </div>
      <span className="text-xs text-muted-foreground">
        {t('page-settings:label:name-desc')}
      </span>
    </div>
  );
}

function SettingContextLength() {
  const { t } = useTranslation(['generic', 'page-settings']);
  const { settings } = useAppStateStore();

  return (
    <div className="mt-1 flex flex-col gap-2 bg-white px-4 py-6">
      <Label htmlFor="context-length">
        {t('page-settings:label:context-length')}
      </Label>
      <div className="flex justify-between">
        <Input
          className="w-52"
          id="context-length"
          placeholder="10"
          defaultValue={settings[SETTING_MODELS_CONTENT_LENGTH]}
        />
        <Button>{t('generic:button:save')}</Button>
      </div>
      <span className="text-xs text-muted-foreground">
        {t('page-settings:label:context-length-desc')}
      </span>
    </div>
  );
}

function SettingMaxTokens() {
  const { t } = useTranslation(['generic', 'page-settings']);
  const { settings } = useAppStateStore();

  return (
    <div className="mt-1 flex flex-col gap-2 bg-white px-4 py-6">
      <Label htmlFor="max-tokens">{t('page-settings:label:max-tokens')}</Label>
      <div className="flex justify-between">
        <Input
          className="w-52"
          id="max-tokens"
          placeholder="256"
          defaultValue={settings[SETTING_MODELS_MAX_TOKENS]}
        />
        <Button>{t('generic:button:save')}</Button>
      </div>
      <span className="text-xs text-muted-foreground">
        {t('page-settings:label:max-tokens-desc')}
      </span>
    </div>
  );
}

function SettingProxy() {
  const { t } = useTranslation(['generic', 'page-settings']);
  const [proxySettingStr, updateSetting] = useAppStateStore(
    useShallow((state) => [
      state.settings[SETTING_NETWORK_PROXY],
      state.updateSetting,
    ])
  );
  let proxySetting: ProxySetting;
  try {
    proxySetting = proxySchema.parse(JSON.parse(proxySettingStr));
  } catch (e) {
    proxySetting = {
      on: false,
      server: '',
      http: false,
      https: false,
    };
  }
  const form = useForm<ProxySetting>({
    resolver: zodResolver(proxySchema),
    defaultValues: proxySetting,
  });
  const useProxy = useWatch({ name: 'on', control: form.control });
  const proxyLabel = t('page-settings:label:proxy');
  const updater = useUpsertSetting(
    t('page-settings:message:change-setting-success', { setting: proxyLabel }),
    t('page-settings:message:change-setting-failure', { setting: proxyLabel }),
    () => {
      updateSetting({
        key: SETTING_NETWORK_PROXY,
        value: JSON.stringify(form.getValues()),
      });
    }
  );

  // Callbacks
  const onSubmit: SubmitHandler<ProxySetting> = (formData) => {
    updater({
      key: SETTING_NETWORK_PROXY,
      value: JSON.stringify(formData),
    });
  };

  useEffect(() => {
    if (proxySetting.on && !useProxy) {
      // user turns off proxy
      // save automatically
      updater({
        key: SETTING_NETWORK_PROXY,
        value: JSON.stringify(form.getValues()),
      });
    }
  }, [useProxy]);

  return (
    <div className="mt-1 flex flex-col bg-white px-4 py-6">
      <span className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
        Proxy
      </span>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="mt-6 flex h-9 items-center justify-start">
            <FormField
              control={form.control}
              name="on"
              render={({ field }) => (
                <FormItem className="flex items-center space-y-0">
                  <FormLabel className="font-normal">
                    {t('page-settings:label:use-proxy')}
                  </FormLabel>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      className="ml-4"
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            {useProxy ? (
              <Button className="ml-auto" type="submit">
                {t('generic:button:save')}
              </Button>
            ) : null}
          </div>
          {useProxy ? (
            <>
              <FormField
                control={form.control}
                name="server"
                render={({ field }) => (
                  <div className="mt-6 flex flex-col gap-2">
                    <Label htmlFor="proxy-server" className="font-normal">
                      {t('page-settings:label:proxy-server')}
                    </Label>
                    <Input
                      className="w-52"
                      id="proxy-server"
                      placeholder="http://127.0.0.1:1234"
                      {...field}
                    />
                    <FormMessage />
                    <FormDescription>
                      {t('page-settings:label:proxy-server-desc')}
                    </FormDescription>
                  </div>
                )}
              />
              <div className="mt-6 flex flex-col gap-2">
                <Label className="font-normal">
                  {t('page-settings:label:traffic-type')}
                </Label>
                <div className="flex h-9 w-52 items-center gap-2 rounded-md border px-6 py-1">
                  <FormField
                    control={form.control}
                    name="http"
                    render={({ field }) => (
                      <>
                        <Checkbox
                          id="traffic-http"
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                        <Label
                          htmlFor="traffic-http"
                          className="text-xs font-normal"
                        >
                          {t('page-settings:label:traffic-http')}
                        </Label>
                      </>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="https"
                    render={({ field }) => (
                      <>
                        <Checkbox
                          id="traffic-https"
                          className="ml-auto"
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                        <Label
                          htmlFor="traffic-https"
                          className="text-xs font-normal"
                        >
                          {t('page-settings:label:traffic-https')}
                        </Label>
                      </>
                    )}
                  />
                </div>
                {form.formState.errors.http?.message ? (
                  <p className="text-[0.8rem] font-medium text-destructive">
                    {t(form.formState.errors.http?.message)}
                  </p>
                ) : null}
                <FormDescription>
                  {t('page-settings:label:traffic-type-desc')}
                </FormDescription>
              </div>
            </>
          ) : null}
        </form>
      </Form>
    </div>
  );
}

function SettingGroupDisplay() {
  const { t } = useTranslation(['generic', 'page-settings']);

  return (
    <div className="flex break-inside-avoid flex-col">
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

  return (
    <div className="mt-8 flex break-inside-avoid flex-col">
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
    <div className="mt-8 flex break-inside-avoid flex-col">
      <span className="mb-1 text-sm font-semibold">
        {t('page-settings:label:models')}
      </span>
      <SettingContextLength />
      <SettingMaxTokens />
    </div>
  );
}

function SettingGroupNetwork() {
  const { t } = useTranslation(['generic', 'page-settings']);
  return (
    <div className="mt-8 flex break-inside-avoid flex-col">
      <span className="mb-1 text-sm font-semibold">
        {t('page-settings:label:network')}
      </span>
      <SettingProxy />
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
            <Suspense fallback={null}>
              <div className="mx-auto w-[960px] columns-2 gap-8 py-12">
                <SettingGroupDisplay />
                <SettingGroupProfile />
                <SettingGroupModels />
                <SettingGroupNetwork />
              </div>
            </Suspense>
          </ScrollArea>
        </TwoRows.Bottom>
      </TwoRows>
    </SlideUpTransition>
  );
}
