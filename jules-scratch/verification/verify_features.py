from playwright.sync_api import sync_playwright, expect

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    base_url = "http://localhost:4322"

    try:
        print("Navigating to homepage...")
        page.goto(base_url, timeout=60000)
        page.screenshot(path="jules-scratch/verification/homepage.png")
        print("Captured homepage screenshot.")

        print("Navigating to blog index page...")
        page.goto(f"{base_url}/blog", timeout=60000)
        page.screenshot(path="jules-scratch/verification/blog-index.png")
        print("Captured blog index page screenshot.")

        print("Navigating to a category page...")
        page.locator('.grid a').first.click()
        page.wait_for_load_state('networkidle', timeout=60000)
        page.screenshot(path="jules-scratch/verification/blog-category-page.png")
        print("Captured blog category page screenshot.")

        print("Navigating to contact page...")
        page.goto(f"{base_url}/contact", timeout=60000)
        page.screenshot(path="jules-scratch/verification/contact-page.png")
        print("Captured contact page screenshot.")

        print("Verifying footer on contact page...")
        footer = page.locator('footer')
        footer.scroll_into_view_if_needed()
        footer.screenshot(path="jules-scratch/verification/footer.png")
        print("Captured footer screenshot.")

    except Exception as e:
        print(f"An error occurred: {e}")
    finally:
        browser.close()

with sync_playwright() as p:
    run(p)