const cursor = document.getElementById('custom-cursor');
const tooltip = document.getElementById('tooltip');
const stName = document.getElementById('st-name');
const stDesc = document.getElementById('st-desc');
const stImg = document.getElementById('st-img');
const stInfo = document.getElementById('st-info');
const closeBtn = document.getElementById('close-btn');
const svgMap = document.getElementById('metro-map');
const containerElement = document.querySelector('.container');

const searchInput = document.getElementById('station-search');
const searchResults = document.getElementById('search-results');
const searchClear = document.getElementById('search-clear');
const lineItems = document.querySelectorAll('.line-item');
const resetBtn = document.getElementById('reset-filter');
const toggleLinesBtn = document.getElementById('toggle-lines-btn');
const linesExpandContainer = document.getElementById('lines-expand-container');
const decadeButtons = document.querySelectorAll('.decade-btn');

let hideTimeout; 
let currentSelectedLine = null; 
let currentSelectedYear = 2030; 

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

function applyGlobalFilters() {
    const all = document.querySelectorAll('.station');
    if (currentSelectedLine || currentSelectedYear < 2030) containerElement.classList.add('map-dimmed');
    else containerElement.classList.remove('map-dimmed');
    all.forEach(st => {
        const matchLine = !currentSelectedLine || st.getAttribute('data-color') === currentSelectedLine;
        const matchYear = (parseInt(st.getAttribute('data-year')) || 0) <= currentSelectedYear;
        if (matchLine && matchYear) st.classList.remove('not-target', 'is-future');
        else {
            if (!matchLine) st.classList.add('not-target'); else st.classList.remove('not-target');
            if (!matchYear) st.classList.add('is-future'); else st.classList.remove('is-future');
        }
    });
}

function openTooltip(station) {
    stName.innerText = station.getAttribute('data-name') || "Неизвестная станция";
    stDesc.innerHTML = `<strong>Тип:</strong> ${station.getAttribute('data-type')}<br><strong>Открыта:</strong> ${station.getAttribute('data-year')} г.<br><strong>Архитектор:</strong> ${station.getAttribute('data-arch')}`;
    stInfo.innerText = station.getAttribute('data-info') || "";
    stInfo.style.display = stInfo.innerText ? 'block' : 'none';
    stImg.src = station.getAttribute('data-img') || "";
    stImg.style.display = stImg.src ? 'block' : 'none';
    
    const land = station.getAttribute('data-landmarks');
    let cont = document.getElementById('st-landmarks');
    if (!cont) { cont = document.createElement('div'); cont.id = 'st-landmarks'; tooltip.appendChild(cont); }
    cont.innerHTML = land ? '<div class="landmarks-header">Достопримечательности рядом:</div>' : '';
    if (land) {
        land.split(',').forEach(item => {
            const [n, t] = item.split(':');
            const card = document.createElement('div'); card.className = 'landmark-card';
            card.innerHTML = `<span class="landmark-name">${n.trim()}</span><span class="landmark-time"> ${t ? t.trim() : 'рядом'}</span>`;
            cont.appendChild(card);
        });
        cont.style.display = 'grid';
    } else cont.style.display = 'none';

    const color = station.getAttribute('data-color') || '#888';
    if (window.innerWidth <= 992) {
        tooltip.removeAttribute('style'); tooltip.style.borderTopColor = color;
        tooltip.style.display = 'block'; setTimeout(() => tooltip.classList.add('active'), 10);
    } else {
        tooltip.style.borderLeftColor = color; tooltip.style.display = 'block'; tooltip.style.opacity = '1';
    }
}

function clearAllHighlights() {
    document.querySelectorAll('.station').forEach(st => st.classList.remove('touched'));
}

document.querySelectorAll('.station').forEach(st => {
    st.addEventListener('mouseenter', function() {
        if (window.innerWidth > 992) {
            clearTimeout(hideTimeout);
            clearAllHighlights();
            this.classList.add('touched');
            openTooltip(this);
            cursor.style.transform = 'translate(-50%, -50%) scale(2)';
        }
    });
    st.addEventListener('mouseleave', function() {
        if (window.innerWidth > 992) {
            hideTimeout = setTimeout(() => { if (!tooltip.matches(':hover')) { tooltip.style.display = 'none'; this.classList.remove('touched'); } }, 300);
            cursor.style.transform = 'translate(-50%, -50%) scale(1)';
        }
    });
});

