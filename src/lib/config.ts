const sbb_version_suffix = import.meta.env.MODE !== 'production' ? '-dev' : '';
//@ts-ignore
export const sbb_release = SBB_APP_NAME + '@' + SBB_VERSION + sbb_version_suffix;
