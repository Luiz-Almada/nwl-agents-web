import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'

type GetRoomsAPIResponse = Array<{
  id: string
  name: string
}>

export function CreateRoom() {
  const { data, isLoading } = useQuery({
    queryKey: ['get-rooms'],
    queryFn: async () => {
      const response = await fetch('http://localhost:3333/rooms')

      const result: GetRoomsAPIResponse = await response.json()
      return result
    },
  })

  return (
    <div>
      {/* <div>Create Room</div> */}

      {isLoading && <p>Carregando...</p>}
      {/* <pre>{data && JSON.stringify(data, null, 2)}</pre> */}

      <div className="flex flex-col gap-1">
        {data?.map((room) => {
          return (
            <Link key={room.id} to={`/room/${room.id}`}>
              {room.name}
            </Link>
          )
        })}
      </div>

      {/* 
        Podemos usar o componente <a> para navegar entre páginas, mas isso irá recarregar a página inteira.
        No React, é melhor usar o componente <Link> do React Router para evitar recarregamentos desnecessários.
      */}

      {/* 
        Uma das vantagens de usar o React em vez de JavaScript Puro é que
        podemos navegar entre páginas sem recarregar a página inteira.
        Ao usar uma âncora como "<a></a>" perdemos essa vantagem pois irá carregar toda a página novamente 
        Não é uma boa prática no React
      */}

      {/*
        <a className="underline" href="/room">
          Acessar Sala
        </a>
      */}

      {/* 
        Podemos usar o componente <Link> do React Router para navegar entre páginas
        sem recarregar a página inteira.
        Isso é mais eficiente e mantém a experiência do usuário mais fluida.
      */}

      {/*   
        <Link className="underline" to="/room">
          Acessar Sala
        </Link>
      */}
    </div>
  )
}
