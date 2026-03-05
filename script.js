// State
let items = [];
let currentListId = null;
let editingItemId = null;

// Elements
const body = document.body;
const themeToggleBtn = document.getElementById('themeToggle');
const menuBtn = document.getElementById('menuBtn');
const optionsMenu = document.getElementById('optionsMenu');

// Form
const storeNameInput = document.getElementById('storeName');
const purchaseDateInput = document.getElementById('purchaseDate');
const productNameInput = document.getElementById('productName');
const quantityInput = document.getElementById('quantity');
const unitInput = document.getElementById('unit');
const unitPriceInput = document.getElementById('unitPrice');
const totalPriceInput = document.getElementById('totalPrice');
const addItemBtn = document.getElementById('addItemBtn');
const feedbackMessage = document.getElementById('feedbackMessage');
const listContainer = document.getElementById('listContainer');

// Summaries
const waitingCountEl = document.getElementById('waitingCount');
const waitingTotalEl = document.getElementById('waitingTotal');
const boughtCountEl = document.getElementById('boughtCount');
const boughtTotalEl = document.getElementById('boughtTotal');
const generalCountEl = document.getElementById('generalCount');
const generalTotalEl = document.getElementById('generalTotal');

// Menu Actions
const newListBtn = document.getElementById('newListBtn');
const saveListBtn = document.getElementById('saveListBtn');
const savedListsBtn = document.getElementById('savedListsBtn');
const importListBtn = document.getElementById('importListBtn');
const importXmlInput = document.getElementById('importXmlInput');

// Modals
const savedListsModal = document.getElementById('savedListsModal');
const closeSavedListsBtn = document.getElementById('closeSavedListsBtn');
const savedListsContainer = document.getElementById('savedListsContainer');

const exportModal = document.getElementById('exportModal');
const closeExportBtn = document.getElementById('closeExportBtn');

// Header Actions
const sortListBtn = document.getElementById('sortListBtn');
const scanBarcodeBtn = document.getElementById('scanBarcodeBtn');
const calendarBtn = document.getElementById('calendarBtn');
const calcBtn = document.getElementById('calcBtn');

// Header Sub-bar text
const headerItemCount = document.getElementById('headerItemCount');
const headerTotalValue = document.getElementById('headerTotalValue');

// Initialize
function init() {
    loadTheme();
    setDefaultDate();
    loadUnsavedState();
    setupEventListeners();
    updateUI();
}

function setDefaultDate() {
    if (!purchaseDateInput.value) {
        const today = new Date().toISOString().split('T')[0];
        purchaseDateInput.value = today;
    }
}

function setupEventListeners() {
    // Theme
    themeToggleBtn.addEventListener('click', toggleTheme);

    // Dropdown Menu
    menuBtn.addEventListener('click', (e) => {
        e.stopPropagation(); // prevent document click from closing it immediately
        toggleMenu();
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!optionsMenu.contains(e.target) && !menuBtn.contains(e.target)) {
            closeMenu();
        }
    });

    // Calculations
    quantityInput.addEventListener('input', calculateTotal);
    unitPriceInput.addEventListener('input', calculateTotal);

    // Add Item
    addItemBtn.addEventListener('click', handleAddItem);

    // Menu Options
    newListBtn.addEventListener('click', handleNewList);
    saveListBtn.addEventListener('click', handleSaveList);
    savedListsBtn.addEventListener('click', openSavedListsModal);
    if (importListBtn) {
        importListBtn.addEventListener('click', () => {
            closeMenu();
            importXmlInput.click();
        });
    }
    if (importXmlInput) importXmlInput.addEventListener('change', handleImportXml);

    // Modals
    closeSavedListsBtn.addEventListener('click', closeModals);
    closeExportBtn.addEventListener('click', closeModals);

    // Header Mock Actions
    if (sortListBtn) sortListBtn.addEventListener('click', sortListAlphabetically);
    if (scanBarcodeBtn) scanBarcodeBtn.addEventListener('click', () => showMessage('Funcionalidade de leitura de barras (Mock)', 'warning'));
    if (calendarBtn) calendarBtn.addEventListener('click', () => purchaseDateInput.showPicker && purchaseDateInput.showPicker());
    if (calcBtn) calcBtn.addEventListener('click', () => showMessage('Calculadora (Mock)', 'warning'));
}

