import {advanceTo, clear} from 'jest-date-mock'
import {renderHook, act} from 'react-hooks-testing-library'
import {isEqual, format, isSameDay} from 'date-fns'
import {
  getCurrentYearMonthAndDate,
  getDateMonthAndYear,
  getInitialMonths,
  isDateSelected,
  isFirstOrLastSelectedDate,
  isDateBlocked,
  getInputValue,
  getNextActiveMonth,
  useDatepicker,
  canSelectRange,
  isDateHovered,
  START_DATE,
  END_DATE,
} from '.'

describe('useDatepicker', () => {
  test('should return initial values', () => {
    advanceTo(new Date(2019, 2, 27, 0, 0, 0))
    const {result} = renderHook(() =>
      useDatepicker({
        startDate: null,
        endDate: null,
        focusedInput: null,
        onDateChange: jest.fn(),
      }),
    )
    expect(result.current.numberOfMonths).toBe(2)
    expect(result.current.firstDayOfWeek).toBe(1)

    // Check active months
    expect(result.current.activeMonths[0].year).toBe(2019)
    expect(result.current.activeMonths[0].month).toBe(2)
    expect(result.current.activeMonths[1].year).toBe(2019)
    expect(result.current.activeMonths[1].month).toBe(3)

    // next 2 months
    act(() => {
      result.current.goToNextMonths()
    })
    expect(result.current.activeMonths[0].year).toBe(2019)
    expect(result.current.activeMonths[0].month).toBe(4)
    expect(result.current.activeMonths[1].year).toBe(2019)
    expect(result.current.activeMonths[1].month).toBe(5)

    // prev 2 months
    act(() => {
      result.current.goToPreviousMonths()
    })
    expect(result.current.activeMonths[0].year).toBe(2019)
    expect(result.current.activeMonths[0].month).toBe(2)
    expect(result.current.activeMonths[1].year).toBe(2019)
    expect(result.current.activeMonths[1].month).toBe(3)

    clear()
  })

  test('should have one month', () => {
    advanceTo(new Date(2019, 2, 27, 0, 0, 0))
    const {result} = renderHook(() =>
      useDatepicker({
        startDate: null,
        endDate: null,
        focusedInput: null,
        onDateChange: jest.fn(),
        numberOfMonths: 1,
        firstDayOfWeek: 0,
      }),
    )
    expect(result.current.numberOfMonths).toBe(1)
    expect(result.current.firstDayOfWeek).toBe(0)

    // Check active months
    expect(result.current.activeMonths[0].year).toBe(2019)
    expect(result.current.activeMonths[0].month).toBe(2)

    // next month
    act(() => {
      result.current.goToNextMonths()
    })
    expect(result.current.activeMonths[0].year).toBe(2019)
    expect(result.current.activeMonths[0].month).toBe(3)

    // prev month
    act(() => {
      result.current.goToPreviousMonths()
    })
    expect(result.current.activeMonths[0].year).toBe(2019)
    expect(result.current.activeMonths[0].month).toBe(2)

    clear()
  })

  test('should reset date', () => {
    const onDateChange = jest.fn()
    advanceTo(new Date(2019, 2, 27, 0, 0, 0))
    const {result} = renderHook(() =>
      useDatepicker({
        startDate: new Date(2019, 2, 27, 0, 0, 0),
        endDate: new Date(2019, 3, 27, 0, 0, 0),
        focusedInput: null,
        onDateChange: onDateChange,
      }),
    )

    act(() => {
      result.current.onResetDates()
    })
    expect(onDateChange).toBeCalledWith({
      startDate: null,
      endDate: null,
      focusedInput: START_DATE,
    })
    clear()
  })

  test('should select start date', () => {
    const onDateChange = jest.fn()
    advanceTo(new Date(2019, 2, 27, 0, 0, 0))
    const {result} = renderHook(() =>
      useDatepicker({
        startDate: null,
        endDate: null,
        focusedInput: START_DATE,
        onDateChange: onDateChange,
      }),
    )

    act(() => {
      result.current.onDaySelect(new Date(2019, 3, 1, 0, 0, 0))
    })
    expect(onDateChange).toBeCalledWith({
      startDate: new Date(2019, 3, 1, 0, 0, 0),
      endDate: null,
      focusedInput: END_DATE,
    })
    clear()
  })

  test('should select end date', () => {
    const onDateChange = jest.fn()
    advanceTo(new Date(2019, 2, 27, 0, 0, 0))
    const {result} = renderHook(() =>
      useDatepicker({
        startDate: new Date(2019, 3, 1, 0, 0, 0),
        endDate: null,
        focusedInput: END_DATE,
        onDateChange: onDateChange,
      }),
    )

    act(() => {
      result.current.onDaySelect(new Date(2019, 3, 2, 0, 0, 0))
    })
    expect(onDateChange).toBeCalledWith({
      startDate: new Date(2019, 3, 1, 0, 0, 0),
      endDate: new Date(2019, 3, 2, 0, 0, 0),
      focusedInput: null,
    })
    clear()
  })

  test('should select start date (reset date, because end date was before start date)', () => {
    const onDateChange = jest.fn()
    advanceTo(new Date(2019, 2, 27, 0, 0, 0))
    const {result} = renderHook(() =>
      useDatepicker({
        startDate: new Date(2019, 3, 1, 0, 0, 0),
        endDate: new Date(2019, 3, 2, 0, 0, 0),
        focusedInput: END_DATE,
        onDateChange: onDateChange,
      }),
    )

    act(() => {
      result.current.onDaySelect(new Date(2019, 2, 27, 0, 0, 0))
    })
    expect(onDateChange).toBeCalledWith({
      startDate: new Date(2019, 2, 27, 0, 0, 0),
      endDate: null,
      focusedInput: END_DATE,
    })
    clear()
  })

  test('should select start date (reset date, because start date was after end date)', () => {
    const onDateChange = jest.fn()
    advanceTo(new Date(2019, 2, 27, 0, 0, 0))
    const {result} = renderHook(() =>
      useDatepicker({
        startDate: new Date(2019, 3, 1, 0, 0, 0),
        endDate: new Date(2019, 3, 2, 0, 0, 0),
        focusedInput: START_DATE,
        onDateChange: onDateChange,
      }),
    )

    act(() => {
      result.current.onDaySelect(new Date(2019, 3, 27, 0, 0, 0))
    })
    expect(onDateChange).toBeCalledWith({
      startDate: new Date(2019, 3, 27, 0, 0, 0),
      endDate: null,
      focusedInput: END_DATE,
    })
    clear()
  })

  test('should check if date is blocked', () => {
    const onDateChange = jest.fn()
    advanceTo(new Date(2019, 2, 27, 0, 0, 0))
    const {result} = renderHook(() =>
      useDatepicker({
        startDate: new Date(2019, 3, 1, 0, 0, 0),
        endDate: new Date(2019, 3, 2, 0, 0, 0),
        minBookingDate: new Date(2019, 3, 1, 0, 0, 0),
        maxBookingDate: new Date(2019, 3, 10, 0, 0, 0),
        focusedInput: START_DATE,
        onDateChange: onDateChange,
      }),
    )

    expect(result.current.isDateBlocked(new Date(2019, 3, 1, 0, 0, 0))).toBe(false)
    expect(result.current.isDateBlocked(new Date(2019, 3, 10, 0, 0, 0))).toBe(false)
    expect(result.current.isDateBlocked(new Date(2019, 3, 11, 0, 0, 0))).toBe(true)
    expect(result.current.isDateBlocked(new Date(2019, 2, 27, 0, 0, 0))).toBe(true)
    clear()
  })

  test('should check if date is selected', () => {
    const onDateChange = jest.fn()
    advanceTo(new Date(2019, 2, 27, 0, 0, 0))
    const {result} = renderHook(() =>
      useDatepicker({
        startDate: new Date(2019, 3, 1, 0, 0, 0),
        endDate: new Date(2019, 3, 3, 0, 0, 0),
        minBookingDate: new Date(2019, 3, 1, 0, 0, 0),
        maxBookingDate: new Date(2019, 3, 10, 0, 0, 0),
        focusedInput: START_DATE,
        onDateChange: onDateChange,
      }),
    )

    expect(result.current.isDateSelected(new Date(2019, 3, 1, 0, 0, 0))).toBe(true)
    expect(result.current.isDateSelected(new Date(2019, 3, 2, 0, 0, 0))).toBe(true)
    expect(result.current.isDateSelected(new Date(2019, 3, 3, 0, 0, 0))).toBe(true)
    expect(result.current.isDateSelected(new Date(2019, 3, 11, 0, 0, 0))).toBe(false)
    expect(result.current.isDateSelected(new Date(2019, 2, 27, 0, 0, 0))).toBe(false)
    clear()
  })

  test('should check if date is first or last selected date', () => {
    const onDateChange = jest.fn()
    advanceTo(new Date(2019, 2, 27, 0, 0, 0))
    const {result} = renderHook(() =>
      useDatepicker({
        startDate: new Date(2019, 3, 1, 0, 0, 0),
        endDate: new Date(2019, 3, 3, 0, 0, 0),
        minBookingDate: new Date(2019, 3, 1, 0, 0, 0),
        maxBookingDate: new Date(2019, 3, 10, 0, 0, 0),
        focusedInput: START_DATE,
        onDateChange: onDateChange,
      }),
    )

    expect(result.current.isFirstOrLastSelectedDate(new Date(2019, 3, 1, 0, 0, 0))).toBe(true)
    expect(result.current.isFirstOrLastSelectedDate(new Date(2019, 3, 2, 0, 0, 0))).toBe(false)
    expect(result.current.isFirstOrLastSelectedDate(new Date(2019, 3, 3, 0, 0, 0))).toBe(true)
    expect(result.current.isFirstOrLastSelectedDate(new Date(2019, 3, 11, 0, 0, 0))).toBe(false)
    expect(result.current.isFirstOrLastSelectedDate(new Date(2019, 2, 27, 0, 0, 0))).toBe(false)
    clear()
  })

  test.each([
    {
      startDate: null,
      endDate: null,
      minBookingDate: new Date(2019, 3, 1, 0, 0, 0),
      maxBookingDate: new Date(2019, 3, 28, 0, 0, 0),
      focusedInput: START_DATE,
      minBookingDays: 3,
      isDayBlocked(date: Date): boolean {
        return isSameDay(date, new Date(2019, 3, 5, 0, 0, 0))
      },
    },
    {
      startDate: new Date(2019, 3, 4, 0, 0, 0),
      endDate: null,
      minBookingDate: new Date(2019, 3, 1, 0, 0, 0),
      maxBookingDate: new Date(2019, 3, 28, 0, 0, 0),
      focusedInput: START_DATE,
      minBookingDays: 1,
      isDayBlocked(date: Date): boolean {
        return isSameDay(date, new Date(2019, 3, 4, 0, 0, 0))
      },
    },
  ])('should not select the start date, because includes block date', props => {
    const onDateChange = jest.fn()
    advanceTo(new Date(2019, 2, 27, 0, 0, 0))
    const {result} = renderHook(() =>
      // @ts-ignore
      useDatepicker({
        ...props,
        onDateChange: onDateChange,
      }),
    )

    act(() => {
      result.current.onDaySelect(new Date(2019, 3, 4, 0, 0, 0))
    })
    expect(onDateChange).not.toBeCalled()
    clear()
  })

  test.each([
    {
      startDate: null,
      endDate: null,
      minBookingDate: new Date(2019, 3, 1, 0, 0, 0),
      maxBookingDate: new Date(2019, 3, 28, 0, 0, 0),
      focusedInput: START_DATE,
      minBookingDays: 3,
      isDayBlocked(date: Date): boolean {
        return isSameDay(date, new Date(2019, 3, 5, 0, 0, 0))
      },
      callbackDate: new Date(2019, 3, 1, 0, 0, 0),
      expectedHoveredDate: new Date(2019, 3, 1, 0, 0, 0),
      expected: false,
    },
    {
      startDate: new Date(2019, 3, 2, 0, 0, 0),
      endDate: null,
      minBookingDate: new Date(2019, 3, 1, 0, 0, 0),
      maxBookingDate: new Date(2019, 3, 28, 0, 0, 0),
      focusedInput: START_DATE,
      minBookingDays: 3,
      isDayBlocked(date: Date): boolean {
        return isSameDay(date, new Date(2019, 3, 5, 0, 0, 0))
      },
      callbackDate: new Date(2019, 3, 4, 0, 0, 0),
      expectedHoveredDate: new Date(2019, 3, 3, 0, 0, 0),
      expected: true,
    },
    {
      startDate: new Date(2019, 3, 2, 0, 0, 0),
      endDate: new Date(2019, 3, 4, 0, 0, 0),
      minBookingDate: new Date(2019, 3, 1, 0, 0, 0),
      maxBookingDate: new Date(2019, 3, 28, 0, 0, 0),
      focusedInput: START_DATE,
      minBookingDays: 3,
      isDayBlocked(date: Date): boolean {
        return isSameDay(date, new Date(2019, 3, 5, 0, 0, 0))
      },
      callbackDate: new Date(2019, 3, 4, 0, 0, 0),
      expectedHoveredDate: new Date(2019, 3, 3, 0, 0, 0),
      expected: false,
    },
    {
      startDate: new Date(2019, 3, 2, 0, 0, 0),
      endDate: null,
      minBookingDate: new Date(2019, 3, 1, 0, 0, 0),
      maxBookingDate: new Date(2019, 3, 28, 0, 0, 0),
      focusedInput: START_DATE,
      minBookingDays: 3,
      isDayBlocked(date: Date): boolean {
        return isSameDay(date, new Date(2019, 3, 5, 0, 0, 0))
      },
      callbackDate: new Date(2019, 3, 3, 0, 0, 0),
      expectedHoveredDate: new Date(2019, 3, 3, 0, 0, 0),
      expected: false,
    },
    {
      startDate: new Date(2019, 3, 2, 0, 0, 0),
      endDate: null,
      minBookingDate: new Date(2019, 3, 1, 0, 0, 0),
      maxBookingDate: new Date(2019, 3, 28, 0, 0, 0),
      focusedInput: START_DATE,
      minBookingDays: 3,
      isDayBlocked(date: Date): boolean {
        return isSameDay(date, new Date(2019, 3, 5, 0, 0, 0))
      },
      callbackDate: new Date(2019, 3, 6, 0, 0, 0),
      expectedHoveredDate: new Date(2019, 6, 3, 0, 0, 0),
      expected: false,
    },
    {
      startDate: new Date(2019, 3, 2, 0, 0, 0),
      endDate: null,
      minBookingDate: new Date(2019, 3, 1, 0, 0, 0),
      maxBookingDate: new Date(2019, 3, 28, 0, 0, 0),
      focusedInput: START_DATE,
      minBookingDays: 3,
      isDayBlocked(date: Date): boolean {
        return isSameDay(date, new Date(2019, 3, 5, 0, 0, 0))
      },
      callbackDate: new Date(2019, 3, 4, 0, 0, 0),
      expectedHoveredDate: new Date(2019, 3, 4, 0, 0, 0),
      expected: true,
    },
    {
      startDate: new Date(2019, 3, 2, 0, 0, 0),
      endDate: null,
      minBookingDate: new Date(2019, 3, 1, 0, 0, 0),
      maxBookingDate: new Date(2019, 3, 28, 0, 0, 0),
      focusedInput: START_DATE,
      minBookingDays: 3,
      isDayBlocked(date: Date): boolean {
        return isSameDay(date, new Date(2019, 3, 5, 0, 0, 0))
      },
      callbackDate: new Date(2019, 4, 4, 0, 0, 0),
      expectedHoveredDate: new Date(2019, 3, 4, 0, 0, 0),
      expected: false,
    },
  ])('should hover date', props => {
    advanceTo(new Date(2019, 2, 27, 0, 0, 0))
    const {result} = renderHook(() =>
      // @ts-ignore
      useDatepicker({
        ...props,
        onDateChange: jest.fn(),
      }),
    )

    act(() => {
      result.current.onDayHover(props.callbackDate)
    })
    expect(result.current.isDateHovered(props.expectedHoveredDate)).toBe(props.expected)
    clear()
  })

  test('should selects tart date and reset end date (blocked day)', () => {
    const onDateChange = jest.fn()
    advanceTo(new Date(2019, 2, 27, 0, 0, 0))
    const {result} = renderHook(() =>
      useDatepicker({
        startDate: new Date(2019, 3, 5, 0, 0, 0),
        endDate: new Date(2019, 3, 8, 0, 0, 0),
        focusedInput: START_DATE,
        onDateChange: onDateChange,
        isDayBlocked(date: Date): boolean {
          return isSameDay(date, new Date(2019, 3, 4, 0, 0, 0))
        },
      }),
    )

    act(() => {
      result.current.onDaySelect(new Date(2019, 3, 1, 0, 0, 0))
    })
    expect(onDateChange).toBeCalledWith({
      startDate: new Date(2019, 3, 1, 0, 0, 0),
      endDate: null,
      focusedInput: END_DATE,
    })
    clear()
  })
})

