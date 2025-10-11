from playwright.sync_api import sync_playwright

def run(playwright):
    browser = playwright.chromium.launch()
    page = browser.new_page()
    page.goto("http://localhost:4321/blog")

    # Set the page to RTL
    page.evaluate("document.documentElement.setAttribute('dir', 'rtl')")

    # Take a screenshot of the first blog card
    blog_card = page.locator('article').first
    blog_card.screenshot(path="jules-scratch/verification/verification.png")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)