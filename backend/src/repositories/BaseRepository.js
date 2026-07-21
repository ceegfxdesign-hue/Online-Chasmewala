/**
 * Generic data-access layer over a Mongoose model. Specialized repositories
 * extend this and add domain-specific queries. Controllers/services never touch
 * models directly — they go through repositories.
 */
export class BaseRepository {
  /** @param {import('mongoose').Model} model */
  constructor(model) {
    this.model = model;
  }

  create(data) {
    return this.model.create(data);
  }

  insertMany(docs) {
    return this.model.insertMany(docs);
  }

  findById(id, { populate, select } = {}) {
    let q = this.model.findById(id);
    if (populate) q = q.populate(populate);
    if (select) q = q.select(select);
    return q;
  }

  findOne(filter = {}, { populate, select } = {}) {
    let q = this.model.findOne(filter);
    if (populate) q = q.populate(populate);
    if (select) q = q.select(select);
    return q;
  }

  find(filter = {}, { populate, select, sort, skip, limit, lean = false } = {}) {
    let q = this.model.find(filter);
    if (populate) q = q.populate(populate);
    if (select) q = q.select(select);
    if (sort) q = q.sort(sort);
    if (typeof skip === 'number') q = q.skip(skip);
    if (typeof limit === 'number') q = q.limit(limit);
    if (lean) q = q.lean();
    return q;
  }

  count(filter = {}) {
    return this.model.countDocuments(filter);
  }

  exists(filter) {
    return this.model.exists(filter);
  }

  updateById(id, update, options = { new: true, runValidators: true }) {
    return this.model.findByIdAndUpdate(id, update, options);
  }

  updateOne(filter, update, options = { new: true, runValidators: true }) {
    return this.model.findOneAndUpdate(filter, update, options);
  }

  deleteById(id) {
    return this.model.findByIdAndDelete(id);
  }

  deleteMany(filter = {}) {
    return this.model.deleteMany(filter);
  }

  /** Paginated helper returning `{ data, total }`. */
  async paginate(filter = {}, { sort = { createdAt: -1 }, skip = 0, limit = 12, populate, select, lean = true } = {}) {
    const [data, total] = await Promise.all([
      this.find(filter, { sort, skip, limit, populate, select, lean }),
      this.count(filter),
    ]);
    return { data, total };
  }

  aggregate(pipeline) {
    return this.model.aggregate(pipeline);
  }
}

export default BaseRepository;
