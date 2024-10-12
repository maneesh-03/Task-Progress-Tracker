let subjects = [];

function saveData() {
    localStorage.setItem('taskTrackerSubjects', JSON.stringify(subjects));
    console.log('Data saved:', subjects);
}

function loadData() {
    const savedSubjects = localStorage.getItem('taskTrackerSubjects');
    if (savedSubjects) {
        subjects = JSON.parse(savedSubjects);
        console.log('Data loaded:', subjects);
        renderSubjects();
        updateOverallCompletion();
        updateAnalytics();
    } else {
        console.log('No saved data found');
    }
}

function addSubject() {
    const subjectName = document.getElementById('subject-name').value;
    if (subjectName) {
        const subject = { name: subjectName, subsections: [], color: getContrastColor() };
        subjects.push(subject);
        renderSubjects();
        saveData();
        document.getElementById('subject-name').value = '';
    }
}

function addSubsection(subjectIndex) {
    const subsectionName = prompt("Enter subsection name:");
    const taskCount = parseInt(prompt("Enter number of tasks:"));
    if (subsectionName && !isNaN(taskCount)) {
        subjects[subjectIndex].subsections.push({ 
            name: subsectionName, 
            tasks: taskCount, 
            completed: 0,
            checkboxStates: new Array(taskCount).fill(false)
        });
        renderSubjects();
        saveData();
    }
}

function addTask(subjectIndex, subsectionIndex) {
    subjects[subjectIndex].subsections[subsectionIndex].tasks++;
    subjects[subjectIndex].subsections[subsectionIndex].checkboxStates.push(false);
    renderSubjects();
    saveData();
}

function removeTask(subjectIndex, subsectionIndex) {
    if (subjects[subjectIndex].subsections[subsectionIndex].tasks > 0) {
        subjects[subjectIndex].subsections[subsectionIndex].tasks--;
        subjects[subjectIndex].subsections[subsectionIndex].checkboxStates.pop();
        if (subjects[subjectIndex].subsections[subsectionIndex].completed > subjects[subjectIndex].subsections[subsectionIndex].tasks) {
            subjects[subjectIndex].subsections[subsectionIndex].completed = subjects[subjectIndex].subsections[subsectionIndex].tasks;
        }
        renderSubjects();
        saveData();
    }
}

function renderSubjects() {
    const container = document.getElementById('subjects');
    container.innerHTML = '';

    subjects.forEach((subject, subjectIndex) => {
        const subjectDiv = document.createElement('div');
        subjectDiv.classList.add('subject');
        subjectDiv.style.backgroundColor = subject.color;
        // Removed the line that sets the text color based on background
        
        const completionPercentage = calculateSubjectCompletion(subjectIndex);
        
        subjectDiv.innerHTML = `
            <h2>${subject.name}</h2>
            <div class="subject-buttons">
                <button onclick="addSubsection(${subjectIndex})" class="btn btn-secondary">Add Subsection</button>
                <button onclick="deleteSubject(${subjectIndex})" class="btn btn-secondary delete-button">Delete Subject</button>
            </div>
            <div class="progress-container">
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${completionPercentage}%;"></div>
                </div>
                <p>Completion: <span class="completion-text">${completionPercentage.toFixed(2)}%</span></p>
            </div>
        `;

        subject.subsections.forEach((subsection, subsectionIndex) => {
            const subsectionDiv = document.createElement('div');
            subsectionDiv.classList.add('subsection');
            subsectionDiv.innerHTML = `
                <div class="subsection-header">
                    <h3>${subsection.name}</h3>
                    <div class="subsection-buttons">
                        <button onclick="addTask(${subjectIndex}, ${subsectionIndex})" class="btn btn-circle">+</button>
                        <button onclick="removeTask(${subjectIndex}, ${subsectionIndex})" class="btn btn-circle remove-task">-</button>
                    </div>
                </div>
                <div class="checkbox-row">
                    ${subsection.checkboxStates.map((isChecked, i) => `
                        <div class="checkbox-item">
                            <input type="checkbox" id="checkbox-${subjectIndex}-${subsectionIndex}-${i}" 
                                   onchange="updateCompletion(${subjectIndex}, ${subsectionIndex}, ${i})"
                                   ${isChecked ? 'checked' : ''}>
                            <label for="checkbox-${subjectIndex}-${subsectionIndex}-${i}">${i + 1}</label>
                        </div>
                    `).join('')}
                </div>
                <p>Completed Tasks: <span class="completion-text">${subsection.completed}</span> out of ${subsection.tasks}</p>
            `;
            subjectDiv.appendChild(subsectionDiv);
        });

        container.appendChild(subjectDiv);
    });

    updateOverallCompletion();
    updateAnalytics();
}

