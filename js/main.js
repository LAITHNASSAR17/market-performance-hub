
// Mock Data - Extended with more realistic trades
const mockTrades = [
    { date: '2024-05-18', symbol: 'AAPL', type: 'Long', entry: 175.50, exit: 178.30, pl: 280.00, volume: 100, fees: 5.50 },
    { date: '2024-05-17', symbol: 'TSLA', type: 'Short', entry: 142.80, exit: 140.20, pl: 260.00, volume: 50, fees: 3.75 },
    { date: '2024-05-17', symbol: 'MSFT', type: 'Long', entry: 384.20, exit: 382.10, pl: -210.00, volume: 25, fees: 2.80 },
    { date: '2024-05-16', symbol: 'AMZN', type: 'Long', entry: 178.90, exit: 180.50, pl: 160.00, volume: 30, fees: 3.10 },
    { date: '2024-05-16', symbol: 'META', type: 'Short', entry: 481.30, exit: 483.20, pl: -190.00, volume: 20, fees: 2.50 },
    { date: '2024-05-15', symbol: 'GOOGL', type: 'Long', entry: 171.20, exit: 173.40, pl: 220.00, volume: 35, fees: 3.25 },
    { date: '2024-05-15', symbol: 'NFLX', type: 'Short', entry: 628.50, exit: 622.30, pl: 310.00, volume: 15, fees: 2.20 },
    { date: '2024-05-14', symbol: 'DIS', type: 'Long', entry: 113.70, exit: 115.60, pl: 190.00, volume: 45, fees: 3.65 },
    { date: '2024-05-14', symbol: 'NVDA', type: 'Short', entry: 924.80, exit: 930.20, pl: -270.00, volume: 10, fees: 2.00 },
    { date: '2024-05-13', symbol: 'AMD', type: 'Long', entry: 170.30, exit: 168.40, pl: -190.00, volume: 30, fees: 3.10 },
    { date: '2024-05-12', symbol: 'INTC', type: 'Short', entry: 30.40, exit: 29.70, pl: 70.00, volume: 120, fees: 6.25 },
    { date: '2024-05-11', symbol: 'PYPL', type: 'Long', entry: 61.50, exit: 63.80, pl: 230.00, volume: 80, fees: 4.20 },
    { date: '2024-05-10', symbol: 'BABA', type: 'Long', entry: 72.30, exit: 73.80, pl: 150.00, volume: 60, fees: 3.95 },
    { date: '2024-05-09', symbol: 'PLTR', type: 'Short', entry: 22.70, exit: 23.50, pl: -80.00, volume: 150, fees: 7.50 },
    { date: '2024-05-08', symbol: 'COIN', type: 'Long', entry: 243.20, exit: 255.30, pl: 360.00, volume: 30, fees: 3.10 },
    { date: '2024-05-07', symbol: 'SQ', type: 'Short', entry: 75.40, exit: 72.50, pl: 290.00, volume: 40, fees: 3.45 },
    { date: '2024-05-06', symbol: 'ROKU', type: 'Long', entry: 55.80, exit: 54.30, pl: -150.00, volume: 45, fees: 3.65 },
    { date: '2024-05-05', symbol: 'SBUX', type: 'Long', entry: 78.40, exit: 80.20, pl: 180.00, volume: 55, fees: 3.85 },
    { date: '2024-05-04', symbol: 'MU', type: 'Short', entry: 120.30, exit: 117.50, pl: 280.00, volume: 30, fees: 3.10 },
    { date: '2024-05-03', symbol: 'CSCO', type: 'Long', entry: 48.70, exit: 48.10, pl: -60.00, volume: 70, fees: 4.05 }
];

