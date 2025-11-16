import { Input } from "@/components/ui/input";
import { useDebouncedValue } from "@/hooks/use-debounced-value";

type StopSearchInputProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

export const StopSearchInput = ({
  value,
  onChange,
  placeholder = "Buscar estación...",
}: StopSearchInputProps) => {
  const debouncedValue = useDebouncedValue(value, 300);

  return (
    <Input
      type="text"
      value={debouncedValue}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full"
    />
  );
};
