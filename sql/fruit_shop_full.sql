-- Fruit Shop Database - Full Schema
-- Features: FE-01 to FE-11

CREATE DATABASE IF NOT EXISTS fruit_shop CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE fruit_shop;

CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    fullname VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(15),
    address TEXT,
    avatar_url VARCHAR(255),
    date_of_birth DATE,
    role ENUM(
        'user',
        'admin',
        'shopowner',
        'shipper'
    ) NOT NULL DEFAULT 'user',
    status VARCHAR(20) DEFAULT 'active',
    email_verified_at TIMESTAMP NULL,
    last_login_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE user_addresses (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    recipient_name VARCHAR(100) NOT NULL,
    phone VARCHAR(15) NOT NULL,
    street_address TEXT NOT NULL,
    ward VARCHAR(50),
    district VARCHAR(50),
    city VARCHAR(50),
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE TABLE password_resets (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    token VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    used_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE TABLE shops (
    id INT PRIMARY KEY AUTO_INCREMENT,
    owner_id INT NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(120) UNIQUE NOT NULL,
    description TEXT,
    logo_url VARCHAR(255),
    banner_url VARCHAR(255),
    phone VARCHAR(15),
    address TEXT,
    city VARCHAR(50),
    district VARCHAR(50),
    status ENUM(
        'pending',
        'active',
        'suspended',
        'rejected'
    ) DEFAULT 'pending',
    rating DECIMAL(2, 1) DEFAULT 0.0,
    total_products INT DEFAULT 0,
    total_orders INT DEFAULT 0,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE TABLE categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    icon_url VARCHAR(255),
    sort_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE products (
    id INT PRIMARY KEY AUTO_INCREMENT,
    shop_id INT NOT NULL,
    category_id INT,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    base_price DECIMAL(15, 2) NOT NULL,
    stock_quantity INT NOT NULL DEFAULT 0,
    image_url VARCHAR(255),
    images JSON,
    origin VARCHAR(100),
    unit VARCHAR(20) DEFAULT 'kg',
    is_available BOOLEAN DEFAULT TRUE,
    is_featured BOOLEAN DEFAULT FALSE,
    avg_rating DECIMAL(2, 1) DEFAULT 0.0,
    total_reviews INT DEFAULT 0,
    total_sold INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (shop_id) REFERENCES shops (id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories (id) ON DELETE SET NULL
);

CREATE TABLE product_variants (
    id INT PRIMARY KEY AUTO_INCREMENT,
    product_id INT NOT NULL,
    name VARCHAR(50) NOT NULL,
    weight DECIMAL(15, 2) NOT NULL,
    unit VARCHAR(20) DEFAULT 'g',
    price DECIMAL(15, 2) NOT NULL,
    stock_quantity INT NOT NULL DEFAULT 0,
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE
);

CREATE TABLE inventory_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    product_id INT NOT NULL,
    variant_id INT NULL,
    change_type ENUM(
        'restock',
        'sale',
        'adjustment',
        'return'
    ) NOT NULL,
    quantity_change INT NOT NULL,
    quantity_after INT NOT NULL,
    note TEXT,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE,
    FOREIGN KEY (variant_id) REFERENCES product_variants (id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES users (id) ON DELETE SET NULL
);

CREATE TABLE carts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    product_id INT NOT NULL,
    variant_id INT NULL,
    quantity INT NOT NULL DEFAULT 1,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE,
    FOREIGN KEY (variant_id) REFERENCES product_variants (id) ON DELETE SET NULL
);

CREATE TABLE vouchers (
    id INT PRIMARY KEY AUTO_INCREMENT,
    code VARCHAR(50) UNIQUE NOT NULL,
    shop_id INT NULL,
    description TEXT,
    type ENUM('percentage', 'fixed') NOT NULL,
    value DECIMAL(15, 2) NOT NULL,
    min_order_amount DECIMAL(15, 2) DEFAULT 0,
    max_discount DECIMAL(15, 2) NULL,
    usage_limit INT DEFAULT 0,
    used_count INT DEFAULT 0,
    starts_at TIMESTAMP NULL,
    expires_at TIMESTAMP NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (shop_id) REFERENCES shops (id) ON DELETE CASCADE
);

CREATE TABLE orders (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    shop_id INT NULL,
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    total_amount DECIMAL(15, 2) NOT NULL,
    discount_amount DECIMAL(15, 2) DEFAULT 0,
    shipping_fee DECIMAL(15, 2) DEFAULT 0,
    final_amount DECIMAL(15, 2) NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    payment_status ENUM(
        'pending',
        'paid',
        'failed',
        'refunded'
    ) DEFAULT 'pending',
    shipping_address TEXT NOT NULL,
    phone VARCHAR(15) NOT NULL,
    recipient_name VARCHAR(100),
    status ENUM(
        'pending',
        'confirmed',
        'shipping',
        'delivered',
        'cancelled',
        'returned'
    ) DEFAULT 'pending',
    note TEXT,
    confirmed_at TIMESTAMP NULL,
    shipped_at TIMESTAMP NULL,
    delivered_at TIMESTAMP NULL,
    cancelled_at TIMESTAMP NULL,
    cancel_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id),
    FOREIGN KEY (shop_id) REFERENCES shops (id) ON DELETE SET NULL
);

CREATE TABLE order_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    variant_id INT NULL,
    product_name VARCHAR(100) NOT NULL,
    variant_name VARCHAR(50),
    quantity INT NOT NULL,
    unit_price DECIMAL(15, 2) NOT NULL,
    subtotal DECIMAL(15, 2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders (id),
    FOREIGN KEY (product_id) REFERENCES products (id),
    FOREIGN KEY (variant_id) REFERENCES product_variants (id) ON DELETE SET NULL
);

CREATE TABLE order_status_history (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT NOT NULL,
    from_status VARCHAR(30),
    to_status VARCHAR(30) NOT NULL,
    changed_by INT,
    note TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders (id) ON DELETE CASCADE,
    FOREIGN KEY (changed_by) REFERENCES users (id) ON DELETE SET NULL
);

CREATE TABLE voucher_usages (
    id INT PRIMARY KEY AUTO_INCREMENT,
    voucher_id INT NOT NULL,
    user_id INT NOT NULL,
    order_id INT NULL,
    discount_amount DECIMAL(15, 2) NOT NULL,
    used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (voucher_id) REFERENCES vouchers (id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    FOREIGN KEY (order_id) REFERENCES orders (id) ON DELETE SET NULL
);

CREATE TABLE transactions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT NOT NULL,
    transaction_code VARCHAR(100) UNIQUE NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'VND',
    status ENUM(
        'pending',
        'success',
        'failed',
        'refunded'
    ) DEFAULT 'pending',
    gateway_response JSON,
    paid_at TIMESTAMP NULL,
    refunded_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders (id)
);

CREATE TABLE reviews (
    id INT PRIMARY KEY AUTO_INCREMENT,
    product_id INT NOT NULL,
    user_id INT NOT NULL,
    order_id INT NOT NULL,
    variant_id INT NULL,
    rating TINYINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    title VARCHAR(200),
    comment TEXT,
    images JSON,
    is_verified_purchase BOOLEAN DEFAULT TRUE,
    is_approved BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    FOREIGN KEY (order_id) REFERENCES orders (id) ON DELETE CASCADE,
    FOREIGN KEY (variant_id) REFERENCES product_variants (id) ON DELETE SET NULL,
    UNIQUE KEY unique_review (user_id, order_id, product_id)
);

CREATE TABLE deliveries (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT NOT NULL UNIQUE,
    shipper_id INT NOT NULL,
    pickup_address TEXT NOT NULL,
    delivery_address TEXT NOT NULL,
    recipient_name VARCHAR(100),
    recipient_phone VARCHAR(15),
    shipping_status ENUM(
        'assigned',
        'picked_up',
        'in_transit',
        'delivered',
        'failed'
    ) DEFAULT 'assigned',
    shipping_fee DECIMAL(15, 2) DEFAULT 0,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    picked_up_at TIMESTAMP NULL,
    delivered_at TIMESTAMP NULL,
    proof_of_delivery_url VARCHAR(255),
    note TEXT,
    FOREIGN KEY (order_id) REFERENCES orders (id),
    FOREIGN KEY (shipper_id) REFERENCES users (id)
);

CREATE TABLE delivery_tracking (
    id INT PRIMARY KEY AUTO_INCREMENT,
    delivery_id INT NOT NULL,
    status_description VARCHAR(255) NOT NULL,
    current_location VARCHAR(255),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (delivery_id) REFERENCES deliveries (id) ON DELETE CASCADE
);

CREATE TABLE daily_reports (
    id INT PRIMARY KEY AUTO_INCREMENT,
    shop_id INT NULL,
    report_date DATE NOT NULL,
    total_orders INT DEFAULT 0,
    total_revenue DECIMAL(15, 2) DEFAULT 0,
    total_products_sold INT DEFAULT 0,
    total_shipping_fee DECIMAL(15, 2) DEFAULT 0,
    total_discount DECIMAL(15, 2) DEFAULT 0,
    new_users INT DEFAULT 0,
    new_products INT DEFAULT 0,
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (shop_id) REFERENCES shops (id) ON DELETE CASCADE,
    UNIQUE KEY unique_report (shop_id, report_date)
);

CREATE TABLE activity_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50),
    entity_id INT,
    description TEXT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    metadata JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL
);