// Mock Portfolio Data - Extended with more positions
const portfolioData = {
    totalValue: 25450.00,
    todayChange: 450.00,
    todayChangePercent: 1.8,
    cashBalance: 8540.00,
    marginUsed: 16910.00,
    positions: [
        { symbol: 'AAPL', shares: 10, avgPrice: 170.40, currentPrice: 178.30, value: 1783.00, pl: 79.00, plPercent: 4.64, sector: 'Technology' },
        { symbol: 'MSFT', shares: 5, avgPrice: 380.20, currentPrice: 382.10, value: 1910.50, pl: 9.50, plPercent: 0.50, sector: 'Technology' },
        { symbol: 'GOOGL', shares: 8, avgPrice: 170.50, currentPrice: 173.40, value: 1387.20, pl: 23.20, plPercent: 1.70, sector: 'Technology' },
        { symbol: 'AMZN', shares: 7, avgPrice: 177.30, currentPrice: 180.50, value: 1263.50, pl: 22.40, plPercent: 1.80, sector: 'Consumer Discretionary' },
        { symbol: 'META', shares: 4, avgPrice: 475.60, currentPrice: 483.20, value: 1932.80, pl: 30.40, plPercent: 1.60, sector: 'Communication Services' },
        { symbol: 'TSLA', shares: 8, avgPrice: 145.70, currentPrice: 142.80, value: 1142.40, pl: -23.20, plPercent: -1.99, sector: 'Consumer Discretionary' },
        { symbol: 'NVDA', shares: 2, avgPrice: 910.30, currentPrice: 924.80, value: 1849.60, pl: 29.00, plPercent: 1.59, sector: 'Technology' },
        { symbol: 'JPM', shares: 12, avgPrice: 187.50, currentPrice: 192.40, value: 2308.80, pl: 58.80, plPercent: 2.61, sector: 'Financials' },
        { symbol: 'V', shares: 6, avgPrice: 271.20, currentPrice: 276.50, value: 1659.00, pl: 31.80, plPercent: 1.95, sector: 'Financials' },
        { symbol: 'JNJ', shares: 9, avgPrice: 155.70, currentPrice: 152.30, value: 1370.70, pl: -30.60, plPercent: -2.18, sector: 'Healthcare' }
    ]
};

// Mock Analytics Data - Extended with more metrics
const analyticsData = {
    winRate: 65,
    avgWin: 230.00,
    avgLoss: 215.00,
    bestTrade: 360.00,
    worstTrade: -270.00,
    profitFactor: 1.8,
    expectedValue: 67.5,
    totalTrades: 124,
    totalWinningTrades: 81,
    totalLosingTrades: 43,
    avgTradeLength: 185, // minutes
    bestDay: "2024-05-08",
    worstDay: "2024-05-03",
    bestSymbol: "COIN",
    worstSymbol: "NVDA",
    maxConsecutiveWins: 7,
    maxConsecutiveLosses: 3,
    sectorPerformance: {
        Technology: 42.5,
        Financials: 28.7,
        Healthcare: -12.3,
        ConsumerDiscretionary: 18.9,
        CommunicationServices: 22.4,
        Energy: -8.6,
        Materials: 5.3,
        Industrials: 15.8,
        Utilities: -3.2,
        RealEstate: -7.5
    },
    timeOfDayPerformance: {
        "Pre-market": 18.5,
        "Morning": 45.2,
        "Afternoon": -12.8,
        "Power Hour": 35.6,
        "After-hours": 14.5
    }
};

// Navigation Functions
function showSection(sectionId) {
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.add('d-none');
    });
    document.getElementById(sectionId).classList.remove('d-none');
    
    // Update active nav item
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    document.querySelector(`.nav-link[onclick="showSection('${sectionId}')"]`).classList.add('active');
}

// Calculate summary data
function calculateSummary(trades) {
    const totalTrades = trades.length;
    const winningTrades = trades.filter(trade => trade.pl > 0);
    const winRate = (winningTrades.length / totalTrades * 100).toFixed(1);
    const totalPL = trades.reduce((sum, trade) => sum + trade.pl, 0).toFixed(2);
    const totalFees = trades.reduce((sum, trade) => sum + (trade.fees || 0), 0).toFixed(2);
    const netPL = (parseFloat(totalPL) - parseFloat(totalFees)).toFixed(2);
    
    return {
        totalTrades,
        winningTrades: winningTrades.length,
        losingTrades: totalTrades - winningTrades.length,
        winRate,
        totalPL,
        totalFees,
        netPL
    };
}

// Generate daily PL data
function generateDailyPLData() {
    const days = ['10 May', '11 May', '12 May', '13 May', '14 May', '15 May', '16 May', '17 May', '18 May', '19 May'];
    return days.map((day, index) => {
        const isProfit = Math.random() > 0.3;
        const value = isProfit 
            ? Math.floor(Math.random() * 500) + 100 
            : -Math.floor(Math.random() * 300) - 50;
        return {
            day,
            value
        };
    });
}

// Generate sector performance data
function generateSectorData() {
    const sectors = Object.keys(analyticsData.sectorPerformance);
    return sectors.map(sector => ({
        sector,
        performance: analyticsData.sectorPerformance[sector]
    }));
}

