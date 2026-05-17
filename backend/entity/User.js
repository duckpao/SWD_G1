const { EntitySchema } = require("@mikro-orm/core");

class User {
  constructor(fullname, email, password) {
    this.fullname = fullname;
    this.email = email;
    this.password = password;
    this.role = "user";
    this.status = "active";
  }
}

const UserSchema = new EntitySchema({
  class: User,
  tableName: "users",
  properties: {
    id: { primary: true, type: "number", autoincrement: true },
    fullname: { type: "string", length: 100, nullable: false },
    email: { type: "string", length: 100, unique: true, nullable: false },
    password: { type: "string", length: 255, nullable: false },
    phone: { type: "string", length: 15, nullable: true },
    address: { type: "text", nullable: true },
    role: {
      type: "enum",
      items: ["user", "admin", "shopowner"],
      default: "user",
      nullable: false,
    },
    status: { type: "string", length: 20, default: "active" },
    createdAt: {
      type: "Date",
      fieldName: "created_at",
      defaultRaw: "CURRENT_TIMESTAMP",
    },
  },
});

module.exports = { User, UserSchema };
