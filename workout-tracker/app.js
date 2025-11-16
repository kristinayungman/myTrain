// Telegram Web App
let tg = window.Telegram?.WebApp;

// Инициализация Telegram Web App
if (tg) {
    tg.ready();
    tg.expand();
    
    // Настройка цветовой схемы для Telegram
    tg.setHeaderColor('#E8DCC6');
    tg.setBackgroundColor('#5C4033');
    
    // Включение закрытия по свайпу вниз
    tg.enableClosingConfirmation();
    
    // Настройка основной кнопки (опционально)
    // tg.MainButton.setText('Сохранить');
    // tg.MainButton.onClick(() => { /* действие */ });
}

// Хранилище данных
let programs = JSON.parse(localStorage.getItem('workoutPrograms')) || [];
let workouts = JSON.parse(localStorage.getItem('workouts')) || [];
let users = JSON.parse(localStorage.getItem('workoutUsers')) || [];
let currentUserId = localStorage.getItem('currentUserId') || null;

// Текущая дата для календаря
let currentDate = new Date();
let currentYear = currentDate.getFullYear();
let currentMonth = currentDate.getMonth();

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
    initUsers();
    initNavigation();
    initCalendar();
    initPrograms();
    initWorkoutForm();
    initModal();
    updateUserDisplay();
    
    // Если запущено в Telegram, создаем пользователя автоматически
    if (tg && tg.initDataUnsafe?.user) {
        initTelegramUser();
    }
});

// Система пользователей
function initUsers() {
    document.getElementById('user-profile-btn').addEventListener('click', () => {
        openUserModal();
    });

    document.getElementById('add-user-btn').addEventListener('click', () => {
        closeUserModal();
        openAddUserModal();
    });

    document.getElementById('add-user-form').addEventListener('submit', (e) => {
        e.preventDefault();
        addUser();
    });

    document.querySelector('.close-user-modal').addEventListener('click', closeUserModal);
    document.querySelector('.close-add-user-modal').addEventListener('click', closeAddUserModal);
    document.getElementById('cancel-add-user').addEventListener('click', closeAddUserModal);

    document.getElementById('user-modal').addEventListener('click', (e) => {
        if (e.target.id === 'user-modal') closeUserModal();
    });

    document.getElementById('add-user-modal').addEventListener('click', (e) => {
        if (e.target.id === 'add-user-modal') closeAddUserModal();
    });

    // Если нет пользователей, открываем модальное окно создания
    if (users.length === 0) {
        setTimeout(() => openAddUserModal(), 500);
    }
}

function updateUserDisplay() {
    const userNameElement = document.getElementById('current-user-name');
    if (currentUserId) {
        const user = users.find(u => u.id === currentUserId);
        if (user) {
            userNameElement.textContent = user.name;
        } else {
            userNameElement.textContent = 'Выберите пользователя';
            currentUserId = null;
        }
    } else {
        userNameElement.textContent = 'Выберите пользователя';
    }
}

function openUserModal() {
    renderUsersList();
    document.getElementById('user-modal').classList.add('active');
}

function closeUserModal() {
    document.getElementById('user-modal').classList.remove('active');
}

function openAddUserModal() {
    document.getElementById('add-user-modal').classList.add('active');
    document.getElementById('new-user-name').value = '';
    document.getElementById('new-user-name').focus();
}

function closeAddUserModal() {
    document.getElementById('add-user-modal').classList.remove('active');
}

function renderUsersList() {
    const usersList = document.getElementById('users-list');
    usersList.innerHTML = '';

    if (users.length === 0) {
        usersList.innerHTML = '<p class="empty-state">Нет пользователей. Добавьте первого пользователя.</p>';
        return;
    }

    users.forEach(user => {
        const userItem = document.createElement('div');
        userItem.className = 'user-item';
        if (user.id === currentUserId) {
            userItem.classList.add('active');
        }

        userItem.innerHTML = `
            <div class="user-item-name">${user.name}</div>
            <div class="user-item-actions">
                ${user.id !== currentUserId ? `<button class="user-item-btn select" onclick="selectUser('${user.id}')">Выбрать</button>` : ''}
                <button class="user-item-btn delete" onclick="deleteUser('${user.id}')">Удалить</button>
            </div>
        `;
        usersList.appendChild(userItem);
    });
}

