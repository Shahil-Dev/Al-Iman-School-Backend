import { RequestHandler } from 'express';

const notFound: RequestHandler = (req, res, next) => {
  return res.status(404).json({
    success: false,
    message: 'API Route Not Found!',
    errorSources: [
      {
        path: req.originalUrl,
        message: 'API Route Not Found!',
      },
    ],
  });
};

export default notFound;