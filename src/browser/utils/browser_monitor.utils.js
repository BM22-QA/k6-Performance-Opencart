
import { Counter } from 'k6/metrics';

export const browserConsoleErrors = new Counter(
    'browser_console_errors'
);

export const browserRequestFailures = new Counter(
    'browser_request_failures'
);

export const browserHttpErrorResponses = new Counter(
    'browser_http_error_responses'
);

export function attachBrowserMonitoring(page) {

    // Monitor browser console errors
    page.on('console', message => {
        if (message.type() === 'error') {
            browserConsoleErrors.add(1);

            console.error(
                `[Browser Console Error] ${message.text()}`
            );
        }
    });

    // Monitor failed network requests
    page.on('requestfailed', request => {
        browserRequestFailures.add(1);

        const failure = request.failure();
        const errorText = failure
            ? failure.errorText
            : 'Unknown network failure';

        console.error(
            `[Request Failed] ${request.method()} ${request.url()} - ${errorText}`
        );
    });

    // Monitor HTTP error responses
    page.on('response', response => {
        if (response.status() >= 400) {
            browserHttpErrorResponses.add(1);

            console.error(
                `[HTTP Error] ${response.status()} ${response.url()}`
            );
        }
    });
}
