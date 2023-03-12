import { MessageEvent, MessageEventContent} from "matrix-bot-sdk";
// import {RoomEvent} from "matrix-bot-sdk/src/models/events/RoomEvent.js";

export interface MessageContent extends MessageEventContent {
    "m.relates_to"?: {
        "m.in_reply_to"?: { event_id: string };
    };
    format?: string
    formatted_body?: string
}

export class MyMessageEvent extends MessageEvent<MessageContent> {
    constructor(event: any) {
        super(event);
    }

    get replyEvent(): string | undefined {
        const eventId = this.content?.['m.relates_to']?.['m.in_reply_to']?.event_id
        if (eventId) return eventId
        return
    }

    get msg(): string {
        if (this.content.formatted_body) {
            const parts = this.content.formatted_body.split('</mx-reply>')
            const latest = parts[parts.length - 1]
            return latest?.trim() || this.textBody
        }
        return this.textBody
    }
}

// interface StickerContent {
//     url: string,
//     info: { h: number, w: number, mimetype: string, size: number },
//     body: string
// }
//
// export class StickerEvent extends RoomEvent<StickerContent> {
//     constructor(event: any) {
//         super(event);
//     }
// }