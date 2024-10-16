import { zodResolver } from '@hookform/resolvers/zod';
import { open } from '@tauri-apps/plugin-shell';
import { Github, Heart, Smile, Tag } from 'lucide-react';
import { useTheme } from 'next-themes';
import type { HTMLAttributes } from 'react';
import { forwardRef, Suspense, useEffect, useRef, useState } from 'react';
import type { SubmitHandler } from 'react-hook-form';
import { useForm, useWatch } from 'react-hook-form';
import { Trans, useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { z } from 'zod';

import { SlideUpTransition } from '@/components/animation/SlideUpTransition';
import { FieldErrorMessage } from '@/components/FieldErrorMessage';
import { InputWithMenu } from '@/components/InputWithMenu';
import { OnOffIndicator } from '@/components/OnOffIndicator';
import { TitleBar } from '@/components/TitleBar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
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
import { TwitterIcon } from '@/components/ui/icons/TwitterIcon';
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
  DEFAULT_CONTEXT_LENGTH,
  DEFAULT_MAX_TOKENS,
  DEFAULT_PROFILE_NAME,
  SETTING_DISPLAY_LANGUAGE,
  SETTING_DISPLAY_THEME,
  SETTING_MODELS_CONTEXT_LENGTH,
  SETTING_MODELS_MAX_TOKENS,
  SETTING_NETWORK_PROXY,
  SETTING_PROFILE_NAME,
} from '@/lib/constants';
import { useProxySetting, useSettingUpserter } from '@/lib/hooks';
import log from '@/lib/log';
import { proxySchema } from '@/lib/schemas';
import { useAppStateStore } from '@/lib/store';
import type { ProxySetting } from '@/lib/types';
import { cn } from '@/lib/utils';

function SettingLanguage() {
  const { t, i18n } = useTranslation(['generic', 'page-settings']);
  const languageRef = useRef<string>(i18n.language);
  const languageSetting = useAppStateStore(
    (state) => state.settings[SETTING_DISPLAY_LANGUAGE]
  );
  const languageLabel = t('page-settings:label:language');
  const updater = useSettingUpserter(
    () => {
      // apply new language
      i18n.changeLanguage(languageRef.current);
      // toast
      toast.success(
        t('page-settings:message:change-setting-success', {
          setting: languageLabel,
        })
      );
    },
    (error, variables) => {
      const errMsg = `Upserting settings failed: key = ${variables.key}, value = ${variables.value}, ${error.message}`;
      log.error(errMsg);
      toast.error(
        t('page-settings:message:change-setting-failure', {
          setting: languageLabel,
        })
      );
    }
  );

  const onSaveClick = () => {
    updater({
      key: SETTING_DISPLAY_LANGUAGE,
      value: languageRef.current,
    });
  };

  return (
    <Card className="mt-1 flex flex-col gap-2 px-4 py-6">
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
            {t('generic:action:save')}
          </Button>
        </div>
        <SelectContent>
          <SelectItem value="en">{t('generic:select:language-en')}</SelectItem>
          <SelectItem value="zh-Hans">
            {t('generic:select:language-zh-Hans')}
          </SelectItem>
        </SelectContent>
      </Select>
    </Card>
  );
}

function SettingTheme() {
  const { t } = useTranslation(['generic', 'page-settings']);
  const { theme, setTheme } = useTheme();
  const themeSetting = useAppStateStore(
    (state) => state.settings[SETTING_DISPLAY_THEME]
  );
  const themeRef = useRef<string>(themeSetting);
  const themeLabel = t('page-settings:label:theme');
  const updater = useSettingUpserter(
    () => {
      // apply dark/light mode
      if (themeRef.current !== theme) {
        setTheme(themeRef.current);
      }
      // toast
      toast.success(
        t('page-settings:message:change-setting-success', {
          setting: themeLabel,
        })
      );
    },
    (error, variables) => {
      const errMsg = `Upserting settings failed: key = ${variables.key}, value = ${variables.value}, ${error.message}`;
      log.error(errMsg);
      toast.error(
        t('page-settings:message:change-setting-failure', {
          setting: themeLabel,
        })
      );
    }
  );

  const onSaveClick = () => {
    updater({
      key: SETTING_DISPLAY_THEME,
      value: themeRef.current,
    });
  };

  return (
    <Card className="mt-1 flex flex-col gap-2 px-4 py-6">
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
            {t('generic:action:save')}
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
    </Card>
  );
}

