import pg from 'pg';
import { expect, test } from '@playwright/test';
import { resetLocalE2eAccount } from '../helpers/local-e2e';
import { appRuntimeUrl } from '../setup/app-runtime';
import { e2eUser } from '../fixtures/users';
import { A3_SECTIONS, A4_SECTIONS } from '../../content/deep-dive/v1/awaken/four-module-lessons';

test('A3 and A4 form a concise, persistent Awaken handoff', async ({ page }, testInfo) => {
  const user = e2eUser('a3-a4-stage', testInfo.project.name);
  const pool = new pg.Pool({ connectionString: process.env.TEST_DATABASE_URL });
  await resetLocalE2eAccount(user.email);
  try {
    await page.goto(appRuntimeUrl('/sign-up'));
    await page.getByLabel('Email').fill(user.email);
    await page.getByLabel('Password').fill(user.password);
    await Promise.all([page.waitForURL(/\/dashboard$/), page.getByRole('button', { name: 'Create account' }).click()]);
    for (const [slug, moduleId, reflection] of [
      ['your-reactions-have-a-history', 'awaken.your-reactions-have-a-history', 'I notice a difference between a label and a behavior in a moment.'],
      ['formation-is-not-identity', 'awaken.formation-is-not-identity', 'I noticed what I expected and wanted in that moment.'],
    ] as const) {
      const base = `/deep-dive/awaken/${slug}`;
      await page.goto(appRuntimeUrl(base));
      const firstScreen = await page.evaluate(() => ({
        header: document.querySelector('.app-shell-header')!.getBoundingClientRect().height,
        stages: document.querySelector('.stage-context')!.getBoundingClientRect().height,
        titleTop: document.querySelector('.deep-dive-lesson h1')!.getBoundingClientRect().top,
        viewport: innerWidth,
        document: document.documentElement.scrollWidth,
      }));
      expect(firstScreen.document).toBeLessThanOrEqual(firstScreen.viewport);
      if (firstScreen.viewport === 375) {
        expect(firstScreen.header).toBeLessThanOrEqual(70);
        expect(firstScreen.stages).toBeLessThanOrEqual(75);
        expect(firstScreen.titleTop).toBeLessThan(420);
      }
      await expect(page.locator('.app-shell-header').getByRole('button', { name: 'Sign out' })).toBeVisible();
      await expect(page.getByRole('region', { name: /A[34] lesson progress/ })).toBeVisible();
      await expect(page.getByRole('list', { name: 'Awaken movements' })).toContainText(slug === 'formation-is-not-identity' ? 'UNDERSTAND' : 'SEPARATE');
      await page.getByRole('button', { name: 'NEXT' }).click();
      await expect(page).toHaveURL(/section=teaching$/);
      await page.getByRole('link', { name: '← Back' }).click();
      await expect(page).toHaveURL(/section=entry$/);
      await page.getByRole('link', { name: '← Back' }).click();
      await expect(page).toHaveURL(/\/deep-dive\/awaken$/);
      await page.goto(appRuntimeUrl(base));
      await expect(page.getByRole('heading', { level: 1, name: slug === 'formation-is-not-identity' ? 'Expectations, Desires, and Fears' : 'What Was Formed Is Not All You Are' })).toBeVisible();
      await page.goto(appRuntimeUrl('/deep-dive/awaken'));
      const lessonTitle = slug === 'formation-is-not-identity' ? 'Understand · A4' : 'Separate · A3';
      const resume = page.getByRole('link', { name: `Resume ${lessonTitle}` });
      await expect(resume).toHaveAttribute('href', new RegExp('section=teaching$'));
      await resume.click();
      await expect(page.getByRole('heading', { level: 1, name: slug === 'formation-is-not-identity' ? 'Expectations, Desires, and Fears' : 'What Was Formed Is Not All You Are' })).toBeVisible();
      await page.getByRole('button', { name: 'NEXT' }).click();
      if (slug === 'your-reactions-have-a-history') {
        const identity = page.getByRole('region', { name: 'Separate identity from pattern' });
        await page.getByLabel('Something I notice myself doing').fill('go quiet');
        await identity.getByRole('button', { name: 'NEXT', exact: true }).click();
        await page.getByLabel('A situation where I notice it').fill('conflict begins');
        await identity.getByRole('button', { name: 'NEXT', exact: true }).click();
        await page.getByLabel(/what am I tempted to say about myself/i).fill('I am a withdrawn person');
        await identity.getByRole('button', { name: 'NEXT', exact: true }).click();
        await expect(identity).toContainText('I tend to go quiet when conflict begins.');
        await expect(identity).toContainText('I am a withdrawn person');
      } else {
        const inquiry = page.getByRole('region', { name: 'Understand a response' });
        for (const [label, answer] of [
          ['What happened?', 'A decision was questioned'],
          ['What were you expecting to happen?', 'They would stop trusting me'],
          ['What did you want to happen?', 'To be understood'],
          ['What were you afraid might happen?', 'I would lose respect'],
          ['What felt threatened or important here?', 'Being respected'],
        ]) {
          await page.getByLabel(label).fill(answer);
          await inquiry.getByRole('button', { name: 'NEXT', exact: true }).click();
        }
        await expect(page.getByRole('region', { name: 'Looking across this moment' })).toContainText('What do you notice underneath your response?');
        await expect(page.getByRole('region', { name: 'Looking across this moment' })).toContainText('They would stop trusting me');
      }
      if (firstScreen.viewport === 375) {
        for (const width of [375, 390, 430, 1536]) {
          await page.setViewportSize({ width, height: width === 1536 ? 960 : 844 });
          const dimensions = await page.evaluate(() => ({ viewport: innerWidth, document: document.documentElement.scrollWidth }));
          expect(dimensions.document).toBeLessThanOrEqual(dimensions.viewport);
          await expect(page.locator('.awaken-guided')).toBeVisible();
          await page.screenshot({ path: testInfo.outputPath(`${slug}-guided-${width}.png`), fullPage: true });
        }
        await page.setViewportSize({ width: firstScreen.viewport, height: 812 });
      }
      const widths = await page.evaluate(() => ({ viewport: innerWidth, document: document.documentElement.scrollWidth }));
      expect(widths.document).toBeLessThanOrEqual(widths.viewport);
      await page.screenshot({ path: testInfo.outputPath(`${slug}-${testInfo.project.name}.png`), fullPage: true });
      await page.getByRole('button', { name: 'NEXT' }).click();
      const reflectionHeight = await page.locator('.deep-dive-reflection textarea').evaluate(element => element.getBoundingClientRect().height);
      if (firstScreen.viewport === 375) expect(reflectionHeight).toBeLessThan(145);
      await page.screenshot({ path: testInfo.outputPath(`${slug}-reflection-${testInfo.project.name}.png`), fullPage: true });
      await page.getByRole('textbox', { name: slug === 'formation-is-not-identity' ? /Was there anything you noticed here/i : /What difference do you notice/i }).fill(reflection);
      await page.getByRole('button', { name: 'Save & continue' }).click();
      await expect(page).toHaveURL(/section=practice$/);
      await page.goto(appRuntimeUrl(base));
      await expect(page.getByRole('heading', { level: 1, name: slug === 'formation-is-not-identity' ? 'Pause and Ask' : 'Notice What You Call Yourself' })).toBeVisible();
      await page.getByRole('button', { name: 'NEXT' }).click();
      if (slug === 'formation-is-not-identity') {
        await expect(page.getByRole('heading', { level: 1, name: 'Carry the Questions Forward' })).toBeVisible();
        await expect(page.getByText('What am I expecting right now?', { exact: false })).toBeVisible();
      }
      await page.getByRole('button', { name: 'Complete lesson' }).click();
      await expect(page).toHaveURL(/section=carry-forward$/);
      const forward = page.getByRole('link', { name: 'NEXT' });
      const back = page.getByRole('link', { name: 'Back to Awaken' });
      await forward.focus();
      await expect(forward).toBeFocused();
      await page.keyboard.press('Tab');
      await expect(back).toBeFocused();
      await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      await page.screenshot({ path: testInfo.outputPath(`${slug === 'formation-is-not-identity' ? 'a4' : 'a3'}-completed-${testInfo.project.name}.png`), fullPage: true });
      const beforeReview = await pool.query('select p.last_section_id,p.completed_at,p.updated_at,r.body,r.updated_at as reflection_updated_at from public.deep_dive_module_progress p join public.deep_dive_reflections r on (p.id,p.user_id)=(r.progress_id,r.user_id) where p.user_id=(select id from auth.users where email=$1) and p.module_id=$2', [user.email, moduleId]);
      await forward.click();
      await expect(page).toHaveURL(slug === 'formation-is-not-identity' ? /see-clearly/ : /formation-is-not-identity$/);
      await expect(page.getByRole('heading', { level: 1, name: slug === 'formation-is-not-identity' ? /See Clearly/i : 'What Is Driving This Response?' })).toBeVisible();
      await page.goto(appRuntimeUrl('/deep-dive/awaken'));
      const reviewLink = page.getByRole('link', { name: `Review ${lessonTitle}` });
      await expect(reviewLink).toHaveAttribute('href', new RegExp('section=entry$'));
      await reviewLink.click();
      await expect(page.getByRole('heading', { level: 1, name: slug === 'formation-is-not-identity' ? 'What Is Driving This Response?' : 'Is This Who I Am?' })).toBeVisible();
      const sections = slug === 'formation-is-not-identity' ? A4_SECTIONS : A3_SECTIONS;
      for (const nextSection of sections.slice(1)) {
        await page.getByRole('link', { name: 'NEXT', exact: true }).click();
        await expect(page).toHaveURL(new RegExp(`section=${nextSection.id}$`));
        await expect(page.getByRole('heading', { level: 1, name: nextSection.title })).toBeVisible();
        if (nextSection.id === 'reflection') await expect(page.locator('.deep-dive-reflection textarea')).toHaveValue(reflection);
        if (nextSection.id === 'reflection') {
          await page.getByRole('link', { name: '← Back' }).click();
          await expect(page).toHaveURL(new RegExp(`section=${sections[sections.findIndex(item => item.id === nextSection.id) - 1].id}$`));
          await page.getByRole('link', { name: 'NEXT', exact: true }).click();
          await expect(page.locator('.deep-dive-reflection textarea')).toHaveValue(reflection);
        }
      }
      const afterReview = await pool.query('select p.last_section_id,p.completed_at,p.updated_at,r.body,r.updated_at as reflection_updated_at from public.deep_dive_module_progress p join public.deep_dive_reflections r on (p.id,p.user_id)=(r.progress_id,r.user_id) where p.user_id=(select id from auth.users where email=$1) and p.module_id=$2', [user.email, moduleId]);
      expect(afterReview.rows).toEqual(beforeReview.rows);
      await page.goto(appRuntimeUrl('/deep-dive'));
      await page.getByRole('link', { name: `Review ${lessonTitle}` }).click();
      await expect(page).toHaveURL(/section=entry$/);
      await page.goto(appRuntimeUrl(`${base}?section=reflection`));
      await expect(page.locator('.deep-dive-reflection textarea')).toHaveValue(reflection);
      const record = await pool.query('select p.last_section_id,p.completed_at,r.body from public.deep_dive_module_progress p join public.deep_dive_reflections r on (p.id,p.user_id)=(r.progress_id,r.user_id) where p.user_id=(select id from auth.users where email=$1) and p.module_id=$2', [user.email, moduleId]);
      expect(record.rows).toEqual([expect.objectContaining({ last_section_id: 'carry-forward', body: reflection })]);
      expect(record.rows[0].completed_at).toBeTruthy();
    }
  } finally { await pool.end(); await resetLocalE2eAccount(user.email); }
});

