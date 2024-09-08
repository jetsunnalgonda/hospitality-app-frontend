<template>
  <div class="dashboard">
    <div class="dashboard-header">
      <h1>Hospital Dashboard</h1>
      <p>Welcome, {{ userName }}. Here's an overview of the current status.</p>
    </div>

    <div class="stats-overview">
      <div class="stat-card">
        <h2>Admissions Today</h2>
        <p>32</p>
      </div>
      <div class="stat-card">
        <h2>Discharges Today</h2>
        <p>20</p>
      </div>
      <div class="stat-card">
        <h2>Surgeries Scheduled</h2>
        <p>8</p>
      </div>
      <div class="stat-card">
        <h2>Critical Patients</h2>
        <p>4</p>
      </div>
    </div>

    <div class="charts-overview">
      <div class="chart-card">
        <h3>Patient Admissions (Last 7 Days)</h3>
        <!-- Chart component would go here -->
        <!-- <div class="chart-placeholder">Chart</div> -->
        <div class="chart-container">
          <canvas id="admissionsChart"></canvas>
        </div>
      </div>
      <div class="chart-card">
        <h3>Occupancy Rate</h3>
        <!-- Another chart component -->
        <div class="chart-placeholder">Chart</div>
      </div>
    </div>
  </div>


</template>

<script>
import { Chart, registerables } from 'chart.js';
import { mapGetters } from 'vuex';

// Register all components
Chart.register(...registerables);

export default {
  name: 'DashboardView',
  data() {
    return {
      isLoading: false,
      // user: null,
      showDropdown: false,
      defaultAvatarUrl: '/default-avatar.jpg', // Default avatar image URL
      apiBaseUrl: process.env.VUE_APP_API_BASE_URL,
      // profilePicUrl: this.defaultAvatarUrl,
    };
  },
  computed: {
    ...mapGetters('user', ['user']),

    userName() {
      console.log('userName change triggered');
      console.log('userName is', this.user?.name);
      console.log('user avatar is', this.user?.avatars)
      console.log('imageKey: ' + this.user?.avatars?.[0]?.url)
      return this.user?.name || 'Guest';
    },

  },
  mounted() {
    const ctx = document.getElementById('admissionsChart').getContext('2d');
    new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        datasets: [
          {
            label: 'Patient Admissions',
            data: [12, 19, 3, 5, 2, 3, 7],
            backgroundColor: 'rgba(93, 166, 240, 0.2)',
            borderColor: '#5da6f0',
            borderWidth: 2,
            pointBackgroundColor: '#5da6f0',
            pointBorderColor: '#fff',
            pointHoverBackgroundColor: '#fff',
            pointHoverBorderColor: '#5da6f0',
          },
        ],
      },
      options: {
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              color: '#2c3e50',
              font: {
                size: 12,
              },
            },
            grid: {
              color: 'rgba(44, 62, 80, 0.1)',
            },
          },
          x: {
            ticks: {
              color: '#2c3e50',
              font: {
                size: 12,
              },
            },
            grid: {
              color: 'rgba(44, 62, 80, 0.1)',
            },
          },
        },
        plugins: {
          legend: {
            display: true,
            labels: {
              color: '#2c3e50',
              font: {
                size: 14,
              },
            },
          },
        },
        responsive: true,
        maintainAspectRatio: false,
      },
    });
  },
};
</script>


<style scoped>
/* .chart-container {
  position: relative;
  height: 300px;
  width: 100%;
  margin: 0 auto;
}

.dashboard {
  padding: 20px;
  background-color: #f8faff;
}

.dashboard-header {
  margin-bottom: 30px;
}

.dashboard-header h1 {
  font-size: 2.5em;
  color: #2c3e50;
}

.dashboard-header p {
  font-size: 1.2em;
  color: #777;
}

.stats-overview {
  display: flex;
  justify-content: space-between;
  margin-bottom: 30px;
}

.stat-card {
  background-color: #eef2f7;
  padding: 20px;
  border-radius: 10px;
  width: 22%;
  text-align: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;
}

.stat-card:hover {
  transform: scale(1.05);
}

.stat-card h2 {
  font-size: 1.5em;
  color: #2c3e50;
  margin-bottom: 10px;
}

.stat-card p {
  font-size: 2.5em;
  color: #5da6f0;
  margin: 0;
}

.charts-overview {
  display: flex;
  justify-content: space-between;
}

.chart-card {
  background-color: #eef2f7;
  padding: 20px;
  border-radius: 10px;
  width: 48%;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.chart-card h3 {
  font-size: 1.5em;
  color: #2c3e50;
  margin-bottom: 20px;
}

.chart-placeholder {
  background-color: #d1d9e6;
  height: 200px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #777;
  font-size: 1.2em;
} */
</style>
