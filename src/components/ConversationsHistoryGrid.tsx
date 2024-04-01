import { useSuspenseQuery } from '@tanstack/react-query';

export function ConversationHistoryGrid() {
  const { data } = useSuspenseQuery({
    queryKey: ['grid-data'],
    queryFn: async (): Promise<string> => {
      return new Promise((resolve) => {
        setTimeout(() => {
          console.log('Timeout!');
          resolve('Some awesome data!');
        }, 3000);
      });
    },
  });

  return <div>{data}</div>;
}
