'use client'

import { create } from 'zustand'

export type AgendaView = 'daily' | 'weekly' | 'monthly'

export type AgendaStatusKey =
  | 'confirmed'
  | 'unconfirmed'
  | 'waiting'
  | 'cancelled'
  | 'billed'
  | 'blocked'

export interface AgendaFilters {
  professionalIds: number[]
  statuses: AgendaStatusKey[]
}

export interface AgendaSettings {
  columnWidth: 'auto' | 'compact' | 'wide'
  slotMinutes: 15 | 30
  defaultStatus: AgendaStatusKey
  showAvatars: boolean
}

interface AgendaState {
  view: AgendaView
  date: Date
  filters: AgendaFilters
  settings: AgendaSettings
  setView: (view: AgendaView) => void
  setDate: (date: Date) => void
  toggleProfessional: (id: number) => void
  toggleStatus: (status: AgendaStatusKey) => void
  clearProfessionals: () => void
  setSettings: (settings: AgendaSettings) => void
}

export const useAgendaStore = create<AgendaState>((set) => ({
  view: 'daily',
  date: new Date(),
  filters: {
    professionalIds: [],
    statuses: ['confirmed', 'unconfirmed', 'waiting', 'cancelled', 'billed', 'blocked'],
  },
  settings: {
    columnWidth: 'auto',
    slotMinutes: 15,
    defaultStatus: 'confirmed',
    showAvatars: true,
  },
  setView: (view) => set({ view }),
  setDate: (date) => set({ date }),
  toggleProfessional: (id) =>
    set((state) => {
      const exists = state.filters.professionalIds.includes(id)
      return {
        filters: {
          ...state.filters,
          professionalIds: exists
            ? state.filters.professionalIds.filter((value) => value !== id)
            : [...state.filters.professionalIds, id],
        },
      }
    }),
  toggleStatus: (status) =>
    set((state) => {
      const exists = state.filters.statuses.includes(status)
      return {
        filters: {
          ...state.filters,
          statuses: exists
            ? state.filters.statuses.filter((value) => value !== status)
            : [...state.filters.statuses, status],
        },
      }
    }),
  clearProfessionals: () =>
    set((state) => ({
      filters: {
        ...state.filters,
        professionalIds: [],
      },
    })),
  setSettings: (settings) => set({ settings }),
}))
