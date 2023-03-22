# Pik
Sticker picker for [Element](https://element.io/)

<img src="https://i.ibb.co/1XjSCyR/2023-03-12-22-49.png" alt="pik-preview">

## Features

- Importing packs from telegram
- Removing packs from UI
- Adding stickers pack from received sticker
- Folding packs
- Group sticker packs
- Video-stickers are supported ([issue](https://github.com/vector-im/element-web/issues/24873￥))
- Federative API (possible to add sticker pack from another instance)

## Usage

### Add Pik to room

Add this widget by typing `/addwidget https://pik.sleroq.link/?widgetId=$matrix_widget_id&userId=$matrix_user_id`


You can set stickers for everyone in the room by adding `groupPacks=@username:server.link` parameter. Sticker packs of specified user will be prepended for everyone else.

### Replace user sticker-picker

1. Type `/devtools` in any chat and press `Enter`
2. Click "Explore account data"
3. Find and click "m.widgets"
4. Click "edit" and replace with following content:

Before copying replace `@you:matrix.server.name` with your real userId

```json
{
  "stickerpicker": {
    "content": {
      "type": "m.stickerpicker",
      "url": "https://pik.sleroq.link/?widgetId=$matrix_widget_id&userId=$matrix_user_id",
      "name": "Stickerpicker",
      "creatorUserId": "@you:matrix.server.name",
      "data": {}
    },
    "sender": "@you:matrix.server.name",
    "state_key": "stickerpicker",
    "type": "m.widget",
    "id": "stickerpicker"
  }
}
```

