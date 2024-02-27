type Props = {
  title: string;
};

export function TitleBar({ title }: Props) {
  return (
    <div className="box-border flex h-16 items-center justify-center border-b border-gray-300 bg-white">
      <h1 className="h-fit text-lg font-semibold">{title}</h1>
    </div>
  );
}
