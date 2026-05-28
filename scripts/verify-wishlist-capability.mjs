import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const requiredFiles = [
  "src/context/WishlistContext.tsx",
  "src/components/WishlistButton.tsx",
  "src/app/wishlist/page.tsx",
  "src/app/api/wishlist/route.ts",
];

for (const file of requiredFiles) {
  if (!existsSync(join(root, file))) {
    throw new Error(`Missing wishlist file: ${file}`);
  }
}

const userModel = readFileSync(join(root, "src/models/User.ts"), "utf8");
if (!userModel.includes("wishlist") || !userModel.includes("Schema.Types.ObjectId")) {
  throw new Error("User model must persist wishlist product references");
}

const providers = readFileSync(join(root, "src/components/Providers.tsx"), "utf8");
if (!providers.includes("WishlistProvider")) {
  throw new Error("WishlistProvider must wrap the app providers");
}

const navbar = readFileSync(join(root, "src/components/Navbar.tsx"), "utf8");
if (!navbar.includes('href="/wishlist"') || !navbar.includes("wishlistCount")) {
  throw new Error("Navbar must expose wishlist link and count");
}

const productCard = readFileSync(join(root, "src/components/ProductCard.tsx"), "utf8");
if (!productCard.includes("WishlistButton")) {
  throw new Error("Product cards must render wishlist controls");
}

const wishlistButton = readFileSync(join(root, "src/components/WishlistButton.tsx"), "utf8");
if (!wishlistButton.includes("aria-label") || !wishlistButton.includes("aria-pressed")) {
  throw new Error("Wishlist controls must expose accessible button state");
}

const detailActions = readFileSync(join(root, "src/components/ProductDetailActions.tsx"), "utf8");
if (!detailActions.includes("WishlistButton")) {
  throw new Error("Product detail actions must render wishlist control");
}

const wishlistPage = readFileSync(join(root, "src/app/wishlist/page.tsx"), "utf8");
if (!wishlistPage.includes("useWishlist") || !wishlistPage.includes("Remove")) {
  throw new Error("Wishlist page must list and remove saved products");
}

console.log("Wishlist capability static verification passed");