CREATE INDEX idx_users_email ON users (email);

CREATE INDEX idx_users_role ON users (role);

CREATE INDEX idx_users_status ON users (status);

CREATE INDEX idx_shops_owner ON shops (owner_id);

CREATE INDEX idx_shops_status ON shops (status);

CREATE INDEX idx_products_shop ON products (shop_id);

CREATE INDEX idx_products_category ON products (category_id);

CREATE INDEX idx_products_price ON products (base_price);

CREATE INDEX idx_products_rating ON products (avg_rating);

CREATE INDEX idx_products_available ON products (is_available);

CREATE INDEX idx_variants_product ON product_variants (product_id);

CREATE INDEX idx_orders_user ON orders (user_id);

CREATE INDEX idx_orders_shop ON orders (shop_id);

CREATE INDEX idx_orders_status ON orders (status);

CREATE INDEX idx_orders_date ON orders (order_date);

CREATE INDEX idx_order_items_order ON order_items (order_id);

CREATE INDEX idx_order_items_product ON order_items (product_id);

CREATE INDEX idx_deliveries_shipper ON deliveries (shipper_id);

CREATE INDEX idx_deliveries_status ON deliveries (shipping_status);

CREATE INDEX idx_reviews_product ON reviews (product_id);

CREATE INDEX idx_reviews_user ON reviews (user_id);

