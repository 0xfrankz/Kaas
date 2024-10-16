import { readTextFile } from '@tauri-apps/plugin-fs';
import { resolveResource } from '@tauri-apps/api/path';
import { open } from '@tauri-apps/plugin-shell';
import { LinkIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { SlideUpTransition } from '@/components/animation/SlideUpTransition';
import { TitleBar } from '@/components/TitleBar';
import { Button } from '@/components/ui/button';
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

type Dependency = {
  name: string;
  license: string;
  link: string;
  author: string;
};

async function loadJsDepencencies(): Promise<Dependency[]> {
  const resourcePath = await resolveResource('resources/js-deps.json');
  const raw = JSON.parse(await readTextFile(resourcePath));
  const dependencies: Record<string, Dependency> = {};
  raw.forEach((d: any) => {
    dependencies[d.name as string] = {
      name: d.name,
      license: d.licenses,
      link: d.repository,
      author: d.publisher,
    };
  });
  return Object.values(dependencies);
}

async function loadRsDepencencies(): Promise<Dependency[]> {
  const resourcePath = await resolveResource('resources/rs-deps.json');
  const raw = JSON.parse(await readTextFile(resourcePath));
  const dependencies: Record<string, Dependency> = {};
  raw.forEach((d: any) => {
    dependencies[d.name as string] = {
      name: d.name,
      license: d.licenses,
      link: d.repository,
      author: d.publisher,
    };
  });
  return Object.values(dependencies);
}

async function loadDepencencies(): Promise<Dependency[]> {
  const jsDeps = await loadJsDepencencies();
  const rsDeps = await loadRsDepencencies();
  return jsDeps.concat(rsDeps);
}

export default function Dependencies() {
  const [dependencies, setDependencies] = useState<Dependency[]>([]);
  const { t } = useTranslation(['page-dependencies']);

  useEffect(() => {
    loadDepencencies().then((deps) => {
      setDependencies(deps);
    });
  }, []);
  return (
    <SlideUpTransition motionKey="debug">
      <TwoRows className="max-h-screen">
        <TwoRows.Top>
          <TitleBar title={t('page-dependencies:title')} />
        </TwoRows.Top>
        <TwoRows.Bottom className="flex overflow-hidden">
          <ScrollArea className="w-full grow">
            <div className="mx-auto mb-6 mt-12 flex w-[960px] flex-col gap-8 text-foreground">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-left">
                      {t('page-dependencies:label:name')}
                    </TableHead>
                    <TableHead className="text-left">
                      {t('page-dependencies:label:author')}
                    </TableHead>
                    <TableHead className="text-left">
                      {t('page-dependencies:label:license')}
                    </TableHead>
                    <TableHead className="text-left">
                      {t('page-dependencies:label:link')}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dependencies.map((dep, index) => (
                    // eslint-disable-next-line react/no-array-index-key
                    <TableRow key={`${dep.name}_${index}`}>
                      <TableCell>{dep.name}</TableCell>
                      <TableCell>{dep.author}</TableCell>
                      <TableCell>{dep.license}</TableCell>
                      <TableCell>
                        <Button
                          variant="link"
                          onClick={() => open(dep.link)}
                          className="p-0"
                          aria-label={t('page-dependencies:label:link')}
                        >
                          <LinkIcon className="mr-2 size-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </ScrollArea>
        </TwoRows.Bottom>
      </TwoRows>
    </SlideUpTransition>
  );
}
