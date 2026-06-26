const asyncHandler = require('./asyncHandler');

/**
 * Build standard CRUD controller actions from a service.
 * Responses use a consistent envelope: lists/getById return the data directly;
 * create/update/remove return { message, data }.
 *
 *   // controllers/widget.controller.js
 *   const createCrudController = require('../utils/crudController');
 *   const widgetService = require('../services/widget.service');
 *   module.exports = createCrudController(widgetService, { resourceName: 'Widget' });
 *
 * Add a custom action:
 *   const base = createCrudController(widgetService, { resourceName: 'Widget' });
 *   module.exports = { ...base, archive: asyncHandler(async (req, res) => { ... }) };
 */
function createCrudController(service, { resourceName = 'Resource' } = {}) {
  return {
    list: asyncHandler(async (req, res) => {
      // Pagination is opt-in via ?page / ?limit (else a plain array, as before).
      const { page, limit } = req.query;
      res.json(await service.list({}, { page, limit }));
    }),

    getById: asyncHandler(async (req, res) => {
      res.json(await service.getById(req.params.id));
    }),

    create: asyncHandler(async (req, res) => {
      const data = await service.create(req.body);
      res.status(201).json({ message: `${resourceName} created`, data });
    }),

    update: asyncHandler(async (req, res) => {
      const data = await service.update(req.params.id, req.body);
      res.json({ message: `${resourceName} updated`, data });
    }),

    remove: asyncHandler(async (req, res) => {
      const data = await service.remove(req.params.id);
      res.json({ message: `${resourceName} deleted`, data });
    }),
  };
}

module.exports = createCrudController;
