import React, {useRef, useEffect} from 'react'
import styled from 'styled-components'
import {
  opacity,
  OpacityProps,
  background,
  BackgroundProps,
  border,
  BorderProps,
  borderRadius,
  BorderRadiusProps,
  color,
  ColorProps,
} from 'styled-system'
import {
  UseDatepickerProps,
  START_DATE,
  FormatFunction,
  getInputValue,
  END_DATE,
  FocusedInput,
} from '@datepicker-react/hooks'
import {dateRangeInputPhrases, DateRangeInputPhrases} from '../../phrases'
import Grid from '../Grid'
import Flex from '../Flex'
import Box from '../Box'
import Input from '../Input'
import ArrowIcon from '../../icons/ArrowIcon'
import Datepicker from '../Datepicker'
// eslint-disable-next-line import/no-unresolved
import {DateRangeInputTheme} from '../../@types/theme'
import useThemeProps from '../../hooks/useThemeProps'

interface InputArrowIconProps extends OpacityProps, ColorProps {}
const InputArrowIcon = styled(ArrowIcon)<InputArrowIconProps>`
  ${opacity}
  ${color}
`

interface StyledGridProps extends BackgroundProps, BorderProps, BorderRadiusProps {}
const InputGrid = styled(Grid)<StyledGridProps>`
  ${background}
  ${border}
  ${borderRadius}
`

export interface DateRangeInputProps extends UseDatepickerProps {
  displayFormat?: string | FormatFunction
  phrases?: DateRangeInputPhrases
  onFocusChange(focusInput: FocusedInput): void
  showStartDateCalendarIcon?: boolean
  showEndDateCalendarIcon?: boolean
  onClose?(): void
}

function DateRangeInput({
  startDate,
  endDate,
  minBookingDate,
  maxBookingDate,
  firstDayOfWeek,
  onFocusChange,
  numberOfMonths,
  focusedInput,
  onDateChange,
  exactMinBookingDays,
  isDayBlocked = () => false,
  minBookingDays = 1,
  onClose = () => {},
  showStartDateCalendarIcon = true,
  showEndDateCalendarIcon = true,
  displayFormat = 'MM/DD/YYYY',
  phrases = dateRangeInputPhrases,
}: DateRangeInputProps) {
  const datepickerWrapperRef = useRef<HTMLDivElement>(null)
  const theme: DateRangeInputTheme = useThemeProps({
    dateRangeBackground: 'transparent',
    dateRangeGridTemplateColumns: '194px 39px 194px',
    dateRangeBorder: '0',
    dateRangeBorderRadius: '0',
    dateRangeArrowIconWidth: '15px',
    dateRangeArrowIconHeight: '12px',
    dateRangeArrowIconColor: '#ffffff',
    dateRangeArrowIconOpacity: 0.4,
    dateRangeDatepickerWrapperTop: 'unset',
    dateRangeDatepickerWrapperRight: 'unset',
    dateRangeDatepickerWrapperBottom: '65px',
    dateRangeDatepickerWrapperLeft: '0',
    dateRangeDatepickerWrapperPosition: 'absolute',
  })

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.addEventListener('click', onClickOutsideHandler)
    }

    return () => {
      window.removeEventListener('click', onClickOutsideHandler)
    }
  })

  function onClickOutsideHandler(event: Event) {
    if (
      focusedInput !== null &&
      datepickerWrapperRef &&
      datepickerWrapperRef.current &&
      // @ts-ignore
      !datepickerWrapperRef.current.contains(event.target)
    ) {
      onFocusChange(null)
    }
  }

  function handleDatepickerClose() {
    onClose()
    onFocusChange(null)
  }

  return (
    <Box position="relative" ref={datepickerWrapperRef}>
      <InputGrid
        background={theme.dateRangeBackground}
        gridTemplateColumns={theme.dateRangeGridTemplateColumns}
        border={theme.dateRangeBorder}
        borderRadius={theme.dateRangeBorderRadius}
      >
        <Input
          id="startDate"
          ariaLabel={phrases.startDateAriaLabel}
          placeholder={phrases.startDatePlaceholder}
          value={getInputValue(startDate, displayFormat, '')}
          onClick={() => onFocusChange(START_DATE)}
          showCalendarIcon={showStartDateCalendarIcon}
        />
        <Flex alignItems="center" justifyContent="center">
          <InputArrowIcon
            // @ts-ignore
            width={theme.dateRangeArrowIconWidth}
            // @ts-ignore
            height={theme.dateRangeArrowIconHeight}
            color={theme.dateRangeArrowIconColor}
            opacity={theme.dateRangeArrowIconOpacity}
          />
        </Flex>
        <Input
          id="endDate"
          ariaLabel={phrases.endDateAriaLabel}
          placeholder={phrases.endDatePlaceholder}
          value={getInputValue(endDate, displayFormat, '')}
          onClick={() => onFocusChange(!startDate ? START_DATE : END_DATE)}
          showCalendarIcon={showEndDateCalendarIcon}
        />
      </InputGrid>
      <Box
        position={theme.dateRangeDatepickerWrapperPosition}
        bottom={theme.dateRangeDatepickerWrapperBottom}
        left={theme.dateRangeDatepickerWrapperLeft}
        top={theme.dateRangeDatepickerWrapperTop}
        right={theme.dateRangeDatepickerWrapperRight}
      >
        {focusedInput !== null && (
          <Datepicker
            onClose={handleDatepickerClose}
            startDate={startDate}
            endDate={endDate}
            minBookingDate={minBookingDate}
            maxBookingDate={maxBookingDate}
            firstDayOfWeek={firstDayOfWeek}
            numberOfMonths={numberOfMonths}
            focusedInput={focusedInput}
            displayFormat={displayFormat}
            onDateChange={onDateChange}
            minBookingDays={minBookingDays}
            isDayBlocked={isDayBlocked}
            exactMinBookingDays={exactMinBookingDays}
          />
        )}
      </Box>
    </Box>
  )
}

export default DateRangeInput