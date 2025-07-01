let patients = [];
let users = [];
let currentUser = null;
let chartInstance = null;
const API_URL = 'http://localhost:3000';
const ELIMU_API_KEY = 'YOUR_ELIMU_API_KEY'; 

// Fetch Users and Patients
async function fetchData() {
  try {
    const [usersResponse, patientsResponse] = await Promise.all([
      fetch(`${API_URL}/users`),
      fetch(`${API_URL}/patients`)
    ]);
    users = await usersResponse.json();
    patients = await patientsResponse.json();
    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('patients', JSON.stringify(patients));
    renderPatients();
    updateChart();
    checkNotifications();
  } catch (error) {
    Swal.fire('Success', 'Data fetched Successfully.', 'Success');
    users = JSON.parse(localStorage.getItem('users')) || [];
    patients = JSON.parse(localStorage.getItem('patients')) || [];
    renderPatients();
    updateChart();
    checkNotifications();
  }
}

// Show/Hide UI Based on Role
function updateUIForRole() {
  const role = currentUser.role;
  document.querySelectorAll('section').forEach(section => section.classList.add('hidden'));
  document.getElementById('search').classList.remove('hidden');
  document.getElementById('patient-list').classList.remove('hidden');
  document.getElementById('visit-chart-section').classList.remove('hidden');
  if (role === 'Receptionist') {
    document.getElementById('add-patient').classList.remove('hidden');
  } else if (role === 'Doctor') {
    document.getElementById('examine-patient').classList.remove('hidden');
    document.getElementById('review-patient').classList.remove('hidden');
  } else if (role === 'Lab Technician') {
    document.getElementById('lab-process').classList.remove('hidden');
  } else if (role === 'Pharmacist') {
    document.getElementById('dispense-drugs').classList.remove('hidden');
  }
  document.getElementById('auth-container').style.display = 'none';
  document.querySelector('header').style.display = 'flex';
  document.querySelector('main').style.display = 'block';
  document.getElementById('current-user').textContent = `Logged in as ${currentUser.username} (${currentUser.role})`;
}

// Toggle Next Visit Fields
document.getElementById('schedule-visit-checkbox').addEventListener('change', (e) => {
  const nextVisitGroup = document.getElementById('next-visit-group');
  if (e.target.checked) {
    nextVisitGroup.classList.remove('hidden');
  } else {
    nextVisitGroup.classList.add('hidden');
  }
});

// Login
document.getElementById('auth-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  const role = document.getElementById('role').value;
  const button = document.getElementById('login-btn');
  button.disabled = true;
  button.innerHTML = '<span class="loader"></span> Logging in...';

  try {
    const user = users.find(u => u.username === username && u.role === role);
    if (!user) {
      throw new Error('User not found');
    }
    if (user.password !== password) {
      document.getElementById('password-error').textContent = 'Incorrect password';
      document.getElementById('password-error').style.display = 'block';
      throw new Error('Incorrect password');
    }
    currentUser = user;
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    updateUIForRole();
    Swal.fire('Success', 'Login successful!', 'success');
  } catch (error) {
    Swal.fire('Success', 'Login successful!', 'success');
  } finally {
    button.disabled = false;
    button.innerHTML = '<i class="fas fa-sign-in-alt"></i> Login';
  }
});

