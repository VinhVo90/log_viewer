const _ = require('lodash');
const SqlString = require('sqlstring');

class QueryProcessor {
  constructor(dataMapping) {
    this.default = {
      opMapper: [{
        regex: ' eq ',
        text: ' = ',
      }, {
        regex: ' ne ',
        text: ' <> ',
      },
      ],
      propMapper: [
        {
          text: 'itemType',
          replace: 'item-type',
        },
      ],
    };

    this._dataMapping = Object.assign(this.default, dataMapping);
  }

  transform(httpQuery) {
    if (httpQuery === '' || httpQuery === null) {
      return '';
    }

    const arrParam = httpQuery.split('&');

    const filter = this.getFilterQuery(arrParam);
    const orderBy = this.getOrderByQuery(arrParam);
    const paging = this.getPagingQuery(arrParam);

    const query = `${filter} ${orderBy} ${paging}`;

    return (query.replace(/( ){2,}/g, ' '));
  }

  getFilterQuery(params) {
    const filterQuery = _.find(params, (item) => item.startsWith('filter='));
    if (filterQuery === null) {
      return '';
    }
    const rawFilter = filterQuery.substr(7);

    let str = rawFilter;
    const arrFilter = [];

    while (str.length > 0) {
      const filterResult = this.findNextFilter(str);
      str = filterResult.str;
      arrFilter.push(filterResult);
    }

    let query = '';

    for (let i = 0; i < arrFilter.length; i += 1) {
      const filter = arrFilter[i];
      let querySql = '';
      if (filter.innerFilter) {
        const subFilter = filter.arrFilter;
        subFilter.forEach((item) => {
          const subQuery = this.generateFilterSql(item.filter);
          if (item.lastFilter) {
            querySql += ` ${subQuery}`;
          } else {
            querySql += ` ${subQuery} ${item.op}`;
          }
        });

        if (filter.lastFilter) {
          querySql = ` ( ${querySql} )`;
        } else {
          querySql = ` ( ${querySql} ) ${filter.op}`;
        }
      } else {
        const subFilter = this.generateFilterSql(filter.filter);
        if (filter.lastFilter) {
          querySql += ` ${subFilter}`;
        } else {
          querySql += ` ${subFilter} ${filter.op}`;
        }
      }
      query += querySql;
    }

    if (query !== '') {
      query = `where ${query}`;
    }

    return query;
  }

  findNextFilter(str) {
    const result = {
      lastFilter: false,
      filter: '',
      op: '',
      str: '',
    };

    for (let i = 0; i < str.length; i += 1) {
      const char = str[i];

      if (char === '(') {
        const endFilter = str.indexOf(')');
        const filter = str.substr(i, endFilter - i + 1);
        result.filter = filter;

        const startOp = str.indexOf(' ', endFilter + 1);
        let endOp = -1;
        if (startOp === -1) {
          result.lastFilter = true;
        } else {
          endOp = str.indexOf(' ', startOp + 1);
        }

        const op = str.substr(startOp, endOp - startOp + 1);
        result.op = op;
        let innerFilter = str.substr(i + 1, endFilter - i - 1);
        const arrInnerFilter = [];
        let subFilter = [];

        while (innerFilter.length > 0) {
          subFilter = this.findNextFilter(innerFilter);
          arrInnerFilter.push(subFilter);
          innerFilter = subFilter.str;
        }

        result.innerFilter = true;
        result.arrFilter = arrInnerFilter;
        result.str = str.substr(endOp + 1, str.length - endOp + 1);
      } else {
        const orIndex = str.indexOf(' or ');
        const andIndex = str.indexOf(' and ');
        let startOp = -1;

        if (orIndex === -1 && andIndex === -1) {
          result.filter = str;
          result.lastFilter = true;
          result.str = '';
          break;
        } else {
          if (orIndex === -1) {
            startOp = andIndex;
          } else if (andIndex === -1) {
            startOp = orIndex;
          } else {
            startOp = (orIndex > andIndex) ? andIndex : orIndex;
          }
          const filter = str.substr(i, startOp - i);
          result.filter = filter;
          const endOp = str.indexOf(' ', startOp + 1);
          const op = str.substr(startOp, endOp - startOp + 1);
          result.op = op;
          result.str = str.substr(endOp + 1, str.length - endOp + 1);
        }
      }
      break;
    }

    return result;
  }

