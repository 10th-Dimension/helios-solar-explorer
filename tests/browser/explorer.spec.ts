import { expect, test, type Page } from '@playwright/test';
import { lessons } from '../../app/education';

async function disableWebGL(page: Page) {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (
      this: HTMLCanvasElement,
      ...args: Parameters<typeof original>
    ) {
      if (String(args[0]).startsWith('webgl')) return null;
      return original.apply(this, args);
    } as typeof original;
  });
}

async function openExplorer(page: Page) {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/');
  await expect(
    page.getByRole('button', { name: 'EDUCATION', exact: true }),
  ).toBeVisible();
  if (page.viewportSize()!.width >= 760) {
    await page
      .getByRole('combobox', { name: 'Graphics quality' })
      .selectOption('BALANCED');
  }
  return errors;
}

async function renderScene(page: Page) {
  const errors = await openExplorer(page);
  await page
    .getByRole('combobox', { name: 'Graphics quality' })
    .selectOption('BALANCED');
  await expect(page.locator('.solar-scene canvas')).toHaveCount(1);
  await expect(page.locator('.solar-scene')).toHaveAttribute(
    'data-draw-calls',
    /[1-9]\d*/,
  );
  return errors;
}

async function travelToEarth(page: Page) {
  await page.getByRole('button', { name: 'WORLDS', exact: true }).click();
  await page
    .getByRole('button', { name: 'Travel to Earth', exact: true })
    .click();
  await expect(
    page.getByRole('region', { name: 'Earth exploration controls' }),
  ).toBeVisible();
}

test('@webgl renders one scene, selects Earth, inspects layers and keeps its leader attached', async ({
  page,
}) => {
  const errors = await renderScene(page);
  await travelToEarth(page);
  await page.getByRole('button', { name: /^INTERIOR/ }).click();
  const inspector = page.getByRole('complementary', {
    name: 'Earth 3D interior layers',
  });
  await expect(inspector).toBeVisible();
  await inspector.getByRole('button', { name: /^Mantle/ }).click();
  await expect(inspector.locator('.active-layer-note')).toContainText('Mantle');
  await inspector
    .locator('summary')
    .filter({ hasText: 'Evidence for selected interior region' })
    .click();
  await expect(inspector).toContainText(/illustrative/i);
  // The disclosure can push the note outside its scroll viewport. The leader
  // is deliberately hidden in that state; restore the note before testing it.
  await inspector
    .locator('summary')
    .filter({ hasText: 'Evidence for selected interior region' })
    .click();
  await expect(page.locator('.solar-scene')).toHaveAttribute(
    'data-scale',
    'PLANETARY',
  );
  await expect(page.locator('.planetary-layer-leader')).toHaveAttribute(
    'data-visible',
    'true',
  );
  const path = page.locator('.planetary-layer-leader path');
  const before = await path.getAttribute('d');
  await page.mouse.move(700, 450);
  await page.mouse.wheel(0, 180);
  await expect.poll(() => path.getAttribute('d')).not.toBe(before);
  await page.mouse.move(650, 450);
  await page.mouse.down();
  await page.mouse.move(720, 480, { steps: 6 });
  await page.mouse.up();
  await expect(page.locator('.solar-scene canvas')).toHaveCount(1);
  await page.getByRole('button', { name: 'RESTORE EXTERIOR' }).click();
  await expect(inspector).toHaveCount(0);
  expect(errors).toEqual([]);
});

