import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { CreateRoomRequest } from './types/create-room-request'
import type { CreateRoomResponse } from './types/create-room-response'

export function useCreateRoom() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationKey: ['create-room'],
    mutationFn: async (data: CreateRoomRequest) => {
      const response = await fetch('http://localhost:3333/rooms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const result: CreateRoomResponse = await response.json()

      return result
    },

    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['get-rooms'] })
      queryClient.setQueryData(['get-room', data.roomId], data)
    },
  })
}
