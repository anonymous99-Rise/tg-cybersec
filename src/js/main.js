// State
let channelsData = [];
let originalChannelsData = [];
let searchTimeout = null;
let currentLanguage = 'en';

// Translations
const translations = {
    en: {
        pageTitle: 'Telegram Cybersecurity Channels',
        headerSubtitle: 'A curated directory of cybersecurity channels on Telegram',
        searchPlaceholder: 'Search by name, tag, or keyword...',
        channelCount: '{count} channels',
        noResults: 'No results for "{term}"',
        noChannels: 'No channels found',
        loadError: 'Error loading data',
        loading: 'Loading channels...',
        tableHeaders: { name: 'Channel Name', link: 'Link', status: 'Status', tags: 'Tags', description: 'Description' },
        statusLabels: { active: 'Active', inactive: 'Inactive', unknown: 'Unknown' },
        supportTitle: 'Support Options',
        options: { contribute: 'Contribute to Updates', star: 'Star on GitHub', feedback: 'Send Feedback', sponsor: 'Become a Sponsor' },
        sponsorshipTitle: 'Sponsorship',
        sponsorshipInfo: 'If you have a Telegram channel related to cybersecurity, you can become a sponsor to have your channel displayed at the top of the table and your brand name shown as a sponsor in the website footer.',
        contactMe: 'Contact Me',
        tagsTitle: 'Channel Tags',
        successTitle: 'Success',
        errorTitle: 'Error',
        successMsg: 'Operation completed successfully',
        errorMsg: 'An error occurred',
        showingResults: 'Showing {shown} of {total} channels',
        currentLang: 'English'
    },
    zh: {
        pageTitle: 'Telegram网络安全频道库',
        headerSubtitle: '精选 Telegram 网络安全频道目录',
        searchPlaceholder: '按名称、标签或关键词搜索...',
        channelCount: '{count} 个频道',
        noResults: '未找到"{term}"的结果',
        noChannels: '未找到频道',
        loadError: '加载数据错误',
        loading: '加载中...',
        tableHeaders: { name: '频道名称', link: '链接', status: '状态', tags: '标签', description: '描述' },
        statusLabels: { active: '活跃', inactive: '不活跃', unknown: '未知' },
        supportTitle: '支持选项',
        options: { contribute: '参与更新', star: '在 GitHub 上加星标', feedback: '发送反馈', sponsor: '成为赞助商' },
        sponsorshipTitle: '赞助信息',
        sponsorshipInfo: '如果您有与网络安全相关的Telegram频道，您可以成为赞助商，让您的频道显示在表格顶部，并在网站页脚显示您的品牌名称作为赞助商。',
        contactMe: '联系我',
        tagsTitle: '频道标签',
        successTitle: '成功',
        errorTitle: '错误',
        successMsg: '操作成功完成',
        errorMsg: '发生错误',
        showingResults: '显示 {shown} / {total} 个频道',
        currentLang: '中文'
    }
};

// DOM ready
document.addEventListener('DOMContentLoaded', () => {
    initLanguage();
    initEventListeners();
    loadChannelsData();
});

// Initialize language
function initLanguage() {
    const stored = localStorage.getItem('language');
    if (stored && translations[stored]) {
        currentLanguage = stored;
    }
    applyLanguage();
}

// Initialize event listeners
function initEventListeners() {
    // Search
    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('input', handleSearch);
    searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            searchInput.blur();
        }
    });

    // Language button
    document.getElementById('languageButton').addEventListener('click', () => openModal('languageModal'));

    // Language options
    document.querySelectorAll('.language-option').forEach(btn => {
        btn.addEventListener('click', () => {
            const lang = btn.dataset.lang;
            changeLanguage(lang);
            closeModal('languageModal');
        });
    });

    // Support button
    document.getElementById('supportBtn').addEventListener('click', () => openModal('supportModal'));

    // Support options
    document.getElementById('contributeBtn').addEventListener('click', () => {
        closeModal('supportModal');
        window.open('https://github.com/anonymous99-Rise/tg-cybersec/edit/main/src/data/channels.md', '_blank');
    });
    document.getElementById('starBtn').addEventListener('click', () => {
        window.open('https://github.com/anonymous99-Rise/tg-cybersec', '_blank');
    });
    document.getElementById('feedbackBtn').addEventListener('click', () => {
        window.open('https://github.com/anonymous99-Rise/tg-cybersec/issues/new', '_blank');
    });
    document.getElementById('sponsorBtn').addEventListener('click', () => {
        closeModal('supportModal');
        openModal('sponsorshipModal');
    });

    // Close modals on overlay click
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                closeModal(overlay.id);
            }
        });
    });

    // Close modals on Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            document.querySelectorAll('.modal-overlay.active').forEach(m => closeModal(m.id));
        }
    });
}

