
// Mock Data
const mockTrades = [
    { date: '2024-05-18', symbol: 'AAPL', type: 'Long', entry: 175.50, exit: 178.30, pl: 280.00 },
    { date: '2024-05-17', symbol: 'TSLA', type: 'Short', entry: 142.80, exit: 140.20, pl: 260.00 },
    { date: '2024-05-17', symbol: 'MSFT', type: 'Long', entry: 384.20, exit: 382.10, pl: -210.00 },
    { date: '2024-05-16', symbol: 'AMZN', type: 'Long', entry: 178.90, exit: 180.50, pl: 160.00 },
    { date: '2024-05-16', symbol: 'META', type: 'Short', entry: 481.30, exit: 483.20, pl: -190.00 },
    { date: '2024-05-15', symbol: 'GOOGL', type: 'Long', entry: 171.20, exit: 173.40, pl: 220.00 },
    { date: '2024-05-15', symbol: 'NFLX', type: 'Short', entry: 628.50, exit: 622.30, pl: 310.00 },
    { date: '2024-05-14', symbol: 'DIS', type: 'Long', entry: 113.70, exit: 115.60, pl: 190.00 },
    { date: '2024-05-14', symbol: 'NVDA', type: 'Short', entry: 924.80, exit: 930.20, pl: -270.00 },
    { date: '2024-05-13', symbol: 'AMD', type: 'Long', entry: 170.30, exit: 168.40, pl: -190.00 }
];

// Mock Portfolio Data
const portfolioData = {
    totalValue: 25450.00,
    todayChange: 450.00,
    todayChangePercent: 1.8,
    positions: [
        { symbol: 'AAPL', shares: 10, avgPrice: 170.40, currentPrice: 178.30, value: 1783.00, pl: 79.00, plPercent: 4.64 },
        { symbol: 'MSFT', shares: 5, avgPrice: 380.20, currentPrice: 382.10, value: 1910.50, pl: 9.50, plPercent: 0.50 },
        { symbol: 'GOOGL', shares: 8, avgPrice: 170.50, currentPrice: 173.40, value: 1387.20, pl: 23.20, plPercent: 1.70 },
        { symbol: 'AMZN', shares: 7, avgPrice: 177.30, currentPrice: 180.50, value: 1263.50, pl: 22.40, plPercent: 1.80 }
    ]
};

// Mock Analytics Data
const analyticsData = {
    winRate: 65,
    avgWin: 230.00,
    avgLoss: 215.00,
    bestTrade: 310.00,
    worstTrade: -270.00,
    profitFactor: 1.8
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
    
    return {
        totalTrades,
        winningTrades: winningTrades.length,
        losingTrades: totalTrades - winningTrades.length,
        winRate,
        totalPL
    };
}

// Initialize Dashboard Charts
document.addEventListener('DOMContentLoaded', function() {
    // Set initial active section
    document.querySelector('.nav-link[onclick="showSection(\'dashboard\')"]').classList.add('active');
    
    // Calculate trade summary
    const summary = calculateSummary(mockTrades);
    
    // Update summary cards
    document.querySelector('#dashboard .card:nth-child(1) h3').textContent = `$${summary.totalPL}`;
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

    // Populate Trades Table
    const tradesTableBody = document.getElementById('tradesTableBody');
    mockTrades.forEach(trade => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${trade.date}</td>
            <td>${trade.symbol}</td>
            <td>${trade.type}</td>
            <td>$${trade.entry.toFixed(2)}</td>
            <td>$${trade.exit.toFixed(2)}</td>
            <td class="${trade.pl >= 0 ? 'text-success' : 'text-danger'}">$${trade.pl.toFixed(2)}</td>
        `;
        tradesTableBody.appendChild(row);
    });

    // Add Analytics Summary Cards
    const analyticsSection = document.getElementById('analytics');
    const analyticsRow = document.createElement('div');
    analyticsRow.className = 'row mt-4 mb-4';
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
    `;
    analyticsSection.insertBefore(analyticsRow, analyticsSection.firstChild.nextSibling);

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

