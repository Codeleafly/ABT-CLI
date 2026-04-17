import { execa } from 'execa';
import chalk from 'chalk';

export const runCommand = async (command: string, args: string[], options = {}) => {
  console.log(chalk.gray(`> Running: ${command} ${args.join(' ')}`));
  try {
    const process = execa(command, args, {
      ...options,
      stdio: 'inherit',
    });
    await process;
    return true;
  } catch (error) {
    console.error(chalk.red(`❌ Command failed: ${command}`), error);
    return false;
  }
};