describe('getCurrentYearMonthAndDate', () => {
  test('should return current year and month', () => {
    advanceTo(new Date(2019, 2, 27, 0, 0, 0))
    expect(getCurrentYearMonthAndDate().year).toEqual(2019)
    expect(getCurrentYearMonthAndDate().month).toEqual(2)
    clear()
  })
})

describe('getDateMonthAndYear', () => {
  test('should return year and month', () => {
    const date = new Date(2019, 2, 27, 0, 0, 0)
    expect(getDateMonthAndYear(date).year).toEqual(2019)
    expect(getDateMonthAndYear(date).month).toEqual(2)
  })
})

describe('getNextActiveMonth', () => {
  test('get next 2 months', () => {
    advanceTo(new Date(2019, 2, 27, 0, 0, 0))
    const months = getInitialMonths(2, null)
    const nextMonths = getNextActiveMonth(months, 2, 1)
    expect(nextMonths.length).toBe(2)
    expect(nextMonths[0].year).toEqual(2019)
    expect(nextMonths[0].month).toEqual(4)
    expect(nextMonths[1].year).toEqual(2019)
    expect(nextMonths[1].month).toEqual(5)
    clear()
  })

  test('get past 2 months', () => {
    advanceTo(new Date(2019, 2, 27, 0, 0, 0))
    const months = getInitialMonths(2, null)
    const nextMonths = getNextActiveMonth(months, 2, -1)
    expect(nextMonths.length).toBe(2)
    expect(nextMonths[0].year).toEqual(2019)
    expect(nextMonths[0].month).toEqual(0)
    expect(nextMonths[1].year).toEqual(2019)
    expect(nextMonths[1].month).toEqual(1)
    clear()
  })
})

