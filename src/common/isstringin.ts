export function isStringInBytes(target: string, buffer: Uint8Array, offset: number = 0, length: number = Infinity) {
  let start = Math.max(offset, 0);
  let end = Math.min(start + length, buffer.length);
  let whichByte = 0;
  let targetByte = target.charCodeAt(0);

  for (let i = start; i < end; i++) {
    let byte = buffer[i];

    if (byte === targetByte) {
      whichByte += 1;

      if (whichByte === target.length) {
        return true;
      }

      targetByte = target.charCodeAt(whichByte);
    } else if (whichByte > 0) {
      whichByte = 0;
      targetByte = target.charCodeAt(0);
    }
  }

  return false;
}

export function isStringInString(target: string, buffer: string, offset: number = 0, length: number = Infinity) {
  let start = Math.max(offset, 0);
  let end = Math.min(start + length, buffer.length);
  let whichByte = 0;
  let targetByte = target[0];

  for (let i = start; i < end; i++) {
    let byte = buffer[i];

    if (byte === targetByte) {
      whichByte += 1;

      if (whichByte === target.length) {
        return true;
      }

      targetByte = target[whichByte];
    } else if (whichByte > 0) {
      whichByte = 0;
      targetByte = target[0];
    }
  }

  return false;
}
