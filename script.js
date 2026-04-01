const cursor = document.getElementById('custom-cursor');
const tooltip = document.getElementById('tooltip');
const stName = document.getElementById('st-name');
const stDesc = document.getElementById('st-desc');
const stImg = document.getElementById('st-img');
const stInfo = document.getElementById('st-info');
const closeBtn = document.getElementById('close-btn');
const svgMap = document.getElementById('metro-map');
const containerElement = document.querySelector('.container');

// Поиск
const searchInput = document.getElementById('station-search');
const searchResults = document.getElementById('search-results');
const searchClear = document.getElementById('search-clear');

// Легенда (Подсветка)
const lineItems = document.querySelectorAll('.line-item');
const resetBtn = document.getElementById('reset-filter');

let hideTimeout; // Таймер для задержки скрытия окна на ПК

// --- 1. ИНИЦИАЛИЗАЦИЯ КАСТОМНЫХ ТЕГОВ ---
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

// --- 2. ФУНКЦИИ СБРОСА И ОЧИСТКИ ---

function clearAllHighlights() {
    document.querySelectorAll('.station').forEach(st => {
        st.classList.remove('touched');
    });
}

function closeSearch() {
    if (searchResults) searchResults.style.display = 'none';
    if (searchClear) searchClear.style.display = 'none';
}

function resetMapFilter() {
    containerElement.classList.remove('map-dimmed');
    lineItems.forEach(i => i.classList.remove('active'));
    document.querySelectorAll('.station').forEach(st => st.classList.remove('not-target'));
    if(resetBtn) resetBtn.style.display = 'none';
}

// --- 3. ЛОГИКА ЗАПОЛНЕНИЯ И ПОКАЗА ТУЛТИПА ---

function openTooltip(station) {
    const name = station.getAttribute('data-name') || "Неизвестная станция";
    const type = station.getAttribute('data-type') || "";
    const year = station.getAttribute('data-year') || "";
    const arch = station.getAttribute('data-arch') || "";
    const info = station.getAttribute('data-info');
    const img = station.getAttribute('data-img');
    const color = station.getAttribute('data-color') || '#888';
    const landmarksData = station.getAttribute('data-landmarks');

    stName.innerText = name;
    stDesc.innerHTML = `<strong>Тип:</strong> ${type}<br><strong>Открыта:</strong> ${year} г.<br><strong>Архитектор:</strong> ${arch}`;
    
    stInfo.innerText = info || "";
    stInfo.style.display = info ? 'block' : 'none';

    if (img) {
        stImg.src = img;
        stImg.style.display = 'block';
    } else {
        stImg.style.display = 'none';
    }

    let landmarksContainer = document.getElementById('st-landmarks');
    if (!landmarksContainer) {
        landmarksContainer = document.createElement('div');
        landmarksContainer.id = 'st-landmarks';
        tooltip.appendChild(landmarksContainer);
    }
    landmarksContainer.innerHTML = '';

    if (landmarksData) {
        const header = document.createElement('div');
        header.className = 'landmarks-header';
        header.innerText = 'Достопримечательности рядом:';
        landmarksContainer.appendChild(header);

        landmarksData.split(',').forEach(item => {
            const [lName, lTime] = item.split(':');
            const card = document.createElement('div');
            card.className = 'landmark-card';
            card.innerHTML = `
                <span class="landmark-name">${lName.trim()}</span>
                <span class="landmark-time"> ${lTime ? lTime.trim() : 'рядом'}</span>
            `;
            landmarksContainer.appendChild(card);
        });
        landmarksContainer.style.display = 'grid';
    } else {
        landmarksContainer.style.display = 'none';
    }

    if (window.innerWidth <= 992) {
        tooltip.removeAttribute('style'); 
        tooltip.style.borderTopColor = color;
        tooltip.style.display = 'block';
        setTimeout(() => tooltip.classList.add('active'), 10);
    } else {
        tooltip.style.borderLeftColor = color;
        tooltip.style.display = 'block';
        tooltip.style.opacity = '1';
    }
}

// --- 4. СОБЫТИЯ СТАНЦИЙ ---

const stations = document.querySelectorAll('.station');

stations.forEach(station => {
    // ПК: ТОЛЬКО НАВЕДЕНИЕ
    station.addEventListener('mouseenter', function() {
        if (window.innerWidth > 992) {
            clearTimeout(hideTimeout);
            clearAllHighlights(); // Убираем старые подсветки (например, от поиска)
            this.classList.add('touched');
            openTooltip(this);
            cursor.style.transform = 'translate(-50%, -50%) scale(2)';
        }
    });

    station.addEventListener('mouseleave', function() {
        if (window.innerWidth > 992) {
            hideTimeout = setTimeout(() => {
                if (!tooltip.matches(':hover')) {
                    tooltip.style.display = 'none';
                    this.classList.remove('touched'); // Сразу гасим точку на ПК
                }
            }, 300);
            cursor.style.transform = 'translate(-50%, -50%) scale(1)';
        }
    });
});

