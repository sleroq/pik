import { component$, useContext } from '@builder.io/qwik'
import { MyContext, SharedState } from '~/root'

/**
 * The RouterHead component is placed inside of the document `<head>` element.
 */
export const Test = component$(() => {
  const state = useContext<SharedState>(MyContext)

  return (
    <>
      <button onClick$={() => {
        if (!state.api) {
          throw new Error('no api in state!')
        }

        console.log('sending sticker!')

        const sticker = {
          name: 'testing stickers!',
          description: 'Isabella the Monero Girl glaring at the camera, cheeks red, with steam coming from her ears',
          content: {
              url: 'mxc://matrix.org/LLANaPGGqVzrvvQSWSxhSKRI',
              info: {
                  h: 256,
                  w: 256,
                  mimetype: 'image/png',
                  size: 164934,
              }
          }
        }
        
        state.api.sendSticker(sticker)
      }} class="test-button">
        Send Sticker
      </button>
    </>
  )
})

export async function sendSticker() {
  // const api = new WidgetApi()
  console.log('meow meow')
  // console.log(api.sendSticker)
}
