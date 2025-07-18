import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { CreateQuestionRequest } from './types/create-question-request'
import type { CreateQuestionResponse } from './types/create-question-response'
import type { GetRoomQuestionsResponse } from './types/get-room-questions-response'

export function useCreateQuestion(roomId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ['create-question'],
    mutationFn: async (data: CreateQuestionRequest) => {
      const response = await fetch(
        `http://localhost:3333/rooms/${roomId}/questions`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        }
      )

      const result: CreateQuestionResponse = await response.json()

      return result
    },

    // Executa no momento que for feita a chamada p/ API
    // Aplica a estratégia de Interface Otimista

    onMutate({ question }) {
      const questions = queryClient.getQueryData<GetRoomQuestionsResponse>([
        'get-room-questions',
        roomId,
      ])

      const questionsAsrray = questions ?? []

      const newQuestion = {
        id: crypto.randomUUID(),
        question,
        answer: null,
        createdAt: new Date().toISOString(),
        isGeneratingAnswer: true,
      }

      queryClient.setQueryData<GetRoomQuestionsResponse>(
        ['get-room-questions', roomId],
        [newQuestion, ...questionsAsrray]
      )

      return { newQuestion, questions }
    },

    onSuccess(data, _variables, context) {
      if (context?.questions) {
        queryClient.setQueryData<GetRoomQuestionsResponse>(
          ['get-room-questions', roomId],
          (questions) => {
            if (!questions) {
              return questions
            }

            if (!context.newQuestion) {
              return questions
            }

            return questions.map((question) => {
              if (question.id === context.newQuestion.id) {
                return {
                  ...context.newQuestion,
                  id: data.questionId,
                  answer: data.answer,
                  isGeneratingAnswer: false,
                }
              }

              return question
            })
          }
        )
      }
    },

    onError(_error, _variables, context) {
      if (context?.questions) {
        queryClient.setQueryData<GetRoomQuestionsResponse>(
          ['get-room-questions', roomId],
          context.questions
        )
      }
    },
    /*  
   onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['get-room-questions', roomId] })
      //queryClient.setQueryData(['get-room', data.roomId], data)
    }, 
  */
  })
}
