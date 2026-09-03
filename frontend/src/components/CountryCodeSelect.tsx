import * as React from "react";
import { Check, ChevronDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import CountryCodes from "../assets/CountryCodes.json";

interface Country {
  name: string;
  code: string;
  dial_code: string;
  flag?: string;
}
interface Props {
  value: string; // dial code only
  onChange: (dialCode: string) => void;
}

export function CountryCodeSelect({ value, onChange }: Props) {
  const [open, setOpen] = React.useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          className="w-[80px] shrink-0 sm:w-[140px] justify-between h-full px-2 sm:px-4"
        >
          {/* {value ? (
              <span className="flex items-center gap-2">
                <span>{value.flag}</span>
                <span>{value.dial_code}</span>
              </span>
            ) : (
              "Country"
            )} */}
          <span className="truncate">{value}</span>
          <ChevronDown className="h-4 w-4 opacity-50 shrink-0" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-[300px] p-0">
        <Command
          filter={(value, search, keywords = []) => {
            const term = search.toLowerCase();
            return value.toLowerCase().includes(term) ||
              keywords.some((k) => k.includes(term))
              ? 1
              : 0;
          }}
        >
          <CommandInput placeholder="Search country..." />
          <CommandList className="h-[260px]">
            <CommandEmpty>No country found.</CommandEmpty>
            <CommandGroup>
              {CountryCodes.map((country) => (
                <CommandItem
                  key={country.code}
                  value={country.name}
                  keywords={[
                    country.name.toLowerCase(),
                    country.code.toLowerCase(),
                    country.dial_code,
                  ]}
                  onSelect={() => {
                    onChange(country.dial_code);
                    setOpen(false);
                  }}
                >
                  <span className="mr-2">{country.name}</span>
                  <span className="flex-1">{country.code}</span>
                  <span className="text-muted-foreground">
                    {country.dial_code}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
