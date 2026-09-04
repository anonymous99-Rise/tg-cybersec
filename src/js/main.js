// State
let channelsData = [];
let originalChannelsData = [];
let filteredData = [];
let currentLanguage = 'en';
let currentPage = 1;
let perPage = 50;
let statusFilter = 'all';

// Translations
const t = {
    en: {
        pageTitle: 'Telegram Cybersecurity Channels',
        headerSubtitle: 'A curated directory of cybersecurity channels on Telegram',
        searchPlaceholder: 'Search by name, tag, or keyword...',
        channelCount: '{count} channels',
        noChannels: 'No channels found',
        loadError: 'Error loading data',
        loading: 'Loading channels...',
        tableHeaders: ['Channel Name', 'Link', 'Status', 'Tags', 'Description'],
        statusLabels: { active: 'Active', inactive: 'Inactive', unknown: 'Unknown' },
        supportTitle: 'Support Options',
        options: ['Contribute to Updates', 'Star on GitHub', 'Send Feedback', 'Become a Sponsor'],
        sponsorshipTitle: 'Sponsorship',
        contactMe: 'Contact Me',
        tagsTitle: 'Channel Tags',
        showing: 'Showing {shown} of {total} channels',
        currentLang: 'English'
    },
    zh: {
        pageTitle: 'Telegram网络安全频道库',
        headerSubtitle: '精选 Telegram 网络安全频道目录',
        searchPlaceholder: '按名称、标签或关键词搜索...',
        channelCount: '{count} 个频道',
        noChannels: '未找到频道',
        loadError: '加载数据错误',
        loading: '加载中...',
        tableHeaders: ['频道名称', '链接', '状态', '标签', '描述'],
        statusLabels: { active: '活跃', inactive: '不活跃', unknown: '未知' },
        supportTitle: '支持选项',
        options: ['参与更新', '在 GitHub 上加星标', '发送反馈', '成为赞助商'],
        sponsorshipTitle: '赞助信息',
        contactMe: '联系我',
        tagsTitle: '频道标签',
        showing: '显示 {shown} / {total} 个频道',
        currentLang: '中文'
    }
};

document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

function initApp() {
    const stored = localStorage.getItem('language');
    if (stored && t[stored]) currentLanguage = stored;
    applyLanguage();
    initListeners();
    loadData();
}

function initListeners() {
    document.getElementById('searchInput').addEventListener('input', handleSearch);
    document.getElementById('statusFilter').addEventListener('change', e => {
        statusFilter = e.target.value;
        currentPage = 1;
        applyFilters();
    });
    document.getElementById('perPageFilter').addEventListener('change', e => {
        perPage = parseInt(e.target.value);
        currentPage = 1;
        applyFilters();
    });
    document.getElementById('languageButton').addEventListener('click', () => openModal('languageModal'));
    document.querySelectorAll('.language-option').forEach(btn => {
        btn.addEventListener('click', () => {
            currentLanguage = btn.dataset.lang;
            localStorage.setItem('language', currentLanguage);
            applyLanguage();
            closeModal('languageModal');
        });
    });
    document.getElementById('supportBtn').addEventListener('click', () => openModal('supportModal'));
    document.getElementById('contributeBtn').addEventListener('click', () => {
        closeModal('supportModal');
        window.open('https://github.com/anonymous99-Rise/tg-cybersec/edit/main/src/data/channels.md', '_blank');
    });
    document.getElementById('starBtn').addEventListener('click', () => window.open('https://github.com/anonymous99-Rise/tg-cybersec', '_blank'));
    document.getElementById('feedbackBtn').addEventListener('click', () => window.open('https://github.com/anonymous99-Rise/tg-cybersec/issues/new', '_blank'));
    document.getElementById('sponsorBtn').addEventListener('click', () => {
        closeModal('supportModal');
        openModal('sponsorshipModal');
    });
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', e => {
            if (e.target === overlay) closeModal(overlay.id);
        });
    });
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') document.querySelectorAll('.modal-overlay.active').forEach(m => closeModal(m.id));
    });
}

