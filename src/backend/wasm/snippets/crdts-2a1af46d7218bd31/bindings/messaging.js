export class Message {
  constructor(msgCode, payload) {
    this._msgCode = msgCode;
    this._payload = payload;
  }

  get msgCode() {
    return this._msgCode;
  }

  set msgCode(msgCode) {
    this._msgCode = msgCode;
  }

  get payload() {
    return this._payload;
  }

  set payload(payload) {
    this._payload = payload;
  }
}
