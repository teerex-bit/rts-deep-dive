import pg from 'pg';
import { expect, test } from '@playwright/test';
import { resetLocalE2eAccount } from '../helpers/local-e2e';
import { appRuntimeUrl } from '../setup/app-runtime';
import { e2eUser } from '../fixtures/users';

const recap = '/deep-dive/see-clearly/what-has-become-clear';
const modules = ['sc1', 'sy2', 'sy3', 'sy4', 'sg1', 'sg2', 'sg3', 'sg4'];

test('stage recap uses owned words, leaves gaps open, confirms, and invalidates quotations on deletion', async ({ page }, testInfo) => {
  const user = e2eUser('recap', testInfo.project.name);
  const pool = new pg.Pool({ connectionString: process.env.TEST_DATABASE_URL });
  await resetLocalE2eAccount(user.email);
  try {
    await page.goto(appRuntimeUrl('/sign-up'));
    await page.getByLabel('Email').fill(user.email);
    await page.getByLabel('Password').fill(user.password);
    await Promise.all([page.waitForURL(/\/dashboard$/), page.getByRole('button', { name: 'Create account' }).click()]);
    await page.goto(appRuntimeUrl(recap));
    await expect(page).toHaveURL(/\/deep-dive\/see-clearly$/);
    const owner = (await pool.query<{ id: string }>('select id from auth.users where email=$1', [user.email])).rows[0].id;
    await pool.query(`insert into public.deep_dive_module_progress(user_id,curriculum_version_id,module_id,last_section_id,completed_at)
      select $1,'phase-1-v1','see-clearly.'||id,'carry-forward',now() from unnest($2::text[]) id`, [owner, modules]);
    const sy3Progress = (await pool.query<{ id: string }>(`select id from public.deep_dive_module_progress where user_id=$1 and module_id='see-clearly.sy3'`, [owner])).rows[0].id;
    await pool.query(`insert into public.see_clearly_sy3_records(user_id,progress_id,self_story_hypothesis)
      values($1,$2,'  I sometimes fear disappointing others.  ')`, [owner, sy3Progress]);
    await page.goto(appRuntimeUrl(recap));
    await expect(page.getByRole('heading', { name: 'What Has Become Clear' })).toBeVisible();
    await expect(page.getByText('You have spent time noticing the meanings, stories, expectations, and pictures that shape the way you respond.')).toBeVisible();
    await expect(page.getByText('Before moving on, look at what your own words show now.')).toBeVisible();
    await expect(page.getByText('Some things may already feel different. Some may still be unresolved. Both belong here.')).toBeVisible();
    const draft = page.getByLabel('The story I can see so far');
    await expect(draft).toHaveValue(/I sometimes fear disappointing others\./);
    await expect(draft).not.toHaveValue(/What I expected from God|___|undefined/);
    expect((await pool.query(`select count(*)::integer as n from public.see_clearly_recaps where user_id=$1`, [owner])).rows[0].n).toBe(0);
    await expect(page.locator('.deep-dive-recap')).not.toContainText(/\b(?:SY[1-4]|SG[1-4]|record|source|linked|provenance|controlling curriculum)\b/i);
    await page.getByText('Look back at what I wrote').click();
    await expect(page.getByText('You left this open.').first()).toBeVisible();
    await expect(page.getByRole('link', { name: 'ADD SOMETHING' }).first()).toHaveAttribute('href', /section=interaction&returnTo=recap/);
    await expect(page.getByText('This remains optional.').first()).toBeVisible();
    await page.getByRole('link', { name: 'ADD SOMETHING' }).first().click();
    await expect(page).toHaveURL(/facts-and-interpretation\?section=interaction&returnTo=recap/);
    await page.getByLabel('What could a careful witness observe?').fill('  A friend paused before replying.  ');
    await page.getByLabel('What did you immediately make it mean?').fill('  I had disappointed them.  ');
    await page.getByRole('button', { name: 'Save changes' }).click();
    await expect(page).toHaveURL(/what-has-become-clear$/);
    await expect(page.getByLabel('The story I can see so far')).toHaveValue(/A friend paused before replying/);
    await expect(page.getByRole('link', { name: 'Continue to Become' })).toHaveCount(0);
    expect((await pool.query(`select count(*)::integer as n from public.see_clearly_recaps where user_id=$1`, [owner])).rows[0].n).toBe(0);
    await draft.fill('Earlier I feared disappointing others. Now I can notice a pause without treating it as a verdict.');
    await page.getByRole('button', { name: 'KEEP EDITING' }).click();
    await expect(draft).toBeFocused();
    await expect(page.getByText('Does this still sound like your story as you understand it now?')).toBeVisible();
    await page.getByLabel('As you read this now, what has changed, become clearer, or no longer feels true? Optional').fill('I am learning that a mistake is not a verdict.');
    await page.getByLabel('What from this do you want to learn to live differently? Optional').fill('Ask for help instead of hiding.');
    await page.getByRole('button', { name: 'YES — SAVE THIS RECAP' }).click();
    await expect(page.getByRole('link', { name: 'Continue to Become' })).toBeVisible();
    const saved = (await pool.query<{ narrative: string; clarification: string; carry_forward: string }>(
      `select narrative,clarification,carry_forward from public.see_clearly_recaps where user_id=$1`, [owner],
    )).rows[0];
    expect(saved.narrative).toBe('Earlier I feared disappointing others. Now I can notice a pause without treating it as a verdict.');
    expect(saved.clarification).toBe('I am learning that a mistake is not a verdict.');
    expect(saved.carry_forward).toBe('Ask for help instead of hiding.');
    expect((await pool.query(`select self_story_hypothesis from public.see_clearly_sy3_records where user_id=$1`, [owner])).rows[0].self_story_hypothesis)
      .toBe('  I sometimes fear disappointing others.  ');
    expect((await pool.query(`select count(*)::integer as n from public.ai_artifacts where user_id=$1`, [owner])).rows[0].n).toBe(0);
    await page.getByText('Look back at what I wrote').click();
    await expect(page.getByText('You left this open.').first()).toBeVisible();
    await page.getByRole('link', { name: 'Continue to Become' }).click();
    await expect(page).toHaveURL(/\/deep-dive\/become$/);
    await page.goto(appRuntimeUrl(recap));
    await page.screenshot({ path: testInfo.outputPath(`recap-${testInfo.project.name}.png`), fullPage: true });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await pool.query(`delete from public.see_clearly_sy3_records where user_id=$1`, [owner]);
    await page.reload();
    await expect(page.getByRole('link', { name: 'Continue to Become' })).toHaveCount(0);
    await expect(page.getByLabel('The story I can see so far')).not.toHaveValue(/I sometimes fear disappointing others\./);
    expect((await pool.query(`select narrative,confirmed_at,clarification,carry_forward from public.see_clearly_recaps where user_id=$1`, [owner])).rows[0])
      .toMatchObject({ narrative: '', confirmed_at: null, clarification: saved.clarification, carry_forward: saved.carry_forward });
  } finally { await pool.end(); await resetLocalE2eAccount(user.email); }
});
