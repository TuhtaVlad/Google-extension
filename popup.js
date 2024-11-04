document.addEventListener("DOMContentLoaded", async () => {
    let chart;

    function prepareDataForChart(timestamps) {
        const timeIntervals = [];
        const maxTime = Math.ceil((Date.now() - timestamps[0]) / 1000);

        for (let i = 0; i <= maxTime; i++) {
            timeIntervals.push(0);
        }

        timestamps.forEach((timestamp) => {
            const interval = Math.floor((timestamp - timestamps[0]) / 1000);
            timeIntervals[interval]++;
        });

        return timeIntervals;
    }

    async function updateChart() {
        try {
            const response = await chrome.runtime.sendMessage({ action: "getRequestTimestamps" });
            const requestTimestamps = response ? response.timestamps : [];

            const requestCounts = prepareDataForChart(requestTimestamps);
            document.getElementById("count").textContent = requestCounts.reduce((a, b) => a + b, 0); // Обновление счётчика

            if (chart) {
                chart.data.labels = Array.from({ length: requestCounts.length }, (_, i) => i + "s");
                chart.data.datasets[0].data = requestCounts;
                chart.update();
            } else {
                const ctx = document.getElementById("requestChart").getContext("2d");
                chart = new Chart(ctx, {
                    type: "line",
                    data: {
                        labels: Array.from({ length: requestCounts.length }, (_, i) => i + "s"),
                        datasets: [{
                            label: "Success requests",
                            data: requestCounts,
                            fill: false,
                            borderColor: "#583e2e",
                            tension: 0.1
                        }]
                    },
                    options: {
                        scales: {
                            x: { title: { display: true, text: "Time (seconds)" } },
                            y: { title: { display: true, text: "Number of requests" }, beginAtZero: true }
                        }
                    }
                });
            }
        } catch (error) {
            console.error("Failed to get request timestamps:", error);
        }
    }

    function resetData() {
        chrome.storage.local.set({ successCount: 0 });
        chrome.runtime.sendMessage({ action: "resetRequestTimestamps" });

        document.getElementById("count").textContent = 0;
        if (chart) {
            chart.data.labels = [];
            chart.data.datasets[0].data = [];
            chart.update();
        }

        console.log("Data has been reset.");
    }

    document.getElementById("updateButton").addEventListener("click", updateChart);
    document.getElementById("resetButton").addEventListener("click", resetData);

    updateChart();
});