describe('getInitialMonths', () => {
  test('should return 2 months', () => {
    advanceTo(new Date(2019, 2, 27, 0, 0, 0))
    const months = getInitialMonths(2, null)
    expect(months.length).toBe(2)
    expect(months[0].year).toEqual(2019)
    expect(months[0].month).toEqual(2)
    expect(months[1].year).toEqual(2019)
    expect(months[1].month).toEqual(3)
    clear()
  })

  test('should return 2 months (june and july)', () => {
    advanceTo(new Date(2019, 2, 27, 0, 0, 0))
    const months = getInitialMonths(2, new Date(2019, 5, 25))
    expect(months.length).toBe(2)
    expect(months[0].year).toEqual(2019)
    expect(months[0].month).toEqual(5)
    expect(months[1].year).toEqual(2019)
    expect(months[1].month).toEqual(6)
    clear()
  })

  test('should return 1 month', () => {
    advanceTo(new Date(2019, 2, 27, 0, 0, 0))
    const months = getInitialMonths(1, null)
    expect(months.length).toBe(1)
    expect(months[0].year).toEqual(2019)
    expect(months[0].month).toEqual(2)
    clear()
  })
})

const startDate = new Date(2019, 2, 20, 0, 0, 0)
const endDate = new Date(2019, 2, 27, 0, 0, 0)