function SettingName() {
  const { t } = useTranslation(['generic', 'page-settings']);
  const userName = useAppStateStore(
    (state) => state.settings[SETTING_PROFILE_NAME] ?? DEFAULT_PROFILE_NAME
  );
  const nameRef = useRef<HTMLInputElement>(null);
  const nameLabel = t('page-settings:label:name');
  const updater = useSettingUpserter(
    () => {
      // toast
      toast.success(
        t('page-settings:message:change-setting-success', {
          setting: nameLabel,
        })
      );
    },
    (error, variables) => {
      const errMsg = `Upserting settings failed: key = ${variables.key}, value = ${variables.value}, ${error.message}`;
      log.error(errMsg);
      toast.error(
        t('page-settings:message:change-setting-failure', {
          setting: nameLabel,
        })
      );
    }
  );

  const onSaveClick = () => {
    updater({
      key: SETTING_PROFILE_NAME,
      value: nameRef.current?.value ?? '',
    });
  };

  return (
    <Card className="mt-1 flex flex-col gap-2 px-4 py-6">
      <Label htmlFor="name">{t('page-settings:label:name')}</Label>
      <div className="flex justify-between">
        <InputWithMenu
          ref={nameRef}
          className="w-52"
          id="name"
          placeholder="ME"
          defaultValue={userName}
        />
        <Button onClick={onSaveClick}>{t('generic:action:save')}</Button>
      </div>
      <span className="text-xs text-muted-foreground">
        {t('page-settings:label:name-desc')}
      </span>
    </Card>
  );
}

function SettingContextLength() {
  const { t } = useTranslation(['generic', 'page-settings', 'error']);
  const ctxLength = useAppStateStore(
    (state) =>
      state.settings[SETTING_MODELS_CONTEXT_LENGTH] ?? DEFAULT_CONTEXT_LENGTH
  );
  const [error, setError] = useState('');
  const ctxLengthRef = useRef<HTMLInputElement>(null);
  const ctxLengthLabel = t('page-settings:label:context-length');
  const updater = useSettingUpserter(
    () => {
      // toast
      toast.success(
        t('page-settings:message:change-setting-success', {
          setting: ctxLengthLabel,
        })
      );
    },
    (err, variables) => {
      const errMsg = `Upserting settings failed: key = ${variables.key}, value = ${variables.value}, ${err.message}`;
      log.error(errMsg);
      toast.error(
        t('page-settings:message:change-setting-failure', {
          setting: ctxLengthLabel,
        })
      );
    }
  );

  const onSaveClick = () => {
    const validation = z.coerce
      .number()
      .int()
      .min(0)
      .max(65535)
      .safeParse(ctxLengthRef.current?.value);
    if (!validation.success) {
      setError(
        t('error:validation:invalid-int-minmax', {
          value: ctxLengthLabel,
          min: 0,
          max: 65535,
        })
      );
    } else {
      updater({
        key: SETTING_MODELS_CONTEXT_LENGTH,
        value: validation.data.toString(),
      });
    }
  };

  return (
    <Card className="mt-1 flex flex-col gap-2 px-4 py-6">
      <Label htmlFor="context-length">{ctxLengthLabel}</Label>
      <div className="flex justify-between">
        <InputWithMenu
          ref={ctxLengthRef}
          className="w-52"
          id="context-length"
          placeholder="10"
          defaultValue={ctxLength}
        />
        <Button onClick={onSaveClick}>{t('generic:action:save')}</Button>
      </div>
      {error ? <FieldErrorMessage message={error} /> : null}
      <span className="text-xs text-muted-foreground">
        {t('page-settings:label:context-length-desc')}
      </span>
    </Card>
  );
}

