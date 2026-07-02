class RegisterUserRequest{
        constructor(body) {
        this.email = body.email ? String(body.email).trim() : null;
        this.password = body.password ? String(body.password) : null;
        this.name = body.name ? String(body.name).trim() : null;
        this.phone = body.phone ? String(body.phone) : null;
        this.address = body.address ? String(body.address) : null;
    }

    validate() {
        if (!this.email) throw new Error("Email is null!");
        if (!this.password || this.password.length < 9) throw new Error("Password must contain at least 9 letters!");
        if (!this.name) throw new Error("Name is null!");
        if (!this.phone) throw new Error("Phone is null!");
        if(!this.address) throw new Error("Address is null");
        return true;
    }


}
module.exports = RegisterUserRequest;