// Инициализация пользователя из Telegram
function initTelegramUser() {
    const telegramUser = tg.initDataUnsafe.user;
    const telegramUserId = `tg_${telegramUser.id}`;
    
    // Проверяем, существует ли уже пользователь с этим Telegram ID
    let user = users.find(u => u.telegramId === telegramUserId);
    
    if (!user) {
        // Создаем нового пользователя из данных Telegram
        const userName = telegramUser.first_name + (telegramUser.last_name ? ' ' + telegramUser.last_name : '');
        user = {
            id: Date.now().toString(),
            name: userName,
            telegramId: telegramUserId,
            telegramUsername: telegramUser.username || null,
            createdAt: new Date().toISOString()
        };
        
        users.push(user);
        localStorage.setItem('workoutUsers', JSON.stringify(users));
    }
    
    // Автоматически выбираем пользователя Telegram
    if (!currentUserId || currentUserId !== user.id) {
        selectUser(user.id);
    }
}

function addUser() {
    const userName = document.getElementById('new-user-name').value.trim();
    
    if (!userName) {
        alert('Введите имя пользователя!');
        return;
    }

    if (users.some(u => u.name.toLowerCase() === userName.toLowerCase())) {
        alert('Пользователь с таким именем уже существует!');
        return;
    }

    const newUser = {
        id: Date.now().toString(),
        name: userName,
        createdAt: new Date().toISOString()
    };

    users.push(newUser);
    localStorage.setItem('workoutUsers', JSON.stringify(users));
    
    closeAddUserModal();
    selectUser(newUser.id);
    renderUsersList();
}

function selectUser(userId) {
    currentUserId = userId;
    localStorage.setItem('currentUserId', currentUserId);
    updateUserDisplay();
    closeUserModal();
    renderCalendar();
    renderUsersList();
}

function deleteUser(userId) {
    if (users.length === 1) {
        alert('Нельзя удалить последнего пользователя!');
        return;
    }

    if (!confirm('Вы уверены, что хотите удалить этого пользователя? Все его тренировки будут удалены.')) {
        return;
    }

    // Удаляем тренировки пользователя
    workouts = workouts.filter(w => w.userId !== userId);
    localStorage.setItem('workouts', JSON.stringify(workouts));

    // Удаляем пользователя
    users = users.filter(u => u.id !== userId);
    localStorage.setItem('workoutUsers', JSON.stringify(users));

    // Если удалили текущего пользователя, выбираем первого
    if (currentUserId === userId) {
        if (users.length > 0) {
            selectUser(users[0].id);
        } else {
            currentUserId = null;
            localStorage.removeItem('currentUserId');
            updateUserDisplay();
        }
    }

    renderUsersList();
    renderCalendar();
}

// Навигация по вкладкам
function initNavigation() {
    const navButtons = document.querySelectorAll('.nav-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    navButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTab = btn.getAttribute('data-tab');
            
            navButtons.forEach(b => b.classList.remove('active'));
            tabContents.forEach(t => t.classList.remove('active'));
            
            btn.classList.add('active');
            document.getElementById(`${targetTab}-tab`).classList.add('active');
            
            if (targetTab === 'calendar') {
                renderCalendar();
            } else if (targetTab === 'programs') {
                renderPrograms();
            } else if (targetTab === 'workout') {
                loadProgramsToSelect();
            }
        });
    });
}

// Календарь
function initCalendar() {
    document.getElementById('prev-month').addEventListener('click', () => {
        currentMonth--;
        if (currentMonth < 0) {
            currentMonth = 11;
            currentYear--;
        }
        renderCalendar();
    });

    document.getElementById('next-month').addEventListener('click', () => {
        currentMonth++;
        if (currentMonth > 11) {
            currentMonth = 0;
            currentYear++;
        }
        renderCalendar();
    });

    renderCalendar();
}

