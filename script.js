// Data Management
let teachers = JSON.parse(localStorage.getItem('teachers')) || {};
let groups = JSON.parse(localStorage.getItem('groups')) || [];

function saveTeachers() {
    localStorage.setItem('teachers', JSON.stringify(teachers));
}

function saveGroups() {
    localStorage.setItem('groups', JSON.stringify(groups));
}

// UI Management
function showTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.getElementById(tabId).classList.add('active');

    if (tabId === 'viewTeacher') {
        viewTeacher();
    } else if (tabId === 'viewCalendar') {
        initializeCalendar();
    }
}

function showMessage(text, type) {
    const messageEl = document.getElementById('message');
    messageEl.textContent = text;
    messageEl.className = type;
    messageEl.style.display = 'block';
    
    messageEl.style.animation = 'slideIn 0.5s forwards';
    
    setTimeout(() => {
        messageEl.style.animation = 'slideOut 0.5s forwards';
        
        setTimeout(() => {
            messageEl.style.display = 'none';
        }, 500);
    }, 4500);
}

// Teacher Management
function addTeacher(event) {
    event.preventDefault();
    const name = document.getElementById('teacherName').value.trim();
    if (name && !(name in teachers)) {
        teachers[name] = { groups: {} };
        saveTeachers();
        showMessage(`Teacher ${name} added successfully.`, 'success');
        document.getElementById('teacherName').value = '';
        updateTeacherSelects();
    } else if (name in teachers) {
        showMessage(`Error: Teacher "${name}" already exists.`, 'error');
    } else {
        showMessage('Error: Please enter a valid teacher name.', 'error');
    }
}

function viewTeacher() {
    const teacherName = document.getElementById('viewTeacherSelect').value;
    const infoDiv = document.getElementById('teacherInfo');
    infoDiv.innerHTML = '';

    if (teacherName && teachers[teacherName]) {
        const teacher = teachers[teacherName];
        let html = `<h3>${teacherName}</h3>`;
        for (const [group, schedules] of Object.entries(teacher.groups)) {
            html += `<h4>Group: ${group}</h4>`;
            for (const [schedule, className] of Object.entries(schedules)) {
                const [day, time] = schedule.split(' ');
                html += `
                    <div class="class-item">
                        <p>${day} ${time}: ${className}</p>
                        <div class="edit-buttons">
                            <button onclick="showEditForm('${teacherName}', '${group}', '${schedule}', '${className}')">Edit</button>
                            <button onclick="deleteClass('${teacherName}', '${group}', '${schedule}')">Delete</button>
                        </div>
                        <div id="editForm-${teacherName}-${group}-${schedule.replace(' ', '_')}" class="edit-form">
                            <select id="editDay-${teacherName}-${group}-${schedule.replace(' ', '_')}">
                                <option value="Monday" ${day === 'Monday' ? 'selected' : ''}>Monday</option>
                                <option value="Tuesday" ${day === 'Tuesday' ? 'selected' : ''}>Tuesday</option>
                                <option value="Wednesday" ${day === 'Wednesday' ? 'selected' : ''}>Wednesday</option>
                                <option value="Thursday" ${day === 'Thursday' ? 'selected' : ''}>Thursday</option>
                                <option value="Friday" ${day === 'Friday' ? 'selected' : ''}>Friday</option>
                                <option value="Saturday" ${day === 'Saturday' ? 'selected' : ''}>Saturday</option>
                                <option value="Sunday" ${day === 'Sunday' ? 'selected' : ''}>Sunday</option>
                            </select>
                            <input type="time" id="editTime-${teacherName}-${group}-${schedule.replace(' ', '_')}" value="${time}">
                            <input type="text" id="editClass-${teacherName}-${group}-${schedule.replace(' ', '_')}" value="${className}">
                            <button onclick="editClass('${teacherName}', '${group}', '${schedule}')">Save</button>
                        </div>
                    </div>`;
            }
        }
        infoDiv.innerHTML = html;
    } else if (teacherName) {
        infoDiv.innerHTML = '<p>No information available for this teacher.</p>';
    } else {
        infoDiv.innerHTML = '<p>Please select a teacher to view their information.</p>';
    }
}

function showEditForm(teacher, group, schedule, className) {
    const formId = `editForm-${teacher}-${group}-${schedule.replace(' ', '_')}`;
    document.getElementById(formId).style.display = 'block';
}

