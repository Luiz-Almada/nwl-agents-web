/** biome-ignore-all lint/suspicious/noConsole: mandatory React */
import { Button } from '@/components/ui/button'
import { useRef, useState } from 'react'
import { Navigate, useParams } from 'react-router-dom'

type RoomParams = {
  roomId: string
}

// Nesse contexto é necessário instalar @types/dom-speech-recognition
//  para que o TypeScript reconheça os tipos de MediaRecorder e SpeechRecognition
// Além disso, é importante verificar se o navegador suporta essas APIs antes de usá-las
// O código abaixo é um exemplo básico de como iniciar uma gravação de áudio
// e exibir o status de gravação na interface do usuário.
const isRecordSupported =
  !!navigator.mediaDevices &&
  typeof navigator.mediaDevices.getUserMedia === 'function' &&
  typeof window.MediaRecorder === 'function'

// OU

/* 
  const isRecordSupported =
  'mediaDevices' in navigator &&
  'getUserMedia' in navigator.mediaDevices &&
  'MediaRecorder' in window 
*/

export function RecordRoomAudio() {
  const params = useParams<RoomParams>()
  const [isRecording, setIsRecording] = useState(false)
  const recorder = useRef<MediaRecorder | null>(null)
  const intervalRef = useRef<NodeJS.Timeout>(null)

  function stopRecording() {
    setIsRecording(false)

    if (recorder.current?.state !== 'inactive') {
      recorder.current?.stop()
    }

    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }
  }

  async function upLoadAudio(audio: Blob) {
    const formData = new FormData()

    formData.append('file', audio, 'audio.webm')

    const response = await fetch(
      `http://localhost:3333/rooms/${params.roomId}/audio`,
      {
        method: 'POST',
        body: formData,
      }
    )

    const result = await response.json()

    console.log('Áudio enviado com sucesso:', result)
  }

  function createRecorder(audio: MediaStream) {
    recorder.current = new MediaRecorder(audio, {
      mimeType: 'audio/webm',
      bitsPerSecond: 64_000,
    })

    recorder.current.ondataavailable = (event) => {
      if (event.data.size > 0) {
        //console.log('Áudio gravado:', event.data)
        upLoadAudio(event.data)
      }
    }

    recorder.current.onstart = () => {
      console.log('Gravação iniciada!')
    }

    recorder.current.onstop = () => {
      console.log('Gravação encerrada/pausada!')
    }

    recorder.current.start()
  }

  async function startRecording() {
    if (!isRecordSupported) {
      //alert('Gravação de áudio não é suportada neste navegador.')
      alert('O seu navegador não suporta gravação')
      return
    }

    setIsRecording(true)

    const audio = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        sampleRate: 44_100,
      },
    })

    createRecorder(audio)

    intervalRef.current = setInterval(() => {
      recorder.current?.stop()

      createRecorder(audio)
    }, 5000)

    /*     recorder.addEventListener('dataavailable', (event) => {
      if (event.data.size > 0) {
        // Aqui você pode enviar o áudio para o servidor ou processá-lo como necessário
        console.log('Áudio gravado:', event.data)
      }
    }) */
  }

  if (!params.roomId) {
    return <Navigate replace to="/" />
  }

  return (
    <div className="flex h-screen flex-col items-center justify-center gap-3">
      {isRecording ? (
        <Button onClick={stopRecording}>Pausar gravação</Button>
      ) : (
        <Button onClick={startRecording}>Gravar áudio</Button>
      )}
      {isRecording ? <p>Gravando...</p> : <p>Pausado</p>}
    </div>
  )
}
