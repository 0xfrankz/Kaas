import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import { SETTING_IS_WIDE_SCREEN } from '@/lib/constants';
import { useSettingUpserter } from '@/lib/hooks';
import { useAppStateStore } from '@/lib/store';

import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import { WideScreenToggler } from './WideScreenToggler';

export function WideScreenSetter() {
  const [isWideScreen, updateSetting] = useAppStateStore((state) => [
    state.settings[SETTING_IS_WIDE_SCREEN] === 'true',
    state.updateSetting,
  ]);
  const { t } = useTranslation();
  const upserter = useSettingUpserter();

  const onWideScreenChange = useCallback(
    (wideScreen: boolean) => {
      updateSetting({
        key: SETTING_IS_WIDE_SCREEN,
        value: wideScreen.toString(),
      });
      upserter({
        key: SETTING_IS_WIDE_SCREEN,
        value: wideScreen.toString(),
      });
    },
    [updateSetting, upserter]
  );

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <WideScreenToggler
          wide={isWideScreen}
          onWideScreenChange={onWideScreenChange}
        />
      </TooltipTrigger>
      <TooltipContent side="bottom">
        <span>
          {isWideScreen
            ? t('generic:label:wide-layout')
            : t('generic:label:narrow-layout')}
        </span>
      </TooltipContent>
    </Tooltip>
  );
}
