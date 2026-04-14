var express = require("express");
var router = express.Router();
var productHelper = require("../helpers/product-helpers");
var userHelper = require("../helpers/user-helpers");
const { log } = require("handlebars");

/* GET home page. */
router.get("/", async function (req, res, next) {
  let user = req.session.user;
  let cartCount = 0;
  if (req.session.user) {
    cartCount = await userHelper.getCartCount(req.session.user._id);
  }
  productHelper.addAllProduct().then((products) => {
    res.render("user/viewproduct-user", {
      products,
      admin: false,
      user,
      cartCount,
    });
  });
});
router.get("/login", (req, res) => {
  if (req.session.loggedIn) {
    res.redirect("/");
  } else {
    res.render("user/login", { LoginErr: req.session.loginErr });
    req.session.loginErr = false;
  }
});

const verifyLogin = (req, res, next) => {
  if (req.session.loggedIn) {
    next();
  } else {
    res.redirect("/login");
  }
};
router.get("/signup", (req, res) => {
  res.render("user/signup");
});
router.post("/signup", (req, res) => {
  userHelper.doSignup(req.body).then((response) => {
    req.session.loggedIn = true;
    req.session.user = response;
    res.redirect("/");
  });
});
router.post("/login", (req, res) => {
  userHelper.doLogin(req.body).then((response) => {
    if (response.status) {
      req.session.loggedIn = true;
      req.session.user = response.user;
      res.redirect("/");
    } else {
      req.session.loginErr = "Invalid username or password";
      res.redirect("/login");
    }
  });
});
router.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/");
});
router.get("/cart", verifyLogin, async (req, res) => {
  try {
    let user = req.session.user;
    let cartCount = await userHelper.getCartCount(user._id);
    let products = await userHelper.getCartProducts(user._id);
    let totalPrice = await userHelper.orderSummary(user._id);
    res.render("user/cart", { products, user, totalPrice, cartCount });
  } catch (err) {
    console.log("Cart error:", err);
    res.redirect("/");
  }
});
router.get("/add-to-cart/:id", verifyLogin, (req, res) => {
  userHelper.addToCart(req.params.id, req.session.user._id).then(() => {
    res.json({ status: true });
  });
});
router.post("/change-quantity", verifyLogin, async (req, res) => {
  console.log("change quantity data:", req.body);
  userHelper.changeQuantity(req.body).then((response) => {
    res.json(response);
  });
});
router.get("/remove-from-cart/:id", verifyLogin, (req, res) => {
  userHelper.removeFromCart(req.session.user._id, req.params.id).then(() => {
    res.redirect("/cart");
  });
});
router.get("/checkout", verifyLogin, async (req, res) => {
  let user = req.session.user;
  let cartCount = await userHelper.getCartCount(user._id);
  let products = await userHelper.getCartProducts(user._id);
  let totalPrice = await userHelper.orderSummary(user._id);
  res.render("user/checkout", { products, user, totalPrice, cartCount });
});
router.post("/checkout", verifyLogin, async (req, res) => {
  let products = await userHelper.getCartProductList(req.body.userId);
  let totalPrice = await userHelper.orderSummary(req.body.userId);
  userHelper.placeOrder(req.body, products, totalPrice).then(() => {
    res.json({ status: true });
  });
});
router.get("/orders", verifyLogin, async (req, res) => {
  let user = req.session.user;
  let cartCount = await userHelper.getCartCount(user._id);
  let orders = await userHelper.getUserOrders(user._id);
  for (let i = 0; i < orders.length; i++) {
    orders[i].products = await userHelper.getOrderProducts(orders[i]._id);
  }
  res.render("user/orders", { user, cartCount, orders });
});
router.get("/view-details-product/:id", async (req, res) => {
  let products = await userHelper.getOrderProducts(req.params.id);
  res.render("user/view-details-product", { user: req.session.user, products });
});

module.exports = router;
