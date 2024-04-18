export function FieldErrorMessage({ message }: { message: string }) {
  return (
    <p className="text-[0.8rem] font-medium text-destructive">{message}</p>
  );
}