function renderCalendar() {
    const monthNames = [
        'ЯНВАРЬ', 'ФЕВРАЛЬ', 'МАРТ', 'АПРЕЛЬ', 'МАЙ', 'ИЮНЬ',
        'ИЮЛЬ', 'АВГУСТ', 'СЕНТЯБРЬ', 'ОКТЯБРЬ', 'НОЯБРЬ', 'ДЕКАБРЬ'
    ];

    document.getElementById('current-month-year').textContent = monthNames[currentMonth];
    document.getElementById('calendar-year').textContent = currentYear;

    const calendarGrid = document.getElementById('calendar-grid');
    calendarGrid.innerHTML = '';

    // Заголовки дней недели
    const weekdays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
    weekdays.forEach(day => {
        const header = document.createElement('div');
        header.className = 'weekday-header';
        header.textContent = day;
        calendarGrid.appendChild(header);
    });

    // Первый день месяца
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = (firstDay.getDay() + 6) % 7; // Понедельник = 0

    // Дни предыдущего месяца
    const prevMonthLastDay = new Date(currentYear, currentMonth, 0).getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
        const day = document.createElement('div');
        day.className = 'calendar-day other-month';
        day.innerHTML = `<div class="day-number">${prevMonthLastDay - i}</div>`;
        calendarGrid.appendChild(day);
    }

    // Дни текущего месяца
    const today = new Date();
    for (let day = 1; day <= daysInMonth; day++) {
        const dayElement = document.createElement('div');
        const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        
        dayElement.className = 'calendar-day';
        
        if (currentYear === today.getFullYear() && 
            currentMonth === today.getMonth() && 
            day === today.getDate()) {
            dayElement.classList.add('today');
        }

        // Проверка наличия тренировок в этот день (только для текущего пользователя)
        const dayWorkouts = currentUserId ? workouts.filter(w => w.date === dateStr && w.userId === currentUserId) : [];
        if (dayWorkouts.length > 0) {
            dayElement.classList.add('has-workout');
            const programNames = dayWorkouts.map(w => {
                const program = programs.find(p => p.id === w.programId);
                return program ? program.name : 'Неизвестная программа';
            }).join(', ');
            dayElement.innerHTML = `
                <div class="day-number">${day}</div>
                <div class="workout-indicator">${dayWorkouts.length} тренировка(и)</div>
            `;
        } else {
            dayElement.innerHTML = `<div class="day-number">${day}</div>`;
        }

        dayElement.addEventListener('click', () => showDayDetails(dateStr));
        calendarGrid.appendChild(dayElement);
    }

    // Дни следующего месяца
    const totalCells = calendarGrid.children.length - 7; // Минус заголовки
    const remainingCells = 42 - totalCells; // 6 недель * 7 дней
    for (let day = 1; day <= remainingCells; day++) {
        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day other-month';
        dayElement.innerHTML = `<div class="day-number">${day}</div>`;
        calendarGrid.appendChild(dayElement);
    }
}

function showDayDetails(dateStr) {
    if (!currentUserId) {
        document.getElementById('day-details').innerHTML = '<p>Выберите пользователя для просмотра тренировок</p>';
        return;
    }

    const dayDetails = document.getElementById('day-details');
    const dayWorkouts = workouts.filter(w => w.date === dateStr && w.userId === currentUserId);

    if (dayWorkouts.length === 0) {
        dayDetails.innerHTML = '<p>В этот день тренировок не было</p>';
        return;
    }

    const date = new Date(dateStr);
    const dateFormatted = date.toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });

    let html = `<h3>Тренировки за ${dateFormatted}</h3>`;

        dayWorkouts.forEach(workout => {
        const program = programs.find(p => p.id === workout.programId);
        html += `
            <div class="workout-item">
                <h4>${program ? program.name : 'Неизвестная программа'}</h4>
                <ul>
        `;

        workout.exercises.forEach(exercise => {
            html += `<li><strong>${exercise.name}</strong>: `;
            exercise.sets.forEach((set, index) => {
                html += `${set.reps} × ${set.weight}кг`;
                if (index < exercise.sets.length - 1) html += ', ';
            });
            html += `</li>`;
        });

        html += `</ul>`;
        
        if (workout.comment && workout.comment.trim()) {
            html += `
                <div class="workout-comment">
                    <strong>💬 Комментарий:</strong>
                    <p>${workout.comment}</p>
                </div>
            `;
        }
        
        html += `</div>`;
    });

    dayDetails.innerHTML = html;
}

