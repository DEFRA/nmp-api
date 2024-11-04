const RB209AdviceNoteService = require("./adviceNote.service");
class RB209AdviceNoteController {
  #request;
  #h;
  #service;

  constructor(request, h) {
    this.#request = request;
    this.#h = h;
    this.#service = new RB209AdviceNoteService();
  }
  async getAdviceNotes() {
    const url = this.#request.url.pathname.split("/rb209")[1];
    try {
      const data = await this.#service.getData(url);
      return this.#h.response(data);
    } catch (error) {
      return this.#h.response({ error });
    }
  }

  async getAdviceNotesByAdviceNoteCode() {
    const { adviceNoteCode } = this.#request.params;
    console.log("AdviceNote Code:", adviceNoteCode);

    const url = this.#request.url.pathname.split("/rb209")[1];
    try {
      const data = await this.#service.getData(url);
      return this.#h.response(data);
    } catch (error) {
      return this.#h.response({ error });
    }
  }
}

module.exports = { RB209AdviceNoteController };
