import { useState, useRef } from 'react'
import { Upload, FileText, Trash2, Download, Loader2, Eye, X } from 'lucide-react'
import PageContainer from '../components/PageContainer'
import ConfirmModal from '../components/ConfirmModal'
import { CardSkeleton } from '../components/skeletons'
import { useStores, useUploadStore, useDeleteStore, type Store } from '../hooks/useStores'
import { api } from '../hooks/api'

export default function Stores() {
  const { data: stores, isLoading, refetch } = useStores()
  const uploadStore = useUploadStore()
  const deleteStore = useDeleteStore()
  
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedStore, setSelectedStore] = useState<Store | null>(null)
  const [viewingStore, setViewingStore] = useState<Store | null>(null)
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

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
    refetch()
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleDelete = async () => {
    if (!selectedStore) return
    await deleteStore.mutateAsync(selectedStore.id)
    setIsDeleteModalOpen(false)
    setSelectedStore(null)
    refetch()
  }

  const openDeleteModal = (store: Store) => {
    setSelectedStore(store)
    setIsDeleteModalOpen(true)
  }

  const handleView = async (store: Store) => {
    setViewingStore(store)
    try {
      const token = localStorage.getItem('token')
      const response = await api.get(`/stores/download/${store.id}`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob',
      })
      const blob = new Blob([response.data], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      setPdfUrl(url)
    } catch (error) {
      console.error('Failed to load PDF:', error)
      setViewingStore(null)
    }
  }

  const closeViewer = () => {
    if (pdfUrl) {
      URL.revokeObjectURL(pdfUrl)
    }
    setPdfUrl(null)
    setViewingStore(null)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <PageContainer 
      title="Stores" 
      description="Manage your PDF files"
      actions={
        <label className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium cursor-pointer">
          <Upload className="w-5 h-5" />
          Upload PDF
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            onChange={handleFileSelect}
            className="hidden"
            disabled={uploadStore.isPending}
          />
        </label>
      }
    >
      {uploadStore.isPending && (
        <div className="mb-4 p-4 bg-primary/10 rounded-lg flex items-center gap-3 text-primary">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Uploading file...</span>
        </div>
      )}

      {isLoading ? (
        <CardSkeleton count={6} />
      ) : !stores || stores.length === 0 ? (
        <div className="bg-white dark:bg-[var(--background-secondary)] rounded-2xl border border-neutral/10 dark:border-neutral/20 p-8 text-center">
          <FileText className="w-12 h-12 mx-auto text-neutral/30 mb-4" />
          <p className="text-neutral/60 dark:text-[var(--neutral-muted)]">No files yet. Upload your first PDF file.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {stores.map((store) => (
            <div
              key={store.id}
              className="bg-white dark:bg-[var(--background-secondary)] rounded-xl border border-neutral/10 dark:border-neutral/20 p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-5 h-5 text-red-600 dark:text-red-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="font-medium text-neutral dark:text-[var(--neutral)] truncate">
                    {store.file_name}
                  </h4>
                  <p className="text-sm text-neutral/50 dark:text-[var(--neutral-muted)]">
                    {formatFileSize(store.file_size)}
                  </p>
                  <p className="text-xs text-neutral/40 dark:text-[var(--neutral-muted)]">
                    {new Date(store.uploaded_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2 mt-4 pt-4 border-t border-neutral/10 dark:border-neutral/20">
                <button
                  onClick={() => handleView(store)}
                  className="flex-1 flex items-center justify-center gap-2 py-2 text-sm text-neutral/60 dark:text-[var(--neutral-muted)] hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                  title="View"
                >
                  <Eye className="w-4 h-4" />
                  View
                </button>
                <button
                  className="flex items-center justify-center gap-2 py-2 px-3 text-sm text-neutral/60 dark:text-[var(--neutral-muted)] hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                  title="Download"
                >
                  <Download className="w-4 h-4" />
                </button>
                <button
                  onClick={() => openDeleteModal(store)}
                  className="flex items-center justify-center gap-2 py-2 px-3 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {viewingStore && pdfUrl && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[var(--background-secondary)] rounded-2xl w-full max-w-4xl h-[90vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-neutral/10 dark:border-neutral/20">
              <h3 className="font-semibold text-neutral dark:text-[var(--neutral)] truncate">
                {viewingStore.file_name}
              </h3>
              <button
                onClick={closeViewer}
                className="p-2 text-neutral/60 hover:text-neutral dark:text-[var(--neutral-muted)] dark:hover:text-[var(--neutral)] rounded-lg hover:bg-neutral/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <iframe
              src={pdfUrl}
              className="flex-1 w-full"
              title={viewingStore.file_name}
            />
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => { setIsDeleteModalOpen(false); setSelectedStore(null) }}
        onConfirm={handleDelete}
        title="Delete File"
        message={`Are you sure you want to delete "${selectedStore?.file_name}"? This action cannot be undone.`}
        confirmText="Delete"
        isLoading={deleteStore.isPending}
        variant="danger"
      />
    </PageContainer>
  )
}