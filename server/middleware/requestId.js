import { v4 as uuidv4 } from 'uuid';

/**
 * Generates a UUID for every incoming request, attaches it as `req.requestId`,
 * sets it on the `X-Request-Id` response header, and wraps `res.json` so
 * EVERY JSON response — success or error, from any controller or the error
 * handler — automatically includes `requestId` without each of those call
 * sites needing to remember to add it manually. This is what makes
 * "include requestId in every API response" actually hold everywhere,
 * rather than being a convention someone can forget in one controller.
 *
 * Must be registered before routes and before the error handler so both
 * paths get the wrapped `res.json`.
 */
export function requestId(req, res, next) {
  const id = uuidv4();
  req.requestId = id;
  res.setHeader('X-Request-Id', id);

  const originalJson = res.json.bind(res);
  res.json = (body) => originalJson({ requestId: id, ...body });

  next();
}
