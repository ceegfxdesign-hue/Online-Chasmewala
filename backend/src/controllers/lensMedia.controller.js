import multer from 'multer';
import { LensMedia } from '../models/LensMedia.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { sendSuccess } from '../utils/ApiResponse.js';

const types = ['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/webm'];
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 12 * 1024 * 1024, files: 1, fields: 0 },
  fileFilter: (_req, file, cb) =>
    cb(
      types.includes(file.mimetype)
        ? null
        : ApiError.badRequest('Use JPG, PNG, WebP, MP4 or WebM.'),
      types.includes(file.mimetype)
    ),
}).single('file');
export const receiveLensMedia = (req, res, next) =>
  upload(req, res, (error) =>
    next(
      error
        ? ApiError.badRequest(
            error.code === 'LIMIT_FILE_SIZE' ? 'Maximum upload size is 12 MB.' : error.message
          )
        : undefined
    )
  );
export const saveLensMedia = asyncHandler(async (req, res) => {
  const file = req.file;
  if (!file) throw ApiError.badRequest('Choose a media file.');
  const b = file.buffer;
  const matches = {
    'image/jpeg': b.length > 3 && b[0] === 255 && b[1] === 216 && b[2] === 255,
    'image/png': b.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])),
    'image/webp': b.toString('ascii', 0, 4) === 'RIFF' && b.toString('ascii', 8, 12) === 'WEBP',
    'video/mp4': b.toString('ascii', 4, 8) === 'ftyp',
    'video/webm': b.subarray(0, 4).equals(Buffer.from([26, 69, 223, 163])),
  };
  if (!matches[file.mimetype])
    throw ApiError.badRequest('The file contents do not match its media type.');
  const media = await LensMedia.create({ content: b, mimeType: file.mimetype, size: file.size });
  return sendSuccess(res, {
    data: { url: '/api/v1/lens-media/' + media._id, mimeType: media.mimeType },
    statusCode: 201,
  });
});
export const getLensMedia = asyncHandler(async (req, res) => {
  if (!/^[a-f0-9]{24}$/i.test(req.params.id)) throw ApiError.notFound('Media not found.');
  const media = await LensMedia.findById(req.params.id).select('+content');
  if (!media) throw ApiError.notFound('Media not found.');
  res.set({
    'Content-Type': media.mimeType,
    'X-Content-Type-Options': 'nosniff',
    'Cross-Origin-Resource-Policy': 'cross-origin',
    'Cache-Control': 'public, max-age=31536000, immutable',
    'Accept-Ranges': 'bytes',
  });
  const range = req.headers.range;
  if (range) {
    const match = /^bytes=(\d*)-(\d*)$/.exec(range);
    const start =
      match && match[1] ? Number(match[1]) : Math.max(0, media.size - Number(match?.[2]));
    const end =
      match && match[1] && match[2] ? Math.min(Number(match[2]), media.size - 1) : media.size - 1;
    if (
      !match ||
      (!match[1] && !match[2]) ||
      !Number.isSafeInteger(start) ||
      start < 0 ||
      start > end ||
      start >= media.size
    )
      return res
        .status(416)
        .set('Content-Range', 'bytes */' + media.size)
        .end();
    res.status(206).set('Content-Range', 'bytes ' + start + '-' + end + '/' + media.size);
    return res.send(media.content.subarray(start, end + 1));
  }
  return res.send(media.content);
});