function SettingMaxTokens() {
  const { t } = useTranslation(['generic', 'page-settings', 'error']);
  const maxTokens = useAppStateStore(
    (state) => state.settings[SETTING_MODELS_MAX_TOKENS] ?? DEFAULT_MAX_TOKENS
  );
  const [error, setError] = useState('');
  const maxTokensRef = useRef<HTMLInputElement>(null);
  const maxTokensLabel = t('page-settings:label:max-tokens');
  const updater = useSettingUpserter(
    () => {
      // toast
      toast.success(
        t('page-settings:message:change-setting-success', {
          setting: maxTokensLabel,
        })
      );
    },
    (err, variables) => {
      const errMsg = `Upserting settings failed: key = ${variables.key}, value = ${variables.value}, ${err.message}`;
      log.error(errMsg);
      toast.error(
        t('page-settings:message:change-setting-failure', {
          setting: maxTokensLabel,
        })
      );
    }
  );

  const onSaveClick = () => {
    const validation = z.coerce
      .number()
      .int()
      .min(1)
      .max(65535)
      .safeParse(maxTokensRef.current?.value);
    if (!validation.success) {
      setError(
        t('error:validation:invalid-int-minmax', {
          value: maxTokensLabel,
          min: 1,
          max: 65535,
        })
      );
    } else {
      updater({
        key: SETTING_MODELS_MAX_TOKENS,
        value: validation.data.toString(),
      });
    }
  };

  return (
    <Card className="mt-1 flex flex-col gap-2 px-4 py-6">
      <Label htmlFor="max-tokens">{t('page-settings:label:max-tokens')}</Label>
      <div className="flex justify-between">
        <InputWithMenu
          ref={maxTokensRef}
          className="w-52"
          id="max-tokens"
          placeholder="256"
          defaultValue={maxTokens}
        />
        <Button onClick={onSaveClick}>{t('generic:action:save')}</Button>
      </div>
      {error ? <FieldErrorMessage message={error} /> : null}
      <span className="text-xs text-muted-foreground">
        {t('page-settings:label:max-tokens-desc')}
      </span>
    </Card>
  );
}

function SettingProxy() {
  const { t } = useTranslation(['generic', 'page-settings']);
  const [proxySetting, setProxySetting] = useProxySetting();
  const form = useForm<ProxySetting>({
    resolver: zodResolver(proxySchema),
    defaultValues: proxySetting,
  });
  const useProxy = useWatch({ name: 'on', control: form.control });
  const proxyLabel = t('page-settings:label:proxy');
  const updater = useSettingUpserter(
    () => {
      // apply proxy setting
      setProxySetting(form.getValues());
      // toast
      toast.success(
        t('page-settings:message:change-setting-success', {
          setting: proxyLabel,
        })
      );
    },
    (error, variables) => {
      const errMsg = `Upserting settings failed: key = ${variables.key}, value = ${variables.value}, ${error.message}`;
      log.error(errMsg);
      toast.error(
        t('page-settings:message:change-setting-failure', {
          setting: proxyLabel,
        })
      );
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
  }, [form, proxySetting.on, updater, useProxy]);

  return (
    <Card className="mt-1 flex flex-col px-4 py-6">
      <div className="flex items-center">
        <span className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          {t('page-settings:label:proxy')}
        </span>
        <OnOffIndicator on={proxySetting.on} />
      </div>
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
                {t('generic:action:save')}
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
                    <InputWithMenu
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
                  <FieldErrorMessage
                    message={t(form.formState.errors.http?.message)}
                  />
                ) : null}
                <FormDescription>
                  {t('page-settings:label:traffic-type-desc')}
                </FormDescription>
              </div>
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <div className="mt-6 flex flex-col gap-2">
                    <Label htmlFor="proxy-username" className="font-normal">
                      {t('page-settings:label:proxy-username')}
                    </Label>
                    <InputWithMenu
                      className="w-52"
                      id="proxy-username"
                      {...field}
                    />
                    <FormDescription>
                      {t('page-settings:label:proxy-name-psw-tips')}
                    </FormDescription>
                  </div>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <div className="mt-6 flex flex-col gap-2">
                    <Label htmlFor="proxy-password" className="font-normal">
                      {t('page-settings:label:proxy-password')}
                    </Label>
                    <InputWithMenu
                      type="password"
                      className="w-52"
                      id="proxy-password"
                      {...field}
                    />
                    <FormDescription>
                      {t('page-settings:label:proxy-name-psw-tips')}
                    </FormDescription>
                  </div>
                )}
              />
            </>
          ) : null}
        </form>
      </Form>
    </Card>
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