// Theme Management
function toggleTheme() {
    body.classList.toggle('dark-theme');
    const isDark = body.classList.contains('dark-theme');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    themeToggleBtn.innerHTML = isDark ? '<i class="fa-solid fa-sun"></i>' : '<i class="fa-solid fa-moon"></i>';
}

function loadTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        body.classList.add('dark-theme');
        themeToggleBtn.innerHTML = '<i class="fa-solid fa-sun"></i>';
    } else {
        body.classList.remove('dark-theme');
        themeToggleBtn.innerHTML = '<i class="fa-solid fa-moon"></i>';
    }
}

// Menu Management
function toggleMenu() {
    optionsMenu.classList.toggle('hidden');
}

function closeMenu() {
    optionsMenu.classList.add('hidden');
}

function closeModals() {
    savedListsModal.classList.add('hidden');
    exportModal.classList.add('hidden');
}

// Core Logic
function calculateTotal() {
    const qty = parseFloat(quantityInput.value) || 0;
    const price = parseFloat(unitPriceInput.value) || 0;
    totalPriceInput.value = (qty * price).toFixed(2);
}

function showMessage(msg, type = 'success') {
    feedbackMessage.textContent = msg;
    feedbackMessage.className = `feedback-msg feedback-${type}`;
    feedbackMessage.classList.remove('hidden');
    setTimeout(() => {
        feedbackMessage.classList.add('hidden');
    }, 3000);
}

function handleAddItem() {
    const store = storeNameInput.value.trim();
    const date = purchaseDateInput.value;
    const name = productNameInput.value.trim();
    const qty = parseFloat(quantityInput.value);
    const unit = unitInput.value;
    const price = parseFloat(unitPriceInput.value) || 0;
    const total = parseFloat(totalPriceInput.value) || 0;

    if (!store || !date) {
        showMessage('Preencha o Nome do Empreendimento e Data.', 'error');
        return;
    }

    if (!name || isNaN(qty) || qty <= 0) {
        showMessage('Preencha o Nome do Produto e Quantidade corretamente.', 'error');
        return;
    }

    if (editingItemId) {
        // Update existing item
        const itemIndex = items.findIndex(item => item.id === editingItemId);
        if (itemIndex > -1) {
            items[itemIndex] = {
                ...items[itemIndex],
                name,
                qty,
                unit,
                price,
                total
            };
            showMessage('Item atualizado com sucesso!', 'success');
        }
        editingItemId = null;
        addItemBtn.textContent = 'Gravar Item';
    } else {
        // Create new item
        const newItem = {
            id: Date.now().toString(),
            name,
            qty,
            unit,
            price,
            total,
            bought: false
        };
        items.unshift(newItem);
        showMessage('Item gravado com sucesso!', 'success');
    }

    saveUnsavedState();

    // Clear inputs specific to the product
    productNameInput.value = '';
    quantityInput.value = '';
    unitPriceInput.value = '';
    totalPriceInput.value = '';
    productNameInput.focus();

    updateUI();
}

window.deleteItem = function (id) {
    items = items.filter(item => item.id !== id);
    if (editingItemId === id) {
        editingItemId = null;
        addItemBtn.textContent = 'Gravar Item';
        productNameInput.value = '';
        quantityInput.value = '';
        unitPriceInput.value = '';
        totalPriceInput.value = '';
    }
    saveUnsavedState();
    updateUI();
};

window.editItem = function (id) {
    const item = items.find(item => item.id === id);
    if (item) {
        editingItemId = id;
        productNameInput.value = item.name;
        quantityInput.value = item.qty;
        unitInput.value = item.unit;
        unitPriceInput.value = item.price || '';
        totalPriceInput.value = item.total;

        addItemBtn.textContent = 'Atualizar Item';
        productNameInput.focus();
        window.scrollTo({ top: productNameInput.offsetTop - 100, behavior: 'smooth' });
    }
};

window.toggleBought = function (id) {
    const item = items.find(item => item.id === id);
    if (item) {
        item.bought = !item.bought;
        saveUnsavedState();
        updateUI();
    }
};

