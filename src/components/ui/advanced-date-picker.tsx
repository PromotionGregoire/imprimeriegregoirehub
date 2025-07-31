import * as React from "react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

type ViewMode = 'days' | 'months' | 'years'

interface AdvancedDatePickerProps {
  value?: Date
  onChange?: (date: Date | undefined) => void
  placeholder?: string
  className?: string
  disabled?: boolean
  includeTime?: boolean
}

const monthNames = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
]

const dayNames = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam']

export function AdvancedDatePicker({
  value,
  onChange,
  placeholder = "Sélectionner une date",
  className,
  disabled = false,
  includeTime = false
}: AdvancedDatePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [viewMode, setViewMode] = React.useState<ViewMode>('days')
  const [currentDate, setCurrentDate] = React.useState(value || new Date())
  const [timeInput, setTimeInput] = React.useState(
    value ? format(value, 'HH:mm') : '09:00'
  )

  const currentYear = currentDate.getFullYear()
  const currentMonth = currentDate.getMonth()

  // Navigation functions
  const goToPreviousMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))
  }

  const goToNextMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))
  }

  const goToPreviousYear = () => {
    setCurrentDate(prev => new Date(prev.getFullYear() - 1, prev.getMonth(), 1))
  }

  const goToNextYear = () => {
    setCurrentDate(prev => new Date(prev.getFullYear() + 1, prev.getMonth(), 1))
  }

  const goToPreviousDecade = () => {
    setCurrentDate(prev => new Date(prev.getFullYear() - 10, prev.getMonth(), 1))
  }

  const goToNextDecade = () => {
    setCurrentDate(prev => new Date(prev.getFullYear() + 10, prev.getMonth(), 1))
  }

  // Generate calendar days
  const generateCalendarDays = () => {
    const firstDay = new Date(currentYear, currentMonth, 1)
    const lastDay = new Date(currentYear, currentMonth + 1, 0)
    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - firstDay.getDay())

    const days = []
    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate)
      date.setDate(startDate.getDate() + i)
      days.push(date)
    }
    return days
  }

  // Generate years for year view
  const generateYears = () => {
    const startYear = Math.floor(currentYear / 10) * 10
    const years = []
    for (let i = startYear; i < startYear + 12; i++) {
      years.push(i)
    }
    return years
  }

  const handleDateSelect = (date: Date) => {
    if (includeTime) {
      const [hours, minutes] = timeInput.split(':')
      date.setHours(parseInt(hours), parseInt(minutes))
    }
    onChange?.(date)
    setIsOpen(false)
  }

  const handleMonthSelect = (monthIndex: number) => {
    setCurrentDate(new Date(currentYear, monthIndex, 1))
    setViewMode('days')
  }

  const handleYearSelect = (year: number) => {
    setCurrentDate(new Date(year, currentMonth, 1))
    setViewMode('months')
  }

  const formatDisplayValue = () => {
    if (!value) return placeholder
    if (includeTime) {
      return format(value, 'dd/MM/yyyy HH:mm', { locale: fr })
    }
    return format(value, 'dd/MM/yyyy', { locale: fr })
  }

  const isToday = (date: Date) => {
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  const isSelected = (date: Date) => {
    if (!value) return false
    return date.toDateString() === value.toDateString()
  }

  const isSameMonth = (date: Date) => {
    return date.getMonth() === currentMonth && date.getFullYear() === currentYear
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !value && "text-muted-foreground",
            className
          )}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {formatDisplayValue()}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 pointer-events-auto" align="start">
        <div className="bg-background border rounded-lg shadow-lg">
          {/* Header */}
          <div className="flex items-center justify-between p-3 border-b">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                if (viewMode === 'days') goToPreviousMonth()
                else if (viewMode === 'months') goToPreviousYear()
                else goToPreviousDecade()
              }}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              onClick={() => {
                if (viewMode === 'days') setViewMode('months')
                else if (viewMode === 'months') setViewMode('years')
              }}
              className="hover:bg-muted font-semibold"
            >
              {viewMode === 'days' && `${monthNames[currentMonth]} ${currentYear}`}
              {viewMode === 'months' && currentYear}
              {viewMode === 'years' && `${Math.floor(currentYear / 10) * 10} - ${Math.floor(currentYear / 10) * 10 + 9}`}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                if (viewMode === 'days') goToNextMonth()
                else if (viewMode === 'months') goToNextYear()
                else goToNextDecade()
              }}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Content */}
          <div className="p-3 transition-all duration-200 ease-in-out">
            {viewMode === 'days' && (
              <div className="space-y-2 animate-fade-in">
                {/* Day headers */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {dayNames.map(day => (
                    <div key={day} className="text-center text-sm font-medium text-muted-foreground p-2">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar grid */}
                <div className="grid grid-cols-7 gap-1">
                  {generateCalendarDays().map((date, index) => (
                    <Button
                      key={index}
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDateSelect(date)}
                      className={cn(
                        "h-9 w-9 p-0 font-normal transition-all duration-150 hover:scale-105",
                        !isSameMonth(date) && "text-muted-foreground/50",
                        isSelected(date) && "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground shadow-md",
                        isToday(date) && !isSelected(date) && "bg-accent text-accent-foreground ring-2 ring-primary/20"
                      )}
                    >
                      {date.getDate()}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {viewMode === 'months' && (
              <div className="grid grid-cols-3 gap-2 animate-fade-in">
                {monthNames.map((month, index) => (
                  <Button
                    key={month}
                    variant="ghost"
                    onClick={() => handleMonthSelect(index)}
                    className={cn(
                      "p-3 h-auto transition-all duration-150 hover:scale-105",
                      index === currentMonth && "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground shadow-md"
                    )}
                  >
                    {month}
                  </Button>
                ))}
              </div>
            )}

            {viewMode === 'years' && (
              <div className="grid grid-cols-3 gap-2 animate-fade-in">
                {generateYears().map((year) => (
                  <Button
                    key={year}
                    variant="ghost"
                    onClick={() => handleYearSelect(year)}
                    className={cn(
                      "p-3 h-auto transition-all duration-150 hover:scale-105",
                      year === currentYear && "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground shadow-md"
                    )}
                  >
                    {year}
                  </Button>
                ))}
              </div>
            )}

            {/* Time input */}
            {includeTime && viewMode === 'days' && (
              <div className="mt-3 pt-3 border-t">
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium">Heure:</label>
                  <input
                    type="time"
                    value={timeInput}
                    onChange={(e) => setTimeInput(e.target.value)}
                    className="px-2 py-1 border rounded text-sm bg-background"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}