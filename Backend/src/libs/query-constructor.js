// import { SelectQueryBuilder, EntityManager, ObjectLiteral, Repository } from "typeorm";
import { BadRequestException } from "../infrastructure/http-exceptions";
import FilterOperators from "./filter-operators";

const QueryConstructor = {
  constructQuery: (q1, query) => {
    try {
      const langs = ['am', 'en', 'om', 'ti', 'so'];
      const aggregateColumns = {};
      const metaData = q1.manager.connection.getMetadata(q1.target);
      metaData.columns.map((c) => {
        return (aggregateColumns[c.databasePath] = c.type);
      });
      const {
        top,
        skip,
        searchFrom,
        filter,
        search,
        orderBy,
        includes,
        select,
        locale,
        groupBy,
        withArchived,
      } = query;
      const aggregate = QueryConstructor.toSnackCase(metaData.tableName);
      const q = q1.createQueryBuilder(aggregate);
      if (select) {
        q.select(
          select.map((s) => {
            return s.indexOf('.') === -1 ? `${aggregate}.${s}` : s;
          })
        );
      }
      if (includes) {
        const relations = Array.isArray(includes)
          ? includes
          : includes.split(',');
        relations.forEach((include) => {
          if (include.includes('.')) {
            const item = include.split('.');
            const childTable = item[item.length - 1];
            q.leftJoinAndSelect(`${include}`, childTable);
          } else {
            q.leftJoinAndSelect(`${aggregate}.${include}`, include);
          }
        });
      }
      //Filtering goes here
      if (filter) {
        filter.forEach((filters, index) => {
          let filterString = '';
          const filterParams = {};
          filters.forEach((f, filterIndex) => {
            const paramKey = filterIndex + '_' + index;
            if (!f.field)
              throw new BadRequestException('Filter field is required');
            const columnName =
              f.field.indexOf('.') === -1 ? `${aggregate}.${f.field}` : f.field;
            switch (f.operator) {
              case FilterOperators.EqualTo: {
                if (aggregateColumns[f.field] === 'jsonb') {
                  langs.forEach((lang, i) => {
                    filterString +=
                      i === 0 && filterIndex === 0
                        ? ` ${columnName}->>'${lang}' = :${f.field}${lang}${paramKey} `
                        : ` OR ${columnName}->>'${lang}' = :${f.field}${lang}${paramKey} `;
                    filterParams[`${f.field}${lang}${paramKey}`] = f.value;
                  });
                } else {
                  filterString +=
                    filterIndex === 0
                      ? ` ${columnName} = :${f.field}${paramKey} `
                      : ` OR ${columnName} = :${f.field}${paramKey} `;
                  filterParams[`${f.field}${paramKey}`] = f.value;
                }
                break;
              }
              case FilterOperators.Between: {
                if (Array.isArray(f.value)) {
                  if (f.value.length >= 2) {
                    filterString +=
                      filterIndex === 0
                        ? ` (${columnName} between :${f.field}${paramKey}1 and :${f.field}${paramKey}2) `
                        : ` OR (${columnName} between :${f.field}${paramKey}1 and :${f.field}${paramKey}2) `;
                    filterParams[`${f.field}${paramKey}1`] = f.value[0];
                    filterParams[`${f.field}${paramKey}2`] = f.value[1];
                  }
                } else {
                  const values = f.value.split(',');
                  filterString +=
                    filterIndex === 0
                      ? ` (${columnName} between :${f.field}${paramKey}1 and :${f.field}${paramKey}2) `
                      : ` OR (${columnName} between :${f.field}${paramKey}1 and :${f.field}${paramKey}2) `;
                  filterParams[`${f.field}${paramKey}1`] = values[0];
                  filterParams[`${f.field}${paramKey}2`] = values[1];
                }
                break;
              }
              case FilterOperators.LessThan: {
                filterString +=
                  filterIndex === 0
                    ? ` ${columnName} < :${f.field}${paramKey} `
                    : ` OR ${columnName} < :${f.field}${paramKey} `;
                filterParams[`${f.field}${paramKey}`] = f.value;
                break;
              }
              case FilterOperators.LessThanOrEqualTo: {
                filterString +=
                  filterIndex === 0
                    ? ` ${columnName} <= :${f.field}${paramKey} `
                    : ` OR ${columnName} <= :${f.field}${paramKey} `;
                filterParams[`${f.field}${paramKey}`] = f.value;
                break;
              }
              case FilterOperators.GreaterThan: {
                filterString +=
                  filterIndex === 0
                    ? ` ${columnName} > :${f.field}${paramKey} `
                    : ` OR ${columnName} > :${f.field}${paramKey} `;
                filterParams[`${f.field}${paramKey}`] = f.value;

                break;
              }
              case FilterOperators.GreaterThanOrEqualTo: {
                filterString +=
                  filterIndex === 0
                    ? ` ${columnName} >= :${f.field}${paramKey} `
                    : ` OR ${columnName} >= :${f.field}${paramKey} `;
                filterParams[`${f.field}${paramKey}`] = f.value;

                break;
              }
              case FilterOperators.In: {
                if (Array.isArray(f.value)) {
                  filterString +=
                    filterIndex === 0
                      ? ` ${columnName} IN(:...${f.field}${paramKey}) `
                      : ` OR ${columnName} IN(:...${f.field}${paramKey}) `;
                  filterParams[`${f.field}${paramKey}`] = f.value;
                } else {
                  const values = f.value.split(',');
                  filterString +=
                    filterIndex === 0
                      ? ` ${columnName} IN(:...${f.field}${paramKey}) `
                      : ` OR ${columnName} IN(:...${f.field}${paramKey}) `;
                  filterParams[`${f.field}${paramKey}`] = values;
                }
                break;
              }
              case FilterOperators.Any: {
                if (Array.isArray(f.value)) {
                  filterString +=
                    filterIndex === 0
                      ? ` ${columnName} = ANY(:${f.field}${paramKey}) `
                      : ` OR ${columnName} = ANY(:${f.field}${paramKey}) `;
                  filterParams[`${f.field}${paramKey}`] = f.value;
                } else {
                  const values = f.value.split(',');
                  filterString +=
                    filterIndex === 0
                      ? ` ${columnName} = ANY(:${f.field}${paramKey}) `
                      : ` OR ${columnName} = ANY(:${f.field}${paramKey}) `;
                  filterParams[`${f.field}${paramKey}`] = values;
                }
                break;
              }
              case FilterOperators.NotNull: {
                filterString +=
                  filterIndex === 0
                    ? ` ${columnName} is not null `
                    : ` OR ${columnName} is not null `;
                break;
              }
              case FilterOperators.IsNull: {
                filterString +=
                  filterIndex === 0
                    ? ` ${columnName} is null `
                    : ` OR ${columnName} is null `;
                break;
              }

              case FilterOperators.NotEqualTo: {
                if (aggregateColumns[f.field] === 'jsonb') {
                  langs.forEach((lang, i) => {
                    filterString +=
                      i === 0 && filterIndex === 0
                        ? ` ${columnName}->>'${lang}' != :${f.field}${lang}${paramKey} `
                        : ` OR ${columnName}->>'${lang}' != :${f.field}${lang}${paramKey} `;
                    filterParams[`${f.field}${lang}${paramKey}`] = f.value;
                  });
                } else {
                  filterString +=
                    filterIndex === 0
                      ? ` ${columnName} != :${f.field}${paramKey} `
                      : ` OR ${columnName} != :${f.field}${paramKey} `;
                  filterParams[`${f.field}${paramKey}`] = f.value;
                }
                break;
              }
              case FilterOperators.Like: {
                if (aggregateColumns[f.field] === 'jsonb') {
                  langs.forEach((lang, i) => {
                    filterString +=
                      i === 0 && filterIndex === 0
                        ? ` ${columnName}->>'${lang}' ilike :${f.field}${lang}${paramKey} `
                        : ` OR ${columnName}->>'${lang}' ilike :${f.field}${lang}${paramKey} `;
                    filterParams[
                      `${f.field}${lang}${paramKey}`
                    ] = `%${f.value}%`;
                  });
                } else {
                  filterString +=
                    filterIndex === 0
                      ? ` ${columnName} ilike :${f.field}${paramKey} `
                      : ` OR ${columnName} ilike :${f.field}${paramKey} `;
                  filterParams[`${f.field}${paramKey}`] = `%${f.value}%`;
                }
                break;
              }
              case FilterOperators.NotIn:
                if (Array.isArray(f.value)) {
                  filterString +=
                    filterIndex === 0
                      ? ` ${columnName} NOT IN(:...${f.field}${paramKey}) `
                      : ` OR ${columnName} NOT IN(:...${f.field}${paramKey}) `;
                  filterParams[`${f.field}${paramKey}`] = f.value;
                } else {
                  const values = f.value.split(',');
                  filterString +=
                    filterIndex === 0
                      ? ` ${columnName} NOT IN(:...${f.field}${paramKey}) `
                      : ` OR ${columnName} NOT IN(:...${f.field}${paramKey}) `;
                  filterParams[`${f.field}${paramKey}`] = values;
                }
                break;
            }
          });
          index === 0
            ? q.where(`(${filterString})`, filterParams)
            : q.andWhere(`(${filterString})`, filterParams);
        });
      }
      if (search && searchFrom) {
        let searchQuery = '';
        const searchParams = {};
        searchFrom.forEach((item, index) => {
          const searchColumn =
            item.indexOf('.') === -1 ? `${aggregate}.${item}` : item;
          const paramKey = 'search_' + item;
          if (aggregateColumns[item] === 'jsonb') {
            langs.forEach((lang, i) => {
              searchQuery +=
                i === 0 && index === 0
                  ? ` ${searchColumn}->>'${lang}' ilike :${paramKey}${lang} `
                  : ` OR ${searchColumn}->>'${lang}' ilike :${paramKey}${lang} `;
              searchParams[`${paramKey}${lang}`] = `%${search}%`;
            });
          } else {
            searchQuery +=
              index === 0
                ? ` ${searchColumn} ilike :${paramKey} `
                : ` OR ${searchColumn} ilike :${paramKey} `;
            searchParams[paramKey] = `%${search}%`;
          }
        });
        q.andWhere(`(${searchQuery})`, searchParams);
      }
      if (groupBy) {
        groupBy.forEach((item, index) => {
          index === 0
            ? q.groupBy(`${aggregate}.${item}`)
            : q.addGroupBy(`${aggregate}.${item}`);
        });
      }
      if (orderBy) {
        const orderedBy = {};
        orderBy.forEach((order) => {
          let orderBaseTable = aggregate;
          const orderByField = order.field;
          let orderByColumn = orderByField;
          if (orderByField.includes('.')) {
            const item = orderByField.split('.');
            const childTable = item[0];

            if (childTable) {
              orderByColumn = item[item.length - 1];
              orderBaseTable = childTable;
            }
          }
          orderedBy[`${orderBaseTable}.${orderByColumn}`] =
            order.direction.toUpperCase();
        });
        q.orderBy(orderedBy);
      }
      if (top) {
        q.take(top);
      }
      if (skip) {
        q.skip(skip);
      }
      if (withArchived && (withArchived === true || withArchived === 'true')) {
        q.withDeleted();
      }
      return q;
    } catch (error) {
      throw new BadRequestException(error);
    }
  },
  toSnackCase: (text) => {
    const result = text.trim().replace(/([A-Z])/g, ' $1');
    const upperStr = result.split(' ');
    const lowerArray = upperStr.map((t) => {
      return t.toLocaleLowerCase();
    });
    return lowerArray.join('_');
  },
};
module.exports = QueryConstructor;


export default QueryConstructor;