CREATE INDEX idx_reviews_rating ON reviews (rating);

CREATE INDEX idx_reports_date ON daily_reports (report_date);

CREATE INDEX idx_transactions_order ON transactions (order_id);

CREATE INDEX idx_transactions_code ON transactions (transaction_code);

CREATE INDEX idx_vouchers_code ON vouchers (code);

CREATE INDEX idx_vouchers_shop ON vouchers (shop_id);

CREATE INDEX idx_activity_user ON activity_logs (user_id);

CREATE INDEX idx_activity_action ON activity_logs (action);

CREATE INDEX idx_activity_created ON activity_logs (created_at);

-- Seed Data (password: 123456)

INSERT INTO
    users (
        fullname,
        email,
        password,
        phone,
        role,
        status
    )
VALUES (
        'Admin Nguyen',
        'admin@fruitshop.com',
        '$2b$10$CUwk8EBEz1J4u9yhJU2uRO6q73tSg1n7h5u9XL7grQbxaIhe1bc2.',
        '0901234567',
        'admin',
        'active'
    ),
    (
        'Tran Van A',
        'shop1@fruitshop.com',
        '$2b$10$CUwk8EBEz1J4u9yhJU2uRO6q73tSg1n7h5u9XL7grQbxaIhe1bc2.',
        '0901234568',
        'shopowner',
        'active'
    ),
    (
        'Le Thi B',
        'shop2@fruitshop.com',
        '$2b$10$CUwk8EBEz1J4u9yhJU2uRO6q73tSg1n7h5u9XL7grQbxaIhe1bc2.',
        '0901234569',
        'shopowner',
        'active'
    ),
    (
        'Pham Van C',
        'shipper1@fruitshop.com',
        '$2b$10$CUwk8EBEz1J4u9yhJU2uRO6q73tSg1n7h5u9XL7grQbxaIhe1bc2.',
        '0901234570',
        'shipper',
        'active'
    ),
    (
        'Hoang Van D',
        'shipper2@fruitshop.com',
        '$2b$10$CUwk8EBEz1J4u9yhJU2uRO6q73tSg1n7h5u9XL7grQbxaIhe1bc2.',
        '0901234571',
        'shipper',
        'active'
    ),
    (
        'Nguyen Van E',
        'user1@email.com',
        '$2b$10$CUwk8EBEz1J4u9yhJU2uRO6q73tSg1n7h5u9XL7grQbxaIhe1bc2.',
        '0912345678',
        'user',
        'active'
    ),
    (
        'Pham Thi F',
        'user2@email.com',
        '$2b$10$CUwk8EBEz1J4u9yhJU2uRO6q73tSg1n7h5u9XL7grQbxaIhe1bc2.',
        '0912345679',
        'user',
        'active'
    ),
    (
        'Tran Van G',
        'user3@email.com',
        '$2b$10$CUwk8EBEz1J4u9yhJU2uRO6q73tSg1n7h5u9XL7grQbxaIhe1bc2.',
        '0912345680',
        'user',
        'inactive'
    ),
    (
        'Le Thi H',
        'user4@email.com',
        '$2b$10$CUwk8EBEz1J4u9yhJU2uRO6q73tSg1n7h5u9XL7grQbxaIhe1bc2.',
        '0912345681',
        'user',
        'active'
    ),
    (
        'Vo Van I',
        'user5@email.com',
        '$2b$10$CUwk8EBEz1J4u9yhJU2uRO6q73tSg1n7h5u9XL7grQbxaIhe1bc2.',
        '0912345682',
        'user',
        'active'
    );

