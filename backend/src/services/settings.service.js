/** Store-wide configuration used by checkout and the admin panel. */
import { settingsRepository } from '../repositories/index.js';

export const settingsService = {
  async get() {
    let settings = await settingsRepository.findOne({ key: 'global' });
    if (!settings) settings = await settingsRepository.create({ key: 'global' });
    return settings;
  },
  async update(data) {
    const settings = await this.get();
    return settingsRepository.updateById(settings._id, data);
  },
};

export default settingsService;
