import { execa } from 'execa';
import chalk from 'chalk';

export const autoCommitAndPush = async (message: string) => {
  try {
    console.log(chalk.blue('🚀 Automating Git: commit and push...'));
    await execa('git', ['add', '.']);
    await execa('git', ['commit', '-m', message]);
    
    // Check if remote exists before pushing
    const { stdout } = await execa('git', ['remote']);
    if (stdout.trim()) {
      await execa('git', ['push']);
      console.log(chalk.green('✔ Changes pushed to remote.'));
    } else {
      console.log(chalk.yellow('⚠ No remote found, only committed locally.'));
    }
  } catch (err: any) {
    console.log(chalk.red('⚠ Git automation failed (maybe no changes or no remote):'), err.message);
  }
};