describe('isDateSelected', () => {
  test('should return true, because date is selected', () => {
    expect(isDateSelected(startDate, startDate, endDate)).toBe(true)
    expect(isDateSelected(endDate, startDate, endDate)).toBe(true)
    expect(isDateSelected(new Date(2019, 2, 26, 0, 0, 0), startDate, endDate)).toBe(true)
  })

  test('should return false, because date is not selected', () => {
    expect(isDateSelected(new Date(2019, 2, 19, 0, 0, 0), startDate, endDate)).toBe(false)
    expect(isDateSelected(new Date(2019, 2, 28, 0, 0, 0), startDate, endDate)).toBe(false)
    expect(isDateSelected(new Date(2019, 2, 28, 0, 0, 0), null, null)).toBe(false)
  })
})

describe('isFirstOrLastSelectedDate', () => {
  test('should be start or end date', () => {
    expect(isFirstOrLastSelectedDate(new Date(2019, 2, 20), startDate, endDate)).toBe(true)
    expect(isFirstOrLastSelectedDate(new Date(2019, 2, 27), startDate, endDate)).toBe(true)
  })

  test('should not be start or end date', () => {
    expect(isFirstOrLastSelectedDate(new Date(2019, 2, 21), startDate, endDate)).toBe(false)
  })
})

