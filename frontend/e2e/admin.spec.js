import { expect, test } from '@playwright/test';

test('seeded administrator can access the dashboard', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Email').fill('admin@onlinechasmewala.com');
  await page.getByLabel('Password').fill('Admin@123');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page).toHaveURL(/\/$/);

  await page.goto('/admin');
  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
  await expect(page.getByText('Revenue', { exact: true })).toBeVisible();
});

test('administrator can open the create and edit dialogs for managed resources', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Email').fill('admin@onlinechasmewala.com');
  await page.getByLabel('Password').fill('Admin@123');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page).toHaveURL(/\/$/);

  const resources = [
    { path: '/admin/products', add: 'Add product', dialog: 'Add product' },
    { path: '/admin/categories', add: 'Add Category', dialog: 'Add Category' },
    { path: '/admin/brands', add: 'Add Brand', dialog: 'Add Brand' },
    { path: '/admin/coupons', add: 'Add Coupon', dialog: 'Add Coupon' },
    { path: '/admin/banners', add: 'Add Banner', dialog: 'Add Banner' },
  ];

  for (const resource of resources) {
    await page.goto(resource.path);
    await page.getByRole('button', { name: resource.add }).click();
    await expect(page.getByRole('dialog', { name: resource.dialog })).toBeVisible();
    await page.getByRole('button', { name: 'Close dialog' }).click();
  }

  await page.goto('/admin/categories');
  await page.getByRole('button', { name: 'Edit' }).first().click();
  await expect(page.getByRole('dialog', { name: 'Edit Category' })).toBeVisible();
});