const SettingGroupModels = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const { t } = useTranslation(['generic', 'page-settings']);

  return (
    <div
      className={cn('mt-8 flex break-inside-avoid flex-col', className)}
      {...props}
      ref={ref}
    >
      <span className="mb-1 text-sm font-semibold">
        {t('page-settings:label:models')}
      </span>
      <SettingContextLength />
      <SettingMaxTokens />
    </div>
  );
});

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

function AboutUs() {
  const { t } = useTranslation(['generic', 'page-settings']);
  return (
    <div className="mt-8 flex break-inside-avoid flex-col">
      <span className="mb-1 text-sm font-semibold">
        {t('page-settings:label:aboutus')}
      </span>
      <Card className="mt-1 flex flex-col px-4 py-6">
        <ul className="flex flex-col gap-4 text-sm">
          <li className="flex items-center gap-2">
            <Tag className="size-[14px]" />
            <span className="mr-2 font-medium">
              {t('page-settings:label:version')}:
            </span>
            {import.meta.env.VITE_APP_VERSION}_{import.meta.env.COMMIT_HASH}
          </li>
          <li className="flex gap-2">
            <Smile className="mt-1 size-[14px] flex-none" />
            <p className="leading-6">
              <Trans
                i18nKey="page-settings:message:built-by"
                values={{ name: 'Frank Zhang' }}
                components={{
                  userLink: (
                    <Button
                      variant="link"
                      onClick={() => open('https://github.com/0xfrankz')}
                      className="mx-1 inline h-fit p-0 leading-6"
                    />
                  ),
                  icon: (
                    <Heart className="mx-1 inline-block size-4 fill-red-600" />
                  ),
                  depsLink: (
                    <Link
                      to="/dependencies"
                      className="ml-1 text-primary underline-offset-4 hover:underline"
                    />
                  ),
                }}
              />
            </p>
          </li>
          <li className="flex items-center gap-2">
            <Github className="size-[14px]" />
            <Button
              variant="link"
              onClick={() => open('https://github.com/0xfrankz')}
              className="mx-1 inline h-fit p-0 leading-6"
            >
              GitHub Repo
            </Button>
          </li>
          <li className="flex items-center gap-2">
            <TwitterIcon className="size-[14px]" />
            <Button
              variant="link"
              onClick={() => open('https://x.com/thekaasapp')}
              className="mx-1 inline h-fit p-0 leading-6"
            >
              X / Twitter
            </Button>
          </li>
        </ul>
      </Card>
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
        <TwoRows.Bottom className="flex size-full justify-center overflow-hidden bg-background">
          <ScrollArea className="w-full grow px-4">
            <div className="mx-auto mb-6 mt-12 box-border columns-1 text-foreground md:columns-2 md:gap-4 lg:max-w-[924px] lg:gap-8">
              <SettingGroupDisplay />
              <SettingGroupProfile />
              <SettingGroupModels className="md:break-after-column" />
              <SettingGroupNetwork />
              <AboutUs />
            </div>
          </ScrollArea>
        </TwoRows.Bottom>
      </TwoRows>
    </SlideUpTransition>
  );
}
