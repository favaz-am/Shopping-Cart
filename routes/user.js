var express = require("express");
var router = express.Router();
var productHelper = require("../helpers/product-helpers");
var userHelper = require("../helpers/user-helpers");

/* GET home page. */
router.get("/", function (req, res, next) {
  let user = req.session.user;

  productHelper.addAllProduct().then((products) => {
    res.render("user/viewproduct-user", { products, admin: false, user });
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
// router.get('/cart', verifyLogin, async (req, res) => {
//     console.log('session user:', req.session.user)  // ✅ add this
//     let products = await userHelper.getCartProducts(req.session.user._id)
//     console.log(products)
//     res.render('user/cart', { products })
// })
router.get('/cart', verifyLogin, async (req, res) => {
    let products = await userHelper.getCartProducts(req.session.user._id)
    let totalPrice = 0
    products.forEach(item => {
        item.cartItems.forEach(product => {
            totalPrice += parseInt(product.productPrice)  // ✅ convert to number
        })
    })
    res.render('user/cart', { products, user: req.session.user, totalPrice })
})
router.get("/add-to-cart/:id", verifyLogin, (req, res) => {
  userHelper.addToCart(req.params.id, req.session.user._id).then(() => {
    res.redirect("/cart");
  });
});

module.exports = router;