function updateCompletion(subjectIndex, subsectionIndex, checkboxIndex) {
    const checkbox = document.getElementById(`checkbox-${subjectIndex}-${subsectionIndex}-${checkboxIndex}`);
    subjects[subjectIndex].subsections[subsectionIndex].checkboxStates[checkboxIndex] = checkbox.checked;
    
    const completed = subjects[subjectIndex].subsections[subsectionIndex].checkboxStates.filter(state => state).length;
    subjects[subjectIndex].subsections[subsectionIndex].completed = completed;

    renderSubjects();
    saveData();
}

function calculateSubjectCompletion(subjectIndex) {
    const subsections = subjects[subjectIndex].subsections;
    if (subsections.length === 0) return 0;

    const totalTasks = subsections.reduce((sum, subsection) => sum + subsection.tasks, 0);
    const totalCompleted = subsections.reduce((sum, subsection) => sum + subsection.completed, 0);

    return totalTasks > 0 ? (totalCompleted / totalTasks) * 100 : 0;
}

function updateOverallCompletion() {
    const totalTasks = subjects.reduce((sum, subject) => 
        sum + subject.subsections.reduce((subSum, subsection) => subSum + subsection.tasks, 0), 0);
    const totalCompleted = subjects.reduce((sum, subject) => 
        sum + subject.subsections.reduce((subSum, subsection) => subSum + subsection.completed, 0), 0);

    const overallCompletion = totalTasks > 0 ? (totalCompleted / totalTasks) * 100 : 0;

    document.getElementById('overallCompletion').innerText = `${overallCompletion.toFixed(2)}%`;
    document.getElementById('progress-fill').style.width = `${overallCompletion}%`;
    updateChart();
}

function updateAnalytics() {
    const totalSubjects = subjects.length;
    const totalSubsections = subjects.reduce((sum, subject) => sum + subject.subsections.length, 0);
    const totalTasks = subjects.reduce((sum, subject) => 
        sum + subject.subsections.reduce((subSum, subsection) => subSum + subsection.tasks, 0), 0);
    const totalCompleted = subjects.reduce((sum, subject) => 
        sum + subject.subsections.reduce((subSum, subsection) => subSum + subsection.completed, 0), 0);

    const analyticsContainer = document.getElementById('analytics');
    analyticsContainer.innerHTML = `
        <div class="analytics-card">
            <h3>Total Subjects</h3>
            <div class="analytics-value">${totalSubjects}</div>
        </div>
        <div class="analytics-card">
            <h3>Total Subsections</h3>
            <div class="analytics-value">${totalSubsections}</div>
        </div>
        <div class="analytics-card">
            <h3>Total Tasks</h3>
            <div class="analytics-value">${totalTasks}</div>
        </div>
        <div class="analytics-card">
            <h3>Completed Tasks</h3>
            <div class="analytics-value">${totalCompleted}</div>
        </div>
    `;
}

function deleteSubject(subjectIndex) {
    subjects.splice(subjectIndex, 1);
    renderSubjects();
    saveData();
}

function getContrastColor() {
    const hue = Math.floor(Math.random() * 360);
    const saturation = Math.floor(Math.random() * 30) + 70; // 70-100%
    const lightness = Math.floor(Math.random() * 20) + 65; // 65-85%
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

function getContrastYIQ(hexcolor){
    // If the color is in HSL format, convert it to HEX
    if (hexcolor.startsWith('hsl')) {
        hexcolor = hslToHex(hexcolor);
    }
    
    const r = parseInt(hexcolor.substr(1,2),16);
    const g = parseInt(hexcolor.substr(3,2),16);
    const b = parseInt(hexcolor.substr(5,2),16);
    const yiq = ((r*299)+(g*587)+(b*114))/1000;
    return (yiq >= 128) ? 'black' : 'white';
}

function hslToHex(hsl) {
    const [h, s, l] = hsl.match(/\d+/g).map(Number);
    
    const a = s * Math.min(l, 1 - l) / 100;
    const f = n => {
        const k = (n + h / 30) % 12;
        const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
        return Math.round(255 * color).toString(16).padStart(2, '0');
    };
    return `#${f(0)}${f(8)}${f(4)}`;
}

function updateChart() {
    const ctx = document.getElementById('completionChart').getContext('2d');
    const data = subjects.map(subject => calculateSubjectCompletion(subjects.indexOf(subject)));
    
    if (window.myChart instanceof Chart) {
        window.myChart.destroy();
    }
    
    window.myChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: subjects.map(subject => subject.name),
            datasets: [{
                label: 'Completion Percentage',
                data: data,
                backgroundColor: subjects.map(subject => subject.color),
                borderColor: subjects.map(subject => subject.color),
                borderWidth: 1,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    title: {
                        display: true,
                        text: 'Completion Percentage'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Subjects'
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                },
                title: {
                    display: true,
                    text: 'Subject Completion Overview'
                }
            }
        }
    });
}

window.onload = loadData;
window.addEventListener('beforeunload', saveData);