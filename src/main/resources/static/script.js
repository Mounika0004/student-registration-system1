const API_URL = 'http://localhost:8080/api/students';

let isEditing = false;

// Load students when page loads
document.addEventListener('DOMContentLoaded', loadStudents);

// Form submission
document.getElementById('studentForm').addEventListener('submit', handleSubmit);

// Cancel button
document.getElementById('cancelBtn').addEventListener('click', resetForm);

async function loadStudents() {
    const studentsList = document.getElementById('studentsList');
    studentsList.innerHTML = '<div class="loading">Loading students...</div>';
    
    try {
        const response = await fetch(API_URL);
        const students = await response.json();
        
        if (students.length === 0) {
            studentsList.innerHTML = '<div class="no-students">No students registered yet.</div>';
            return;
        }
        
        studentsList.innerHTML = students.map(student => `
            <div class="student-card">
                <div class="student-id">ID: ${student.id}</div>
                <h3>${student.name}</h3>
                <p><strong>Email:</strong> ${student.email}</p>
                <p><strong>Course:</strong> ${student.course}</p>
                <p><strong>Phone:</strong> ${student.phoneNumber}</p>
                <div class="actions">
                    <button class="edit-btn" onclick="editStudent(${student.id})">Edit</button>
                    <button class="delete-btn" onclick="deleteStudent(${student.id})">Delete</button>
                </div>
            </div>
        `).join('');
    } catch (error) {
        studentsList.innerHTML = '<div class="error">Error loading students. Please make sure the backend is running.</div>';
        console.error('Error loading students:', error);
    }
}

async function handleSubmit(e) {
    e.preventDefault();
    
    const studentId = document.getElementById('studentId').value;
    const studentData = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        course: document.getElementById('course').value,
        phoneNumber: document.getElementById('phoneNumber').value
    };
    
    try {
        if (isEditing && studentId) {
            // Update existing student
            await fetch(`${API_URL}/${studentId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(studentData)
            });
            showMessage('Student updated successfully!', 'success');
        } else {
            // Create new student
            await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(studentData)
            });
            showMessage('Student registered successfully!', 'success');
        }
        
        resetForm();
        loadStudents();
    } catch (error) {
        showMessage('Error saving student. Please try again.', 'error');
        console.error('Error saving student:', error);
    }
}

async function editStudent(id) {
    try {
        const response = await fetch(`${API_URL}/${id}`);
        const student = await response.json();
        
        document.getElementById('studentId').value = student.id;
        document.getElementById('name').value = student.name;
        document.getElementById('email').value = student.email;
        document.getElementById('course').value = student.course;
        document.getElementById('phoneNumber').value = student.phoneNumber;
        
        isEditing = true;
        document.getElementById('formTitle').textContent = 'Edit Student';
        document.getElementById('submitBtn').textContent = 'Update Student';
        document.getElementById('cancelBtn').style.display = 'inline-block';
        
        // Scroll to form
        document.querySelector('.form-section').scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
        showMessage('Error loading student details.', 'error');
        console.error('Error loading student:', error);
    }
}

async function deleteStudent(id) {
    if (!confirm('Are you sure you want to delete this student?')) {
        return;
    }
    
    try {
        await fetch(`${API_URL}/${id}`, {
            method: 'DELETE'
        });
        showMessage('Student deleted successfully!', 'success');
        loadStudents();
    } catch (error) {
        showMessage('Error deleting student. Please try again.', 'error');
        console.error('Error deleting student:', error);
    }
}

function resetForm() {
    document.getElementById('studentForm').reset();
    document.getElementById('studentId').value = '';
    isEditing = false;
    document.getElementById('formTitle').textContent = 'Register New Student';
    document.getElementById('submitBtn').textContent = 'Register Student';
    document.getElementById('cancelBtn').style.display = 'none';
}

function showMessage(message, type) {
    const formSection = document.querySelector('.form-section');
    const existingMessage = formSection.querySelector('.error, .success');
    
    if (existingMessage) {
        existingMessage.remove();
    }
    
    const messageDiv = document.createElement('div');
    messageDiv.className = type;
    messageDiv.textContent = message;
    
    formSection.insertBefore(messageDiv, formSection.firstChild);
    
    setTimeout(() => {
        messageDiv.remove();
    }, 3000);
}
