import { test, expect } from '@playwright/test'

test.describe('Lofi Mixer App', () => {
  test('has title', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle(/Sonic Sanctuary/)
  })
  
  test('start screen is visible initially', async ({ page }) => {
    await page.goto('/')
    
    const startButton = page.locator('button:has-text("Enter")')
    await expect(startButton).toBeVisible()
  })
  
  test('can start audio engine', async ({ page }) => {
    await page.goto('/')
    
    // Click start button
    await page.click('button:has-text("Enter")')
    
    // Wait for controls to appear
    await expect(page.locator('text=Lofi Gen.')).toBeVisible()
  })
  
  test('can adjust volume slider', async ({ page }) => {
    await page.goto('/')
    
    // Start the app
    await page.click('button:has-text("Enter")')
    await page.waitForSelector('text=Rain')
    
    // Find and adjust rain slider
    const slider = page.locator('input#vol-rain')
    await expect(slider).toBeVisible()
    
    await slider.fill('0.5')
    await expect(slider).toHaveValue('0.5')
  })
  
  test('presets load correctly', async ({ page }) => {
    await page.goto('/')
    
    // Start the app
    await page.click('button:has-text("Enter")')
    await page.waitForSelector('text=Focus')
    
    // Click focus preset
    await page.click('button:has-text("Focus")')
    
    // Verify beats slider has value
    const beatsSlider = page.locator('input#vol-beats')
    await expect(beatsSlider).not.toHaveValue('0')
  })
  
  test('keyboard shortcuts work', async ({ page }) => {
    await page.goto('/')
    
    // Start the app
    await page.click('button:has-text("Enter")')
    await page.waitForTimeout(500)
    
    // Press space to toggle music
    await page.keyboard.press('Space')
    
    // Verify app is still running
    await expect(page.locator('text=Lofi Gen.')).toBeVisible()
  })
  
  test('URL state sharing works', async ({ page }) => {
    // Visit with shared state in URL
    await page.goto('/#rain=0.5&beats=0.8&tempo=90')
    
    // Start the app
    await page.click('button:has-text("Enter")')
    await page.waitForTimeout(500)
    
    // Verify values were loaded from URL
    const rainSlider = page.locator('input#vol-rain')
    await expect(rainSlider).toHaveValue('0.5')
    
    const beatsSlider = page.locator('input#vol-beats')
    await expect(beatsSlider).toHaveValue('0.8')
  })
})