// Modal functions
function openModal(id) {
    document.getElementById(id).classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModal(id) {
    document.getElementById(id).classList.remove('active');
    document.body.style.overflow = '';
}

// Language functions
function changeLanguage(lang) {
    if (translations[lang]) {
        currentLanguage = lang;
        localStorage.setItem('language', lang);
        applyLanguage();
    }
}

function applyLanguage() {
    const t = translations[currentLanguage];

    // Update lang attribute
    document.documentElement.lang = currentLanguage;

    // Update header
    document.getElementById('currentLang').textContent = t.currentLang;
    document.title = t.pageTitle;
    document.querySelector('.header-title').textContent = t.pageTitle;
    document.querySelector('.header-subtitle').textContent = t.headerSubtitle;

    // Update search
    document.getElementById('searchInput').placeholder = t.searchPlaceholder;

    // Update table headers
    const headers = document.querySelectorAll('.table-header > div');
    if (headers.length === 5) {
        headers[0].textContent = t.tableHeaders.name;
        headers[1].textContent = t.tableHeaders.link;
        headers[2].textContent = t.tableHeaders.status;
        headers[3].textContent = t.tableHeaders.tags;
        headers[4].textContent = t.tableHeaders.description;
    }

    // Update modals
    document.getElementById('languageModal').querySelector('.modal-title').textContent = t.tableHeaders ? 'Select Language' : 'Select Language';
    document.getElementById('supportModal').querySelector('.modal-title').textContent = t.supportTitle;
    document.getElementById('sponsorshipModal').querySelector('.modal-title').textContent = t.sponsorshipTitle;
    document.getElementById('tagsModal').querySelector('.modal-title').textContent = t.tagsTitle;

    // Update support options
    const supportOptions = document.querySelectorAll('.support-option');
    supportOptions[0].innerHTML = `<i class="bi bi-pencil-square"></i>${t.options.contribute}`;
    supportOptions[1].innerHTML = `<i class="bi bi-star"></i>${t.options.star}`;
    supportOptions[2].innerHTML = `<i class="bi bi-chat-left-text"></i>${t.options.feedback}`;
    supportOptions[3].innerHTML = `<i class="bi bi-gem"></i>${t.options.sponsor}`;

    // Update active language button
    document.querySelectorAll('.language-option').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.lang === currentLanguage);
    });

    // Update channel count
    updateChannelCount(originalChannelsData.length);

    // Update search stats
    updateSearchStats();

    // Re-render table if data exists
    if (channelsData.length > 0) {
        renderTable();
    }
}

// Load channels data
function loadChannelsData() {
    fetch('src/data/channels.json?' + Date.now())
        .then(res => {
            if (!res.ok) throw new Error('Failed to load');
            return res.json();
        })
        .then(data => {
            channelsData = sortChannelsByLink(data);
            originalChannelsData = JSON.parse(JSON.stringify(channelsData));
            updateChannelCount(originalChannelsData.length);
            renderTable();
        })
        .catch(err => {
            console.error(err);
            showToast(translations[currentLanguage].loadError, 'error');
        });
}

