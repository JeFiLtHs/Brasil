/**
 * TRIBAL WARS - AUTOMATED BUILDING SYSTEM
 * Script profissional para automação de construção de edifícios
 * Versão: 2.0.0
 * Autor: Building Automation System
 */

// ============================================
// CONFIGURAÇÃO GLOBAL E CONSTANTES
// ============================================

const CONFIG = {
    VERSION: '2.0.0',
    DEFAULT_INTERVAL: 2000,
    MAX_QUEUE_SIZE: 50,
    STORAGE_KEY: 'tw_builder_data'
};

const BUILDING_TYPES = {
    WOOD_PRODUCTION: { id: 1, name: 'Produção de Madeira', resource: 'wood' },
    CLAY_PRODUCTION: { id: 2, name: 'Produção de Barro', resource: 'clay' },
    IRON_PRODUCTION: { id: 3, name: 'Produção de Ferro', resource: 'iron' },
    STORAGE: { id: 4, name: 'Armazém', resource: 'general' },
    BARRACKS: { id: 21, name: 'Quartel', resource: 'general' },
    STABLE: { id: 19, name: 'Estábulo', resource: 'general' },
    WORKSHOP: { id: 20, name: 'Oficina', resource: 'general' },
    WALL: { id: 16, name: 'Muralha', resource: 'general' },
    WATCHTOWER: { id: 24, name: 'Torre de Vigia', resource: 'general' }
};

// ============================================
// CLASSE PRINCIPAL DO SISTEMA
// ============================================

class TribalWarsBuilder {
    constructor() {
        this.isRunning = false;
        this.currentModel = null;
        this.buildingQueue = [];
        this.completedBuildings = [];
        this.customModels = [];
        this.stats = {
            buildingsConstructed: 0,
            totalTime: 0,
            startTime: null
        };
        this.loadData();
    }

