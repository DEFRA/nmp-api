const { UserService } = require("./user.service");

class UserController {
  #request;
  #h;
  #userService;

  constructor(request, h) {
    this.#request = request;
    this.#h = h;
    this.#userService = new UserService();
  }

  async createUserWithOrganisation() {
    try {
      const { Organisation, User } = this.#request.payload;
      const data = await this.#userService.createUserWithOrganisation(
        Organisation,
        User
      );
      return this.#h.response(data);
    } catch (error) {
      console.error("Error in createUserWithOrganisation controller:", error);
      return this.#h.response({ error });
    }
  }
}

module.exports = { UserController };
