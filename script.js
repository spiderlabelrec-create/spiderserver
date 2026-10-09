document.addEventListener('DOMContentLoaded', function() {
  // Check if we are on the dashboard page
  const usernameSpan = document.getElementById('username');
  if (usernameSpan) {
    fetch('/api/user')
      .then(response => {
        if (!response.ok) {
          throw new Error('Not authenticated');
        }
        return response.json();
      })
      .then(data => {
        usernameSpan.textContent = data.username;
        // Hide upload tab if user is not admin
        const uploadTab = document.getElementById('upload-tab');
        if (data.role !== 'admin') {
          uploadTab.style.display = 'none';
        }
      })
      .catch(error => {
        console.error('Error fetching user data:', error);
        // Redirect to login if not authenticated
        window.location.href = '/login';
      });
  }

  // Tab switching functionality
  const tabButtons = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');

  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      // Remove active class from all buttons and contents
      tabButtons.forEach(btn => btn.classList.remove('active'));
      tabContents.forEach(content => content.classList.remove('active'));

      // Add active class to clicked button and corresponding content
      button.classList.add('active');
      const tabId = button.getAttribute('data-tab') + '-tab';
      document.getElementById(tabId).classList.add('active');
    });
  });

  // Handle file upload form submission
  const uploadForm = document.getElementById('uploadForm');
  if (uploadForm) {
    uploadForm.addEventListener('submit', function(e) {
      e.preventDefault(); // Prevent traditional form submission

      const formData = new FormData(this);
      const uploadMessage = document.getElementById('uploadMessage');
      const submitButton = this.querySelector('button[type="submit"]');

      // Show loading state
      uploadMessage.className = '';
      uploadMessage.textContent = 'Uploading...';
      submitButton.disabled = true;

      // Send AJAX request
      fetch('/upload', {
        method: 'POST',
        body: formData
      })
      .then(response => response.json())
      .then(data => {
        // Hide loading state
        submitButton.disabled = false;

        if (data.success) {
          uploadMessage.className = 'success';
          uploadMessage.textContent = data.message;

          // Optionally reset form after successful upload
          // this.reset();
        } else {
          uploadMessage.className = 'error';
          uploadMessage.textContent = data.message;
        }
      })
      .catch(error => {
        // Hide loading state
        submitButton.disabled = false;

        uploadMessage.className = 'error';
        uploadMessage.textContent = 'Upload failed: ' + error.message;
      });
    });
  }
});