// ГЛОБАЛЬНЫЙ КЛИК (Для мобилок и сброса)
document.addEventListener('click', function(e) {
    const station = e.target.closest('.station');
    const isInsidePanel = e.target.closest('.side-panel');
    const isInsideTooltip = e.target.closest('#tooltip');

    // ЛОГИКА ДЛЯ МОБИЛОК
    if (station && window.innerWidth <= 992) {
        e.preventDefault();
        clearAllHighlights();
        station.classList.add('touched');
        openTooltip(station);
        return;
    }

    // СБРОС ПРИ КЛИКЕ МИМО
    if (!station && !isInsidePanel && !isInsideTooltip) {
        closeSearch();
        if(containerElement.classList.contains('map-dimmed')) resetMapFilter();
        
        if (window.innerWidth <= 992) {
            tooltip.classList.remove('active');
            setTimeout(() => { tooltip.style.display = 'none'; }, 300);
        } else {
            tooltip.style.display = 'none';
        }
        clearAllHighlights();
    }
});

// Кнопка закрытия (Мобилка)
if (closeBtn) {
    closeBtn.addEventListener('click', (e) => {
        e.preventDefault(); e.stopPropagation();
        tooltip.classList.remove('active');
        setTimeout(() => { tooltip.style.display = 'none'; }, 300);
        clearAllHighlights();
    });
}

// Тултип ПК (чтобы не закрывался при наведении на кнопки маршрутов)
tooltip.addEventListener('mouseenter', () => clearTimeout(hideTimeout));
tooltip.addEventListener('mouseleave', () => {
    if (window.innerWidth > 992) {
        tooltip.style.display = 'none';
        clearAllHighlights();
    }
});

// --- 5. ПОИСК ---

if (searchInput) {
    searchInput.addEventListener('input', function() {
        const query = this.value.toLowerCase().trim();
        searchResults.innerHTML = '';
        if (query.length > 0) {
            searchClear.style.display = 'block';
            const allSt = document.querySelectorAll('.station');
            let count = 0;
            allSt.forEach(st => {
                const name = st.getAttribute('data-name').toLowerCase();
                const landmarks = (st.getAttribute('data-landmarks') || "").toLowerCase();
                if ((name.includes(query) || landmarks.includes(query)) && count < 10) {
                    const div = document.createElement('div');
                    div.className = 'search-item';
                    div.innerHTML = `<span class="line-dot" style="background:${st.getAttribute('data-color')}"></span> ${st.getAttribute('data-name')}`;
                    div.onclick = (e) => {
                        e.stopPropagation();
                        goToStation(st);
                        closeSearch();
                    };
                    searchResults.appendChild(div);
                    count++;
                }
            });
            searchResults.style.display = count > 0 ? 'block' : 'none';
        } else {
            closeSearch();
        }
    });
}

function goToStation(station) {
    clearAllHighlights();
    station.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
    station.classList.add('touched');
    setTimeout(() => openTooltip(station), 600);
}

if (searchClear) searchClear.onclick = () => { searchInput.value = ''; closeSearch(); };

// --- 6. ЛЕГЕНДА (ПОДСВЕТКА ВЕТОК) ---

lineItems.forEach(item => {
    item.addEventListener('click', function(e) {
        e.stopPropagation();
        const selectedColor = this.getAttribute('data-line-filter');
        lineItems.forEach(i => i.classList.remove('active'));
        this.classList.add('active');
        
        containerElement.classList.add('map-dimmed');
        if(resetBtn) resetBtn.style.display = 'block';

        const allStations = document.querySelectorAll('.station');
        allStations.forEach(st => {
            if (st.getAttribute('data-color') === selectedColor) {
                st.classList.remove('not-target');
            } else {
                st.classList.add('not-target');
            }
        });
    });
});

if(resetBtn) resetBtn.onclick = (e) => { e.stopPropagation(); resetMapFilter(); };

// --- 7. КУРСОР И ФИНАЛЬНЫЕ ШТРИХИ ---

document.addEventListener('mousemove', (e) => {
    if (window.innerWidth > 992) {
        cursor.style.left = e.clientX + 'px';
        cursor.style.top = e.clientY + 'px';

        if (tooltip.style.display === 'block' && !tooltip.matches(':hover')) {
            let w = tooltip.offsetWidth, h = tooltip.offsetHeight;
            let x = e.clientX + 20, y = e.clientY + 20;
            if (x + w > window.innerWidth) x = e.clientX - w - 20;
            if (y + h > window.innerHeight) y = e.clientY - h - 20;
            tooltip.style.left = x + 'px';
            tooltip.style.top = y + 'px';
        }
    }
});

stImg.onerror = function() { this.src = 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/af/Spb_metro_logo.svg/200px-Spb_metro_logo.svg.png'; };