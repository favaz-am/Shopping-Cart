var express = require("express");
var router = express.Router();
var productHelper = require("../helpers/product-helpers");
var userHelper = require("../helpers/user-helpers");
const { log } = require("handlebars");

/* GET home page. */
router.get("/", async function (req, res, next) {
  let user = req.session.user;
  let cartCount=0  
  if(req.session.user){
  cartCount=await userHelper.getCartCount(req.session.user._id)
  }
  productHelper.addAllProduct().then((products) => {
    res.render("user/viewproduct-user", { products, admin: false, user,cartCount });
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
router.get('/cart', verifyLogin, async (req, res) => {
    let products = await userHelper.getCartProducts(req.session.user._id)
    let totalPrice = 0
    products.forEach(item => {
        item.cartItems.forEach(product => {
            totalPrice += parseInt(product.productPrice)
        })
    })
    res.render('user/cart', { products, user: req.session.user, totalPrice ,cartCount})
})
router.get("/add-to-cart/:id", (req, res) => {
  console.log('Api called');
  userHelper.addToCart(req.params.id, req.session.user._id).then(() => {
    // res.redirect("/cart");
    res.json({status:true})
  });
});

module.exports = router;
