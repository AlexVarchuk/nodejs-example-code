'use strict';
import { getInfoFromprojectDb } from '../../services/projectDb';
const query = require('../../services/projectDb/projectQueries');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const ids = await getInfoFromprojectDb(query.queryCategoryAttributesIds);

    if (ids) {
      ids.map(entity => {
        entity.createdAt = new Date();
        entity.updatedAt = new Date();
        return entity;
      });
      return queryInterface.bulkInsert('categoryAttributes', ids, {});
    } else {
      return queryInterface.bulkInsert(
        'categoryAttributes',
        [
          {
            categoryId: 24101,
            attributeId: 2,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            categoryId: 24101,
            attributeId: 3,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            categoryId: 24275,
            attributeId: 3,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
        {},
      );
    }
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('categoryAttributes', null, {});
  },
};

('use strict');
import { getInfoFromprojectDb } from '../../services/projectDb';
const query = require('../../services/projectDb/projectQueries');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const filters = await getInfoFromprojectDb(query.queryOnlyFilters);
    if (filters) {
      filters.map(filters => {
        filters.createdAt = new Date();
        filters.updatedAt = new Date();
        return filters;
      });
      return queryInterface.bulkInsert('filtersType', filters, {
        updateOnDuplicate: ['id', 'type', 'value'],
      });
    } else {
      return queryInterface.bulkInsert(
        'filtersType',
        [
          { id: 1, type: 'decade', value: 'Decade' },
          { id: 2, type: 'book_genre', value: 'Genre' },
          { id: 5, type: 'platform', value: 'Platform' },
          { id: 6, type: 'release_year', value: 'Release Year' },
          {
            id: 7,
            type: 'streaming_provider',
            value: 'Streaming Provider',
          },
          { id: 11, type: 'music_style', value: 'Style' },
          { id: 14, type: 'published_year', value: 'Year Published' },
          { id: 18, type: 'movie_genre', value: 'Genre' },
          { id: 19, type: 'tv_show_genre', value: 'Genre' },
          { id: 20, type: 'music_genre', value: 'Genre' },
        ],
        {},
      );
    }
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('filtersType', null, {});
  },
};

('use strict');
import { getInfoFromprojectDb } from '../../services/projectDb';
const query = require('../../services/projectDb/projectQueries');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const categoryFilters = await getInfoFromprojectDb(query.queryFilterCategory);
    if (categoryFilters) {
      categoryFilters.map(() => {
        categoryFilters.createdAt = new Date();
        categoryFilters.updatedAt = new Date();
        return categoryFilters;
      });
      return queryInterface.bulkInsert('filters', categoryFilters, {
        updateOnDuplicate: ['id', 'categoryId', 'filterId'],
      });
    }
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('filters', null, {});
  },
};
