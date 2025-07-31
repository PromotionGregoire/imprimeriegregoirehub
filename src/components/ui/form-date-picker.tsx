import * as React from "react"
import { ControllerRenderProps, FieldPath, FieldValues } from "react-hook-form"
import { AdvancedDatePicker } from "./advanced-date-picker"
import { FormControl, FormItem, FormLabel, FormMessage } from "./form"

interface FormDatePickerProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> {
  field: ControllerRenderProps<TFieldValues, TName>
  label: string
  placeholder?: string
  includeTime?: boolean
  className?: string
  disabled?: boolean
}

export function FormDatePicker<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
  field,
  label,
  placeholder,
  includeTime = false,
  className,
  disabled = false
}: FormDatePickerProps<TFieldValues, TName>) {
  return (
    <FormItem className={className}>
      <FormLabel>{label}</FormLabel>
      <FormControl>
        <AdvancedDatePicker
          value={field.value}
          onChange={field.onChange}
          placeholder={placeholder}
          includeTime={includeTime}
          disabled={disabled}
        />
      </FormControl>
      <FormMessage />
    </FormItem>
  )
}