// Программы тренировок
function initPrograms() {
    document.getElementById('new-program-btn').addEventListener('click', () => {
        openProgramModal();
    });

    renderPrograms();
}

function renderPrograms() {
    const programsList = document.getElementById('programs-list');

    if (programs.length === 0) {
        programsList.innerHTML = `
            <div class="empty-state">
                <h3>У вас пока нет программ</h3>
                <p>Создайте свою первую программу тренировок!</p>
            </div>
        `;
        return;
    }

    programsList.innerHTML = '';
    programs.forEach(program => {
        const card = document.createElement('div');
        card.className = 'program-card';
        card.innerHTML = `
            <h3>${program.name}</h3>
            <ul class="program-exercises">
                ${program.exercises.map(ex => `<li>${ex.name}</li>`).join('')}
            </ul>
            <div class="program-actions">
                <button class="btn-danger" onclick="deleteProgram('${program.id}')">Удалить</button>
            </div>
        `;
        programsList.appendChild(card);
    });
}

function openProgramModal() {
    document.getElementById('program-modal').classList.add('active');
    document.getElementById('program-form').reset();
    document.getElementById('exercises-form-list').innerHTML = '';
    addExerciseFormItem();
}

function addExerciseFormItem() {
    const exercisesList = document.getElementById('exercises-form-list');
    const exerciseIndex = exercisesList.children.length;
    
    const exerciseItem = document.createElement('div');
    exerciseItem.className = 'exercise-form-item';
    exerciseItem.innerHTML = `
        <h4>Упражнение ${exerciseIndex + 1}</h4>
        <div class="form-group">
            <label>Название упражнения:</label>
            <input type="text" class="exercise-name" required placeholder="Например: Приседания">
        </div>
        <button type="button" class="btn-danger remove-exercise-btn">Удалить упражнение</button>
    `;

    exerciseItem.querySelector('.remove-exercise-btn').addEventListener('click', () => {
        exerciseItem.remove();
    });

    exercisesList.appendChild(exerciseItem);
}

function initModal() {
    document.getElementById('add-exercise-btn').addEventListener('click', addExerciseFormItem);

    document.getElementById('program-form').addEventListener('submit', (e) => {
        e.preventDefault();
        saveProgram();
    });

    document.querySelector('.close').addEventListener('click', closeModal);
    document.getElementById('cancel-program').addEventListener('click', closeModal);

    document.getElementById('program-modal').addEventListener('click', (e) => {
        if (e.target.id === 'program-modal') {
            closeModal();
        }
    });
}

function closeModal() {
    document.getElementById('program-modal').classList.remove('active');
}

function saveProgram() {
    const programName = document.getElementById('program-name').value;
    const exerciseItems = document.querySelectorAll('.exercise-form-item');

    if (exerciseItems.length === 0) {
        alert('Добавьте хотя бы одно упражнение!');
        return;
    }

    const exercises = Array.from(exerciseItems).map(item => ({
        name: item.querySelector('.exercise-name').value
    }));

    const program = {
        id: Date.now().toString(),
        name: programName,
        exercises: exercises,
        createdAt: new Date().toISOString()
    };

    programs.push(program);
    localStorage.setItem('workoutPrograms', JSON.stringify(programs));
    
    renderPrograms();
    closeModal();
    alert('Программа успешно сохранена!');
}

