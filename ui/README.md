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

```bash
$ npm install # or pnpm install or yarn install
```

## Development

### Develop

```bash
yarn dev
```

### Lint & format

```bash
yarn lint:fix
```

### Preview

```bash
yarn preview
```

### Build

```bash
yarn build
```

You can deploy the `dist` folder to any static host provider (netlify, surge, now, etc.)