INSERT INTO
    user_addresses (
        user_id,
        recipient_name,
        phone,
        street_address,
        ward,
        district,
        city,
        is_default
    )
VALUES (
        6,
        'Nguyen Van E',
        '0912345678',
        '123 Nguyen Hue',
        'Ben Nghe',
        'District 1',
        'Ho Chi Minh City',
        TRUE
    ),
    (
        6,
        'Nguyen Van E',
        '0912345678',
        '456 Le Loi',
        'Hoa Thuan',
        'Hai Chau',
        'Da Nang',
        FALSE
    ),
    (
        7,
        'Pham Thi F',
        '0912345679',
        '789 Tran Hung Dao',
        'Pham Ngu Lao',
        'District 1',
        'Ho Chi Minh City',
        TRUE
    ),
    (
        9,
        'Le Thi H',
        '0912345681',
        '321 Ly Thuong Kiet',
        'Tan Dinh',
        'District 1',
        'Ho Chi Minh City',
        TRUE
    ),
    (
        10,
        'Vo Van I',
        '0912345682',
        '654 Nguyen Trai',
        'Ben Thanh',
        'District 1',
        'Ho Chi Minh City',
        TRUE
    );

INSERT INTO
    shops (
        owner_id,
        name,
        slug,
        description,
        phone,
        address,
        city,
        district,
        status,
        rating
    )
VALUES (
        2,
        'Trai Cay Sach - Organic Farm',
        'organic-farm',
        'Chuyen cung cap trai cay sach huu co tu Dalat',
        '0901234568',
        '12 Hoang Hoa Tham',
        'Da Lat',
        'Da Lat',
        'active',
        4.5
    ),
    (
        3,
        'Vua Hoa Qua - Fruit King',
        'fruit-king',
        'Trai cay nhap khau cao cap gia tot',
        '0901234569',
        '45 Nguyen Dinh Chieu',
        'District 1',
        'Ho Chi Minh City',
        'active',
        4.2
    );

INSERT INTO
    categories (
        name,
        description,
        sort_order,
        is_active
    )
