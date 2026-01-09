import dayjs, { Dayjs } from 'dayjs';
import { LeaveRecord } from '../types';

export interface TimelineConfig {
    startDate: Dayjs;
    endDate: Dayjs;
    months: { month: Dayjs; days: number; label: string }[];
    totalDays: number;
    dayWidth: number;
}

export const generateTimelineConfig = (
    startDate: Dayjs,
    endDate: Dayjs,
    dayWidth: number = 4
): TimelineConfig => {
    const months: TimelineConfig['months'] = [];
    let current = startDate.startOf('month');
    let totalDays = 0;

    while (current.isBefore(endDate) || current.isSame(endDate, 'month')) {
        const daysInMonth = current.daysInMonth();
        months.push({
            month: current,
            days: daysInMonth,
            label: current.format('MMMM'),
        });
        totalDays += daysInMonth;
        current = current.add(1, 'month');
    }

    return {
        startDate,
        endDate,
        months,
        totalDays,
        dayWidth,
    };
};

export const calculateLeavePosition = (
    leave: LeaveRecord,
    config: TimelineConfig
): { left: number; width: number; visible: boolean } => {
    const leaveStart = dayjs(leave.startDate);
    const leaveEnd = dayjs(leave.endDate);

    // Check if leave is within the visible range
    if (leaveEnd.isBefore(config.startDate) || leaveStart.isAfter(config.endDate)) {
        return { left: 0, width: 0, visible: false };
    }

    // Clamp dates to visible range
    const visibleStart = leaveStart.isBefore(config.startDate) ? config.startDate : leaveStart;
    const visibleEnd = leaveEnd.isAfter(config.endDate) ? config.endDate : leaveEnd;

    // Calculate position
    const daysFromStart = visibleStart.diff(config.startDate, 'day');
    const duration = visibleEnd.diff(visibleStart, 'day') + 1;

    return {
        left: daysFromStart * config.dayWidth,
        width: duration * config.dayWidth,
        visible: true,
    };
};

export const getMonthOffset = (
    month: Dayjs,
    config: TimelineConfig
): number => {
    let offset = 0;
    for (const m of config.months) {
        if (m.month.isSame(month, 'month')) {
            break;
        }
        offset += m.days * config.dayWidth;
    }
    return offset;
};
