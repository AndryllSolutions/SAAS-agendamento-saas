"use client"

import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { calendarService } from '@/services/calendarService'
import { clientService, packageService, subscriptionSalesService } from '@/services/api'
import { Button } from '@/components/ui/Button'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Trash2, Plus, Edit2, Save, X } from 'lucide-react'

interface ClientSidebarProps {
  clientId: number
}

export function ClientSidebar({ clientId }: ClientSidebarProps) {
  const queryClient = useQueryClient()
  const [newNote, setNewNote] = useState('')
  const [isPrivate, setIsPrivate] = useState(false)
  const [editingNoteId, setEditingNoteId] = useState<number | null>(null)
  const [editContent, setEditContent] = useState('')

  // Fetch client data
  const { data: client } = useQuery({
    queryKey: ['client', clientId],
    queryFn: () => clientService.get(clientId),
  })

  // Fetch packages
  const { data: packages } = useQuery({
    queryKey: ['packages', clientId],
    queryFn: () => packageService.list({ client_id: clientId }),
  })

  // Fetch subscriptions
  const { data: subscriptions } = useQuery({
    queryKey: ['subscriptions', clientId],
    queryFn: () => subscriptionSalesService.list({ client_id: clientId }),
  })

  // Fetch notes
  const { data: notes, isLoading: notesLoading } = useQuery({
    queryKey: ['client-notes', clientId],
    queryFn: () => calendarService.getClientNotes(clientId),
  })

  // Create note mutation
  const createNoteMutation = useMutation({
    mutationFn: (content: string) =>
      calendarService.createClientNote(clientId, { content, is_private: isPrivate }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client-notes', clientId] })
      setNewNote('')
      setIsPrivate(false)
      toast.success('Nota criada com sucesso!')
    },
    onError: () => toast.error('Erro ao criar nota'),
  })

  // Update note mutation
  const updateNoteMutation = useMutation({
    mutationFn: ({ noteId, content }: { noteId: number; content: string }) =>
      calendarService.updateClientNote(clientId, noteId, { content }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client-notes', clientId] })
      setEditingNoteId(null)
      setEditContent('')
      toast.success('Nota atualizada!')
    },
    onError: () => toast.error('Erro ao atualizar nota'),
  })

  // Delete note mutation
  const deleteNoteMutation = useMutation({
    mutationFn: (noteId: number) => calendarService.deleteClientNote(clientId, noteId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client-notes', clientId] })
      toast.success('Nota excluída!')
    },
    onError: () => toast.error('Erro ao excluir nota'),
  })

  const handleCreateNote = () => {
    if (!newNote.trim()) return
    createNoteMutation.mutate(newNote)
  }

  const handleUpdateNote = (noteId: number) => {
    if (!editContent.trim()) return
    updateNoteMutation.mutate({ noteId, content: editContent })
  }

  return (
    <div className="p-4 space-y-6">
      {/* Client Summary */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Cliente</h3>
        {client && (
          <div className="space-y-2 text-sm">
            <p className="font-medium">{client.full_name}</p>
            {client.email && <p className="text-gray-600">{client.email}</p>}
            {client.phone && <p className="text-gray-600">{client.phone}</p>}
            {client.cellphone && <p className="text-gray-600">{client.cellphone}</p>}
          </div>
        )}
      </div>

      {/* Packages */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Pacotes</h3>
        {packages && packages.length > 0 ? (
          <div className="space-y-2">
            {packages.map((pkg: any) => (
              <div key={pkg.id} className="p-2 bg-white rounded border text-sm">
                <p className="font-medium">{pkg.package_name}</p>
                <p className="text-gray-600">
                  {pkg.sessions_used || 0} / {pkg.total_sessions} sessões
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">Nenhum pacote ativo</p>
        )}
      </div>

      {/* Subscriptions */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Assinaturas</h3>
        {subscriptions && subscriptions.length > 0 ? (
          <div className="space-y-2">
            {subscriptions.map((sub: any) => (
              <div key={sub.id} className="p-2 bg-white rounded border text-sm">
                <p className="font-medium">{sub.subscription_name}</p>
                <p className="text-gray-600">Status: {sub.status}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">Nenhuma assinatura ativa</p>
        )}
      </div>

      {/* Notes */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Anotações</h3>
        
        {/* Create Note */}
        <div className="space-y-2 mb-4">
          <Textarea
            placeholder="Nova anotação..."
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            rows={3}
            className="text-sm"
          />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Checkbox
                id="private"
                checked={isPrivate}
                onCheckedChange={(checked) => setIsPrivate(checked as boolean)}
              />
              <label htmlFor="private" className="text-sm text-gray-600">
                Privada
              </label>
            </div>
            <Button
              size="sm"
              onClick={handleCreateNote}
              disabled={!newNote.trim() || createNoteMutation.isPending}
            >
              <Plus className="h-4 w-4 mr-1" />
              Adicionar
            </Button>
          </div>
        </div>

        {/* Notes List */}
        {notesLoading ? (
          <p className="text-sm text-gray-500">Carregando...</p>
        ) : notes && notes.length > 0 ? (
          <div className="space-y-2">
            {notes.map((note) => (
              <div key={note.id} className="p-2 bg-white rounded border text-sm">
                {editingNoteId === note.id ? (
                  <div className="space-y-2">
                    <Textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      rows={3}
                      className="text-sm"
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => handleUpdateNote(note.id)}
                      >
                        <Save className="h-3 w-3 mr-1" />
                        Salvar
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => {
                          setEditingNoteId(null)
                          setEditContent('')
                        }}
                      >
                        <X className="h-3 w-3 mr-1" />
                        Cancelar
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="whitespace-pre-wrap">{note.content}</p>
                    <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                      <span>
                        {note.created_by_name} • {new Date(note.created_at).toLocaleDateString()}
                        {note.is_private && ' • Privada'}
                      </span>
                      <div className="flex gap-1">
                        <button
                          onClick={() => {
                            setEditingNoteId(note.id)
                            setEditContent(note.content)
                          }}
                          className="p-1 hover:bg-gray-100 rounded"
                        >
                          <Edit2 className="h-3 w-3" />
                        </button>
                        <button
                          onClick={() => deleteNoteMutation.mutate(note.id)}
                          className="p-1 hover:bg-gray-100 rounded text-red-600"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">Nenhuma anotação</p>
        )}
      </div>
    </div>
  )
}
