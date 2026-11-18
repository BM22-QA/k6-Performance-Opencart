
export async function captureFailureScreenshot(page, scenarioName) {

    const screenshotPath =
        `reports/${scenarioName}-vu-${__VU}-iter-${__ITER}.png`;

    try {
        await page.screenshot({
            path: screenshotPath,
            fullPage: true
        });

        console.error(
            `Failure screenshot saved: ${screenshotPath}`
        );

    } catch (error) {
        console.error(
            `Unable to capture failure screenshot: ${error.message}`
        );
    }
}
