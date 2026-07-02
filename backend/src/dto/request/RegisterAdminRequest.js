class RegisterAdminRequest {
    constructor(body) {
        this.email = body.email ? String(body.email).trim() : null;
        this.password = body.password ? String(body.password) : null;
        this.name = body.name ? String(body.name).trim() : null;
        this.adminSecret = body.adminSecret ? String(body.adminSecret) : null;
    }

    validate() {
        if (!this.email) throw new Error("Email khÃ´ng Ä‘Æ°á»£c Ä‘á»ƒ trá»‘ng!");
        if (!this.password || this.password.length < 9) throw new Error("Máº­t kháº©u pháº£i cÃ³ Ã­t nháº¥t 9 kÃ½ tá»±!");
        if (!this.name) throw new Error("TÃªn (name) khÃ´ng Ä‘Æ°á»£c Ä‘á»ƒ trá»‘ng!");
        if (!this.adminSecret) throw new Error("MÃ£ bÃ­ máº­t adminSecret khÃ´ng Ä‘Æ°á»£c Ä‘á»ƒ trá»‘ng!");
        return true;
    }
}

module.exports = RegisterAdminRequest;