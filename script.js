// ===== КОНСТАНТЫ И КОНФИГУРАЦИЯ =====
const CONFIG = {
    ROOM_DATA: ['601/2', '601/3', '607', '611/2', '611/3', '615/2', '615/3', '602/2', '602/3', '608/2', '608/3', '612/2', '612/3', '616/2', '616/3', '603/2', '609/2', '609/3', '613/2', '617/2', '617/3', '604', '610', '614/2', '614/3', '618/2', '618/3'],
    DAYS_31: ['Январь', 'Март', 'Май', 'Июль', 'Август', 'Октябрь', 'Декабрь'],
    WEEK_DAYS: ["Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота", "Воскресенье"],
    DEFAULT_ROOM: '601/2',
    DEFAULT_FLOOR: '6'
};

// ===== ВАЛИДАЦИЯ И ОБРАБОТКА СОБЫТИЙ =====
function validateRoomInput(input) {
    input.value = input.value.replace(/[^0-9/]/g, '');
    input.value = input.value.replace(/\/+/g, '/');
    if (input.value.startsWith('/')) {
        input.value = input.value.substring(1);
    }
}

function initializeEventListeners() {
    const floorSelect = document.getElementById('floorSelect');

    if (floorSelect) {
        floorSelect.addEventListener('change', function() {
            onFloorChange(this.value);
        });
    }

    const roomInput = document.getElementById('StartRoom');
    
    roomInput.addEventListener('input', function() {
        validateRoomInput(this);
    });
    
    roomInput.addEventListener('blur', function() {
        if (!this.value) {
            this.value = CONFIG.DEFAULT_ROOM;
        }
    });
}

function onFloorChange(selectedFloor) {
    const floorLength = CONFIG.DEFAULT_ROOM.match(/^\d+/)[0].length;

    CONFIG.ROOM_DATA = CONFIG.ROOM_DATA.map(item => 
        selectedFloor + item.substring(floorLength-2)
    );

    const currentFloorLength = CONFIG.DEFAULT_ROOM.match(/^\d+/)[0].length;

    CONFIG.DEFAULT_ROOM = selectedFloor + CONFIG.DEFAULT_ROOM.substring(currentFloorLength-2);
}

// ===== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ =====
function getDaysInMonth(month) {
    if (month === 'Февраль') {
        return 28;
    } else if (CONFIG.DAYS_31.includes(month)) {
        return 31;
    } else {
        return 30;
    }
}

function findRoomStartIndex(room) {
    return CONFIG.ROOM_DATA.indexOf(room);
}

function clearPreviousTable() {
    const oldTable = document.querySelector('.table-container');
    if (oldTable) oldTable.remove();
}

function resetRoomInputStyle() {
    const roomInput = document.getElementById('StartRoom');
    if (roomInput) {
        roomInput.style.borderColor = '#b3e0ff';
    }
}

// ===== СОЗДАНИЕ ЭЛЕМЕНТОВ ТАБЛИЦЫ =====
function createTableHeader(month) {
    const headerRow = document.createElement('tr');
    const headerCell = document.createElement('th');
    headerCell.textContent = month;
    headerCell.colSpan = 7;
    headerRow.appendChild(headerCell);
    return headerRow;
}

function createWeekdaysRow() {
    const weekRow = document.createElement('tr');
    CONFIG.WEEK_DAYS.forEach(day => {
        const item = document.createElement('td');
        item.textContent = day;
        weekRow.appendChild(item);
    });
    return weekRow;
}

function createFirstDateRow(startDay, daysInMonth) {
    const firstRow = document.createElement('tr');
    let dateCounter = 1;
    let isSearchingStartDay = true;

    for (let i = 0; i < 7; i++) {
        const item = document.createElement('td');
        
        if (isSearchingStartDay && CONFIG.WEEK_DAYS[i] !== startDay) {
            firstRow.appendChild(item);
        } else {
            isSearchingStartDay = false;
            if (dateCounter <= daysInMonth) {
                item.textContent = dateCounter;
                dateCounter++;
            }
            firstRow.appendChild(item);
        }
    }
    
    return { row: firstRow, nextDate: dateCounter };
}