VALUES (
        'Trai Cay Nhiet Doi',
        'Xoai mit sau rieng chom chom',
        1,
        TRUE
    ),
    (
        'Trai Cay O On Doi',
        'Tao le nho dao',
        2,
        TRUE
    ),
    (
        'Trai Cay Nhap Khau',
        'Cherry My kiwi New Zealand blueberry',
        3,
        TRUE
    ),
    (
        'Trai Cay Huu Co',
        'Rau qua sach huu co',
        4,
        TRUE
    ),
    (
        'Trai Cay Say Kho',
        'Mit say xoai say chuoi say',
        5,
        TRUE
    );

INSERT INTO
    products (
        shop_id,
        category_id,
        name,
        description,
        base_price,
        stock_quantity,
        image_url,
        origin,
        unit,
        is_available,
        is_featured,
        avg_rating
    )
VALUES (
        1,
        1,
        'Xoai Cat Chu',
        'Xoai cat chu Dalat thom ngon it xo',
        45000,
        200,
        '/images/products/xoai-cat-chu.jpg',
        'Da Lat',
        'kg',
        TRUE,
        TRUE,
        4.5
    ),
    (
        1,
        1,
        'Sau Rieng Ri6',
        'Sau rieng Ri6 vung Long com vang hat lep',
        120000,
        100,
        '/images/products/sau-rieng.jpg',
        'Vung Long',
        'kg',
        TRUE,
        TRUE,
        4.8
    ),
    (
        1,
        4,
        'Mit Ruot Do',
        'Mit ruot do Dak Lak ngot dam gion',
        35000,
        150,
        '/images/products/mit-ruot-do.jpg',
        'Dak Lak',
        'kg',
        TRUE,
        FALSE,
        4.3
    ),
    (
        1,
        2,
        'Dau Tay Dalat',
        'Dau tay Dalat tuoi ngon dong goi 500g',
        55000,
        80,
        '/images/products/dau-tay.jpg',
        'Da Lat',
        '500g',
        TRUE,
        TRUE,
        4.6
    ),
    (
        2,
        3,
        'Cherry My Nhap Khau',
        'Cherry My nhap khau size 9.5',
        350000,
        50,
        '/images/products/cherry-my.jpg',
        'My',
        '500g',
        TRUE,
        TRUE,
        4.9
    ),
    (
        2,
        3,
        'Kiwi New Zealand',
        'Kiwi xanh New Zealand giau vitamin C',
        120000,
        100,
        '/images/products/kiwi.jpg',
        'New Zealand',
        'kg',
        TRUE,
        FALSE,
        4.4
    ),
    (
        2,
        1,
        'Chom Chom Java',
        'Chom chom Java Thong vien ngot',
        25000,
        200,
        '/images/products/chom-chom.jpg',
        'Ben Tre',
        'kg',
        TRUE,
        TRUE,
        4.0
    ),
    (
        2,
        3,
        'Blueberry Nhap Khau',
        'Blueberry tuoi Peru hop 125g',
        85000,
        60,
        '/images/products/blueberry.jpg',
        'Peru',
        '125g',
        TRUE,
        FALSE,
        4.7
    ),
    (
        1,
        4,
        'Buoi Da Xanh',
        'Buoi da xanh Ben Tre khong hat ngot thanh',
        40000,
        120,
        '/images/products/buoi-da-xanh.jpg',
        'Ben Tre',
        'qua',
        TRUE,
        FALSE,
        4.2
    ),
    (
        2,
        5,
        'Xoai Say Deo',
        'Xoai say deo khong duong dong goi 200g',
        25000,
        300,
        '/images/products/xoai-say-deo.jpg',
        'Da Lat',
        '200g',
        TRUE,
        FALSE,
        4.1
    );

INSERT INTO
    product_variants (
        product_id,
        name,
        weight,
        unit,
        price,
        stock_quantity
    )
VALUES (
        1,
        '500g',
        500,
        'g',
        25000,
        100
    ),
    (
        1,
        '1kg',
        1000,
        'g',
        45000,
        200
    ),
    (
        1,
        '2kg',
        2000,
        'g',
        80000,
        50
    ),
    (
        2,
        '1 trai 1kg',
        1000,
        'g',
        120000,
        50
    ),
    (
        2,
        '1 trai 2kg',
        2000,
        'g',
        220000,
        30
    ),
    (
        2,
        '1 trai 3kg',
        3000,
        'g',
        320000,
        20
    ),
    (
        5,
        '500g',
        500,
        'g',
        350000,
        30
    ),
    (
        5,
        '1kg',
        1000,
        'g',
        650000,
        20
    ),
    (
        7,
        '1kg',
        1000,
        'g',
        25000,
        150
    ),
    (
        7,
        '2kg',
        2000,
        'g',
        45000,
        50
    );