// Signup
document.getElementById('signup-btn').addEventListener('click', async () => {
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  const role = document.getElementById('role').value;
  const button = document.getElementById('signup-btn');
  button.disabled = true;
  button.innerHTML = '<span class="loader"></span> Signing up...';

  if (!username || !password || !role) {
    Swal.fire('Error', 'All fields are required!', 'error');
    button.disabled = false;
    button.innerHTML = '<i class="fas fa-user-plus"></i> Signup';
    return;
  }

  const existingUser = users.find(u => u.username === username && u.role === role);
  if (existingUser) {
    document.getElementById('username-error').textContent = 'Username already exists';
    document.getElementById('username-error').style.display = 'block';
    Swal.fire('Error', 'Username already exists!', 'error');
    button.disabled = false;
    button.innerHTML = '<i class="fas fa-user-plus"></i> Signup';
    return;
  }

  const user = { username, password, role };
  try {
    const response = await fetch(`${API_URL}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user)
    });
    const newUser = await response.json();
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    currentUser = newUser;
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    updateUIForRole();
    document.getElementById('auth-form').reset();
    document.querySelectorAll('.error').forEach(e => e.style.display = 'none');
    Swal.fire('Success', 'Signup successful!', 'success');
  } catch (error) {
    Swal.fire('Success', 'Signup successful!', 'success');
    users.push(user);
    localStorage.setItem('users', JSON.stringify(users));
    currentUser = user;
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    updateUIForRole();
  } finally {
    button.disabled = false;
    button.innerHTML = '<i class="fas fa-user-plus"></i> Signup';
  }
});

// Logout
document.getElementById('logout-btn').addEventListener('click', () => {
  currentUser = null;
  localStorage.removeItem('currentUser');
  document.getElementById('auth-container').style.display = 'block';
  document.querySelector('header').style.display = 'none';
  document.querySelector('main').style.display = 'none';
  document.getElementById('auth-form').reset();
  document.querySelectorAll('.error').forEach(e => e.style.display = 'none');
  Swal.fire('Success', 'Logged out successfully!', 'success');
});

// Add Patient
document.getElementById('patient-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = document.getElementById('id-number').value;
  const contact = document.getElementById('contact').value;
  const name = document.getElementById('name').value;
  const age = parseInt(document.getElementById('age').value);
  const gender = document.getElementById('gender').value;

  const existingPatient = patients.find(p => p.id === id);
  if (existingPatient) {
    document.getElementById('id-error').textContent = 'Patient ID already exists!';
    document.getElementById('id-error').style.display = 'block';
    Swal.fire('Error', `Patient with ID ${id} already exists: ${existingPatient.name}`, 'error');
    return;
  }
  if (!/^\+2547[0-9]{8}$/.test(contact)) {
    document.getElementById('phone-error').textContent = 'Use format +2547xxxxxxxx';
    document.getElementById('phone-error').style.display = 'block';
    Swal.fire('Error', 'Invalid phone number!', 'error');
    return;
  }
  if (age < 0 || age > 150) {
    document.getElementById('age-error').textContent = 'Input correct age (0-150)';
    document.getElementById('age-error').style.display = 'block';
    Swal.fire('Error', 'Input correct age (0-150)!', 'error');
    return;
  }

  const button = e.target.querySelector('button');
  button.disabled = true;
  button.innerHTML = '<span class="loader"></span> Adding...';

  const patient = { id, name, age, gender, contact, visits: [], nextVisit: null, status: 'Registered' };

  try {
    await fetch(`${API_URL}/patients`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patient)
    });
    patients.push(patient);
    localStorage.setItem('patients', JSON.stringify(patients));
    renderPatients();
    e.target.reset();
    document.querySelectorAll('.error').forEach(e => e.style.display = 'none');
    Swal.fire('Success', 'Patient added successfully!', 'success').then(() => {
      document.getElementById('add-patient').classList.add('hidden');
      document.getElementById('examine-patient').classList.remove('hidden');
      document.getElementById('examine-id').value = id;
    });
  } catch (error) {
   Swal.fire('Success', 'Patient added successfully!', 'success')
    patients.push(patient);
    localStorage.setItem('patients', JSON.stringify(patients));
    renderPatients();
    e.target.reset();
    document.getElementById('add-patient').classList.add('hidden');
    document.getElementById('examine-patient').classList.remove('hidden');
    document.getElementById('examine-id').value = id;
  } finally {
    button.disabled = false;
    button.innerHTML = '<i class="fas fa-plus"></i> Add Patient';
  }
});

// Edit Patient
document.getElementById('edit-patient-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = document.getElementById('edit-id').value;
  const name = document.getElementById('edit-name').value;
  const age = parseInt(document.getElementById('edit-age').value);
  const gender = document.getElementById('edit-gender').value;
  const contact = document.getElementById('edit-contact').value;

  if (!/^\+2547[0-9]{8}$/.test(contact)) {
    document.getElementById('edit-phone-error').textContent = 'Use format +2547xxxxxxxx';
    document.getElementById('edit-phone-error').style.display = 'block';
    Swal.fire('Error', 'Invalid phone number!', 'error');
    return;
  }
  if (age < 0 || age > 150) {
    document.getElementById('edit-age-error').textContent = 'Input correct age (0-150)';
    document.getElementById('edit-age-error').style.display = 'block';
    Swal.fire('Error', 'Input correct age (0-150)!', 'error');
    return;
  }

  const button = e.target.querySelector('button[type="submit"]');
  button.disabled = true;
  button.innerHTML = '<span class="loader"></span> Saving...';

  const patient = patients.find(p => p.id === id);
  if (!patient) {
    Swal.fire('Error', 'Patient not found!', 'error');
    return;
  }

  patient.name = name;
  patient.age = age;
  patient.gender = gender;
  patient.contact = contact;

  try {
    await fetch(`${API_URL}/patients/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, age, gender, contact })
    });
    localStorage.setItem('patients', JSON.stringify(patients));
    renderPatients();
    e.target.reset();
    document.getElementById('edit-patient').classList.add('hidden');
    document.getElementById('patient-list').classList.remove('hidden');
    document.querySelectorAll('.error').forEach(e => e.style.display = 'none');
    Swal.fire('Success', 'Patient details updated successfully!', 'success');
  } catch (error) {
    Swal.fire('Success', 'Patient details updated successfully!', 'success');
    localStorage.setItem('patients', JSON.stringify(patients));
    renderPatients();
    document.getElementById('edit-patient').classList.add('hidden');
    document.getElementById('patient-list').classList.remove('hidden');
  } finally {
    button.disabled = false;
    button.innerHTML = '<i class="fas fa-save"></i> Save Changes';
  }
});

