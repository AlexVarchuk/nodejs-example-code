RelateUser.getDataSource().connector.connect((err, db) => {
  let collection = db.collection('RelateUser');
  collection.aggregate(
    [
      {
        $match: {
          $and: [
            { broadcastingDisabled: false },
            { id: { $ne: ObjectId(currentUser.id) } },
            {
              lastLocationUpdate: {
                $gt: new Date(dateLimit),
              },
            },
            {
              location: {
                $geoWithin: {
                  $centerSphere: [[currentUser.location.lat, currentUser.location.lng], range[1] / 6371000],
                },
              },
            },
          ],
        },
      },
      {
        $lookup: {
          from: 'RelateCardRelateUser',
          let: {
            id: '$_id',
          },
          as: 'currentUserCards',
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    {
                      $eq: [ObjectId(currentUser.id), '$relateUserId'],
                    },
                  ],
                },
              },
            },
            {
              $lookup: {
                from: 'RelateCard',
                let: { cardId: '$relateCardId' },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $and: [
                          { $eq: ['$$cardId', '$_id'] },
                          {
                            $eq: ['$status', STATUS_APPROVED],
                          },
                        ],
                      },
                    },
                  },
                ],
                as: 'details',
              },
            },
          ],
        },
      },
      {
        $unwind: {
          path: '$currentUserCards',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $group: {
          _id: '$_id',
          imageUrl: { $last: '$imageUrl' },
          name: { $last: '$name' },
          location: { $last: '$location' },
          mainCardArr: { $push: '$currentUserCards.relateCardId' },
        },
      },
      {
        $lookup: {
          from: 'RelateCardRelateUser',
          foreignField: 'relateUserId',
          localField: '_id',
          as: 'cards',
        },
      },
      {
        $lookup: {
          from: 'RelateProfileView',
          let: {
            id: '$_id',
          },
          as: 'related',
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    {
                      $eq: [ObjectId(currentUser.id), '$vieverId'],
                    },
                    {
                      $eq: ['$$id', '$userId'],
                    },
                  ],
                },
              },
            },
          ],
        },
      },
      {
        $addFields: {
          list: {
            $filter: {
              input: '$cards',
              as: 'item',
              cond: { $in: ['$$item.relateCardId', '$mainCardArr'] },
            },
          },
        },
      },
      {
        $match: {
          $and: [{ _id: { $ne: ObjectId(currentUser.id) } }],
        },
      },
      {
        $project: {
          _id: 1,
          imageUrl: 1,
          name: 1,
          commonCardsCount: {
            $cond: {
              if: { $isArray: '$list' },
              then: { $size: '$list' },
              else: 'NA',
            },
          },
          related: {
            $cond: {
              if: { $gt: [{ $size: '$related' }, 0] },
              then: true,
              else: false,
            },
          },
          location: 1,
        },
      },
      { $sort: { commonCardsCount: -1 } },
    ],
    function(err, result) {
      if (err) {
        console.log('ERROR: ', err);
        cb(null, []);
        return;
      }
      console.log('Found %d users before exclude', result.length);
      let finalResult = filteredNearbyUser(result, range, currentUser);

      console.log('Found %d users after exclude', finalResult.length);
      cb(null, finalResult);
    },
  );
});
let dateLimit = new Date() - 86400000;
Relatecard.getDataSource().connector.connect((err, db) => {
  let collection = db.collection('RelateUser');
  collection.aggregate(
    [
      {
        $match: {
          $and: [
            { broadcastingDisabled: { $ne: [true] } },
            { id: { $ne: ObjectId(currentUser.id) } },
            {
              lastLocationUpdate: {
                $gt: new Date(dateLimit),
              },
            },
            {
              location: {
                $geoWithin: {
                  $centerSphere: [[currentUser.location.lat, currentUser.location.lng], range[1] / 6371000],
                },
              },
            },
          ],
        },
      },
      {
        $lookup: {
          from: 'RelateCardRelateUser',
          let: {
            id: '$_id',
          },
          as: 'currentUserCards',
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    {
                      $eq: [ObjectId(currentUser.id), '$relateUserId'],
                    },
                  ],
                },
              },
            },
          ],
        },
      },
      {
        $lookup: {
          from: 'RelateCardRelateUser',
          let: {
            id: '$_id',
          },
          as: 'listOfUsersHasCard',
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    {
                      $eq: [ObjectId(cardId), '$relateCardId'],
                    },
                    {
                      $ne: [ObjectId(currentUser.id), '$relateUserId'],
                    },
                  ],
                },
              },
            },
          ],
        },
      },
      {
        $unwind: {
          path: '$currentUserCards',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $unwind: {
          path: '$listOfUsersHasCard',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $group: {
          _id: '$_id',
          imageUrl: { $last: '$imageUrl' },
          name: { $last: '$name' },
          location: { $last: '$location' },
          mainCardArr: { $push: '$currentUserCards.relateCardId' },
          listOfUsersHasCard: { $push: '$listOfUsersHasCard.relateUserId' },
        },
      },
      {
        $lookup: {
          from: 'RelateCardRelateUser',
          foreignField: 'relateUserId',
          localField: '_id',
          as: 'cards',
        },
      },
      {
        $lookup: {
          from: 'RelateProfileView',
          let: {
            id: '$_id',
          },
          as: 'related',
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    {
                      $eq: [ObjectId(currentUser.id), '$vieverId'],
                    },
                    {
                      $eq: ['$$id', '$userId'],
                    },
                  ],
                },
              },
            },
          ],
        },
      },
      {
        $addFields: {
          list: {
            $filter: {
              input: '$cards',
              as: 'item',
              cond: { $in: ['$$item.relateCardId', '$mainCardArr'] },
            },
          },
        },
      },

      {
        $project: {
          _id: 1,
          id: { $in: ['$_id', '$listOfUsersHasCard'] },
          list: 1,
          related: 1,
          imageUrl: 1,
          name: 1,
          location: 1,
        },
      },
      {
        $match: {
          $and: [{ id: true }],
        },
      },
      {
        $project: {
          _id: 1,
          imageUrl: 1,
          name: 1,
          location: 1,
          commonCardsCount: {
            $cond: {
              if: { $isArray: '$list' },
              then: { $size: '$list' },
              else: 'NA',
            },
          },
          related: {
            $cond: {
              if: { $gt: [{ $size: '$related' }, 0] },
              then: true,
              else: false,
            },
          },
        },
      },
      { $sort: { commonCardsCount: -1 } },
      { $limit: limit },
    ],
    (err, result) => {
      if (err) {
        console.log('ERROR: ', err);
        cb(null, []);
        return;
      }
      console.log('Found %d users before exclude', result.length);
      let finalResult = filteredNearbyUser(result, range, currentUser);
      console.log('Found %d users after exclude', finalResult.length);
      cb(null, finalResult);
    },
  );
});
