const { EntitySchema } = require("@mikro-orm/core");

class Report {
  constructor(reportDate) {
    this.reportDate = reportDate;
    this.totalOrders = 0;
    this.totalRevenue = 0;
    this.totalProductsSold = 0;
  }
}

const ReportSchema = new EntitySchema({
  class: Report,
  tableName: "reports",
  properties: {
    id: { primary: true, type: "number", autoincrement: true },
    reportDate: {
      type: "Date",
      fieldName: "report_date",
      columnType: "date",
      nullable: false,
    },
    totalOrders: { type: "number", fieldName: "total_orders", default: 0 },
    totalRevenue: {
      type: "decimal",
      length: 15,
      decimals: 2,
      fieldName: "total_revenue",
      default: 0,
    },
    totalProductsSold: {
      type: "number",
      fieldName: "total_products_sold",
      default: 0,
    },
    generatedAt: {
      type: "Date",
      fieldName: "generated_at",
      defaultRaw: "CURRENT_TIMESTAMP",
    },
  },
});

module.exports = { Report, ReportSchema };
