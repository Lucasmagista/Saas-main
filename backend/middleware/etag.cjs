const crypto = require('crypto');

function computeETag(body) {
  const hash = crypto.createHash('sha1').update(body).digest('base64');
  return `W/"${hash}"`;
}

function withETag(handler) {
  return async (req, res, next) => {
    try {
      // Monkey-patch res.json para calcular ETag
      const originalJson = res.json.bind(res);
      res.json = (data) => {
        try {
          const body = JSON.stringify(data);
          const etag = computeETag(body);
          const ifNoneMatch = req.headers['if-none-match'];
          if (ifNoneMatch && ifNoneMatch === etag) {
            res.status(304);
            return res.end();
          }
          res.set('ETag', etag);
          return originalJson(data);
        } catch (e) {
          return originalJson(data);
        }
      };
      return handler(req, res, next);
    } catch (err) {
      next(err);
    }
  };
}

module.exports = { withETag };

