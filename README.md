# Pik
Sticker picker

<img src="https://i.ibb.co/ZMMB7v3/pik-preview.png" alt="pik-preview">

## Usage

### Add Pik to room

Add this widget by typing `/addwidget https://pik.sleroq.link/?widgetId=$matrix_widget_id&userId=$matrix_user_id`

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

