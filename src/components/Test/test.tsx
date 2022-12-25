import { component$, $ } from '@builder.io/qwik'
import { WidgetApi } from 'matrix-widget-api'

/**
 * The RouterHead component is placed inside of the document `<head>` element.
 */
export const Test = component$(() => {
  return (
    <>
      <button onClick$={ $(whatever) } class="test-button">Test API</button>
      <button onClick$={ $(sendSticker) } class="test-button">Send Sticker</button>
    </>
  )
})

export async function whatever () {
  const sticker = {
    name: 'meow',
    content: {
        url: 'https://scalar.vector.im/api/widgets/img/no-banana.png',
        info: {
            h: 120,
            w: 120
        }
    }
  }
  const api = new WidgetApi()
  console.log('meow meow')
  console.log(await api.sendSticker(sticker))
}

export async function sendSticker () {
    // const api = new WidgetApi()
    console.log('meow meow')
    // console.log(api.sendSticker)
}
