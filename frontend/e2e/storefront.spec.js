import { expect, test } from '@playwright/test';

test('browse the catalog and open a product', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /see the world/i })).toBeVisible();

  await page.getByRole('link', { name: /shop all frames/i }).click();
  await expect(page).toHaveURL(/\/products/);
  await expect(page.getByRole('heading', { name: /find your perfect pair|all eyewear/i })).toBeVisible();

  const firstProductTitle = page.locator('a[href^="/product/"] h3').first();
  await expect(firstProductTitle).toBeVisible();
  await firstProductTitle.click();
  await expect(page).toHaveURL(/\/product\//);
  await expect(page.getByRole('button', { name: /add to cart/i })).toBeVisible();
});

test('category deep links redirect to the filtered catalog', async ({ page }) => {
  await page.goto('/category/sunglasses');
  await expect(page).toHaveURL(/\/products\?category=sunglasses/);
});
