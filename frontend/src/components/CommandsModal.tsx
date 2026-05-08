import Modal from './Modal'

interface CommandsModalProps {
  isOpen: boolean
  onClose: () => void
}

const shortcuts = [
  { keys: ['Ctrl', '.'], description: 'Toggle command palette' },
  { keys: ['Ctrl', 'Alt', 'C'], description: 'Create new task (Common)' },
  { keys: ['Ctrl', 'Alt', 'U'], description: 'Create new task (Urgent)' },
  { keys: ['Ctrl', 'Alt', 'S'], description: 'Upload a PDF file' },
  { keys: ['Ctrl', 'Alt', 'A'], description: 'Ask AI about your tasks' },
]

export default function CommandsModal({ isOpen, onClose }: CommandsModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Keyboard Shortcuts">
      <div className="space-y-3">
        {shortcuts.map((shortcut) => (
          <div
            key={shortcut.keys.join('-')}
            className="flex items-center justify-between p-3 rounded-lg bg-neutral/5 dark:bg-[var(--background)]"
          >
            <span className="text-sm text-neutral/70">{shortcut.description}</span>
            <div className="flex items-center gap-1.5">
              {shortcut.keys.map((key) => (
                <kbd
                  key={key}
                  className="px-2 py-1 text-xs font-medium text-neutral bg-white dark:bg-[var(--background-secondary)] border border-neutral/20 dark:border-neutral/30 rounded-md shadow-sm"
                >
                  {key}
                </kbd>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Modal>
  )
}
