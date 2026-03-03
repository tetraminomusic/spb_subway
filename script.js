const cursor = document.getElementById('custom-cursor');
const tooltip = document.getElementById('tooltip');
const stName = document.getElementById('st-name');
const stDesc = document.getElementById('st-desc');
const stImg = document.getElementById('st-img');
const svgMap = document.getElementById('metro-map');
const stInfo = document.getElementById('st-info');

function initCustomTags() {
    // 1. Обработка ПОЛУКРУГОВ
    const halfCircles = document.querySelectorAll('half-circle');
    halfCircles.forEach(el => {
        const cx = parseFloat(el.getAttribute('cx'));
        const cy = parseFloat(el.getAttribute('cy'));
        const r = parseFloat(el.getAttribute('r'));
        const side = el.getAttribute('side');
        let d = (side === 'left') ? `M ${cx},${cy + r} A ${r},${r} 0 0,1 ${cx},${cy - r} Z` :
                (side === 'right') ? `M ${cx},${cy - r} A ${r},${r} 0 0,1 ${cx},${cy + r} Z` :
                (side === 'top') ? `M ${cx - r},${cy} A ${r},${r} 0 0,1 ${cx + r},${cy} Z` :
                `M ${cx + r},${cy} A ${r},${r} 0 0,1 ${cx - r},${cy} Z`;
        replaceElement(el, d);
    });

    // 2. Обработка ТРЕТЕЙ КРУГА (120 градусов)
    const thirdCircles = document.querySelectorAll('third-circle');
    thirdCircles.forEach(el => {
        const cx = parseFloat(el.getAttribute('cx'));
        const cy = parseFloat(el.getAttribute('cy'));
        const r = parseFloat(el.getAttribute('r'));
        const startDeg = parseFloat(el.getAttribute('rotate')) || 0;
        
        // Математика сектора
        const endDeg = startDeg + 120;
        const x1 = cx + r * Math.cos(Math.PI * startDeg / 180);
        const y1 = cy + r * Math.sin(Math.PI * startDeg / 180);
        const x2 = cx + r * Math.cos(Math.PI * endDeg / 180);
        const y2 = cy + r * Math.sin(Math.PI * endDeg / 180);

        const d = `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2} Z`;
        replaceElement(el, d);
    });
}

// Вспомогательная функция для замены тега на путь
function replaceElement(el, d) {
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    Array.from(el.attributes).forEach(attr => path.setAttribute(attr.name, attr.value));
    path.setAttribute('d', d);
    el.parentNode.replaceChild(path, el);
}

// Запуск
initCustomTags();

// 2. НАЗНАЧАЕМ СОБЫТИЯ
const stations = document.querySelectorAll('.station');

stations.forEach(station => {
    station.addEventListener('mouseenter', (e) => {
        e.target.parentNode.appendChild(e.target);

        const name = station.getAttribute('data-name');
        const type = station.getAttribute('data-type');
        const year = station.getAttribute('data-year');
        const arch = station.getAttribute('data-arch');
        const img = station.getAttribute('data-img');
        const color = station.getAttribute('data-color') || '#888';
        const infoText = station.getAttribute('data-info') || ""; 

        stName.innerText = name;
        stDesc.innerHTML = `<strong>Тип:</strong> ${type}<br><strong>Открыта:</strong> ${year} г.<br><strong>Архитектор:</strong> ${arch}`;
        
        if (infoText !== "") {
            stInfo.innerText = infoText;
            stInfo.style.display = 'block'; // Показываем, если текст есть
        } else {
            stInfo.style.display = 'none'; // Прячем, если текста нет
        }

        if (img) {
            stImg.src = img;
            stImg.style.display = 'block';
        } else {
            stImg.style.display = 'none';
        }

        tooltip.style.borderLeftColor = color;
        tooltip.style.display = 'block';
        
        cursor.style.transform = 'translate(-50%, -50%) scale(2)';
        cursor.style.background = 'rgba(255, 255, 0, 0.3)';
        cursor.style.borderColor = 'transparent';
    });

    station.addEventListener('mouseleave', () => {
        tooltip.style.display = 'none';
        cursor.style.transform = 'translate(-50%, -50%) scale(1)';
        cursor.style.background = 'rgba(0, 0, 0, 0.1)';
        cursor.style.borderColor = '#333';
    });
});

// Движение курсора
document.addEventListener('mousemove', (e) => {
    // 1. Двигаем курсор
    cursor.style.left = e.clientX + 'px';
    cursor.style.top = e.clientY + 'px';

    if (tooltip.style.display === 'block') {
        // 2. Получаем размеры карточки (ширину и высоту)
        let tooltipWidth = tooltip.offsetWidth;
        let tooltipHeight = tooltip.offsetHeight;

        // 3. Базовое положение (чуть правее и ниже курсора)
        let x = e.clientX + 20;
        let y = e.clientY + 20;

        // 4. ПРОВЕРКА ПРАВОГО КРАЯ:
        // Если положение X + ширина карточки больше ширины окна браузера
        if (x + tooltipWidth > window.innerWidth) {
            x = e.clientX - tooltipWidth - 20; // Окно прыгает влево от курсора
        }

        // 5. ПРОВЕРКА НИЖНЕГО КРАЯ (актуально для Купчино):
        // Если положение Y + высота карточки больше высоты окна браузера
        if (y + tooltipHeight > window.innerHeight) {
            y = e.clientY - tooltipHeight - 20; // Окно прыгает выше курсора
        }

        // 6. Применяем итоговые координаты
        tooltip.style.left = x + 'px';
        tooltip.style.top = y + 'px';
    }
});

// Помощник координат
svgMap.addEventListe