    // ============================================
    // MÉTODO: Salvar dados localmente
    // ============================================
    saveData() {
        const data = {
            customModels: this.customModels,
            completedBuildings: this.completedBuildings,
            stats: this.stats
        };
        localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(data));
    }

    // ============================================
    // MÉTODO: Carregar dados salvos
    // ============================================
    loadData() {
        const stored = localStorage.getItem(CONFIG.STORAGE_KEY);
        if (stored) {
            try {
                const data = JSON.parse(stored);
                this.customModels = data.customModels || [];
                this.completedBuildings = data.completedBuildings || [];
                this.stats = data.stats || this.stats;
            } catch (e) {
                console.error('Erro ao carregar dados:', e);
            }
        }
    }

    // ============================================
    // MÉTODO: Obter modelo atual
    // ============================================
    getCurrentModel() {
        return this.currentModel;
    }

    // ============================================
    // MÉTODO: Definir modelo ativo
    // ============================================
    setActiveModel(modelName) {
        this.currentModel = this.getModel(modelName);
        if (!this.currentModel) {
            throw new Error(`Modelo "${modelName}" não encontrado`);
        }
        console.log(`✓ Modelo ativado: ${this.currentModel.name}`);
        return true;
    }

    // ============================================
    // MÉTODO: Obter modelo por nome
    // ============================================
    getModel(name) {
        return this.getPredefinedModels().concat(this.customModels)
            .find(m => m.name.toLowerCase() === name.toLowerCase());
    }

    // ============================================
    // MÉTODO: Adicionar à fila de construção
    // ============================================
    addToQueue(building, level = 1) {
        if (this.buildingQueue.length >= CONFIG.MAX_QUEUE_SIZE) {
            throw new Error(`Fila de construção cheia (máximo: ${CONFIG.MAX_QUEUE_SIZE})`);
        }
        
        const queueItem = {
            building,
            level,
            timestamp: new Date(),
            status: 'pending'
        };
        
        this.buildingQueue.push(queueItem);
        return queueItem;
    }

    // ============================================
    // MÉTODO: Processar fila de construção
    // ============================================
    async processQueue() {
        while (this.isRunning && this.buildingQueue.length > 0) {
            const item = this.buildingQueue.shift();
            
            try {
                item.status = 'constructing';
                await this.buildBuilding(item.building, item.level);
                
                item.status = 'completed';
                this.completedBuildings.push(item);
                this.stats.buildingsConstructed++;
                
                this.ui.updateQueueDisplay();
                this.ui.showNotification(
                    `✓ ${item.building.name} construído com sucesso!`,
                    'success'
                );
                
                await this.sleep(CONFIG.DEFAULT_INTERVAL);
            } catch (error) {
                item.status = 'failed';
                this.ui.showNotification(
                    `✗ Erro ao construir ${item.building.name}: ${error.message}`,
                    'error'
                );
            }
        }
    }

    // ============================================
    // MÉTODO: Construir edifício (simulado)
    // ============================================
    async buildBuilding(building, level) {
        return new Promise((resolve) => {
            setTimeout(() => {
                console.log(`[${new Date().toLocaleTimeString()}] Construído: ${building.name} Nível ${level}`);
                resolve();
            }, Math.random() * 3000 + 1000);
        });
    }

    // ============================================
    // MÉTODO: Sleep/Delay
    // ============================================
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // ============================================
    // MÉTODO: Iniciar automação
    // ============================================
    start() {
        if (!this.currentModel) {
            throw new Error('Nenhum modelo selecionado. Use setActiveModel()');
        }
        
        this.isRunning = true;
        this.stats.startTime = new Date();
        this.ui.showNotification('🚀 Automação iniciada!', 'success');
        this.processQueue();
    }

    // ============================================
    // MÉTODO: Parar automação
    // ============================================
    stop() {
        this.isRunning = false;
        this.stats.totalTime += (new Date() - this.stats.startTime) / 1000;
        this.ui.showNotification('⏸ Automação pausada', 'info');
    }

    // ============================================
    // MÉTODO: Obter modelos predefinidos
    // ============================================
    getPredefinedModels() {
        return [
            new BuildingModel(
                'Desenvolvimento Econômico',
                'Foco em produção de recursos e armazenamento',
                [
                    { building: BUILDING_TYPES.WOOD_PRODUCTION, levels: [5, 10, 15, 20] },
                    { building: BUILDING_TYPES.CLAY_PRODUCTION, levels: [5, 10, 15, 20] },
                    { building: BUILDING_TYPES.IRON_PRODUCTION, levels: [5, 10, 15, 20] },
                    { building: BUILDING_TYPES.STORAGE, levels: [10, 15, 20] }
                ]
            ),
            new BuildingModel(
                'Defesa Estratégica',
                'Foco em defesa e proteção militar',
                [
                    { building: BUILDING_TYPES.BARRACKS, levels: [10, 15, 20] },
                    { building: BUILDING_TYPES.WALL, levels: [20, 25, 30] },
                    { building: BUILDING_TYPES.WATCHTOWER, levels: [15, 20] },
                    { building: BUILDING_TYPES.STORAGE, levels: [15, 20] }
                ]
            ),
            new BuildingModel(
                'Dominação Militar',
                'Foco em produção militar ofensiva',
                [
                    { building: BUILDING_TYPES.BARRACKS, levels: [15, 20, 25] },
                    { building: BUILDING_TYPES.STABLE, levels: [15, 20, 25] },
                    { building: BUILDING_TYPES.WORKSHOP, levels: [10, 15, 20] },
                    { building: BUILDING_TYPES.WOOD_PRODUCTION, levels: [10, 15] }
                ]
            )
        ];
    }

    // ============================================
    // MÉTODO: Criar modelo customizado
    // ============================================
    createCustomModel(name, description, buildingSequence) {
        // Validação
        if (!name || name.trim() === '') {
            throw new Error('Nome do modelo é obrigatório');
        }
        if (!Array.isArray(buildingSequence) || buildingSequence.length === 0) {
            throw new Error('Sequência de construção é obrigatória');
        }

        const customModel = new BuildingModel(name, description, buildingSequence);
        this.customModels.push(customModel);
        this.saveData();
        
        console.log(`✓ Modelo customizado "${name}" criado com sucesso!`);
        return customModel;
    }

    // ============================================
    // MÉTODO: Excluir modelo customizado
    // ============================================
    deleteCustomModel(name) {
        const index = this.customModels.findIndex(m => m.name === name);
        if (index === -1) {
            throw new Error(`Modelo "${name}" não encontrado`);
        }
        
        this.customModels.splice(index, 1);
        this.saveData();
        console.log(`✓ Modelo "${name}" excluído com sucesso!`);
    }

    // ============================================
    // MÉTODO: Listar todos os modelos
    // ============================================
    listAllModels() {
        const all = this.getPredefinedModels().concat(this.customModels);
        return all.map((m, i) => ({
            id: i + 1,
            name: m.name,
            description: m.description,
            type: m === null ? 'predefined' : 'custom',
            buildingCount: m.sequence.length
        }));
    }

    // ============================================
    // MÉTODO: Obter estatísticas
    // ============================================
    getStats() {
        return {
            ...this.stats,
            queueSize: this.buildingQueue.length,
            completedCount: this.completedBuildings.length,
            isRunning: this.isRunning,
            currentModel: this.currentModel?.name || 'Nenhum'
        };
    }
}

