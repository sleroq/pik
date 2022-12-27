import {
  component$,
  useClientEffect$,
  useContext,
  useStore,
} from '@builder.io/qwik'
import { DocumentHead } from '@builder.io/qwik-city'
import { Test } from '~/components/Test/test'
import { MyContext } from '~/root'

interface LoadingProps {
  text: string
}
export const Loading = component$<LoadingProps>(({ text }) => {
  return <div>{text}</div>
})

export default component$(() => {
  const state = useContext(MyContext)
  const store = useStore({ loading: 'Connecting...' })

  useClientEffect$(({ track }) => {
    track(state)
    switch (state.isReady) {
      case 'not yet':
        store.loading = 'Connecting...'
        break
      case 'failed':
        store.loading =
          'Failed to connect to the client\nTry to reopen the widget'
        break
    }
  })

  return (
    <div>
      <h1>
        Welcome to Pik <span class="lightning">⚡️</span>
      </h1>
      {state.isReady === 'yes' ? <Test /> : <Loading text={store.loading} />}
    </div>
  )
})

export const head: DocumentHead = {
  title: 'Welcome to Pik',
  meta: [
    {
      name: 'description',
      content: 'Pik site description',
    },
  ],
}
