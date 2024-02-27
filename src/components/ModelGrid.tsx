import type { Model } from '@/lib/types';

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from './ui/card';
import { Label } from './ui/label';
import { Switch } from './ui/switch';

function ModelGridItem({ model }: { model: Model }) {
  return (
    <Card className="min-h-32 border-2 border-slate-900 shadow-none">
      <CardHeader className="pb-2">
        <CardTitle className="mx-auto">Microsoft Azure</CardTitle>
      </CardHeader>
      <CardContent className="pb-2">
        <p className="text-center">{model.deploymentId}</p>
      </CardContent>
      <CardFooter>
        <div className="mx-auto flex items-center space-x-2">
          <Switch id="airplane-mode" />
          <Label htmlFor="airplane-mode" className="font-medium">
            Default
          </Label>
        </div>
      </CardFooter>
    </Card>
  );
}

export function ModelGrid({ models }: { models: Model[] }) {
  return (
    <div className="mt-6 grid grid-cols-4 gap-5">
      {models.map((model) => {
        return <ModelGridItem model={model} />;
      })}
    </div>
  );
}
