import { Label } from '@radix-ui/react-label';
import React, { Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import { SlideUpTransition } from '@/components/animation/SlideUpTransition';
import { ConversationHistoryGrid } from '@/components/ConversationsHistoryGrid';
import { GridSkeleton } from '@/components/placeholders/GridSkeleton';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function HomePage() {
  const { t } = useTranslation(['generic', 'error']);

  return (
    <SlideUpTransition motionKey="home">
      <div className="flex size-full flex-col items-center justify-between p-24">
        <div className="text-foreground">{t('kaas')}</div>
        <div>{t('error:test')}</div>
        <div>
          <Link to="/models">Go to Models page</Link>
        </div>
        <Button>Primary</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="destructive">Destructive</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="ghost">Ghost</Button>
        <Suspense fallback={<GridSkeleton />}>
          <ConversationHistoryGrid />
        </Suspense>
        <div className="bg-muted p-10 text-muted-foreground">
          Muted foreground on background
        </div>
        <div className="bg-background text-foreground">
          <h2>Foreground</h2>
          <Card className="w-[350px]">
            <CardHeader>
              <CardTitle>Create project</CardTitle>
              <CardDescription>
                Deploy your new project in one-click.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form>
                <div className="grid w-full items-center gap-4">
                  <div className="flex flex-col space-y-1.5">
                    <Label htmlFor="name">Name</Label>
                    <Input id="name" placeholder="Name of your project" />
                  </div>
                  <div className="flex flex-col space-y-1.5">
                    <Label htmlFor="framework">Framework</Label>
                    <Select>
                      <SelectTrigger id="framework">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent position="popper">
                        <SelectItem value="next">Next.js</SelectItem>
                        <SelectItem value="sveltekit">SvelteKit</SelectItem>
                        <SelectItem value="astro">Astro</SelectItem>
                        <SelectItem value="nuxt">Nuxt.js</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </form>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline">Cancel</Button>
              <Button>Deploy</Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </SlideUpTransition>
  );
}
