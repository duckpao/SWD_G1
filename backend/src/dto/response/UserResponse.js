class UserResponse {
    constructor(user) {
        this.id = user.id || null;
        this.fullname = user.fullname || user.name || "";
        this.email = user.email || "";
        this.phone = user.phone || null;
        this.address = user.address || null;
        this.role = user.role || "user";
        this.status = user.status || "active";
        this.createdAt = user.created_at || new Date();
    }
}

module.exports = UserResponse;