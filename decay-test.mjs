import { emptyProfiles, touchUser, getProfile } from './src/qq/profiles.ts';

const DAY = 24 * 60 * 60 * 1000;
function make(lastDaysAgo, fam = 50) {
  const p = emptyProfiles();
  const now = Date.now();
  const profile = touchUser(p, 'g', '1', '测试', { initialAffinity: 0, now: now - lastDaysAgo * DAY });
  profile.familiarity = fam;
  return getProfile(p, 'g', '1').familiarity;
}
for (const d of [13, 14, 21, 35, 100]) console.log(d + '天:', make(d));
