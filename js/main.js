
// Mock Data
const mockTrades = [
    { date: '2024-04-24', symbol: 'AAPL', type: 'Long', entry: 175.50, exit: 178.30, pl: 280.00 },
    { date: '2024-04-23', symbol: 'TSLA', type: 'Short', entry: 142.80, exit: 140.20, pl: 260.00 },
    { date: '2024-04-22', symbol: 'MSFT', type: 'Long', entry: 384.20, exit: 382.10, pl: -210.00 },
    { date: '2024-04-21', symbol: 'AMZN', type: 'Long', entry: 178.90, exit: 180.50, pl: 160.00 },
    { date: '2024-04-20', symbol: 'META', type: 'Short', entry: 481.30, exit: 483.20, pl: -190.00 },
];

// Navigation Functions
function showSection(sectionId) {
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.add('d-none');
    });
    document.getElementById(sectionId).classList.remove('d-none');
}

// Initialize Dashboard Charts
document.addEventListener('DOMContentLoaded', function() {
    // Performance Chart
    const performanceCtx = document.getElementById('performanceChart').getContext('2d');
    new Chart(performanceCtx, {
        type: 'line',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [{
                label: 'Account Balance',
                data: [10000, 11200, 10800, 12400, 13100, 15500],
                borderColor: '#0d6efd',
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });

    // Win Rate Chart
    const winRateCtx = document.getElementById('winRateChart').getContext('2d');
    new Chart(winRateCtx, {
        type: 'doughnut',
        data: {
            labels: ['AAPL', 'TSLA', 'MSFT', 'AMZN', 'META'],
            datasets: [{
                data: [75, 65, 80, 70, 60],
                backgroundColor: [
                    '#0d6efd',
                    '#6610f2',
                    '#6f42c1',
                    '#d63384',
                    '#dc3545'
                ]
            }]
        }
    });

    // Monthly Profit Chart
    const monthlyProfitCtx = document.getElementById('monthlyProfitChart').getContext('2d');
    new Chart(monthlyProfitCtx, {
        type: 'bar',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [{
                label: 'Monthly Profit',
                data: [1200, -800, 1600, 700, 2100, 2400],
                backgroundColor: '#0d6efd'
            }]
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

    // Login Form Handler
    document.getElementById('loginForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        // Mock login - In a real app, this would make an API call
        alert('Login functionality would be implemented here');
        
        // Clear form
        this.reset();
    });
});
