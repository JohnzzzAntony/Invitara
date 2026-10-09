// Photos are JSON fields, never executable uploads or filesystem filenames.
export function validatePhoto(value) {
  if (!value) return;
  if (value.startsWith('data:')) {
    const match = /^data:image\/(jpeg|png|webp);base64,([A-Za-z0-9+/]+={0,2})$/.exec(value);
    if (!match || match[2].length % 4) throw new Error('Use a JPEG, PNG or WebP image.');
    const bytes = Buffer.from(match[2], 'base64');
    const valid = match[1] === 'jpeg' ? bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255 :
      match[1] === 'png' ? bytes.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10])) :
        bytes.toString('ascii', 0, 4) === 'RIFF' && bytes.toString('ascii', 8, 12) === 'WEBP';
    if (!valid || bytes.length < 16 || bytes.length > 7500000) throw new Error('The image is invalid or too large. Choose a smaller photo.');
    return;
  }
  if (/^https?:\/\//.test(value)) {
    let url;
    try { url = new URL(value); } catch { throw new Error('Use a valid image URL.'); }
    if (url.username || url.password) throw new Error('Image URLs cannot contain credentials.');
    return;
  }
  if (!/^(?:[a-zA-Z0-9_-]+|(?:\/?assets\/|\/?mu\/images\/)[a-zA-Z0-9_./-]+)$/.test(value) || value.includes('..')) throw new Error('Use a library photo or a valid image URL.');
}
