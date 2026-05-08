import { useState } from 'react'
import { User, Palette, Mail, User as UserIcon, Moon, Sun, Building2, Check } from 'lucide-react'
import PageContainer from '../components/PageContainer'
import Modal from '../components/Modal'
import { useAuthStore } from '../store/authStore'
import { useFontStore } from '../store/fontStore'

const settingsSections = [
  {
    title: 'Account',
    items: [
      { icon: User, label: 'Profile', description: 'Manage your account details', key: 'profile' },
    ]
  },
  {
    title: 'Preferences',
    items: [
      { icon: Palette, label: 'Appearance', description: 'Theme and display settings', key: 'appearance' },
    ]
  },
]

const fonts = [
  { name: 'Poppins', value: 'Poppins' },
  { name: 'Tomorrow', value: 'Tomorrow' },
]

const primaryColors = [
  { name: 'Purple', value: '#9810fa' },
  { name: 'Orange', value: '#f77111' },
  { name: 'Green', value: '#00c758' },
]

export default function Settings() {
  const [activeModal, setActiveModal] = useState<string | null>(null)
  const [tempFont, setTempFont] = useState('')
  const [tempDarkMode, setTempDarkMode] = useState(false)
  const [tempPrimaryColor, setTempPrimaryColor] = useState('')

  const user = useAuthStore((state) => state.user)
  const font = useFontStore((state) => state.font)
  const isDarkMode = useFontStore((state) => state.isDarkMode)
  const primaryColor = useFontStore((state) => state.primaryColor)
  const setFont = useFontStore((state) => state.setFont)
  const setDarkMode = useFontStore((state) => state.setDarkMode)
  const setPrimaryColor = useFontStore((state) => state.setPrimaryColor)

  const handleOpenModal = (key: string) => {
    if (key === 'profile' || key === 'appearance') {
      if (key === 'appearance') {
        setTempFont(font)
        setTempDarkMode(isDarkMode)
        setTempPrimaryColor(primaryColor)
      }
      setActiveModal(key)
    }
  }

  const closeModal = () => setActiveModal(null)

  const handleFontSelect = (selectedFont: string) => {
    setTempFont(selectedFont)
  }

  const handleDarkModeToggle = () => {
    setTempDarkMode(prev => !prev)
  }

  const handleSave = () => {
    setFont(tempFont)
    setDarkMode(tempDarkMode)
    setPrimaryColor(tempPrimaryColor)
    closeModal()
  }

  const handleCancel = () => {
    closeModal()
  }

  return (
    <PageContainer 
      title="Settings" 
      description="Manage your account and preferences"
    >
      <div className="space-y-8 w-full max-w-2xl mx-auto">
        {settingsSections.map((section) => (
          <div key={section.title}>
            <h2 className="text-sm font-semibold text-neutral/50 uppercase tracking-wider mb-4">
              {section.title}
            </h2>
            <div className="space-y-3">
              {section.items.map((item) => (
                <button
                  key={item.key}
                  onClick={() => handleOpenModal(item.key)}
                  className="w-full flex items-start gap-4 p-4 bg-white border border-neutral/10 rounded-xl hover:border-primary/30 hover:shadow-md transition-all text-left group dark:bg-[var(--background-secondary)] dark:border-neutral/20"
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                    <item.icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-neutral">{item.label}</p>
                    <p className="text-sm text-neutral/60">{item.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <Modal isOpen={activeModal === 'profile'} onClose={closeModal} title="Profile">
        <div className="space-y-4">
          <div className="flex items-center gap-4 p-4 bg-neutral/5 dark:bg-[var(--background)] rounded-xl">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <UserIcon className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="font-medium text-neutral">{user?.username || 'N/A'}</p>
              <p className="text-sm text-neutral/60">Username</p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-4 bg-neutral/5 dark:bg-[var(--background)] rounded-xl">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Mail className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="font-medium text-neutral">{user?.email || 'N/A'}</p>
              <p className="text-sm text-neutral/60">Email</p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-4 bg-neutral/5 dark:bg-[var(--background)] rounded-xl">
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
              <Building2 className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="font-medium text-neutral">{user?.accountType || 'Personal'}</p>
              <p className="text-sm text-neutral/60">Account Type</p>
            </div>
          </div>
        </div>
      </Modal>

      <Modal isOpen={activeModal === 'appearance'} onClose={closeModal} title="Appearance">
        <div className="space-y-4">
          <div>
            <p className="text-sm text-neutral/60 mb-3">Font</p>
            <div className="space-y-2">
              {fonts.map((f) => (
                <button
                  key={f.value}
                  onClick={() => handleFontSelect(f.value)}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all text-left ${
                    tempFont === f.value 
                      ? 'bg-primary/10 border-2 border-primary' 
                      : 'bg-neutral/5 dark:bg-[var(--background)] border-2 border-transparent hover:bg-neutral/10'
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                    tempFont === f.value ? 'border-primary' : 'border-neutral/30'
                  }`}>
                    {tempFont === f.value && (
                      <div className="w-2 h-2 rounded-full bg-primary" />
                    )}
                  </div>
                  <span className="font-medium text-neutral" style={{ fontFamily: f.value }}>
                    {f.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm text-neutral/60 mb-3">Theme</p>
            <button
              onClick={handleDarkModeToggle}
              className={`w-full flex items-center justify-between p-4 rounded-lg transition-all ${
                tempDarkMode 
                  ? 'bg-neutral/20 border-2 border-neutral/30' 
                  : 'bg-neutral/5 dark:bg-[var(--background)] border-2 border-transparent hover:bg-neutral/10'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  {tempDarkMode ? (
                    <Moon className="w-5 h-5 text-primary" />
                  ) : (
                    <Sun className="w-5 h-5 text-primary" />
                  )}
                </div>
                <span className="font-medium text-neutral">
                  {tempDarkMode ? 'Dark Mode' : 'Light Mode'}
                </span>
              </div>
              <div className={`w-12 h-6 rounded-full p-1 transition-colors ${
                tempDarkMode ? 'bg-primary' : 'bg-neutral/20'
              }`}>
                <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
                  tempDarkMode ? 'translate-x-6' : 'translate-x-0'
                }`} />
              </div>
            </button>
          </div>

          <div>
            <p className="text-sm text-neutral/60 mb-3">Primary Color</p>
            <div className="flex gap-3">
              {primaryColors.map((color) => (
                <button
                  key={color.value}
                  onClick={() => setTempPrimaryColor(color.value)}
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                    tempPrimaryColor === color.value
                      ? 'ring-2 ring-offset-2 ring-neutral/40 dark:ring-offset-[var(--background-secondary)] scale-110'
                      : 'hover:scale-110'
                  }`}
                  style={{ backgroundColor: color.value }}
                  title={color.name}
                >
                  {tempPrimaryColor === color.value && (
                    <Check className="w-5 h-5 text-white" />
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={handleCancel}
              className="flex-1 py-2.5 px-4 rounded-lg border border-neutral/20 dark:border-neutral/30 text-neutral hover:bg-neutral/5 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex-1 py-2.5 px-4 rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors font-medium"
            >
              Save
            </button>
          </div>
        </div>
      </Modal>
    </PageContainer>
  )
}