// ============================================
// CLASSE: Modelo de Construção
// ============================================

class BuildingModel {
    constructor(name, description, sequence) {
        this.name = name;
        this.description = description;
        this.sequence = sequence;
        this.createdAt = new Date();
    }

    getInfo() {
        return {
            name: this.name,
            description: this.description,
            totalBuildings: this.sequence.length,
            buildings: this.sequence.map(s => ({
                name: s.building.name,
                levels: s.levels.join(', ')
            }))
        };
    }
}

// ============================================
// CLASSE: INTERFACE DO USUÁRIO
// ============================================

class UserInterface {
    constructor(builder) {
        this.builder = builder;
        this.currentPage = 'menu';
        this.init();
    }

    init() {
        this.createContainers();
        this.showMainMenu();
    }

    // ============================================
    // Criar elementos da interface
    // ============================================
    createContainers() {
        // Remover containers anteriores se existirem
        const existing = document.getElementById('tw-builder-container');
        if (existing) existing.remove();

        // Criar container principal
        const container = document.createElement('div');
        container.id = 'tw-builder-container';
        container.innerHTML = `
            <style>
                #tw-builder-container {
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    max-width: 1200px;
                    margin: 20px auto;
                    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
                    border-radius: 12px;
                    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
                    overflow: hidden;
                    color: #e0e0e0;
                }

                .tw-header {
                    background: linear-gradient(90deg, #e74c3c 0%, #c0392b 100%);
                    padding: 20px;
                    text-align: center;
                    border-bottom: 3px solid #a93226;
                }

                .tw-header h1 {
                    margin: 0;
                    font-size: 28px;
                    text-transform: uppercase;
                    letter-spacing: 2px;
                    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
                }

                .tw-header p {
                    margin: 8px 0 0 0;
                    font-size: 12px;
                    opacity: 0.9;
                }

                .tw-content {
                    padding: 30px;
                    min-height: 400px;
                }

                .tw-menu-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                    gap: 15px;
                    margin: 20px 0;
                }

                .tw-menu-button {
                    background: linear-gradient(135deg, #27ae60 0%, #229954 100%);
                    border: 2px solid #1e8449;
                    color: white;
                    padding: 20px;
                    border-radius: 8px;
                    cursor: pointer;
                    font-size: 16px;
                    font-weight: bold;
                    transition: all 0.3s ease;
                    text-align: center;
                }

                .tw-menu-button:hover {
                    background: linear-gradient(135deg, #229954 0%, #1e8449 100%);
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
                }

                .tw-menu-button:active {
                    transform: translateY(0);
                }

                .tw-list {
                    list-style: none;
                    padding: 0;
                    margin: 15px 0;
                }

                .tw-list-item {
                    background: rgba(255, 255, 255, 0.05);
                    padding: 15px;
                    margin: 10px 0;
                    border-left: 4px solid #e74c3c;
                    border-radius: 4px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .tw-list-item-info {
                    flex: 1;
                }

                .tw-list-item-name {
                    font-weight: bold;
                    margin-bottom: 5px;
                }

                .tw-list-item-desc {
                    font-size: 12px;
                    opacity: 0.8;
                }

                .tw-input-group {
                    margin: 20px 0;
                }

                .tw-input-group label {
                    display: block;
                    margin-bottom: 8px;
                    font-weight: bold;
                    color: #f0f0f0;
                }

                .tw-input-group input,
                .tw-input-group textarea,
                .tw-input-group select {
                    width: 100%;
                    padding: 12px;
                    border: 2px solid #34495e;
                    border-radius: 6px;
                    background: rgba(0, 0, 0, 0.3);
                    color: #e0e0e0;
                    font-size: 14px;
                    box-sizing: border-box;
                }

                .tw-input-group input:focus,
                .tw-input-group textarea:focus,
                .tw-input-group select:focus {
                    outline: none;
                    border-color: #e74c3c;
                    box-shadow: 0 0 8px rgba(231, 76, 60, 0.3);
                }

                .tw-button-group {
                    display: flex;
                    gap: 10px;
                    margin: 20px 0;
                }

                .tw-button {
                    flex: 1;
                    padding: 12px 20px;
                    border: none;
                    border-radius: 6px;
                    cursor: pointer;
                    font-weight: bold;
                    font-size: 14px;
                    transition: all 0.3s ease;
                }

                .tw-button-primary {
                    background: linear-gradient(135deg, #3498db 0%, #2980b9 100%);
                    color: white;
                }

                .tw-button-primary:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(52, 152, 219, 0.3);
                }

                .tw-button-danger {
                    background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
                    color: white;
                }

                .tw-button-danger:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(231, 76, 60, 0.3);
                }

                .tw-button-secondary {
                    background: linear-gradient(135deg, #95a5a6 0%, #7f8c8d 100%);
                    color: white;
                }

                .tw-button-secondary:hover {
                    transform: translateY(-2px);
                }

                .tw-notification {
                    padding: 15px;
                    margin: 15px 0;
                    border-radius: 6px;
                    animation: slideIn 0.3s ease;
                }

                @keyframes slideIn {
                    from {
                        opacity: 0;
                        transform: translateY(-10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                .tw-notification-success {
                    background: rgba(39, 174, 96, 0.2);
                    border-left: 4px solid #27ae60;
                    color: #27ae60;
                }

                .tw-notification-error {
                    background: rgba(231, 76, 60, 0.2);
                    border-left: 4px solid #e74c3c;
                    color: #e74c3c;
                }

                .tw-notification-info {
                    background: rgba(52, 152, 219, 0.2);
                    border-left: 4px solid #3498db;
                    color: #3498db;
                }

                .tw-stats-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                    gap: 15px;
                    margin: 20px 0;
                }

                .tw-stat-card {
                    background: rgba(255, 255, 255, 0.05);
                    padding: 15px;
                    border-radius: 8px;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    text-align: center;
                }

                .tw-stat-value {
                    font-size: 24px;
                    font-weight: bold;
                    color: #e74c3c;
                    margin: 10px 0;
                }

                .tw-stat-label {
                    font-size: 12px;
                    opacity: 0.7;
                    text-transform: uppercase;
                }

                .tw-queue-item {
                    background: rgba(52, 152, 219, 0.1);
                    border-left: 4px solid #3498db;
                    padding: 12px;
                    margin: 8px 0;
                    border-radius: 4px;
                    display: flex;
                    justify-content: space-between;
                }

                .tw-footer {
                    background: rgba(0, 0, 0, 0.3);
                    padding: 15px;
                    text-align: center;
                    font-size: 11px;
                    border-top: 1px solid rgba(255, 255, 255, 0.1);
                }

                .tw-back-button {
                    display: inline-block;
                    padding: 8px 15px;
                    background: #34495e;
                    color: white;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                    margin-bottom: 20px;
                }

                .tw-back-button:hover {
                    background: #2c3e50;
                }
            </style>
            <div class="tw-header">
                <h1>⚔️ Tribal Wars Builder</h1>
                <p>Sistema Automatizado de Construção v${CONFIG.VERSION}</p>
            </div>
            <div class="tw-content" id="tw-main-content"></div>
            <div id="tw-notifications"></div>
            <div class="tw-footer">
                Desenvolvido por: Building Automation System | Tribal Wars Builder
            </div>
        `;

        document.body.appendChild(container);
    }

