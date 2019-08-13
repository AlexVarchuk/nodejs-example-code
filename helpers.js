export const sortObjectByEtalonArray = (sortingObject, etalonArray, key) => {
  let result = sortingObject
    .map(el => {
      return el;
    })
    .sort((firstElement, secondElement) => {
      return etalonArray.indexOf(firstElement[key]) - etalonArray.indexOf(secondElement[key]);
    });
  return result;
};
import models from '../../database/models/index';

export const getNotFoundServiceData = (result, user, body, type) => {
  let setItcherValue = new Set();
  let setIsbnValue = new Set();
  let setImdbValue = new Set();
  const map = new Map();
  const unicResult = [];
  for (const rawItem of result) {
    let item = standardizationOfItem(rawItem, type);

    if (!map.has(item.itcher_id)) {
      map.set(item.itcher_id, true);
      setItcherValue.add(item.itcher_id);
      if (item.type !== 'other' && item.product_attribute_type_name === 'isbn') {
        if (type === 'addProducts') {
          models.Product.findOrCreate({
            where: {
              isbn_id: item.product_attribute_value,
              itcher_id: item.itcher_id,
              partnerId: user.id,
              categoryId: item.category_id,
            },
          });
        }
        setIsbnValue.add(item.product_attribute_value);
      } else if (item.type !== 'other' && item.product_attribute_type_name === 'imdb_id') {
        if (type === 'addProducts') {
          models.Product.findOrCreate({
            where: {
              imdb_id: item.product_attribute_value,
              itcher_id: item.itcher_id,
              partnerId: user.id,
              categoryId: item.category_id,
            },
          });
        }
        setImdbValue.add(item.product_attribute_value);
      } else {
        if (type === 'addProducts') {
          models.Product.findOrCreate({
            where: {
              itcher_id: item.itcher_id,
              partnerId: user.id,
              categoryId: item.category_id,
            },
          });
        }
      }
      unicResult.push({
        id: item.itcher_id,
        type: item.type,
        product_attribute_value: item.product_attribute_value,
        categoryId: item.category_id,
      });
    }
  }

  let resultItcher = new Set([...new Set(body.itcher_product_ids)].filter(x => !setItcherValue.has(x)));
  let resultIsbns = new Set([...new Set(body.isbns)].filter(x => !setIsbnValue.has(x)));
  let resultImdb = new Set([...new Set(body.imdb_ids)].filter(x => !setImdbValue.has(x)));
  return { resultItcher, resultIsbns, resultImdb, unicResult };
};

export const standardizationOfItem = (item, type) => {
  if (type === 'removeProducts') {
    if (item.isbn_id) {
      item.product_attribute_type_name = 'isbn';
      item.product_attribute_value = item.isbn_id;
    } else if (item.imdb_id) {
      item.product_attribute_type_name = 'imdb_id';
      item.product_attribute_value = item.imdb_id;
    }
    item.category_id = item.categoryId;
  }
  return item;
};