for (const lesson of lessons) {
  test(`completes ${lesson.title} using its written alternatives and current questions`, async ({
    page,
  }) => {
    await disableWebGL(page);
    const errors = await openExplorer(page);
    // Exercise every written alternative through the actual fallback lesson DOM.
    await page.getByRole('button', { name: 'EDUCATION', exact: true }).click();
    const panel = page.getByRole('complementary', { name: 'Education Mode' });
    await panel
      .getByRole('button', {
        name: `Start lesson: ${lesson.title}`,
        exact: true,
      })
      .click();
    for (const stage of lesson.stages) {
      await expect(
        panel.getByRole('heading', { name: stage.title, exact: true }),
      ).toBeFocused();
      await panel
        .getByText('Read a nonvisual alternative', { exact: true })
        .click();
      await panel
        .getByRole('button', {
          name: 'Use this alternative for this stage',
          exact: true,
        })
        .click();
      if (stage.question) {
        const option = stage.question.options.find(
          (item) => item.id === stage.question!.correctOptionId,
        )!;
        await panel
          .getByRole('radio', { name: option.label, exact: true })
          .check();
      }
      await panel
        .getByRole('button', { name: /^(Next stage|Complete lesson)/ })
        .click();
    }
    await expect(
      panel.getByRole('heading', { name: 'Lesson complete', exact: true }),
    ).toBeVisible();
    await expect(panel).toContainText(
      `Questions correct: ${lesson.stages.filter((stage) => stage.question).length} of ${lesson.stages.filter((stage) => stage.question).length}`,
    );
    await page.reload();
    await page.getByRole('button', { name: 'EDUCATION', exact: true }).click();
    await expect(
      panel.getByRole('heading', { name: 'Lesson complete', exact: true }),
    ).toBeVisible();
    expect(errors).toEqual([]);
  });
}

test('persists a retry and resumes it without requiring a correct answer', async ({
  page,
}) => {
  await disableWebGL(page);
  await openExplorer(page);
  await page.getByRole('button', { name: 'EDUCATION', exact: true }).click();
  const panel = page.getByRole('complementary', { name: 'Education Mode' });
  await panel
    .getByRole('button', {
      name: 'Start lesson: Our Solar System',
      exact: true,
    })
    .click();
  await panel
    .getByText('Read a nonvisual alternative', { exact: true })
    .click();
  await panel
    .getByRole('button', { name: 'Use this alternative for this stage' })
    .click();
  await panel.getByRole('radio').first().check();
  await expect(
    panel.getByRole('button', { name: /^Next stage/ }),
  ).toBeEnabled();
  await panel
    .getByRole('button', { name: 'Retry question', exact: true })
    .click();
  await expect(
    panel.getByRole('button', { name: /^Next stage/ }),
  ).toBeDisabled();
  await panel
    .getByRole('button', {
      name: 'Pause education and return to free exploration',
    })
    .click();
  await page.reload();
  await page.getByRole('button', { name: 'EDUCATION', exact: true }).click();
  await panel
    .getByRole('button', { name: 'Resume lesson', exact: true })
    .click();
  await expect(
    panel.getByRole('button', { name: /^Next stage/ }),
  ).toBeDisabled();
  await expect(
    panel.getByText('Written alternative recorded for this stage.', {
      exact: true,
    }),
  ).toBeVisible();
  const question = lessons[0].stages[0].question!;
  const wrong = question.options.find(
    (option) => option.id !== question.correctOptionId,
  )!;
  await panel.getByRole('radio', { name: wrong.label, exact: true }).check();
  await expect(
    panel.getByRole('button', { name: /^Next stage/ }),
  ).toBeEnabled();
  await expect(panel).toContainText('Not quite');
});

test('@webgl closing a lesson cancels its pending interior action', async ({
  page,
}) => {
  await renderScene(page);
  await page.getByRole('button', { name: 'EDUCATION', exact: true }).click();
  const panel = page.getByRole('complementary', { name: 'Education Mode' });
  await panel
    .getByRole('button', {
      name: 'Start lesson: Inside the Planets',
      exact: true,
    })
    .click();
  await panel.locator('.education-travel').click();
  await page.getByRole('button', { name: 'CATALOG', exact: true }).click();
  await expect(panel).toHaveCount(0);
  await expect(
    page.getByRole('complementary', { name: 'Helios object catalog' }),
  ).toBeVisible();
  await expect(page.locator('.spatial-travel')).toHaveCount(0);
  await expect(page.locator('.interior-inspector')).toHaveCount(0);
});

test('science dialog contains keyboard focus and restores it on Escape', async ({
  page,
}) => {
  await disableWebGL(page);
  await openExplorer(page);
  const trigger = page.getByRole('button', { name: 'SCIENCE', exact: true });
  await trigger.focus();
  await page.keyboard.press('Enter');
  const dialog = page.getByRole('dialog', {
    name: 'Scientific evidence and visualization limits',
  });
  await expect(dialog).toBeVisible();
  // Native Tab navigation may visit browser chrome (activeElement becomes body).
  // Background page controls must remain unreachable while the modal is open.
  for (let index = 0; index < 14; index++) {
    await page.keyboard.press('Tab');
    expect(
      await dialog.evaluate(
        (element) =>
          element.contains(document.activeElement) ||
          document.activeElement === document.body,
      ),
    ).toBe(true);
  }
  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
  await expect(trigger).toBeFocused();
});

