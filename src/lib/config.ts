export const sbb_app_name = 'sutom-but-better';
const sbb_version_suffix = process.env.NODE_ENV !== 'production' ? 'dev' : '';
export const sbb_version = process.env.npm_package_version;
export const sbb_release = sbb_app_name + '@' + sbb_version + '-' + sbb_version_suffix;

console.debug('START release', sbb_release);