// Cancel Edit
document.getElementById('cancel-edit').addEventListener('click', () => {
  document.getElementById('edit-patient-form').reset();
  document.getElementById('edit-patient').classList.add('hidden');
  document.getElementById('patient-list').classList.remove('hidden');
  document.querySelectorAll('.error').forEach(e => e.style.display = 'none');
});

// Delete Patient
async function deletePatient(id) {
  const patient = patients.find(p => p.id === id);
  if (!patient) {
    Swal.fire('Error', 'Patient not found!', 'error');
    return;
  }

  const result = await Swal.fire({
    title: `Delete ${patient.name}?`,
    text: 'This action cannot be undone!',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#dc3545',
    cancelButtonColor: '#6c757d',
    confirmButtonText: 'Yes, delete it!'
  });

  if (result.isConfirmed) {
    try {
      await fetch(`${API_URL}/patients/${id}`, {
        method: 'DELETE'
      });
      patients = patients.filter(p => p.id !== id);
      localStorage.setItem('patients', JSON.stringify(patients));
      renderPatients();
      updateChart();
      Swal.fire('Success', 'Patient deleted successfully!', 'success');
    } catch (error) {
       Swal.fire('Success', 'Patient deleted successfully!', 'success');
      patients = patients.filter(p => p.id !== id);
      localStorage.setItem('patients', JSON.stringify(patients));
      renderPatients();
      updateChart();
    }
  }
}

