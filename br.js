// branch manager
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const { argv } = require('yargs/yargs')(process.argv.slice(2))
  .alias('d', 'delete');

function handleError({ message }, branch) {
  if (message.includes('invalid reference')) {
    return 'git switch -c';
  }
  if (message.includes('Cannot delete') && message.includes('checked out')) {
    console.log(`Cannot delete ${branch} because it is checkout out`);
    return;
  }
  console.log(`error: ${message}`);
}

function handleFail(message, branch) {
  if (message.includes('Switched to a new')) {
    console.log(`Created branch ${branch}`);
    return;
  }
  if (message.includes('Already on') || message.includes('Switched to')) {
    return;
  }
  console.log(`${message}`);
}

function listBranches(branches) {
  for (let i = 0; i < branches.length - 1; i += 1) {
    console.log(`${i + 1}: ${branches[i]}`);
  }
}

async function git(branch, command = 'git switch') {
  try {
    const { stdout, stderr } = await exec(`${command} ${branch || ''}`);
    // console.log(`command: ${command} stderr: ${stderr} stdout: ${stdout}`);

    if (stderr) return handleFail(stderr, branch);
    return stdout;
  } catch (error) {
    return handleError(error, branch);
  }
}

async function getBranches() {
  const list = await git(null, 'git branch');
  return list.split('\n');
}

async function getBranchFromNumber(arg) {
  if (!Number.isInteger(parseInt(arg, 10))) return arg;

  const i = parseInt(arg, 10) - 1;
  const branches = await getBranches();
  const branch = branches[i];

  return branch.trim();
}

async function showBranches() {
  const branches = await getBranches();
  await listBranches(branches);
}

async function switchBranch(branch) {
  if (!branch) return;

  if (branch.includes('*')) {
    console.log(`Already on ${branch})`);
    return;
  }

  console.log(`Switching to ${branch}`);
  let command = 'git switch';
  do {
    // eslint-disable-next-line
    command = await git(branch, command);
  } while (command);
}

async function main() {
  // console.log(`-d: ${argv.d}  branch: ${argv._}`);
  let branch = argv.d || argv._.find((x) => x !== undefined);

  branch = await getBranchFromNumber(branch);

  if (argv.d) {
    console.log(`Deleting branch ${branch}`);
    await git(branch, 'git branch -d');

    return showBranches();
  }

  await switchBranch(branch);
  const branches = await getBranches();
  listBranches(branches);
}

main();
