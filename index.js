// Function to render study plan items
function renderStudyPlan(studyPlan) {
  const studyPlanContainer = document.getElementById('study-plan');
  studyPlanContainer.innerHTML = ''; // Clear existing content

  studyPlan.forEach(({ time, meridian, subject, topic, duration, buttonText, buttonColor, url }) => {
    const container = document.createElement('div');
    container.className = 'border border-gray-200 rounded-md p-3 flex flex-col sm:flex-row sm:items-center sm:justify-between';

    const left = document.createElement('div');
    left.className = 'flex items-center space-x-3 mb-2 sm:mb-0';

    const timeSpan = document.createElement('span');
    timeSpan.className = 'text-xs text-gray-600 select-none';
    timeSpan.innerHTML = `${time} <span class="font-normal">${meridian}</span>`;

    const subjectDiv = document.createElement('div');
    const subjectP = document.createElement('p');
    subjectP.className = 'font-semibold text-sm text-gray-900 select-none';
    subjectP.textContent = subject;
    const topicP = document.createElement('p');
    topicP.className = 'text-xs text-gray-500 select-none';
    topicP.textContent = topic;

    subjectDiv.appendChild(subjectP);
    subjectDiv.appendChild(topicP);

    left.appendChild(timeSpan);
    left.appendChild(subjectDiv);

    const right = document.createElement('div');
    right.className = 'flex items-center space-x-4';

    const durationSpan = document.createElement('span');
    durationSpan.className = 'text-xs text-gray-600 select-none';
    durationSpan.textContent = duration;

    const button = document.createElement('button');
    button.type = 'button';
    button.className = `${buttonColor} text-white text-xs font-semibold rounded-md py-1.5 px-4 select-none`;
    button.textContent = buttonText;

    // Add click handlers for study plan buttons
    button.addEventListener('click', () => {
      if (url) {
        // If url is provided, open the file directly
        window.open(url, '_blank');
      } else {
        // Cycle button text and color: Start -> Continue -> Done, then stay Done
        if (button.textContent === 'Start') {
          button.textContent = 'Continue';
          button.classList.remove('bg-blue-600', 'hover:bg-blue-700');
          button.classList.add('bg-green-500', 'hover:bg-green-600');
        } else if (button.textContent === 'Continue') {
          button.textContent = 'Done';
          button.classList.remove('bg-green-500', 'hover:bg-green-600');
          button.classList.add('bg-gray-500', 'hover:bg-gray-600');
        } else if (button.textContent === 'Done') {
          // Do nothing, stay Done
          return;
        }
      }
    });

    right.appendChild(durationSpan);
    right.appendChild(button);

    container.appendChild(left);
    container.appendChild(right);

    studyPlanContainer.appendChild(container);
  });
}

// Initial static study plan data
const staticStudyPlan = [
  {
    time: '09:00',
    meridian: 'AM',
    subject: 'Mathematics',
    topic: 'Calculus',
    duration: '1h 30m',
    buttonText: 'Start',
    buttonColor: 'bg-blue-600 hover:bg-blue-600',
  },
  {
    time: '11:00',
    meridian: 'AM',
    subject: 'Physics',
    topic: 'Quantum Mechanics',
    duration: '2h',
    buttonText: 'Start',
    buttonColor: 'bg-blue-600 hover:bg-blue-700',
  },
  {
    time: '02:00',
    meridian: 'PM',
    subject: 'Chemistry',
    topic: 'Organic Chemistry',
    duration: '1h',
    buttonText: 'Start',
    buttonColor: 'bg-blue-600 hover:bg-blue-700',
  },
];

// Function to fetch materials from backend and update study plan
async function fetchMaterialsAndUpdateStudyPlan() {
  try {
    const response = await fetch('http://localhost:5000/materials');
    if (!response.ok) {
      console.error('Failed to fetch materials:', response.statusText);
      renderStudyPlan(staticStudyPlan);
      return;
    }
    const materials = await response.json();

    // Map materials to study plan items with Start button opening the file
    const uploadedStudyPlanItems = materials.map((material, index) => ({
      time: 'Uploaded',
      meridian: '',
      subject: 'Uploaded Material',
      topic: material.title,
      duration: '-',
      buttonText: 'Start',
      buttonColor: 'bg-green-600 hover:bg-green-700',
      url: 'http://localhost:5000' + material.url,
    }));

    // Render combined study plan: uploaded materials first, then static plan
    renderStudyPlan([...uploadedStudyPlanItems, ...staticStudyPlan]);
  } catch (error) {
    console.error('Error fetching materials:', error);
    renderStudyPlan(staticStudyPlan);
  }
}

// Handle form submission with fetch API and update study plan on success
const uploadForm = document.getElementById('upload-form');
uploadForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const formData = new FormData(uploadForm);
  try {
    const response = await fetch('http://localhost:5000/upload', {
      method: 'POST',
      headers: {
        'Accept': 'application/json'
      },
      body: formData
    });
    if (response.ok) {
      // Refresh study plan to include newly uploaded file
      await fetchMaterialsAndUpdateStudyPlan();
    } else {
      const errorData = await response.json();
      alert('Upload failed: ' + errorData.message);
    }
  } catch (error) {
    alert('Upload error: ' + error.message);
  }
});

// Auto-submit file upload on file selection
const fileInput = document.getElementById('file-upload');
fileInput.addEventListener('change', () => {
  if (fileInput.files.length > 0) {
    uploadForm.dispatchEvent(new Event('submit'));
  }
});

// On page load, fetch materials and update study plan
window.addEventListener('DOMContentLoaded', () => {
  fetchMaterialsAndUpdateStudyPlan();
});
