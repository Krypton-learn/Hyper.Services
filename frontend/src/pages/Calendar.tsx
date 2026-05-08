import { useRef, useState, useEffect } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import type { EventInput } from '@fullcalendar/core'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import PageContainer from '../components/PageContainer'
import { useDashboard } from '../hooks/useDashboard'
import { useDashboardStore } from '../store/dashboardStore'
import type { Task } from '../store/tasksStore'

function taskToEvent(task: Task): EventInput | null {
  const start = task.startingDate || task.deadline || task.createdAt
  if (!start) return null

  const isCompleted = task.isCompleted === 1
  const isOverdue =
    !isCompleted && task.deadline && new Date(task.deadline) < new Date()

  let backgroundColor: string
  let borderColor: string

  if (isCompleted) {
    backgroundColor = '#00c758'
    borderColor = '#00c758'
  } else if (isOverdue) {
    backgroundColor = '#ef4444'
    borderColor = '#ef4444'
  } else {
    backgroundColor = '#9810fa'
    borderColor = '#9810fa'
  }

  return {
    id: task.id,
    title: task.title,
    start,
    end: task.deadline || undefined,
    backgroundColor,
    borderColor,
    extendedProps: { task },
  }
}

export default function Calendar() {
  const calendarRef = useRef<FullCalendar>(null)
  const [view, setView] = useState<'dayGridMonth' | 'timeGridWeek'>('dayGridMonth')
  const [title, setTitle] = useState('')

  const { isLoading } = useDashboard()
  const { pending, completed, overdue } = useDashboardStore()

  const allTasks = [...pending, ...completed, ...overdue]

  const events: EventInput[] = allTasks
    .map(taskToEvent)
    .filter((e): e is EventInput => e !== null)

  // Sync title with FullCalendar's internal date whenever the calendar renders
  const updateTitle = () => {
    const api = calendarRef.current?.getApi()
    if (api) {
      setTitle(api.view.title)
    }
  }

  useEffect(() => {
    updateTitle()
  }, [])

  const handlePrev = () => {
    const api = calendarRef.current?.getApi()
    if (api) {
      api.prev()
      updateTitle()
    }
  }

  const handleNext = () => {
    const api = calendarRef.current?.getApi()
    if (api) {
      api.next()
      updateTitle()
    }
  }

  const handleToday = () => {
    const api = calendarRef.current?.getApi()
    if (api) {
      api.today()
      updateTitle()
    }
  }

  const changeView = (newView: 'dayGridMonth' | 'timeGridWeek') => {
    setView(newView)
    const api = calendarRef.current?.getApi()
    if (api) {
      api.changeView(newView)
      updateTitle()
    }
  }

  return (
    <PageContainer 
      title="Calendar" 
      description="Plan and track your tasks"
    >
      <div className="bg-white dark:bg-[var(--background-secondary)] rounded-2xl border border-neutral/10 dark:border-neutral/20 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrev}
              className="p-2 hover:bg-neutral/5 rounded-lg transition-colors border border-neutral/10 dark:border-neutral/20 dark:hover:bg-neutral/10"
            >
              <ChevronLeft className="w-5 h-5 text-neutral" />
            </button>
            <button
              onClick={handleToday}
              className="px-4 py-2 text-sm font-medium text-neutral hover:bg-neutral/5 rounded-lg transition-colors border border-neutral/10"
            >
              Today
            </button>
            <button
              onClick={handleNext}
              className="p-2 hover:bg-neutral/5 rounded-lg transition-colors border border-neutral/10 dark:border-neutral/20 dark:hover:bg-neutral/10"
            >
              <ChevronRight className="w-5 h-5 text-neutral" />
            </button>
          </div>
          
          <h2 className="text-xl font-bold text-neutral">{title}</h2>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={() => changeView('dayGridMonth')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                view === 'dayGridMonth' 
                  ? 'bg-primary text-white' 
                  : 'text-neutral hover:bg-neutral/5 border border-neutral/10 dark:border-neutral/20 dark:hover:bg-neutral/10'
              }`}
            >
              Month
            </button>
            <button 
              onClick={() => changeView('timeGridWeek')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                view === 'timeGridWeek' 
                  ? 'bg-primary text-white' 
                  : 'text-neutral hover:bg-neutral/5 border border-neutral/10 dark:border-neutral/20 dark:hover:bg-neutral/10'
              }`}
            >
              Week
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-16 text-neutral/60">Loading calendar...</div>
        ) : (
          <FullCalendar
            ref={calendarRef}
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView={view}
            events={events}
            headerToolbar={false}
            height="auto"
            dayMaxEvents={3}
            eventDisplay="block"
            datesSet={updateTitle}
          />
        )}
      </div>

      <div className="flex items-center gap-6 mt-4 px-2">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-[#9810fa]" />
          <span className="text-sm text-neutral/60">Pending</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-[#00c758]" />
          <span className="text-sm text-neutral/60">Completed</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-[#ef4444]" />
          <span className="text-sm text-neutral/60">Overdue</span>
        </div>
      </div>
      
      <style>{`
        .fc .fc-col-header-cell-cushion {
          color: #6b6375;
          font-weight: 600;
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          padding: 12px 0;
        }
        .fc .fc-daygrid-day-number {
          color: var(--neutral, #101828);
          font-weight: 500;
          padding: 8px;
        }
        .fc .fc-daygrid-day.fc-day-today .fc-daygrid-day-number {
          background: #9810fa;
          color: white;
          border-radius: 50%;
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .fc .fc-event {
          border-radius: 4px;
          font-size: 12px;
          padding: 2px 6px;
          font-weight: 500;
          border: none;
          cursor: pointer;
        }
        .fc .fc-daygrid-day:hover {
          background: var(--background-secondary, #f4f3ec);
        }
        .fc-theme-standard td, .fc-theme-standard th {
          border-color: var(--neutral-muted, #e5e4e7);
        }
        .fc-theme-standard .fc-scrollgrid {
          border-color: var(--neutral-muted, #e5e4e7);
        }
        .fc-daygrid-day {
          background: var(--background, #ffffff);
        }
        .fc-daygrid-day:hover {
          background: var(--background-secondary, #f4f3ec) !important;
        }
        .fc .fc-timegrid-slot {
          height: 48px;
        }
        .fc .fc-timegrid-slot-label-cushion {
          color: var(--neutral, #101828);
          font-size: 12px;
        }
      `}</style>
    </PageContainer>
  )
}