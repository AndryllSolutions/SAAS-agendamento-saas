/**
 * Calendar Service - API calls para a agenda time-grid
 */
import api from './api'
import {
  CalendarDayResponse,
  AppointmentMoveRequest,
  ClientNote,
  ClientNoteCreate,
  ClientNoteUpdate,
} from '@/types/calendar'

export const calendarService = {
  /**
   * Get all calendar data for a specific day (professionals + appointments + busy_blocks)
   */
  async getCalendarDay(date: string): Promise<CalendarDayResponse> {
    const response = await api.get(`/calendar/day?date=${date}`)
    return response.data
  },

  /**
   * Move appointment to new time/professional (drag & drop)
   */
  async moveAppointment(
    appointmentId: number,
    data: AppointmentMoveRequest
  ): Promise<any> {
    const response = await api.post(`/appointments/${appointmentId}/move`, data)
    return response.data
  },

  /**
   * Get client notes
   */
  async getClientNotes(clientId: number): Promise<ClientNote[]> {
    const response = await api.get(`/clients/${clientId}/notes`)
    return response.data
  },

  /**
   * Create client note
   */
  async createClientNote(
    clientId: number,
    data: ClientNoteCreate
  ): Promise<ClientNote> {
    const response = await api.post(`/clients/${clientId}/notes`, data)
    return response.data
  },

  /**
   * Update client note
   */
  async updateClientNote(
    clientId: number,
    noteId: number,
    data: ClientNoteUpdate
  ): Promise<ClientNote> {
    const response = await api.put(`/clients/${clientId}/notes/${noteId}`, data)
    return response.data
  },

  /**
   * Delete client note
   */
  async deleteClientNote(clientId: number, noteId: number): Promise<void> {
    await api.delete(`/clients/${clientId}/notes/${noteId}`)
  },
}