function loadData() {
    fetch('src/data/channels.json?' + Date.now())
        .then(r => r.json())
        .then(data => {
            channelsData = sortData(data);
            originalChannelsData = JSON.parse(JSON.stringify(channelsData));
            filteredData = JSON.parse(JSON.stringify(channelsData));
            updateCount(originalChannelsData.length);
            applyFilters();
        })
        .catch(err => {
            console.error(err);
            document.getElementById('tableBody').innerHTML = '<div class="channel-row" style="justify-content:center;padding:60px"><span style="color:var(--text-muted)">' + t[currentLanguage].loadError + '</span></div>';
        });
}

function applyFilters() {
    const term = document.getElementById('searchInput').value.trim().toLowerCase();
    filteredData = originalChannelsData.filter(ch => {
        if (statusFilter !== 'all' && ch.status !== statusFilter) return false;
        if (term) {
            const terms = term.split(',').map(s => s.trim()).filter(s => s);
            return terms.every(searchTerm => {
                return ch.name.toLowerCase().includes(searchTerm) ||
                    ch.link.toLowerCase().includes(searchTerm) ||
                    (ch.description || '').toLowerCase().includes(searchTerm) ||
                    (ch.tags || []).some(tag => tag.toLowerCase().includes(searchTerm));
            });
        }
        return true;
    });
    filteredData = sortData(filteredData);
    currentPage = 1;
    render();
    updatePagination();
    updateStats();
}

function handleSearch() {
    currentPage = 1;
    applyFilters();
}

function render() {
    const trans = t[currentLanguage];
    const body = document.getElementById('tableBody');
    if (!filteredData.length) {
        body.innerHTML = '<div class="channel-row" style="justify-content:center;padding:60px"><span style="color:var(--text-muted)">' + trans.noChannels + '</span></div>';
        return;
    }
    const start = (currentPage - 1) * perPage;
    const end = start + perPage;
    const page = filteredData.slice(start, end);
    body.innerHTML = page.map((ch, i) => {
        const idx = start + i;
        const statusClass = ch.status === 'Active' ? 'status-active' : ch.status === 'Inactive' ? 'status-inactive' : 'status-unknown';
        const statusLabel = trans.statusLabels[ch.status.toLowerCase()] || trans.statusLabels.unknown;
        const tags = (ch.tags || []).filter(tag => tag.toLowerCase() !== 'sponsored');
        const displayTags = tags.slice(0, 3);
        const extra = tags.length > 3 ? tags.length - 3 : 0;
        const tagsHtml = displayTags.map(tag => {
            let cls = 'tag';
            if (tag.match(/blue/i)) cls += ' tag-blue';
            else if (tag.match(/red/i)) cls += ' tag-red';
            else if (tag.match(/purple/i)) cls += ' tag-purple';
            else if (tag.match(/cyan/i)) cls += ' tag-cyan';
            return '<span class="' + cls + '">' + esc(tag) + '</span>';
        }).join('');
        const moreBtn = extra > 0 ? '<span class="tag more-tags" onclick="showTags(' + idx + ')">+' + extra + '</span>' : '';
        const linkDisplay = ch.link.includes('t.me/') ? '@' + ch.link.split('t.me/')[1] : ch.link;
        return '<div class="channel-row">' +
            '<div class="channel-name">' + esc(ch.name) + '</div>' +
            '<div class="channel-link"><i class="bi bi-telegram" style="color:var(--accent)"></i><a href="' + esc(ch.link) + '" target="_blank" rel="noopener">' + esc(linkDisplay) + '</a></div>' +
            '<div><span class="status-badge ' + statusClass + '">' + statusLabel + '</span></div>' +
            '<div class="tags-list">' + tagsHtml + moreBtn + '</div>' +
            '<div class="channel-desc">' + esc(ch.description || '') + '</div>' +
            '</div>';
    }).join('');
}

