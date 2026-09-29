export type StepResult = {
  valid: boolean;
  timing: 'perfect' | 'good' | 'late' | 'miss';
  impulse: number;
};

export class RunInput {
  private lastKey: 'A' | 'D' | null = null;
  private lastStepAt = 0;
  private combo = 0;

  reset(): void {
    this.lastKey = null;
    this.lastStepAt = 0;
    this.combo = 0;
  }

  getCombo(): number {
    return this.combo;
  }

  step(key: 'A' | 'D', now: number): StepResult {
    if (this.lastKey === key) {
      this.combo = 0;
      this.lastKey = key;
      this.lastStepAt = now;
      return { valid: false, timing: 'miss', impulse: 0 };
    }

    const delta = this.lastStepAt === 0 ? 220 : now - this.lastStepAt;
    this.lastKey = key;
    this.lastStepAt = now;

    if (delta < 75) {
      this.combo = 0;
      return { valid: false, timing: 'miss', impulse: 0 };
    }

    if (delta <= 165) {
      this.combo += 1;
      return {
        valid: true,
        timing: 'perfect',
        impulse: 88 + Math.min(this.combo, 20) * 2,
      };
    }

    if (delta <= 260) {
      this.combo += 1;
      return {
        valid: true,
        timing: 'good',
        impulse: 68 + Math.min(this.combo, 12),
      };
    }

    this.combo = Math.max(0, this.combo - 1);
    return { valid: true, timing: 'late', impulse: 38 };
  }
}
