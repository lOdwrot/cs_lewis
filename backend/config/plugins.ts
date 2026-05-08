import type { Core } from '@strapi/strapi';

const config = ({ env }: Core.Config.Shared.ConfigParams): Core.Config.Plugin => {
  const cloudName = env('CLOUDINARY_NAME');
  const apiKey = env('CLOUDINARY_KEY');
  const apiSecret = env('CLOUDINARY_SECRET');
  const useCloudinary = Boolean(cloudName && apiKey && apiSecret);

  if (!useCloudinary) return {};

  return {
    upload: {
      config: {
        provider: 'cloudinary',
        providerOptions: {
          cloud_name: cloudName,
          api_key: apiKey,
          api_secret: apiSecret,
        },
        actionOptions: {
          upload: {},
          uploadStream: {},
          delete: {},
        },
      },
    },
  };
};

export default config;