    // ============================================
    // Menu principal
    // ============================================
    showMainMenu() {
        const content = document.getElementById('tw-main-content');
        content.innerHTML = `
            <h2>🎮 Menu Principal</h2>
            <p>Bem-vindo ao Sistema Automatizado de Construção do Tribal Wars</p>
            
            <div class="tw-menu-grid">
                <button class="tw-menu-button" onclick="window.builder.ui.showModelsPage()">
                    📋 Selecionar Modelo
                </button>
                <button class="tw-menu-button" onclick="window.builder.ui.showCreateModelPage()">
                    ➕ Criar Modelo Custom
                </button>
                <button class="tw-menu-button" onclick="window.builder.ui.showControlPanel()">
                    🎮 Painel de Controle
                </button>
                <button class="tw-menu-button" onclick="window.builder.ui.showStatistics()">
                    📊 Estatísticas
                </button>
            </div>
        `;
    }

    // ============================================
    // Página de seleção de modelos
    // ============================================
    showModelsPage() {
        const content = document.getElementById('tw-main-content');
        const models = this.builder.listAllModels();

        let html = `
            <button class="tw-back-button" onclick="window.builder.ui.showMainMenu()">← Voltar</button>
            <h2>📋 Selecionar Modelo de Construção</h2>
            <ul class="tw-list">
        `;

        models.forEach(model => {
            html += `
                <li class="tw-list-item">
                    <div class="tw-list-item-info">
                        <div class="tw-list-item-name">${model.name}</div>
                        <div class="tw-list-item-desc">${model.description || 'Sem descrição'}</div>
                        <small>Edifícios: ${model.buildingCount}</small>
                    </div>
                    <button class="tw-button tw-button-primary" 
                            onclick="window.builder.setActiveModel('${model.name}')">
                        Selecionar
                    </button>
                </li>
            `;
        });

        html += `</ul>`;
        content.innerHTML = html;
    }

