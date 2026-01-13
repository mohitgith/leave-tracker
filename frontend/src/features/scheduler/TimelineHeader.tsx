import dayjs from 'dayjs';
import { TimelineConfig } from '../../lib/timelineUtils';
import './TimelineHeader.css';

interface TimelineHeaderProps {
    config: TimelineConfig;
    currentMonth?: dayjs.Dayjs;
}

const TimelineHeader: React.FC<TimelineHeaderProps> = ({ config, currentMonth }) => {
    const today = dayjs();
    const totalDays = config.totalDays;
    // Calculate total width based on dayWidth * totalDays
    const totalWidth = config.dayWidth * totalDays;

    // Generate all days for the visible range
    const generateDays = () => {
        const days: {
            date: dayjs.Dayjs;
            dayOfWeek: string;
            dayNum: number;
            isWeekend: boolean;
            isMonthStart: boolean;
            isToday: boolean;
        }[] = [];
        let currentDate = config.startDate.startOf('month');
        const endDate = config.endDate.endOf('month');

        while (currentDate.isBefore(endDate) || currentDate.isSame(endDate, 'day')) {
            days.push({
                date: currentDate,
                dayOfWeek: currentDate.format('dd')[0], // First letter of day
                dayNum: currentDate.date(),
                isWeekend: currentDate.day() === 0 || currentDate.day() === 6,
                isMonthStart: currentDate.date() === 1,
                isToday: currentDate.isSame(today, 'day'),
            });
            currentDate = currentDate.add(1, 'day');
        }
        return days;
    };

    const days = generateDays();

    return (
        <div className="timeline-header" style={{ minWidth: `${totalWidth}px` }}>
            {/* Month row */}
            <div className="timeline-months-row">
                {config.months.map((monthData, index) => {
                    const isCurrentMonth = currentMonth && monthData.month.isSame(currentMonth, 'month');
                    // Use percentage width based on proportion of days
                    const widthPercent = (monthData.days / totalDays) * 100;

                    return (
                        <div
                            key={index}
                            className={`timeline-month ${isCurrentMonth ? 'timeline-month-current' : ''}`}
                            style={{ width: `${widthPercent}%` }}
                        >
                            <span className="month-label">{monthData.label}</span>
                        </div>
                    );
                })}
            </div>

            {/* Days row */}
            <div className="timeline-days-row">
                {days.map((day, index) => {
                    // Use percentage width to match grid columns exactly
                    const widthPercent = (1 / totalDays) * 100;
                    return (
                        <div
                            key={index}
                            className={`timeline-day ${day.isWeekend ? 'timeline-day-weekend' : ''} ${day.isMonthStart && index > 0 ? 'timeline-day-month-start' : ''} ${day.isToday ? 'timeline-day-today' : ''}`}
                            style={{ width: `${widthPercent}%` }}
                        >
                            <span className="day-letter">{day.dayOfWeek}</span>
                            <span className="day-number">{day.dayNum}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default TimelineHeader;