function editTeacher(name) {
    const newName = prompt(`Enter new name for ${name}:`, name);
    if (newName && newName.trim() !== '' && newName !== name) {
        if (teachers[newName]) {
            showMessage(`Error: A teacher named "${newName}" already exists.`, 'error');
        } else {
            teachers[newName] = teachers[name];
            delete teachers[name];
            saveTeachers();
            showMessage(`Teacher ${name} renamed to ${newName}.`, 'success');
            updateTeacherSelects();
        }
    } else if (newName === name) {
        showMessage('No changes made. New name is the same as the current name.', 'info');
    } else if (newName === null) {
        showMessage('Teacher rename cancelled.', 'info');
    } else {
        showMessage('Error: Please enter a valid name.', 'error');
    }
}

function deleteTeacher(name) {
    if (confirm(`Are you sure you want to delete teacher ${name}? This will also delete all their assigned classes.`)) {
        delete teachers[name];
        saveTeachers();
        showMessage(`Teacher ${name} and all their assigned classes have been deleted.`, 'success');
        updateTeacherSelects();
    }
}

function updateTeacherSelects() {
    const selects = ['teacherSelect', 'viewTeacherSelect'];
    selects.forEach(selectId => {
        const select = document.getElementById(selectId);
        select.innerHTML = '<option value="">Select a teacher</option>';

        const sortedTeachers = Object.keys(teachers).sort((a, b) => a.localeCompare(b));
        
        sortedTeachers.forEach(teacher => {
            select.innerHTML += `<option value="${teacher}">${teacher}</option>`;
        });

    });

    const teacherList = document.getElementById('teacherList');
    const tbody = teacherList.getElementsByTagName('tbody')[0];
    tbody.innerHTML = '';

    if (Object.keys(teachers).length === 0) {
        teacherList.style.display = 'none';
        const noTeachersMessage = document.createElement('p');
        noTeachersMessage.textContent = 'No teachers available.';
        teacherList.parentNode.insertBefore(noTeachersMessage, teacherList);
    } else {
        teacherList.style.display = 'table';
        const noTeachersMessage = teacherList.previousElementSibling;
        if (noTeachersMessage && noTeachersMessage.tagName === 'P') {
            noTeachersMessage.remove();
        }
        for (const name in teachers) {
            const row = tbody.insertRow();
            row.innerHTML = `
                <td>${name}</td>
                <td>
                    <button onclick="editTeacher('${name}')">Edit</button>
                    <button onclick="deleteTeacher('${name}')">Delete</button>
                </td>
            `;
        }
    }
}

// Group Management
function addGroup(event) {
    event.preventDefault();
    const name = document.getElementById('groupName').value.trim();
    if (name && !groups.includes(name)) {
        groups.push(name);
        saveGroups();
        showMessage(`Group ${name} added successfully.`, 'success');
        document.getElementById('groupName').value = '';
        updateGroupSelects();
    } else if (groups.includes(name)) {
        showMessage(`Error: Group "${name}" already exists.`, 'error');
    } else {
        showMessage('Error: Please enter a valid group name.', 'error');
    }
}

function editGroup(name) {
    const newName = prompt(`Enter new name for group ${name}:`, name);
    if (newName && newName.trim() !== '' && newName !== name) {
        if (groups.includes(newName)) {
            showMessage(`Error: A group named "${newName}" already exists.`, 'error');
        } else {
            const index = groups.indexOf(name);
            groups[index] = newName;
            
            for (const teacher in teachers) {
                if (teachers[teacher].groups[name]) {
                    teachers[teacher].groups[newName] = teachers[teacher].groups[name];
                    delete teachers[teacher].groups[name];
                }
            }
            
            saveGroups();
            saveTeachers();
            showMessage(`Group ${name} renamed to ${newName}.`, 'success');
            updateGroupSelects();
        }
    } else if (newName === name) {
        showMessage('No changes made. New name is the same as the current name.', 'info');
    } else if (newName === null) {
        showMessage('Group rename cancelled.', 'info');
    } else {
        showMessage('Error: Please enter a valid group name.', 'error');
    }
}

function deleteGroup(name) {
    if (confirm(`Are you sure you want to delete group ${name}? This will also delete all classes assigned to this group.`)) {
        const index = groups.indexOf(name);
        if (index > -1) {
            groups.splice(index, 1);
            
            for (const teacher in teachers) {
                if (teachers[teacher].groups[name]) {
                    delete teachers[teacher].groups[name];
                }
            }
            
            saveGroups();
            saveTeachers();
            showMessage(`Group ${name} and all its assigned classes have been deleted.`, 'success');
            updateGroupSelects();
        }
    }
}

