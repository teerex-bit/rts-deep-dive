import pg from 'pg';
import { expect, test } from '@playwright/test';
import { resetLocalE2eAccount } from '../helpers/local-e2e';
import { appRuntimeUrl } from '../setup/app-runtime';
import { REVIEW_NAVIGATION } from '../../components/deep-dive/review-navigator-content';

const reviewerEmail = 'review-navigator@rts.test';
const password = 'local-e2e-only-password';

async function signUp(page: import('@playwright/test').Page, email: string) {
  await page.goto(appRuntimeUrl('/sign-up'));
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill(password);
  await Promise.all([page.waitForURL(/\/dashboard$/), page.getByRole('button', { name: 'Create account' }).click()]);
}

test('reviewer can inspect every section without changing progress or participant wording', async ({ page, browser }, testInfo) => {
  expect(process.env.REVIEW_TEST_ACCESS).toBe('true');
  expect(process.env.REVIEW_TEST_USER_EMAIL).toBe(reviewerEmail);
  const ordinaryEmail = `ordinary-review-nav-${testInfo.project.name}@rts.test`;
  await resetLocalE2eAccount(reviewerEmail);
  await resetLocalE2eAccount(ordinaryEmail);
  const pool = new pg.Pool({ connectionString: process.env.TEST_DATABASE_URL });
  try {
    await signUp(page, reviewerEmail);
    await page.goto(appRuntimeUrl('/deep-dive/awaken'));
    const control = page.locator('.review-navigator > summary');
    await expect(control).toHaveText('REVIEW NAVIGATOR');
    await control.focus();
    await page.keyboard.press('Tab');
    await page.keyboard.press('Shift+Tab');
    await expect(control).toBeFocused();
    await expect(control).toHaveCSS('outline-style', 'solid');
    await page.keyboard.press('Enter');
    await expect(page.getByRole('navigation', { name: 'Review navigator' })).toBeVisible();
    const firstLink = await page.getByRole('navigation', { name: 'Review navigator' }).getByText('Notice the difference', { exact: true }).count();
    expect(firstLink).toBeGreaterThan(0);

    const before = (await pool.query(`select module_id,last_section_id,completed_at from public.deep_dive_module_progress where user_id=(select id from auth.users where email=$1) order by module_id`, [reviewerEmail])).rows;
    for (const group of REVIEW_NAVIGATION) for (const lesson of group.lessons) for (const section of lesson.sections) {
      if (!(await page.locator('.review-navigator').evaluate(element => (element as HTMLDetailsElement).open))) await page.locator('.review-navigator > summary').click();
      const lessonSummary = page.getByRole('navigation', { name: 'Review navigator' }).locator('details > summary').filter({ hasText: lesson.title });
      if (!(await lessonSummary.evaluate(element => (element.parentElement as HTMLDetailsElement).open))) await lessonSummary.click();
      const link = page.getByRole('navigation', { name: 'Review navigator' }).getByRole('link', { name: section.title, exact: true });
      await link.click();
      await expect(page).toHaveURL(new RegExp(`section=${encodeURIComponent(section.id)}&reviewJump=`));
      await expect(page.getByRole('main')).toContainText(section.title);
      await page.locator('.review-navigator > summary').click();
      await expect(page.getByRole('navigation', { name: 'Review navigator' })).toContainText(`${group.stage} / ${lesson.title} / ${section.title}`);
    }
    await page.getByRole('navigation', { name: 'Review navigator' }).getByRole('link', { name: 'What Has Become Clear' }).click();
    await expect(page).toHaveURL(/what-has-become-clear\?section=overview&reviewJump=/);
    await expect(page.getByRole('main')).toContainText('What Has Become Clear');
    await page.locator('.review-navigator > summary').click();
    await page.getByRole('navigation', { name: 'Review navigator' }).getByRole('link', { name: 'Become — Stage Overview' }).click();
    await expect(page).toHaveURL(/\/deep-dive\/become$/);
    await expect(page.locator('.review-navigator > summary')).toBeVisible();
    const after = (await pool.query(`select module_id,last_section_id,completed_at from public.deep_dive_module_progress where user_id=(select id from auth.users where email=$1) order by module_id`, [reviewerEmail])).rows;
    expect(after).toEqual(before);
    expect((await pool.query(`select count(*)::int as count from public.see_clearly_recaps where user_id=(select id from auth.users where email=$1)`, [reviewerEmail])).rows[0].count).toBe(0);
    for (const table of ['sc1', 'sy2', 'sy3', 'sy4', 'sg1', 'sg2', 'sg3', 'sg4']) {
      const count = (await pool.query(`select count(*)::int as count from public.see_clearly_${table}_records where user_id=(select id from auth.users where email=$1)`, [reviewerEmail])).rows[0].count;
      expect(count, `${table} participant wording`).toBe(0);
    }

    const ordinary = await browser.newContext({ viewport: testInfo.project.use.viewport });
    try {
      const ordinaryPage = await ordinary.newPage();
      await signUp(ordinaryPage, ordinaryEmail);
      await ordinaryPage.goto(appRuntimeUrl('/deep-dive/awaken/pay-attention?section=carry-forward'));
      await expect(ordinaryPage.locator('.review-navigator')).toHaveCount(0);
      await expect(ordinaryPage.getByRole('main')).not.toContainText('You have reached the end of Pay Attention.');
      await ordinaryPage.goto(appRuntimeUrl('/deep-dive/see-clearly/jesus-shows-us-the-father?section=reflection&reviewJump=forged'));
      await expect(ordinaryPage).toHaveURL(/\/deep-dive\/see-clearly(?:#.*)?$/);
    } finally { await ordinary.close(); }
  } finally { await pool.end(); }
});
