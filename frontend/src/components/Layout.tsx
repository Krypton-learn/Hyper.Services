import { useState, useEffect, useRef } from 'react'
import { Outlet, useNavigate } from '@tanstack/react-router'
import Sidebar from './Sidebar'
import NavSidebar from './NavSidebar'
import GlobalCreateTaskModal from './GlobalCreateTaskModal'
import CommandsModal from './CommandsModal'
import { useCreateTaskModalStore } from '../store/createTaskModalStore'
import { useUploadStore } from '../hooks/useStores'

export default function Layout() {
  const [commandsOpen, setCommandsOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const uploadStore = useUploadStore()
  const navigate = useNavigate()

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.name.toLowerCase().endsWith('.pdf')) {
      alert('Only PDF files are allowed')
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB')
      return
    }

    await uploadStore.mutateAsync({ file, fileName: file.name })
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === '.' && !e.altKey && !e.shiftKey) {
        e.preventDefault()
        setCommandsOpen((prev) => !prev)
        return
      }

      if (e.ctrlKey && e.altKey && e.key === 'c') {
        e.preventDefault()
        const state = useCreateTaskModalStore.getState()
        if (!state.isOpen) state.openWithStatus('Common')
        return
      }

      if (e.ctrlKey && e.altKey && e.key === 'u') {
        e.preventDefault()
        const state = useCreateTaskModalStore.getState()
        if (!state.isOpen) state.openWithStatus('Urgent')
        return
      }

      if (e.ctrlKey && e.altKey && e.key === 's') {
        e.preventDefault()
        fileInputRef.current?.click()
        return
      }

      if (e.ctrlKey && e.altKey && e.key === 'a' && !e.shiftKey) {
        e.preventDefault()
        navigate({ to: '/ai', search: { ask: 'tasks' } })
        return
      }

      if (e.key === 'Escape' && commandsOpen) {
        e.preventDefault()
        setCommandsOpen(false)
        return
      }
    }

    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [commandsOpen, uploadStore])

  return (
    <div className="min-h-screen bg-background">
      <Sidebar position="left">
        <NavSidebar />
      </Sidebar>
      <main className="min-h-screen ml-64">
        <Outlet />
      </main>
      <Sidebar position="right" />
      <GlobalCreateTaskModal />
      <CommandsModal isOpen={commandsOpen} onClose={() => setCommandsOpen(false)} />
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  )
}
