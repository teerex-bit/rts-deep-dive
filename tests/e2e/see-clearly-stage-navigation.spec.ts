import pg from 'pg';
import { expect, test } from '@playwright/test';
import { resetLocalE2eAccount } from '../helpers/local-e2e';
import { appRuntimeUrl } from '../setup/app-runtime';
import { e2eUser } from '../fixtures/users';

test('See Clearly hub routes through the legitimate next lesson and into the read-only Become doorway', async ({ page }, testInfo) => {
  const user = e2eUser('stage-navigation', testInfo.project.name);
  const pool = new pg.Pool({ connectionString: process.env.TEST_DATABASE_URL });
  await resetLocalE2eAccount(user.email);
  try {
    await page.goto(appRuntimeUrl('/sign-up'));
    await page.getByLabel('Email').fill(user.email);
    await page.getByLabel('Password').fill(user.password);
    await Promise.all([page.waitForURL(/\/dashboard$/), page.getByRole('button', { name: 'Create account' }).click()]);
    const owner = (await pool.query<{ id: string }>('select id from auth.users where email=$1', [user.email])).rows[0].id;
    async function complete(moduleId: string) {
      await pool.query(`insert into public.deep_dive_module_progress(user_id,curriculum_version_id,module_id,last_section_id,completed_at)
        values($1,'phase-1-v1',$2,'carry-forward',now())
        on conflict (user_id,curriculum_version_id,module_id) do update set last_section_id='carry-forward',completed_at=now()`, [owner, moduleId]);
    }
    async function inProgress(moduleId: string, section: string) {
      await pool.query(`insert into public.deep_dive_module_progress(user_id,curriculum_version_id,module_id,last_section_id)
        values($1,'phase-1-v1',$2,$3)
        on conflict (user_id,curriculum_version_id,module_id) do update set last_section_id=$3,completed_at=null`, [owner, moduleId, section]);
    }
    for (const moduleId of ['see-clearly.sc1', 'see-clearly.sy2']) await complete(moduleId);
    const hub = appRuntimeUrl('/deep-dive/see-clearly');
    await page.goto(hub);
    await expect(page.getByRole('link', { name: 'BACK TO FORMATION JOURNEY' })).toHaveAttribute('href', '/dashboard');
    const primary = page.getByRole('link', { name: /CONTINUE SEE CLEARLY|RESUME SEE CLEARLY|CONTINUE TO BECOME/ });
    await expect(primary).toContainText('The Learned Self-Story');
    await expect(page.getByRole('link', { name: 'Review SY2' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Begin SY4' })).toHaveCount(0);
    await primary.click();
    await expect(page).toHaveURL(/\/the-learned-self-story$/);

    await inProgress('see-clearly.sy3', 'teaching');
    await page.goto(hub);
    await expect(page.getByRole('link', { name: 'BACK TO FORMATION JOURNEY' })).toHaveAttribute('href', '/dashboard');
    await expect(primary).toContainText('RESUME SEE CLEARLY');
    await primary.click();
    await expect(page.getByRole('heading', { name: 'How a story becomes familiar' })).toBeVisible();
    await complete('see-clearly.sy3'); await complete('see-clearly.sy4');
    await page.goto(hub);
    await expect(page.getByRole('link', { name: 'BACK TO FORMATION JOURNEY' })).toHaveAttribute('href', '/dashboard');
    await expect(primary).toContainText('The God I Learned');
    await primary.click();
    await expect(page).toHaveURL(/\/the-god-i-learned$/);

    await complete('see-clearly.sg1');
    await inProgress('see-clearly.sg2', 'examples');
    await page.goto(hub);
    await expect(page.getByRole('link', { name: 'BACK TO FORMATION JOURNEY' })).toHaveAttribute('href', '/dashboard');
    await expect(primary).toContainText('What I Expect From God');
    await primary.click();
    await expect(page).toHaveURL(/\/what-i-expect-from-god$/);
    await expect(page.getByRole('heading', { name: 'What did I expect here?' })).toBeVisible();
    await complete('see-clearly.sg2');
    await inProgress('see-clearly.sg3', 'scripture');
    await page.goto(hub);
    await expect(page.getByRole('link', { name: 'BACK TO FORMATION JOURNEY' })).toHaveAttribute('href', '/dashboard');
    await expect(primary).toContainText('Jesus Shows Us the Father');
    await primary.click();
    await expect(page).toHaveURL(/\/jesus-shows-us-the-father$/);
    await expect(page.getByRole('heading', { name: 'To see Him is to see the Father' })).toBeVisible();
    await complete('see-clearly.sg3'); await complete('see-clearly.sg4');
    const before = (await pool.query('select module_id,last_section_id,completed_at,updated_at from public.deep_dive_module_progress where user_id=$1 order by module_id', [owner])).rows;
    await page.goto(hub);
    await expect(primary).toContainText('CONTINUE TO BECOME');
    await expect(page.getByRole('link', { name: 'Review SG4' })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.screenshot({ path: testInfo.outputPath(`see-clearly-hub-${testInfo.project.name}.png`), fullPage: true });
    await primary.focus(); await expect(primary).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/\/deep-dive\/become$/);
    await expect(page.getByRole('heading', { name: 'Live With God' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'The Person Being Formed' })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.screenshot({ path: testInfo.outputPath(`become-doorway-${testInfo.project.name}.png`), fullPage: true });
    await page.getByRole('link', { name: 'BACK TO SEE CLEARLY' }).click();
    await expect(page).toHaveURL(/\/deep-dive\/see-clearly$/);
    await page.getByRole('link', { name: 'BACK TO FORMATION JOURNEY' }).click();
    await expect(page).toHaveURL(/\/dashboard$/);
    expect((await pool.query('select module_id,last_section_id,completed_at,updated_at from public.deep_dive_module_progress where user_id=$1 order by module_id', [owner])).rows).toEqual(before);
  } finally { await pool.end(); await resetLocalE2eAccount(user.email); }
});
