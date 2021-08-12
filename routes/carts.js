const express = require("express");
const cartsRepo = require("../repositories/carts");
const productsRepo = require("../repositories/products");
const cartShowTemplate = require("../views/cart/show");

const router = express.Router();

// Receive a post request to add an item to a cart

router.post("/cart/products", async (req, res) => {
  //console.log(req.body.productId);
  //Figure out the cart

  let cart;

  if (!req.session.cartId) {
    // we dont have a cart , we need one to create one ,
    // and stpre the cart id on the req.session.cartId property
    cart = await cartsRepo.create({ items: [] });

    req.session.cartId = cart.id;
  } else {
    // we have a cart lets get it from repository
    cart = await cartsRepo.getOne(req.session.cartId);
  }

  const exitingItem = cart.items.find((item) => item.id === req.body.productId);
  if (exitingItem) {
    //increment quantity and save cart
    exitingItem.quantity++;
  } else {
    // add new product id to items array
    cart.items.push({ id: req.body.productId, quantity: 1 });
  }

  await cartsRepo.update(cart.id, {
    items: cart.items,
  });

  //Either increment quantity for exiting products
  //or new product to items array

  res.redirect("/cart");
});

// Receive a GET request to show all items in cart

router.get("/cart", async (req, res) => {
  if (!req.session.cartId) {
    return res.redirect("/");
  }

  const cart = await cartsRepo.getOne(req.session.cartId);

  for (let item of cart.items) {
    const product = await productsRepo.getOne(item.id);

    item.product = product;
  }
  res.send(cartShowTemplate({ items: cart.items }));
});

// Receive a post request to delete an item from a cart
router.post("/cart/products/delete", async (req, res) => {
  const { itemId } = req.body;
  const cart = await cartsRepo.getOne(req.session.cartId);

  const items = cart.items.filter((item) => item.id !== itemId);

  await cartsRepo.update(req.session.cartId, { items: items });

  res.redirect("/cart");
});

module.exports = router;
