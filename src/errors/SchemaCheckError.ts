export class SchemaCheckError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SchemaCheckError';
  }
}
