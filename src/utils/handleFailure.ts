import { FailureAction, FailurePolicy } from '../types/FailurePolicy';

export function handleFailure(
  policy: FailurePolicy,
  actions: Record<FailureAction, () => void>
): void {
  if (policy === 'ignore') {
    return;
  }

  actions[policy]();
}
