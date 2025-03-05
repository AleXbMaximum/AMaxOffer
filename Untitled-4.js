const addGlobalStyle = () => {
    const style = document.createElement('style');
    style.id = 'amaxoffer-global-styles';
    style.textContent = `
    @font-face {
        font-family: 'AmexFont';
        src: url("https://www.aexp-static.com/cdaas/one/statics/@americanexpress/static-assets/2.31.2/package/dist/iconfont/dls-icons.woff?v=2.31.2") format('woff');
        font-weight: normal;
        font-style: normal;
    }
    
    :root {
        /* Base colors */
        --ios-blue: #007AFF;
        --ios-dark-blue: #0062CC;
        --ios-green: rgb(32, 169, 69);
        --ios-orange: rgb(215, 129, 0);
        --ios-red: rgb(215, 49, 38);
        --ios-gray: rgb(142, 142, 147);
        
        /* Background colors */
        --ios-background: rgba(255, 255, 255, 0.8);
        --ios-secondary-bg: rgba(249, 249, 251, 0.6);
        --ios-light-gray: rgba(142, 142, 147, 0.1);
        
        /* Text colors */
        --ios-text-primary: #1c1c1e;
        --ios-text-secondary: #2c2c2e;
        
        /* Common properties */
        --ios-border: rgba(230, 230, 230, 0.7);
        --ios-radius: 18px;
        --ios-table-border-radius: 8px;
        --ios-font: 'AmexFont', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        
        /* Gradients */
        --ios-title-gradient: linear-gradient(45deg, #4CAF50, #2196F3);
        --ios-button-gradient: linear-gradient(45deg, rgb(84,99,86), rgb(27,66,29));
        --ios-header-bg: linear-gradient(to right, rgba(245, 245, 247, 0.9), rgba(235, 235, 242, 0.85));
        
        /* Shadows */
        --ios-shadow-sm: 0 2px 6px rgba(0, 0, 0, 0.06);
        --ios-shadow-md: 0 5px 16px rgba(0, 0, 0, 0.1);
        --ios-shadow: 0 12px 32px rgba(0, 0, 0, 0.14);
        
        /* Animation timings */
        --ios-anim-fast: 0.2s;
        --ios-anim-medium: 0.3s;
        --ios-anim-slow: 0.5s;
        
        /* Status colors */
        --ios-status-active-bg: rgba(52, 199, 89, 0.15);
        --ios-status-pending-bg: rgba(255, 149, 0, 0.15);
        --ios-status-inactive-bg: rgba(255, 59, 48, 0.15);
        
        /* Table styles */
        --ios-table-cell-padding: 10px 14px;
        --ios-table-row-hover: rgba(0, 0, 0, 0.04);
        --ios-table-header-font-size: 12px;
        --ios-table-cell-font-size: 13px;
        
        /* Highlight colors */
        --ios-highlight-bg: rgba(255, 204, 0, 0.2);
        --ios-highlight-border: rgba(255, 204, 0, 0.8);
        --ios-highlight-hover: rgba(255, 204, 0, 0.25);
        
        /* Empty state */
        --ios-empty-padding: 60px 20px;
    }
    
    /* Main Container */
    .amaxoffer-container {
        position: fixed;
        top: 5%;
        left: 5%;
        background: url("https://www.aexp-static.com/cdaas/one/statics/@americanexpress/static-assets/2.28.0/package/dist/img/brand/worldservice-tile-gray.svg") repeat, #fefefe;
        border-radius: 12px;
        z-index: 10000;
        font-family: var(--ios-font);
        box-shadow: var(--ios-shadow);
        max-height: 90vh;
        overflow: hidden;
        width: 90%;
        max-width: 1400px;
        border: 1px solid rgba(0,0,0,0.15);
        transition: all 0.3s ease;
    }
    
    .amaxoffer-minimized {
        width: 200px !important;
        height: 75px !important;
        transform: scale(0.98);
        box-shadow: 0 12px 18px rgba(0,0,0,0.20);
    }
    
    .amaxoffer-expanded {
        width: 90% !important;
        height: auto !important;
        transform: none;
        box-shadow: var(--ios-shadow);
    }
    
    /* Header Styles */
    .amaxoffer-header {
        background-color: #f8f9fa;
        border-bottom: 1px solid rgba(0,0,0,0.08);
        padding: 12px 20px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        cursor: grab;
        user-select: none;
    }
    
    .amaxoffer-title {
        font-size: 1.4rem;
        font-weight: 600;
        background: var(--ios-title-gradient);
        -webkit-background-clip: text;
        color: transparent;
        letter-spacing: -0.5px;
    }
    
    .amaxoffer-nav {
        display: flex;
        gap: 12px;
        background: #f8f9fa;
        border-radius: 8px;
        padding: 4px;
    }
    
    .amaxoffer-nav-button {
        cursor: pointer;
        font-size: 18px;
        padding: 8px 20px;
        border: none;
        background: transparent;
        border-radius: 8px;
        transition: all 0.2s ease;
        color: #2c3e50;
        font-weight: 500;
    }
    
    .amaxoffer-nav-button:hover {
        transform: scale(1.05);
        background-color: #f0f0f0;
    }
    
    .amaxoffer-nav-button.active {
        background-color: #4CAF50;
        color: black;
        font-weight: 800;
    }
    
    .amaxoffer-toggle-btn {
        font-size: 1.2rem;
        border: 1px dashed #ccc;
        border-radius: 6px;
        width: 50px;
        height: 50px;
        display: inline-flex;
        justify-content: center;
        align-items: center;
        cursor: pointer;
        background: transparent;
        transition: all 0.2s ease;
    }
    
    .amaxoffer-toggle-btn:hover {
        background-color: #f0f0f0;
    }
    
    /* Content Area */
    .amaxoffer-content {
        padding: 20px;
        overflow-y: auto;
        max-height: calc(80vh - 64px);
    }
    
    /* Common Table Styles */
    .ios-table, .macos-table {
        width: 100%;
        border-collapse: separate;
        border-spacing: 0;
        font-family: var(--ios-font);
        border-radius: var(--ios-table-border-radius);
        overflow: hidden;
        background-color: var(--ios-background);
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
        box-shadow: var(--ios-shadow-sm);
        border: 1px solid var(--ios-border);
    }
    
    .ios-table-head, .macos-table-head {
        background: var(--ios-header-bg);
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        position: sticky;
        top: 0;
        z-index: 10;
    }
    
    .ios-table th, .macos-table th {
        padding: var(--ios-table-cell-padding);
        font-weight: 600;
        color: var(--ios-text-primary);
        border-bottom: 1px solid rgba(60, 60, 67, 0.12);
        text-align: left;
    }
    
    .ios-table th.sortable, .macos-table th.sortable {
        cursor: pointer;
        position: relative;
        padding-right: 28px;
    }
    
    .ios-table tr, .macos-table tr {
        transition: background-color 0.2s ease;
    }
    
    .ios-table tr:nth-child(even), .macos-table tr:nth-child(even) {
        background-color: var(--ios-secondary-bg);
    }
    
    .ios-table tr:hover, .macos-table tr:hover {
        background-color: var(--ios-table-row-hover);
    }
    
    .ios-table td, .macos-table td {
        padding: var(--ios-table-cell-padding);
        color: var(--ios-text-secondary);
        border-bottom: 1px solid rgba(60, 60, 67, 0.04);
        vertical-align: middle;
    }
    
    /* Status pills */
    .ios-status, .macos-status {
        display: inline-block;
        padding: 5px 10px;
        border-radius: 16px;
        font-size: 13px;
        font-weight: 500;
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
    }
    
    .ios-status.active, .ios-status.success,
    .macos-status.active, .macos-status.success {
        background-color: var(--ios-status-active-bg);
        color: var(--ios-green);
        border: 1px solid rgba(52, 199, 89, 0.25);
    }
    
    .ios-status.pending, .macos-status.pending {
        background-color: var(--ios-status-pending-bg);
        color: var(--ios-orange);
        border: 1px solid rgba(255, 149, 0, 0.25);
    }
    
    .ios-status.inactive, .ios-status.failed, .ios-status.canceled,
    .macos-status.inactive, .macos-status.failed, .macos-status.canceled {
        background-color: var(--ios-status-inactive-bg);
        color: var(--ios-red);
        border: 1px solid rgba(255, 59, 48, 0.25);
    }
    
    /* Highlight for search results */
    .macos-highlight-row {
        background-color: var(--ios-highlight-bg) !important;
        border-left: 3px solid var(--ios-highlight-border) !important;
    }
    
    .macos-highlight-row:hover {
        background-color: var(--ios-highlight-hover) !important;
    }
    
    /* Empty state */
    .ios-empty-state, .macos-empty-state {
        padding: var(--ios-empty-padding);
        text-align: center;
    }
    
    /* Search input */
    .ios-search-container {
        position: relative;
        box-sizing: border-box;
        width: 200px;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
        border-radius: 10px;
    }
    
    .ios-search-input {
        width: 100%;
        padding: 10px 32px 10px 12px;
        border-radius: 10px;
        border: 1px solid #e0e0e0;
        background-color: rgba(250, 250, 250, 0.8);
        font-size: 14px;
        font-family: var(--ios-font);
    }
    
    .ios-search-input:focus {
        outline: none;
        border-color: var(--ios-blue);
        box-shadow: 0 0 0 2px rgba(0, 122, 255, 0.08);
    }
    
    /* Animation keyframes */
    @keyframes fadeIn { 
        0% { opacity: 0; } 
        100% { opacity: 1; }
    }
    
    @keyframes slideIn { 
        0% { transform: translateY(20px); opacity: 0; } 
        100% { transform: translateY(0); opacity: 1; }
    }
    
    @keyframes bounce { 
        0%, 100% { transform: scale(1); } 
        50% { transform: scale(1.05); }
    }
    
    @keyframes spin { 
        0% { transform: rotate(0deg); } 
        100% { transform: rotate(360deg); }
    }
    
    
    
    .macos-sort-animation {
        animation: macosBounce 0.3s ease;
    }
    
    /* Responsive design */
    @media (max-width: 768px) {
        .amaxoffer-container {
            width: 95%;
            left: 2.5%;
        }
        
        .summary-header,
        .button-container {
            flex-direction: column;
            align-items: stretch;
        }
    }
    `;
    document.head.appendChild(style);
};

