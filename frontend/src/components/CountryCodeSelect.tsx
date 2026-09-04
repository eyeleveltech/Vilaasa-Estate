import * as React from "react";
import { Check, ChevronDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
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
  className?: string;
}

export function CountryCodeSelect({ value, onChange, className }: Props) {
  const [open, setOpen] = React.useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen} modal={true}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          className={cn(
            "w-[84px] shrink-0 sm:w-[96px] justify-between h-9 sm:h-10 px-2 sm:px-3 text-xs sm:text-sm font-normal normal-case tracking-normal bg-secondary/50 hover:bg-secondary/70 border-input text-foreground",
            className,
          )}
        >
          <span className="truncate">{value}</span>
          <ChevronDown className="h-4 w-4 opacity-50 shrink-0" />
        </Button>
      </PopoverTrigger>

      {/* align="start" anchors the list to the trigger's left edge. The
          default "center" centres a 300px list on an 80px button, so it
          spilled ~110px past the dialog on each side. */}
      <PopoverContent
        align="start"
        collisionPadding={12}
        className="w-[300px] max-w-[calc(100vw-2rem)] p-0"
        onWheel={(e) => e.stopPropagation()}
      >
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
          <CommandList className="h-[260px] max-h-[260px] overflow-y-auto overscroll-contain">
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