INSERT INTO
    carts (
        user_id,
        product_id,
        variant_id,
        quantity
    )
VALUES (6, 1, 2, 2),
    (6, 5, 4, 1),
    (7, 3, NULL, 1),
    (10, 8, NULL, 3);

INSERT INTO vouchers (code,shop_id,description,type,value,min_order_amount,max_discount,usage_limit,starts_at,expires_at) VALUES('WELCOME10',NULL,'Giam 10% don dau tien','percentage',10,100000,50000,100,'2026-01-01','2027-01-01'),('FREESHIP',NULL,'Free ship tu 200k','fixed',30000,200000,30000,200,'2026-01-01','2027-01-01'),('ORG50',1,'Giam 50k hang huu co','fixed',50000,300000,50000,50,'2026-06-01','2026-09-01'),('KING20',2,'Giam 20% Fruit King','percentage',20,200000,100000,30,'2026-06-01','2026-08-01'),('SUMMER15',NULL,'Giam 15% mua he','percentage',15,0,80000,500,'2026-06-01','2026-08-31');

INSERT INTO
    orders (
        user_id,
        shop_id,
        total_amount,
        discount_amount,
        shipping_fee,
        final_amount,
        payment_method,
        payment_status,
        shipping_address,
        phone,
        recipient_name,
        status,
        confirmed_at,
        shipped_at,
        delivered_at
    )
VALUES (
        6,
        1,
        170000,
        17000,
        15000,
        168000,
        'COD',
        'paid',
        '123 Nguyen Hue District 1 HCMC',
        '0912345678',
        'Nguyen Van E',
        'delivered',
        '2026-06-20 10:00:00',
        '2026-06-20 14:00:00',
        '2026-06-21 09:00:00'
    ),
    (
        7,
        2,
        435000,
        0,
        30000,
        465000,
        'VNPay',
        'paid',
        '789 Tran Hung Dao District 1 HCMC',
        '0912345679',
        'Pham Thi F',
        'delivered',
        '2026-06-22 09:00:00',
        '2026-06-22 15:00:00',
        '2026-06-23 10:00:00'
    ),
    (
        9,
        1,
        105000,
        0,
        15000,
        120000,
        'COD',
        'paid',
        '321 Ly Thuong Kiet District 1 HCMC',
        '0912345681',
        'Le Thi H',
        'shipping',
        '2026-06-28 11:00:00',
        '2026-06-28 16:00:00',
        NULL
    ),
    (
        10,
        2,
        250000,
        50000,
        30000,
        230000,
        'VNPay',
        'paid',
        '654 Nguyen Trai District 1 HCMC',
        '0912345682',
        'Vo Van I',
        'confirmed',
        '2026-06-29 08:00:00',
        NULL,
        NULL
    ),
    (
        6,
        1,
        85000,
        8500,
        15000,
        91500,
        'COD',
        'pending',
        '123 Nguyen Hue District 1 HCMC',
        '0912345678',
        'Nguyen Van E',
        'pending',
        NULL,
        NULL,
        NULL
    );

INSERT INTO
    order_items (
        order_id,
        product_id,
        variant_id,
        product_name,
        variant_name,
        quantity,
        unit_price,
        subtotal
    )
VALUES (
        1,
        1,
        2,
        'Xoai Cat Chu',
        '1kg',
        2,
        45000,
        90000
    ),
    (
        1,
        9,
        NULL,
        'Buoi Da Xanh',
        NULL,
        2,
        40000,
        80000
    ),
    (
        2,
        5,
        4,
        'Cherry My',
        '500g',
        1,
        350000,
        350000
    ),
    (
        2,
        6,
        NULL,
        'Kiwi New Zealand',
        NULL,
        1,
        85000,
        85000
    ),
    (
        3,
        4,
        NULL,
        'Dau Tay Dalat',
        NULL,
        1,
        55000,
        55000
    ),
    (
        3,
        3,
        NULL,
        'Mit Ruot Do',
        NULL,
        1,
        35000,
        35000
    ),
    (
        4,
        5,
        5,
        'Cherry My',
        '1kg',
        1,
        650000,
        650000
    ),
    (
        4,
        8,
        NULL,
        'Blueberry',
        NULL,
        3,
        85000,
        255000
    ),
    (
        5,
        10,
        NULL,
        'Xoai Say Deo',
        NULL,
        3,
        25000,
        75000
    );

