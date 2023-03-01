export default class Werror extends Error {
  constructor(error: unknown, msg?: string) {
    if (error instanceof Error) {
      super(`${msg}: ${error.message}`);
    } else if (typeof error === "string") {
      super(error);
    } else {
      throw new Error('error in Werror is not an instance of "Error"');
    }
  }
}
