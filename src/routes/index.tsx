import { component$ } from '@builder.io/qwik'
import type { DocumentHead } from '@builder.io/qwik-city'
import { Test } from '~/components/Test/test'

export default component$(() => {
  return (
    <div>
      <h1>
        Welcome to Pik <span class="lightning">⚡️</span>
      </h1>
      <Test />
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
