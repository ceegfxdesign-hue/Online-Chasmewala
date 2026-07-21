import { expect, test } from '@playwright/test';

test('seeded customer completes a cash-on-delivery checkout', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Email').fill('demo@onlinechasmewala.com');
  await page.getByLabel('Password').fill('Demo@123');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page).toHaveURL(/\/$/);

  await page.goto('/products');
  await page.locator('a[href^="/product/"] h3').first().click();
  await page.getByRole('button', { name: /add to cart/i }).first().click();
  await page.getByRole('link', { name: /view cart/i }).click();
  await page.getByRole('button', { name: /proceed to checkout/i }).click();

  await expect(page.getByRole('heading', { name: 'Checkout' })).toBeVisible();
  await page.getByText('Cash on Delivery', { exact: true }).click();
  await page.getByRole('button', { name: /place order/i }).click();
  await expect(page.getByRole('heading', { name: /thank you for your order/i })).toBeVisible();
  await expect(page.getByRole('link', { name: /track your order/i })).toBeVisible();
});
