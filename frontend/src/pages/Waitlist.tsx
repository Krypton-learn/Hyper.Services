import { Trash2 } from 'lucide-react'
import PageContainer from '../components/PageContainer'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/Table'
import { useWaitlist, useDeleteFromWaitlist } from '../hooks/useWaitlist'
import { useWaitlistStore } from '../store/waitlistStore'

export default function Waitlist() {
  const { isLoading } = useWaitlist()
  const deleteEntry = useDeleteFromWaitlist()
  const entries = useWaitlistStore((state) => state.entries)

  const handleDelete = (id: string) => {
    deleteEntry.mutate(id)
  }

  const formatDate = (date: string) => new Date(date).toLocaleDateString()

  return (
    <PageContainer 
      title="Waitlist" 
      description="Manage waitlist entries"
    >
      {isLoading ? (
        <div className="text-center py-8 text-neutral/60">Loading waitlist...</div>
      ) : entries.length === 0 ? (
        <div className="bg-white dark:bg-[var(--background-secondary)] rounded-2xl border border-neutral/10 dark:border-neutral/20 p-8 text-center">
          <p className="text-neutral/60">No waitlist entries yet.</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-[var(--background-secondary)] rounded-2xl border border-neutral/10 dark:border-neutral/20 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>First Name</TableHead>
                <TableHead>Last Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="w-20">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entries.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell className="font-medium">{entry.firstname}</TableCell>
                  <TableCell>{entry.lastname}</TableCell>
                  <TableCell>{entry.email}</TableCell>
                  <TableCell>
                    <span className="text-neutral/60 line-clamp-1">{entry.desc || '-'}</span>
                  </TableCell>
                  <TableCell>{formatDate(entry.createdAt)}</TableCell>
                  <TableCell>
                    <button
                      onClick={() => handleDelete(entry.id)}
                      className="p-2 text-neutral/40 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                      title="Remove"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </PageContainer>
  )
}