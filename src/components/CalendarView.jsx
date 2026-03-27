import { useState } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import enUS from 'date-fns/locale/en-US';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const locales = { 'en-US': enUS };
const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });

const CustomToolbar = (toolbar) => {
    // Functions to handle calendar navigation
    const goToBack = () => toolbar.onNavigate('PREV');
    const goToNext = () => toolbar.onNavigate('NEXT');
    const goToCurrent = () => toolbar.onNavigate('TODAY');

    // Function to format and render the current month/year
    const label = () => {
        const date = toolbar.date;
        return (
            <span style={{ fontWeight: 'bold', fontSize: '1.2rem', color: 'var(--text-primary)' }}>
                {date.toLocaleString('default', { month: 'long', year: 'numeric' })}
            </span>
        );
    };

    return (
        <div className="rbc-toolbar" style={{ marginBottom: '15px', display: 'flex', alignItems: 'center' }}>
            {/* Left side gets flex: 1 to take exactly 1/3 of the space */}
            <div className="rbc-btn-group" style={{ flex: 1, display: 'flex', justifyContent: 'flex-start' }}>
                <button type="button" onClick={goToBack}>Back</button>
                <button type="button" onClick={goToCurrent}>Today</button>
                <button type="button" onClick={goToNext}>Next</button>
            </div>
            
            {/* Center label gets flex: 1 and aligns its text to the center */}
            <div className="rbc-toolbar-label" style={{ flex: 1, textAlign: 'center' }}>
                {label()}
            </div>
            
            {/* Right side gets flex: 1 to act as an equal counterweight to the left side */}
            <div className="rbc-btn-group" style={{ flex: 1 }} />
        </div>
    );
};

export default function CalendarView({ columns, onTaskClick, onDateClick }) {

    const [currentDate, setCurrentDate] = useState(new Date())
    
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
        <div 
            className="calendar-wrapper" 
            style={{ 
                padding: '20px 80px', 
                flex: '1',
                width: '100%',
                position: 'relative',
                zIndex: '10'
            }}
        >
            <Calendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                views={['month']} 
                defaultView="month"
                selectable={true} // 3. Allow clicking on empty slots/days
                popup={true}
                date={currentDate}
                onNavigate={(newDate) => setCurrentDate(newDate)}

                onSelectSlot={(slotInfo) => onDateClick(slotInfo.start)}
                onSelectEvent={(event) => {
                    document.dispatchEvent(new MouseEvent('mousedown', { bubbles: true })); //force popup with a fake "click away" to close when we open taskmodal
                    // tiny delay so that overlay can finish closing before taskmodal opens
                    setTimeout(() => {
                        onTaskClick(event.resource.columnId, event.resource);
                    }, 10);
                }}
                components={{ toolbar: CustomToolbar }}
            />
        </div>
    );
}