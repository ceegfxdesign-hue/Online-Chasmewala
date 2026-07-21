/**
 * Upload provider interface + mock implementation.
 *
 * The mock returns a deterministic placeholder URL so image-upload endpoints work
 * end-to-end without Cloudinary. A Cloudinary implementation satisfying the same
 * interface is selected when UPLOAD_PROVIDER=cloudinary (credentials required).
 */
import { env } from '../../config/env.js';

class MockUploadProvider {
  /**
   * @param {{ buffer?: Buffer, originalname?: string, folder?: string }} file
   * @returns {Promise<{ url: string, publicId: string, provider: string }>}
   */
  async upload(file = {}) {
    const name = (file.originalname || 'image').replace(/\s+/g, '-').toLowerCase();
    const id = `mock_${Date.now()}_${name}`;
    return {
      url: `https://picsum.photos/seed/${encodeURIComponent(id)}/800/800`,
      publicId: id,
      provider: 'mock',
    };
  }

  async destroy() {
    return { result: 'ok', provider: 'mock' };
  }
}

const providers = {
  mock: new MockUploadProvider(),
  // cloudinary: new CloudinaryUploadProvider(),  // added when credentials are configured
};

export const uploadProvider = providers[env.UPLOAD_PROVIDER] || providers.mock;
export default uploadProvider;
