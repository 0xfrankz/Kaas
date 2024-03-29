import { SelectTrigger, SelectValue } from '@radix-ui/react-select';
import { useTranslation } from 'react-i18next';

import { SlideUpTransition } from '@/components/animation/SlideUpTransition';
import { TitleBar } from '@/components/TitleBar';
import { Select, SelectContent, SelectItem } from '@/components/ui/select';
import TwoRows from '@/layouts/TwoRows';

export default function SettingsPage() {
  const { t, i18n } = useTranslation(['generic', 'page-settings', 'error']);

  const onLanguageChange = (value: string) => {
    i18n.changeLanguage(value);
  };

  return (
    <SlideUpTransition motionKey="settings">
      <TwoRows>
        <TwoRows.Top>
          <TitleBar title={t('page-settings:title')} />
        </TwoRows.Top>
        <TwoRows.Bottom>
          <div className="flex grow justify-center">
            <Select
              defaultValue={i18n.language}
              onValueChange={onLanguageChange}
            >
              <SelectTrigger>
                <SelectValue placeholder={t('label:select-language')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="zh-Hans">Simplified Chinese</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </TwoRows.Bottom>
      </TwoRows>
    </SlideUpTransition>
  );
}