function updatePagination() {
    const totalPages = Math.ceil(filteredData.length / perPage);
    const pagination = document.getElementById('pagination');
    if (totalPages <= 1) { pagination.innerHTML = ''; return; }
    let html = '';
    html += '<button class="pagination-btn"' + (currentPage === 1 ? ' disabled' : '') + ' onclick="goTo(' + (currentPage - 1) + ')"><i class="bi bi-chevron-left"></i></button>';
    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= currentPage - 2 && i <= currentPage + 2)) {
            html += '<button class="pagination-btn' + (i === currentPage ? ' active' : '') + '" onclick="goTo(' + i + ')">' + i + '</button>';
        } else if (i === currentPage - 3 || i === currentPage + 3) {
            html += '<span class="pagination-ellipsis">...</span>';
        }
    }
    html += '<button class="pagination-btn"' + (currentPage === totalPages ? ' disabled' : '') + ' onclick="goTo(' + (currentPage + 1) + ')"><i class="bi bi-chevron-right"></i></button>';
    pagination.innerHTML = html;
}

function goTo(page) {
    const totalPages = Math.ceil(filteredData.length / perPage);
    if (page < 1 || page > totalPages) return;
    currentPage = page;
    render();
    updatePagination();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function showTags(idx) {
    const tags = (originalChannelsData[idx].tags || []).filter(tag => tag.toLowerCase() !== 'sponsored');
    const unique = [...new Set(tags)];
    document.getElementById('tagsContainer').innerHTML = unique.map(tag => {
        let cls = 'tag';
        if (tag.match(/blue/i)) cls += ' tag-blue';
        else if (tag.match(/red/i)) cls += ' tag-red';
        else if (tag.match(/purple/i)) cls += ' tag-purple';
        else if (tag.match(/cyan/i)) cls += ' tag-cyan';
        return '<span class="' + cls + '">' + esc(tag) + '</span>';
    }).join('');
    openModal('tagsModal');
}

function updateCount(count) {
    document.getElementById('channelCountText').textContent = t[currentLanguage].channelCount.replace('{count}', count);
}

function updateStats() {
    const el = document.getElementById('searchStats');
    const term = document.getElementById('searchInput').value.trim();
    if (term || statusFilter !== 'all') {
        el.textContent = t[currentLanguage].showing.replace('{shown}', filteredData.length).replace('{total}', originalChannelsData.length);
    } else {
        el.textContent = '';
    }
}

function applyLanguage() {
    const trans = t[currentLanguage];
    document.documentElement.lang = currentLanguage;
    document.getElementById('currentLang').textContent = trans.currentLang;
    document.title = trans.pageTitle;
    document.querySelector('.header-title').textContent = trans.pageTitle;
    document.querySelector('.header-subtitle').textContent = trans.headerSubtitle;
    document.getElementById('searchInput').placeholder = trans.searchPlaceholder;
    const headers = document.querySelectorAll('.table-header > div');
    trans.tableHeaders.forEach((h, i) => { if (headers[i]) headers[i].textContent = h; });
    document.querySelectorAll('.support-option').forEach((opt, i) => { opt.innerHTML = '<i class="bi bi-' + ['pencil-square', 'star', 'chat-left-text', 'gem'][i] + '"></i>' + trans.options[i]; });
    document.getElementById('supportModal').querySelector('.modal-title').textContent = trans.supportTitle;
    document.getElementById('sponsorshipModal').querySelector('.modal-title').textContent = trans.sponsorshipTitle;
    document.getElementById('tagsModal').querySelector('.modal-title').textContent = trans.tagsTitle;
    document.querySelectorAll('.language-option').forEach(btn => btn.classList.toggle('active', btn.dataset.lang === currentLanguage));
    updateCount(originalChannelsData.length);
    updateStats();
}

function sortData(data) {
    const sponsored = data.filter(ch => (ch.tags || []).some(tag => tag.toLowerCase() === 'sponsored'));
    const others = data.filter(ch => !(ch.tags || []).some(tag => tag.toLowerCase() === 'sponsored'));
    for (let i = others.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [others[i], others[j]] = [others[j], others[i]];
    }
    return [...sponsored, ...others];
}

function openModal(id) { document.getElementById(id).classList.add('active'); document.body.style.overflow = 'hidden'; }
function closeModal(id) { document.getElementById(id).classList.remove('active'); document.body.style.overflow = ''; }
function esc(s) {
    if (s == null) return '';
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}
