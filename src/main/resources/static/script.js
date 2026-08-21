const API_URL = 'http://localhost:8080/api/students';

let isEditing = false;


// ==========================================
// PAGE LOAD
// ==========================================

document.addEventListener('DOMContentLoaded', () => {

    loadStudents();

    const studentForm = document.getElementById('studentForm');
    const cancelBtn = document.getElementById('cancelBtn');

    if (studentForm) {
        studentForm.addEventListener('submit', handleSubmit);
    }

    if (cancelBtn) {
        cancelBtn.addEventListener('click', resetForm);
    }

    // Check if an employee is being edited
    const editId = new URLSearchParams(window.location.search).get('editId');

    if (editId && studentForm) {
        loadStudentForEdit(editId);
    }
});


// ==========================================
// LOAD EMPLOYEES
// ==========================================

async function loadStudents() {

    const studentsList = document.getElementById('studentsList');

    if (!studentsList) {
        return;
    }

    studentsList.innerHTML =
        '<div class="loading">Loading employees...</div>';

    try {

        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error('Failed to load employees');
        }

        const students = await response.json();

        if (students.length === 0) {

            studentsList.innerHTML =
                '<div class="no-students">No employees registered yet.</div>';

            return;
        }

        studentsList.innerHTML = students.map(student => `

            <div class="student-card">

                <div class="student-id">
                    ID: ${student.id}
                </div>

                <h3>${student.name}</h3>

                <p>
                    <strong>Email:</strong>
                    ${student.email}
                </p>

                <p>
                    <strong>Course:</strong>
                    ${student.course}
                </p>

                <p>
                    <strong>Phone:</strong>
                    ${student.phoneNumber}
                </p>

                <div class="actions">

                    <button
                        type="button"
                        class="edit-btn"
                        onclick="editStudent(${student.id})">
                        Edit
                    </button>

                    <button
                        type="button"
                        class="delete-btn"
                        onclick="deleteStudent(${student.id})">
                        Delete
                    </button>

                </div>

            </div>

        `).join('');

    } catch (error) {

        studentsList.innerHTML =
            '<div class="error">Error loading employees. Please make sure the backend is running.</div>';

        console.error('Error loading employees:', error);
    }
}


// ==========================================
// EDIT BUTTON
// ==========================================

function editStudent(id) {

    console.log("Editing employee ID:", id);

    // Go back to registration page
    window.location.href = `index.html?editId=${id}`;
}


// ==========================================
// LOAD EMPLOYEE FOR EDITING
// ==========================================

async function loadStudentForEdit(id) {

    try {

        console.log("Loading employee for edit:", id);

        const response = await fetch(`${API_URL}/${id}`);

        if (!response.ok) {
            throw new Error('Employee not found');
        }

        const student = await response.json();

        console.log("Employee data:", student);


        // Fill form fields

        document.getElementById('studentId').value =
            student.id;

        document.getElementById('name').value =
            student.name;

        document.getElementById('email').value =
            student.email;

        document.getElementById('course').value =
            student.course;

        document.getElementById('phoneNumber').value =
            student.phoneNumber;


        // Enable edit mode

        isEditing = true;


        document.getElementById('formTitle').textContent =
            'Edit Employee';

        document.getElementById('submitBtn').textContent =
            'Update Employee';

        document.getElementById('cancelBtn').style.display =
            'inline-block';


        // Scroll to form

        const formSection =
            document.querySelector('.form-section');

        if (formSection) {

            formSection.scrollIntoView({
                behavior: 'smooth'
            });

        }

    } catch (error) {

        console.error(
            'Error loading employee:',
            error
        );

        showMessage(
            'Error loading employee details.',
            'error'
        );
    }
}


// ==========================================
// FORM SUBMIT
// ==========================================

async function handleSubmit(e) {

    e.preventDefault();


    const studentId =
        document.getElementById('studentId').value;


    const studentData = {

        name:
            document.getElementById('name').value,

        email:
            document.getElementById('email').value,

        course:
            document.getElementById('course').value,

        phoneNumber:
            document.getElementById('phoneNumber').value
    };


    try {


        // ==================================
        // UPDATE EMPLOYEE
        // ==================================

        if (isEditing && studentId) {

            console.log(
                "Updating employee:",
                studentId
            );


            const response = await fetch(
                `${API_URL}/${studentId}`,
                {
                    method: 'PUT',

                    headers: {
                        'Content-Type':
                            'application/json'
                    },

                    body:
                        JSON.stringify(studentData)
                }
            );


            if (!response.ok) {

                throw new Error(
                    'Failed to update employee'
                );

            }


            showMessage(
                'Employee updated successfully!',
                'success'
            );

        }


        // ==================================
        // CREATE EMPLOYEE
        // ==================================

        else {

            const response = await fetch(
                API_URL,
                {
                    method: 'POST',

                    headers: {
                        'Content-Type':
                            'application/json'
                    },

                    body:
                        JSON.stringify(studentData)
                }
            );


            if (!response.ok) {

                throw new Error(
                    'Failed to register employee'
                );

            }


            showMessage(
                'Employee registered successfully!',
                'success'
            );
        }


        // Reset form

        resetForm();


        // Reload employees

        loadStudents();


    } catch (error) {

        console.error(
            'Error saving employee:',
            error
        );

        showMessage(
            'Error saving employee. Please try again.',
            'error'
        );
    }
}


// ==========================================
// DELETE EMPLOYEE
// ==========================================

async function deleteStudent(id) {

    const confirmed = confirm(
        'Are you sure you want to delete this employee?'
    );


    if (!confirmed) {
        return;
    }


    try {

        const response = await fetch(
            `${API_URL}/${id}`,
            {
                method: 'DELETE'
            }
        );


        if (!response.ok) {

            throw new Error(
                'Failed to delete employee'
            );

        }


        showMessage(
            'Employee deleted successfully!',
            'success'
        );


        loadStudents();


    } catch (error) {

        console.error(
            'Error deleting employee:',
            error
        );

        showMessage(
            'Error deleting employee. Please try again.',
            'error'
        );
    }
}


// ==========================================
// RESET FORM
// ==========================================

function resetForm() {

    const studentForm =
        document.getElementById('studentForm');


    if (!studentForm) {
        return;
    }


    studentForm.reset();


    document.getElementById('studentId').value =
        '';


    isEditing = false;


    document.getElementById('formTitle').textContent =
        'Register New Employee';


    document.getElementById('submitBtn').textContent =
        'Register Employee';


    document.getElementById('cancelBtn').style.display =
        'none';


    // Remove editId from URL

    if (window.location.search) {

        window.history.replaceState(
            {},
            document.title,
            'index.html'
        );

    }
}


// ==========================================
// SHOW MESSAGE
// ==========================================

function showMessage(message, type) {

    const formSection =
        document.querySelector('.form-section');


    if (!formSection) {
        return;
    }


    const existingMessage =
        formSection.querySelector(
            '.error, .success'
        );


    if (existingMessage) {
        existingMessage.remove();
    }


    const messageDiv =
        document.createElement('div');


    messageDiv.className = type;


    messageDiv.textContent =
        message;


    formSection.insertBefore(
        messageDiv,
        formSection.firstChild
    );


    setTimeout(() => {

        if (messageDiv) {
            messageDiv.remove();
        }

    }, 3000);
}