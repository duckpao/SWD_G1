class RegisterAdminRequest {
    constructor(body) {
        this.email = body.email ? String(body.email).trim() : null;
        this.password = body.password ? String(body.password) : null;
        this.name = body.name ? String(body.name).trim() : null;
        this.adminSecret = body.adminSecret ? String(body.adminSecret) : null;
    }

    validate() {
        if (!this.email) throw new Error("Email không được để trống!");
        if (!this.password || this.password.length < 9) throw new Error("Mật khẩu phải có ít nhất 9 ký tự!");
        if (!this.name) throw new Error("Tên (name) không được để trống!");
        if (!this.adminSecret) throw new Error("Mã bí mật adminSecret không được để trống!");
        return true;
    }
}

module.exports = RegisterAdminRequest;