const { execSync } = require('child_process');

/**
 * Kill any process using port 5000
 * Works cross-platform (Windows, Linux, Mac)
 */
const PORT = process.env.PORT || 5000;

function killPort() {
  try {
    const platform = process.platform;

    if (platform === 'win32') {
      // Windows
      try {
        // Find the PID using the port
        const output = execSync(`netstat -ano | findstr :${PORT}`, { encoding: 'utf8' });

        // Extract PIDs from netstat output
        const lines = output.split('\n');
        const pids = new Set();

        lines.forEach(line => {
          const match = line.match(/LISTENING\s+(\d+)/);
          if (match) {
            pids.add(match[1]);
          }
        });

        // Kill each process
        if (pids.size > 0) {
          pids.forEach(pid => {
            try {
              execSync(`taskkill /F /PID ${pid}`, { stdio: 'ignore' });
              console.log(`✓ Killed process ${pid} using port ${PORT}`);
            } catch (err) {
              // Process might already be dead, ignore
            }
          });
        } else {
          console.log(`✓ Port ${PORT} is free`);
        }
      } catch (err) {
        // No process found on port - this is fine
        console.log(`✓ Port ${PORT} is free`);
      }
    } else {
      // Linux/Mac
      try {
        const output = execSync(`lsof -ti:${PORT}`, { encoding: 'utf8' });
        const pids = output.trim().split('\n').filter(Boolean);

        if (pids.length > 0) {
          pids.forEach(pid => {
            try {
              execSync(`kill -9 ${pid}`, { stdio: 'ignore' });
              console.log(`✓ Killed process ${pid} using port ${PORT}`);
            } catch (err) {
              // Process might already be dead, ignore
            }
          });
        } else {
          console.log(`✓ Port ${PORT} is free`);
        }
      } catch (err) {
        // No process found on port - this is fine
        console.log(`✓ Port ${PORT} is free`);
      }
    }
  } catch (error) {
    console.error(`Error checking port ${PORT}:`, error.message);
    // Don't exit with error - allow the server to try starting anyway
  }
}

killPort();