const UI_STYLES = {
    // Base layouts
    layout: {
        page: 'display:flex; flex-direction:column; gap:20px; padding:20px; max-width:100%; margin:0 auto; font-family:var(--ios-font); transition:all 0.3s ease;',
        card: 'background:var(--ios-background); backdrop-filter:blur(8px); -webkit-backdrop-filter:blur(8px); border-radius:14px; padding:16px; box-shadow:var(--ios-shadow-sm); border:1px solid var(--ios-border);',
        flexRow: 'display:flex; align-items:center; gap:12px;',
        flexColumn: 'display:flex; flex-direction:column; gap:12px;',
        grid: 'display:grid; gap:16px;',
    },

    // Text styles
    text: {
        title: 'font-size:20px; font-weight:600; color:var(--ios-text-primary); margin:0 0 16px 0;',
        subtitle: 'font-size:16px; font-weight:600; color:var(--ios-text-secondary); margin:0 0 12px 0;',
        body: 'font-size:14px; color:#4a4a4a; line-height:1.5;',
        label: 'font-size:13px; color:var(--ios-gray); font-weight:500;',
        value: 'font-size:15px; font-weight:600; color:var(--ios-text-primary);',
        currency: 'font-variant-numeric:tabular-nums; font-weight:600; text-align:center;',
        truncate: 'white-space:nowrap; overflow:hidden; text-overflow:ellipsis;',
    },

    // Controls
    controls: {
        input: 'width:100%; padding:10px 12px; border-radius:8px; border:1px solid #ddd; font-size:14px; outline:none; transition:all 0.2s ease;',
        select: 'padding:10px 12px; border-radius:8px; border:1px solid #ddd; font-size:14px; outline:none; background-color:white; cursor:pointer;',
        search: 'position:relative; width:100%; padding:10px 32px 10px 12px; border-radius:10px; border:1px solid #e0e0e0; background-color:rgba(250, 250, 250, 0.8); font-size:14px; font-family:var(--ios-font);',
    },

    // Buttons
    buttons: {
        primary: 'background-color:var(--ios-blue); color:white; border:none; border-radius:10px; font-weight:500; cursor:pointer; transition:all 0.2s ease; display:flex; align-items:center; gap:8px;',
        secondary: 'background-color:rgba(142, 142, 147, 0.1); color:var(--ios-text-secondary); border:none; border-radius:10px; font-weight:500; cursor:pointer; transition:all 0.2s ease; display:flex; align-items:center; gap:8px;',
        danger: 'background-color:var(--ios-red); color:white; border:none; border-radius:10px; font-weight:500; cursor:pointer; transition:all 0.2s ease; display:flex; align-items:center; gap:8px;',
        success: 'background-color:var(--ios-green); color:white; border:none; border-radius:10px; font-weight:500; cursor:pointer; transition:all 0.2s ease; display:flex; align-items:center; gap:8px;',
    },

    // Status indicators
    status: {
        active: 'background-color:rgba(52, 199, 89, 0.15); color:var(--ios-green); border:1px solid rgba(52, 199, 89, 0.25);',
        pending: 'background-color:rgba(255, 149, 0, 0.15); color:var(--ios-orange); border:1px solid rgba(255, 149, 0, 0.25);',
        inactive: 'background-color:rgba(255, 59, 48, 0.15); color:var(--ios-red); border:1px solid rgba(255, 59, 48, 0.25);',
    },

    // Badges
    badges: {
        base: 'padding:4px 10px; border-radius:12px; font-weight:500; white-space:nowrap; display:inline-flex; align-items:center; gap:4px;',
        small: 'padding:3px 6px; font-size:11px; border-radius:8px;',
        medium: 'padding:4px 8px; font-size:12px; border-radius:10px;',
        large: 'padding:5px 10px; font-size:13px; border-radius:12px;',
        status: {
            eligible: 'border-radius:16px; background-color:rgba(0, 122, 255, 0.1); color:var(--ios-blue); border:1px solid rgba(0, 122, 255, 0.2); padding:5px 12px; font-weight:600; font-size:13px; display:inline-flex; align-items:center; gap:4px;',
            enrolled: 'border-radius:16px; background-color:rgba(52, 199, 89, 0.1); color:var(--ios-green); border:1px solid rgba(52, 199, 89, 0.2); padding:5px 12px; font-weight:600; font-size:13px; display:inline-flex; align-items:center; gap:4px;'
        }
    },

    // Modal styles
    modal: {
        overlay: 'position:fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(0,0,0,0.4); backdrop-filter:blur(8px); -webkit-backdrop-filter:blur(8px); z-index:10001; display:flex; justify-content:center; align-items:center; transition:opacity 0.3s ease;',
        container: 'background-color:#fff; border-radius:16px; box-shadow:0 20px 60px rgba(0,0,0,0.15); width:90%; max-height:90vh; overflow:hidden; display:flex; flex-direction:column; transform:translateY(40px) scale(0.95); opacity:0; transition:all 0.3s cubic-bezier(0.16, 1, 0.3, 1);',
        header: 'padding:20px; border-bottom:1px solid rgba(0,0,0,0.08); position:relative; display:flex; justify-content:space-between; align-items:center;',
        title: 'margin:0; font-size:1.3rem; font-weight:600; color:var(--ios-text-primary);',
        closeButton: 'background:rgba(0,0,0,0.05); border:none; width:32px; height:32px; border-radius:50%; display:flex; align-items:center; justify-content:center; cursor:pointer; position:absolute; top:16px; right:16px; transition:all 0.2s ease; color:#666; z-index:5;',
        content: 'padding:20px; overflow-y:auto; flex:1;',
        tabContainer: 'display:flex; border-bottom:1px solid rgba(0,0,0,0.1); padding:0 20px; background-color:#f8f8f8;',
        tab: 'padding:12px 20px; background:none; border:none; border-bottom:3px solid transparent; font-size:15px; font-weight:500; color:#555; cursor:pointer; transition:all 0.2s ease; margin-right:8px;',
        tabActive: 'border-bottom-color:var(--ios-blue); color:var(--ios-blue);',
    },

    // Utility styles
    utils: {
        shadow: 'box-shadow:var(--ios-shadow-sm);',
        shadowHover: 'box-shadow:var(--ios-shadow-md);',
        roundedCorners: 'border-radius:12px;',
        border: 'border:1px solid rgba(0,0,0,0.08);',
        transition: 'transition:all 0.2s ease;',
    },

    // Gradients
    gradients: {
        primary: 'linear-gradient(135deg, #4CAF50, #2196F3)',
        success: 'linear-gradient(135deg, #4CAF50, #8BC34A)',
        warning: 'linear-gradient(135deg, #FF9800, #FFC107)',
        danger: 'linear-gradient(135deg, #F44336, #FF5722)',
    },

    // Glass morphism effects
    glass: {
        card: 'background:rgba(255, 255, 255, 0.7); backdrop-filter:blur(12px); -webkit-backdrop-filter:blur(12px); border-radius:var(--ios-radius); border:1px solid rgba(255, 255, 255, 0.3); box-shadow:0 8px 32px rgba(0, 0, 0, 0.1);',
        overlay: 'background:rgba(255, 255, 255, 0.85); backdrop-filter:blur(20px); -webkit-backdrop-filter:blur(20px); border-radius:24px; border:1px solid rgba(255, 255, 255, 0.4); box-shadow:0 20px 80px rgba(0, 0, 0, 0.2);',
    },

    // Hover effects
    hover: {
        lift: 'transition:transform 0.2s ease, box-shadow 0.2s ease; &:hover { transform:translateY(-4px); box-shadow:var(--ios-shadow-md); }',
        scale: 'transition:transform 0.2s ease; &:hover { transform:scale(1.05); }',
    },

    // Animation effects
    animation: {
        fadeIn: 'animation:fadeIn 0.3s ease forwards;',
        slideIn: 'animation:slideIn 0.3s ease forwards;',
        bounce: 'animation:bounce 0.3s ease;',
    }
};