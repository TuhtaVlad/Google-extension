let successCount = 0;
let requestTimestamps = [];

chrome.webRequest.onCompleted.addListener(
    (details) => {
        if (details.statusCode === 200) {
            successCount += 1;
            chrome.storage.local.set({ successCount });
        }
    },
    { urls: ["<all_urls>"] }
);

chrome.webRequest.onCompleted.addListener(
    (details) => {
        requestTimestamps.push(Date.now());
    },
    { urls: ["<all_urls>"] }
);

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "getRequestTimestamps") {
        sendResponse({ timestamps: requestTimestamps });
    } else if (request.action === "resetRequestTimestamps") {
        requestTimestamps = [];
        chrome.storage.local.set({ successCount: 0 });
        sendResponse({ success: true });
    }
});