function createFirstRoomRow(startDay, startRoom, daysInMonth) {
    const firstRooms = document.createElement('tr');
    let roomCounter = 1;
    let isSearchingStartDay = true;
    let roomIndex = findRoomStartIndex(startRoom);

    for (let i = 0; i < 7; i++) {
        const item = document.createElement('td');
        
        if (isSearchingStartDay && CONFIG.WEEK_DAYS[i] !== startDay) {
            firstRooms.appendChild(item);
        } else {
            isSearchingStartDay = false;
            if (roomCounter <= daysInMonth) {
                item.textContent = CONFIG.ROOM_DATA[roomIndex];
                roomIndex = (roomIndex + 1) % CONFIG.ROOM_DATA.length;
                roomCounter++;
            }
            firstRooms.appendChild(item);
        }
    }
    
    return { row: firstRooms, nextRoom: roomCounter, nextRoomIndex: roomIndex };
}

function createDateRows(startDate, daysInMonth) {
    const rows = [];
    let dateCounter = startDate;

    while (dateCounter <= daysInMonth) {
        const row = document.createElement('tr');
        
        for (let i = 0; i < 7 && dateCounter <= daysInMonth; i++) {
            const item = document.createElement('td');
            item.textContent = dateCounter;
            row.appendChild(item);
            dateCounter++;
        }
        
        rows.push(row);
    }
    
    return rows;
}

function createRoomRows(startRoom, startRoomIndex, daysInMonth) {
    const rows = [];
    let roomCounter = startRoom;
    let roomIndex = startRoomIndex;

    while (roomCounter <= daysInMonth) {
        const row = document.createElement('tr');
        
        for (let i = 0; i < 7 && roomCounter <= daysInMonth; i++) {
            const item = document.createElement('td');
            item.textContent = CONFIG.ROOM_DATA[roomIndex];
            roomIndex = (roomIndex + 1) % CONFIG.ROOM_DATA.length;
            row.appendChild(item);
            roomCounter++;
        }
        
        rows.push(row);
    }
    
    return rows;
}

// ===== ОСНОВНАЯ ЛОГИКА =====
function validateInputs() {
    const room = document.getElementById('StartRoom').value;
    
    if (!room || room.trim() === '') {
        alert('Пожалуйста, введите начальный номер комнаты');
        document.getElementById('StartRoom').style.borderColor = 'red';
        document.getElementById('StartRoom').focus();
        return false;
    }
    
    return true;
}

function generateTable() {
    clearPreviousTable();
    
    if (!validateInputs()) {
        return;
    }

    const month = document.getElementById('monthSelect').value;
    const room = document.getElementById('StartRoom').value;
    const startDay = document.getElementById('WeekDay').value;

    createTable(month, room, startDay);
}

function createTable(month, room, startDay) {
    resetRoomInputStyle();

    const daysInMonth = getDaysInMonth(month);
    
    // Создаем основную структуру таблицы
    const table = document.createElement('table');
    const tableContainer = document.createElement('div');
    tableContainer.className = 'table-container';

    // Добавляем заголовки
    table.appendChild(createTableHeader(month));
    table.appendChild(createWeekdaysRow());

    // Создаем первую строку с датами
    const firstDateRow = createFirstDateRow(startDay, daysInMonth);
    table.appendChild(firstDateRow.row);

    // Создаем первую строку с комнатами
    const firstRoomRow = createFirstRoomRow(startDay, room, daysInMonth);
    table.appendChild(firstRoomRow.row);

    // Создаем остальные строки с датами
    const dateRows = createDateRows(firstDateRow.nextDate, daysInMonth);
    
    // Создаем остальные строки с комнатами
    const roomRows = createRoomRows(
        firstRoomRow.nextRoom, 
        firstRoomRow.nextRoomIndex, 
        daysInMonth
    );

    // Чередуем строки с датами и комнатами
    for (let i = 0; i < roomRows.length; i++) {
        if (dateRows[i]) table.appendChild(dateRows[i]);
        table.appendChild(roomRows[i]);
    }

    // Добавляем таблицу на страницу
    tableContainer.appendChild(table);
    document.body.appendChild(tableContainer);
}

// ===== ИНИЦИАЛИЗАЦИЯ =====
document.addEventListener('DOMContentLoaded', function() {
    initializeEventListeners();
});