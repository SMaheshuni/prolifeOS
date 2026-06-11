import { Spinner } from '@/components/ui'
import { useSyncStore } from '@/store/syncStore'

export default function InitialSyncOverlay() {
  const isInitialSync = useSyncStore((state) => state.isInitialSync)

  if (!isInitialSync) return null

  return (
    <div className="fixed inset-0 z-modal flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-md">
        <Spinner size={32} />
        <p className="text-label text-muted">Syncing your data…</p>
      </div>
    </div>
  )
}