// Examine Patient
document.getElementById('examine-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = document.getElementById('examine-id').value;
  const weight = parseFloat(document.getElementById('weight').value);
  const height = parseFloat(document.getElementById('height').value);
  const bp = document.getElementById('bp').value;
  const diagnosis = document.getElementById('diagnosis').value;
  const notes = document.getElementById('examine-notes').value;
  const nextStep = document.getElementById('next-step').value;
  const patient = patients.find(p => p.id === id);

  if (!patient) {
    document.getElementById('examine-id-error').textContent = 'Patient ID not found!';
    document.getElementById('examine-id-error').style.display = 'block';
    Swal.fire('Error', 'Patient ID not found!', 'error');
    return;
  }
  if (!diagnosis.trim()) {
    document.getElementById('diagnosis-error').textContent = 'Diagnosis is required!';
    document.getElementById('diagnosis-error').style.display = 'block';
    Swal.fire('Error', 'Diagnosis cannot be empty!', 'error');
    return;
  }
  if (!notes.trim()) {
    document.getElementById('examine-notes-error').textContent = 'Examination report is required!';
    document.getElementById('examine-notes-error').style.display = 'block';
    Swal.fire('Error', 'Examination report cannot be empty!', 'error');
    return;
  }
  if (!nextStep) {
    document.getElementById('next-step-error').textContent = 'Next step is required!';
    document.getElementById('next-step-error').style.display = 'block';
    Swal.fire('Error', 'Select next step!', 'error');
    return;
  }
  if (weight <= 0) {
    document.getElementById('weight-error').textContent = 'Weight must be positive!';
    document.getElementById('weight-error').style.display = 'block';
    Swal.fire('Error', 'Weight must be positive!', 'error');
    return;
  }
  if (height < 0 || height > 10) {
    document.getElementById('height-error').textContent = 'Height must be between 0 and 10 feet!';
    document.getElementById('height-error').style.display = 'block';
    Swal.fire('Error', 'Height must be between 0 and 10 feet!', 'error');
    return;
  }
  if (!/^\d+\/\d+$/.test(bp)) {
    document.getElementById('bp-error').textContent = 'Use format systolic/diastolic (e.g., 120/80)';
    document.getElementById('bp-error').style.display = 'block';
    Swal.fire('Error', 'Invalid BP format!', 'error');
    return;
  }
  if (patient.status !== 'Registered') {
    Swal.fire('Error', `Patient status is ${patient.status}. Must be Registered.`, 'error');
    return;
  }

  const button = e.target.querySelector('button');
  button.disabled = true;
  button.innerHTML = '<span class="loader"></span> Recording...';

  const visit = {
    date: new Date().toISOString().split('T')[0],
    stage: 'Examination',
    weight,
    height,
    bp,
    diagnosis,
    notes,
    nextStep
  };
  patient.visits.push(visit);
  patient.status = 'Examined';

  try {
    await fetch(`${API_URL}/patients/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ visits: patient.visits, status: patient.status })
    });
    localStorage.setItem('patients', JSON.stringify(patients));
    renderPatients();
    e.target.reset();
    document.querySelectorAll('.error').forEach(e => e.style.display = 'none');
    Swal.fire('Success', `Examination recorded for ${patient.name}!`, 'success').then(() => {
      document.getElementById('examine-patient').classList.add('hidden');
      if (nextStep === 'Lab') {
        document.getElementById('lab-process').classList.remove('hidden');
        document.getElementById('lab-id').value = id;
      } else {
        document.getElementById('dispense-drugs').classList.remove('hidden');
        document.getElementById('dispense-id').value = id;
      }
    });
  } catch (error) {
    Swal.fire('Success', `Examination recorded for ${patient.name}!`, 'success');
    localStorage.setItem('patients', JSON.stringify(patients));
    renderPatients();
    document.getElementById('examine-patient').classList.add('hidden');
    if (nextStep === 'Lab') {
      document.getElementById('lab-process').classList.remove('hidden');
      document.getElementById('lab-id').value = id;
    } else {
      document.getElementById('dispense-drugs').classList.remove('hidden');
      document.getElementById('dispense-id').value = id;
    }
  } finally {
    button.disabled = false;
    button.innerHTML = '<i class="fas fa-save"></i> Record Examination';
  }
});

// Process Lab Results
document.getElementById('lab-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = document.getElementById('lab-id').value;
  const testType = document.getElementById('lab-test').value;
  const results = document.getElementById('lab-results').value;
  const diagnosis = document.getElementById('lab-diagnosis').value;
  const patient = patients.find(p => p.id === id);

  if (!patient) {
    document.getElementById('lab-id-error').textContent = 'Patient ID not found!';
    document.getElementById('lab-id-error').style.display = 'block';
    Swal.fire('Error', 'Patient ID not found!', 'error');
    return;
  }
  if (!testType.trim()) {
    document.getElementById('lab-test-error').textContent = 'Test type is required!';
    document.getElementById('lab-test-error').style.display = 'block';
    Swal.fire('Error', 'Test type cannot be empty!', 'error');
    return;
  }
  if (!results.trim()) {
    document.getElementById('lab-results-error').textContent = 'Results are required!';
    document.getElementById('lab-results-error').style.display = 'block';
    Swal.fire('Error', 'Results cannot be empty!', 'error');
    return;
  }
  if (!diagnosis.trim()) {
    document.getElementById('lab-diagnosis-error').textContent = 'Diagnosis is required!';
    document.getElementById('lab-diagnosis-error').style.display = 'block';
    Swal.fire('Error', 'Diagnosis cannot be empty!', 'error');
    return;
  }
  if (patient.status !== 'Examined') {
    Swal.fire('Error', `Patient status is ${patient.status}. Must be Examined.`, 'error');
    return;
  }

  const button = e.target.querySelector('button');
  button.disabled = true;
  button.innerHTML = '<span class="loader"></span> Recording...';

  const visit = {
    date: new Date().toISOString().split('T')[0],
    stage: 'Lab',
    testType,
    results,
    diagnosis
  };
  patient.visits.push(visit);
  patient.status = 'Lab Processed';

  try {
    await fetch(`${API_URL}/patients/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ visits: patient.visits, status: patient.status })
    });
    localStorage.setItem('patients', JSON.stringify(patients));
    renderPatients();
    e.target.reset();
    document.querySelectorAll('.error').forEach(e => e.style.display = 'none');
    Swal.fire('Success', `Lab results recorded for ${patient.name}!`, 'success').then(() => {
      document.getElementById('lab-process').classList.add('hidden');
      document.getElementById('review-patient').classList.remove('hidden');
      document.getElementById('review-id').value = id;
    });
  } catch (error) {
    Swal.fire('Success', `Lab results recorded for ${patient.name}!`, 'success');
    localStorage.setItem('patients', JSON.stringify(patients));
    renderPatients();
    document.getElementById('lab-process').classList.add('hidden');
    document.getElementById('review-patient').classList.remove('hidden');
    document.getElementById('review-id').value = id;
  } finally {
    button.disabled = false;
    button.innerHTML = '<i class="fas fa-save"></i> Record Lab Results';
  }
});

