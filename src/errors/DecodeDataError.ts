export class DecodeDataError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DecodeDataError';
  }
}
