var db = require("../config/connection");
var collections = require("../config/collections");
const bcrypt = require("bcrypt");
var objectId = require("mongodb").ObjectId;

module.exports = {
  doSignup: (userData) => {
    return new Promise(async (resolve, reject) => {
      userData.password = await bcrypt.hash(userData.password, 10);
      db.get()
        .collection(collections.USER_COLLECTIONS)
        .insertOne(userData)
        .then((data) => {
          resolve(userData);
        });
    });
  },

  doLogin: (userData) => {
    return new Promise(async (resolve, reject) => {
      let response = {};

      let user = await db
        .get()
        .collection(collections.USER_COLLECTIONS)
        .findOne({ email: userData.email });
      if (user) {
        bcrypt.compare(userData.password, user.password).then((status) => {
          if (status) {
            response.user = user;
            response.status = true;
            resolve(response);
          } else {
            console.log("Login Fail");
            resolve({ status: false });
          }
        });
      } else {
        resolve({ status: false });
      }
    });
  },

  addToCart: (proId, userId) => {
    let prObj = {
      item: new objectId(proId),
      quantity: 1,
    };
    return new Promise(async (resolve, reject) => {
      let userCart = await db
        .get()
        .collection(collections.CART_COLLECTIONS)
        .findOne({ user: new objectId(userId) });
      if (userCart) {
        let proExist = userCart.products.findIndex(
          (product) => product.item == proId,
        );
        if (proExist != -1) {
          db.get()
            .collection(collections.CART_COLLECTIONS)
            .updateOne(
              {
                user: new objectId(userId),
                "products.item": new objectId(proId),
              },
              { $inc: { "products.$.quantity": 1 } },
            )
            .then(() => {
              resolve();
            });
        } else {
          db.get()
            .collection(collections.CART_COLLECTIONS)
            .updateOne(
              { user: new objectId(userId) },
              {
                $push: { products: prObj },
              },
            )
            .then((response) => {
              resolve();
            });
        }
      } else {
        let cartObj = {
          user: new objectId(userId),
          products: [{ item: new objectId(proId), quantity: 1 }],
        };
        db.get()
          .collection(collections.CART_COLLECTIONS)
          .insertOne(cartObj)
          .then((response) => {
            resolve();
          });
      }
    });
  },

  getCartProducts: (userId) => {
    return new Promise(async (resolve, reject) => {
      let cartItems = await db
        .get()
        .collection(collections.CART_COLLECTIONS)
        .aggregate([
          {
            $match: { user: new objectId(userId) },
          },
          {
            $unwind: "$products",
          },
          {
            $project: {
              item: "$products.item",
              quantity: "$products.quantity",
            },
          },
          {
            $lookup: {
              from: collections.PRODUCT_COLLETIONS,
              localField: "item",
              foreignField: "_id",
              as: "product",
            },
          },
          {
            $project: {
              item: 1,
              quantity: 1,
              product: { $arrayElemAt: ["$product", 0] },
            },
          },
        ])
        .toArray();
      resolve(cartItems);
    });
  },
  getCartCount: (userId) => {
    return new Promise(async (resolve, reject) => {
      let cart = await db
        .get()
        .collection(collections.CART_COLLECTIONS)
        .findOne({ user: new objectId(userId) });
      if (cart) {
        resolve(cart.products.length);
      } else {
        resolve(0);
      }
    });
  },
  changeQuantity: (details) => {
    return new Promise((resolve, reject) => {
      details.count=parseInt(details.count)
      db.get()
        .collection(collections.CART_COLLECTIONS)
        .updateOne(
          { user: new objectId(details.cart), "products.item": new objectId(details.product) },
          { $inc: { "products.$.quantity": details.count} },
        )
        .then((response) => {
                console.log('update response:', response.modifiedCount) 
                resolve({ status: true })
            })
    });
  },
  removeFromCart:(userId, productId) => {
    return new Promise((resolve, reject) => {
        db.get()
            .collection(collections.CART_COLLECTIONS)
            .updateOne(
                { user: new objectId(userId) },
                { $pull: { products: { item: new objectId(productId) } } }
            )
            .then((response) => {
                resolve(response)
            })
    })
},
orderSummary: (userId) => {
    return new Promise(async (resolve, reject) => {
      let total = await db
        .get()
        .collection(collections.CART_COLLECTIONS)
        .aggregate([
          {
            $match: { user: new objectId(userId) },
          },
          {
            $unwind: "$products",
          },
          {
            $project: {
              item: "$products.item",
              quantity: "$products.quantity",
            },
          },
          {
            $lookup: {
              from: collections.PRODUCT_COLLETIONS,
              localField: "item",
              foreignField: "_id",
              as: "product",
            },
          },
          {
            $project: {
              item: 1,
              quantity: 1,
              product: { $arrayElemAt: ["$product", 0] },
            },
          },
          {
            $group:{
              _id:null,
              total: { $sum: { $multiply: ['$quantity', { $toInt: '$product.productPrice' }] } }
            }
          }
        ])
        .toArray();
        console.log(total);
        
      resolve(total[0].total);
    });
  }
};