test('@webgl pause and reduced motion stop the visual clock while manual travel remains available', async ({
  page,
}) => {
  await renderScene(page);
  const scene = page.locator('.solar-scene');
  await page.getByRole('button', { name: 'PAUSE MOTION', exact: true }).click();
  await expect(scene).toHaveAttribute('data-motion', 'PAUSED');
  const paused = await scene.getAttribute('data-visual-seconds');
  await travelToEarth(page);
  await expect(scene).toHaveAttribute('data-visual-seconds', paused!);
  await page
    .getByRole('button', { name: 'RESUME MOTION', exact: true })
    .click();
  await expect(scene).toHaveAttribute('data-motion', 'ANIMATED');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(scene).toHaveAttribute('data-motion', 'PAUSED');
});

test('WebGL failure still exposes world information and lesson alternatives', async ({
  page,
}) => {
  await disableWebGL(page);
  await openExplorer(page);
  await expect(
    page.getByText('3D rendering is unavailable.', { exact: true }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'WORLDS', exact: true }).click();
  await page
    .getByRole('button', { name: 'Travel to Earth', exact: true })
    .click();
  const information = page.getByRole('complementary', {
    name: 'Earth information',
  });
  await expect(information).toBeVisible();
  await expect(
    information.getByRole('heading', { name: 'Earth', exact: true }),
  ).toBeFocused();
  await expect(page.locator('.spatial-travel')).toHaveCount(0);
  await expect(
    information.getByRole('button', { name: 'OPEN 3D INTERIOR' }),
  ).toHaveCount(0);
  await page.getByRole('button', { name: 'EDUCATION', exact: true }).click();
  await expect(
    page.getByRole('button', {
      name: 'Start lesson: Our Solar System',
      exact: true,
    }),
  ).toBeVisible();
});

test('narrow layout starts on AUTO and keeps lesson switching within the viewport', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openExplorer(page);
  await expect(
    page.getByRole('combobox', { name: 'Graphics quality' }),
  ).toHaveValue('AUTO');
  await page.getByRole('button', { name: 'EDUCATION', exact: true }).click();
  const panel = page.getByRole('complementary', { name: 'Education Mode' });
  await panel
    .getByRole('button', { name: 'Start lesson: Inside the Sun', exact: true })
    .click();
  await panel.locator('.education-travel').click();
  await expect(
    panel.getByRole('button', { name: 'Read lesson', exact: true }),
  ).toBeVisible();
  await panel.getByRole('button', { name: 'Read lesson', exact: true }).click();
  await expect(
    panel.getByRole('heading', {
      name: 'Energy begins in the core',
      exact: true,
    }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await expect(
    page.getByRole('combobox', { name: 'Graphics quality' }),
  ).toHaveValue('AUTO');
});

test('@webgl travels from the catalog to an exoplanet and returns Home', async ({
  page,
}) => {
  await renderScene(page);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.getByRole('button', { name: 'CATALOG', exact: true }).click();
  const catalog = page.getByRole('complementary', {
    name: 'Helios object catalog',
  });
  await catalog
    .getByRole('textbox', { name: 'SEARCH OBJECTS' })
    .fill('Proxima Centauri b');
  await expect(
    catalog.getByRole('region', { name: 'Proxima Centauri b catalog detail' }),
  ).toBeVisible();
  await catalog.getByRole('button', { name: /TAKE ME THERE/ }).click();
  const planet = page.getByRole('region', {
    name: 'Proxima Centauri b exoplanet selection',
  });
  await expect(planet).toBeVisible();
  await expect(planet).toContainText('CONFIRMED');
  await planet
    .getByRole('button', { name: 'BACK TO SYSTEM', exact: true })
    .click();
  await expect(
    page.getByRole('region', { name: 'Proxima Centauri destination system' }),
  ).toBeVisible();
  await page.locator('.brand').click();
  await expect(page.locator('.system-intro')).toBeVisible();
  await expect(page.locator('.solar-scene canvas')).toHaveCount(1);
});
