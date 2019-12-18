const QueryProcessor = require('./query-processor');

const httpQuery = `filter=(userId eq 'tester' OR userId eq '') AND state IN ('ready', 'done') AND (updateTime lt '2019-11-30' OR updateTime gt '2019-12-29')&orderBy=updateTime desc, userId&page=6&per_page=100`;

const dataMapping = {
  userId: 'user_id',
  updateTime: 'update_time',
};
const operationMapping = {
  eq: '=',
  lt: '<',
  le: '<=',
  gt: '>',
  ge: '>=',
  ne: '<>',
};

const qp = new QueryProcessor(dataMapping, operationMapping);

const sqlQuery = qp.transform(httpQuery);

console.log(sqlQuery);
