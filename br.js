// branch manager
const { exec } = require('child_process');
const branch = process.argv[2];

if (branch) {
  exec(`git switch ${branch}`, (error, stdout, stderr) => {
    if (error) {
      console.log(`error: ${error.message}`);
      return;
    }
    if (stderr) {
      console.log(`stderr: ${stderr}`);
      return;
    }
    console.log(`stdout: ${stdout}`);
      
  });
}