// Initialize Dashboard Charts
document.addEventListener('DOMContentLoaded', function() {
    // Set initial active section
    document.querySelector('.nav-link[onclick="showSection(\'dashboard\')"]').classList.add('active');
    
    // Calculate trade summary
    const summary = calculateSummary(mockTrades);
    
    // Update summary cards
    document.querySelector('#dashboard .card:nth-child(1) h3').textContent = `$${summary.netPL}`;
    document.querySelector('#dashboard .card:nth-child(2) h3').textContent = `${summary.winRate}%`;
    document.querySelector('#dashboard .card:nth-child(3) h3').textContent = summary.totalTrades;
    
    // Performance Chart
    const performanceCtx = document.getElementById('performanceChart').getContext('2d');
    new Chart(performanceCtx, {
        type: 'line',
        data: {
            labels: ['10 May', '11 May', '12 May', '13 May', '14 May', '15 May', '16 May', '17 May', '18 May', '19 May'],
            datasets: [{
                label: 'Account Balance',
                data: [10000, 11200, 10800, 12400, 13100, 15500, 14800, 15200, 16400, 17300],
                borderColor: '#0d6efd',
                tension: 0.4,
                fill: {
                    target: 'origin',
                    above: 'rgba(13, 110, 253, 0.1)'
                }
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `Balance: $${context.parsed.y.toLocaleString()}`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    grid: {
                        display: true,
                        color: 'rgba(0, 0, 0, 0.05)'
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            }
        }
    });

    // Win Rate Chart
    const winRateCtx = document.getElementById('winRateChart').getContext('2d');
    new Chart(winRateCtx, {
        type: 'doughnut',
        data: {
            labels: ['AAPL', 'TSLA', 'MSFT', 'AMZN', 'META', 'GOOGL'],
            datasets: [{
                data: [75, 65, 80, 70, 60, 85],
                backgroundColor: [
                    '#0d6efd',
                    '#6610f2',
                    '#6f42c1',
                    '#d63384',
                    '#dc3545',
                    '#fd7e14'
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        boxWidth: 12
                    }
                }
            }
        }
    });

    // Monthly Profit Chart
    const monthlyProfitCtx = document.getElementById('monthlyProfitChart').getContext('2d');
    new Chart(monthlyProfitCtx, {
        type: 'bar',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
            datasets: [{
                label: 'Monthly Profit',
                data: [1200, -800, 1600, 2100, 1400],
                backgroundColor: function(context) {
                    const value = context.dataset.data[context.dataIndex];
                    return value >= 0 ? '#0d6efd' : '#dc3545';
                }
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const value = context.parsed.y;
                            return `Profit: ${value >= 0 ? '+' : ''}$${value.toLocaleString()}`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
    
    // Sector Performance Chart
    if (document.getElementById('sectorPerformanceChart')) {
        const sectorCtx = document.getElementById('sectorPerformanceChart').getContext('2d');
        const sectorData = generateSectorData();
        new Chart(sectorCtx, {
            type: 'bar',
            data: {
                labels: sectorData.map(item => item.sector),
                datasets: [{
                    label: 'Sector Performance (%)',
                    data: sectorData.map(item => item.performance),
                    backgroundColor: function(context) {
                        const value = context.dataset.data[context.dataIndex];
                        return value >= 0 ? '#0d6efd' : '#dc3545';
                    }
                }]
            },
            options: {
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    x: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        }
                    },
                    y: {
                        grid: {
                            display: false
                        }
                    }
                }
            }
        });
    }

    // Populate Trades Table
    const tradesTableBody = document.getElementById('tradesTableBody');
    if (tradesTableBody) {
        tradesTableBody.innerHTML = ''; // Clear existing rows
        mockTrades.forEach(trade => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${trade.date}</td>
                <td>${trade.symbol}</td>
                <td>${trade.type}</td>
                <td>$${trade.entry.toFixed(2)}</td>
                <td>$${trade.exit.toFixed(2)}</td>
                <td>${trade.volume}</td>
                <td>$${trade.fees ? trade.fees.toFixed(2) : '0.00'}</td>
                <td class="${trade.pl >= 0 ? 'text-success' : 'text-danger'}">$${trade.pl.toFixed(2)}</td>
            `;
            tradesTableBody.appendChild(row);
        });
    }
    
    // Populate Portfolio Table
    const portfolioTableBody = document.getElementById('portfolioTableBody');
    if (portfolioTableBody) {
        portfolioTableBody.innerHTML = ''; // Clear existing rows
        portfolioData.positions.forEach(position => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${position.symbol}</td>
                <td>${position.shares}</td>
                <td>$${position.avgPrice.toFixed(2)}</td>
                <td>$${position.currentPrice.toFixed(2)}</td>
                <td>$${position.value.toFixed(2)}</td>
                <td class="${position.pl >= 0 ? 'text-success' : 'text-danger'}">$${position.pl.toFixed(2)}</td>
                <td class="${position.plPercent >= 0 ? 'text-success' : 'text-danger'}">${position.plPercent >= 0 ? '+' : ''}${position.plPercent.toFixed(2)}%</td>
            `;
            portfolioTableBody.appendChild(row);
        });
    }

    // Add Analytics Summary Cards
    const analyticsSection = document.getElementById('analytics');
    if (analyticsSection && !document.querySelector('#analytics-details')) {
        const analyticsRow = document.createElement('div');
        analyticsRow.className = 'row mt-4 mb-4';
        analyticsRow.id = 'analytics-details';
        analyticsRow.innerHTML = `
            <div class="col-md-4 mb-3">
                <div class="card">
                    <div class="card-body">
                        <h5 class="card-title">Win Rate</h5>
                        <h3>${analyticsData.winRate}%</h3>
                    </div>
                </div>
            </div>
            <div class="col-md-4 mb-3">
                <div class="card">
                    <div class="card-body">
                        <h5 class="card-title">Average Win</h5>
                        <h3 class="text-success">$${analyticsData.avgWin.toFixed(2)}</h3>
                    </div>
                </div>
            </div>
            <div class="col-md-4 mb-3">
                <div class="card">
                    <div class="card-body">
                        <h5 class="card-title">Average Loss</h5>
                        <h3 class="text-danger">$${analyticsData.avgLoss.toFixed(2)}</h3>
                    </div>
                </div>
            </div>
            <div class="col-md-4 mb-3">
                <div class="card">
                    <div class="card-body">
                        <h5 class="card-title">Profit Factor</h5>
                        <h3>${analyticsData.profitFactor}</h3>
                    </div>
                </div>
            </div>
            <div class="col-md-4 mb-3">
                <div class="card">
                    <div class="card-body">
                        <h5 class="card-title">Best Trade</h5>
                        <h3 class="text-success">$${analyticsData.bestTrade.toFixed(2)}</h3>
                    </div>
                </div>
            </div>
            <div class="col-md-4 mb-3">
                <div class="card">
                    <div class="card-body">
                        <h5 class="card-title">Worst Trade</h5>
                        <h3 class="text-danger">$${analyticsData.worstTrade.toFixed(2)}</h3>
                    </div>
                </div>
            </div>
            <div class="col-md-4 mb-3">
                <div class="card">
                    <div class="card-body">
                        <h5 class="card-title">Expected Value</h5>
                        <h3>$${analyticsData.expectedValue.toFixed(2)}</h3>
                    </div>
                </div>
            </div>
            <div class="col-md-4 mb-3">
                <div class="card">
                    <div class="card-body">
                        <h5 class="card-title">Max Consecutive Wins</h5>
                        <h3 class="text-success">${analyticsData.maxConsecutiveWins}</h3>
                    </div>
                </div>
            </div>
            <div class="col-md-4 mb-3">
                <div class="card">
                    <div class="card-body">
                        <h5 class="card-title">Max Consecutive Losses</h5>
                        <h3 class="text-danger">${analyticsData.maxConsecutiveLosses}</h3>
                    </div>
                </div>
            </div>
            <div class="col-12 mb-3">
                <div class="card">
                    <div class="card-body">
                        <h5 class="card-title">Sector Performance</h5>
                        <canvas id="sectorPerformanceChart" height="200"></canvas>
                    </div>
                </div>
            </div>
        `;
        analyticsSection.insertBefore(analyticsRow, analyticsSection.firstChild.nextSibling);
        
        // Initialize Sector Performance Chart after adding it to the DOM
        setTimeout(() => {
            if (document.getElementById('sectorPerformanceChart')) {
                const sectorCtx = document.getElementById('sectorPerformanceChart').getContext('2d');
                const sectorData = generateSectorData();
                new Chart(sectorCtx, {
                    type: 'bar',
                    data: {
                        labels: sectorData.map(item => item.sector),
                        datasets: [{
                            label: 'Sector Performance (%)',
                            data: sectorData.map(item => item.performance),
                            backgroundColor: function(context) {
                                const value = context.dataset.data[context.dataIndex];
                                return value >= 0 ? '#0d6efd' : '#dc3545';
                            }
                        }]
                    },
                    options: {
                        indexAxis: 'y',
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: {
                                display: false
                            }
                        },
                        scales: {
                            x: {
                                beginAtZero: true,
                                grid: {
                                    color: 'rgba(0, 0, 0, 0.05)'
                                }
                            },
                            y: {
                                grid: {
                                    display: false
                                }
                            }
                        }
                    }
                });
            }
        }, 100);
    }

    // Login Form Handler
    document.getElementById('loginForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        // Mock login - In a real app, this would make an API call
        alert(`Login attempt with email: ${email} (This is a mock login)`);
        
        // Clear form
        this.reset();
        
        // Redirect to dashboard
        showSection('dashboard');
    });
});