test('A3 and A4 can skip an empty reflection and resume at practice', async ({ page }, testInfo) => {
  const user = e2eUser('a3-a4-skip', testInfo.project.name);
  await resetLocalE2eAccount(user.email);
  try {
    await page.goto(appRuntimeUrl('/sign-up'));
    await page.getByLabel('Email').fill(user.email);
    await page.getByLabel('Password').fill(user.password);
    await Promise.all([page.waitForURL(/\/dashboard$/), page.getByRole('button', { name: 'Create account' }).click()]);
    for (const slug of ['your-reactions-have-a-history', 'formation-is-not-identity']) {
      const base = `/deep-dive/awaken/${slug}`;
      await page.goto(appRuntimeUrl(base));
      for (let index = 0; index < 2; index += 1) await page.getByRole('button', { name: 'NEXT', exact: true }).click();
      const unknownSteps = slug === 'formation-is-not-identity' ? 5 : 3;
      for (let index = 0; index < unknownSteps; index += 1) await page.getByRole('button', { name: 'I’m not sure', exact: true }).click();
      await page.getByRole('button', { name: 'NEXT', exact: true }).click();
      await expect(page).toHaveURL(/section=reflection$/);
      await page.getByRole('textbox', { name: slug === 'formation-is-not-identity' ? /Was there anything you noticed here/i : /What difference do you notice/i }).fill('   ');
      await expect(page.getByRole('button', { name: 'Save & continue' })).toBeDisabled();
      await page.getByRole('button', { name: 'Continue without writing' }).click();
      await expect(page).toHaveURL(/section=practice$/);
      await page.goto(appRuntimeUrl(base));
      await expect(page).toHaveURL(/formation-is-not-identity$|your-reactions-have-a-history$/);
      await expect(page.getByRole('heading', { level: 1, name: /Pause and Ask|Notice What You Call Yourself/ })).toBeVisible();
    }
  } finally { await resetLocalE2eAccount(user.email); }
});
