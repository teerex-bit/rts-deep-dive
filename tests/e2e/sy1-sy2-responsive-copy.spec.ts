import pg from 'pg';
import { expect, test } from '@playwright/test';
import { resetLocalE2eAccount } from '../helpers/local-e2e';
import { appRuntimeUrl } from '../setup/app-runtime';
import { e2eUser } from '../fixtures/users';

test('captures the SY1 handoff and affected SY2 screens at mobile and desktop widths', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile-375', 'This test explicitly checks its own responsive viewport set.');
  const user = e2eUser('sy1-sy2-responsive-copy', testInfo.project.name);
  const pool = new pg.Pool({ connectionString: process.env.TEST_DATABASE_URL });
  await resetLocalE2eAccount(user.email);
  try {
    await page.goto(appRuntimeUrl('/sign-up'));
    await page.getByLabel('Email').fill(user.email);
    await page.getByLabel('Password').fill(user.password);
    await Promise.all([page.waitForURL(/\/dashboard$/), page.getByRole('button', { name: 'Create account' }).click()]);
    const owner = (await pool.query<{ id: string }>('select id from auth.users where email=$1', [user.email])).rows[0].id;
    await pool.query(`insert into public.deep_dive_module_progress(user_id,curriculum_version_id,module_id,last_section_id,completed_at)
      values($1,'phase-1-v1','see-clearly.sc1','carry-forward',now())`, [owner]);
    await pool.query(`insert into public.deep_dive_module_progress(user_id,curriculum_version_id,module_id,last_section_id,completed_at)
      values($1,'phase-1-v1','see-clearly.sy2','carry-forward',now())`, [owner]);

    const widths = [375, 390, 430, 1536];
    for (const width of widths) {
      await page.setViewportSize({ width, height: width === 1536 ? 960 : 844 });
      await page.goto(appRuntimeUrl('/deep-dive/see-clearly/facts-and-interpretation?section=carry-forward'));
      await expect(page.getByRole('heading', { name: 'Keep the two distinct' })).toBeVisible();
      await expect(page.getByText(/meaning can connect with belief, expectation, desire, intention, choice/)).toBeVisible();
      const sy1Next = page.getByRole('link', { name: 'NEXT' });
      await expect(sy1Next).toHaveAttribute('href', '/deep-dive/see-clearly/follow-the-formation-chain');
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      await page.screenshot({ path: testInfo.outputPath(`sy1-final-${width}.png`), fullPage: true });
      await sy1Next.click();
      await expect(page.getByRole('heading', { name: 'How a Reaction Takes Shape' })).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      await page.screenshot({ path: testInfo.outputPath(`sy2-progression-${width}.png`), fullPage: true });

      for (const [section, heading] of [
        ['chain', 'The formation chain'],
        ['example', 'How one meaning can travel'],
        ['trace', 'Trace one real moment'],
        ['reflection', 'What became clearer?'],
        ['practice', 'Notice a chain as it forms'],
      ] as const) {
        await page.goto(appRuntimeUrl(`/deep-dive/see-clearly/follow-the-formation-chain?section=${section}`));
        if (section === 'chain') {
          await expect(page.getByRole('list', { name: heading })).toBeVisible();
        } else {
          await expect(page.getByRole('heading', { name: heading })).toBeVisible();
        }
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
        await page.screenshot({ path: testInfo.outputPath(`sy2-${section}-${width}.png`), fullPage: true });
      }
    }
  } finally {
    await pool.end();
    await resetLocalE2eAccount(user.email);
  }
});
