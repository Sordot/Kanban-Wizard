import React from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import enUS from 'date-fns/locale/en-US';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const locales = { 'en-US': enUS };
const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });

export default function CalendarView({ columns, onTaskClick }) {
    // Flatten tasks from columns into a format react-big-calendar understands
    const events = columns.flatMap(column => 
        column.tasks.map(task => ({
            id: task.id,
            title: task.text,
            start: task.dueDate ? new Date(task.dueDate) : new Date(),
            end: task.dueDate ? new Date(task.dueDate) : new Date(),
            allDay: true,
            resource: task // Keep the original task object for the click handler
        }))
    );

    return (
        <div className="calendar-wrapper" style={{ height: 'calc(100vh - 200px)', padding: '20px' }}>
            <Calendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                onSelectEvent={(event) => onTaskClick(event.resource.columnId, event.resource)}
                eventPropGetter={(event) => ({
                    className: `priority-${event.resource.priority.toLowerCase()}`,
                    style: { borderRadius: '4px' }
                })}
            />
        </div>
    );
}