INSERT INTO
    order_status_history (
        order_id,
        from_status,
        to_status,
        changed_by,
        note
    )
VALUES (
        1,
        NULL,
        'pending',
        6,
        'Dat hang'
    ),
    (
        1,
        'pending',
        'confirmed',
        2,
        'Xac nhan'
    ),
    (
        1,
        'confirmed',
        'shipping',
        4,
        'Da lay hang'
    ),
    (
        1,
        'shipping',
        'delivered',
        4,
        'Giao xong'
    ),
    (
        2,
        NULL,
        'pending',
        7,
        'Dat hang'
    ),
    (
        2,
        'pending',
        'confirmed',
        3,
        'Xac nhan'
    ),
    (
        2,
        'confirmed',
        'shipping',
        5,
        'Da lay hang'
    ),
    (
        2,
        'shipping',
        'delivered',
        5,
        'Giao xong'
    ),
    (
        3,
        NULL,
        'pending',
        9,
        'Dat hang'
    ),
    (
        3,
        'pending',
        'confirmed',
        2,
        'Xac nhan'
    ),
    (
        3,
        'confirmed',
        'shipping',
        4,
        'Dang giao'
    ),
    (
        4,
        NULL,
        'pending',
        10,
        'Dat hang'
    ),
    (
        4,
        'pending',
        'confirmed',
        3,
        'Xac nhan'
    ),
    (
        5,
        NULL,
        'pending',
        6,
        'Dat hang'
    );

INSERT INTO
    voucher_usages (
        voucher_id,
        user_id,
        order_id,
        discount_amount
    )
VALUES (1, 6, 1, 17000),
    (3, 10, 4, 50000),
    (4, 10, 4, 50000);

INSERT INTO
    transactions (
        order_id,
        transaction_code,
        payment_method,
        amount,
        currency,
        status,
        paid_at
    )
VALUES (
        1,
        'TXN2026062001',
        'COD',
        168000,
        'VND',
        'success',
        '2026-06-21 09:00:00'
    ),
    (
        2,
        'TXN2026062201',
        'VNPay',
        465000,
        'VND',
        'success',
        '2026-06-22 09:05:00'
    ),
    (
        3,
        'TXN2026062801',
        'COD',
        120000,
        'VND',
        'success',
        '2026-06-28 16:00:00'
    ),
    (
        4,
        'TXN2026062901',
        'VNPay',
        230000,
        'VND',
        'success',
        '2026-06-29 08:02:00'
    );

INSERT INTO
    reviews (
        product_id,
        user_id,
        order_id,
        rating,
        title,
        comment,
        is_verified_purchase
    )
VALUES (
        1,
        6,
        1,
        5,
        'Xoai ngon',
        'Xoai chin vua ngot dam',
        TRUE
    ),
    (
        9,
        6,
        1,
        4,
        'Buoi ngon',
        'Khong hat nhung trai hoi nho',
        TRUE
    ),
    (
        5,
        7,
        2,
        5,
        'Cherry ngon',
        'Gion ngot dang tien',
        TRUE
    ),
    (
        6,
        7,
        2,
        4,
        'Kiwi OK',
        'Hoi xanh thuong vai ngay',
        TRUE
    ),
    (
        4,
        9,
        3,
        5,
        'Dau tay',
        'Thom ngon chuan',
        TRUE
    );

INSERT INTO
    deliveries (
        order_id,
        shipper_id,
        pickup_address,
        delivery_address,
        recipient_name,
        recipient_phone,
        shipping_status,
        assigned_at,
        picked_up_at,
        delivered_at
    )
