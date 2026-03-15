import Map "mo:core/Map";
import Array "mo:core/Array";
import Time "mo:core/Time";
import Iter "mo:core/Iter";
import Order "mo:core/Order";
import Nat "mo:core/Nat";
import Int "mo:core/Int";
import Text "mo:core/Text";
import List "mo:core/List";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import Storage "blob-storage/Storage";
import MixinStorage "blob-storage/Mixin";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";

actor {
  // Initialize the access control system.
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);
  include MixinStorage();

  // TYPES

  type Product = {
    id : Nat;
    name : Text;
    description : Text;
    price : Nat;
    discountPercent : Nat;
    category : Text;
    imageId : Text;
    stockQty : Nat;
    isActive : Bool;
    createdAt : Int;
  };
  module Product { public func compare(prod1 : Product, prod2 : Product) : Order.Order { Nat.compare(prod1.id, prod2.id) } };

  type ProductInput = {
    name : Text;
    description : Text;
    price : Nat;
    discountPercent : Nat;
    category : Text;
    imageId : Text;
    stockQty : Nat;
  };

  type ProductUpdateInput = {
    id : Nat;
    name : Text;
    description : Text;
    price : Nat;
    discountPercent : Nat;
    category : Text;
    imageId : Text;
    stockQty : Nat;
  };

  type CartItem = {
    productId : Nat;
    quantity : Nat;
    priceAtOrder : Nat;
  };

  public type Order = {
    id : Nat;
    buyerId : Principal;
    items : [CartItem];
    totalAmount : Nat;
    status : Text;
    createdAt : Int;
  };

  public type UserProfile = {
    name : Text;
    email : Text;
    address : Text;
  };

  // STATE

  var nextProductId = 1;
  var nextOrderId = 1;

  let products = Map.empty<Nat, Product>();
  let carts = Map.empty<Principal, List.List<CartItem>>();
  let orders = Map.empty<Nat, Order>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  // USER PROFILE MANAGEMENT
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  public query ({ caller }) func getProduct(productId : Nat) : async Product {
    switch (products.get(productId)) {
      case (null) { Runtime.trap("Product not found") };
      case (?product) { product };
    };
  };

  public query ({ caller }) func getActiveProducts() : async [Product] {
    products.values().toArray().filter(func(p) { p.isActive });
  };

  public shared ({ caller }) func getAllProductsAdmin({ caller : Principal }) : async [Product] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Only admins can get all products");
    };
    products.values().toArray();
  };

  // PRODUCTS

  public shared ({ caller }) func createProduct({ caller : Principal }, newProduct : ProductInput) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Only admins can create products");
    };

    let product : Product = {
      id = nextProductId;
      name = newProduct.name;
      description = newProduct.description;
      price = newProduct.price;
      discountPercent = newProduct.discountPercent;
      category = newProduct.category;
      imageId = newProduct.imageId;
      stockQty = newProduct.stockQty;
      isActive = true;
      createdAt = Time.now();
    };

    nextProductId += 1;
    products.add(product.id, product);
    product.id;
  };

  public shared ({ caller }) func updateProduct({ caller : Principal }, productUpdate : ProductUpdateInput) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Only admins can update products");
    };

    let currentProduct = switch (products.get(productUpdate.id)) {
      case (null) { Runtime.trap("Product not found") };
      case (?product) { product };
    };

    let updatedProduct : Product = {
      currentProduct with
      name = productUpdate.name;
      description = productUpdate.description;
      price = productUpdate.price;
      discountPercent = productUpdate.discountPercent;
      category = productUpdate.category;
      imageId = productUpdate.imageId;
      stockQty = productUpdate.stockQty;
    };

    products.add(productUpdate.id, updatedProduct);
  };

  public shared ({ caller }) func toggleProductActive({ caller : Principal }, id : Nat, isActive : Bool) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Only admins can change product status");
    };

    let product = switch (products.get(id)) {
      case (null) { Runtime.trap("Product not found") };
      case (?prod) { prod };
    };

    let updatedProduct : Product = { product with isActive };
    products.add(id, updatedProduct);
  };

  public shared ({ caller }) func updateProductStock({ caller : Principal }, id : Nat, newQty : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Only admins can update product stock");
    };

    let product = switch (products.get(id)) {
      case (null) { Runtime.trap("Product not found") };
      case (?prod) { prod };
    };

    let updatedProduct : Product = { product with stockQty = newQty };
    products.add(id, updatedProduct);
  };

  // CART

  public shared ({ caller }) func addToCart(productId : Nat, quantity : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add to cart");
    };

    if (quantity == 0) { Runtime.trap("Quantity must be greater than 0") };

    let product = switch (products.get(productId)) {
      case (null) { Runtime.trap("Product not found") };
      case (?prod) { prod };
    };

    if (not product.isActive) { Runtime.trap("Product not active") };
    if (quantity > product.stockQty) { Runtime.trap("Quantity exceeds available stock") };

    let cart = switch (carts.get(caller)) {
      case (null) { List.empty<CartItem>() };
      case (?existingCart) { existingCart };
    };

    var updatedQuantity = quantity;
    let newCartItems = List.empty<CartItem>();

    cart.values().forEach(
      func(item) {
        if (item.productId == productId) { updatedQuantity += item.quantity } else {
          newCartItems.add(item);
        };
      }
    );

    if (updatedQuantity > product.stockQty) { Runtime.trap("Total quantity exceeds available stock") };

    newCartItems.add({
      productId;
      quantity = updatedQuantity;
      priceAtOrder = product.price;
    });

    carts.add(caller, newCartItems);
  };

  public shared ({ caller }) func updateCartItem(productId : Nat, newQuantity : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update cart");
    };

    if (newQuantity == 0) { Runtime.trap("Quantity must be greater than 0") };

    let product = switch (products.get(productId)) {
      case (null) { Runtime.trap("Product not found") };
      case (?prod) { prod };
    };

    if (not product.isActive) { Runtime.trap("Product not active") };
    if (newQuantity > product.stockQty) { Runtime.trap("Quantity exceeds available stock") };

    let cart = switch (carts.get(caller)) {
      case (null) { List.empty<CartItem>() };
      case (?existingCart) { existingCart };
    };

    let updatedCart = List.empty<CartItem>();
    cart.values().forEach(
      func(item) {
        if (item.productId == productId) {
          updatedCart.add({
            productId;
            quantity = newQuantity;
            priceAtOrder = product.price;
          });
        } else { updatedCart.add(item) };
      }
    );

    carts.add(caller, updatedCart);
  };

  public shared ({ caller }) func removeCartItem(productId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can remove from cart");
    };

    let cart = switch (carts.get(caller)) {
      case (null) { List.empty<CartItem>() };
      case (?existingCart) { existingCart };
    };

    let updatedCart = List.empty<CartItem>();
    cart.values().forEach(
      func(item) {
        if (item.productId != productId) { updatedCart.add(item) };
      }
    );

    carts.add(caller, updatedCart);
  };

  public shared ({ caller }) func clearCart() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can clear cart");
    };
    carts.add(caller, List.empty<CartItem>());
  };

  public query ({ caller }) func getCart() : async [CartItem] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view cart");
    };
    switch (carts.get(caller)) {
      case (null) { [] };
      case (?cart) { cart.toArray() };
    };
  };

  // ORDERS

  public shared ({ caller }) func placeOrder() : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can place orders");
    };

    let cart = switch (carts.get(caller)) {
      case (null) { List.empty<CartItem>() };
      case (?existingCart) { existingCart };
    };

    if (cart.size() == 0) { Runtime.trap("Cart is empty") };

    // Validate all cart items
    for (item in cart.values()) {
      let product = switch (products.get(item.productId)) {
        case (null) { Runtime.trap("Product not found: " # item.productId.toText()) };
        case (?prod) { prod };
      };

      if (not product.isActive) {
        Runtime.trap("Product not active: " # item.productId.toText());
      };

      if (item.quantity > product.stockQty) {
        Runtime.trap("Insufficient stock for product: " # item.productId.toText());
      };
    };

    var totalAmount = 0;
    let validatedItems = cart.map<CartItem, CartItem>(
      func(item) {
        let product = switch (products.get(item.productId)) {
          case (null) { Runtime.trap("Product not found: " # item.productId.toText()) };
          case (?prod) { prod };
        };

        let discountedPrice = product.price * (100 - product.discountPercent) / 100;
        totalAmount += discountedPrice * item.quantity;

        let validatedItem : CartItem = {
          productId = item.productId;
          quantity = item.quantity;
          priceAtOrder = discountedPrice;
        };
        validatedItem;
      }
    );

    let order : Order = {
      id = nextOrderId;
      buyerId = caller;
      items = validatedItems.toArray();
      totalAmount;
      status = "Pending";
      createdAt = Time.now();
    };

    orders.add(nextOrderId, order);
    nextOrderId += 1;

    // Deduct stock for each item
    for (item in validatedItems.values()) {
      let product = switch (products.get(item.productId)) {
        case (null) { Runtime.trap("Product not found: " # item.productId.toText()) };
        case (?prod) { prod };
      };

      let updatedProduct : Product = { product with stockQty = product.stockQty - item.quantity };
      products.add(item.productId, updatedProduct);
    };

    // Clear cart after successful order
    carts.add(caller, List.empty<CartItem>());

    order.id;
  };

  public shared ({ caller }) func updateOrderStatus({ caller : Principal }, orderId : Nat, newStatus : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Only admins can update order status");
    };
    let order = switch (orders.get(orderId)) {
      case (null) { Runtime.trap("Order not found") };
      case (?ord) { ord };
    };

    let updatedOrder : Order = { order with status = newStatus };
    orders.add(orderId, updatedOrder);
  };

  public query ({ caller }) func getMyOrders() : async [Order] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view their orders");
    };
    orders.values().toArray().filter(func(o) { o.buyerId == caller });
  };

  public shared ({ caller }) func getAllOrders({ caller : Principal }) : async [Order] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Only admins can get all orders");
    };
    orders.values().toArray();
  };

  // ANALYTICS

  public shared ({ caller }) func getInsights({ caller : Principal }) : async {
    totalOrders : Nat;
    pendingOrders : Nat;
    processingOrders : Nat;
    completedOrders : Nat;
    cancelledOrders : Nat;
  } {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Only admins can get insights");
    };

    let allOrders = orders.values().toArray();

    let totalOrders = allOrders.size();
    let pendingOrders = allOrders.filter(func(order) { order.status == "Pending" }).size();
    let processingOrders = allOrders.filter(func(order) { order.status == "Processing" }).size();
    let completedOrders = allOrders.filter(func(order) { order.status == "Completed" }).size();
    let cancelledOrders = allOrders.filter(func(order) { order.status == "Cancelled" }).size();

    {
      totalOrders;
      pendingOrders;
      processingOrders;
      completedOrders;
      cancelledOrders;
    };
  };
};