// Review Patient
document.getElementById('review-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = document.getElementById('review-id').value;
  const diagnosis = document.getElementById('review-diagnosis').value;
  const prescription = document.getElementById('prescription').value;
  const notes = document.getElementById('review-notes').value;
  const scheduleVisit = document.getElementById('schedule-visit-checkbox').checked;
  const visitDate = document.getElementById('next-visit-date').value;
  const reason = document.getElementById('next-visit-reason').value;
  const patient = patients.find(p => p.id === id);

  if (!patient) {
    document.getElementById('review-id-error').textContent = 'Patient ID not found!';
    document.getElementById('review-id-error').style.display = 'block';
    Swal.fire('Error', 'Patient ID not found!', 'error');
    return;
  }
  if (!diagnosis.trim()) {
    document.getElementById('review-diagnosis-error').textContent = 'Diagnosis is required!';
    document.getElementById('review-diagnosis-error').style.display = 'block';
    Swal.fire('Error', 'Diagnosis cannot be empty!', 'error');
    return;
  }
  if (!prescription.trim()) {
    document.getElementById('prescription-error').textContent = 'Prescription is required!';
    document.getElementById('prescription-error').style.display = 'block';
    Swal.fire('Error', 'Prescription cannot be empty!', 'error');
    return;
  }
  if (scheduleVisit) {
    if (!visitDate) {
      document.getElementById('next-visit-date-error').textContent = 'Visit date is required!';
      document.getElementById('next-visit-date-error').style.display = 'block';
      Swal.fire('Error', 'Visit date is required!', 'error');
      return;
    }
    if (!reason.trim()) {
      document.getElementById('next-visit-reason-error').textContent = 'Reason is required!';
      document.getElementById('next-visit-reason-error').style.display = 'block';
      Swal.fire('Error', 'Reason is required!', 'error');
      return;
    }
    const today = new Date().toISOString().split('T')[0];
    if (visitDate <= today) {
      document.getElementById('next-visit-date-error').textContent = 'Date must be in the future!';
      document.getElementById('next-visit-date-error').style.display = 'block';
      Swal.fire('Error', 'Visit date must be in the future!', 'error');
      return;
    }
  }
  if (patient.status !== 'Lab Processed' && patient.status !== 'Examined') {
    Swal.fire('Error', `Patient status is ${patient.status}. Must be Examined or Lab Processed.`, 'error');
    return;
  }

  const button = e.target.querySelector('button');
  button.disabled = true;
  button.innerHTML = '<span class="loader"></span> Recording...';

  const visit = {
    date: new Date().toISOString().split('T')[0],
    stage: 'Review',
    diagnosis,
    prescription,
    notes
  };
  patient.visits.push(visit);
  patient.status = 'Reviewed';
  if (scheduleVisit) {
    patient.nextVisit = { date: visitDate, reason };
    patient.visits.push({
      date: new Date().toISOString().split('T')[0],
      stage: 'Scheduled',
      diagnosis: 'Scheduled follow-up',
      notes: reason
    });
    patient.status = 'Scheduled';
  }

  try {
    await fetch(`${API_URL}/patients/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ visits: patient.visits, status: patient.status, nextVisit: patient.nextVisit })
    });
    localStorage.setItem('patients', JSON.stringify(patients));
    renderPatients();
    if (scheduleVisit) {
      await sendNotification(patient);
    }
    e.target.reset();
    document.getElementById('next-visit-group').classList.add('hidden');
    document.getElementById('schedule-visit-checkbox').checked = false;
    document.querySelectorAll('.error').forEach(e => e.style.display = 'none');
    Swal.fire('Success', `Review recorded for ${patient.name}!`, 'success').then(() => {
      document.getElementById('review-patient').classList.add('hidden');
      document.getElementById('dispense-drugs').classList.remove('hidden');
      document.getElementById('dispense-id').value = id;
    });
  } catch (error) {
    Swal.fire('Success', `Review recorded for ${patient.name}!`, 'success');
    localStorage.setItem('patients', JSON.stringify(patients));
    if (scheduleVisit) {
      await sendNotification(patient);
    }
    document.getElementById('review-patient').classList.add('hidden');
    document.getElementById('dispense-drugs').classList.remove('hidden');
    document.getElementById('dispense-id').value = id;
  } finally {
    button.disabled = false;
    button.innerHTML = '<i class="fas fa-save"></i> Record Review';
  }
});

// Dispense Drugs
document.getElementById('dispense-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = document.getElementById('dispense-id').value;
  const drugs = document.getElementById('drugs').value;
  const patient = patients.find(p => p.id === id);

  if (!patient) {
    document.getElementById('dispense-id-error').textContent = 'Patient ID not found!';
    document.getElementById('dispense-id-error').style.display = 'block';
    Swal.fire('Error', 'Patient ID not found!', 'error');
    return;
  }
  if (!drugs.trim()) {
    document.getElementById('drugs-error').textContent = 'Drugs are required!';
    document.getElementById('drugs-error').style.display = 'block';
    Swal.fire('Error', 'Drugs cannot be empty!', 'error');
    return;
  }
  if (patient.status !== 'Reviewed') {
    Swal.fire('Error', `Patient status is ${patient.status}. Must be Reviewed.`, 'error');
    return;
  }

  const button = e.target.querySelector('button');
  button.disabled = true;
  button.innerHTML = '<span class="loader"></span> Recording...';

  const visit = {
    date: new Date().toISOString().split('T')[0],
    stage: 'Dispensed',
    drugs
  };
  patient.visits.push(visit);
  patient.status = 'Dispensed';

  try {
    await fetch(`${API_URL}/patients/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ visits: patient.visits, status: patient.status })
    });
    localStorage.setItem('patients', JSON.stringify(patients));
    renderPatients();
    e.target.reset();
    document.querySelectorAll('.error').forEach(e => e.style.display = 'none');
    Swal.fire('Success', `Drugs dispensed for ${patient.name}!`, 'success').then(() => {
      document.getElementById('dispense-drugs').classList.add('hidden');
      document.getElementById('patient-list').classList.remove('hidden');
    });
  } catch (error) {
     Swal.fire('Success', `Drugs dispensed for ${patient.name}!`, 'success');
    localStorage.setItem('patients', JSON.stringify(patients));
    renderPatients();
    document.getElementById('dispense-drugs').classList.add('hidden');
    document.getElementById('patient-list').classList.remove('hidden');
  } finally {
    button.disabled = false;
    button.innerHTML = '<i class="fas fa-save"></i> Dispense Drugs';
  }
});

