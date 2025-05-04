const dropArea = document.getElementById('drop-area');
const imageInput = document.getElementById('imageInput');
const checkButton = document.getElementById('checkButton');
const resultDiv = document.getElementById('result');

// Prevent default drag behaviors
['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropArea.addEventListener(eventName, preventDefaults, false);
    document.body.addEventListener(eventName, preventDefaults, false);
});

// Highlight drop area
['dragenter', 'dragover'].forEach(eventName => {
    dropArea.addEventListener(eventName, highlight, false);
});

// Unhighlight drop area
['dragleave', 'drop'].forEach(eventName => {
    dropArea.addEventListener(eventName, unhighlight, false);
});

// Handle drops and clicks
dropArea.addEventListener('drop', handleDrop, false);
dropArea.addEventListener('click', () => imageInput.click(), false);
imageInput.addEventListener('change', (e) => handleFiles(e.target.files), false);
checkButton.addEventListener('click', handleCheckButton, false);

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

function highlight() {
    dropArea.classList.add('hover');
}

function unhighlight() {
    dropArea.classList.remove('hover');
}

function handleDrop(e) {
    const dt = e.dataTransfer;
    const files = dt.files;
    handleFiles(files);
}

let currentFile = null;

function handleFiles(files) {
    if (files.length) {
        const file = files[0];
        if (file.type.startsWith('image/')) {
            currentFile = file;
            showPreview(file);
            resultDiv.textContent = 'Image selected. Click "Check for Cancer" to analyze.';
        } else {
            alert('Please upload a valid image file.');
        }
    }
}

function showPreview(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
        const img = document.createElement('img');
        img.src = e.target.result;
        img.style.maxWidth = '200px';
        img.style.maxHeight = '200px';
        dropArea.innerHTML = '';
        dropArea.appendChild(img);
    }
    reader.readAsDataURL(file);
}

function handleCheckButton() {
    if (!currentFile) {
        alert('Please select an image first.');
        return;
    }
    uploadFile(currentFile);
}

function uploadFile(file) {
    const formData = new FormData();
    formData.append('image', file);

    resultDiv.textContent = 'Analyzing image...';

    fetch('/predict_cancer', {
        method: 'POST',
        body: formData
    })
    .then(response => {
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return response.json();
    })
    .then(data => {
        const label = data.label;
        const confidence = (data.confidence * 100).toFixed(2);

        if (label === 'benign') {
            resultDiv.textContent = `✅ Prediction: BENIGN (${confidence}% confidence)`;
            resultDiv.style.color = 'green';
        } else if (label === 'malignant') {
            resultDiv.textContent = `⚠️ Prediction: MALIGNANT (${confidence}% confidence)`;
            resultDiv.style.color = 'red';
        } else {
            resultDiv.textContent = 'Prediction could not be made.';
            resultDiv.style.color = 'black';
        }
    })
    .catch(error => {
        console.error('Error:', error);
        resultDiv.textContent = 'Error occurred while analyzing image. Please try again.';
        resultDiv.style.color = 'red';
    });
}
