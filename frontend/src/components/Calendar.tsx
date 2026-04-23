import { useState, useCallback, useMemo } from 'react'
import { Calendar, momentLocalizer, type View } from 'react-big-calendar'
import moment from 'moment'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { getMilestones } from '../api/milestones.api'
import { getTasks } from '../api/tasks.api'

const localizer = momentLocalizer(moment)

type EventResource = {
  type: 'milestone' | 'task'
  status?: string
  priority?: string
}

export interface CalendarEvent {
  id: string
  title: string
  start: Date
  end: Date
  allDay?: boolean
  resource?: EventResource
}

interface OrgCalendarProps {
  orgId: string
  token: string
}

export function OrgCalendar({ orgId, token }: OrgCalendarProps) {
  const navigate = useNavigate()
  const [date, setDate] = useState(new Date())
  const [view, setView] = useState<View>('month')

  const onNavigate = useCallback((newDate: Date) => setDate(newDate), [])
  const onView = useCallback((newView: View) => setView(newView), [])

  const { data: milestones = [], isLoading: milestonesLoading } = useQuery({
    queryKey: ['milestones', orgId],
    queryFn: () => getMilestones(orgId),
    enabled: !!orgId,
  })

  const { data: tasks = [], isLoading: tasksLoading } = useQuery({
    queryKey: ['tasks', token],
    queryFn: () => getTasks(token),
    enabled: !!token,
  })

  const events = useMemo((): CalendarEvent[] => {
    const milestoneEvents = milestones
      .filter((m) => m.startingDate || m.endingDate)
      .map((m): CalendarEvent => {
        const start = m.startingDate ? moment(m.startingDate).toDate() : moment(m.endingDate).toDate()
        const end = m.endingDate ? moment(m.endingDate).toDate() : moment(start).add(1, 'hour').toDate()
        
        // Ensure all-day events span correctly
        const finalEnd = m.endingDate && m.startingDate ? moment(m.endingDate).toDate() : moment(start).add(1, 'hour').toDate()

        return {
          id: m.id,
          title: `[M] ${m.name}`,
          start,
          end: finalEnd,
          allDay: true,
          resource: { type: 'milestone', status: m.category },
        }
      })

    const taskEvents = tasks
      .filter((t) => t.startingDate || t.dueDate)
      .map((t): CalendarEvent => {
        const start = t.startingDate ? moment(t.startingDate).toDate() : moment(t.dueDate).toDate()
        const end = t.dueDate ? moment(t.dueDate).toDate() : moment(start).add(1, 'hour').toDate()
        
        return {
          id: t.id,
          title: `[T] ${t.title}`,
          start,
          end,
          allDay: true,
          resource: { type: 'task', priority: t.priority },
        }
      })

    return [...milestoneEvents, ...taskEvents]
  }, [milestones, tasks])

  const handleSelectEvent = useCallback((event: CalendarEvent) => {
    if (event.resource?.type === 'milestone') {
      navigate({ to: '/organizations/milestones/$orgId', params: { orgId } })
    } else if (event.resource?.type === 'task' && token) {
      navigate({ to: '/organizations/tasks/$token', params: { token } })
    }
  }, [navigate, orgId, token])

  const eventStyleGetter = (event: CalendarEvent) => {
    const isMilestone = event.resource?.type === 'milestone'
    const backgroundColor = isMilestone ? '#3b82f6' : '#10b981'
    const borderColor = isMilestone ? '#1d4ed8' : '#059669'

    return {
      style: {
        backgroundColor,
        borderColor,
        color: 'white',
        borderRadius: '4px',
        padding: '2px 4px',
      },
    }
  }

  return (
    <div className="h-[500px] border rounded-xl p-4">
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: '100%' }}
        eventPropGetter={eventStyleGetter}
        onSelectEvent={handleSelectEvent}
        date={date}
        onNavigate={onNavigate}
        view={view}
        onView={onView}
        views={['month', 'week', 'day', 'agenda']}
      />
    </div>
  )
}