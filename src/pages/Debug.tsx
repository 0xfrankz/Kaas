import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { SlideUpTransition } from '@/components/animation/SlideUpTransition';
import { TitleBar } from '@/components/TitleBar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import TwoRows from '@/layouts/TwoRows';
import { useGetSysInfoQuery } from '@/lib/hooks';

type SystemInfo = {
  webviewInfo: Record<string, string>;
  osInfo: Record<string, string>;
};

function SystemInfoSection() {
  const { t } = useTranslation(['generic', 'page-debug']);
  const [sysInfo, setSysInfo] = useState<SystemInfo | null>(null);

  const { data: osInfo } = useGetSysInfoQuery();

  const onClick = useCallback(() => {
    navigator.clipboard.writeText(JSON.stringify(sysInfo));
  }, [sysInfo]);

  useEffect(() => {
    if (osInfo) {
      const webviewInfo = {
        userAgent: navigator.userAgent,
        cookieEnabled: navigator.cookieEnabled.toString(),
        languages: JSON.stringify(navigator.languages),
        onLine: navigator.onLine.toString(),
      };
      setSysInfo({
        webviewInfo,
        osInfo,
      });
    }
  }, [setSysInfo, osInfo]);

  return (
    <div className="flex break-inside-avoid flex-col">
      <span className="mb-1 text-sm font-semibold">
        {t('page-debug:label:sys-info')}
      </span>
      <Card className="mt-1 flex select-text flex-col gap-4 px-4 py-6">
        {sysInfo && (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead colSpan={2}>
                    {t('page-debug:label:webview-info')}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="text-xs">
                {sysInfo?.webviewInfo &&
                  Object.entries(sysInfo.webviewInfo).map(([key, value]) => (
                    <TableRow key={key}>
                      <TableCell>{key}</TableCell>
                      <TableCell>{value}</TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
            {/* <Separator /> */}
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead colSpan={2}>
                    {t('page-debug:label:os-info')}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="text-xs">
                {sysInfo?.osInfo &&
                  Object.entries(sysInfo.osInfo).map(([key, value]) => (
                    <TableRow key={key}>
                      <TableCell>{key}</TableCell>
                      <TableCell>{value}</TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
            <div className="flex justify-end">
              <Button variant="secondary" className="text-xs" onClick={onClick}>
                Copy
              </Button>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}

export default function DebugPage() {
  const { t } = useTranslation(['generic', 'page-debug']);
  return (
    <SlideUpTransition motionKey="debug">
      <TwoRows className="max-h-screen">
        <TwoRows.Top>
          <TitleBar title={t('page-debug:title')} />
        </TwoRows.Top>
        <TwoRows.Bottom className="flex size-full justify-center overflow-hidden bg-background">
          <ScrollArea className="w-full grow px-4">
            <div className="mx-auto mb-6 mt-12 box-border columns-1 text-foreground md:columns-2 md:gap-4 lg:w-[924px] lg:gap-8">
              <SystemInfoSection />
            </div>
          </ScrollArea>
        </TwoRows.Bottom>
      </TwoRows>
    </SlideUpTransition>
  );
}
