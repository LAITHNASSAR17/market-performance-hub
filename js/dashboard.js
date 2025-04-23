
/**
 * Market Performance Hub - Dashboard Page JavaScript
 */

document.addEventListener('DOMContentLoaded', function() {
  // Make sure user is authenticated
  if (!localStorage.getItem('authToken') && !sessionStorage.getItem('authToken')) {
    window.location.href = 'login.html';
    return;
  }
  
  // Initialize dashboard elements
  initDashboardStats();
  initCharts();
  
  // For demo, load mock data
  loadMockData();
});

function initDashboardStats() {
  // This function would typically fetch real data from an API
  // For this demo, we'll use mock data
}

function initCharts() {
  // Initialize Profit/Loss Chart
  const plChartCtx = document.getElementById('profitLossChart').getContext('2d');
  const plChart = new Chart(plChartCtx, {
    type: 'line',
    data: {
      labels: [], // Will be populated with dates
      datasets: [{
        label: 'Daily P/L',
        data: [], // Will be populated with P/L values
        backgroundColor: 'rgba(13, 110, 253, 0.1)',
        borderColor: 'rgba(13, 110, 253, 1)',
        borderWidth: 2,
        tension: 0.1,
        fill: true
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: false,
          grid: {
            drawBorder: false,
          },
          ticks: {
            callback: function(value) {
              return '$' + value;
            }
          }
        },
        x: {
          grid: {
            display: false
          }
        }
      },
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              return 'P/L: $' + context.parsed.y;
            }
          }
        }
      }
    }
  });
  
  // Initialize Win/Loss Pie Chart
  const winLossChartCtx = document.getElementById('winLossPieChart').getContext('2d');
  const winLossChart = new Chart(winLossChartCtx, {
    type: 'doughnut',
    data: {
      labels: ['Wins', 'Losses'],
      datasets: [{
        data: [65, 35], // Win/Loss percentage
        backgroundColor: [
          'rgba(25, 135, 84, 0.8)',
          'rgba(220, 53, 69, 0.8)'
        ],
        borderColor: [
          'rgba(25, 135, 84, 1)',
          'rgba(220, 53, 69, 1)'
        ],
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom'
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              return context.label + ': ' + context.parsed + '%';
            }
          }
        }
      }
    }
  });
  
  // Store chart references globally to update later
  window.dashboardCharts = {
    plChart,
    winLossChart
  };
}

function loadMockData() {
  // Mock data for the Profit/Loss chart
  const dates = [];
  const profitLoss = [];
  
  // Generate last 14 days of mock data
  for (let i = 13; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    dates.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
    
    // Generate random P/L between -500 and 500
    const dailyPL = Math.floor(Math.random() * 1000) - 500;
    profitLoss.push(dailyPL);
  }
  
  // Update the P/L chart with the mock data
  window.dashboardCharts.plChart.data.labels = dates;
  window.dashboardCharts.plChart.data.datasets[0].data = profitLoss;
  window.dashboardCharts.plChart.update();
  
  // Calculate overall stats from the mock data
  const totalPL = profitLoss.reduce((acc, val) => acc + val, 0);
  const wins = profitLoss.filter(p => p > 0).length;
  const losses = profitLoss.filter(p => p <= 0).length;
  const winRate = wins / (wins + losses) * 100;
  const totalTrades = wins + losses;
  const avgTrade = totalPL / totalTrades;
  
  // Update the dashboard stats with the calculated values
  document.getElementById('totalProfitLoss').textContent = formatCurrency(totalPL);
  document.getElementById('winRate').textContent = winRate.toFixed(1) + '%';
  document.getElementById('totalTrades').textContent = totalTrades;
  document.getElementById('avgTrade').textContent = formatCurrency(avgTrade);
  
  // Update the win/loss pie chart
  window.dashboardCharts.winLossChart.data.datasets[0].data = [winRate, 100 - winRate];
  window.dashboardCharts.winLossChart.update();
  
  // In a real app, you would load recent trades data here from the API
  // For the demo, we're using the hardcoded trades in the HTML
}
