/* Minimal MP4 writer for one H.264 video track: ftyp + moov (fast start) + mdat, constant frame rate.
   samples: [{ data: Uint8Array (AVCC length-prefixed), key: boolean }] in decode order; avcC: decoder config bytes.
   shortcut: no B-frames (ctts) and no audio track; WebCodecs' H.264 encoder emits neither, add them if that changes. */
window.muxMp4 = function (samples, avcC, width, height, fps) {
  var timescale = fps * 1000, delta = 1000, count = samples.length, durationMs = Math.round(count * 1000 / fps);
  function u32(n) { return [n >>> 24 & 255, n >>> 16 & 255, n >>> 8 & 255, n & 255]; }
  function u16(n) { return [n >>> 8 & 255, n & 255]; }
  function str(s) { return Array.from(s, function (c) { return c.charCodeAt(0); }); }
  function box(type) { var parts = Array.prototype.slice.call(arguments, 1), body = [].concat.apply([], parts.map(function (p) { return Array.from(p); })); return u32(8 + body.length).concat(str(type), body); }
  function full(type, version, flags) { return box.apply(null, [type, [version].concat(u32(flags).slice(1))].concat(Array.prototype.slice.call(arguments, 3))); }
  var matrix = [].concat(u32(0x10000), u32(0), u32(0), u32(0), u32(0x10000), u32(0), u32(0), u32(0), u32(0x40000000));
  var zeros = function (n) { return new Array(n).fill(0); };

  function moov(mdatOffset) {
    var avc1 = box('avc1', zeros(6), u16(1), zeros(16), u16(width), u16(height), u32(0x480000), u32(0x480000), u32(0), u16(1), zeros(32), u16(0x18), u16(0xffff), box('avcC', avcC));
    var keys = []; samples.forEach(function (s, i) { if (s.key) keys.push(i + 1); });
    var stbl = box('stbl',
      full('stsd', 0, 0, u32(1), avc1),
      full('stts', 0, 0, u32(1), u32(count), u32(delta)),
      full('stss', 0, 0, u32(keys.length), [].concat.apply([], keys.map(u32))),
      full('stsc', 0, 0, u32(1), u32(1), u32(count), u32(1)),
      full('stsz', 0, 0, u32(0), u32(count), [].concat.apply([], samples.map(function (s) { return u32(s.data.length); }))),
      full('stco', 0, 0, u32(1), u32(mdatOffset)));
    var minf = box('minf', full('vmhd', 0, 1, zeros(8)), box('dinf', full('dref', 0, 0, u32(1), full('url ', 0, 1))), stbl);
    var mdia = box('mdia', full('mdhd', 0, 0, u32(0), u32(0), u32(timescale), u32(count * delta), u16(0x55c4), u16(0)), full('hdlr', 0, 0, u32(0), str('vide'), zeros(12), str('VideoHandler'), [0]), minf);
    var trak = box('trak', full('tkhd', 0, 3, u32(0), u32(0), u32(1), u32(0), u32(durationMs), zeros(8), u16(0), u16(0), u16(0), u16(0), matrix, u32(width * 65536), u32(height * 65536)), mdia);
    return box('moov', full('mvhd', 0, 0, u32(0), u32(0), u32(1000), u32(durationMs), u32(0x10000), u16(0x100), zeros(10), matrix, zeros(24), u32(2)), trak);
  }
  var ftyp = box('ftyp', str('isom'), u32(512), str('isom'), str('iso2'), str('avc1'), str('mp41'));
  var size = moov(0).length, dataBytes = samples.reduce(function (n, s) { return n + s.data.length; }, 0);
  var head = new Uint8Array(ftyp.concat(moov(ftyp.length + size + 8), u32(8 + dataBytes), str('mdat')));
  return new Blob([head].concat(samples.map(function (s) { return s.data; })), { type: 'video/mp4' });
};