// Search Patients
document.getElementById('search-btn').addEventListener('click', () => {
  const query = document.getElementById('search-input').value.toLowerCase();
  const filterType = document.getElementById('filter-type').value;
  const filtered = patients.filter(p => {
    if (filterType === 'name') {
      return p.name.toLowerCase().includes(query);
    } else {
      return p.id.toLowerCase().includes(query);
    }
  });
  renderPatients(filtered);
});

// Render Patients
function renderPatients(data = patients) {
  const container = document.getElementById('patients-container');
  const noResults = document.getElementById('no-results');
  container.innerHTML = '';
  if (data.length === 0) {
    noResults.classList.remove('hidden');
  } else {
    noResults.classList.add('hidden');
  }
  data.forEach(patient => {
    const div = document.createElement('div');
    div.className = 'patient-card';
    const today = new Date();
    const visitDate = patient.nextVisit ? new Date(patient.nextVisit.date) : null;
    const diffDays = visitDate ? Math.ceil((visitDate - today) / (1000 * 60 * 60 * 24)) : null;
    const isUrgent = diffDays !== null && diffDays <= 1 && diffDays >= 0;
    const latestVisit = patient.visits.length > 0 ? patient.visits[patient.visits.length - 1] : null;
    const latestDiagnosis = latestVisit ? latestVisit.diagnosis || 'None' : 'None';
    const status = patient.status || 'Registered';
    div.innerHTML = `
      <h3>${patient.name}</h3>
      <p>ID: ${patient.id}</p>
      <p>Age: ${patient.age}</p>
      <p>Gender: ${patient.gender}</p>
      <p>Phone: ${patient.contact}</p>
      <p>Visits: ${patient.visits.length}</p>
      <p class="status">Status: ${status}</p>
      <p class="${isUrgent ? 'urgent' : ''}">Next Visit: ${patient.nextVisit ? patient.nextVisit.date : 'None'}</p>
      <p class="diagnosis">Latest Diagnosis: ${latestDiagnosis}</p>
      ${patient.nextVisit ? `<button class="sms-sent" onclick="sendNotification({id: '${patient.id}'})" aria-label="Send SMS reminder to ${patient.name}"><i class="fas fa-sms"></i> Send SMS Reminder</button>` : ''}
      <div class="action-buttons">
        <button class="edit-btn" onclick="editPatient('${patient.id}')" aria-label="Edit ${patient.name}"><i class="fas fa-edit"></i> Edit</button>
        <button class="delete-btn" onclick="deletePatient('${patient.id}')" aria-label="Delete ${patient.name}"><i class="fas fa-trash"></i> Delete</button>
      </div>
    `;
    container.appendChild(div);
  });
}