describe('isDateBlocked', () => {
  const minBookingDate = new Date(2019, 2, 10, 1, 0, 0)
  const maxBookingDate = new Date(2019, 2, 27, 1, 0, 0)
  const equalDate = new Date(2019, 2, 25, 0, 0, 0)

  test('should be blocked', () => {
    function isDayBlockedFn(date: Date) {
      return isEqual(date, equalDate)
    }

    expect(
      isDateBlocked({
        startDate: null,
        endDate: null,
        date: new Date(2019, 2, 9, 0, 0, 0),
        minBookingDate,
        maxBookingDate,
      }),
    ).toBe(true)
    expect(
      isDateBlocked({
        startDate: null,
        endDate: null,
        date: new Date(2019, 2, 28, 0, 0, 0),
        minBookingDate,
        maxBookingDate,
      }),
    ).toBe(true)
    expect(
      isDateBlocked({
        startDate: null,
        endDate: null,
        date: new Date(2019, 2, 25, 0, 0, 0),
        minBookingDate,
        maxBookingDate,
        isDayBlockedFn,
      }),
    ).toBe(true)
    expect(
      isDateBlocked({
        startDate: new Date(2019, 2, 20, 0, 0, 0),
        endDate: null,
        minBookingDays: 3,
        maxBookingDate: new Date(2019, 2, 26, 0, 0, 0),
        date: new Date(2019, 2, 21, 0, 0, 0),
        minBookingDate,
      }),
    ).toBe(true)
    expect(
      isDateBlocked({
        startDate: new Date(2019, 2, 20, 0, 0, 0),
        endDate: null,
        minBookingDays: 2,
        maxBookingDate: new Date(2019, 2, 26, 0, 0, 0),
        date: new Date(2019, 2, 20, 0, 0, 0),
        minBookingDate,
      }),
    ).toBe(true)
  })

  test('should not be blocked', () => {
    function isDayBlockedFn(date: Date) {
      return isEqual(date, equalDate)
    }

    expect(
      isDateBlocked({
        startDate: null,
        endDate: null,
        date: new Date(2019, 2, 10, 0, 0, 0),
        minBookingDate,
        maxBookingDate,
      }),
    ).toBe(false)
    expect(
      isDateBlocked({startDate: null, endDate: null, date: new Date(2019, 2, 10, 0, 0, 0)}),
    ).toBe(false)
    expect(
      isDateBlocked({
        startDate: null,
        endDate: null,
        date: new Date(2019, 2, 27, 0, 0, 0),
        minBookingDate,
        maxBookingDate,
      }),
    ).toBe(false)
    expect(
      isDateBlocked({
        startDate: null,
        endDate: null,
        date: new Date(2019, 2, 26, 0, 0, 0),
        minBookingDate,
        maxBookingDate,
        isDayBlockedFn,
      }),
    ).toBe(false)
    expect(
      isDateBlocked({
        startDate: null,
        endDate: null,
        minBookingDays: 2,
        maxBookingDate: new Date(2019, 2, 27, 0, 0, 0),
        date: new Date(2019, 2, 25, 0, 0, 0),
        minBookingDate,
      }),
    ).toBe(false)
    expect(
      isDateBlocked({
        startDate: new Date(2019, 2, 20, 0, 0, 0),
        endDate: null,
        minBookingDays: 3,
        maxBookingDate: new Date(2019, 2, 26, 0, 0, 0),
        date: new Date(2019, 2, 22, 0, 0, 0),
        minBookingDate,
      }),
    ).toBe(false)
    expect(
      isDateBlocked({
        startDate: new Date(2019, 2, 25, 0, 0, 0),
        endDate: null,
        minBookingDays: 2,
        maxBookingDate: new Date(2019, 2, 26, 0, 0, 0),
        date: new Date(2019, 2, 26, 0, 0, 0),
        minBookingDate,
      }),
    ).toBe(false)
    expect(
      isDateBlocked({
        startDate: new Date(2019, 2, 20, 0, 0, 0),
        endDate: null,
        minBookingDays: 3,
        maxBookingDate: new Date(2019, 2, 26, 0, 0, 0),
        date: new Date(2019, 2, 22, 0, 0, 0),
        minBookingDate,
      }),
    ).toBe(false)
  })
})

