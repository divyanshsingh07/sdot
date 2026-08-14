"use client";

import { useEffect, useRef, useState } from "react";
import { format, isValid, parseISO, startOfToday } from "date-fns";
import { CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { type DayButton } from "react-day-picker";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

type StartDatePickerProps = {
  id: string;
  value: string;
  onChange: (value: string) => void;
  invalid?: boolean;
};

const triggerClass =
  "flex h-11 w-full min-w-0 cursor-pointer items-center justify-between rounded-[3px] border border-input bg-card px-3 text-left text-[16px] shadow-[inset_0_1px_0_rgb(30_27_22/0.04)] transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 min-[560px]:text-[14.5px]";

const navButtonClass =
  "inline-flex size-8 shrink-0 items-center justify-center rounded-[3px] text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-40";

function StartDateDayButton({
  day,
  modifiers,
  className: _className,
  children,
  ...props
}: React.ComponentProps<typeof DayButton>) {
  const ref = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (modifiers.focused) ref.current?.focus();
  }, [modifiers.focused]);

  return (
    <button
      ref={ref}
      type="button"
      {...props}
      className={cn(
        "inline-flex size-9 items-center justify-center rounded-[3px] text-[13px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-1",
        modifiers.selected &&
          "bg-primary font-semibold text-primary-foreground hover:bg-primary/90",
        !modifiers.selected &&
          modifiers.today &&
          "bg-accent/15 font-semibold text-foreground",
        !modifiers.selected &&
          !modifiers.today &&
          !modifiers.disabled &&
          "text-foreground hover:bg-muted/80",
        modifiers.disabled &&
          "cursor-not-allowed text-muted-foreground hover:bg-transparent",
        modifiers.outside && "text-muted-foreground/70",
      )}
    >
      {children ?? day.date.getDate()}
    </button>
  );
}

function PreviousMonthButton({
  className,
  ...props
}: React.ComponentProps<"button">) {
  return (
    <button
      type="button"
      aria-label="Previous month"
      className={cn(navButtonClass, className)}
      {...props}
    >
      <ChevronLeft className="size-4" aria-hidden />
    </button>
  );
}

function NextMonthButton({
  className,
  ...props
}: React.ComponentProps<"button">) {
  return (
    <button
      type="button"
      aria-label="Next month"
      className={cn(navButtonClass, className)}
      {...props}
    >
      <ChevronRight className="size-4" aria-hidden />
    </button>
  );
}

export function StartDatePicker({
  id,
  value,
  onChange,
  invalid,
}: StartDatePickerProps) {
  const [open, setOpen] = useState(false);
  const selected = value ? parseISO(value) : undefined;
  const label =
    selected && isValid(selected)
      ? format(selected, "dd/MM/yyyy")
      : "dd/mm/yyyy";

  function selectDate(date: Date | undefined) {
    if (!date) return;
    onChange(format(date, "yyyy-MM-dd"));
    setOpen(false);
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          id={id}
          aria-invalid={invalid}
          aria-expanded={open}
          aria-haspopup="dialog"
          className={cn(
            triggerClass,
            !value && "text-muted-foreground",
            invalid &&
              "border-destructive ring-3 ring-destructive/20 aria-invalid:border-destructive",
          )}
        >
          <span>{label}</span>
          <CalendarIcon className="size-4 shrink-0 opacity-45" aria-hidden />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        sideOffset={4}
        className="w-[var(--radix-popover-trigger-width)] min-w-[17.5rem] rounded-[3px] border-border bg-card p-0 shadow-md"
      >
        <Calendar
          mode="single"
          selected={selected}
          onSelect={selectDate}
          disabled={{ before: startOfToday() }}
          defaultMonth={selected ?? startOfToday()}
          showOutsideDays={false}
          fixedWeeks
          className="w-full p-3 [--cell-size:2.25rem]"
          classNames={{
            months: "relative w-full",
            month: "flex w-full flex-col gap-3",
            month_caption:
              "relative flex h-9 w-full items-center justify-center px-10 font-heading text-sm font-semibold tracking-tight text-foreground",
            nav: "absolute inset-x-0 top-0 flex w-full items-center justify-between",
            button_previous: "absolute left-0",
            button_next: "absolute right-0",
            weekdays: "grid grid-cols-7",
            weekday:
              "py-1 text-center font-mono text-[10px] font-medium tracking-[0.08em] text-muted-foreground uppercase",
            week: "mt-1 grid grid-cols-7 place-items-center",
            day: "p-0",
            disabled: "opacity-100",
            outside: "opacity-100",
            today: "",
          }}
          components={{
            DayButton: StartDateDayButton,
            PreviousMonthButton,
            NextMonthButton,
            Chevron: () => <></>,
          }}
        />
        <div className="flex items-center justify-between border-t border-border px-3 py-2.5">
          <button
            type="button"
            onClick={() => {
              onChange("");
              setOpen(false);
            }}
            className="font-mono text-[11px] font-medium tracking-[0.06em] text-primary uppercase transition-colors hover:text-accent"
          >
            Clear
          </button>
          <button
            type="button"
            onClick={() => selectDate(startOfToday())}
            className="font-mono text-[11px] font-medium tracking-[0.06em] text-primary uppercase transition-colors hover:text-accent"
          >
            Today
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