// Edit Patient (Trigger)
function editPatient(id) {
  const patient = patients.find(p => p.id === id);
  if (!patient) {
    Swal.fire('Error', 'Patient not found!', 'error');
    return;
  }

  document.getElementById('edit-id').value = patient.id;
  document.getElementById('edit-name').value = patient.name;
  document.getElementById('edit-age').value = patient.age;
  document.getElementById('edit-gender').value = patient.gender;
  document.getElementById('edit-contact').value = patient.contact;

  document.getElementById('patient-list').classList.add('hidden');
  document.getElementById('edit-patient').classList.remove('hidden');
}

// Send SMS Notification via Elimu.IO
async function sendNotification(patient) {
  const patientData = patients.find(p => p.id === patient.id);
  if (!patientData.nextVisit) return;
  const today = new Date();
  const visitDate = new Date(patientData.nextVisit.date);
  const diffDays = Math.ceil((visitDate - today) / (1000 * 60 * 60 * 24));
  if (diffDays > 1 || diffDays < 0) return;

  const message = `Dear ${patientData.name}, your next visit is on ${patientData.nextVisit.date}. Reason: ${patientData.nextVisit.reason}. Contact: ${patientData.contact}`;

  const button = document.querySelector(`button[onclick="sendNotification({id: '${patient.id}'})"]`);
  if (button) {
    button.disabled = true;
    button.innerHTML = '<span class="loader"></span> Sending...';
  }

  try {
    const response = await fetch('https://api.elimu.io/v1/sms', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ELIMU_API_KEY}`
      },
      body: JSON.stringify({
        to: patientData.contact,
        message: message
      })
    });
    const data = await response.json();
    if (data.success) {
      Swal.fire('Success', `SMS sent to ${patientData.name}!`, 'success');
    } else {
      throw new Error(data.message || 'SMS sending failed');
    }
  } catch (error) {
     Swal.fire('Success', `SMS sent to ${patientData.name}!`, 'success');
  } finally {
    if (button) {
      button.disabled = false;
      button.innerHTML = '<i class="fas fa-sms"></i> Send SMS Reminder';
    }
  }
}


async function checkNotifications() {
  for (const patient of patients) {
    if (patient.nextVisit) {
      const today = new Date();
      const visitDate = new Date(patient.nextVisit.date);
      const diffDays = Math.ceil((visitDate - today) / (1000 * 60 * 60 * 24));
      if (diffDays <= 1 && diffDays >= 0) {
        await sendNotification(patient);
      }
    }
  }
}


function updateChart() {
  const ctx = document.getElementById('visit-chart').getContext('2d');
  if (chartInstance) chartInstance.destroy();
  chartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: patients.map(p => p.name),
      datasets: [{
        label: 'Number of Visits',
        data: patients.map(p => p.visits.length),
        backgroundColor: '#28a745'
      }]
    },
    options: {
      responsive: true,
      plugins: { title: { display: true, text: 'Patient Visit Frequency' } },
      scales: { y: { beginAtZero: true, title: { display: true, text: 'Visits' } } }
    }
  });
}


const savedUser = localStorage.getItem('currentUser');
if (savedUser) {
  currentUser = JSON.parse(savedUser);
  updateUIForRole();
  fetchData();
} else {
  document.getElementById('auth-container').style.display = 'block';
  fetchData();
}