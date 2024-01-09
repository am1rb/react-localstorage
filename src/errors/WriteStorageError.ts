export class WriteStorageError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'WriteStorageError';
  }
}