// Render table
function renderTable() {
    const t = translations[currentLanguage];
    const tableBody = document.getElementById('tableBody');

    if (!channelsData.length) {
        tableBody.innerHTML = `
            <div class="channel-row" style="justify-content:center;padding:60px 20px;">
                <span style="color:var(--text-muted)">${t.noChannels}</span>
            </div>
        `;
        return;
    }

    tableBody.innerHTML = channelsData.map((ch, idx) => {
        const statusClass = ch.status === 'Active' ? 'status-active' : ch.status === 'Inactive' ? 'status-inactive' : 'status-unknown';
        const statusLabel = ch.status === 'Active' ? t.statusLabels.active : ch.status === 'Inactive' ? t.statusLabels.inactive : t.statusLabels.unknown;

        const tags = (ch.tags || []).filter(tag => tag.toLowerCase() !== 'sponsored');
        const displayTags = tags.slice(0, 3);
        const extraTags = tags.length > 3 ? tags.length - 3 : 0;

        const tagsHtml = displayTags.map(tag => {
            let tagClass = 'tag';
            if (tag.toLowerCase().includes('blue')) tagClass += ' tag-blue';
            else if (tag.toLowerCase().includes('red')) tagClass += ' tag-red';
            else if (tag.toLowerCase().includes('purple')) tagClass += ' tag-purple';
            else if (tag.toLowerCase().includes('cyan')) tagClass += ' tag-cyan';
            return `<span class="${tagClass}">${escapeHtml(tag)}</span>`;
        }).join('');

        const moreTagsBtn = extraTags > 0 ? `<span class="tag more-tags" onclick="showAllTags(${idx})">+${extraTags}</span>` : '';

        const linkDisplay = ch.link.includes('t.me/') ? '@' + ch.link.split('t.me/')[1] : ch.link;

        return `
            <div class="channel-row">
                <div class="channel-name">${escapeHtml(ch.name)}</div>
                <div class="channel-link">
                    <i class="bi bi-telegram" style="color:var(--accent)"></i>
                    <a href="${escapeHtml(ch.link)}" target="_blank" rel="noopener">${escapeHtml(linkDisplay)}</a>
                </div>
                <div>
                    <span class="status-badge ${statusClass}">${statusLabel}</span>
                </div>
                <div class="tags-list">${tagsHtml}${moreTagsBtn}</div>
                <div class="channel-desc">${escapeHtml(ch.description || '')}</div>
            </div>
        `;
    }).join('');
}

// Search handler
function handleSearch() {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
        const term = document.getElementById('searchInput').value.trim().toLowerCase();
        filterChannels(term);
    }, 200);
}

// Filter channels
function filterChannels(term) {
    if (!term) {
        channelsData = JSON.parse(JSON.stringify(originalChannelsData));
        channelsData = sortChannelsByLink(channelsData);
        renderTable();
        updateSearchStats();
        return;
    }

    const terms = term.includes(',') ? term.split(',').map(t => t.trim()).filter(t => t) : [term];

    channelsData = originalChannelsData.filter(ch => {
        return terms.every(t => {
            const nameMatch = ch.name.toLowerCase().includes(t);
            const linkMatch = ch.link.toLowerCase().includes(t);
            const descMatch = (ch.description || '').toLowerCase().includes(t);
            const tagMatch = (ch.tags || []).some(tag => tag.toLowerCase().includes(t));
            return nameMatch || linkMatch || descMatch || tagMatch;
        });
    });

    channelsData = sortChannelsByLink(channelsData);
    renderTable();
    updateSearchStats();
}

// Update channel count
function updateChannelCount(count) {
    const t = translations[currentLanguage];
    document.getElementById('channelCountText').textContent = t.channelCount.replace('{count}', count);
}

// Update search stats
function updateSearchStats() {
    const t = translations[currentLanguage];
    const searchStats = document.getElementById('searchStats');
    const term = document.getElementById('searchInput').value.trim();

    if (term) {
        searchStats.textContent = t.showingResults.replace('{shown}', channelsData.length).replace('{total}', originalChannelsData.length);
    } else {
        searchStats.textContent = '';
    }
}

// Sort channels (sponsored first, then shuffled)
function sortChannelsByLink(channels) {
    const sponsored = channels.filter(ch => (ch.tags || []).some(tag => tag.toLowerCase() === 'sponsored'));
    const others = channels.filter(ch => !(ch.tags || []).some(tag => tag.toLowerCase() === 'sponsored'));

    // Fisher-Yates shuffle
    for (let i = others.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [others[i], others[j]] = [others[j], others[i]];
    }

    return [...sponsored, ...others];
}

// Show all tags in modal
function showAllTags(channelIdx) {
    const tags = channelsData[channelIdx].tags || [];
    const uniqueTags = [...new Set(tags)].filter(tag => tag.toLowerCase() !== 'sponsored');

    const container = document.getElementById('tagsContainer');
    container.innerHTML = uniqueTags.map(tag => {
        let tagClass = 'tag';
        if (tag.toLowerCase().includes('blue')) tagClass += ' tag-blue';
        else if (tag.toLowerCase().includes('red')) tagClass += ' tag-red';
        else if (tag.toLowerCase().includes('purple')) tagClass += ' tag-purple';
        else if (tag.toLowerCase().includes('cyan')) tagClass += ' tag-cyan';
        return `<span class="${tagClass}">${escapeHtml(tag)}</span>`;
    }).join('');

    openModal('tagsModal');
}

// Toast notification
function showToast(message, type = 'success') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <i class="bi bi-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
        <span>${escapeHtml(message)}</span>
    `;
    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(20px)';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Escape HTML
function escapeHtml(unsafe) {
    if (unsafe === undefined || unsafe === null) return '';
    return String(unsafe)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}
