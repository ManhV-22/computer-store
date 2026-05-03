-- SQL script to create wishlist tables
-- Run this in your database (computer_store)

-- Bảng wishlist
CREATE TABLE IF NOT EXISTS `wishlist` (
  `id` int NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `user_id` int NOT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  UNIQUE KEY `user_id` (`user_id`)
);

-- Bảng wishlist_item
CREATE TABLE IF NOT EXISTS `wishlist_item` (
  `id` int NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `wishlist_id` int NOT NULL,
  `product_id` int NOT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`wishlist_id`) REFERENCES `wishlist`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE,
  UNIQUE KEY `wishlist_product` (`wishlist_id`, `product_id`)
);

-- Tạo index để tối ưu tìm kiếm
CREATE INDEX IF NOT EXISTS `idx_wishlist_user_id` ON `wishlist`(`user_id`);
CREATE INDEX IF NOT EXISTS `idx_wishlist_item_wishlist_id` ON `wishlist_item`(`wishlist_id`);
CREATE INDEX IF NOT EXISTS `idx_wishlist_item_product_id` ON `wishlist_item`(`product_id`);
