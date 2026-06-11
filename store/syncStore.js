import { create } from 'zustand'

export const useSyncStore = create((set) => ({
  isSyncing: false,
  isInitialSync: false,
  lastSyncedAt: null,
  pendingCount: 0,
  hasSyncError: false,

  setSyncing: (isSyncing) => set({ isSyncing }),
  setInitialSync: (isInitialSync) => set({ isInitialSync }),
  setLastSyncedAt: (lastSyncedAt) => set({ lastSyncedAt }),
  setPendingCount: (pendingCount) => set({ pendingCount }),
  setSyncError: (hasSyncError) => set({ hasSyncError }),
}))
