const predictBtn = document.getElementById('predictBtn');
const resetBtn = document.getElementById('resetBtn');
const detailBtn = document.getElementById('detailBtn');

const predictedMarksSpan = document.getElementById('predictedMarks');
const trendText = document.getElementById('trendText');
const aiSuggestion = document.getElementById('aiSuggestion');
const detailedSuggestion = document.getElementById('detailedSuggestion');

let marksData = [];
let lastInputs = {};

// Prediction
function predictMarks(data) {
    let marks =
        (0.25 * data.previousMarks) +
        (5 * data.studyHours) +
        (0.25 * data.attendance) +
        (0.15 * data.assignments) +
        (2 * data.sleepHours) -
        (2 * data.screenTime);

    return Math.max(0, Math.min(100, marks));
}

// Quick Suggestion
function generateSuggestion(data, marks) {
    if (marks < 40) return "Poor performance. Focus more.";
    if (marks < 70) return "Average performance. Improve consistency.";
    return "Excellent performance. Keep it up!";
}

// Detailed AI Report
function generateDetailedSuggestion(data, marks) {

    let performance =
        marks < 40 ? "Poor" :
        marks < 70 ? "Average" : "Excellent";

    let strengths = [];
    let weaknesses = [];

    if (data.studyHours >= 4) strengths.push("Good study hours");
    else weaknesses.push("Low study hours");

    if (data.attendance >= 75) strengths.push("Good attendance");
    else weaknesses.push("Low attendance");

    if (data.sleepHours >= 6) strengths.push("Healthy sleep");
    else weaknesses.push("Insufficient sleep");

    if (data.screenTime <= 5) strengths.push("Controlled screen time");
    else weaknesses.push("High screen time");

    return `
<div class="section">
<span class="section-title"> Performance Level:</span> ${performance}
</div>

<div class="section">
<span class="section-title"> Predicted Marks:</span> ${marks.toFixed(2)}
</div>

<div class="section">
<span class="section-title"> Strengths:</span>
- ${strengths.join("\n- ") || "None"}
</div>

<div class="section">
<span class="section-title">⚠ Weaknesses:</span>
- ${weaknesses.join("\n- ") || "None"}
</div>

<div class="section">
<span class="section-title"> Recommendations:</span>
- Improve weak areas
- Maintain consistency
- Balance study and rest
</div>
    `;
}

// Chart
const ctx = document.getElementById('marksChart').getContext('2d');

let chart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: [],
        datasets: [{
            label: 'Marks',
            data: [],
            borderColor: '#2563eb',
            tension: 0.4
        }]
    },
    options: {
        scales: {
            y: { min: 0, max: 100 }
        }
    }
});

// Predict
predictBtn.addEventListener('click', () => {
    const data = {
        studyHours: +document.getElementById('studyHours').value,
        attendance: +document.getElementById('attendance').value,
        assignments: +document.getElementById('assignments').value,
        previousMarks: +document.getElementById('previousMarks').value,
        sleepHours: +document.getElementById('sleepHours').value,
        screenTime: +document.getElementById('screenTime').value
    };

    if (Object.values(data).some(isNaN)) {
        alert("Fill all fields!");
        return;
    }

    const result = predictMarks(data);
    predictedMarksSpan.textContent = result.toFixed(2);

    marksData.push(result);
    lastInputs = { data, result };

    chart.data.labels.push(`Attempt ${marksData.length}`);
    chart.data.datasets[0].data.push(result);
    chart.update();

    aiSuggestion.textContent = generateSuggestion(data, result);

    if (marksData.length > 1) {
        trendText.textContent =
            result > marksData[marksData.length - 2]
                ? "Trend: Improving "
                : "Trend: Declining ";
    }
});

// Detailed Button
detailBtn.addEventListener('click', () => {
    if (!lastInputs.result) return alert("Predict first!");

    detailedSuggestion.innerHTML =
        generateDetailedSuggestion(lastInputs.data, lastInputs.result);
});

// Reset
resetBtn.addEventListener('click', () => {
    marksData = [];
    chart.data.labels = [];
    chart.data.datasets[0].data = [];
    chart.update();

    predictedMarksSpan.textContent = "--";
    trendText.textContent = "";
    aiSuggestion.textContent = "";
    detailedSuggestion.innerHTML = "";
});