VALUES (
        1,
        4,
        '12 Hoang Hoa Tham Da Lat',
        '123 Nguyen Hue District 1 HCMC',
        'Nguyen Van E',
        '0912345678',
        'delivered',
        '2026-06-20 10:30:00',
        '2026-06-20 14:00:00',
        '2026-06-21 09:00:00'
    ),
    (
        2,
        5,
        '45 Nguyen Dinh Chieu District 1 HCMC',
        '789 Tran Hung Dao District 1 HCMC',
        'Pham Thi F',
        '0912345679',
        'delivered',
        '2026-06-22 09:30:00',
        '2026-06-22 15:00:00',
        '2026-06-23 10:00:00'
    ),
    (
        3,
        4,
        '12 Hoang Hoa Tham Da Lat',
        '321 Ly Thuong Kiet District 1 HCMC',
        'Le Thi H',
        '0912345681',
        'in_transit',
        '2026-06-28 11:30:00',
        '2026-06-28 16:00:00',
        NULL
    );

INSERT INTO
    delivery_tracking (
        delivery_id,
        status_description,
        current_location
    )
VALUES (
        1,
        'Da tiep nhan',
        '12 Hoang Hoa Tham Da Lat'
    ),
    (
        1,
        'Da lay hang',
        '12 Hoang Hoa Tham Da Lat'
    ),
    (
        1,
        'Dang van chuyen',
        'QL1 Binh Thuan'
    ),
    (1, 'Den HCM', 'District 1'),
    (
        1,
        'Giao xong',
        '123 Nguyen Hue'
    ),
    (
        2,
        'Da tiep nhan',
        '45 Nguyen Dinh Chieu'
    ),
    (
        2,
        'Da lay hang',
        '45 Nguyen Dinh Chieu'
    ),
    (2, 'Dang giao', 'District 1'),
    (
        2,
        'Giao xong',
        '789 Tran Hung Dao'
    ),
    (
        3,
        'Da tiep nhan',
        '12 Hoang Hoa Tham Da Lat'
    ),
    (
        3,
        'Da lay hang',
        '12 Hoang Hoa Tham Da Lat'
    ),
    (
        3,
        'Dang van chuyen',
        'QL20 Lam Dong'
    );

INSERT INTO
    daily_reports (
        shop_id,
        report_date,
        total_orders,
        total_revenue,
        total_products_sold,
        total_shipping_fee,
        total_discount
    )
VALUES (
        1,
        '2026-06-21',
        1,
        170000,
        4,
        15000,
        17000
    ),
    (
        2,
        '2026-06-23',
        1,
        435000,
        2,
        30000,
        0
    ),
    (
        1,
        '2026-06-28',
        1,
        105000,
        2,
        15000,
        0
    ),
    (
        2,
        '2026-06-29',
        1,
        250000,
        4,
        30000,
        50000
    ),
    (
        NULL,
        '2026-06-21',
        1,
        170000,
        4,
        15000,
        17000
    ),
    (
        NULL,
        '2026-06-23',
        2,
        435000,
        2,
        30000,
        0
    ),
    (
        NULL,
        '2026-06-28',
        3,
        105000,
        2,
        15000,
        0
    ),
    (
        NULL,
        '2026-06-29',
        4,
        250000,
        4,
        30000,
        50000
    );

INSERT INTO
    activity_logs (
        user_id,
        action,
        entity_type,
        entity_id,
        description
    )
VALUES (
        1,
        'login',
        'user',
        1,
        'Admin login'
    ),
    (
        6,
        'register',
        'user',
        6,
        'User dang ky'
    ),
    (
        6,
        'create_order',
        'order',
        1,
        'Order #1'
    ),
    (
        7,
        'create_order',
        'order',
        2,
        'Order #2'
    ),
    (
        2,
        'update_order',
        'order',
        1,
        'Xac nhan #1'
    ),
    (
        4,
        'update_delivery',
        'delivery',
        1,
        'Bat dau giao #1'
    ),
    (
        1,
        'manage_category',
        'category',
        1,
        'Them danh muc'
    );

INSERT INTO
    password_resets (
        user_id,
        token,
        expires_at,
        used_at
    )
VALUES (
        8,
        'reset_token_demo_abc',
        '2026-07-02 12:00:00',
        '2026-07-01 12:05:00'
    );