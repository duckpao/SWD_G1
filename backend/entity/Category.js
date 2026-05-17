const { EntitySchema } = require("@mikro-orm/core");

class Category {
  constructor(name, description) {
    this.name = name;
    this.description = description;
  }
}

const CategorySchema = new EntitySchema({
  class: Category,
  tableName: "categories",
  properties: {
    id: { primary: true, type: "number", autoincrement: true },
    name: { type: "string", length: 50, nullable: false },
    description: { type: "text", nullable: true },
    createdAt: {
      type: "Date",
      fieldName: "created_at",
      defaultRaw: "CURRENT_TIMESTAMP",
    },
  },
});

module.exports = { Category, CategorySchema };