function updateGroupSelects() {
    const selects = ['groupSelect'];
    selects.forEach(selectId => {
        const select = document.getElementById(selectId);
        select.innerHTML = '<option value="">Select a group</option>';

        const sortedGroups = groups.slice().sort((a, b) => a.localeCompare(b));
        
        sortedGroups.forEach(group => {
            select.innerHTML += `<option value="${group}">${group}</option>`;
        });
    });

    const groupList = document.getElementById('groupList');
    const tbody = groupList.getElementsByTagName('tbody')[0];
    tbody.innerHTML = '';

    if (groups.length === 0) {
        groupList.style.display = 'none';
        const noGroupsMessage = document.createElement('p');
        noGroupsMessage.textContent = 'No groups available.';
        groupList.parentNode.insertBefore(noGroupsMessage, groupList);
    } else {
        groupList.style.display = 'table';
        const noGroupsMessage = groupList.previousElementSibling;
        if (noGroupsMessage && noGroupsMessage.tagName === 'P') {
            noGroupsMessage.remove();
        }
        for (const group of groups) {
            const row = tbody.insertRow();
            row.innerHTML = `
                <td>${group}</td>
                <td>
                    <button onclick="editGroup('${group}')">Edit</button>
                    <button onclick="deleteGroup('${group}')">Delete</button>
                </td>
            `;
        }
    }
}

// Class Management
function assignTeacher(event) {
    event.preventDefault();
    const teacher = document.getElementById('teacherSelect').value;
    const group = document.getElementById('groupSelect').value;
    const className = document.getElementById('className').value.trim();
    const day = document.getElementById('daySelect').value;
    const time = document.getElementById('schedule').value;
    const schedule = `${day} ${time}`;

    if (teacher && group && className && day && time) {
        const conflict = checkConflict(teacher, group, schedule);
        if (conflict) {
            if (conflict.type === 'teacher') {
                showMessage(`Error: ${teacher} already has a class with ${conflict.group} at ${schedule}.`, 'error');
            } else if (conflict.type === 'group') {
                showMessage(`Error: ${group} already has a class with ${conflict.teacher} at ${schedule}.`, 'error');
            }
            return;
        }

        if (!teachers[teacher].groups[group]) {
            teachers[teacher].groups[group] = {};
        }
        teachers[teacher].groups[group][schedule] = className;
        saveTeachers();
        showMessage(`Class "${className}" assigned to ${teacher} for group ${group} on ${schedule}.`, 'success');
        document.getElementById('className').value = '';
        document.getElementById('schedule').value = '';
        document.getElementById('daySelect').value = '';

        if (document.getElementById('viewTeacher').classList.contains('active')) {
            viewTeacher();
        }
    } else {
        showMessage('Error: Please fill in all fields.', 'error');
    }
}

function checkConflict(teacher, group, schedule, excludeGroup, excludeSchedule) {
    for (const [t, info] of Object.entries(teachers)) {
        for (const [g, classes] of Object.entries(info.groups)) {
            for (const s in classes) {
                if (t === teacher && s === schedule) {
                    if (!(t === teacher && g === excludeGroup && s === excludeSchedule)) {
                        return { type: 'teacher', group: g };
                    }
                }
                if (g === group && s === schedule) {
                    if (!(t === teacher && g === excludeGroup && s === excludeSchedule)) {
                        return { type: 'group', teacher: t };
                    }
                }
            }
        }
    }
    return false;
}

function editClass(teacher, group, oldSchedule) {
    const [oldDay, oldTime] = oldSchedule.split(' ');
    const newDay = document.getElementById(`editDay-${teacher}-${group}-${oldSchedule.replace(' ', '_')}`).value;
    const newTime = document.getElementById(`editTime-${teacher}-${group}-${oldSchedule.replace(' ', '_')}`).value;
    const newSchedule = `${newDay} ${newTime}`;
    const newClassName = document.getElementById(`editClass-${teacher}-${group}-${oldSchedule.replace(' ', '_')}`).value;

    const conflict = checkConflict(teacher, group, newSchedule, group, oldSchedule);
    if (conflict) {
        if (conflict.type === 'teacher') {
            showMessage(`Error: ${teacher} already has a class with ${conflict.group} at ${newSchedule}.`, 'error');
        } else if (conflict.type === 'group') {
            showMessage(`Error: ${group} already has a class with ${conflict.teacher} at ${newSchedule}.`, 'error');
        }
        return;
    }

    delete teachers[teacher].groups[group][oldSchedule];
    teachers[teacher].groups[group][newSchedule] = newClassName;
    saveTeachers();
    showMessage(`Class updated successfully to "${newClassName}" on ${newSchedule}.`, 'success');
    viewTeacher();
}

