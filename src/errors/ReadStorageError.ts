export class ReadStorageError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ReadStorageError';
  }
}
