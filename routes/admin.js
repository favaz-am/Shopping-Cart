var express = require("express");
var router = express.Router();
var productHelper = require("../helpers/product-helpers");

/* GET users listing. */
router.get("/", function (req, res, next) {
  productHelper.addAllProduct().then((products) => {
    res.render("admin/view-products", { admin: true, products });
  });
});

router.get("/add-products", (req, res) => {
  res.render("admin/add-products", { admin: true });
});

router.post("/add-product", (req, res) => {
  productHelper.addProduct(req.body, (id) => {
    let image = req.files.Image;
    image.mv("./public/product-images/" + id + ".jpg", (err) => {
      if (!err) {
        res.redirect("/admin");
      } else {
        console.log(err);
      }
    });
  });
});
router.get("/delete-product/:id", (req, res) => {
  let productId = req.params.id;
  productHelper.deleteProduct(productId).then((response) => {
    res.redirect("/admin");
  });
});
router.get("/restore-product/:id", (req, res) => {
  productHelper.restoreProduct(req.params.id).then(() => {
    res.redirect("/admin");
  });
});
router.get("/edit-product/:id", async (req, res) => {
  let product = await productHelper.getProductDetails(req.params.id);
  res.render("admin/edit-products", { product });
});
router.post("/edit-product/:id", async (req, res) => {
    await productHelper.updateProduct(req.params.id, req.body)
    if (req.files && req.files.Image) {
        let image = req.files.Image
        image.mv("./public/product-images/" + req.params.id + ".jpg")
    }
    res.redirect("/admin")
})

module.exports = router;
