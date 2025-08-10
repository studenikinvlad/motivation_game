// Основные переменные
let money = 0;
let level = 1;
let customers = 0;
let maxCustomers = 10;
let clickValue = 10;
let rating = 5;
let ratingDebuff = 1;
let maxRating = 5;

// Персонал
const staff = {
    seller: { count: 0, attraction: 0.2, cost: 150, income: 3 },
    consultant: { count: 0, income: 5, cost: 300 },
    warehouse: { count: 0, multiplier: 0.01, cost: 500 }
};

// Улучшения
const upgrades = {
    training: { 
        bought: false, 
        cost: 1000, 
        effect: () => { staff.seller.income *= 1.2; }
    },
    marketing: { 
        bought: false, 
        cost: 2000, 
        effect: () => { maxRating = 7; }
    }
};

// Загрузка и сохранение
function loadGame() {
    const save = JSON.parse(localStorage.getItem('dnsManagerSave'));
    if (save) {
        money = save.money || 0;
        level = save.level || 1;
        customers = save.customers || 0;
        maxCustomers = save.maxCustomers || 10;
        rating = save.rating || 5;
        ratingDebuff = save.ratingDebuff || 1;
        maxRating = save.maxRating || 5;
        
        // Глубокое копирование объектов
        for (const role in staff) {
            if (save.staff?.[role]) {
                staff[role] = {...staff[role], ...save.staff[role]};
            }
        }
        
        for (const upgrade in upgrades) {
            if (save.upgrades?.[upgrade]) {
                upgrades[upgrade] = {...upgrades[upgrade], ...save.upgrades[upgrade]};
            }
        }
    }
    updateUI();
}

function saveGame() {
    localStorage.setItem('dnsManagerSave', JSON.stringify({
        money, level, customers, maxCustomers,
        rating, ratingDebuff, maxRating,
        staff, upgrades
    }));
}

// Клик по кнопке
document.getElementById('click-button').addEventListener('click', () => {
    if (customers >= 1) {
        money += calculateClickValue() * rating * ratingDebuff;
        customers--;
        rating = Math.min(maxRating, rating + 0.1);
        updateUI();
        saveGame();
    }
});

// Найм сотрудников
document.querySelectorAll('.hire-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        const role = this.closest('.employee').dataset.role;
        if (money >= staff[role].cost) {
            money -= staff[role].cost;
            staff[role].count++;
            staff[role].cost = Math.floor(staff[role].cost * 1.2);
            updateUI();
            saveGame();
        }
    });
});

// Покупка улучшений
document.querySelectorAll('.buy-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        const upgrade = this.closest('.upgrade').dataset.upgrade;
        if (!upgrades[upgrade].bought && money >= upgrades[upgrade].cost) {
            money -= upgrades[upgrade].cost;
            upgrades[upgrade].bought = true;
            upgrades[upgrade].effect();
            updateUI();
            saveGame();
        }
    });
});

// Расчет значения клика
function calculateClickValue() {
    const warehouseMultiplier = 1 + staff.warehouse.count * staff.warehouse.multiplier;
    return (clickValue + staff.seller.count * staff.seller.income) * warehouseMultiplier;
}

// Обновление интерфейса
function updateUI() {
    document.getElementById('money').textContent = Math.floor(money);
    document.getElementById('level').textContent = level;
    document.getElementById('click-value').textContent = calculateClickValue().toFixed(1);
    document.getElementById('customers').textContent = `${Math.floor(customers)}/${maxCustomers}`;
    document.getElementById('customer-progress').style.width = `${Math.min(100, (customers / maxCustomers) * 100)}%`;
    document.getElementById('rating').textContent = rating.toFixed(1);
    document.getElementById('income-multiplier').textContent = `×${ratingDebuff}`;
    
    // Рассчет пассивного дохода
    const warehouseMultiplier = 1 + staff.warehouse.count * staff.warehouse.multiplier;
    const passiveIncome = staff.consultant.count * staff.consultant.income * warehouseMultiplier;
    document.getElementById('passive-income').textContent = passiveIncome.toFixed(1);
    
    // Обновление персонала
    document.querySelectorAll('.employee').forEach(el => {
        const role = el.dataset.role;
        el.querySelector('.count').textContent = staff[role].count;
        const btn = el.querySelector('.hire-btn');
        btn.textContent = `Нанять (${Math.floor(staff[role].cost)} ₽)`;
        btn.disabled = money < staff[role].cost;
    });
    
    // Обновление улучшений
    document.querySelectorAll('.upgrade').forEach(el => {
        const upgrade = el.dataset.upgrade;
        const btn = el.querySelector('.buy-btn');
        if (upgrades[upgrade].bought) {
            btn.textContent = 'Куплено';
            btn.disabled = true;
        } else {
            btn.textContent = `Купить (${upgrades[upgrade].cost} ₽)`;
            btn.disabled = money < upgrades[upgrade].cost;
        }
    });
}

// Пассивный доход и привлечение клиентов
setInterval(() => {
    // Начисляем пассивный доход
    const warehouseMultiplier = 1 + staff.warehouse.count * staff.warehouse.multiplier;
    money += staff.consultant.count * staff.consultant.income * warehouseMultiplier * ratingDebuff;
    
    // Привлекаем новых клиентов
    const newCustomers = staff.seller.count * staff.seller.attraction;
    customers = Math.min(customers + newCustomers, maxCustomers);
    
    // Штраф при переполнении
    if (customers >= maxCustomers) {
        rating = Math.max(1, rating - 0.05);
        ratingDebuff = 0.8;
    } else {
        ratingDebuff = 1;
    }
    
    // Обновляем UI только при изменениях
    if (newCustomers > 0 || customers >= maxCustomers) {
        updateUI();
    }
}, 1000);

// Автосохранение каждые 30 секунд
setInterval(saveGame, 30000);

// ===== ТЁМНАЯ ТЕМА ===== //
const themeToggle = document.getElementById('theme-toggle');
const body = document.body;

// Загрузка темы
function loadTheme() {
    const savedTheme = localStorage.getItem('dnsManagerTheme');
    if (savedTheme === 'dark') {
        body.classList.add('dark-theme');
        themeToggle.innerHTML = '<i class="fas fa-sun"></i> Тема';
    }
}

// Переключение темы
themeToggle.addEventListener('click', () => {
    body.classList.toggle('dark-theme');
    if (body.classList.contains('dark-theme')) {
        localStorage.setItem('dnsManagerTheme', 'dark');
        themeToggle.innerHTML = '<i class="fas fa-sun"></i> Тема';
    } else {
        localStorage.setItem('dnsManagerTheme', 'light');
        themeToggle.innerHTML = '<i class="fas fa-moon"></i> Тема';
    }
});

// Запуск игры
loadTheme();
loadGame();