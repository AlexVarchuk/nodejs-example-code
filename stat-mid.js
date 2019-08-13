import { models } from '.';
const sequelize = require('sequelize');

export const stats = async ({ user }, res, next) => {
  let resultCategory = await models.Product.findAll({
    where: { partnerId: user.id },
    attributes: ['categoryId', [sequelize.fn('count', sequelize.col('products.id')), 'count']],
    group: ['products.categoryId'],
  });

  let resultCountRequest = await models.Statistic.count({
    where: {
      partnerId: user.id,
      createdAt: {
        [sequelize.Op.lt]: new Date(),
        [sequelize.Op.gt]: new Date(new Date() - 24 * 60 * 60 * 30 * 1000),
      },
    },
  });
  let resultCountUser = await models.User.count({ where: { partnerId: user.id } });
  res.status(200).json({
    monthly_quota: resultCountRequest,
    number_of_users: resultCountUser,
    mapped_products_per_category: resultCategory,
  });
};
