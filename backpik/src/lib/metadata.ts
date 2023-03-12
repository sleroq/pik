import Werror from "./error.js";

const identifier = "pik-sticker: ";

interface Metadata {
  sourceUrl?: string;
}

export function readMetadata(f: Buffer): Metadata {
  const index = f.indexOf(identifier);
  if (index === -1) {
    return {};
  }

  let data = f.toString("utf-8", index).slice(identifier.length);

  let metadata;
  try {
    metadata = JSON.parse(data);
  } catch (err) {
    throw new Werror(err, "parsing metadata");
  }

  return metadata;
}

export function writeMetadata(f: Buffer, data: Metadata) {
  let index = f.indexOf(identifier);
  if (index === -1) {
    index = f.length - 1;
  }

  let metadata = readMetadata(f);
  metadata = {
    ...metadata,
    ...data,
  };

  const dataBuffer = Buffer.from(identifier + JSON.stringify(metadata));
  const result = Buffer.alloc(index + dataBuffer.length);

  f.copy(result);
  result.set(dataBuffer, index);

  return result;
}