describe('getInputValue', () => {
  test('should return formatted value', () => {
    const date = new Date(2019, 2, 10, 0, 0, 0)
    expect(getInputValue(date, 'DD/MM/YYYY', 'default value')).toBe('10/03/2019')
    expect(getInputValue(date, (date: Date) => format(date, 'YYYY'), 'default value')).toBe('2019')
  })
  test('should return default value', () => {
    expect(getInputValue(null, 'DD/MM/YYYY', 'default value')).toBe('default value')
  })
})

describe('canSelectRange', () => {
  test.each([
    {
      startDate: new Date(2019, 2, 10, 0, 0, 0),
      endDate: null,
      minBookingDays: 3,
      isDateBlocked: (date: Date) => isSameDay(date, new Date(2019, 2, 11, 0, 0, 0)),
      expected: false,
    },
    {
      startDate: new Date(2019, 2, 10, 0, 0, 0),
      endDate: null,
      minBookingDays: 1,
      isDateBlocked: (date: Date) => isSameDay(date, new Date(2019, 2, 11, 0, 0, 0)),
      expected: true,
    },
    {
      startDate: new Date(2019, 2, 11, 0, 0, 0),
      endDate: null,
      minBookingDays: 1,
      isDateBlocked: (date: Date) => isSameDay(date, new Date(2019, 2, 11, 0, 0, 0)),
      expected: false,
    },
    {
      startDate: new Date(2019, 2, 10, 0, 0, 0),
      endDate: new Date(2019, 2, 12, 0, 0, 0),
      minBookingDays: 3,
      isDateBlocked: (date: Date) => isSameDay(date, new Date(2019, 2, 13, 0, 0, 0)),
      expected: true,
    },
    {
      startDate: new Date(2019, 2, 10, 0, 0, 0),
      endDate: new Date(2019, 2, 12, 0, 0, 0),
      minBookingDays: 3,
      isDateBlocked: (date: Date) => isSameDay(date, new Date(2019, 2, 12, 0, 0, 0)),
      expected: false,
    },
    {
      startDate: new Date(2019, 2, 10, 0, 0, 0),
      endDate: new Date(2019, 2, 11, 0, 0, 0),
      minBookingDays: 3,
      isDateBlocked: (date: Date) => isSameDay(date, new Date(2019, 2, 12, 0, 0, 0)),
      expected: false,
    },
    {
      startDate: new Date(2019, 2, 10, 0, 0, 0),
      endDate: new Date(2019, 2, 12, 0, 0, 0),
      minBookingDays: 1,
      isDateBlocked: (date: Date) => isSameDay(date, new Date(2019, 2, 13, 0, 0, 0)),
      expected: true,
    },
    {
      startDate: new Date(2019, 2, 10, 0, 0, 0),
      endDate: null,
      minBookingDays: 3,
      isDateBlocked: (date: Date) => isSameDay(date, new Date(2019, 2, 13, 0, 0, 0)),
      expected: true,
    },
  ])(
    'returns true when we can select the range',
    ({startDate, endDate, minBookingDays, isDateBlocked, expected}) => {
      expect(canSelectRange({startDate, endDate, minBookingDays, isDateBlocked})).toBe(expected)
    },
  )
})