function deleteClass(teacher, group, schedule) {
    if (confirm(`Are you sure you want to delete the class for ${teacher} with ${group} on ${schedule}?`)) {
        delete teachers[teacher].groups[group][schedule];
        if (Object.keys(teachers[teacher].groups[group]).length === 0) {
            delete teachers[teacher].groups[group];
        }
        saveTeachers();
        showMessage(`Class for ${teacher} with ${group} on ${schedule} deleted successfully.`, 'success');
        viewTeacher();
    }
}

// Calendar Functionality
function initializeCalendar() {
    updateCalendarGroupSelect();
    fillCalendar();
}

function updateCalendarGroupSelect() {
    const select = document.getElementById('grupo-select');
    select.innerHTML = '<option value="todos">All groups</option>';
    
    const sortedGroups = groups.slice().sort((a, b) => a.localeCompare(b));
    
    sortedGroups.forEach(group => {
        const option = document.createElement('option');
        option.value = group;
        option.textContent = group;
        select.appendChild(option);
    });
    select.addEventListener('change', fillCalendar);
}

function fillCalendar(event) {
    const selectedGroup = event ? event.target.value : 'todos';
    const tbody = document.querySelector('#calendar tbody');
    tbody.innerHTML = '';
    const hours = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00'];
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    hours.forEach(hour => {
        const row = document.createElement('tr');
        const timeCell = document.createElement('td');
        timeCell.textContent = hour;
        row.appendChild(timeCell);

        days.forEach(day => {
            const cell = document.createElement('td');
            const classesInThisSlot = getClassesForSlot(day, hour, selectedGroup);
            
            classesInThisSlot.forEach(classInfo => {
                const classDiv = document.createElement('div');
                classDiv.className = 'class-info';
                classDiv.innerHTML = `
                    <div class="subject">${classInfo.subject}</div>
                    <div class="time">${classInfo.time}</div>
                    <div class="group">Group: ${classInfo.group}</div>
                    <div class="teacher">Teacher: ${classInfo.teacher}</div>
                `;
                cell.appendChild(classDiv);
            });

            row.appendChild(cell);
        });

        tbody.appendChild(row);
    });
}

function getClassesForSlot(day, hour, selectedGroup) {
    let classes = [];
    const hourStart = new Date(`1970-01-01T${hour}`);
    const hourEnd = new Date(hourStart.getTime() + 60 * 60 * 1000);

    for (const [teacherName, teacherInfo] of Object.entries(teachers)) {
        for (const [group, schedule] of Object.entries(teacherInfo.groups)) {
            if (selectedGroup === 'todos' || selectedGroup === group) {
                for (const [slot, subject] of Object.entries(schedule)) {
                    const [slotDay, slotTime] = slot.split(' ');
                    if (slotDay === day) {
                        const classTime = new Date(`1970-01-01T${slotTime}`);
                        if (classTime >= hourStart && classTime < hourEnd) {
                            classes.push({
                                subject: subject,
                                time: slotTime,
                                group: group,
                                teacher: teacherName
                            });
                        }
                    }
                }
            }
        }
    }
    return classes;
}

// Initialization
function initializeTabs() {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
}

// Event Listeners and Initial Setup
document.addEventListener('DOMContentLoaded', () => {
    updateTeacherSelects();
    updateGroupSelects();
    initializeTabs();
    document.getElementById('grupo-select').addEventListener('change', fillCalendar);
    
    // Add event listeners for form submissions
    document.getElementById('addTeacherForm').addEventListener('submit', addTeacher);
    document.getElementById('addGroupForm').addEventListener('submit', addGroup);
    document.getElementById('assignTeacherForm').addEventListener('submit', assignTeacher);
    
    // Add event listeners for tab buttons
    document.querySelectorAll('.tab-buttons button').forEach(button => {
        button.addEventListener('click', () => showTab(button.dataset.tab));
    });
});