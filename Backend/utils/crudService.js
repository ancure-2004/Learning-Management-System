const ApiError = require('./ApiError');

/**
 * Build a standard CRUD service for a Mongoose model.
 *
 *   // services/widget.service.js
 *   const createCrudService = require('../utils/crudService');
 *   const Widget = require('../models/widget.model');
 *   module.exports = createCrudService(Widget, { resourceName: 'Widget', populate: 'owner' });
 *
 * Need a custom method too? Spread the base and add your own:
 *   const base = createCrudService(Widget, { resourceName: 'Widget' });
 *   module.exports = { ...base, async archive(id) { ... } };
 *
 * @param {import('mongoose').Model} Model
 * @param {object} opts
 * @param {string} [opts.resourceName]  Used in "<name> not found" errors.
 * @param {string|string[]|object} [opts.populate]  Mongoose populate spec.
 * @param {string|object} [opts.sort]  Default sort for list().
 */
function createCrudService(Model, { resourceName = 'Resource', populate = null, sort = null } = {}) {
  const populated = (query) => (populate ? query.populate(populate) : query);

  return {
    /**
     * List documents. Reads are `.lean()` for throughput.
     * Backward-compatible: returns a plain array UNLESS pagination is requested
     * (page/limit), in which case returns { data, total, page, limit, totalPages }.
     */
    async list(filter = {}, { page, limit } = {}) {
      const wantsPage = page !== undefined || limit !== undefined;
      let query = Model.find(filter);
      if (populate) query = query.populate(populate);
      if (sort) query = query.sort(sort);
      query = query.lean();

      if (!wantsPage) return query;

      const p = Math.max(1, Number(page) || 1);
      const l = Math.min(100, Math.max(1, Number(limit) || 20));
      const [data, total] = await Promise.all([
        query.skip((p - 1) * l).limit(l),
        Model.countDocuments(filter),
      ]);
      return { data, total, page: p, limit: l, totalPages: Math.ceil(total / l) };
    },

    async getById(id) {
      const doc = await populated(Model.findById(id)).lean();
      if (!doc) throw ApiError.notFound(`${resourceName} not found`);
      return doc;
    },

    async create(data) {
      const doc = await Model.create(data);
      return populate ? Model.findById(doc._id).populate(populate) : doc;
    },

    async update(id, data) {
      const doc = await populated(
        Model.findByIdAndUpdate(id, { $set: data }, { new: true, runValidators: true })
      );
      if (!doc) throw ApiError.notFound(`${resourceName} not found`);
      return doc;
    },

    async remove(id) {
      const doc = await Model.findByIdAndDelete(id);
      if (!doc) throw ApiError.notFound(`${resourceName} not found`);
      return doc;
    },
  };
}

module.exports = createCrudService;
