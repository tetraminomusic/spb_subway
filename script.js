const cursor = document.getElementById('custom-cursor');
const tooltip = document.getElementById('tooltip');
const stName = document.getElementById('st-name');
const stDesc = document.getElementById('st-desc');
const stImg = document.getElementById('st-img');
const stInfo = document.getElementById('st-info');
const closeBtn = document.getElementById('close-btn');

// --- 1. ПРЕВРАЩАЕМ ТЕГИ ---
function initCustomTags() {
    document.querySelectorAll('half-circle').forEach(el => {
        const cx = parseFloat(el.getAttribute('cx')), cy = parseFloat(el.getAttribute('cy')), r = parseFloat(el.getAttribute('r')), side = el.getAttribute('side');
        let d = (side === 'left') ? `M ${cx},${cy+r} A ${r},${r} 0 0,1 ${cx},${cy-r} Z` : `M ${cx},${cy-r} A ${r},${r} 0 0,1 ${cx},${cy+r} Z`;
        replaceEl(el, d);
    });

    document.querySelectorAll('third-circle').forEach(el => {
        const cx = parseFloat(el.getAttribute('cx')), cy = parseFloat(el.getAttribute('cy')), r = parseFloat(el.getAttribute('r')), start = parseFloat(el.getAttribute('rotate')) || 0;
        const end = start + 120, x1 = cx + r * Math.cos(Math.PI * start / 180), y1 = cy + r * Math.sin(Math.PI * start / 180), x2 = cx + r * Math.cos(Math.PI * end / 180), y2 = cy + r * Math.sin(Math.PI * end / 180);
        replaceEl(el, `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2} Z`);
    });
}

function replaceEl(el, d) {
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    Array.from(el.attributes).forEach(attr => path.setAttribute(attr.name, attr.value));
    path.setAttribute('d', d);
    el.parentNode.replaceChild(path, el);
}

initCustomTags();

// --- 2. ФУНКЦИЯ ПОКАЗА ИНФОРМАЦИИ ---
function openTooltip(station) {
    stName.innerText = station.getAttribute('data-name') || "Неизвестная станция";
    stDesc.innerHTML = `<strong>Тип:</strong> ${station.getAttribute('data-type')}<br><strong>Открыта:</strong> ${station.getAttribute('data-year')} г.<br><strong>Архитектор:</strong> ${station.getAttribute('data-arch')}`;
    
    const info = station.getAttribute('data-info');
    stInfo.innerText = info || "";
    stInfo.style.display = info ? 'block' : 'none';

    const img = station.getAttribute('data-img');
    stImg.src = img || "";
    stImg.style.display = img ? 'block' : 'none';

    const color = station.getAttribute('data-color') || '#888';
    
    if (window.innerWidth <= 992) {
        // Убиваем инлайн-стили от ПК
        tooltip.removeAttribute('style'); 
        tooltip.style.borderTopColor = color;
        
        // Включаем блок и через 10мс запускаем анимацию
        tooltip.style.display = 'block';
        setTimeout(() => {
            tooltip.classList.add('active');
        }, 10);
    } else {
        tooltip.style.borderLeftColor = color;
        tooltip.style.display = 'block';
    }
}

// --- 3. ГЛОБАЛЬНЫЙ ПЕРЕХВАТ КЛИКОВ (САМОЕ ВАЖНОЕ) ---
// Ловим любой клик на странице
document.addEventListener('click', function(e) {
    // Ищем, не кликнули ли мы случайно по станции или внутри неё
    const station = e.target.closest('.station');
    
    if (station && window.innerWidth <= 992) {
        e.preventDefault(); // Останавливаем стандартное поведение браузера
        
        // Красим нажатую станцию
        document.querySelectorAll('.station').forEach(s => s.classList.remove('touched'));
        station.classList.add('touched');
        
        // Показываем данные
        openTooltip(station);
    }
});

// КНОПКА ЗАКРЫТИЯ НА ТЕЛЕФОНЕ
if (closeBtn) {
    closeBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        // Запускаем анимацию исчезновения
        tooltip.classList.remove('active');
        
        // Ждем окончания анимации (0.3с) и полностью прячем блок
        setTimeout(() => { 
            tooltip.style.display = 'none'; 
        }, 300);
        
        // Убираем желтую подсветку со станции
        document.querySelectorAll('.station').forEach(s => s.classList.remove('touched'));
    });
}

// --- 4. СОБЫТИЯ ДЛЯ ПК (Наведение мыши) ---
const stations = document.querySelectorAll('.station');
stations.forEach(station => {
    station.addEventListener('mouseenter', function() {
        if (window.innerWidth > 992) {
            this.parentNode.appendChild(this);
            openTooltip(this);
            cursor.style.transform = 'translate(-50%, -50%) scale(2)';
        }
    });

    station.addEventListener('mouseleave', function() {
        if (window.innerWidth > 992) {
            tooltip.style.display = 'none';
            cursor.style.transform = 'translate(-50%, -50%) scale(1)';
        }
    });
});

// Движение курсора (только ПК)
document.addEventListener('mousemove', (e) => {
    if (window.innerWidth > 992) {
        cursor.style.left = e.clientX + 'px';
        cursor.style.top = e.clientY + 'px';

        if (tooltip.style.display === 'block') {
            let w = tooltip.offsetWidth, h = tooltip.offsetHeight;
            let x = e.clientX + 20, y = e.clientY + 20;

            if (x + w > window.innerWidth) x = e.clientX - w - 20;
            if (y + h > window.innerHeight) y = e.clientY - h - 20;

            tooltip.style.left = x + 'px';
            tooltip.style.top = y + 'px';
        }
    }
});

// Заглушка для фото
stImg.onerror = function() { this.style.display = 'none'; };