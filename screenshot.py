from playwright.sync_api import sync_playwright

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.goto("http://localhost:3000/")

        page.set_viewport_size({"width": 1280, "height": 800})
        page.wait_for_timeout(1000)

        page.screenshot(path="/app/screenshots/full.png", full_page=True)

        page.locator("#fighting").screenshot(path="/app/screenshots/fighting.png")
        page.locator("#blackjack").screenshot(path="/app/screenshots/blackjack.png")
        page.locator("#rps").screenshot(path="/app/screenshots/rps.png")
        page.locator("#imagegen").screenshot(path="/app/screenshots/imagegen.png")
        page.locator("#colors").screenshot(path="/app/screenshots/colors.png")
        page.locator("#age").screenshot(path="/app/screenshots/age.png")

        browser.close()

if __name__ == "__main__":
    run()
