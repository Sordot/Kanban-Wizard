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
        column.tasks
            // only render tasks that actually have due dates
            .filter(task => task.dueDate) 
            .map(task => ({
                id: task.id,
                title: task.text,
                start: new Date(task.dueDate),
                end: new Date(task.dueDate),
                allDay: true,
                resource: { 
                    ...task, 
                    columnId: column.id // Inject the columnId so the click handler can read it
                } 
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