import { buildConfig } from 'payload/config';
import Examples from './collections/Examples';
import Users from './collections/Users';
import VoucherDetails from './collections/VoucherDetails';
import path from 'path';
import VoucherTypes from './collections/VoucherTypes';

export default buildConfig({
  serverURL: 'http://localhost:3000',
  admin: {
    user: Users.slug,
    css: path.resolve(__dirname, './app/styles/adminStyles.scss'),
  },
  collections: [
    Users,
    VoucherDetails,
    VoucherTypes,
    // Add Collections here
    // Examples
  ],
  localization: {
    locales: [
      'en',
      'ar',
    ],
    defaultLocale: 'en',
    fallback: true,
  },
});