document.addEventListener('click', (e) => {
    const st = e.target.closest('.station');
    if (st && window.innerWidth <= 992) {
        clearAllHighlights();
        st.classList.add('touched');
        openTooltip(st);
    } else if (!e.target.closest('.side-panel') && !e.target.closest('#tooltip') && !e.target.closest('.timeline-container')) {
        if (searchResults) searchResults.style.display = 'none';
        if (containerElement.classList.contains('map-dimmed')) {
            containerElement.classList.remove('map-dimmed');
            lineItems.forEach(i => i.classList.remove('active'));
            document.querySelectorAll('.station').forEach(s => s.classList.remove('not-target'));
            if(resetBtn) resetBtn.style.display = 'none';
            currentSelectedLine = null;
        }
        if (window.innerWidth <= 992) { tooltip.classList.remove('active'); setTimeout(() => tooltip.style.display = 'none', 300); }
        else tooltip.style.display = 'none';
        clearAllHighlights();
    }
});

if (closeBtn) closeBtn.onclick = () => { tooltip.classList.remove('active'); setTimeout(() => tooltip.style.display = 'none', 300); clearAllHighlights(); };
tooltip.addEventListener('mouseenter', () => clearTimeout(hideTimeout));
tooltip.addEventListener('mouseleave', () => { if (window.innerWidth > 992) { tooltip.style.display = 'none'; clearAllHighlights(); } });

if (searchInput) {
    searchInput.oninput = function() {
        const q = this.value.toLowerCase().trim();
        searchResults.innerHTML = '';
        if (q) {
            searchClear.style.display = 'block';
            document.querySelectorAll('.station').forEach(st => {
                const name = st.getAttribute('data-name').toLowerCase();
                const land = (st.getAttribute('data-landmarks') || "").toLowerCase();
                if (name.includes(q) || land.includes(q)) {
                    const div = document.createElement('div'); div.className = 'search-item';
                    div.innerHTML = `<span class="line-dot" style="background:${st.getAttribute('data-color')}"></span> ${st.getAttribute('data-name')}`;
                    div.onclick = () => {
                        st.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
                        clearAllHighlights(); st.classList.add('touched');
                        setTimeout(() => openTooltip(st), 600);
                        searchResults.style.display = 'none';
                    };
                    searchResults.appendChild(div);
                }
            });
            searchResults.style.display = searchResults.children.length > 0 ? 'block' : 'none';
        } else { searchResults.style.display = 'none'; searchClear.style.display = 'none'; }
    };
}

if (searchClear) searchClear.onclick = () => { searchInput.value = ''; searchResults.style.display = 'none'; searchClear.style.display = 'none'; };

document.querySelectorAll('.line-item').forEach(item => {
    item.onclick = (e) => {
        e.stopPropagation(); currentSelectedLine = item.getAttribute('data-line-filter');
        lineItems.forEach(i => i.classList.remove('active'));
        item.classList.add('active');
        if (resetBtn) resetBtn.style.display = 'block';
        applyGlobalFilters();
    };
});

resetBtn.onclick = (e) => {
    e.stopPropagation(); currentSelectedLine = null;
    resetBtn.style.display = 'none';
    document.querySelectorAll('.line-item').forEach(i => i.classList.remove('active'));
    applyGlobalFilters();
};

decadeButtons.forEach(btn => {
    btn.onclick = () => {
        currentSelectedYear = parseInt(btn.getAttribute('data-year'));
        decadeButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        tooltip.style.display = 'none';
        applyGlobalFilters();
    };
});

document.getElementById('close-timeline').onclick = () => {
    currentSelectedYear = 2030;
    decadeButtons.forEach(b => b.classList.remove('active'));
    document.querySelector('[data-year="2030"]').classList.add('active');
    applyGlobalFilters();
};

if (toggleLinesBtn) {
    toggleLinesBtn.onclick = (e) => {
        e.stopPropagation();
        const isExp = linesExpandContainer.classList.toggle('expanded');
        toggleLinesBtn.innerText = isExp ? 'Скрыть фильтр ↑' : 'Фильтр по линиям ↓';
    };
}

document.addEventListener('mousemove', (e) => {
    cursor.style.left = e.clientX + 'px';
    cursor.style.top = e.clientY + 'px';

    if (window.innerWidth > 992 && tooltip.style.display === 'block' && !tooltip.matches(':hover')) {
        let w = tooltip.offsetWidth;
        let h = tooltip.offsetHeight;
        let x = e.clientX + 20;
        let y = e.clientY + 20;

        if (x + w > window.innerWidth) x = e.clientX - w - 20;
        if (x < 10) x = 10;
        if (y + h > window.innerHeight) y = e.clientY - h - 20;
        if (y < 10) y = 10;

        tooltip.style.left = x + 'px';
        tooltip.style.top = y + 'px';
    }
});

stImg.onerror = function() { this.src = 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/af/Spb_metro_logo.svg/200px-Spb_metro_logo.svg.png'; };