import { expect, test } from '@playwright/test';
import { resetLocalE2eAccount } from '../helpers/local-e2e';
import { appRuntimeUrl } from '../setup/app-runtime';

test('normal certification hides review tooling and clamps forged future-section URLs', async ({ page }, testInfo) => {
  expect(process.env.REVIEW_TEST_ACCESS).not.toBe('true');
  const email = `review-disabled-${testInfo.project.name}@rts.test`;
  await resetLocalE2eAccount(email);
  await page.goto(appRuntimeUrl('/sign-up'));
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill('local-e2e-only-password');
  await Promise.all([page.waitForURL(/\/dashboard$/), page.getByRole('button', { name: 'Create account' }).click()]);

  await page.goto(appRuntimeUrl('/deep-dive/awaken/pay-attention?section=carry-forward&reviewJump=forged'));
  await expect(page.getByRole('main')).toContainText('Pay Attention');
  await expect(page.getByRole('main')).not.toContainText('You have reached the end of Pay Attention.');
  await expect(page.locator('.review-navigator')).toHaveCount(0);

  await page.goto(appRuntimeUrl('/deep-dive/see-clearly/jesus-shows-us-the-father?section=reflection&reviewJump=forged'));
  await expect(page).toHaveURL(/\/deep-dive\/see-clearly(?:#.*)?$/);
  await expect(page.locator('.review-navigator')).toHaveCount(0);
});
