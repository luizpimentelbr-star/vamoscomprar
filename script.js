document.addEventListener('DOMContentLoaded', () => {
    // --- VARIÁVEIS GLOBAIS E SELETORES DO DOM ---
    const elements = {
        editItemModal: document.getElementById('edit-item-modal'),
        editProductName: document.getElementById('edit-product-name'),
        editQuantity: document.getElementById('edit-quantity'),
        editUnit: document.getElementById('edit-unit'),
        editUnitValue: document.getElementById('edit-unit-value'),
        editTotalValue: document.getElementById('edit-total-value'),
        editForm: document.getElementById('edit-item-form'),
        cancelEditBtn: document.getElementById('cancel-edit'),
            
        // Formulários e Campos
        listForm: document.getElementById('list-form'),
        itemForm: document.getElementById('item-form'),
        storeNameInput: document.getElementById('store-name'),
        purchaseDateInput: document.getElementById('purchase-date'),
        productNameInput: document.getElementById('product-name'),
        quantityInput: document.getElementById('quantity'),
        unitSelect: document.getElementById('unit'),
        unitValueInput: document.getElementById('unit-value'),
        totalValueInput: document.getElementById('total-value'),

        // Botões de Ação
        newListBtn: document.getElementById('new-list-btn'),
        saveListBtn: document.getElementById('save-list-btn'),
        viewSavedBtn: document.getElementById('view-saved-btn'),
        barcodeButton: document.getElementById('barcode-button'),
        calcButton: document.getElementById('calc-button'),

        // Listas e Resumos
        itemsList: document.getElementById('items-list'),
        totalGeneral: document.getElementById('total-general'),
        totalPending: document.getElementById('total-pending'),
        totalChecked: document.getElementById('total-checked'),

        // Modais
        savedListsModal: document.getElementById('saved-lists-modal'),
        shareModal: document.getElementById('share-modal'),
        calculatorModal: document.getElementById('calculator-modal'),
        barcodeModal: document.getElementById('barcode-modal'),
        
        // Botões de fechar modal
        closeButtons: document.querySelectorAll('.close-button'),

        // Conteúdos de Modais
        savedListsContainer: document.getElementById('saved-lists-container'),
        shareListName: document.getElementById('share-list-name'),
        
        // Funcionalidades Especiais
        themeToggle: document.getElementById('theme-toggle'),
        calcDisplay: document.getElementById('calc-display'),
        startScanBtn: document.getElementById('start-barcode-scan'),
        stopScanBtn: document.getElementById('stop-barcode-scan'),
        barcodeResult: document.getElementById('barcode-result'),
        barcodeVideo: document.getElementById('barcode-video'),
    };

    // --- ESTADO DA APLICAÇÃO ---
    let currentList = {
        id: null, // Usado para listas carregadas
        storeName: '',
        purchaseDate: '',
        items: []
    };
    let codeReader = null;
    let currentListIdToShare = null;

    let editingItemId = null;

    // --- INICIALIZAÇÃO ---
    function initializeApp() {
        setInitialDateTime();
        setupEventListeners();
        loadTheme();
        renderItems(); // Renderiza a lista inicial (vazia)
    }

    // --- CONFIGURAÇÃO DE EVENT LISTENERS ---
    function setupEventListeners() {
        // Formulários
        elements.itemForm.addEventListener('submit', handleAddItem);
        elements.listForm.addEventListener('input', updateCurrentListData);

        // Botões de Ação
        elements.newListBtn.addEventListener('click', createNewList);
        elements.saveListBtn.addEventListener('click', saveList);
        elements.viewSavedBtn.addEventListener('click', showSavedListsModal);
        elements.barcodeButton.addEventListener('click', showBarcodeModal);
        elements.calcButton.addEventListener('click', showCalculatorModal);

        // Modais
        elements.closeButtons.forEach(btn => {
            btn.addEventListener('click', () => btn.closest('.modal').style.display = 'none');
        });
        window.addEventListener('click', (event) => {
            if (event.target.classList.contains('modal')) {
                event.target.style.display = 'none';
            }
        });

        // Funcionalidades Especiais
        elements.themeToggle.addEventListener('click', toggleTheme);
        setupCalculator();
        setupBarcodeScanner();

        // Campos com cálculo automático
        elements.quantityInput.addEventListener('input', calculateTotalValue);
        elements.unitValueInput.addEventListener('input', calculateTotalValue);
    }

    // --- FUNÇÕES DO FORMULÁRIO E ITENS ---
    function setInitialDateTime() {
        const now = new Date();
        now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
        elements.purchaseDateInput.value = now.toISOString().slice(0, 16);
    }

    function handleAddItem(event) {
        event.preventDefault();
        const productName = elements.productNameInput.value.trim();
        if (!productName) {
            showFriendlyMessage('Por favor, preencha o nome do produto.', 'error');
            return;
        }

        const newItem = {
            id: Date.now(), // ID único e simples
            name: productName,
            quantity: parseFloat(elements.quantityInput.value),
            unit: elements.unitSelect.value,
            unitValue: parseFloat(elements.unitValueInput.value) || 1,
            totalValue: 0,
            checked: false
        };
        newItem.totalValue = newItem.quantity * newItem.unitValue;

        currentList.items.push(newItem);
        renderItems();
        clearItemForm();
        showFriendlyMessage(`"${newItem.name}" adicionado à lista!`, 'success');
    }
    
    function clearItemForm() {
        elements.itemForm.reset();
        elements.quantityInput.value = '1';
        calculateTotalValue(); // Reseta o valor total para 0.00
    }

    function calculateTotalValue() {
        const quantity = parseFloat(elements.quantityInput.value) || 1;
        const unitValue = parseFloat(elements.unitValueInput.value) || 1;
        const total = quantity * unitValue;
        elements.totalValueInput.value = total.toFixed(2);
    }

    function deleteItem(itemId) {
        currentList.items = currentList.items.filter(item => item.id !== itemId);
        renderItems();
        showFriendlyMessage('Item removido da lista.', 'info');
    }

    function toggleItemCheck(itemId) {
        const item = currentList.items.find(i => i.id === itemId);
        if (item) {
            item.checked = !item.checked;
            renderItems();
        }
    }

    /*

    function renderItems() {
        elements.itemsList.innerHTML = '';
        if (currentList.items.length === 0) {
            elements.itemsList.innerHTML = '<p>Sua lista está vazia. Adicione um item para começar!</p>';
            updateTotals();
            return;
        }

        currentList.items.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.className = `item ${item.checked ? 'checked' : ''}`;
            itemElement.innerHTML = `
                <input type="checkbox" class="item-checkbox" ${item.checked ? 'checked' : ''} data-id="${item.id}">
                <div class="item-info">
                    <div class="product-name editable" data-id="${item.id}" title="Clique para editar">${item.name}</div>

                    <div class="product-details">
                        ${item.quantity} ${item.unit} x R$ ${item.unitValue.toFixed(2)} = R$ ${item.totalValue.toFixed(2)}
                    </div>
                </div>
                <div class="item-actions">
                    <span class="material-symbols-outlined item-delete" data-id="${item.id}">delete</span>
                </div>
            `;
            elements.itemsList.appendChild(itemElement);
        });

        // Adicionar listeners aos novos itens
       // document.querySelectorAll('.item-checkbox').forEach(checkbox => {
       //     checkbox.addEventListener('change', (e) => toggleItemCheck(parseInt(e.target.dataset.id)));
       // });
      
      document.querySelectorAll('.product-name.editable').forEach(nameEl => {
         nameEl.addEventListener('click', () => {
        const itemId = parseInt(nameEl.dataset.id);
        openEditItemModal(itemId);
         });
        });
      
       document.querySelectorAll('.item-delete').forEach(btn => {
            btn.addEventListener('click', (e) => deleteItem(parseInt(e.target.dataset.id)));
        });

        updateTotals();
    }
---------------------------------------------------

function renderItems() {
    elements.itemsList.innerHTML = '';
    
    if (currentList.items.length === 0) {
        elements.itemsList.innerHTML = '<p>Sua lista está vazia. Adicione um item para começar!</p>';
        updateTotals();
        return;
    }

    currentList.items.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.className = `item ${item.checked ? 'checked' : ''}`;
        itemElement.innerHTML = `
           
           <input type="checkbox" class="item-checkbox" name="item-check" ${item.checked ? 'checked' : ''} data-id="${item.id}">
            
                <div class="product-details">
                    ${item.quantity} ${item.unit} x R$ ${item.unitValue.toFixed(2)} = R$ ${item.totalValue.toFixed(2)}
                </div>
            </div>
            <div class="item-actions">
                <span class="material-symbols-outlined item-delete" data-id="${item.id}">delete</span>
            </div>
        `;
        elements.itemsList.appendChild(itemElement);
    });

    // ← Aqui: listeners para os elementos recém-criados
    document.querySelectorAll('.item-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', (e) => {
            const itemId = parseInt(e.target.dataset.id);
            toggleItemCheck(itemId);
        });
    });

    document.querySelectorAll('.product-name.editable').forEach(nameEl => {
        nameEl.addEventListener('click', () => {
            const itemId = parseInt(nameEl.dataset.id);
            openEditItemModal(itemId);
        });
    });

    document.querySelectorAll('.item-delete').forEach(btn => {
        btn.addEventListener('click', (e) => {
            deleteItem(parseInt(e.target.dataset.id));
        });
    });

    updateTotals();
}

*/

function renderItems() {
    elements.itemsList.innerHTML = '';
    
    if (currentList.items.length === 0) {
        elements.itemsList.innerHTML = '<p>Sua lista está vazia. Adicione um item para começar!</p>';
        updateTotals();
        return;
    }

    currentList.items.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.className = `item ${item.checked ? 'checked' : ''}`;
        itemElement.innerHTML = `
            <input type="checkbox" class="item-checkbox" ${item.checked ? 'checked' : ''} data-id="${item.id}">
            <div class="product-details">
                ${item.quantity} ${item.unit} x R$ ${item.unitValue.toFixed(2)} = R$ ${item.totalValue.toFixed(2)}
            </div>
            <div class="item-actions">
                <span class="material-symbols-outlined item-edit" data-id="${item.id}" title="Editar">create</span>
                <span class="material-symbols-outlined item-delete" data-id="${item.id}" title="Excluir">delete</span>
            </div>
        `;
        elements.itemsList.appendChild(itemElement);
    });

    // Listeners para os elementos recém-criados
    document.querySelectorAll('.item-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', (e) => {
            const itemId = parseInt(e.target.dataset.id);
            toggleItemCheck(itemId);
        });
    });

    document.querySelectorAll('.item-edit').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const itemId = parseInt(e.target.dataset.id);
            openEditItemModal(itemId); // abre o modal de edição
        });
    });

    document.querySelectorAll('.item-delete').forEach(btn => {
        btn.addEventListener('click', (e) => {
            deleteItem(parseInt(e.target.dataset.id));
        });
    });

    updateTotals();
}

    function updateTotals() {
        const totals = currentList.items.reduce(
            (acc, item) => {
                const total = item.totalValue;
                acc.general += total;
                if (item.checked) {
                    acc.checked += total;
                } else {
                    acc.pending += total;
                }
                return acc;
            },
            { general: 0, pending: 0, checked: 0 }
        );

        elements.totalGeneral.textContent = `R$ ${totals.general.toFixed(2)}`;
        elements.totalPending.textContent = `R$ ${totals.pending.toFixed(2)}`;
        elements.totalChecked.textContent = `R$ ${totals.checked.toFixed(2)}`;
    }

    // --- SISTEMA DE ARQUIVOS (LISTAS) ---
    function updateCurrentListData() {
        currentList.storeName = elements.storeNameInput.value;
        currentList.purchaseDate = elements.purchaseDateInput.value;
    }

    function createNewList() {
        if (confirm('Criar uma nova lista irá descartar os dados não salvos da lista atual. Deseja continuar?')) {
            currentList = { id: null, storeName: '', purchaseDate: '', items: [] };
            elements.listForm.reset();
            clearItemForm();
            setInitialDateTime();
            renderItems();
            showFriendlyMessage('Nova lista criada.', 'success');
        }
    }

    function saveList() {
        updateCurrentListData();
        if (!currentList.storeName) {
            showFriendlyMessage('O nome do empreendimento é obrigatório para salvar.', 'error');
            elements.storeNameInput.focus();
            return;
        }
        if (currentList.items.length === 0) {
            showFriendlyMessage('Não é possível salvar uma lista vazia.', 'error');
            return;
        }

        const listToSave = { ...currentList };
        if (!listToSave.id) {
            listToSave.id = `list_${Date.now()}`;
        }
        
        const savedLists = getSavedListsFromStorage();
        savedLists[listToSave.id] = listToSave;
        localStorage.setItem('shoppingLists', JSON.stringify(savedLists));
        
        currentList.id = listToSave.id; // Atualiza o ID da lista atual
        showFriendlyMessage(`Lista "${listToSave.storeName}" salva com sucesso!`, 'success');
    }

    function getSavedListsFromStorage() {
        const lists = localStorage.getItem('shoppingLists');
        return lists ? JSON.parse(lists) : {};
    }

    function showSavedListsModal() {
        const savedLists = getSavedListsFromStorage();
        elements.savedListsContainer.innerHTML = '';

        if (Object.keys(savedLists).length === 0) {
            elements.savedListsContainer.innerHTML = '<p>Nenhuma lista salva encontrada.</p>';
        } else {
            // Ordena listas pela data da mais recente para a mais antiga
            const sortedLists = Object.values(savedLists).sort((a, b) => new Date(b.purchaseDate) - new Date(a.purchaseDate));
            sortedLists.forEach(list => {
                const grandTotal = list.items.reduce((sum, item) => sum + item.totalValue, 0);
                const listElement = document.createElement('div');
                listElement.className = 'saved-list';
                listElement.innerHTML = `
                    <div class="saved-list-info">
                        <strong>${list.storeName}</strong>
                        <div>Data: ${new Date(list.purchaseDate).toLocaleString('pt-BR')}</div>
                        <div>Total: R$ ${grandTotal.toFixed(2)}</div>
                    </div>
                    <div class="saved-list-actions">
                        <button class="btn btn-primary open-list-btn" data-id="${list.id}">Abrir</button>
                        <button class="btn btn-secondary share-list-btn" data-id="${list.id}">Compartilhar</button>
                        <button class="btn btn-secondary delete-list-btn" data-id="${list.id}">Excluir</button>
                    </div>
                `;
                elements.savedListsContainer.appendChild(listElement);
            });

            // Adicionar listeners aos botões das listas
            elements.savedListsContainer.querySelectorAll('.open-list-btn').forEach(btn => {
                btn.addEventListener('click', (e) => loadList(e.target.dataset.id));
            });
            elements.savedListsContainer.querySelectorAll('.share-list-btn').forEach(btn => {
                btn.addEventListener('click', (e) => showShareModal(e.target.dataset.id));
            });
            elements.savedListsContainer.querySelectorAll('.delete-list-btn').forEach(btn => {
                btn.addEventListener('click', (e) => deleteList(e.target.dataset.id));
            });
        }
        elements.savedListsModal.style.display = 'block';
    }

    function loadList(listId) {
        const savedLists = getSavedListsFromStorage();
        const list = savedLists[listId];
        if (list) {
            currentList = JSON.parse(JSON.stringify(list)); // Cria uma cópia profunda
            elements.storeNameInput.value = currentList.storeName;
            elements.purchaseDateInput.value = currentList.purchaseDate;
            renderItems();
            elements.savedListsModal.style.display = 'none';
            showFriendlyMessage(`Lista "${list.storeName}" carregada.`, 'success');
        }
    }

    function deleteList(listId) {
        if (confirm('Tem certeza que deseja excluir esta lista? Esta ação não pode ser desfeita.')) {
            const savedLists = getSavedListsFromStorage();
            const listName = savedLists[listId]?.storeName || 'esta lista';
            delete savedLists[listId];
            localStorage.setItem('shoppingLists', JSON.stringify(savedLists));
            showSavedListsModal(); // Atualiza a exibição
            showFriendlyMessage(`Lista "${listName}" excluída.`, 'info');
        }
    }

    // --- COMPARTILHAMENTO ---
    function showShareModal(listId) {
        const savedLists = getSavedListsFromStorage();
        const list = savedLists[listId];
        if (list) {
            currentListIdToShare = listId;
            elements.shareListName.textContent = list.storeName;
            elements.savedListsModal.style.display = 'none';
            elements.shareModal.style.display = 'block';
        }
    }
    
    // Funções de exportação (TXT, PDF, XML)
    function exportListAs(listId, format) {
        const savedLists = getSavedListsFromStorage();
        const list = savedLists[listId];
        if (!list) return;

        let content = '';
        let filename = `lista_compras_${list.storeName.replace(/\s+/g, '_')}`;
        let mimeType = 'text/plain';

        if (format === 'txt') {
            content = `Lista de Compras: ${list.storeName}\n`;
            content += `Data: ${new Date(list.purchaseDate).toLocaleString('pt-BR')}\n`;
            content += '----------------------------------------\n\n';
            list.items.forEach(item => {
                content += `[${item.checked ? 'X' : ' '}] ${item.name}\n`;
                content += `  ${item.quantity} ${item.unit} x R$ ${item.unitValue.toFixed(2)} = R$ ${item.totalValue.toFixed(2)}\n\n`;
            });
            const grandTotal = list.items.reduce((sum, item) => sum + item.totalValue, 0);
            content += '========================================\n';
            content += `TOTAL GERAL: R$ ${grandTotal.toFixed(2)}`;
            filename += '.txt';
        } else if (format === 'pdf') {
            // Usa jsPDF
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();
            const grandTotal = list.items.reduce((sum, item) => sum + item.totalValue, 0);
            
            doc.setFontSize(18);
            doc.text(`Lista de Compras: ${list.storeName}`, 10, 20);
            doc.setFontSize(12);
            doc.text(`Data: ${new Date(list.purchaseDate).toLocaleString('pt-BR')}`, 10, 30);
            
            let yPosition = 50;
            list.items.forEach(item => {
                doc.text(`${item.checked ? '[X]' : '[ ]'} ${item.name}`, 10, yPosition);
                doc.text(`  ${item.quantity} ${item.unit} x R$ ${item.unitValue.toFixed(2)} = R$ ${item.totalValue.toFixed(2)}`, 15, yPosition + 5);
                yPosition += 15;
                if (yPosition > 270) { doc.addPage(); yPosition = 20; } // Adiciona nova página se necessário
            });
            
            doc.setFontSize(14);
            doc.text(`TOTAL GERAL: R$ ${grandTotal.toFixed(2)}`, 10, yPosition + 10);
            doc.save(`${filename}.pdf`);
            showFriendlyMessage('PDF gerado e baixado com sucesso!', 'success');
            return; // Retorna aqui pois o jsPDF lida com o download
        } else if (format === 'xml') {
            content = `<?xml version="1.0" encoding="UTF-8"?>\n`;
            content += `<lista>\n`;
            content += `  <empreendimento>${escapeXml(list.storeName)}</empreendimento>\n`;
            content += `  <data>${list.purchaseDate}</data>\n`;
            content += `  <itens>\n`;
            list.items.forEach(item => {
                content += `    <item>\n`;
                content += `      <nome>${escapeXml(item.name)}</nome>\n`;
                content += `      <quantidade>${item.quantity}</quantidade>\n`;
                content += `      <unidade>${item.unit}</unidade>\n`;
                content += `      <valorUnitario>${item.unitValue}</valorUnitario>\n`;
                content += `      <valorTotal>${item.totalValue}</valorTotal>\n`;
                content += `      <comprado>${item.checked}</comprado>\n`;
                content += `    </item>\n`;
            });
            content += `  </itens>\n`;
            content += `</lista>`;
            filename += '.xml';
            mimeType = 'application/xml';
        }
        
        // Cria e baixa o arquivo (para TXT e XML)
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        showFriendlyMessage(`Lista exportada como ${format.toUpperCase()} com sucesso!`, 'success');
    }
    
    function escapeXml(unsafe) {
        return unsafe.replace(/[<>&'"]/g, function (c) {
            switch (c) {
                case '<': return '&lt;';
                case '>': return '&gt;';
                case '&': return '&amp;';
                case '\'': return '&apos;';
                case '"': return '&quot;';
            }
        });
    }

    // Adiciona listeners aos botões de compartilhamento
    document.getElementById('share-txt').addEventListener('click', () => exportListAs(currentListIdToShare, 'txt'));
    document.getElementById('share-pdf').addEventListener('click', () => exportListAs(currentListIdToShare, 'pdf'));
    document.getElementById('share-xml').addEventListener('click', () => exportListAs(currentListIdToShare, 'xml'));

    // --- FUNCIONALIDADES ESPECIAIS ---
    
    // Tema Claro/Escuro
    function loadTheme() {
        const theme = localStorage.getItem('theme');
        if (theme === 'dark') {
            document.body.classList.add('dark-theme');
            elements.themeToggle.innerHTML = '<span class="material-symbols-outlined">dark_mode</span>';
        }
    }

    function toggleTheme() {
        document.body.classList.toggle('dark-theme');
        const isDark = document.body.classList.contains('dark-theme');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        elements.themeToggle.innerHTML = isDark 
            ? '<span class="material-symbols-outlined">dark_mode</span>'
            : '<span class="material-symbols-outlined">light_mode</span>';
    }

    // Calculadora
    function showCalculatorModal() {
        elements.calculatorModal.style.display = 'block';
        elements.calcDisplay.value = '';
    }
    
    function setupCalculator() {
        let calcExpression = '';
        const calcButtons = document.querySelectorAll('.calc-btn');
        
        calcButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const value = btn.textContent;
                
                if (value >= '0' && value <= '9' || value === '.') {
                    calcExpression += value;
                } else if (['+', '-', '*', '/'].includes(value)) {
                    calcExpression += ` ${value} `;
                } else if (value === 'C') {
                    calcExpression = '';
                } else if (value === '⌫') {
                    calcExpression = calcExpression.trim();
                    calcExpression = calcExpression.slice(0, -1);
                } else if (value === '=') {
                    try {
                        // Eval pode ser perigoso, mas como o input é controlado pelos botões, é seguro aqui.
                        calcExpression = String(eval(calcExpression));
                    } catch (e) {
                        calcExpression = 'Erro';
                    }
                } else if (value === 'Usar Valor') {
                    const valueToUse = parseFloat(calcExpression);
                    if (!isNaN(valueToUse)) {
                        elements.unitValueInput.value = valueToUse.toFixed(2);
                        calculateTotalValue();
                        elements.calculatorModal.style.display = 'none';
                    } else {
                        calcExpression = 'Valor Inválido';
                    }
                }
                elements.calcDisplay.value = calcExpression;
            });
        });
    }

    // Leitor de Código de Barras
    function showBarcodeModal() {
        elements.barcodeModal.style.display = 'block';
    }

    function setupBarcodeScanner() {
        elements.startScanBtn.addEventListener('click', startBarcodeScan);
        elements.stopScanBtn.addEventListener('click', stopBarcodeScan);

        if (!codeReader) {
            codeReader = new ZXing.BrowserMultiFormatReader();
        }
    }

    function startBarcodeScan() {
        codeReader.decodeFromVideoDevice(undefined, elements.barcodeVideo, (result, err) => {
            if (result) {
                const code = result.text;
                elements.barcodeResult.textContent = `Código lido: ${code}`;
                checkAndSetProduct(code);
                stopBarcodeScan(); // Para o scanner após a leitura
            }
            if (err && !(err instanceof ZXing.NotFoundException)) {
                console.error(err);
                elements.barcodeResult.textContent = `Erro ao escanear: ${err}`;
            }
        });
        elements.startScanBtn.disabled = true;
        elements.stopScanBtn.disabled = false;
    }

    function stopBarcodeScan() {
        codeReader.reset();
        elements.barcodeResult.textContent = 'Scanner parado.';
        elements.startScanBtn.disabled = false;
        elements.stopScanBtn.disabled = true;
    }

    function checkAndSetProduct(code) {
        const productMap = JSON.parse(localStorage.getItem('productCodeMap') || '{}');
        if (productMap[code]) {
            elements.productNameInput.value = productMap[code];
            showFriendlyMessage(`Produto "${productMap[code]}" encontrado para o código ${code}.`, 'success');
        } else {
            const productName = prompt(`Código ${code} não encontrado. Deseja associar a um produto? (Digite o nome do produto)`);
            if (productName) {
                productMap[code] = productName;
                localStorage.setItem('productCodeMap', JSON.stringify(productMap));
                elements.productNameInput.value = productName;
                showFriendlyMessage(`Código ${code} associado ao produto "${productName}".`, 'success');
            }
        }
    }

    // --- MENSAGENS AMIGÁVEIS ---
    function showFriendlyMessage(message, type = 'info') {
        // Cria um elemento de notificação
        const notification = document.createElement('div');
        notification.className = `friendly-message ${type}`;
        notification.textContent = message;

        // Estilo da notificação (poderia estar no CSS, mas é mais prático aqui)
        Object.assign(notification.style, {
            position: 'fixed',
            bottom: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            padding: '12px 24px',
            borderRadius: '8px',
            color: 'white',
            fontWeight: 'bold',
            zIndex: '10000',
            boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
            transition: 'opacity 0.3s'
        });

        // Define a cor de fundo baseada no tipo
        const colors = {
            success: '#28a745',
            error: '#dc3545',
            info: '#17a2b8'
        };
        notification.style.backgroundColor = colors[type] || colors.info;

        document.body.appendChild(notification);

        // Remove a notificação após 3 segundos
        setTimeout(() => {
            notification.style.opacity = '0';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

 /**
     * Prepara um item para edição, transformando seu nome em um campo de input.
     * @param {number} itemId - O ID do item a ser editado.
     */

 /* --------------------------------------------------------------------
    function prepareItemEdit(itemId) {
        const item = currentList.items.find(i => i.id === itemId);
        if (!item) return;

        const nameElement = document.querySelector(`.product-name[data-id="${itemId}"]`);
        if (!nameElement) return;

        // Cria um campo de input para editar o nome
        const input = document.createElement('input');
        input.type = 'text';
        input.value = item.name;
        input.className = 'edit-input';
        input.style.width = '100%';
        input.style.padding = '2px 5px';
        input.style.border = '1px solid var(--primary-color)';
        input.style.borderRadius = '3px';

        // Substitui o elemento de texto pelo input
        nameElement.innerHTML = '';
        nameElement.appendChild(input);
        input.focus();
        input.select(); // Seleciona todo o texto para facilitar a edição

        // Função para salvar a edição
        const saveEdit = () => {
            const newName = input.value.trim();
            if (newName && newName !== item.name) {
                item.name = newName;
                renderItems(); // Re-renderiza a lista para atualizar todos os valores
                showFriendlyMessage(`Item renomeado para "${newName}".`, 'success');
            } else {
                renderItems(); // Re-renderiza para voltar ao estado original se não houver mudança
            }
        };

        // Eventos para salvar a edição
        input.addEventListener('blur', saveEdit); // Salva ao perder o foco
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault(); // Evita enviar formulários
                saveEdit();
            }
            if (e.key === 'Escape') {
                renderItems(); // Cancela a edição e re-renderiza
            }
        });
    }
*/
function openEditItemModal(itemId) {
    const item = currentList.items.find(i => i.id === itemId);
    if (!item) return;

    editingItemId = itemId;

    elements.editProductName.value = item.name;
    elements.editQuantity.value = item.quantity;
    elements.editUnit.value = item.unit;
    elements.editUnitValue.value = item.unitValue.toFixed(2);
    updateEditTotalValue();

    elements.editItemModal.style.display = 'block';
}

function updateEditTotalValue() {
    const qty = parseInt(elements.editQuantity.value) || 0;
    const unitVal = parseFloat(elements.editUnitValue.value) || 0;
    const total = qty * unitVal;
    elements.editTotalValue.value = total.toFixed(2);
}

// Listener para atualizar total em tempo real no modal
elements.editQuantity.addEventListener('input', updateEditTotalValue);
elements.editUnitValue.addEventListener('input', updateEditTotalValue);

// Fechar modal ao cancelar
elements.cancelEditBtn.addEventListener('click', () => {
    elements.editItemModal.style.display = 'none';
    editingItemId = null;
});

// Salvar edição
elements.editForm.addEventListener('submit', (e) => {
    e.preventDefault();

    if (!editingItemId) return;

    const item = currentList.items.find(i => i.id === editingItemId);
    if (!item) return;

    item.name = elements.editProductName.value.trim();
    item.quantity = parseFloat(elements.editQuantity.value) || 1;
    item.unit = elements.editUnit.value;
    item.unitValue = parseFloat(elements.editUnitValue.value) || 0;
    item.totalValue = item.quantity * item.unitValue;

    renderItems();
    elements.editItemModal.style.display = 'none';
    editingItemId = null;

    showFriendlyMessage('Item atualizado com sucesso!', 'success');
});
    // --- INICIALIZAR O APP ---
    initializeApp();
});
