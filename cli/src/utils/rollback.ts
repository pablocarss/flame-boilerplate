import { logWarning, logError } from './logger';

interface Step {
  name: string;
  execute: () => Promise<void>;
  rollback: () => Promise<void>;
}

export class ProjectCreator {
  private steps: Step[] = [];
  private executedSteps: number = 0;

  addStep(step: Step) {
    this.steps.push(step);
  }

  async execute() {
    try {
      for (let i = 0; i < this.steps.length; i++) {
        const step = this.steps[i];
        await step.execute();
        this.executedSteps++;
      }
    } catch (error) {
      logError('Error occurred during project creation. Rolling back...', error as Error);
      await this.rollback();
      throw error;
    }
  }

  async rollback() {
    logWarning(`\nRolling back ${this.executedSteps} step(s)...`);

    for (let i = this.executedSteps - 1; i >= 0; i--) {
      const step = this.steps[i];
      try {
        logWarning(`Rolling back: ${step.name}`);
        await step.rollback();
      } catch (rollbackError) {
        logError(`Failed to rollback ${step.name}`, rollbackError as Error);
      }
    }
  }

  getStepCount(): number {
    return this.steps.length;
  }
}