// Format Currency
function formatCurrency(value) {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

// UI Update
function updateUI() {
    renderList();
    updateSummaries();
}

function renderList() {
    if (items.length === 0) {
        listContainer.innerHTML = '<div class="empty-state">Nenhum item adicionado ainda.</div>';
        return;
    }

    listContainer.innerHTML = '';
    items.forEach(item => {
        const itemEl = document.createElement('div');
        itemEl.className = 'list-item glass';
        itemEl.innerHTML = `
            <div class="item-info">
                <div class="item-name ${item.bought ? 'bought' : ''}">${item.name}</div>
                <div class="item-details">
                    ${item.qty} ${item.unit} ${item.price > 0 ? ` x ${formatCurrency(item.price)} = <strong>${formatCurrency(item.total)}</strong>` : ''}
                </div>
            </div>
            <div class="item-actions">
                <button class="icon-btn" onclick="editItem('${item.id}')" title="Editar">
                    <i class="fa-solid fa-pen"></i>
                </button>
                <button class="icon-btn toggle" data-bought="${item.bought}" onclick="toggleBought('${item.id}')" title="${item.bought ? 'Marcar como Pendente' : 'Marcar como Comprado'}">
                    <i class="fa-solid ${item.bought ? 'fa-circle-check' : 'fa-circle'}"></i>
                </button>
                <button class="icon-btn delete" onclick="deleteItem('${item.id}')" title="Excluir">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </div>
        `;
        listContainer.appendChild(itemEl);
    });
}

function updateSummaries() {
    const waitingItems = items.filter(i => !i.bought);
    const boughtItems = items.filter(i => i.bought);

    const waitingTotal = waitingItems.reduce((acc, curr) => acc + curr.total, 0);
    const boughtTotal = boughtItems.reduce((acc, curr) => acc + curr.total, 0);
    const generalTotal = items.reduce((acc, curr) => acc + curr.total, 0);

    waitingCountEl.textContent = waitingItems.length;
    waitingTotalEl.textContent = formatCurrency(waitingTotal);

    boughtCountEl.textContent = boughtItems.length;
    boughtTotalEl.textContent = formatCurrency(boughtTotal);

    generalCountEl.textContent = items.length;
    generalTotalEl.textContent = formatCurrency(generalTotal);

    if (headerItemCount) headerItemCount.textContent = items.length;
    if (headerTotalValue) headerTotalValue.textContent = formatCurrency(generalTotal);
}

function sortListAlphabetically() {
    if (items.length === 0) return;

    items.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR', { sensitivity: 'base' }));
    saveUnsavedState();
    updateUI();
    showMessage('Lista ordenada de A a Z!', 'success');
}

// Local Storage & Persistence
function saveUnsavedState() {
    const state = {
        store: storeNameInput.value,
        date: purchaseDateInput.value,
        items
    };
    localStorage.setItem('ag_shopping_current_list', JSON.stringify(state));
}

function loadUnsavedState() {
    const savedState = localStorage.getItem('ag_shopping_current_list');
    if (savedState) {
        try {
            const state = JSON.parse(savedState);
            if (state.store) storeNameInput.value = state.store;
            if (state.date) purchaseDateInput.value = state.date;
            if (state.items) items = state.items;
        } catch (e) {
            console.error('Error loading current list state');
        }
    }
}

function handleNewList() {
    if (items.length > 0 && !confirm('Tem certeza que deseja criar uma nova lista? Seus itens não salvos serão perdidos.')) {
        return;
    }

    items = [];
    storeNameInput.value = '';
    setDefaultDate();
    localStorage.removeItem('ag_shopping_current_list');
    updateUI();
    closeMenu();
}

function handleSaveList() {
    if (items.length === 0) {
        alert('Adicione itens à lista antes de salvar.');
        return;
    }
    if (!storeNameInput.value) {
        alert('Informe o Nome do Empreendimento antes de salvar.');
        return;
    }

    const listName = prompt('Nome para esta lista:', `Lista ${storeNameInput.value} - ${purchaseDateInput.value}`);
    if (!listName) return;

    let savedLists = JSON.parse(localStorage.getItem('ag_shopping_saved_lists') || '[]');

    // Check if updating currently loaded list or new
    const newList = {
        id: Date.now().toString(),
        name: listName,
        store: storeNameInput.value,
        date: purchaseDateInput.value,
        items: [...items],
        total: items.reduce((acc, curr) => acc + curr.total, 0)
    };

    savedLists.push(newList);
    localStorage.setItem('ag_shopping_saved_lists', JSON.stringify(savedLists));
    alert('Lista salva com sucesso!');
    closeMenu();
}

function openSavedListsModal() {
    closeMenu();
    let savedLists = JSON.parse(localStorage.getItem('ag_shopping_saved_lists') || '[]');

    if (savedLists.length === 0) {
        savedListsContainer.innerHTML = '<p class="empty-state">Nenhuma lista salva encontrada.</p>';
    } else {
        savedListsContainer.innerHTML = '';
        savedLists.forEach(list => {
            const listCard = document.createElement('div');
            listCard.className = 'saved-list-card glass';
            listCard.innerHTML = `
                <div>
                    <strong>${list.name}</strong>
                    <span style="font-size: 0.85rem; color: var(--text-muted); margin-top: 0.25rem;">
                        ${list.items.length} itens | ${formatCurrency(list.total)}
                    </span>
                </div>
                <div class="item-actions">
                    <button class="icon-btn" onclick="loadList('${list.id}')" title="Abrir Lista"><i class="fa-solid fa-folder-open"></i></button>
                    <button class="icon-btn" onclick="openExportModal('${list.id}')" title="Exportar"><i class="fa-solid fa-share-nodes"></i></button>
                    <button class="icon-btn delete" onclick="deleteSavedList('${list.id}')" title="Excluir"><i class="fa-solid fa-trash"></i></button>
                </div>
            `;
            savedListsContainer.appendChild(listCard);
        });
    }

    savedListsModal.classList.remove('hidden');
}

window.loadList = function (id) {
    if (items.length > 0 && !confirm('Isso vai substituir sua lista atual. Continuar?')) return;

    let savedLists = JSON.parse(localStorage.getItem('ag_shopping_saved_lists') || '[]');
    const targetList = savedLists.find(l => l.id === id);

    if (targetList) {
        items = [...targetList.items];
        storeNameInput.value = targetList.store;
        purchaseDateInput.value = targetList.date;
        saveUnsavedState();
        updateUI();
        closeModals();
        showMessage('Lista carregada.', 'success');
    }
};

window.deleteSavedList = function (id) {
    if (!confirm('Excluir esta lista salva?')) return;
    let savedLists = JSON.parse(localStorage.getItem('ag_shopping_saved_lists') || '[]');
    savedLists = savedLists.filter(l => l.id !== id);
    localStorage.setItem('ag_shopping_saved_lists', JSON.stringify(savedLists));
    openSavedListsModal(); // refresh
};

// Export Setup
let currentExportListId = null;

window.openExportModal = function (id) {
    currentExportListId = id;
    savedListsModal.classList.add('hidden'); // hide saved lists
    exportModal.classList.remove('hidden');
};

document.getElementById('exportTxtBtn').addEventListener('click', () => exportList('txt'));
document.getElementById('exportXmlBtn').addEventListener('click', () => exportList('xml'));
document.getElementById('exportPdfBtn').addEventListener('click', () => exportList('pdf'));

function exportList(format) {
    if (!currentExportListId) return;

    let savedLists = JSON.parse(localStorage.getItem('ag_shopping_saved_lists') || '[]');
    const list = savedLists.find(l => l.id === currentExportListId);

    if (!list) return;

    if (format === 'txt') {
        exportAsTxt(list);
    } else if (format === 'xml') {
        exportAsXml(list);
    } else if (format === 'pdf') {
        exportAsPdf(list);
    }

    closeModals();
}

function exportAsTxt(list) {
    let content = `=== ${list.name} ===\n`;
    content += `Empreendimento: ${list.store}\n`;
    content += `Data: ${list.date}\n\n`;

    content += `ITENS:\n`;
    list.items.forEach(i => {
        content += `- [${i.bought ? 'X' : ' '}] ${i.name}: ${i.qty} ${i.unit} (Total: ${formatCurrency(i.total)})\n`;
    });

    content += `\nTotal Geral: ${formatCurrency(list.total)}`;

    downloadFile(content, `lista_${list.id}.txt`, 'text/plain');
}

function exportAsXml(list) {
    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<shoppingList>\n`;
    xml += `  <name>${list.name}</name>\n`;
    xml += `  <store>${list.store}</store>\n`;
    xml += `  <date>${list.date}</date>\n`;
    xml += `  <total>${list.total}</total>\n`;
    xml += `  <items>\n`;

    list.items.forEach(i => {
        xml += `    <item>\n`;
        xml += `      <name>${i.name}</name>\n`;
        xml += `      <qty>${i.qty}</qty>\n`;
        xml += `      <unit>${i.unit}</unit>\n`;
        xml += `      <price>${i.price}</price>\n`;
        xml += `      <total>${i.total}</total>\n`;
        xml += `      <bought>${i.bought}</bought>\n`;
        xml += `    </item>\n`;
    });

    xml += `  </items>\n`;
    xml += `</shoppingList>`;

    downloadFile(xml, `lista_${list.id}.xml`, 'application/xml');
}
/*

function exportAsPdf(list) {
    const tempDiv = document.createElement('div');
    tempDiv.style.padding = '20px';
    tempDiv.style.fontFamily = 'Inter, sans-serif';
    tempDiv.style.color = '#1F2937';
    tempDiv.style.backgroundColor = '#FFFFFF';

    let html = `
        <h1 style="color: #4F46E5;">${list.name}</h1>
        <p><strong>Empreendimento:</strong> ${list.store}</p>
        <p><strong>Data:</strong> ${list.date}</p>
        <hr style="border: 1px solid #E5E7EB; margin: 15px 0;">
        <table style="width:100%; text-align:left; border-collapse: collapse;">
            <thead>
                <tr style="background:#F3F4F6;">
                    <th style="padding:10px; border-bottom:1px solid #D1D5DB;">Status</th>
                    <th style="padding:10px; border-bottom:1px solid #D1D5DB;">Produto</th>
                    <th style="padding:10px; border-bottom:1px solid #D1D5DB;">Qtd</th>
                    <th style="padding:10px; border-bottom:1px solid #D1D5DB;">Total</th>
                </tr>
            </thead>
            <tbody>
    `;

    list.items.forEach(i => {
        html += `
            <tr>
                <td style="padding:10px; border-bottom:1px solid #E5E7EB; color: ${i.bought ? '#10B981' : '#F59E0B'}">
                    ${i.bought ? '✓ Comprado' : '○ Pendente'}
                </td>
                <td style="padding:10px; border-bottom:1px solid #E5E7EB;">${i.name}</td>
                <td style="padding:10px; border-bottom:1px solid #E5E7EB;">${i.qty} ${i.unit}</td>
                <td style="padding:10px; border-bottom:1px solid #E5E7EB;">${formatCurrency(i.total)}</td>
            </tr>
        `;
    });

    html += `
            </tbody>
        </table>
        <h2 style="text-align: right; margin-top:20px; color: #1F2937;">Total: ${formatCurrency(list.total)}</h2>
    `;

    tempDiv.innerHTML = html;

    if (typeof html2pdf !== 'undefined') {
        const opt = {
            margin: 0.5,
            filename: `lista_${list.id}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
        };
        html2pdf().set(opt).from(tempDiv).save();
    } else {
        alert('Biblioteca PDF não carregada. Verifique sua conexão. Baixando como HTML alternativo.');
        downloadFile(tempDiv.innerHTML, `lista_${list.id}.html`, 'text/html');
    }
}
*/

