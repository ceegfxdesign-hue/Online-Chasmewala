/**
 * Cart business logic. The cart is server-authoritative for logged-in users:
 * prices are re-derived from the live product on every read so stale client
 * prices can never be trusted. Supports a merge operation for guest→user login.
 */
import { cartRepository, productRepository } from '../repositories/index.js';
import { ApiError } from '../utils/ApiError.js';

const LENS_LABELS = {
  'single-vision': 'Single Vision',
  'zero-power': 'Zero Power',
  'blue-light': 'Blue-Light Block',
  progressive: 'Progressive',
  bifocal: 'Bifocal',
};

async function getOrCreate(userId) {
  let cart = await cartRepository.findOne({ user: userId });
  if (!cart) cart = await cartRepository.create({ user: userId, items: [] });
  return cart;
}

/** Hydrate cart items with live product data and compute totals. */
async function hydrate(cart) {
  const ids = cart.items.map((i) => i.product);
  const products = await productRepository.find(
    { _id: { $in: ids } },
    { populate: 'brand', lean: true }
  );
  const map = Object.fromEntries(products.map((p) => [String(p._id), p]));

  const items = [];
  let removed = false;
  for (const item of cart.items) {
    const product = map[String(item.product)];
    if (!product || !product.isActive) {
      removed = true;
      continue;
    }
    const lensPrice = item.lensOption?.price || 0;
    items.push({
      _id: item._id,
      product: {
        _id: product._id,
        name: product.name,
        slug: product.slug,
        image: product.images?.[0],
        brand: product.brand?.name,
        stock: product.stock,
      },
      variantId: item.variantId,
      color: item.color,
      quantity: item.quantity,
      unitPrice: product.price + lensPrice,
      basePrice: product.price,
      mrp: product.mrp,
      lensOption: item.lensOption,
      prescription: item.prescription,
      lineTotal: (product.price + lensPrice) * item.quantity,
      inStock: product.stock >= item.quantity,
    });
  }

  const subtotal = items.reduce((s, i) => s + i.lineTotal, 0);
  const mrpTotal = items.reduce((s, i) => s + i.mrp * i.quantity, 0);
  return {
    items,
    summary: {
      itemCount: items.reduce((s, i) => s + i.quantity, 0),
      subtotal,
      mrpTotal,
      savings: Math.max(0, mrpTotal - subtotal),
    },
    coupon: cart.coupon?.code ? cart.coupon : null,
    _removedUnavailable: removed,
  };
}

export const cartService = {
  async get(userId) {
    const cart = await getOrCreate(userId);
    return hydrate(cart);
  },

  async addItem(userId, payload) {
    const product = await productRepository.findById(payload.productId).lean();
    if (!product || !product.isActive) throw ApiError.notFound('Product not found');
    if (product.stock <= 0) throw ApiError.badRequest('This product is out of stock');

    const cart = await getOrCreate(userId);
    const lensOption = payload.lensOption
      ? {
          type: payload.lensOption.type,
          label: payload.lensOption.label || LENS_LABELS[payload.lensOption.type] || 'Lens',
          price: payload.lensOption.price || 0,
        }
      : undefined;

    const keyMatch = (i) =>
      String(i.product) === String(payload.productId) &&
      String(i.variantId || '') === String(payload.variantId || '') &&
      (i.lensOption?.type || '') === (lensOption?.type || '');

    const existing = cart.items.find(keyMatch);
    const qty = payload.quantity || 1;
    if (existing) {
      existing.quantity = Math.min(existing.quantity + qty, product.stock);
    } else {
      cart.items.push({
        product: payload.productId,
        variantId: payload.variantId,
        color: payload.color,
        quantity: Math.min(qty, product.stock),
        price: product.price,
        lensOption,
        prescription: payload.prescription,
      });
    }
    await cart.save();
    return hydrate(cart);
  },

  async updateItem(userId, itemId, quantity) {
    const cart = await getOrCreate(userId);
    const item = cart.items.id(itemId);
    if (!item) throw ApiError.notFound('Cart item not found');
    if (quantity <= 0) {
      item.deleteOne();
    } else {
      const product = await productRepository.findById(item.product).lean();
      item.quantity = Math.min(quantity, product?.stock ?? quantity);
    }
    await cart.save();
    return hydrate(cart);
  },

  async removeItem(userId, itemId) {
    const cart = await getOrCreate(userId);
    const item = cart.items.id(itemId);
    if (item) item.deleteOne();
    await cart.save();
    return hydrate(cart);
  },

  async clear(userId) {
    const cart = await getOrCreate(userId);
    cart.items = [];
    cart.coupon = undefined;
    await cart.save();
    return hydrate(cart);
  },

  /** Merge a guest cart (from localStorage) into the user's server cart on login. */
  async merge(userId, guestItems = []) {
    if (!guestItems.length) return this.get(userId);
    const cart = await getOrCreate(userId);
    for (const gi of guestItems) {
      const product = await productRepository.findById(gi.productId).lean();
      if (!product || !product.isActive) continue;
      const match = cart.items.find(
        (i) =>
          String(i.product) === String(gi.productId) &&
          String(i.variantId || '') === String(gi.variantId || '') &&
          (i.lensOption?.type || '') === (gi.lensOption?.type || '')
      );
      if (match) match.quantity = Math.min(match.quantity + (gi.quantity || 1), product.stock);
      else
        cart.items.push({
          product: gi.productId,
          variantId: gi.variantId,
          color: gi.color,
          quantity: Math.min(gi.quantity || 1, product.stock),
          price: product.price,
          lensOption: gi.lensOption,
        });
    }
    await cart.save();
    return hydrate(cart);
  },
};

export default cartService;
