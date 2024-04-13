type Props = {
  title: string;
};

export function TitleBar({ title }: Props) {
  return (
    <div className="box-border flex h-16 w-full items-center justify-center border-b border-border bg-white">
      <h1 className="h-fit text-lg font-semibold">{title}</h1>
    </div>
  );
}