    // ============================================
    // Página de criação de modelo customizado
    // ============================================
    showCreateModelPage() {
        const content = document.getElementById('tw-main-content');
        
        let buildingOptionsHtml = '';
        Object.values(BUILDING_TYPES).forEach(building => {
            buildingOptionsHtml += `<option value="${building.id}">${building.name}</option>`;
        });

        content.innerHTML = `
            <button class="tw-back-button" onclick="window.builder.ui.showMainMenu()">← Voltar</button>
            <h2>➕ Criar Modelo Customizado</h2>
            
            <form id="custom-model-form">
                <div class="tw-input-group">
                    <label>Nome do Modelo *</label>
                    <input type="text" id="model-name" placeholder="Ex: Meu Modelo de Economia" required>
                </div>

                <div class="tw-input-group">
                    <label>Descrição</label>
                    <textarea id="model-description" placeholder="Descreva o objetivo deste modelo" rows="3"></textarea>
                </div>

                <div id="buildings-container">
                    <h3>Sequência de Construção</h3>
                    <div id="building-list"></div>
                    <button type="button" class="tw-button tw-button-secondary" 
                            onclick="window.builder.ui.addBuildingToForm()">
                        + Adicionar Edifício
                    </button>
                </div>

                <div class="tw-button-group">
                    <button type="button" class="tw-button tw-button-danger" 
                            onclick="window.builder.ui.showMainMenu()">
                        Cancelar
                    </button>
                    <button type="submit" class="tw-button tw-button-primary">
                        Criar Modelo
                    </button>
                </div>
            </form>
        `;

        document.getElementById('custom-model-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.submitCustomModel();
        });

