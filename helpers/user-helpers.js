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
    return new Promise(async (resolve, reject) => {
      let userCart = await db
        .get()
        .collection(collections.CART_COLLECTIONS)
        .findOne({ user: new objectId(userId) });
      if (userCart) {
        db.get()
          .collection(collections.CART_COLLECTIONS)
          .updateOne(
            { user: new objectId(userId) },
            { $push: { products: new objectId(proId) } },
          )
          .then(() => {
            resolve(); // ✅ resolve here
          });
      } else {
        let cartObj = {
          user: new objectId(userId),
          products: [new objectId(proId)],
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
            $lookup: {
              from: collections.PRODUCT_COLLETIONS,
              let: { prodList: "$products" },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $in: ["$_id", "$$prodList"],
                    },
                  },
                },
              ],
              as: "cartItems",
            },
          },
        ])
        .toArray();
      resolve(cartItems);
    });
  },
};