function deleteProgram(programId) {
    if (confirm('Вы уверены, что хотите удалить эту программу?')) {
        programs = programs.filter(p => p.id !== programId);
        localStorage.setItem('workoutPrograms', JSON.stringify(programs));
        renderPrograms();
    }
}

// Форма записи тренировки
function initWorkoutForm() {
    const programSelect = document.getElementById('program-select');
    const workoutDate = document.getElementById('workout-date');
    
    programSelect.addEventListener('change', (e) => {
        if (e.target.value) {
            loadWorkoutForm(e.target.value);
        } else {
            document.getElementById('exercises-container').innerHTML = '';
        }
    });

    workoutDate.addEventListener('change', () => {
        // Перезагружаем форму при изменении даты, чтобы показать правильную предыдущую тренировку
        if (programSelect.value) {
            loadWorkoutForm(programSelect.value);
        }
    });

    workoutDate.valueAsDate = new Date();

    document.getElementById('save-workout-btn').addEventListener('click', saveWorkout);
}

function loadProgramsToSelect() {
    const select = document.getElementById('program-select');
    select.innerHTML = '<option value="">-- Выберите программу --</option>';
    
    programs.forEach(program => {
        const option = document.createElement('option');
        option.value = program.id;
        option.textContent = program.name;
        select.appendChild(option);
    });
}

function loadWorkoutForm(programId) {
    if (!currentUserId) {
        alert('Сначала выберите пользователя!');
        document.getElementById('program-select').value = '';
        return;
    }

    const program = programs.find(p => p.id === programId);
    if (!program) return;

    const exercisesContainer = document.getElementById('exercises-container');
    exercisesContainer.innerHTML = '';

    const workoutDate = document.getElementById('workout-date').value;
    
    program.exercises.forEach(exercise => {
        const exerciseCard = document.createElement('div');
        exerciseCard.className = 'exercise-card';
        
        // Получаем предыдущую тренировку
        const previousWorkout = getPreviousWorkout(programId, exercise.name, workoutDate);
        
        let previousInfoHtml = '';
        if (previousWorkout) {
            const previousExercise = previousWorkout.exercises.find(e => e.name === exercise.name);
            if (previousExercise && previousExercise.sets.length > 0) {
                const setsInfo = previousExercise.sets.map(set => 
                    `${set.reps} × ${set.weight}кг`
                ).join(', ');
                previousInfoHtml = `
                    <div class="previous-workout-info">
                        <strong>Предыдущая тренировка:</strong> ${setsInfo}
                    </div>
                `;
            }
        }

        exerciseCard.innerHTML = `
            <h3>${exercise.name}</h3>
            ${previousInfoHtml}
            <div class="sets-container">
                <div class="set-item">
                    <label>Подход</label>
                    <label>Повторения</label>
                    <label>Вес (кг)</label>
                    <div></div>
                </div>
                <div class="sets-list" data-exercise="${exercise.name}"></div>
                <button type="button" class="add-set-btn" onclick="addSet('${exercise.name}')">+ Добавить подход</button>
            </div>
        `;

        exercisesContainer.appendChild(exerciseCard);
        addSet(exercise.name);
    });
}

function getPreviousWorkout(programId, exerciseName, currentDate) {
    if (!currentUserId) return null;
    
    // Находим последнюю тренировку с этой программой и упражнением до текущей даты (только для текущего пользователя)
    const currentDateObj = new Date(currentDate);
    
    const previousWorkouts = workouts
        .filter(w => {
            const workoutDate = new Date(w.date);
            return w.userId === currentUserId &&
                   w.programId === programId && 
                   workoutDate < currentDateObj &&
                   w.exercises.some(e => e.name === exerciseName);
        })
        .sort((a, b) => new Date(b.date) - new Date(a.date));
    
    return previousWorkouts.length > 0 ? previousWorkouts[0] : null;
}

