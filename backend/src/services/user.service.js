/**
 * User account business logic: profile, addresses and saved cards. Auth/session
 * concerns live in auth.service; this handles the logged-in user's own data.
 */
import { userRepository } from '../repositories/index.js';
import { ApiError } from '../utils/ApiError.js';

async function loadUser(userId) {
  const user = await userRepository.findById(userId);
  if (!user) throw ApiError.notFound('User not found');
  return user;
}

export const userService = {
  async updateProfile(userId, data) {
    const user = await loadUser(userId);
    const allowed = ['name', 'phone', 'avatar'];
    allowed.forEach((k) => {
      if (data[k] !== undefined) user[k] = data[k];
    });
    if (data.preferences) {
      user.preferences = { ...user.preferences?.toObject?.(), ...data.preferences };
    }
    await user.save();
    return user.toJSON();
  },

  async changePassword(userId, { currentPassword, newPassword }) {
    const user = await userRepository.findById(userId).select('+password');
    const ok = await user.comparePassword(currentPassword);
    if (!ok) throw ApiError.badRequest('Current password is incorrect');
    user.password = newPassword;
    user.refreshTokens = []; // sign out other sessions
    await user.save();
    return { changed: true };
  },

  // ── Addresses ───────────────────────────────────────────────────────────────
  async listAddresses(userId) {
    const user = await loadUser(userId);
    return user.addresses;
  },

  async addAddress(userId, address) {
    const user = await loadUser(userId);
    if (address.isDefault || user.addresses.length === 0) {
      user.addresses.forEach((a) => (a.isDefault = false));
      address.isDefault = true;
    }
    user.addresses.push(address);
    await user.save();
    return user.addresses;
  },

  async updateAddress(userId, addressId, data) {
    const user = await loadUser(userId);
    const address = user.addresses.id(addressId);
    if (!address) throw ApiError.notFound('Address not found');
    if (data.isDefault) user.addresses.forEach((a) => (a.isDefault = false));
    Object.assign(address, data);
    await user.save();
    return user.addresses;
  },

  async removeAddress(userId, addressId) {
    const user = await loadUser(userId);
    const address = user.addresses.id(addressId);
    if (!address) throw ApiError.notFound('Address not found');
    const wasDefault = address.isDefault;
    address.deleteOne();
    if (wasDefault && user.addresses.length) user.addresses[0].isDefault = true;
    await user.save();
    return user.addresses;
  },

  // ── Saved cards (tokenized display data only) ───────────────────────────────
  async listCards(userId) {
    const user = await loadUser(userId);
    return user.savedCards;
  },

  async addCard(userId, card) {
    const user = await loadUser(userId);
    // Store only display data + an opaque token — never a full PAN.
    const last4 = String(card.number).replace(/\s/g, '').slice(-4);
    const entry = {
      brand: card.brand || 'card',
      last4,
      expiryMonth: card.expiryMonth,
      expiryYear: card.expiryYear,
      holderName: card.holderName,
      token: `tok_${last4}_${Date.now().toString(36)}`,
      isDefault: card.isDefault || user.savedCards.length === 0,
    };
    if (entry.isDefault) user.savedCards.forEach((c) => (c.isDefault = false));
    user.savedCards.push(entry);
    await user.save();
    return user.savedCards;
  },

  async removeCard(userId, cardId) {
    const user = await loadUser(userId);
    const card = user.savedCards.id(cardId);
    if (!card) throw ApiError.notFound('Card not found');
    card.deleteOne();
    await user.save();
    return user.savedCards;
  },
};

export default userService;