        // Adicionar primeiro edifício
        this.addBuildingToForm();
    }

    // ============================================
    // Adicionar edifício ao formulário
    // ============================================
    addBuildingToForm() {
        const container = document.getElementById('building-list');
        const index = container.children.length;

        const buildingDiv = document.createElement('div');
        buildingDiv.id = `building-${index}`;
        buildingDiv.style.cssText = 'background: rgba(255,255,255,0.05); padding: 15px; margin: 10px 0; border-radius: 6px;';

        let optionsHtml = '<option value="">-- Selecione um edifício --</option>';
        Object.values(BUILDING_TYPES).forEach(building => {
            optionsHtml += `<option value="${building.id}">${building.name}</option>`;
        });

        buildingDiv.innerHTML = `
            <div class="tw-input-group">
                <label>Edifício #${index + 1}</label>
                <select class="building-select" required>
                    ${optionsHtml}
                </select>
            </div>
            <div class="tw-input-group">
                <label>Níveis a Construir (separados por vírgula)</label>
                <input type="text" class="building-levels" placeholder="Ex: 1, 5, 10, 15" required>
            </div>
            <button type="button" class="tw-button tw-button-danger" 
                    onclick="document.getElementById('building-${index}').remove()">
                Remover
            </button>
        `;

        container.appendChild(buildingDiv);
    }

    // ============================================
    // Enviar modelo customizado
    // ============================================
    submitCustomModel() {
        const name = document.getElementById('model-name').value;
        const description = document.getElementById('model-description').value;
        const buildingElements = document.querySelectorAll('#building-list > div');

        if (buildingElements.length === 0) {
            this.showNotification('Adicione pelo menos um edifício ao modelo', 'error');
            return;
        }

        const sequence = [];
        let valid = true;

        buildingElements.forEach(el => {
            const buildingId = el.querySelector('.building-select').value;
            const levelsStr = el.querySelector('.building-levels').value;
            const levels = levelsStr.split(',').map(l => parseInt(l.trim())).filter(l => !isNaN(l));

            if (!buildingId || levels.length === 0) {
                valid = false;
                return;
            }

            const building = Object.values(BUILDING_TYPES).find(b => b.id === parseInt(buildingId));
            if (building) {
                sequence.push({
                    building,
                    levels
                });
            }
        });

        if (!valid) {
            this.showNotification('Preencha todos os campos corretamente', 'error');
            return;
        }

        try {
            this.builder.createCustomModel(name, description, sequence);
            this.showNotification(`✓ Modelo "${name}" criado com sucesso!`, 'success');
            setTimeout(() => this.showModelsPage(), 1500);
        } catch (error) {
            this.showNotification(`✗ Erro: ${error.message}`, 'error');
        }
    }

    // ============================================
    // Painel de controle
    // ============================================
    showControlPanel() {
        const content = document.getElementById('tw-main-content');
        const currentModel = this.builder.getCurrentModel();
        const stats = this.builder.getStats();

        let html = `
            <button class="tw-back-button" onclick="window.builder.ui.showMainMenu()">← Voltar</button>
            <h2>🎮 Painel de Controle</h2>
            
            <div class="tw-notification tw-notification-info">
                Modelo Ativo: <strong>${currentModel ? currentModel.name : 'Nenhum'}</strong>
            </div>
        `;

        if (currentModel) {
            html += `
                <h3>Sequência de Construção do Modelo</h3>
                <ul class="tw-list">
            `;

            currentModel.sequence.forEach(item => {
                html += `
                    <li class="tw-list-item">
                        <div class="tw-list-item-info">
                            <div class="tw-list-item-name">${item.building.name}</div>
                            <div class="tw-list-item-desc">Níveis: ${item.levels.join(', ')}</div>
                        </div>
                    </li>
                `;
            });

            html += `</ul>`;

            html += `
                <div class="tw-button-group">
                    <button class="tw-button tw-button-primary" onclick="window.builder.start()">
                        ▶ Iniciar Automação
                    </button>
                    <button class="tw-button tw-button-danger" onclick="window.builder.stop()">
                        ⏸ Parar Automação
                    </button>
                </div>
            `;
        } else {
            html += `<p>Nenhum modelo selecionado. <a href="#" onclick="window.builder.ui.showModelsPage()">Selecione um modelo</a></p>`;
        }

        html += `
            <h3>Fila de Construção</h3>
            <div id="queue-display">${this.getQueueDisplay()}</div>
        `;

        content.innerHTML = html;
    }

    // ============================================
    // Obter display da fila
    // ============================================
    getQueueDisplay() {
        const queue = this.builder.buildingQueue;
        
        if (queue.length === 0) {
            return '<p style="opacity: 0.7;">Nenhum item na fila</p>';
        }

        let html = '';
        queue.forEach((item, i) => {
            const statusSymbol = item.status === 'pending' ? '⏳' : item.status === 'constructing' ? '🔨' : '✓';
            html += `
                <div class="tw-queue-item">
                    <span>${statusSymbol} ${item.building.name} Nível ${item.level}</span>
                    <small>${new Date(item.timestamp).toLocaleTimeString()}</small>
                </div>
            `;
        });

        return html;
    }

    // ============================================
    // Atualizar display da fila
    // ============================================
    updateQueueDisplay() {
        const queueDisplay = document.getElementById('queue-display');
        if (queueDisplay) {
            queueDisplay.innerHTML = this.getQueueDisplay();
        }
    }

    // ============================================
    // Página de estatísticas
    // ============================================
    showStatistics() {
        const content = document.getElementById('tw-main-content');
        const stats = this.builder.getStats();

        const html = `
            <button class="tw-back-button" onclick="window.builder.ui.showMainMenu()">← Voltar</button>
            <h2>📊 Estatísticas</h2>

            <div class="tw-stats-grid">
                <div class="tw-stat-card">
                    <div class="tw-stat-label">Edifícios Construídos</div>
                    <div class="tw-stat-value">${stats.buildingsConstructed}</div>
                </div>
                <div class="tw-stat-card">
                    <div class="tw-stat-label">Fila Atual</div>
                    <div class="tw-stat-value">${stats.queueSize}</div>
                </div>
                <div class="tw-stat-card">
                    <div class="tw-stat-label">Completados</div>
                    <div class="tw-stat-value">${stats.completedCount}</div>
                </div>
                <div class="tw-stat-card">
                    <div class="tw-stat-label">Status</div>
                    <div class="tw-stat-value">${stats.isRunning ? '🟢 Ativo' : '🔴 Inativo'}</div>
                </div>
                <div class="tw-stat-card">
                    <div class="tw-stat-label">Tempo Total</div>
                    <div class="tw-stat-value">${Math.floor(stats.totalTime)}s</div>
                </div>
                <div class="tw-stat-card">
                    <div class="tw-stat-label">Modelo Ativo</div>
                    <div class="tw-stat-value" style="font-size: 14px;">${stats.currentModel}</div>
                </div>
            </div>

            <h3>Histórico de Construções</h3>
            <ul class="tw-list">
                ${this.builder.completedBuildings.length === 0 
                    ? '<p style="opacity: 0.7;">Nenhuma construção concluída ainda</p>' 
                    : this.builder.completedBuildings.map(b => `
                        <li class="tw-list-item">
                            <div class="tw-list-item-info">
                                <div class="tw-list-item-name">${b.building.name} Nível ${b.level}</div>
                                <div class="tw-list-item-desc">${new Date(b.timestamp).toLocaleString()}</div>
                            </div>
                        </li>
                    `).join('')
                }
            </ul>
        `;

        content.innerHTML = html;
    }

    // ============================================
    // Mostrar notificação
    // ============================================
    showNotification(message, type = 'info') {
        const container = document.getElementById('tw-notifications');
        const notification = document.createElement('div');
        notification.className = `tw-notification tw-notification-${type}`;
        notification.textContent = message;

        container.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
}

// ============================================
// INICIALIZAÇÃO
// ============================================

window.builder = new TribalWarsBuilder();
window.builder.ui = new UserInterface(window.builder);

// Adicionar à janela para acesso global
window.TWBuilder = {
    builder: window.builder,
    addToQueue: (buildingName, level = 1) => {
        const building = Object.values(BUILDING_TYPES).find(b => b.name === buildingName);
        if (building) {
            return window.builder.addToQueue(building, level);
        }
        throw new Error(`Edifício "${buildingName}" não encontrado`);
    },
    start: () => window.builder.start(),
    stop: () => window.builder.stop(),
    getStats: () => window.builder.getStats()
};

console.log(`✓ Tribal Wars Builder v${CONFIG.VERSION} carregado com sucesso!`);
console.log('Use: window.builder.ui.showMainMenu() para abrir a interface');
console.log('Ou acesse: window.TWBuilder para métodos rápidos');