function addSet(exerciseName) {
    const setsList = document.querySelector(`.sets-list[data-exercise="${exerciseName}"]`);
    if (!setsList) return;

    const setIndex = setsList.children.length;
    const setItem = document.createElement('div');
    setItem.className = 'set-item';
    setItem.innerHTML = `
        <label>Подход ${setIndex + 1}</label>
        <input type="number" class="set-reps" min="1" placeholder="Повторения" required>
        <input type="number" class="set-weight" min="0" step="0.5" placeholder="Вес (кг)" required>
        <button type="button" class="remove-set-btn" onclick="this.parentElement.remove()">×</button>
    `;
    setsList.appendChild(setItem);
}

function saveWorkout() {
    try {
        if (!currentUserId) {
            alert('Сначала выберите пользователя!');
            return;
        }

        const programId = document.getElementById('program-select').value;
        const workoutDate = document.getElementById('workout-date').value;

        if (!programId || !workoutDate) {
            alert('Заполните все обязательные поля!');
            return;
        }

        const program = programs.find(p => p.id === programId);
        if (!program) {
            alert('Программа не найдена!');
            return;
        }

        const exercises = [];
        const exerciseCards = document.querySelectorAll('.exercise-card');

        if (exerciseCards.length === 0) {
            alert('Сначала выберите программу!');
            return;
        }

        let hasError = false;
        let errorMessage = '';

        for (const card of exerciseCards) {
            const exerciseName = card.querySelector('h3').textContent;
            const setsList = card.querySelector('.sets-list');
            if (!setsList) {
                hasError = true;
                errorMessage = `Ошибка: не найдена форма для упражнения "${exerciseName}"`;
                break;
            }

            const setItems = setsList.querySelectorAll('.set-item');

            if (setItems.length === 0) {
                hasError = true;
                errorMessage = `Добавьте хотя бы один подход для упражнения "${exerciseName}"!`;
                break;
            }

            const sets = [];
            for (const item of setItems) {
                const repsInput = item.querySelector('.set-reps');
                const weightInput = item.querySelector('.set-weight');
                
                if (!repsInput || !weightInput) {
                    hasError = true;
                    errorMessage = `Ошибка в форме для упражнения "${exerciseName}"`;
                    break;
                }

                const reps = parseInt(repsInput.value);
                const weight = parseFloat(weightInput.value);
                
                if (isNaN(reps) || reps <= 0) {
                    hasError = true;
                    errorMessage = `Введите корректное количество повторений для упражнения "${exerciseName}"!`;
                    break;
                }
                
                if (isNaN(weight) || weight < 0) {
                    hasError = true;
                    errorMessage = `Введите корректный вес для упражнения "${exerciseName}"!`;
                    break;
                }

                sets.push({ reps, weight });
            }

            if (hasError) break;

            exercises.push({
                name: exerciseName,
                sets: sets
            });
        }

        if (hasError) {
            alert(errorMessage);
            return;
        }

        if (exercises.length === 0) {
            alert('Добавьте данные о тренировке!');
            return;
        }

        const workoutComment = document.getElementById('workout-comment').value.trim();

        const workout = {
            id: Date.now().toString(),
            userId: currentUserId,
            programId: programId,
            date: workoutDate,
            exercises: exercises,
            comment: workoutComment || null,
            createdAt: new Date().toISOString()
        };

        workouts.push(workout);
        localStorage.setItem('workouts', JSON.stringify(workouts));

        alert('Тренировка успешно сохранена!');
        
        // Очистка формы
        document.getElementById('program-select').value = '';
        document.getElementById('exercises-container').innerHTML = '';
        document.getElementById('workout-date').valueAsDate = new Date();
        document.getElementById('workout-comment').value = '';
        
        // Обновление календаря
        renderCalendar();
    } catch (error) {
        console.error('Ошибка при сохранении тренировки:', error);
        alert('Произошла ошибка при сохранении тренировки: ' + error.message);
    }
}

// Экспорт функций для использования в HTML
window.addSet = addSet;
window.deleteProgram = deleteProgram;
window.selectUser = selectUser;
window.deleteUser = deleteUser;

