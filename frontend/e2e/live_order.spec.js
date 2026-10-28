import { expect, test } from '@playwright/test';

test.describe('Live Storefront Customer Order Flow', () => {
  test('customer completes an end-to-end checkout on the live website', async ({ page }) => {
    // Increase overall test timeout for real production server interaction
    test.setTimeout(90000);

    // 1. Sign in on the live site
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    await page.getByLabel(/email/i).fill('demo@onlinechasmewala.com');
    await page.getByLabel(/password/i).fill('Demo@123');
    await page.getByRole('button', { name: /sign in/i }).click();

    // Verify logged in
    await expect(page).not.toHaveURL(/\/login/, { timeout: 20000 });
    await page.waitForTimeout(1000);

    // 2. Browse products catalog
    await page.goto('/products');
    await page.waitForLoadState('networkidle');

    // If cart drawer is open, close it
    const closeDrawerBtn = page.getByRole('button', { name: /close panel/i });
    if (await closeDrawerBtn.isVisible().catch(() => false)) {
      await closeDrawerBtn.click();
      await page.waitForTimeout(500);
    }

    // Click specifically on the product title heading inside the first product card
    const productTitle = page.locator('main article h3').first();
    await expect(productTitle).toBeVisible({ timeout: 15000 });
    await productTitle.click();

    // 3. On Product Detail Page: verify loaded
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/\/product\//, { timeout: 10000 });
    console.log('Navigated to product detail page:', page.url());

    // 4. Handle Lens Selection for Eyeglasses: wait for "Select Lenses" button to be rendered
    const selectLensesBtn = page.getByRole('button', { name: /select lenses/i });
    await selectLensesBtn.waitFor({ state: 'visible', timeout: 15000 });
    console.log('Select Lenses button is visible. Clicking...');
    await selectLensesBtn.click();

    // Drawer opens: Choose "Frame Only"
    const drawer = page.locator('aside[role="dialog"]');
    await drawer.waitFor({ state: 'visible', timeout: 10000 });

    const frameOnlyBtn = drawer.getByRole('button', { name: /frame only/i });
    await frameOnlyBtn.waitFor({ state: 'visible', timeout: 10000 });
    await frameOnlyBtn.click();
    console.log('Clicked Frame Only button in drawer');

    // In step 2 inside the drawer, click the drawer CTA button ("Add to Cart")
    const drawerCta = drawer.getByRole('button', { name: /add to cart/i });
    await drawerCta.waitFor({ state: 'visible', timeout: 10000 });
    await expect(drawerCta).toBeEnabled({ timeout: 10000 });
    await drawerCta.click();
    console.log('Clicked drawer Add to Cart CTA');

    // Wait for drawer to close
    await drawer.waitFor({ state: 'hidden', timeout: 10000 });
    console.log('Lens selection drawer closed. Lens choice saved.');

    // 5. Add to Cart on product detail page
    const addToCartBtn = page.locator('main').getByRole('button', { name: /add to cart/i }).first();
    await expect(addToCartBtn).toBeEnabled({ timeout: 10000 });
    await addToCartBtn.click();
    console.log('Clicked Add to Cart on product detail page');

    // 6. Navigate to Checkout via Cart Drawer
    await page.waitForTimeout(1000);
    const checkoutInDrawer = page.locator('dialog, aside[role="dialog"]').getByRole('link', { name: /checkout/i });
    if (await checkoutInDrawer.isVisible().catch(() => false)) {
      await checkoutInDrawer.click();
    } else {
      await page.goto('/checkout');
    }

    // 7. On Checkout page
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/\/checkout/, { timeout: 10000 });
    await expect(page.getByRole('heading', { name: 'Checkout' })).toBeVisible({ timeout: 10000 });
    console.log('Successfully reached Checkout page');

    // Fill address details if empty
    const nameField = page.getByLabel(/full name/i);
    if ((await nameField.inputValue()) === '') {
      await nameField.fill('Live Customer Test');
    }
    const phoneField = page.getByLabel(/phone/i);
    if ((await phoneField.inputValue()) === '') {
      await phoneField.fill('9876543210');
    }
    const line1Field = page.getByLabel(/address line 1/i);
    if ((await line1Field.inputValue()) === '') {
      await line1Field.fill('123 Commercial Street');
    }
    const cityField = page.getByLabel(/city/i);
    if ((await cityField.inputValue()) === '') {
      await cityField.fill('Mumbai');
    }
    const stateField = page.getByLabel(/state/i);
    if ((await stateField.inputValue()) === '') {
      await stateField.fill('Maharashtra');
    }
    const pincodeField = page.getByLabel(/pincode/i);
    if ((await pincodeField.inputValue()) === '') {
      await pincodeField.fill('400001');
    }

    // 8. Explicitly select Cash on Delivery (COD) radio option
    const codRadio = page.getByRole('radio', { name: /cash on delivery/i });
    await codRadio.check({ force: true });
    await expect(codRadio).toBeChecked({ timeout: 5000 });
    console.log('Selected Cash on Delivery (COD) payment method');

    // 9. Submit Order
    const placeOrderBtn = page.getByRole('button', { name: /place order/i });
    await expect(placeOrderBtn).toBeEnabled({ timeout: 10000 });
    await placeOrderBtn.click();
    console.log('Clicked Place Order on Checkout page');

    // 10. Verify Order Confirmation Screen
    await expect(page).toHaveURL(/\/order\/success\/OC-/, { timeout: 30000 });
    await expect(page.getByRole('heading', { name: /thank you for your order/i })).toBeVisible({ timeout: 15000 });

    // Extract Order Number from URL
    const url = page.url();
    const orderNumber = url.split('/order/success/')[1]?.split('?')[0];
    console.log('>>> SUCCESSFULLY PLACED LIVE ORDER:', orderNumber);

    // 11. Verify order exists in Customer's Order History (/account/orders)
    await page.goto('/account/orders');
    await page.waitForLoadState('networkidle');
    await expect(page.locator(`text=${orderNumber}`).first()).toBeVisible({ timeout: 15000 });
    console.log('>>> ORDER VERIFIED IN CUSTOMER ORDER HISTORY ON LIVE SITE:', orderNumber);
    await expect(page.locator(`text=${orderNumber}`).first()).toBeVisible({ timeout: 15000 });
    console.log('>>> ORDER VERIFIED IN CUSTOMER ORDER HISTORY ON LIVE SITE:', orderNumber);
  });
});