describe('isDateHovered', () => {
  test.each([
    {
      startDate: new Date(2019, 2, 10, 0, 0, 0),
      endDate: null,
      hoveredDate: null,
      date: new Date(2019, 2, 10, 0, 0, 0),
      isDateBlocked: (date: Date) => isSameDay(date, new Date(2019, 2, 11, 0, 0, 0)),
      minBookingDays: 1,
      exactMinBookingDays: false,
      expected: false,
    },
    {
      startDate: new Date(2019, 2, 10, 0, 0, 0),
      endDate: new Date(2019, 2, 11, 0, 0, 0),
      hoveredDate: null,
      date: new Date(2019, 2, 10, 0, 0, 0),
      isDateBlocked: (date: Date) => isSameDay(date, new Date(2019, 2, 11, 0, 0, 0)),
      minBookingDays: 1,
      exactMinBookingDays: false,
      expected: false,
    },
    {
      startDate: new Date(2019, 2, 10, 0, 0, 0),
      endDate: new Date(2019, 2, 11, 0, 0, 0),
      hoveredDate: null,
      date: new Date(2019, 2, 11, 0, 0, 0),
      isDateBlocked: (date: Date) => isSameDay(date, new Date(2019, 2, 11, 0, 0, 0)),
      minBookingDays: 1,
      exactMinBookingDays: false,
      expected: false,
    },
    {
      startDate: new Date(2019, 2, 10, 0, 0, 0),
      endDate: new Date(2019, 2, 11, 0, 0, 0),
      hoveredDate: new Date(2019, 2, 11, 0, 0, 0),
      date: new Date(2019, 2, 11, 0, 0, 0),
      isDateBlocked: (date: Date) => isSameDay(date, new Date(2019, 2, 11, 0, 0, 0)),
      minBookingDays: 1,
      exactMinBookingDays: false,
      expected: false,
    },
    {
      startDate: new Date(2019, 2, 10, 0, 0, 0),
      endDate: null,
      hoveredDate: new Date(2019, 2, 11, 0, 0, 0),
      date: new Date(2019, 2, 11, 0, 0, 0),
      isDateBlocked: (date: Date) => isSameDay(date, new Date(2019, 2, 11, 0, 0, 0)),
      minBookingDays: 1,
      exactMinBookingDays: false,
      expected: false,
    },
    {
      startDate: new Date(2019, 2, 10, 0, 0, 0),
      endDate: null,
      hoveredDate: new Date(2019, 2, 12, 0, 0, 0),
      date: new Date(2019, 2, 12, 0, 0, 0),
      isDateBlocked: (date: Date) => isSameDay(date, new Date(2019, 2, 13, 0, 0, 0)),
      minBookingDays: 1,
      exactMinBookingDays: false,
      expected: true,
    },
    {
      startDate: new Date(2019, 2, 10, 0, 0, 0),
      endDate: null,
      hoveredDate: new Date(2019, 1, 12, 0, 0, 0),
      date: new Date(2019, 1, 11, 0, 0, 0),
      isDateBlocked: (date: Date) => isSameDay(date, new Date(2019, 2, 13, 0, 0, 0)),
      minBookingDays: 1,
      exactMinBookingDays: false,
      expected: false,
    },
    {
      startDate: new Date(2019, 2, 10, 0, 0, 0),
      endDate: null,
      hoveredDate: new Date(2019, 2, 13, 0, 0, 0),
      date: new Date(2019, 2, 11, 0, 0, 0),
      isDateBlocked: (date: Date) => isSameDay(date, new Date(2019, 2, 12, 0, 0, 0)),
      minBookingDays: 1,
      exactMinBookingDays: false,
      expected: false,
    },
    {
      startDate: new Date(2019, 2, 10, 0, 0, 0),
      endDate: null,
      hoveredDate: new Date(2019, 2, 10, 0, 0, 0),
      date: new Date(2019, 2, 11, 0, 0, 0),
      isDateBlocked: (date: Date) => isSameDay(date, new Date(2019, 2, 13, 0, 0, 0)),
      minBookingDays: 3,
      exactMinBookingDays: false,
      expected: true,
    },
    {
      startDate: new Date(2019, 2, 10, 0, 0, 0),
      endDate: null,
      hoveredDate: new Date(2019, 2, 10, 0, 0, 0),
      date: new Date(2019, 2, 12, 0, 0, 0),
      isDateBlocked: (date: Date) => isSameDay(date, new Date(2019, 2, 13, 0, 0, 0)),
      minBookingDays: 3,
      exactMinBookingDays: false,
      expected: true,
    },
    {
      startDate: new Date(2019, 2, 10, 0, 0, 0),
      endDate: null,
      hoveredDate: new Date(2019, 2, 10, 0, 0, 0),
      date: new Date(2019, 2, 10, 0, 0, 0),
      isDateBlocked: (date: Date) => isSameDay(date, new Date(2019, 2, 13, 0, 0, 0)),
      minBookingDays: 3,
      exactMinBookingDays: false,
      expected: true,
    },
    {
      startDate: new Date(2019, 2, 10, 0, 0, 0),
      endDate: null,
      hoveredDate: new Date(2019, 2, 10, 0, 0, 0),
      date: new Date(2019, 2, 10, 0, 0, 0),
      isDateBlocked: (date: Date) => isSameDay(date, new Date(2019, 2, 11, 0, 0, 0)),
      minBookingDays: 3,
      exactMinBookingDays: false,
      expected: false,
    },
  ])(
    'returns true when we can select the range',
    ({
      startDate,
      endDate,
      hoveredDate,
      isDateBlocked,
      date,
      expected,
      exactMinBookingDays,
      minBookingDays,
    }) => {
      expect(
        isDateHovered({
          startDate,
          endDate,
          hoveredDate,
          date,
          isDateBlocked,
          exactMinBookingDays,
          minBookingDays,
        }),
      ).toBe(expected)
    },
  )
})