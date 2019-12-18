const { stringReplaceAt } = require('./common');

class QueryProcessor {
  constructor(dataMapping, operationMapping) {
    this._dataMapping = dataMapping || {};
    this._operationMapping = operationMapping || {
      eq: '=',
      lt: '<',
      le: '<=',
      gt: '>',
      ge: '>=',
      ne: '<>',
    };
  }

  /**
   * transform from http query string to sql query string
   * @param {string} httpQuery
   */
  transform(httpQuery) {
    let match;
    // get filter string from http query
    let httpFilter = '';
    match = httpQuery.match(/(filter=(.*?)&|filter=(.*?)$)/);
    if (match) httpFilter = ` ${match[2] || match[3]} `;

    // get order by string from http query
    let httpOrderBy = '';
    match = httpQuery.match(/orderBy=([\w\s,]+)/);
    if (match) httpOrderBy = ` ${match[1]} `;

    // create pagination sql string from http query
    let sqlPagination = '';
    match = httpQuery.match(/page=(\d+)&per_page=(\d+)/);
    if (match) {
      const page = match[1];
      const perPage = match[2];
      sqlPagination = `limit ${perPage} offset ${(page - 1) * perPage}`;
    }

    return `${this.parseFilter(httpFilter)} ${this.parseOrderby(httpOrderBy)} ${sqlPagination}`.trim();
  }

  /**
   * Make sql filter string from http filter query string
   * ex: filter=recordId eq 'dog' and state ne 'sleep' with dataMapping: {recordId: 'record_id'}
   * => where record_id = 'dog' and state <> 'sleep'
   * @param {string} httpFilter
   */
  parseFilter(httpFilter) {
    if (httpFilter.trim() === '') return '';

    // operation mapping
    let sqlFilter = httpFilter;
    Object.keys(this._operationMapping).forEach((operator) => {
      sqlFilter = sqlFilter.replace(new RegExp(` ${operator} `, 'g'), ` ${this._operationMapping[operator]} `);
    });

    // data mapping
    Object.keys(this._dataMapping).forEach((data) => {
      const reg = new RegExp(`[\\s(]${data}[\\s)]`, 'g');
      let m = reg.exec(sqlFilter);
      while (m) {
        sqlFilter = stringReplaceAt(sqlFilter, m.index + 1, data, this._dataMapping[data]);
        m = reg.exec(sqlFilter);
      }
    });

    return `where ${sqlFilter.trim()}`;
  }

  /**
   * Make sql order by string from http order query string
   * ex: orderBy=age desc, name => order by age desc, name asc
   * @param {string} httpOrderBy
   */
  parseOrderby(httpOrderBy) {
    if (httpOrderBy.trim() === '') return '';

    // data mapping
    let tmpHttpOrderBy = httpOrderBy;
    Object.keys(this._dataMapping).forEach((data) => {
      const reg = new RegExp(`[=\\s,](${data})[\\s,]*`, 'g');
      let m = reg.exec(tmpHttpOrderBy);
      while (m) {
        tmpHttpOrderBy = stringReplaceAt(
          tmpHttpOrderBy,
          m.index + 1,
          data,
          this._dataMapping[data],
        );
        m = reg.exec(tmpHttpOrderBy);
      }
    });

    let sqlOrderBy = 'order by';
    const orderList = tmpHttpOrderBy.split(',');
    for (let i = 0; i < orderList.length; i += 1) {
      if (i !== 0) sqlOrderBy += ',';
      const arrTmp = orderList[i].trim().split(/\s+/);
      const field = arrTmp[0];
      const orderValue = arrTmp[1] || 'asc';
      sqlOrderBy += ` ${field} ${orderValue}`;
    }

    return `${sqlOrderBy}`;
  }
}

module.exports = QueryProcessor;