function exportAsPdf(list) {
    // 1. Criar o contêiner do PDF
    const tempDiv = document.createElement('div');
    tempDiv.style.padding = '30px';
    tempDiv.style.fontFamily = 'Arial, sans-serif';
    tempDiv.style.color = '#333';
    tempDiv.style.backgroundColor = '#fff';

    // 2. Montar o HTML completo com TODOS os campos
    let html = `
        <h1 style="color: #4F46E5; text-align: center;">${list.name}</h1>
        <div style="border: 1px solid #ddd; padding: 10px; margin-bottom: 20px; border-radius: 5px;">
            <p><strong>Empreendimento:</strong> ${list.store}</p>
            <p><strong>Data:</strong> ${list.date}</p>
        </div>
        <table style="width:100%; border-collapse: collapse; margin-top: 10px;">
            <thead>
                <tr style="background-color: #f3f4f6;">
                    <th style="border: 1px solid #ddd; padding: 10px; text-align: left;">Status</th>
                    <th style="border: 1px solid #ddd; padding: 10px; text-align: left;">Produto</th>
                    <th style="border: 1px solid #ddd; padding: 10px; text-align: center;">Qtd</th>
                    <th style="border: 1px solid #ddd; padding: 10px; text-align: right;">Total</th>
                </tr>
            </thead>
            <tbody>
    `;

    // 3. Adicionar as linhas dos itens
    list.items.forEach(i => {
        const statusText = i.bought ? '✓ Comprado' : '○ Pendente';
        const statusColor = i.bought ? '#10B981' : '#F59E0B'; // Verde ou Laranja

        html += `
            <tr>
                <td style="border: 1px solid #ddd; padding: 10px; color: ${statusColor}; font-weight: bold;">${statusText}</td>
                <td style="border: 1px solid #ddd; padding: 10px;">${i.name}</td>
                <td style="border: 1px solid #ddd; padding: 10px; text-align: center;">${i.qty} ${i.unit}</td>
                <td style="border: 1px solid #ddd; padding: 10px; text-align: right;">${formatCurrency(i.total)}</td>
            </tr>
        `;
    });

    // 4. Finalizar a tabela e adicionar o total geral
    html += `
            </tbody>
        </table>
        <h2 style="text-align: right; margin-top: 30px; color: #1F2937;">
            Total Geral: ${formatCurrency(list.total)}
        </h2>
    `;

    tempDiv.innerHTML = html;

    // Adicionar temporariamente ao documento para renderizar
    document.body.appendChild(tempDiv);

    // 5. Gerar o PDF
    if (typeof html2pdf !== 'undefined') {
        const opt = {
            margin: 0.5,
            filename: `Lista_${list.store}_${list.date}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true },
            jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
        };

        html2pdf().set(opt).from(tempDiv).save().then(() => {
            // Limpar o documento
            document.body.removeChild(tempDiv);
        });
    } else {
        alert("Erro: Biblioteca PDF não carregada.");
        document.body.removeChild(tempDiv);
    }
}



function downloadFile(content, fileName, contentType) {
    const a = document.createElement('a');
    const file = new Blob([content], { type: contentType });
    a.href = URL.createObjectURL(file);
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(a.href);
}

// Import XML
function handleImportXml(event) {
    const file = event.target.files[0];
    if (!file) return;

    if (items.length > 0 && !confirm('A importação substituirá sua lista atual. Continuar?')) {
        event.target.value = '';
        return;
    }

    const reader = new FileReader();
    reader.onload = function (e) {
        const text = e.target.result;
        try {
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(text, "text/xml");

            const parserError = xmlDoc.getElementsByTagName("parsererror");
            if (parserError.length > 0) {
                showMessage('Arquivo XML inválido.', 'error');
                return;
            }

            const storeNode = xmlDoc.querySelector("shoppingList > store");
            const dateNode = xmlDoc.querySelector("shoppingList > date");
            const itemNodes = xmlDoc.querySelectorAll("shoppingList > items > item");

            if (!storeNode || !dateNode) {
                showMessage('XML sem dados básicos (Empreendimento/Data).', 'error');
                return;
            }

            storeNameInput.value = storeNode.textContent;
            purchaseDateInput.value = dateNode.textContent;

            items = [];
            itemNodes.forEach((node, index) => {
                const name = node.querySelector("name")?.textContent || '';
                const qty = parseFloat(node.querySelector("qty")?.textContent || 0);
                const unit = node.querySelector("unit")?.textContent || 'un';
                const price = parseFloat(node.querySelector("price")?.textContent || 0);
                const total = parseFloat(node.querySelector("total")?.textContent || 0);
                const boughtStr = node.querySelector("bought")?.textContent;
                const bought = boughtStr === 'true';

                items.push({
                    id: Date.now().toString() + index + Math.random().toString(36).substring(2, 9),
                    name,
                    qty,
                    unit,
                    price,
                    total,
                    bought
                });
            });

            saveUnsavedState();
            updateUI();
            showMessage('Lista importada com sucesso!', 'success');
        } catch (error) {
            console.error(error);
            showMessage('Erro ao ler o arquivo XML.', 'error');
        } finally {
            event.target.value = '';
        }
    };
    reader.readAsText(file);
}
// --- REGISTRO DO SERVICE WORKER ---
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js')
      .then(registration => {
        console.log('SW registrado com sucesso! Escopo:', registration.scope);
      })
      .catch(error => {
        console.log('Falha ao registrar o SW:', error);
      });
  });
}
// Start
init();

