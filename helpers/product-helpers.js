var db = require("../config/connection");
var collections = require("../config/collections");
var objectId = require("mongodb").ObjectId;

module.exports = {
  addProduct: (product, callback) => {
    db.get()
      .collection(collections.PRODUCT_COLLETIONS)
      .insertOne(product)
      .then((data) => {
        callback(data.insertedId);
      });
  },
  addAllProduct: () => {
    return new Promise(async (resolve, reject) => {
      let product = await db
        .get()
        .collection(collections.PRODUCT_COLLETIONS)
        .find({ deleted: { $ne: true } })
        .toArray();
      resolve(product);
    });
  },
  deleteProduct: (productId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collections.PRODUCT_COLLETIONS)
        .updateOne(
          { _id: new objectId(productId) },
          { $set: { deleted: true } },
        )
        .then((response) => {
          resolve(response);
        });
    });
  },
  restoreProduct: (productId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collections.PRODUCT_COLLETIONS)
        .updateOne(
          { _id: new objectId(productId) },
          { $set: { deleted: false } },
        )
        .then((response) => {
          resolve(response);
        });
    });
  },
  getProductDetails: (productId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collections.PRODUCT_COLLETIONS)
        .findOne({ _id: new objectId(productId) })
        .then((product) => {
          resolve(product);
        });
    });
  },
  updateProduct: (productId, productDetails) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collections.PRODUCT_COLLETIONS)
        .updateOne(
          { _id: new objectId(productId) },
          {
            $set: {
              productName: productDetails.productName,
              productCategory: productDetails.productCategory,
              productPrice: productDetails.productPrice,
              productDescription: productDetails.productDescription,
            },
          },
        )
        .then(() => {
          resolve();
        });
    });
  },
};
