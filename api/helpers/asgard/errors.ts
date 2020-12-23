export class AsgardError extends Error {
  fatal: boolean;
  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, AsgardError.prototype);
    this.fatal = false;
  }
}

