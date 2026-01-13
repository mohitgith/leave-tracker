import dayjs from 'dayjs';
import { TimelineConfig } from '../../lib/timelineUtils';
import './UnifiedGridlines.css';

interface UnifiedGridlinesProps {
    config: TimelineConfig;
    employeeCount: number;
    monthsRowHeight: number; // Height of the months row (gridlines start AFTER this)
    daysRowHeight: number;   // Height of the days row
    rowHeight: number;       // Height of each employee row
}

const UnifiedGridlines: React.FC<UnifiedGridlinesProps> = ({
    config,
    employeeCount,
    monthsRowHeight,
    daysRowHeight,
    rowHeight,
}) => {
    const today = dayjs();
    const totalDays = config.totalDays;
    const totalWidth = config.dayWidth * totalDays;
    const bodyHeight = employeeCount * rowHeight;
    // Gridlines span from days row through body (excluding months row)
    const gridlinesHeight = daysRowHeight + bodyHeight;

    // Generate all day columns for grid lines
    const generateDayColumns = () => {
        const columns: {
            percentOffset: number;
            percentWidth: number;
            isMonthStart: boolean;
            isWeekend: boolean;
            isToday: boolean;
        }[] = [];
        let currentDate = config.startDate.startOf('month');
        const endDate = config.endDate.endOf('month');
        let dayIndex = 0;

        while (currentDate.isBefore(endDate) || currentDate.isSame(endDate, 'day')) {
            const isMonthStart = currentDate.date() === 1;
            const isWeekend = currentDate.day() === 0 || currentDate.day() === 6;
            const isToday = currentDate.isSame(today, 'day');

            columns.push({
                percentOffset: (dayIndex / totalDays) * 100,
                percentWidth: (1 / totalDays) * 100,
                isMonthStart,
                isWeekend,
                isToday,
            });

            dayIndex++;
            currentDate = currentDate.add(1, 'day');
        }
        return columns;
    };

    const dayColumns = generateDayColumns();

    return (
        <div
            className="unified-gridlines"
            style={{
                top: `${monthsRowHeight}px`, // Start after months row
                height: `${gridlinesHeight}px`,
                minWidth: `${totalWidth}px`
            }}
        >
            {dayColumns.map((col, index) => (
                <div
                    key={index}
                    className={`unified-grid-column ${col.isMonthStart && index > 0 ? 'unified-grid-column-month' : ''} ${col.isWeekend ? 'unified-grid-column-weekend' : ''} ${col.isToday ? 'unified-grid-column-today' : ''}`}
                    style={{
                        left: `${col.percentOffset}%`,
                        width: `${col.percentWidth}%`,
                        height: `${gridlinesHeight}px`,
                    }}
                />
            ))}
        </div>
    );
};

export default UnifiedGridlines;