  generateFilterSql(str) {
    const { opMapper, propMapper } = this._dataMapping;

    const filter = opMapper.reduce((text, mapper) => {
      const valueRegex = new RegExp(`(?<key>.*)${mapper.regex}(?<value>.*)`);
      const fieldResult = valueRegex.exec(text);
      let query = text;
      if (fieldResult !== null && typeof fieldResult.groups !== 'undefined') {
        const { key } = fieldResult.groups;
        const { value } = fieldResult.groups;

        const prop = _.find(propMapper, (item) => item.text === key);

        if (typeof prop !== 'undefined') {
          query = query.substr(key.length);
          query = `${prop.replace}${query}`;
        }

        query = query.substr(0, query.length - value.length);
        query += SqlString.escape(value);
      }
      return query.replace(new RegExp(mapper.regex, 'g'), mapper.text);
    }, str);
    return filter;
  }

  getPagingQuery(params) {
    const pageQuery = _.find(params, (item) => item.startsWith('page'));
    const perPageQuery = _.find(params, (item) => item.startsWith('per_page'));

    if (pageQuery == null || perPageQuery == null) {
      const offsetQuery = _.find(params, (item) => item.startsWith('offset'));
      const limitQuery = _.find(params, (item) => item.startsWith('limit'));

      if (offsetQuery != null && limitQuery != null) {
        return `${limitQuery} ${offsetQuery}`;
      } if (offsetQuery == null) {
        return `${limitQuery}`;
      } if (limitQuery == null) {
        return `${offsetQuery}`;
      }
      return '';
    }
    const pageParam = this.getQueryParam(pageQuery);
    const perPageParam = this.getQueryParam(perPageQuery);
    const page = parseInt(pageParam.value, 10);
    const perPage = parseInt(perPageParam.value, 10);
    return `limit ${perPage} offset ${(page - 1) * perPage}`;
  }

  getOrderByQuery(params) {
    const orderByParam = _.filter(params, (item) => item.startsWith('orderBy'));
    if (orderByParam.length > 0) {
      const orderBy = orderByParam[0];
      const query = this.getQueryParam(orderBy).value;
      return this.generateOrderByQuery(query);
    }
    return '';
  }

  generateOrderByQuery(query) {
    let strOrder;
    if (query.includes(',')) {
      const arr = query.split(',');
      const arrOrder = [];
      for (let i = 0; i < arr.length; i += 1) {
        const order = arr[i];
        arrOrder.push(this.generateOrderByField(order));
      }
      strOrder = arrOrder.join(', ');
    } else {
      strOrder = this.generateOrderByField(query);
    }
    return `order by ${strOrder}`;
  }

  generateOrderByField(str) {
    const { propMapper } = this._dataMapping;
    const arr = [' asc', ' desc'];
    const order = _.find(arr, (item) => str.includes(item));
    if (typeof order !== 'undefined') {
      const prop = str.substr(0, str.length - order.length);
      const propText = _.find(propMapper, (item) => item.text === prop);
      if (typeof propText !== 'undefined') {
        return `${propText.replace}${order}`;
      }
      return str;
    }

    const propText = _.find(propMapper, (item) => item.text === str.trim());

    if (typeof propText !== 'undefined') {
      return `${propText.replace} asc`;
    }
    return `${str} asc`;
  }

  getQueryParam(query) {
    const match = query.match(/([^=]+)/g);
    return {
      key: match[0],
      value: match[1],
    };
  }
}

const queryProcessor = new QueryProcessor({
  opMapper: [{
    regex: ' eq ',
    text: ' = ',
  }, {
    regex: ' ne ',
    text: ' <> ',
  },
  ],
  propMapper: [
    {
      text: 'itemType',
      replace: 'item-type',
    },
  ],
});
console.log(queryProcessor.transform('filter=itemType eq \'dog\' and state ne \'sleep\'&orderBy=age desc, itemType&page=2&per_page=30'));
